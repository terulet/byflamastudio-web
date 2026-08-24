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
- **Els 24 exàmens històrics** (2016–2024) estan adoptats i registrats amb la
  seva URL i data reals, però **pendents de transcriure**. La nota de cada un
  diu si la marca de resposta és llegible al document; sis no en tenen cap de
  clara al text i exigeixen revisió visual pregunta per pregunta.
- **Els temes 35 i 36** estan escrits sobre l'articulat real de les ordenances
  de circulació i de convivència, amb la modificació de 2021 consolidada i
  referències amb article i pàgina del PDF.
- **43 de les 79 fonts continuen pendents**: són les normes generals (BOE,
  Portal Jurídic) que aquest paquet no incloïa. Les seves referències segueixen
  en `pending-source-verification`.
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
  veritat en lloc de vestir la procedència d'explicació.
- **La constància es diu pel seu nom i no amaga cap dia.** La ratxa continua
  exigint l'objectiu diari sencer, però ara es diu «Ratxa d'objectius», i al
  costat hi ha «Dies estudiats», que compta dies amb alguna resposta i no es
  trenca mai. Un dia d'estudi parcial no fa ratxa i abans no es veia enlloc.
  La regla de no castigar es manté: cap de les dues bloqueja res, i els
  assoliments no canvien. La distinció viu a `src/engines/activity.ts` i té
  test unitari i d'extrem a extrem.

La feina que queda, en aquest ordre:

1. Renovar el paquet d'actualitat abans que caduqui. El 2027-03-01 el banc
   baixa de deu preguntes vigents i el simulacre de cultura general es tanca
   sol; no és una avaria, però tampoc s'arregla sol. El procediment és a la
   capçalera de `content/.../current-affairs/index.ts`, i el camí offline
   —instantànies amb hash— és el que ja s'ha fet servir dues vegades. No
   s'allarga cap `reviewBy` per guanyar temps: una data allargada és una
   afirmació que ningú ha comprovat.
2. Aconseguir les 43 fonts generals pendents. L'inventari complet és a
   `artifacts/rescat-fonts-normatives.{json,md}` (`npm run sources:inventory`):
   de cada font hi ha la norma exacta, els articles que el banc cita, què ha de
   demostrar cada referència, qui la consumeix i la prioritat. El JSON porta
   nom de fitxer, URL, MIME i comprovacions mínimes per muntar el paquet
   offline, com els dos anteriors. Després, contrastar-hi les referències que
   segueixen sense verificar. Quan hi siguin, el primer contingut a escriure
   són les explicacions reals de les 189 preguntes oficials, contra l'article
   concret de cada font: és on la correcció ensenya menys precisament on les
   preguntes són més reals, escrites tema a tema seguint la classificació
   d'`official-topic-map.json`.
3. Transcriure els 24 exàmens històrics. Els sis sense marca llegible al text
   exigeixen revisió visual; no se'n pot deduir cap resposta per densitat de
   tinta, freqüència ni coneixement general.
