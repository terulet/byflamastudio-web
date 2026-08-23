# Actualitat: decisió del paquet de candidats de 2026-08-24

**Generat** per `scripts/transcription/import_current_affairs.py --offline`. No
s'edita a mà: si canvia el que s'adopta, canvia aquest document.

## Com s'ha verificat

L'entorn de construcció no arriba a cap de les 19 fonts (CONNECT 403 a tots
els dominis, pels dos camins de sortida). El paquet, però, porta 19
**instantànies textuals** de les pàgines oficials, cadascuna amb el seu SHA-256.
Aquest és el camí que s'ha seguit:

1. Hashes d'arrel del paquet: 6/6 correctes.
2. Hashes de les instantànies: 19/19 correctes.
3. De cada instantània s'ha comprovat que el `source_id` de dins és el del
   fitxer, i que la URL canònica i la data de publicació coincideixen amb la
   fitxa de la font.
4. De cada pregunta s'ha buscat l'opció correcta dins del text preservat,
   **per paraules senceres**. Una coincidència numèrica de menys de
   4 caràcters no compta per si sola.
5. Quan la font és en una altra llengua, el fragment que demostra la resposta
   s'ha declarat a mà a `EVIDENCE_BRIDGE`, i l'script comprova que hi és,
   literalment, abans d'adoptar res.

El que una instantània **no** demostra és que sigui fidel a la pàgina viva:
això depèn de qui la va prendre. El manifest en desa el mètode de captura i la
data, i el dia que hi hagi xarxa es pot tornar a comprovar.

## Decisió, candidata per candidata

| Pregunta | Decisió | Fragment que la sosté | Com |
| --- | --- | --- | --- |
| `actualitat-2026-roses-001` | ✓ adoptada | «44.649.900» | l’opció correcta hi surt tal qual. Retall: — |
| `actualitat-2026-roses-002` | ✓ adoptada | «2,4MEUR» | pont d’evidència declarat: la nota escriu la xifra abreujada; «2,4» sol no demostraria res. Retall: — |
| `actualitat-2026-roses-003` | ✓ adoptada | «21.30 h» | l’opció correcta hi surt tal qual. Retall: la instantània és l’anunci del dia abans: demostra l’hora programada, no que l’acte comencés; a més situava un acte musical a les 21.15 h que el text no recull |
| `actualitat-2026-roses-004` | ✓ adoptada | «sis» | l’opció correcta hi surt tal qual. Retall: l’explicació original les situava a la Ciutadella de Roses i el text preservat no diu on se celebren |
| `actualitat-2026-roses-005` | ✓ adoptada | «entre 11 i 16 anys» | pont d’evidència declarat: la franja s’ha de demostrar sencera: un «11» solt no la sosté. Retall: — |
| `actualitat-2026-roses-006` | ✓ adoptada | «1.207» | l’opció correcta hi surt tal qual. Retall: l’original el qualificava d’«operatiu conjunt» i situava el decomís al passeig Marítim; cap de les dues coses consta al text preservat |
| `actualitat-2026-roses-007` | ✓ adoptada | «del 12 al 16 de febrer» | l’opció correcta hi surt tal qual. Retall: la instantània és la presentació del programa: demostra les dates previstes, no que se celebrés |
| `actualitat-2026-roses-008` | ✓ adoptada | «Alma Martín Guillén» | l’opció correcta hi surt tal qual. Retall: — |
| `actualitat-2026-cat-009` | ✓ adoptada | «2026-2030» | l’opció correcta hi surt tal qual. Retall: l’enunciat original la qualificava de «primera» proposta rebuda i la instantània no ho estableix |
| `actualitat-2026-cat-010` | ✓ adoptada | «17,69» | l’opció correcta hi surt tal qual. Retall: — |
| `actualitat-2026-cat-011` | ✓ adoptada | «31» | l’opció correcta hi surt tal qual. Retall: — |
| `actualitat-2026-cat-012` | ✓ adoptada | «260» | l’opció correcta hi surt tal qual. Retall: l’explicació original en desglossava la composició —empreses, entitats i centres de coneixement— i el text preservat no la dona |
| `actualitat-2026-cat-013` | ✓ adoptada | «2,3» | l’opció correcta hi surt tal qual. Retall: — |
| `actualitat-2026-cat-014` | ✓ adoptada | «8,4» | l’opció correcta hi surt tal qual. Retall: — |
| `actualitat-2026-es-015` | ✓ adoptada | «400» | l’opció correcta hi surt tal qual. Retall: l’original deia que l’import es «manté», continuïtat que la instantània d’un sol any no demostra |
| `actualitat-2026-es-016` | ✓ adoptada | «instrumentos musicales» | pont d’evidència declarat: font en castellà: «instrumentos musicales» és «instruments musicals». Retall: l’enunciat original deia que l’ús s’havia «incorporat» el 2026 i l’explicació que la regulació el va «afegir»; la instantània només demostra que hi és |
| `actualitat-2026-es-017` | ✓ adoptada | «62 millones de euros» | pont d’evidència declarat: font en castellà, i la xifra només val amb la unitat al costat. Retall: l’enunciat original els acotava als llargmetratges «sobre projecte» i el text preservat no fa aquesta distinció |
| `actualitat-2026-es-018` | ✓ adoptada | «56» | l’opció correcta hi surt tal qual. Retall: l’enunciat original deia que havien «cotitzat per pràctiques formatives no remunerades des de 2024» i el text preservat no ho recull |
| `actualitat-2026-es-019` | ✓ adoptada | «Nunciatura Apostólica, Madrid» | pont d’evidència declarat: font en castellà: «Nunciatura Apostólica» és «Nunciatura Apostòlica». Retall: — |
| `actualitat-2026-eu-020` | ✓ adoptada | «for the eighth time» | pont d’evidència declarat: font en anglès: «for the eighth time» és «Vuitena». Retall: l’original la donava per acabada («va ser») quan el text preservat la situa començant |
| `actualitat-2026-eu-021` | ✓ adoptada | «competitiveness, values and security» | pont d’evidència declarat: font en anglès: «competitiveness, values and security» és «Competitivitat, valors i seguretat». Retall: — |
| `actualitat-2026-cultura-022` | ✓ adoptada | «logró cinco de los 13 premios» | pont d’evidència declarat: font en castellà: «cinco» és «cinc». Sense límit de paraula, «Cinc» s’hi donaria per trobat per dins. Retall: l’explicació original hi afegia direcció i guió original, que la instantània no recull |
| `actualitat-2026-cultura-023` | ✓ adoptada | «con seis Goyas técnicos» | pont d’evidència declarat: font en castellà: «seis» és «sis», i el comparador de xifres no llegeix els números escrits amb lletres. Retall: — |
| `actualitat-2026-cultura-024` | ✓ adoptada | «Saturday 16 May» | pont d’evidència declarat: font en anglès, i un «16» solt no demostra la data. Retall: la instantània és l’anunci de ciutat amfitriona d’agost de 2025, en futur: demostra la data prevista, no que se celebrés |
| `actualitat-2026-esport-025` | ✓ adoptada | «from 6 to 22 February 2026» | pont d’evidència declarat: font en anglès, i un «6» solt no demostra res. Retall: la instantània és la nota d’un any abans, en futur: demostra les dates previstes, no que se celebressin |

## Retalls

Les preguntes marcades amb un retall afirmaven, al paquet original, alguna cosa
que la instantània no diu: un acte donat per celebrat quan el document és
l'anunci previ, un lloc que no hi consta, una continuïtat que una nota d'un sol
any no estableix. En aquests casos no s'ha buscat una altra font: s'ha retallat
el text fins al que el document sí que demostra.

## Caducitat

Cada pregunta porta el seu `reviewBy` i el paquet caduca amb la més llarga.
Ningú ha d'anar a bloquejar res: quan passen les dates, `isCurrent()` les deixa
fora de la quota tot sol.

| Data | En caduquen | En queden | Simulacre de cultura general |
| --- | --- | --- | --- |
| 2026-12-31 | 6 | 19 | obert |
| 2027-01-31 | 3 | 16 | obert |
| 2027-02-28 | 7 | 9 | bloquejat |
| 2027-03-31 | 7 | 2 | bloquejat |
| 2027-05-16 | 1 | 1 | bloquejat |
| 2027-06-08 | 1 | 0 | bloquejat |
