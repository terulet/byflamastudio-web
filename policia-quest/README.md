# Policia Quest

**Preparació Policia Local · Roses**

Aplicació web progressiva (PWA) d'estudi per a l'oposició d'agent de la Policia
Local de Roses. Sessions curtes, correcció raonada amb la font a la vista,
repetició espaiada i simulacres amb el format i la penalització reals de la
convocatòria.

Funciona **al dispositiu**: sense compte, sense servidor, sense telemetria i
sense connexió després de la primera càrrega.

> **Aplicació independent i no oficial.** El contingut s'ha de contrastar sempre
> amb les bases i les normes vigents de cada convocatòria. No té cap relació amb
> l'Ajuntament de Roses ni fa servir cap escut o emblema oficial.

---

## Estat d'aquesta versió

| | |
| --- | --- |
| Temes del temari | 40 de 40 |
| Microlliçons | 40 |
| Preguntes actives | 223 (201 professionals + 22 de cultura general) |
| Preguntes per tema | mínim 5 |
| Simulacres | cultura general, professional i **complet** (les dues seguides) |
| Fonts registrades | 51 |
| Exàmens oficials importats | **0** (vegeu la limitació més avall) |

### Limitació important i coneguda

L'entorn on es va construir aquesta versió tenia la sortida de xarxa
restringida: la política d'egress només permetia registres de paquets i
`github.com`, i va denegar amb `CONNECT 403` l'accés a `www.roses.cat`,
`ssl4.ddgi.cat`, `www.boe.es`, `portaljuridic.gencat.cat`, `interior.gencat.cat`,
`eur-lex.europa.eu` i `www.un.org`.

Conseqüències, dites sense embuts:

1. **Cap dels 30 exàmens oficials registrats està importat.** El contingut d'un
   examen oficial només es pot transcriure del document oficial; inventar-lo
   seria fabricar una font. El registre conserva la URL real, el nombre de
   preguntes esperat i el motiu, i la importació es completa amb
   `npm run sources:download && npm run sources:extract && npm run exams:import`
   des d'una xarxa amb accés.
2. **Cap font s'ha pogut baixar ni verificar automàticament.** Les referències
   del contingut apunten a normes reals i concretes (article per article) però
   tenen l'estat `pending-source-verification` fins que una execució amb xarxa
   les contrasti contra el text consolidat. L'aplicació ho diu a cada correcció.
3. **El paquet d'actualitat és buit a propòsit.** La prova de cultura general
   reserva 10 de 20 preguntes a l'actualitat i no hi havia cap font verificable.

`npm run content:report` genera l'informe complet a
`artifacts/coverage-report.md`.

---

## Requisits

- Node.js 20 o superior (provat amb 22).
- npm 10 o superior.

## Posada en marxa

```bash
npm install
npm run dev          # servidor de desenvolupament
```

Obre la URL que imprimeix Vite (per defecte `http://localhost:5173`).

## Comandes

| Comanda | Què fa |
| --- | --- |
| `npm run dev` | Servidor de desenvolupament amb recàrrega en calent |
| `npm run build` | Build de producció a `dist/`, amb service worker |
| `npm run preview` | Serveix el build a `http://127.0.0.1:4173` |
| `npm run typecheck` | Comprovació de tipus de tot el projecte |
| `npm test` | Tests unitaris i de contingut (Vitest) |
| `npm run test:e2e` | Tests d'extrem a extrem sobre el build (Playwright) |
| `npm run test:a11y` | Només l'auditoria d'accessibilitat (axe-core, WCAG A/AA) |
| `npm run content:validate` | Valida el contingut i falla si trenca cap invariant |
| `npm run content:report` | Genera `artifacts/coverage-report.md` i `SOURCES.md` |
| `npm run sources:download` | Baixa les fonts oficials a `sources/cache/` (necessita xarxa) |
| `npm run sources:adopt` | Adopta fonts deixades a mà a `sources/inbox/` (sense xarxa) |
| `npm run sources:extract` | Converteix les còpies en text a `sources/extracted/` |
| `npm run exams:import` | Genera esborranys de transcripció dels exàmens oficials |
| **`npm run check`** | **Tipus + contingut + tests + build. La comanda de porta** |

`npm run test:e2e` necessita el build fet i aixeca el servidor de previsualització
per si mateix.

### Rescat de fonts sense xarxa

`sources:download` necessita accés a `roses.cat`, `ssl4.ddgi.cat`, `boe.es` i
`portaljuridic.gencat.cat`. Quan l'entorn no en té —el cas d'aquesta primera
versió— el camí és entregar les còpies a mà:

```bash
npm run sources:adopt -- --list     # què falta, amb la URL oficial de cadascuna
# deseu cada document a sources/inbox/<sourceId>.pdf
npm run sources:adopt -- --dry-run  # comprova sense tocar res
npm run sources:adopt               # copia, calcula el SHA-256 i actualitza el manifest
npm run sources:extract             # converteix les còpies en text cercable
npm run exams:import                # esborranys de transcripció dels quadernets
```

El nom del fitxer, sense extensió, ha de ser el `sourceId` del manifest.
L'script no endevina a quina font pertany un document: un nom que no
correspon a cap identificador es reporta i no s'adopta. També rebutja el
parany habitual —un PDF que en realitat és una pàgina d'error o de sessió
caducada— comprovant que comenci per `%PDF`.

Adoptar una font vol dir que ja n'hi ha una còpia local verificable pel seu
hash. **No** passa cap referència a `verified`: contrastar les cites contra el
text consolidat segueix sent una decisió de qui les comprova.

### Transcripció dels quadernets oficials

```bash
pip install pymupdf
python3 scripts/transcription/generate_official_questions.py
```

Regenera `content/municipalities/roses/questions/official-exams.ts` a partir
dels PDF adoptats. No és una dependència de l'aplicació ni s'executa a cada
build: es passa una vegada per convocatòria i el resultat es revisa i es
versiona com a contingut.

La resposta de cada pregunta surt de la marca que porta el quadernet —asterisc,
color o traç, segons l'any— i mai s'infereix. Una pregunta sense marca
inequívoca s'importa sense clau i queda per a revisió visual.

### Accessibilitat

`tests/e2e/accessibility.spec.ts` passa axe-core per cada pantalla en els dos
temes i falla si hi ha cap incompliment de WCAG 2.0/2.1/2.2 en nivell A o AA.
Comprova, a més, que es pot respondre una pregunta només amb el teclat, que el
focus és visible i que els controls arriben a l'àrea tàctil mínima.

```bash
npm run build
npm run test:a11y        # 23 auditories: 7 pantalles × 2 temes + fluxos
```

Una auditoria automàtica atrapa el que és mesurable —contrast, noms accessibles,
ordre de capçaleres, etiquetes— però no substitueix la revisió humana. Si toques
la paleta de `src/styles/tokens.css`, torna-la a passar: els valors de contrast
d'aquell fitxer estan mesurats, no estimats.

### Captures i QA visual

```bash
npm run build
npm run preview &        # o deixa que Playwright l'aixequi
node scripts/smoke.mjs   # recorre l'app i desa artifacts/screenshots/
```

L'script informa d'errors de consola, recursos 404 i desbordaments horitzontals
a 320, 390, 393, 768 i 1280 px d'amplada.

---

## Estructura

```text
policia-quest/
├─ content/                     Contingut, separat del codi d'interfície
│  ├─ schemas/                  Esquemes Zod: font única de veritat dels tipus
│  └─ municipalities/roses/     Paquet de municipi
│     ├─ syllabus.json          Els 40 temes (generat per build-syllabus.ts)
│     ├─ authoring.ts           Ajudes per redactar contingut de manera tipada
│     ├─ lessons/               Microlliçons, per blocs de temes
│     ├─ questions/             Banc de preguntes, per blocs de temes
│     ├─ exams.ts               Registre d'exàmens oficials i plànols de simulacre
│     ├─ current-affairs/       Paquets d'actualitat versionats
│     ├─ pack-core.ts           Paquet sense lliçons (el que carrega l'app)
│     └─ index.ts               Paquet complet (scripts i tests)
├─ sources/
│  ├─ source-manifest.json      Registre de les 51 fonts oficials
│  ├─ cache/                    Còpies baixades (prescindible, no bloqueja el build)
│  └─ extracted/                Text normalitzat intermedi
├─ scripts/                     Content Factory + QA
├─ src/
│  ├─ app/                      Estat, encaminador, tema, retroalimentació
│  ├─ components/               Peces visuals compartides
│  ├─ content/                  Punt d'entrada del contingut per a l'app
│  ├─ domain/                   Tipus derivats dels esquemes
│  ├─ engines/                  Puntuació, repàs espaiat, selecció, domini
│  ├─ i18n/                     Traduccions ca/es
│  ├─ persistence/              IndexedDB, migracions, còpies de seguretat
│  ├─ screens/                  Pantalles
│  ├─ styles/                   Sistema de disseny
│  └─ util/                     Dates i generador pseudoaleatori
├─ tests/
│  ├─ unit/                     Motors i persistència
│  ├─ content/                  Invariants del contingut
│  └─ e2e/                      Fluxos complets amb navegador real
└─ artifacts/                   Informes i captures
```

## Documentació

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — decisions tècniques, fórmules exactes
  i límits d'aquesta fase.
- [`CONTENT.md`](./CONTENT.md) — com es cerquen, es baixen, es redacten, es
  revisen i s'actualitzen les fonts i el contingut.
- [`SOURCES.md`](./SOURCES.md) — llista completa de fonts (fitxer generat).
- [`CLAUDE.md`](./CLAUDE.md) — regles que s'han de mantenir en futures
  iteracions.
- `artifacts/coverage-report.md` — què està cobert i què necessita revisió
  humana (fitxer generat).

## Què **no** fa aquesta versió, a propòsit

Sense compte d'usuari, sense pagaments, sense servidor, sense IA en temps
d'execució, sense traçadors, sense anuncis i sense telemetria externa. Tot el
progrés viu al dispositiu i se'n pot exportar una còpia de seguretat en JSON.
