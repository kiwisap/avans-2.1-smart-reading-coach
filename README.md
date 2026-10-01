# Smart Reading Coach

De frontend van **Smart Reading Coach** (project "Vrij lezen op maat", Avans ICT SE2.1). Leerlingen bladeren door de catalogus, vullen hun leesprofiel in, krijgen leesadvies en houden een leeslijst bij. Docenten volgen de leerlingen die aan hen gekoppeld zijn. De app praat met de API in de map `smart-reading-coach-api`.

Inhoud: [Techniek](#techniek) · [Lokaal draaien](#lokaal-draaien) · [Scripts](#scripts) · [Pagina's](#paginas-en-toegang) · [Mappenstructuur](#mappenstructuur) · [Architectuur](#architectuur) · [Vormgeving](#vormgeving) · [Teksten en talen](#teksten-en-talen) · [Toegankelijkheid](#toegankelijkheid-en-responsive) · [Coding style](#coding-style) · [Een wijziging doen](#een-kleine-wijziging-doen) · [Requirements](#requirements)

## Techniek

| Onderdeel  | Keuze                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------- |
| Framework  | React 19 met TypeScript (strict)                                                            |
| Bouwtool   | Vite 8                                                                                      |
| Routing    | React Router 7                                                                              |
| Teksten    | i18next en react-i18next, alle teksten staan in `public/locales/nl.json`                    |
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
    constants/           pictogrammen en kleuren per soort tekst
    i18n/                i18next instellen (index.ts), typering van de sleutels en labels voor API waarden
    locales/             nl.json: alle teksten die een gebruiker ziet
    types/               typen van de API antwoorden
    styles/              main.scss: kleuren, lettertypes en eigen stijlen
```

## Architectuur

**Pagina's en componenten.** Een pagina haalt data op en zet het scherm in elkaar. Herbruikbare onderdelen staan in `components/` en bevatten geen eigen dataverkeer. Zo bestaat elke knop, elk formulierveld en elke boekkaart maar één keer (`Button`, `TextField`, `SelectField`, `BookCard`, `Alert`, `Skeleton`, `Pagination` en meer). Wil je iets aan de stijl van alle knoppen veranderen, dan doe je dat op één plek.

**Data ophalen.** Alle verzoeken lopen via `apiFetch` in `api/client.ts`. Die voegt het token toe, zet netwerkfouten en serverfouten om naar een `ApiError` met een vertaalde melding en geeft getypeerde data terug.

**Sessie.** `AuthContext` bewaart de gebruiker en het JWT. Het token staat in `localStorage` onder de naam `src_token` zodat je ingelogd blijft na een herlaad. Bij het opstarten wordt het token gecontroleerd via `/auth/me`.

**De URL als bron van waarheid.** De filters en het paginanummer van de catalogus staan in de URL (`useCatalogQuery`), bijvoorbeeld `/?search=liefde&level=3F&page=2`. Daardoor werken de terugknop en het delen van een link. Tijdens het typen in de zoekbalk worden de filters 500 milliseconden na de laatste toetsaanslag automatisch toegepast, en alleen als de tekst echt is veranderd.

**Leeslijst.** De hook `useReadingList` bewaart de leeslijst en biedt toevoegen, status wijzigen en verwijderen. De catalogus, het advies en de leeslijst gebruiken dezelfde hook, dus alles blijft in sync.

**Profielformulier.** Niet opgeslagen wijzigingen worden bewaard als concept (`profile/profileDraft.ts`), er is een waarschuwing bij het sluiten van de tab en een bevestigingsdialoog bij annuleren.

## Vormgeving

De basis is Bootstrap 5 (grid, formulieren, kaarten), maar met een eigen uiterlijk: een warm papierachtig kleurenpalet, bosgroen als hoofdkleur, terracotta als accent en schreefletters voor koppen. Alle keuzes staan bovenaan `src/styles/main.scss` als Sass variabelen (`$forest`, `$terracotta`, `$paper` en meer). Verander je daar een kleur, dan volgen alle Bootstrap onderdelen mee.

Iedere soort tekst heeft een eigen kleur en pictogram (`constants/typeStyles.ts`). Kaartvoeten met acties gebruiken overal dezelfde knopgrootte via de klasse `card-actions`.

## Teksten en talen

Alle teksten die een gebruiker ziet staan in `public/locales/nl.json`, gegroepeerd per onderdeel (`nav`, `catalog`, `profile`, enzovoort). In de code staan dus geen losse Nederlandse zinnen.

- In een component: `const { t } = useTranslation();` en dan `t('catalog.heading')`.
- Buiten React (hooks, validatie, de API client): `import i18n from '../i18n/index.ts'` en `i18n.t('...')`.
- Variabelen: `t('readingList.added', { title })` met `{{title}}` in het JSON bestand.
- Meervoud: `results_one` en `results_other` in het JSON bestand, aangeroepen met `t('catalog.results', { count })`.
- Zinnen met een link erin gebruiken `<Trans>` en tags in de tekst, bijvoorbeeld `<advice>laat ons iets voor je uitkiezen</advice>`. Gebruik geen tagnamen van lege HTML elementen zoals `link` of `br`.
- Waarden uit de API (soort tekst, lengte, doel) krijgen hun label via `typeLabel`, `lengthLabel` en `goalLabel` in `i18n/labels.ts`. Een onbekende waarde wordt gewoon getoond zoals hij is.

De sleutels zijn getypeerd (`i18n/i18next.d.ts`): een sleutel die niet in `nl.json` staat geeft een fout bij `npm run typecheck`.

**Een taal toevoegen.** Kopieer `public/locales/nl.json` naar bijvoorbeeld `en.json` en vertaal de waarden, zet de code bij `SUPPORTED_LANGUAGES` in `src/i18n/index.ts` en roep `i18n.changeLanguage('en')` aan, bijvoorbeeld vanuit een taalkeuze in `Layout.tsx`. De taal wordt dan eerst geladen en daarna gewisseld. Het `lang` attribuut van de pagina volgt de gekozen taal vanzelf.

**Hoe de teksten geladen worden.** De teksten zitten niet in de JavaScript, het zijn gewone bestanden in `public/locales` die Vite ongewijzigd meekopieert naar `dist/locales`. `i18n/index.ts` haalt het bestand van de actieve taal op bij het opstarten en `main.tsx` toont de app pas daarna, zodat je geen ruwe sleutels ziet. Lukt het laden niet, dan start de app toch en staat de fout in de console. Een tekst aanpassen kan dus zonder de app opnieuw te bouwen, maar de browser kan het oude bestand nog even in de cache houden. De sleutels blijven getypeerd: `i18n/i18next.d.ts` leidt het type af van `nl.json`.

**Teksten van de backend.** De frontend vertaalt geen foutcodes. Elk verzoek stuurt de huidige taal mee in de `Accept-Language` header (`api/client.ts`) en de backend antwoordt in die taal. Een fout komt terug als problem details (RFC 9457, `application/problem+json`) en `api/client.ts` toont het veld `detail` als `message` van de `ApiError`. Ook de tekst bij een advies ("Waarom dit bij je past") is al vertaald. Voeg je een taal toe, dan moet de backend die taal ook hebben (zie de README van de API). Code die op een bepaalde fout reageert, vergelijkt op `error.status` en niet op de tekst, zoals `AdvicePage` doet met 409 (leesprofiel ontbreekt).

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

Commentaar in de code is Engels, teksten die een gebruiker ziet staan in `public/locales/nl.json` (Nederlands).

## Een kleine wijziging doen

Voorbeeld: een nieuwe pagina toevoegen, bijvoorbeeld "Statistieken" voor leerlingen.

1. Maak `src/pages/StatsPage.tsx` met een `export default function StatsPage()`. Haal data op met `apiFetch` en toon `Skeleton` tijdens het laden.
2. Voeg in `src/App.tsx` een `Route` toe, ingepakt in `<ProtectedRoute roles={['student']}>`.
3. Voeg in `src/components/Layout.tsx` een item toe aan de lijst `STUDENT` met pad, `labelKey` en pictogram, en zet de naam van het menu item onder `nav` in `public/locales/nl.json`.
4. Draai `npm run check` en bekijk de pagina met `npm run dev`.

Wil je een nieuw label voor een soort tekst, voeg het dan toe onder `types` in `public/locales/nl.json`. Pictogram en kleur staan in `constants/typeStyles.ts`.

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
