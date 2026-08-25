# Auditoria visual dels sis quadernets P0

**Data:** 23 d'agost de 2026 · **Abast:** 189 preguntes, 51 pàgines, 6 exàmens.

Cada pàgina dels sis quadernets de prioritat P0 s'ha renderitzat des del PDF
adoptat a `sources/cache/` i s'ha comparat **a la vista** amb la clau que porta
el banc de preguntes de l'aplicació (`questions/official-exams.ts`), pregunta
per pregunta i opció per opció.

No és una comprovació automàtica: el full de treball es va generar del contingut
ja compromès, i la comparació la va fer una lectura de la imatge, no del text.

## Resultat

| Examen | Preguntes | Pàgines | Coincideixen | Discrepàncies de clau |
| --- | ---: | ---: | ---: | ---: |
| 2026 interins · cultura general | 21 | 4 | 21 | 0 |
| 2026 interins · coneixements professionals | 42 | 12 | 42 | 0 |
| 2025 propietat · cultura general | 21 | 4 | 21 | 0 |
| 2025 propietat · coneixements professionals | 42 | 12 | 42 | 0 |
| 2025 interins · cultura general | 21 | 4 | 21 | 0 |
| 2025 interins · coneixements professionals | 42 | 15 | 42 | 0 |
| **Total** | **189** | **51** | **189** | **0** |

També s'ha comprovat visualment, i coincideix en tots els casos:

- La **frontera de les preguntes de reserva**: el títol «PREGUNTA RESERVA» o
  «PREGUNTES RESERVA» i quines preguntes queden a sota (1 a cultura general,
  2 a coneixements professionals).
- Que la marca d'asterisc **acompanya l'opció que li toca** i no la del costat,
  incloent-hi les opcions que ocupen diverses línies.

## Troballa: una resposta oficial que ja no reflecteix el dret vigent

`q-of-roses-2025-interins-cp-036` — 2025 interins, coneixements professionals,
pregunta 36, celebrada el 16 d'abril de 2025.

> «Segons l'Ordenança de mesures per fomentar i garantir la convivència
> ciutadana al municipi de Roses, "Col·laborar en l'espai públic amb els
> venedors ambulants no autoritzats", és:»

El tribunal marca **b) Una infracció greu amb una multa de 750 euros**.

Aquesta és la qualificació del text de 2019. La modificació aprovada
definitivament el 24 de febrer de 2021 i publicada al BOP de Girona núm. 54, de
19 de març de 2021, va rebaixar l'article 11.2 a **lleu amb 500 euros**
(modificació cinquena, pàgina 3 del PDF). L'examen és de 2025, quatre anys
posterior.

**No s'ha canviat la resposta.** El que va publicar el tribunal es conserva tal
com es va publicar; el que s'ha fet és afegir-hi una nota visible perquè qui
estudiï no aprengui com a vigent una qualificació derogada.

## Segona troballa: text d'opció contaminat (51 de 189)

L'auditoria comparava **la lletra marcada**, i totes 189 eren correctes. El que
no mirava era la integritat del text, i hi havia un defecte de transcripció:
l'última opció de cada pàgina s'empassava la capçalera de la següent.

> `d) El 1945. Exp.: 2025/010339 Procés selectiu: agents interins 2026…`

Cinquanta-una opcions de 189. No ho va destapar l'auditoria sinó **obrir l'app i
llegir una pregunta**, que és per què les captures i la prova real són part de
la comprovació i no un tràmit.

L'extractor ara detecta capçaleres i peus **per repetició** —el text que surt a
la meitat de les pàgines o més— en comptes de per posició, que variava. Després
de regenerar, les 189 claus segueixen sent exactament les auditades: cap
resposta ha canviat. Ho fixa un test a `tests/content/content.test.ts`.

## Tercera troballa: material històric servit com a present

La mateixa sessió va servir «Qui és l'**actual** regidor/a de Seguretat ciutadana
de l'Ajuntament de Roses?» dins d'una Patrulla normal, sense cap data. La
pregunta és del quadernet de 2025 i la resposta era certa aquell dia.

Quedaven fora dels **simulacres** però no de les **sessions d'estudi**:
`buildExamPaper` filtrava per vigència i `selectSession` no. Ara `selectSession`
també ho fa, i deixa passar el material caducat només quan algú demana
expressament l'origen «examen oficial», que és consultar història. En aquest cas
la pregunta porta al davant la seva data: «Examen oficial del 16/04/2025».

## Mètode

1. `sha256sum -c` del paquet de fonts: 36/36 correctes.
2. Renderització de cada pàgina a 105 ppp des del PDF adoptat.
3. Full de treball generat del contingut compromès, no de l'extractor.
4. Lectura de cada pàgina i comparació de la lletra marcada.

Les 189 preguntes ja tenien coincidència del 100 % entre dues extraccions
independents (PyMuPDF i el `pdftotext` del paquet). Aquesta auditoria hi afegeix
el tercer testimoni, que és el que demana la política de contingut abans de
donar per bona una resposta oficial.
