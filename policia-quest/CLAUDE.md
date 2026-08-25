# Regles del projecte Policia Quest

Instruccions per a qualsevol persona o agent que continuï aquest projecte.
Aquestes regles no són preferències d'estil: trencar-ne una fa mal al producte.

---

## 1. Regles de contingut (les més importants)

1. **Res sense font.** Cap pregunta activa sense una `SourceReference`
   resoluble a una font del manifest, amb article o pàgina concreta. Si no la
   pots citar, la pregunta es queda en `draft`.

2. **No inventis dret.** No redactis un article de memòria donant-lo per bo.
   Si no pots contrastar la redacció vigent, escriu el contingut al nivell que
   sí que domines (estructura, criteris, principis) i deixa constància del que
   cal comprovar.

3. **No inventis URL.** Una font ha de tenir una adreça que existeixi de debò.
   Si no coneixes la directa, apunta a l'índex oficial que sí que existeix i
   escriu-ho a `note`. Una URL deduïda que dona 404 és pitjor que cap URL.

4. **No toquis una resposta oficial.** El que va publicar el tribunal es
   conserva tal com es va publicar. Si ha quedat obsolet, marca l'examen o la
   pregunta i afegeix-hi una nota; no en canviïs la resposta.

5. **Els exàmens oficials es transcriuen, no es generen.** Si el quadernet no
   és accessible, es registra com a pendent amb el motiu. Mai s'omple amb
   contingut plausible.

6. **L'actualitat no és contingut permanent.** Sempre `dynamic: true` amb
   `reviewBy`, sempre dins un paquet versionat amb data de caducitat.

7. **Els enunciats van en català.** És la llengua de l'examen. Les explicacions
   i la interfície es tradueixen; els enunciats no.

8. **Un simulacre reprodueix la prova o no s'ofereix.** Si les bases fixen una
   composició, el banc l'ha de poder cobrir quota per quota. Vint preguntes de
   cultura general no són la prova de cultura general de Roses, que en són 10 i
   10 d'actualitat. Si no es pot muntar, es bloqueja i es diu què falta; mai
   s'omple una quota amb preguntes d'una altra.

9. **Si quantitat i rigor xoquen, guanya el rigor.** Deixa el dèficit visible a
   l'informe de cobertura i explica'n la causa. No omplis el banc amb preguntes
   dubtoses per arribar a una xifra.

---

## 2. Regles de codi

1. **`npm run check` ha de passar.** Tipus, contingut, tests i build. No es
   dona per acabada cap feina amb això vermell.

2. **Aritmètica exacta on importa.** Notes i domini es calculen amb enters.
   Si escrius `0.1 + 0.2` en un càlcul de puntuació, ho estàs fent malament.

3. **Els motors són purs.** `src/engines/` no importa React, no toca disc i no
   crida `Date.now()` per dins: el dia i l'instant entren com a paràmetre. Això
   és el que els fa provables.

4. **El contingut no sap res de la interfície i a l'inrevés.** `content/` no
   importa de `src/screens/`; `src/` no conté articles de lleis.

5. **Els tipus surten dels esquemes.** Zod és la font única. No declaris a mà
   un tipus que ja existeix a `content/schemas/`.

6. **Migra en llegir, no en escriure.** Tota lectura de progrés passa per
   `migrations.ts`. Les migracions són idempotents i additives.

7. **Actualitzar contingut no pot esborrar progrés.** Mai. Si una pregunta
   desapareix del banc, el seu estat de repàs es queda al magatzem.

8. **No afegeixis dependències sense justificar-ho** a `ARCHITECTURE.md`. Cada
   una es paga en pes de descàrrega i en manteniment.

---

## 3. Regles de producte

1. **Local-first i privat.** Sense compte, sense servidor, sense traçadors,
   sense telemetria. Si algú proposa "només una mètrica", la resposta és no.

2. **Sense IA en temps d'execució.** El contingut es genera i es revisa abans;
   l'app no crida cap model.

3. **Dos tocs fins a estudiar.** Des de la pantalla d'inici, començar una
   sessió útil no pot costar més de dos tocs.

4. **No enganyis amb els números.** Un domini amb menys de 3 respostes no
   mostra percentatge. Una exactitud sobre quatre preguntes no és una
   exactitud. El simulacre complet no mostra cap nota sumada sobre 40, perquè
   no és una mitjana. Si la dada no és fiable, digues-ho.

5. **La correcció ensenya.** No n'hi ha prou amb "correcte/incorrecte": cal dir
   per què la bona és bona, per què fallen les altres i on ho pot comprovar qui
   estudia.

6. **No castiguis.** "No ho sé" és una resposta honesta i es penalitza menys que
   fallar. Perdre una ratxa no bloqueja res. Sense rànquings falsos ni rivals
   inventats.

7. **Cap element oficial.** Ni escut de l'Ajuntament, ni emblemes policials
   protegits, ni res que pugui fer pensar que l'app és oficial. L'avís
   d'aplicació independent ha de ser visible.

---

## 4. Regles d'accessibilitat

1. La correcció **mai** es comunica només amb color: sempre símbol i text.
2. Àrees tàctils de 44 px com a mínim.
3. Focus visible a tot arreu.
4. `prefers-reduced-motion` respectat, i a més amb interruptor propi.
5. Els enunciats porten `lang="ca"` encara que la interfície estigui en castellà.
6. Cap pantalla pot desbordar horitzontalment a 320 px d'amplada.
7. **Contrast 4,5:1 sobre la superfície pitjor.** Els valors de `tokens.css`
   estan mesurats. Si en canvies un, torna a passar `npm run test:a11y`.
8. `aria-label` només on el rol el permet. Un `div` sense rol no pot portar-ne:
   posa-hi el rol que descrigui de debò l'element (`img`, `progressbar`, `group`).

---

## 5. Abans de donar per acabada una feina

```bash
npm run check              # tipus + contingut + tests + build
npm run test:e2e           # fluxos complets sobre el build, auditoria axe inclosa
npm run content:report     # informe de cobertura i SOURCES.md
node scripts/smoke.mjs     # captures reals i detecció d'errors de consola
```

I després **mira les captures**. No les generis només per complir: si hi ha un
defecte visible, corregeix-lo abans de tancar.

---

## 6. Estat conegut d'aquesta versió

Aquesta versió es va muntar amb dos paquets de documents que va portar qui la
demana, perquè l'entorn de construcció no arriba a cap font: el 23 d'agost de
2026, 36 documents oficials (2 bases, 30 quadernets d'examen i 4 textos
d'ordenances); el 24, 19 instantànies textuals de pàgines d'actualitat. Tots dos
verificats pel seu SHA-256, document a document.

- **Els sis exàmens de 2025 i 2026 estan importats**: 189 preguntes amb la
  resposta que hi va marcar el tribunal, mai deduïda, i **auditades visualment
  una a una** contra el PDF renderitzat (`artifacts/auditoria-visual-p0.md`):
  189/189 coincideixen. L'auditoria va trobar una resposta oficial que ja no
  reflecteix el dret vigent; es conserva tal com es va publicar i porta una nota
  visible a l'app.
- **Els 24 exàmens històrics** (2016–2024) estan transcrits: 630 preguntes
  noves, amb la resposta que hi va marcar el tribunal —mai deduïda— i
  classificades per tema amb la mateixa disciplina editorial que les 189
  vigents (`official-topic-map.json`, un motiu per decisió). 22 quadernets
  són `imported` i 2 `partial`, amb una nota que diu quina marca fa servir
  el document i, si escau, quina pregunta no s'importa i per què. Només dues
  preguntes de 821 queden sense clau: una porta dos asteriscos reals al PDF
  —ambigüitat pròpia del document, no de l'extractor— i l'altra diu
  literalment «pregunta anul·lada» al seu propi enunciat; totes dues
  s'importen igualment en `draft`, mai s'omplen amb una resposta plausible.
  Sense evidència pròpia —la matriu i les explicacions són feina posterior i
  deliberadament separada—, aquestes 630 no compten per al domini ni surten
  a l'entrenament normal, però es poden consultar quadernet a quadernet com
  a material d'examen oficial històric.
- **Els temes 35 i 36** estan escrits sobre l'articulat real de les ordenances
  de circulació i de convivència, amb la modificació de 2021 consolidada i
  referències amb article i pàgina del PDF.
- **Les 98 fonts del manifest tenen còpia local.** Les 43 normes generals que
  faltaven —BOE, Portal Jurídic, DOUE, Nacions Unides— es van adoptar el 24
  d'agost de 2026 des d'un tercer paquet portat a mà, amb el SHA-256 comprovat
  43/43 contra el `SHA256SUMS.txt` del paquet, contra el manifest i contra el
  fitxer que ha quedat a `sources/cache/`.
- **Les 313 referències que en depenien s'han revisat una a una**, llegint el
  document i buscant-hi la proposició que cada localitzador afirma. 287 han
  passat a `verified` i **26 es queden pendents amb el motiu escrit**. El
  veredicte i el fragment que el sosté viuen a
  `content/.../adopcio-normativa-2026-08-24.json`, i
  `tests/unit/fonts-normatives.test.ts` impedeix que aquell fitxer i el
  contingut se separin: cap referència pot dir `verified` sense veredicte que ho
  aguanti. L'informe complet és a
  `artifacts/adopcio-fonts-normatives-2026-08-24.md`.
- **Dues de les 43 descàrregues no porten el document**: `roses-web-municipi` i
  `agencia-ciberseguretat-catalunya` són esquelets de navegació (6 i 8 kB de
  text net, tot menús) perquè el cos de la pàgina es carrega per JavaScript. Va
  ser un error de l'inventari: la comprovació mínima era `mustContain: ['Roses']`
  i el menú la passa. Les 21 referències que en depenen segueixen pendents i cal
  una instantània de text de les pàgines concretes, com al paquet d'actualitat.
- **Tenir el document no verifica la cita, i el codi ho tracta així.** El SHA-256
  demostra que el fitxer és el que el paquet diu; no demostra que la redacció
  sigui la vigent avui, cosa que des d'aquí no es pot confirmar. La revisió va
  trobar set coses que calia corregir al banc —una opció que afirmava més del que
  cap font diu, dues referències que apuntaven a l'article equivocat, dues que
  necessitaven una font més, vuit localitzadors conceptuals i una pregunta de
  cultura general retirada a `draft` perquè la seva pròpia explicació la
  contradeia— i totes estan documentades a l'informe. Cap resposta oficial s'ha
  tocat.
- **El baixador ja no es fia de la redirecció.** `sources:download` baixava amb
  `redirect: 'follow'` i desava el que tornés, fos qui fos, i li posava un
  SHA-256 al manifest: aquell hash demostra que la còpia no ha canviat des que
  es va baixar, no que vingui de qui hauria de venir. Ara comprova l'amfitrió
  final contra `scripts/lib/official-hosts.ts` —una taula que surt de les
  redireccions que van passar de debò, no d'endevinar— i, si no hi és, deixa la
  font pendent amb el motiu. De passada es tanca el forat que va fer fallar cinc
  normes catalanes: el Portal Jurídic serveix els PDF des de
  `portaldogc.gencat.cat`. L'inventari publica la llista sencera d'amfitrions
  oficials (`allowedOfficialHosts`) perquè qui munti el proper paquet no l'hagi
  de mantenir a mà.
- **El paquet d'actualitat té 25 preguntes vigents**, adoptades el 24 d'agost de
  2026 des de 19 instantànies textuals segellades amb SHA-256 que va portar el
  paquet de candidats. Cap ve de la xarxa: l'entorn continua sense arribar a cap
  font. Cada resposta té escrit, a
  `content/.../current-affairs/adoption-2026-08.json`, quin fitxer de
  `sources/cache/` la sosté i quin fragment literal d'aquell fitxer la demostra;
  un test ho torna a comprovar hash a hash. Onze porten l'enunciat o
  l'explicació **retallats** respecte del candidat original, perquè afirmaven
  coses que la instantània no diu; el detall és a
  `artifacts/actualitat-decisio-2026-08-24.md`.
- **Per això el simulacre de cultura general i el complet estan oberts**, i el
  quadernet surt 10+10 com fixen les bases. No s'ha tocat cap motor per obrir-lo:
  el validador els bloquejava perquè el banc no podia cobrir la quota d'actualitat
  i els va deixar passar sol quan la va poder cobrir. Amb el calendari de
  caducitats d'aquest paquet, el 2027-03-01 en quedaran nou i es tornaran a
  bloquejar sols; hi ha tests i una captura (`artifacts/actualitat/caducat-*.png`)
  que ho comproven avançant només el rellotge.
- **La porta de l'actualitat continua tancada amb clau i provada.** El validador
  refusa qualsevol pregunta etiquetada `actualitat` que no caduqui amb data, no
  visqui dins un paquet, no citi una font `verified` amb data de publicació, o
  vingui d'un examen antic. Les preguntes d'actualitat dels exàmens antics **no**
  compten: són material històric i s'importen amb `reviewBy` a la data de
  l'examen perquè `isCurrent()` les deixi fora.
- **Les 189 preguntes oficials estan classificades per tema, una a una.** La
  classificació és **editorial** —el tribunal no etiqueta les preguntes— i viu a
  `content/.../questions/official-topic-map.json`, amb el motiu de cada decisió,
  revisada contra l'àmbit publicat de cada tema: 132 assignades a 36 temes i 57
  al contenidor perquè cap tema les cobreix (cultura general, actualitat del dia
  de l'examen, matèria fora de temari; el detall és a
  `artifacts/classificacio-oficials.md`, generat del mateix mapa). El generador
  falla si una pregunta es queda sense decisió, un test fixa la coherència
  mapa ↔ banc, i el filtre «D'examen oficial» d'Entrenar ara respecta els temes.
  El domini per tema només compta preguntes vigents: les de cultura general
  caducades no el deprimeixen. De passada, la revisió va trobar que els sis
  quadernets arrossegaven el text de bases posterior a l'última opció de la
  darrera pregunta enganxat a l'opció d); s'ha corregit a l'extractor i les sis
  opcions han quedat exactament com al PDF (claus i enunciats intactes).
- **L'experiència d'estudi està auditada de cap a cua**
  (`artifacts/auditoria-experiencia-estudi.md`): el recorregut de dos dies
  d'una estudiant real —lliçó, error, «no ho sé», repàs de l'endemà, simulacre,
  progrés— es repeteix amb `node scripts/audit-experiencia.mjs` i deixa
  captures a `artifacts/experiencia/`. L'auditoria va corregir cinc coses: la
  confiança ara es desa tal com es declara (i «segur però incorrecte» ja pot
  existir, amb un test determinista que ho fixa), el domini «global» ensenya el
  denominador, el resum de sessió diu què passa amb els errors i ofereix
  repassar-los, el filtre «D'examen oficial» entrena el banc oficial (abans no
  podia servir mai res), i el «per què» de les 189 preguntes oficials diu la
  veritat en lloc de vestir la procedència d'explicació. (Aquell «per què» ara
  només es queda a les 69 que no es poden demostrar: vegeu el punt de la matriu
  més avall.)
- **La constància es diu pel seu nom i no amaga cap dia.** La ratxa continua
  exigint l'objectiu diari sencer, però ara es diu «Ratxa d'objectius», i al
  costat hi ha «Dies estudiats», que compta dies amb alguna resposta i no es
  trenca mai. Un dia d'estudi parcial no fa ratxa i abans no es veia enlloc.
  La regla de no castigar es manté: cap de les dues bloqueja res, i els
  assoliments no canvien. La distinció viu a `src/engines/activity.ts` i té
  test unitari i d'extrem a extrem.

- **Les 189 oficials tenen matriu probatòria i 120 tenen explicació de debò.**
  `content/.../questions/official-evidence-map.json` diu, pregunta a pregunta,
  què se'n sap i amb quina cita literal de la còpia local: 116 amb la plantilla
  demostrada i vigent, 33 de cultura general, 28 d'actualitat del dia de
  l'examen, 8 pendents amb el motiu escrit, 2 fora de temari i **2 on la
  plantilla del tribunal i la norma no coincideixen**. Cent vint porten
  explicació escrita contra l'article, en català i castellà, i arrosseguen la
  norma citada com a referència pròpia: 136 citacions a 117 localitzadors de 26
  normes. Les altres 69 conserven el text de procedència, perquè escriure'ls un
  fonament seria inventar-lo. `npm run content:matrix` uneix mapa i banc i
  falla si algú els separa; `tests/unit/matriu-oficials.test.ts` ho torna a
  comprovar amb 26 proves, l'empremta dels textos oficials inclosa.
- **La plantilla del tribunal i el dret vigent són dues veritats i l'app diu les
  dues.** `src/engines/official-evidence.ts` és l'únic lloc que ho decideix, amb
  el dia com a paràmetre: si la pregunta es pot servir com a material vigent, si
  compta per al domini, si pot generar repàs, quin avís necessita la correcció i
  quina lletra puntua. Hi passen la selecció, els simulacres, el domini, la cua
  de repàs, les dues correccions i l'informe. Una pregunta amb discrepància no
  entra a l'estudi vigent, ni al domini, ni al repàs, ni a un quadernet puntuat;
  demanar expressament material d'examen oficial sí que la serveix —és consultar
  història— i llavors la correcció ensenya les dues capes en lloc d'un ✓ o una
  ✕ que hauria de dir dues coses oposades alhora. El detall dels dos casos, amb
  les dates que ho decideixen, és a
  `artifacts/matriu-i-explicacions-2026-08-25.md`.
- **Les dues fonts dinàmiques tenen rescatador, però encara no document.**
  `npm run sources:rescue` s'executa a la màquina de qui té xarxa, surt de les
  dues portades que ja consten al manifest i deixa un paquet segellat amb
  mètode, data, adreça final, caràcters útils i SHA-256 de cada instantània.
  `--self-check` prova sense xarxa que rebutja les dues còpies que ja ens van
  enganyar: mesura la **prosa** —el text que no és dins d'un enllaç— i no la
  mida del fitxer, perquè la portada de roses.cat té 55.000 caràcters visibles
  i 119 de prosa. Les 21 referències que en depenen i les dues preguntes
  oficials de ciberseguretat segueixen bloquejades.

La feina que queda, en aquest ordre:

1. Renovar el paquet d'actualitat abans que caduqui. El 2027-03-01 el banc
   baixa de deu preguntes vigents i el simulacre de cultura general es tanca
   sol; no és una avaria, però tampoc s'arregla sol. El procediment és a la
   capçalera de `content/.../current-affairs/index.ts`, i el camí offline
   —instantànies amb hash— és el que ja s'ha fet servir dues vegades. No
   s'allarga cap `reviewBy` per guanyar temps: una data allargada és una
   afirmació que ningú ha comprovat.
2. Tancar les 26 referències pendents i, amb elles, les 8 preguntes oficials
   que encara no es poden explicar. Cadascuna diu què li falta: dues
   instantànies de pàgines que es munten amb JavaScript —per a això hi ha
   `npm run sources:rescue`—, la Llei 10/2007 de l'Institut de Seguretat
   Pública, el Decret legislatiu 2/2008 de protecció dels animals, la LO 6/1985
   del poder judicial, el RD 920/2017 d'inspecció tècnica de vehicles i tres
   dades de cultura general que cap norma enumera. La taula de què falta per a
   cada una és a la secció 7 d'
   `artifacts/adopcio-fonts-normatives-2026-08-24.md` i a la secció 7 d'
   `artifacts/matriu-i-explicacions-2026-08-25.md`. Cap es dona per verificada
   fins que algú obri el document i hi busqui la proposició concreta.
3. Construir la matriu probatòria i les explicacions de les 630 preguntes
   històriques, amb el mateix rigor que les 189 vigents (citació literal
   contra la còpia local, mai una explicació inventada). Fins que això no
   passi, es queden en `pending-evidence`: no compten per al domini ni surten
   a l'entrenament normal, encara que ja es puguin consultar quadernet a
   quadernet com a material d'examen oficial històric.
