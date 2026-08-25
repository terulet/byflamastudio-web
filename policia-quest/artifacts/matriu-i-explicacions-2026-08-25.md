# Matriu de les 189 oficials i explicacions amb veritat jurídica temporal

**Data:** 25 d'agost de 2026 · **Branca:** `claude/new-session-34eyi7`
**Base:** `7b194f9` · **Deu commits**, del `a8f0a93` al `9d546d4`

---

## 1. Què s'ha fet i què no

Les 189 preguntes transcrites dels sis quadernets oficials tenien la resposta
del tribunal i la seva procedència, però el «per què» de la correcció deia que
el tribunal no publica el fonament i que aquesta app no l'inventa. Era cert i
era honest, però no ensenyava res justament on les preguntes són més reals.

Aquest bloc fa tres coses:

1. Aixeca una **matriu probatòria** de les 189: què se'n sap, què no, i amb
   quina cita literal de la còpia local.
2. Separa dues veritats que fins ara es confonien —la plantilla del tribunal i
   el dret vigent avui— i ensenya a l'app quina val per a què.
3. Escriu **120 explicacions** contra l'article concret, i deixa les altres 69
   amb el text de procedència perquè és el que se'n sap.

El que **no** s'ha fet, a propòsit: no s'ha tocat cap resposta oficial, cap
enunciat, cap opció ni cap ordre d'opcions; no s'han donat per verificades les
referències pendents; no s'han ampliat els 31 temes ni s'han tocat les quotes
dels simulacres; no s'ha relaxat cap validador; no s'ha mergejat res a `main`
ni s'ha obert cap PR.

---

## 2. La matriu: 189 decisions, una per pregunta

Viu a `content/municipalities/roses/questions/official-evidence-map.json` i es
llegeix amb `npm run content:matrix`, que escriu
`artifacts/matriu-oficials.{json,md}`.

| Estat | Preguntes | Què vol dir |
| --- | ---: | --- |
| `supported-current` | 116 | La plantilla quadra amb la norma i segueix bona avui. |
| `general-knowledge` | 33 | Cultura general no jurídica: cap norma la sosté ni l'ha de sostenir. |
| `historical-current-affairs` | 28 | Actualitat vàlida el dia de l'examen i només aquell dia. |
| `pending-evidence` | 8 | No hi ha prou evidència; `missing` diu què falta. |
| `official-key-conflicts-with-law-at-exam` | 2 | La plantilla no quadrava amb la norma que ja regia aquell dia. |
| `out-of-syllabus` | 2 | Demostrada, però cap dels 40 temes la cobreix. |

**Vigents per a l'aprenentatge d'avui: 118.**

La matriu **no** duplica les dades del banc —convocatòria, data, secció, número
original, tema, clau oficial—. Duplicar-les és crear una divergència. L'informe
les uneix.

### Tres coses que es confonien i que aquí van separades

Que una pregunta estigui assignada a un tema, que aquell tema tingui alguna
font verificada, i que aquella font demostri **aquesta** resposta són tres
afirmacions diferents. Fins ara la tercera s'inferia de les dues primeres.

---

## 3. Les dues discrepàncies, amb la data que ho decideix

Cap de les dues s'ha classificat per intuïció ni per un text consolidat sense
poder dir quina redacció regia el dia de l'examen.

### 3.1 Venedors ambulants — `q-of-roses-2025-interins-cp-036`

Examen d'interins del **16 d'abril de 2025**, pregunta 36. El tribunal va
marcar la **b)**: infracció greu, 750 €.

- L'annex de l'Ordenança de convivència de Roses, **text de 2019**, fila 11.2:
  «Col·laborar en l'espai públic amb els venedors ambulants no autoritzats. G 750».
- La **modificació aprovada el 24 de febrer de 2021**, publicada al BOP de
  Girona núm. 54 de **19 de març de 2021**, reescriu aquella fila: passa a
  **LL 500** i hi detalla les conductes.
- L'edicte d'aprovació definitiva diu que entra en vigor «transcorreguts 15
  dies hàbils» des de l'endemà de la publicació.

O sigui que el dia de l'examen la norma vigent feia **quatre anys** que era la
de 2021, i **cap de les quatre opcions no deia «lleu, 500 €»**.
`currentLawAnswer: 'cap'`.

La clau del tribunal es conserva i segueix puntuant en reproduir l'examen.

### 3.2 Consell de Política de Seguretat — `q-of-roses-2025-interins-cp-023`

El tribunal va marcar la **d)**. Les opcions a), b) i **d)** són totes tres,
literalment, competències de l'art. 48.2 de la LO 2/1986. La que **no** hi és
és la **c)**: proposar programes de formació i perfeccionament és de l'art.
49.1 i correspon al Comitè d'Experts. Cap dels dos articles s'ha modificat des
de 1986, de manera que la discrepància ja existia el dia de l'examen.
`currentLawAnswer: 'c'`.

---

## 4. Un sol lloc decideix, i tothom hi passa

`src/engines/official-evidence.ts` és un motor pur —el dia entra com a
paràmetre— que respon cinc coses alhora: si la pregunta es pot servir com a
material vigent, si compta per al domini, si pot generar repàs, quin avís
necessita la correcció, i quina lletra puntua i quina sosté la norma.

Hi passen la selecció de sessions, el constructor de quadernets, el càlcul de
domini, la cua de repàs, les dues pantalles de correcció i l'informe. Si cada
pantalla s'ho calculés pel seu compte, tard o d'hora en diria una altra.

La caducitat hi va inclosa a propòsit: si una pantalla mirés el veredicte i una
altra la data, cada una en diria una de diferent.

### Què queda fora, i què no

Una pregunta amb discrepància **no** entra a l'estudi vigent, ni al domini, ni
a la cua de repàs, ni a un quadernet puntuat. Fallar-la no vol dir res: qui
tria l'opció que sosté la norma no s'ha equivocat de dret.

Demanar **expressament** material d'examen oficial és una altra cosa —és
consultar història— i llavors sí que se serveix, per la mateixa porta que ja
obria l'actualitat dels quadernets antics. El que no pot passar és que es
serveixi en silenci: la correcció mostra les dues capes.

---

## 5. La correcció, capa per capa

Ordre a la pantalla, amb la pregunta dels venedors ambulants com a exemple:

1. Les opcions, marcades amb **«Plantilla del tribunal»**, **«Normativa
   verificada»** i **«La teva resposta»** en lloc d'un ✓ o una ✕ que hauria de
   dir dues coses oposades alhora.
2. El titular neutre: **«≠ No coincideix amb la plantilla del tribunal»**. Diu
   un fet respecte d'un document, no un judici sobre el dret.
3. La procedència: examen i data.
4. **Plantilla del tribunal: b)** · **Normativa verificada: cap de les quatre
   opcions.**
5. L'avís: la resposta publicada no coincideix amb la normativa vigent en la
   data de l'examen; es conserva perquè és el que va passar; la pregunta no
   compta per al domini ni entra a la cua de repàs.
6. El **per què**, escrit contra l'article.
7. **Deia el dia de l'examen** / **Diu avui** / **canvi efectiu: 2021-03-19**.
8. Les fonts: el quadernet i les tres cites de l'ordenança.

Captures: `artifacts/experiencia/31-conflicte-plantilla.png` (393 px) i
`32-conflicte-320.png` (320 px).

---

## 6. Les 120 explicacions

Cada una cita norma i article, hi porta el fragment literal que la sosté i
explica per què les altres opcions fallen quan es pot demostrar. Estan en
català i en castellà; la cita legal es queda en la llengua original de la
norma.

- **116** `supported-current`, **2** `out-of-syllabus` i **2** de les
  discrepàncies —aquestes dues expliquen les dues capes sense corregir la
  plantilla—.
- **136 citacions** a **117 localitzadors** de **26 normes**.
- Cada citació entra a la pregunta com a **referència pròpia**, amb el
  localitzador i la data en què es va contrastar contra la còpia local. Fins
  ara una pregunta oficial només citava el seu quadernet, i des del quadernet
  no s'arriba enlloc.

Les **69 restants** conserven el text de procedència: 33 de cultura general, 28
d'actualitat del dia de l'examen i les 8 pendents. Escriure'ls un fonament
seria inventar-lo.

---

## 7. El que segueix pendent, i per què

Les 8 preguntes en `pending-evidence` **segueixen pendents**. Cap s'ha convertit
en verificada.

| Pregunta | Què falta |
| --- | --- |
| `2025-interins-cp-020`, `2025-propietat-cp-019` | Instantània de text de les pàgines de l'Agència de Ciberseguretat de Catalunya (funcions i objectius), capturada amb navegador. |
| `2025-interins-cp-022` | Instantània de text de `www.roses.cat` (equipaments i serveis municipals), capturada amb navegador. |
| `2025-interins-cp-029`, `2026-interins-cp-029` | Text consolidat de la LO 6/1985 del poder judicial (arts. 65 i 82 i següents). |
| `2025-propietat-cg-005` | Font oficial que enumeri les 17 comunitats autònomes i les 2 ciutats autònomes. |
| `2025-propietat-cg-006` | Font oficial de divisió territorial (IDESCAT o el decret vigent de divisió comarcal). |
| `2026-interins-cp-031` | RD 920/2017 d'inspecció tècnica de vehicles (annex I, periodicitats). |

Les **21 referències** que depenen de `roses-web-municipi` i
`agencia-ciberseguretat-catalunya` també segueixen bloquejades, i
`q-roses-t04-102` no s'ha tornat a activar.

---

## 8. El rescatador de les dues fonts dinàmiques

`npm run sources:rescue` s'executa **a la màquina de qui té xarxa**, no aquí.
Surt de les dues portades que ja consten al manifest, navega dins del mateix
amfitrió seguint els enllaços que la pàgina porta —no inventa cap adreça—, i
deixa un paquet amb el text de cada pàgina, `index.json` i `SHA256SUMS.txt`. De
cada instantània desa el mètode, la data, l'adreça final, els caràcters útils i
el SHA-256.

La part que importa és el que **rebutja**, i `--self-check` la prova sense
xarxa contra les dues còpies que ja ens van enganyar el 24 d'agost:

```
✓ rebutjada  roses-web-municipi: prosa insuficient (119 car. fora d’enllaços de 55305 visibles)
✓ rebutjada  agencia-ciberseguretat-catalunya: la prosa no parla del que les referències pendents necessiten
```

La primera versió del filtre en deixava passar una. Mesurava el text visible, i
un menú prou llarg passa qualsevol llindar de mida: la portada de `roses.cat`
té 55.000 caràcters visibles i **119 de prosa** fora d'enllaços. La comprovació
també va ensenyar que la llista de termes hi barrejava paraules com «funcions»,
«incident» o «turisme», que qualsevol menú del ram porta. Un menú anomena un
tema; un document el desenvolupa.

Portar el paquet no verificarà res per si sol.

---

## 9. Les proves

`tests/unit/matriu-oficials.test.ts` — **26 proves**, totes amb el rellotge com
a paràmetre:

- Les 189 hi són; cada una té decisió i cap decisió sobra.
- El repartiment per estat és exactament el revisat.
- **L'empremta dels textos oficials no s'ha mogut.** Cobreix identificador,
  número original, clau, enunciat i les quatre opcions en ordre. Viu a
  `scripts/lib/official-seal.ts` perquè l'informe i el test la comparteixin: la
  tenien tots dos, cadascun amb la seva versió.
- Cap `supported-current` sense citació; cap citació sense fragment literal;
  cap citació recolzada en una de les dues descàrregues buides.
- Les 8 pendents diuen què els falta i cap porta explicació.
- Els dos casos de discrepància, amb les dates: la modificació de 2021 és
  anterior a l'examen de 2025; el cas del Consell no té `changedOn` perquè no
  hi ha hagut cap reforma.
- Triar la lletra que sosté la norma no genera repàs, i triar la del tribunal
  tampoc; una pregunta normal sí que en genera quan es falla.
- L'exclusió val per a tots els modes d'estudi, el filtre per tema i el
  constructor de quadernets; el filtre d'examen oficial la serveix i el
  veredicte avisa.
- Sense rellotge, el motor no filtra res per vigència: continua sent pur.
- Les 120 explicacions són bilingües, cap repeteix el text de procedència, i
  cada citació arriba al banc com a referència verificada.

`tests/e2e/flows.spec.ts` — un flux nou entra per on hi entraria qui estudia i
comprova les dues capes, la data del canvi, el titular neutre, l'absència de
promesa de repàs i que l'èmfasi es pinta en lloc de mostrar asteriscs.

`tests/content/content.test.ts` — la garantia de l'auditoria visual («l'avís ha
d'arribar a qui estudia») passa de vigilar una nota en prosa a exigir el judici
probatori amb la data del canvi.

`tests/unit/fonts-normatives.test.ts` — la regla que cap referència pot dir
«verificada» sense veredicte escrit **no s'ha tocat**; s'hi ha afegit el segon
registre on ara viuen aquests veredictes.

**Estat: 242 proves unitàries i 52 fluxos, en verd. Typecheck i build nets.**

---

## 10. Tres defectes que només va trobar mirar les captures

1. **Els asteriscs es veien.** Les lliçons i les explicacions marquen amb dos
   asteriscs la paraula que decideix la resposta, i hi havia un component que
   ho interpretava, però era privat de la pantalla de tema. A la correcció el
   text sortia amb els asteriscs i sense l'èmfasi: **125 marques** a lliçons i
   explicacions. `Emphasised` passa a `components/ui.tsx`.
2. **La resposta triada desapareixia.** En una pregunta amb discrepància, qui
   triava una opció que no era ni la del tribunal ni la de la norma es quedava
   sense cap marca.
3. **El mateix fet dit quatre vegades.** La nota en prosa que explicava el
   canvi de 2021 des de l'auditoria visual ara la repeteix el judici probatori,
   amb la data i la cita. La nota se'n va.

Suites de captures re-executades: `node scripts/smoke.mjs` i
`node scripts/audit-experiencia.mjs`, totes dues sense errors de consola, sense
404 i sense desbordament horitzontal a 393 px ni a 320 px.

---

## 11. Un defecte conegut que no s'ha tocat

`npm run sources:extract` només extreu text de 27 de les 99 fonts: necessita
`pdftotext` (poppler), que aquest entorn no té i no pot instal·lar sense xarxa.
La revisió d'aquest bloc s'ha fet amb PyMuPDF, obrint cada document. Consta
aquí perquè no es descobreixi dues vegades.

---

## 12. Els commits

| SHA | Què hi entra |
| --- | --- |
| `a8f0a93` | El vocabulari probatori als esquemes i el motor `official-evidence.ts`. |
| `bd42488` | Les 189 decisions i el muntatge que les enganxa al banc. |
| `3981fae` | `content:matrix`: la matriu es valida sola. |
| `42ba67a` | La interfície diu les dues coses; selecció, domini i repàs hi passen. |
| `fe512b3` | Les primeres 60 explicacions. |
| `5ca58e7` | Les 120 arriben a l'app, amb la norma enllaçada. |
| `47b525d` | Les 26 proves de la matriu i el segell compartit. |
| `12c5d79` | El flux d'extrem a extrem sobre la pregunta amb discrepància. |
| `520e94c` | Els tres defectes que van sortir mirant les captures. |
| `9d546d4` | El rescatador de les dues fonts dinàmiques. |

Cap toca `main`. Cap reescriu història.
