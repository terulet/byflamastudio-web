# Decisió sobre el paquet d'actualitat 2026-08-24

**Resultat: 0 preguntes adoptades de 25. La porta continua tancada.**

## Per què

L'encàrrec exigeix obrir cada URL oficial i comprovar-hi el fet abans d'adoptar
la pregunta, i és explícit sobre què fer si no es pot: *«Una URL inaccessible, un
contingut que no demostra exactament la resposta o una dada ambigua implica
excloure la pregunta. No substitueixis l'evidència per memòria, premsa,
fragments del cercador ni inferències.»*

Des d'aquest entorn les **19 URL són inabastables**. La política de sortida de
xarxa respon 403 al CONNECT per als vuit dominis implicats:

| Domini | Fonts | Resultat |
| --- | ---: | --- |
| `www.roses.cat` | 7 | CONNECT 403 |
| `www.lamoncloa.gob.es` | 4 | CONNECT 403 |
| `govern.cat` | 3 | CONNECT 403 |
| `www.parlament.cat` | 1 | CONNECT 403 |
| `irish-presidency.consilium.europa.eu` | 1 | CONNECT 403 |
| `www.academiadecine.com` | 1 | CONNECT 403 |
| `eurovision.tv` | 1 | CONNECT 403 |
| `newsroom.olympics.com` | 1 | CONNECT 403 |

Es van provar els dos camins de sortida disponibles —el proxy del contenidor amb
`curl` i l'eina de fetch, que enruta per una altra banda— i tots dos els
refusen. El diagnòstic del proxy ho diu literalment: `connect_rejected`,
*«gateway answered 403 to CONNECT (policy denial)»*.

`sources.evidence.json` **no és una còpia de la font**, i el mateix paquet ho
adverteix: és un índex del que cal tornar a comprovar. Adoptar les preguntes a
partir d'aquest índex seria confiar en la fitxa en comptes del document, que és
precisament el que la regla prohibeix.

## Integritat i estructura del paquet

- `sha256sum -c SHA256SUMS.txt`: **4/4 correctes**.
- Estructura: **25/25 sense cap problema**. Identificadors únics, índex de
  resposta dins de rang, quatre opcions diferents per pregunta, els 19
  `sourceId` existeixen, dates ISO vàlides i tots els `reviewBy` posteriors al
  2026-08-24.

## Taula de decisió, 25/25

| Pregunta | Àmbit | Decisió | Motiu | Observació pedagògica |
| --- | --- | --- | --- | --- |
| `actualitat-2026-roses-001` | roses | rebutjada | font inabastable: `roses-budget-2026` (CONNECT 403) | sèrie numèrica desordenada (48,4 / 44,6 / 46,8 / 50,2) |
| `actualitat-2026-roses-002` | roses | rebutjada | font inabastable: `roses-budget-2026` (CONNECT 403) | — |
| `actualitat-2026-roses-003` | roses | rebutjada | font inabastable: `roses-prego-festa-major-2026` (CONNECT 403) | l’opció correcta repeteix el titular de la font («Grup de Teatre de Roses») |
| `actualitat-2026-roses-004` | roses | rebutjada | font inabastable: `roses-nits-circ-2026` (CONNECT 403) | ordinals desordenats (Quatre, Cinc, Vuit, Sis) |
| `actualitat-2026-roses-005` | roses | rebutjada | font inabastable: `roses-catala-nouvinguts-2026` (CONNECT 403) | — |
| `actualitat-2026-roses-006` | roses | rebutjada | font inabastable: `roses-top-manta-2026-07-31` (CONNECT 403) | — |
| `actualitat-2026-roses-007` | roses | rebutjada | font inabastable: `roses-carnaval-revista-2026` (CONNECT 403) | — |
| `actualitat-2026-roses-008` | roses | rebutjada | font inabastable: `roses-cartell-carnaval-2026` (CONNECT 403) | — |
| `actualitat-2026-cat-009` | catalunya | rebutjada | font inabastable: `cat-carboni-2026-2030` (CONNECT 403) | enunciat sense referència temporal |
| `actualitat-2026-cat-010` | catalunya | rebutjada | font inabastable: `cat-preus-universitaris-2025-2026` (CONNECT 403) | reviewBy molt curt (2026-09-30, cinc setmanes) |
| `actualitat-2026-cat-011` | catalunya | rebutjada | font inabastable: `cat-esra-2026` (CONNECT 403) | l’opció correcta repeteix el titular de la font |
| `actualitat-2026-cat-012` | catalunya | rebutjada | font inabastable: `cat-esra-2026` (CONNECT 403) | sèrie numèrica desordenada; enunciat sense referència temporal |
| `actualitat-2026-cat-013` | catalunya | rebutjada | font inabastable: `cat-previsions-2026` (CONNECT 403) | sèrie numèrica desordenada (2,0 / 1,2 / 1,8 / 2,6) |
| `actualitat-2026-cat-014` | catalunya | rebutjada | font inabastable: `cat-previsions-2026` (CONNECT 403) | — |
| `actualitat-2026-es-015` | espanya | rebutjada | font inabastable: `es-bono-cultural-2026` (CONNECT 403) | — |
| `actualitat-2026-es-016` | espanya | rebutjada | font inabastable: `es-bono-cultural-2026` (CONNECT 403) | — |
| `actualitat-2026-es-017` | espanya | rebutjada | font inabastable: `es-icaa-2026` (CONNECT 403) | sèrie numèrica desordenada (62 / 42 / 52 / 72) |
| `actualitat-2026-es-018` | espanya | rebutjada | font inabastable: `es-estatut-practiques-2026` (CONNECT 403) | sèrie numèrica desordenada (46 / 56 / 51 / 61) |
| `actualitat-2026-es-019` | espanya | rebutjada | font inabastable: `es-visita-lleo-xiv-2026` (CONNECT 403) | — |
| `actualitat-2026-eu-020` | unio_europea | rebutjada | font inabastable: `eu-presidencia-irlanda-2026` (CONNECT 403) | — |
| `actualitat-2026-eu-021` | unio_europea | rebutjada | font inabastable: `eu-presidencia-irlanda-2026` (CONNECT 403) | — |
| `actualitat-2026-cultura-022` | cultura | rebutjada | font inabastable: `goya-2026` (CONNECT 403) | — |
| `actualitat-2026-cultura-023` | cultura | rebutjada | font inabastable: `goya-2026` (CONNECT 403) | — |
| `actualitat-2026-cultura-024` | cultura | rebutjada | font inabastable: `eurovision-2026` (CONNECT 403) | — |
| `actualitat-2026-esport-025` | esport | rebutjada | font inabastable: `olimpics-hivern-2026` (CONNECT 403) | — |

## Observacions per a qui pugui verificar

La revisió pedagògica sí que s'ha pogut fer, perquè no depèn de la xarxa. Deu
preguntes tenen defectes de forma que convé arreglar **abans** d'importar-les,
encara que el fet resulti correcte:

- **Cinc sèries numèriques desordenades.** Quan les quatre opcions són xifres,
  presentar-les fora d'ordre és una pista d'atenció i no de coneixement.
- **Dues opcions correctes que repeteixen el titular de la font.** Qui reconegui
  el titular encerta sense saber el fet.
- **Un conjunt d'ordinals desordenat** (Quatre, Cinc, Vuit, Sis).
- **Dos enunciats sense referència temporal**, que l'encàrrec demana evitar
  expressament perquè una pregunta d'actualitat sense data envelleix malament.
- **Un `reviewBy` de cinc setmanes** (`cat-010`), que obliga a revisar el paquet
  gairebé de seguida.

També cal traduir tres àmbits que no existeixen a `CurrentAffairsPack.scope`:
`unio_europea` → `ue`, i `cultura` i `esport`, que no hi tenen equivalent
directe. L'importador els mapa, però val la pena decidir-ho conscientment.

Una nota de camí: l'encàrrec situa el contingut a `src/content/current-affairs/`
i al projecte real viu a `content/municipalities/roses/current-affairs/`.

## Com continuar

Des d'una xarxa amb accés als vuit dominis:

```bash
python3 scripts/transcription/import_current_affairs.py --check   # informe, sense escriure
python3 scripts/transcription/import_current_affairs.py           # importa el que es demostri
npm run content:validate
```

L'importador obre cada URL, hi busca el fet, desa una instantània a
`sources/cache/` amb el seu SHA-256, actualitza el manifest i només llavors
marca la referència com a `verified`. Si no arriba a deu preguntes demostrades,
no toca `contentStatus` i el simulacre continua bloquejat.
