# Adopció de fonts per mirall Git — 25 d'agost de 2026

## Per què existeix aquest camí

L'entorn de construcció no arriba a cap font oficial: boe.es, gencat.cat,
un.org i roses.cat responen 403 al mateix proxy de sortida (comprovat
peticiò a peticiò). El que sí que serveix el proxy són els amfitrions de
codi (github.com, gitlab.com, raw.githubusercontent.com). Això obre un camí
que no existia quan es van adoptar els tres paquets portats a mà: **clonar
un mirall públic de la legislació consolidada del BOE i quedar-se'n els
bytes exactes**, sense cap model ni transcripció pel mig.

## El mirall

- **Repositori**: `github.com/EnriqueLop/legalize-es` — la legislació
  espanyola consolidada com a repositori git: un fitxer Markdown per norma
  (nom = identificador oficial del BOE), una reforma = un commit datat amb
  la publicació oficial. Les dades surten de l'API de dades obertes del BOE
  (`boe.es/datosabiertos`), i el fitxer de cada norma porta al capdavant les
  metadades oficials (data de publicació, número de butlletí, URL del text
  consolidat).
- **Commit adoptat**: `cda050de2eae02eaac67b6f0c70ab43b4a23cdbf`.
- **Reproduïbilitat**: git adreça el contingut pel seu hash. Qualsevol
  persona pot clonar el mirall, situar-se en aquell commit i comprovar que
  el fitxer és byte a byte el que hi ha a `sources/cache/`. Les tres
  versions històriques citen, a més, el commit concret d'on surten.

## Què s'ha adoptat (13 fonts)

| sourceId | Norma | Fitxer del mirall |
|---|---|---|
| lo-6-1985-lopj | LO 6/1985, del poder judicial (vigent) | es/BOE-A-1985-12666.md |
| lo-6-1985-lopj-vigent-2018 | La mateixa, text vigent el 2018 | commit `e7b89bb` |
| lo-5-1985-loreg | LO 5/1985, règim electoral general | es/BOE-A-1985-11672.md |
| lo-2-1979-tc | LO 2/1979, del Tribunal Constitucional | es/BOE-A-1979-23709.md |
| rd-920-2017-itv | RD 920/2017, inspecció tècnica de vehicles | es/BOE-A-2017-12841.md |
| lo-6-2006-estatut | LO 6/2006, Estatut d'autonomia de Catalunya | es/BOE-A-2006-13087.md |
| codi-civil-1889 | Codi civil (art. 2.1, entrada en vigor) | es/BOE-A-1889-4763.md |
| llei-10-1994-mossos | Llei 10/1994, Policia de la Generalitat | es-ct/BOE-A-1994-18777.md |
| llei-24-2009-sindic | Llei 24/2009, del Síndic de Greuges | es-ct/BOE-A-2010-735.md |
| orden-hac-283-2021 | Ordre HAC/283/2021 (enumera les 17 CA + Ceuta i Melilla) | es/BOE-A-2021-4727.md |
| rd-176-2022-codi-conducta-gc | RD 176/2022, Codi de conducta de la Guàrdia Civil | es/BOE-A-2022-3477.md |
| ce-1978-vigent-2018 | Constitució, text vigent el 2018 | commit `2da8d9e` |
| lo-10-1995-cp-vigent-2018 | Codi penal, text vigent el 2018 | commit `4e02baf` |

Totes són al manifest amb `fetchNote` que en declara la procedència, es van
adoptar amb `npm run sources:adopt` (SHA-256 al manifest) i la còpia `.md`
queda versionada dins `sources/cache/` perquè el paquet sigui autònom.

Les versions històriques surten del registre de reformes del mirall:

- **CE vigent el 2018** = commit de la reforma de l'art. 135 (27-09-2011).
  L'historial complet del fitxer té exactament quatre commits — 1978, art.
  13 (1992), art. 135 (2011), art. 49 (2024) — que coincideixen amb les
  úniques reformes reals de la Constitució. L'art. 9 hi és idèntic al
  vigent: és la prova temporal que demanava la pregunta de 2018.
- **CP vigent el 2018** = últim commit anterior al 2019 (28-04-2015). Conté
  els arts. 178 i 181 amb la redacció d'abans de la LO 10/2022.
- **LOPJ vigent el 2018** = últim commit anterior a la LO 4/2018
  (26-12-2016). Conté l'art. 26 d'abans dels tribunals d'instància.

## L'estat que reben les decisions

- Una decisió que descansa **només en fonts oficials ja adoptades** (CE en
  PDF del BOE, pàgina de l'ONU de la DUDH) pot ser `supported-current`.
- Una decisió que descansa **en una còpia mirall** es queda en
  `partially-supported` encara que la cita sigui literal i el dret clar: el
  SHA-256 demostra que la còpia no s'ha mogut, i el commit del mirall d'on
  surt; el que no s'ha pogut comprovar des d'aquí és la còpia oficial de
  boe.es. **Camí de millora**: baixar la còpia oficial
  (`npm run sources:download -- --id=<sourceId>` en una màquina amb xarxa),
  comprovar que el text coincideix i pujar la decisió a `supported-current`.
- Les discrepàncies i supersedències es marquen igual que sempre
  (`official-key-conflicts-with-law-at-exam`, `supported-at-exam-now-superseded`),
  perquè el fet que les motiva està citat literalment.

## Les 23 preguntes resoltes

Sis `supported-current` amb fonts oficials ja adoptades (4 de la DUDH via
`ddhh-1948`, 2 de la CE via `ce-1978`: arts. 122.3 i 117.3/124.1 — la lliçó
de la segona passada es repeteix: **abans de donar per fet que cal una font
nova, torneu a mirar les que ja hi ha**).

Tretze `partially-supported` per mirall: Llei 10/1994 (objecte), LOPJ (arts.
34, 65, 81, 566+586.3), LOREG (162.1), LOTC (art. 2 + CE 102.1), RD 920/2017
(annex I: ciclomotors i motocicletes), Estatut/Síndic (79.1 + 2.2, dues
preguntes), entrada en vigor de l'Estatut (CC art. 2.1 + BOE 172 de
20-07-2006 → 9-08-2006), i l'Ordre HAC/283/2021 per a «17 comunitats i 2
ciutats autònomes».

Dues `official-key-conflicts-with-law-at-exam` noves:

- **q-of-roses-2018-propietat-cp-002** (art. 9 CE): la plantilla afirma una
  subjecció parcial dels poders públics que l'art. 9.1 no diu, i la còpia
  històrica del 2018 demostra que la redacció era la mateixa. L'opció que
  sosté la norma és la a.
- **q-of-roses-2021-interins-cp-013** (Codi de conducta ONU): la plantilla
  diu 17-12-**1978**; la Resolució 34/169 és del 17-12-**1979** (preàmbul
  del RD 176/2022). Cap opció dona l'any real.

Dues `supported-at-exam-now-superseded` noves:

- **q-of-roses-2018-propietat-cp-020** (agressió/abús sexual): correcta el
  2018; la LO 10/2022 va refondre l'abús dins l'agressió i avui cap opció
  descriu una conducta que no sigui agressió.
- **q-of-roses-2018-propietat-cp-022** (òrgans jurisdiccionals penals):
  correcta el 2018 per l'art. 26 LOPJ d'aleshores; la LO 1/2025 va
  reorganitzar la primera instància en tribunals d'instància.

## Verificació

Cada cita es va **extreure per àncores del text de la font** (subcadena per
construcció) i es va tornar a comprovar de manera independent contra
`sources/extracted/` amb la mateixa normalització d'espais de les passades
anteriors: 23/23 literals. El regenerat de `official-exams.ts` va tocar
exactament els 23 blocs esperats i cap enunciat, opció ni resposta oficial
(diff comprovat camp a camp). `npm run check` 242/242, `npm run test:e2e`
52/52, `npm run content:matrix` amb l'empremta dels textos oficials intacta,
`node scripts/smoke.mjs` net.

## El que aquest camí no pot fer

roses.cat i l'Agència de Ciberseguretat continuen bloquejades (contingut
per JavaScript en dominis prohibits, sense mirall): les seves preguntes
segueixen `pending-evidence` i esperen `npm run sources:rescue` en una
màquina amb xarxa. La Carta de Rotterdam i el text articulat del Codi de
conducta de l'ONU no tenen mirall Git conegut. El detall, pregunta a
pregunta, és al camp `missing` de cadascuna.
