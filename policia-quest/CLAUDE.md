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

8. **Si quantitat i rigor xoquen, guanya el rigor.** Deixa el dèficit visible a
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
   exactitud. Si la dada no és fiable, digues-ho.

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

---

## 5. Abans de donar per acabada una feina

```bash
npm run check              # tipus + contingut + tests + build
npm run test:e2e           # fluxos complets sobre el build
npm run content:report     # informe de cobertura i SOURCES.md
node scripts/smoke.mjs     # captures reals i detecció d'errors de consola
```

I després **mira les captures**. No les generis només per complir: si hi ha un
defecte visible, corregeix-lo abans de tancar.

---

## 6. Estat conegut d'aquesta versió

L'entorn de construcció tenia la sortida de xarxa restringida i no va poder
baixar cap font oficial. Això vol dir que:

- Els 30 exàmens registrats estan **pendents d'importar**.
- Totes les referències són **`pending-source-verification`**.
- El paquet d'actualitat és **buit a propòsit**.

La primera feina de qui continuï, en aquest ordre:

1. `npm run sources:download` des d'una xarxa amb accés a `roses.cat`,
   `ssl4.ddgi.cat`, `boe.es` i `portaljuridic.gencat.cat`.
2. Contrastar les referències i passar-les a `verified`.
3. Importar i revisar els quatre exàmens P0.
4. Llegir les ordenances de Roses i completar els temes 35 i 36 amb l'articulat
   real.
5. Omplir el paquet d'actualitat.
