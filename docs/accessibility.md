# Toegankelijkheid: aanpak en uitkomst

Dit document legt vast hoe de toegankelijkheid van Smart Reading Coach is getoetst, wat de uitkomst was en wat de beperkingen van de toetsing zijn. Het hoort bij NFR5 (WCAG niveau A) en bij het criterium "Toegankelijkheid getoetst" van LU1.

## Aanpak in drie lagen

| Laag                              | Wat                                                                                 | Waar                                | Status               |
| --------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------- | -------------------- |
| 1. Statisch tijdens het schrijven | ESLint met `eslint-plugin-jsx-a11y` (labels, alt teksten, rollen, interactieve div) | `eslint.config.js`, draait in de CI | Groen                |
| 2. Automatisch in de browser      | axe-core via Playwright op WCAG 2.1 A en AA, op alle pagina's                       | `e2e/accessibility.spec.ts`         | Groen, zie hieronder |
| 3. Handmatig                      | Toetsenbord, schermlezer, zoomen en Lighthouse                                      | Checklist hieronder                 | In te vullen         |

## Laag 2: uitkomst van de axe scan

Gescand met de tags `wcag2a`, `wcag2aa`, `wcag21a` en `wcag21aa`. Een schending laat de test falen, er zijn dus geen uitzonderingen of uitgeschakelde regels.

| Pagina                                      | Als      | Desktop | Mobiel (Pixel 7) |
| ------------------------------------------- | -------- | ------- | ---------------- |
| Inloggen, registreren, pagina niet gevonden | bezoeker | 0       | 0                |
| Catalogus                                   | leerling | 0       | 0                |
| Profielformulier, leeg en met foutmelding   | leerling | 0       | 0                |
| Profieloverzicht en weggooi dialoog         | leerling | 0       | 0                |
| Advies, leeslijst, mijn docenten            | leerling | 0       | 0                |
| Leerlingenlijst en leerlingdetail           | docent   | 0       | 0                |

Aantal schendingen per pagina, op beide schermformaten gecontroleerd.

Omdat er geen schendingen zijn gevonden, waren er geen fixes nodig naar aanleiding van de scan. De test blijft als vangnet staan: een nieuwe pagina of component die een regel breekt, laat de test falen.

## Wat de code al doet (bewust ontworpen)

Deze maatregelen zijn vóór de scan ingebouwd, daarom was de scan schoon. Per maatregel staat waar je het kunt aanwijzen.

| Onderdeel                            | Maatregel                                                                                     | Bestand                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Bypass blocks (WCAG 2.4.1)           | Skip link "Ga naar de hoofdinhoud" naar `<main id="main">`                                    | `components/Layout.tsx`                    |
| Landmarks en structuur               | `header`, `nav` met `aria-label`, `main`, `footer`, één `h1` per pagina                       | `components/Layout.tsx`, pagina's          |
| Labels en instructies (3.3.2, 1.3.1) | Elk veld heeft een gekoppeld `label`; groepen met `fieldset` en `legend`; verplicht met tekst | `TextField`, `RadioGroup`, `CheckboxGroup` |
| Foutherkenning (3.3.1, 3.3.3)        | `aria-invalid` en `aria-describedby`, foutlijst die focus krijgt na een mislukte verzending   | `ProfileForm.tsx`, `TextField.tsx`         |
| Statusberichten (4.1.3)              | `role="status"` en `role="alert"` voor meldingen, `aria-live` bij de teller van onderwerpen   | `Alert.tsx`, `CheckboxGroup.tsx`           |
| Toetsenbord (2.1.1, 2.4.3)           | Alleen echte `button`, `a` en `input` elementen; native `dialog` met focus trap en Escape     | `Button.tsx`, `ConfirmDialog.tsx`          |
| Naam, rol, waarde (4.1.2)            | `aria-expanded` bij Lees meer, `aria-pressed` bij Gelezen, `role="progressbar"` met waarden   | `BookCard.tsx`, `ReadingListPage.tsx`      |
| Niet alleen kleur (1.4.1)            | Status altijd met tekst of icoon plus tekst                                                   | `StatusBadge.tsx`, `AddToListButton.tsx`   |
| Decoratieve iconen                   | `aria-hidden="true"`, en verborgen tekst met `visually-hidden` waar een naam nodig is         | door de hele app                           |
| Links die een tabblad openen         | Waarschuwing in de toegankelijke naam                                                         | `BookCard.tsx`                             |
| Responsive (1.4.10)                  | Bootstrap grid, menu klapt in op kleine schermen, getest op Pixel 7 formaat                   | `Layout.tsx`, `playwright.config.ts`       |
| Laadindicatie                        | Skeleton met toegankelijk label                                                               | `Skeleton.tsx`                             |

## Beperkingen van de automatische scan

Axe vindt grofweg een derde van de toegankelijkheidsproblemen. Het kan wel controleren of een veld een label heeft, maar niet of het label begrijpelijk is. Het kan niet beoordelen of de focus volgorde logisch is, of een foutmelding duidelijk is, of een schermlezer iets zinnigs voorleest. Een score van nul schendingen betekent dus "geen aantoonbare fouten van de geautomatiseerde regels", niet "volledig toegankelijk". Daarom bestaat laag 3.

## Laag 3: handmatige controle (vul de uitkomst in)

Datum, browser en versie noteer je bovenaan wanneer je dit uitvoert.

| Controle                                                                                           | Resultaat | Opmerking |
| -------------------------------------------------------------------------------------------------- | --------- | --------- |
| Alleen toetsenbord: inloggen, profiel invullen en opslaan, advies bekijken, titel toevoegen        |           |           |
| Tab volgorde volgt de visuele volgorde op elke pagina                                              |           |           |
| Focus is altijd zichtbaar                                                                          |           |           |
| Skip link verschijnt bij de eerste Tab en springt naar de inhoud                                   |           |           |
| Dialoog: focus blijft binnen het venster, Escape sluit, focus keert terug naar de knop             |           |           |
| Na een mislukte verzending van het profiel springt de focus naar de foutlijst                      |           |           |
| Schermlezer (NVDA met Firefox of Chrome): kopjes, formuliergroepen en meldingen worden voorgelezen |           |           |
| Zoom 200 procent en tekstgrootte vergroot: geen verlies van inhoud of functie                      |           |           |
| Telefoonscherm 360 pixels breed: alles bruikbaar, geen horizontaal scrollen                        |           |           |

## Lighthouse

Open Chrome DevTools (F12), kies Lighthouse, alleen de categorie Accessibility, modus Navigation, apparaat Desktop en daarna Mobile. Doe dit ingelogd als leerling.

| Pagina       | Desktop score | Mobiel score | Gevonden punten en oplossing |
| ------------ | ------------- | ------------ | ---------------------------- |
| Inloggen     | 100           | 100          |                              |
| Catalogus    | 100           | 100          |                              |
| Mijn profiel | 100           | 100          |                              |
| Advies       | 100           | 100          |                              |
| Leeslijst    | 100           | 100          |                              |

Elk punt dat Lighthouse noemt, los je op of onderbouw je. Lighthouse gebruikt dezelfde axe engine, dus verwacht geen verrassingen, maar het levert wel de score als bewijs op.

## Bekende afwegingen

1. Contrast is geautomatiseerd getoetst door axe (AA, 4.5 op 1). Contrast over afbeeldingen en gradiënten kan axe niet altijd beoordelen, dat valt onder de handmatige controle.
2. De app is alleen in het Nederlands. Het `lang` attribuut van het document staat op `nl`, zodat schermlezers de juiste uitspraak kiezen.
