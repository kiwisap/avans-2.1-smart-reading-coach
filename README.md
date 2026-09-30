# Smart Reading Coach

De frontend van **Smart Reading Coach** (project "Vrij lezen op maat", Avans ICT SE2.1). Leerlingen bladeren door de catalogus, vullen hun leesprofiel in, krijgen leesadvies en houden een leeslijst bij. Docenten volgen de leerlingen die aan hen gekoppeld zijn. De app praat met de API in de map `smart-reading-coach-api`.

Inhoud: [Techniek](#techniek) · [Lokaal draaien](#lokaal-draaien) · [Scripts](#scripts) · [Pagina's](#paginas-en-toegang) · [Mappenstructuur](#mappenstructuur) · [Architectuur](#architectuur) · [Vormgeving](#vormgeving) · [Toegankelijkheid](#toegankelijkheid-en-responsive) · [Coding style](#coding-style) · [Een wijziging doen](#een-kleine-wijziging-doen) · [Requirements](#requirements)

## Techniek

| Onderdeel  | Keuze                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------- |
| Framework  | React 19 met TypeScript (strict)                                                            |
| Bouwtool   | Vite 8                                                                                      |
| Routing    | React Router 7                                                                              |
| Vormgeving | Bootstrap 5.3 via Sass, Bootstrap Icons, lettertypes Fraunces en DM Sans (lokaal ingebouwd) |
| Kwaliteit  | ESLint 9 met `jsx-a11y` en `react-hooks`, Prettier, EditorConfig                            |

## Lokaal draaien

Je hebt Node.js 20 of hoger nodig en een draaiende backend (zie de README in `smart-reading-coach-api`).

```bash
# 1. Afhankelijkheden installeren
npm install

# 2. Instellingen kopieren
cp .env.example .env          # Windows: copy .env.example .env

# 3. De ontwikkelserver starten
npm run dev
```

De app draait dan op `http://localhost:5173`. Log in met een van de demo accounts van de backend:

| Rol      | Email                 | Wachtwoord     |
| -------- | --------------------- | -------------- |
| Leerling | `student@example.com` | `Password123!` |
| Docent   | `teacher@example.com` | `Password123!` |

### Instellingen (`.env`)

| Variabele      | Betekenis                               | Standaard                   |
| -------------- | --------------------------------------- | --------------------------- |
| `VITE_API_URL` | Basisadres van de API, inclusief `/api` | `http://localhost:3000/api` |

Vite leest deze waarde bij het starten en bouwen. Pas je hem aan, herstart dan `npm run dev`.

## Scripts

| Script                                   | Doel                                             |
| ---------------------------------------- | ------------------------------------------------ |
| `npm run dev`                            | Ontwikkelserver met direct herladen              |
| `npm run build`                          | Typecheck en productiebuild naar de map `dist`   |
| `npm run preview`                        | De productiebuild lokaal bekijken                |
| `npm run typecheck`                      | Types controleren                                |
| `npm run lint`, `npm run lint:fix`       | ESLint draaien, eventueel met automatische fixes |
| `npm run format`, `npm run format:check` | Prettier toepassen of controleren                |
| `npm run check`                          | Typecheck, lint en formatcontrole in één keer    |

## Pagina's en toegang

| Pad                    | Pagina                                    | Wie      |
| ---------------------- | ----------------------------------------- | -------- |
| `/login`, `/register`  | Inloggen en registreren                   | iedereen |
| `/`                    | Catalogus (startpagina)                   | ingelogd |
| `/advice`              | Leesadvies                                | leerling |
| `/reading-list`        | Leeslijst                                 | leerling |
| `/profile`             | Leesprofiel                               | leerling |
| `/teachers`            | Mijn docenten (koppelen)                  | leerling |
| `/students`            | Leerlingen van de docent                  | docent   |
| `/students/:studentId` | Leesprofiel en leeslijst van één leerling | docent   |

`ProtectedRoute` bewaakt de paden. Wie niet is ingelogd gaat naar `/login` en komt na het inloggen terug op de pagina waar hij heen wilde, inclusief filters. Wie de verkeerde rol heeft, gaat naar de startpagina met een duidelijke melding. De echte afscherming zit in de backend, dit is de gebruikersvriendelijke laag erbovenop.

## Mappenstructuur

```
src/
    main.tsx             ingang: router, AuthProvider en stijlen
    App.tsx              alle routes en hun rolbeveiliging
    pages/               één bestand per pagina
    components/          herbruikbare onderdelen (knoppen, formuliervelden, kaarten, layout)
    hooks/               eigen hooks: useReadingList, useCatalogQuery
    auth/                AuthContext (sessie en token) en ProtectedRoute
    api/                 client.ts: één functie om de API aan te roepen
    profile/             logica van het profielformulier: validatie en concept bewaren
    constants/           labels en pictogrammen per soort tekst
    types/               typen van de API antwoorden
    styles/              main.scss: kleuren, lettertypes en eigen stijlen
```

## Architectuur

**Pagina's en componenten.** Een pagina haalt data op en zet het scherm in elkaar. Herbruikbare onderdelen staan in `components/` en bevatten geen eigen dataverkeer. Zo bestaat elke knop, elk formulierveld en elke boekkaart maar één keer (`Button`, `TextField`, `SelectField`, `BookCard`, `Alert`, `Skeleton`, `Pagination` en meer). Wil je iets aan de stijl van alle knoppen veranderen, dan doe je dat op één plek.

**Data ophalen.** Alle verzoeken lopen via `apiFetch` in `api/client.ts`. Die voegt het token toe, zet netwerkfouten en serverfouten om naar een `ApiError` met een Nederlandse melding en geeft getypeerde data terug.

**Sessie.** `AuthContext` bewaart de gebruiker en het JWT. Het token staat in `localStorage` onder de naam `src_token` zodat je ingelogd blijft na een herlaad. Bij het opstarten wordt het token gecontroleerd via `/auth/me`.

**De URL als bron van waarheid.** De filters en het paginanummer van de catalogus staan in de URL (`useCatalogQuery`), bijvoorbeeld `/?search=liefde&level=3F&page=2`. Daardoor werken de terugknop en het delen van een link. Tijdens het typen in de zoekbalk worden de filters 500 milliseconden na de laatste toetsaanslag automatisch toegepast, en alleen als de tekst echt is veranderd.

**Leeslijst.** De hook `useReadingList` bewaart de leeslijst en biedt toevoegen, status wijzigen en verwijderen. De catalogus, het advies en de leeslijst gebruiken dezelfde hook, dus alles blijft in sync.

**Profielformulier.** Niet opgeslagen wijzigingen worden bewaard als concept (`profile/profileDraft.ts`), er is een waarschuwing bij het sluiten van de tab en een bevestigingsdialoog bij annuleren.

## Vormgeving

De basis is Bootstrap 5 (grid, formulieren, kaarten), maar met een eigen uiterlijk: een warm papierachtig kleurenpalet, bosgroen als hoofdkleur, terracotta als accent en schreefletters voor koppen. Alle keuzes staan bovenaan `src/styles/main.scss` als Sass variabelen (`$forest`, `$terracotta`, `$paper` en meer). Verander je daar een kleur, dan volgen alle Bootstrap onderdelen mee.

Iedere soort tekst heeft een eigen kleur en pictogram (`constants/typeStyles.ts`). Kaartvoeten met acties gebruiken overal dezelfde knopgrootte via de klasse `card-actions`.

## Toegankelijkheid en responsive

De app is ontworpen tegen WCAG 2.1 niveau A en bruikbaar op desktop en telefoon (het raster wisselt tussen 1, 2 en 3 kolommen en de navigatie klapt in).

- Semantische HTML: `header`, `nav`, `main`, `footer`, een logische kopstructuur en een "Ga naar de hoofdinhoud" link.
- Elk formulierveld heeft een gekoppeld label. Groepen keuzes zijn een `fieldset` met `legend`. Foutmeldingen zijn gekoppeld met `aria-describedby` en `aria-invalid`, en na een mislukte verzending gaat de focus naar de foutenlijst.
- Statusberichten en aantallen resultaten staan in `aria-live` gebieden (`role="status"` of `role="alert"`).
- Een zichtbare focusrand bij toetsenbordgebruik en volledig bedienbaar met het toetsenbord, ook de paginakeuze en de bevestigingsdialoog (de native `<dialog>` vangt de focus op en sluit met Escape).
- Informatie hangt niet alleen aan kleur: soort tekst en leesstatus staan ook als tekst en pictogram.
- Decoratieve pictogrammen en illustraties zijn verborgen voor schermlezers (`aria-hidden`).
- Laden toont skeletons (`Skeleton`) met één melding voor schermlezers.
- Animaties staan uit bij de voorkeur "minder beweging".

## Coding style

De stijl wordt afgedwongen door tooling: `npm run format` past hem toe en `npm run check` controleert hem. De instellingen staan in `.editorconfig`, `.prettierrc.json` en `eslint.config.js`.

| Onderwerp                       | Afspraak                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| Inspringen                      | 4 spaties, geen tabs                                                                          |
| Regelbreedte                    | maximaal 100 tekens                                                                           |
| Quotes en puntkomma's           | enkele quotes (dubbele in JSX attributen), altijd een puntkomma                               |
| Trailing commas                 | overal waar dat kan                                                                           |
| Regeleinden                     | LF                                                                                            |
| Componenten en typen            | `PascalCase`, bestand heet hetzelfde als het component (`BookCard.tsx`)                       |
| Hooks                           | beginnen met `use` en staan in `hooks/` (`useReadingList.ts`)                                 |
| Overige bestanden en variabelen | `camelCase`                                                                                   |
| Imports                         | met de bestandsextensie (`./Button.tsx`), typen met `import type`                             |
| Typen                           | `strict` staat aan, geen `any`, geen verouderde (deprecated) API's                            |
| ESLint                          | `react-hooks`, `jsx-a11y`, `consistent-type-imports`, `no-deprecated`, `eqeqeq`, `no-console` |

Commentaar in de code is Engels, teksten die een gebruiker ziet zijn Nederlands.

## Een kleine wijziging doen

Voorbeeld: een nieuwe pagina toevoegen, bijvoorbeeld "Statistieken" voor leerlingen.

1. Maak `src/pages/StatsPage.tsx` met een `export default function StatsPage()`. Haal data op met `apiFetch` en toon `Skeleton` tijdens het laden.
2. Voeg in `src/App.tsx` een `Route` toe, ingepakt in `<ProtectedRoute roles={['student']}>`.
3. Voeg in `src/components/Layout.tsx` een item toe aan de lijst `STUDENT` met pad, label en pictogram.
4. Draai `npm run check` en bekijk de pagina met `npm run dev`.

Wil je een nieuw label of pictogram voor een soort tekst, pas dan `constants/labels.ts` en `constants/typeStyles.ts` aan.

## Requirements

| Requirement                              | Waar te vinden                                          |
| ---------------------------------------- | ------------------------------------------------------- |
| FR1 en FR2, leesprofiel                  | `ProfilePage`, `ProfileForm`, `profile/`                |
| FR3, advies met motivatie                | `AdvicePage`, `BookCard`                                |
| FR4, catalogus met filters en paginering | `CatalogPage`, `Pagination`, `useCatalogQuery`          |
| FR5, leeslijst                           | `ReadingListPage`, `useReadingList`                     |
| FR6, docenten                            | `TeachersPage`, `StudentsPage`, `StudentDetailPage`     |
| NFR1, herbruikbare componenten           | `components/`                                           |
| NFR2, README en coding style             | Dit bestand                                             |
| NFR4, responsive                         | Bootstrap raster, inklapbare navigatie                  |
| NFR5, toegankelijkheid                   | Zie [Toegankelijkheid](#toegankelijkheid-en-responsive) |
| NFR6, afgeschermde paden                 | `ProtectedRoute`                                        |

## Bekende beperkingen

- Er zijn nog geen frontend tests (bijvoorbeeld componenttests met Vitest en Testing Library). De pure logica in `useCatalogQuery` en `profileDraft` is daarvoor het eerste kandidaat.
- De toegankelijkheid is ontworpen volgens de richtlijnen maar nog niet getoetst met een tool als axe of Lighthouse en een schermlezer.
