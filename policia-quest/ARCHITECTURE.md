# Arquitectura

Decisions tècniques de Policia Quest, les fórmules exactes dels motors i els
límits deliberats d'aquesta fase.

---

## 1. Principis

1. **Local-first.** Tot passa al dispositiu. No hi ha servidor, ni compte, ni
   telemetria. El progrés és de qui estudia i se'n pot endur una còpia.
2. **Contingut separat del codi.** `content/` no sap res de React; `src/` no
   conté cap article de cap llei. Afegir un municipi és afegir un directori.
3. **Res sense font.** Cap pregunta activa pot existir sense una referència a
   una font registrada. La validació ho imposa i el build hi falla.
4. **Aritmètica exacta on importa.** Les notes i el domini es calculen amb
   enters, mai amb decimals intermedis.
5. **Honestedat a la interfície.** Si una dada no és fiable, l'app ho diu: un
   domini amb poques respostes no mostra percentatge, i una referència no
   contrastada porta avís.

---

## 2. Pila tècnica i per què

| Peça | Elecció | Motiu |
| --- | --- | --- |
| Interfície | React 19 | Model mental conegut, sense cap framework damunt |
| Tipus | TypeScript estricte | `strict`, `noUncheckedIndexedAccess`, `erasableSyntaxOnly` |
| Empaquetat | Vite 8 | Build ràpid, PWA de primera classe |
| Esquemes | Zod 4 | Una definició genera el validador **i** el tipus; no es dupliquen a mà |
| Base de dades | IndexedDB via `idb` | Volum de dades i transaccions; `idb` són poques línies i evita el callback hell |
| PWA | `vite-plugin-pwa` (Workbox) | Precàrrega generada del build; no cal mantenir el service worker a mà |
| Encaminador | Propi, ~60 línies | Cinc destinacions i funcionament offline; una dependència no compensa |
| Estils | CSS pla amb variables | Cap runtime, tema clar i fosc amb un atribut, càrrega mínima |
| Tests | Vitest + Playwright | Unitaris ràpids i fluxos reals sobre el build de producció |

No hi ha framework visual (Tailwind, MUI…) perquè el sistema de disseny cap en
un fitxer de tokens i un d'estils, i qualsevol d'aquests hauria pesat més que
tot el CSS del projecte.

---

## 3. Capes

```
content/schemas ──► content/municipalities/roses ──► src/content ──► src/app/store
                                │                                        │
                                ▼                                        ▼
                          scripts/ (factory)                        src/screens
                                                                         │
                    src/engines (purs) ◄─────────────────────────────────┤
                    src/persistence (IndexedDB) ◄────────────────────────┘
```

- **`src/engines/`** és codi pur: entra dades, surten dades. Cap import de React,
  cap accés a disc, cap `Date.now()` amagat. Per això es pot provar del tot.
- **`src/persistence/`** és l'única capa que toca IndexedDB i `localStorage`.
- **`src/app/store.tsx`** connecta les dues i exposa accions a les pantalles.

### Repartiment del contingut

`content/municipalities/roses/pack-core.ts` conté tot allò que l'app necessita
d'entrada. Les microlliçons van a part (`lessons/`) i es carreguen amb un
`import()` dinàmic en obrir un tema: pesen ~200 kB i només calen en una
pantalla. Això treu prop del 40 % del paquet inicial.

`content/municipalities/roses/index.ts` sí que ho ajunta tot: el fan servir els
scripts i els tests, que han de veure el paquet sencer.

---

## 4. Motor de puntuació

Fitxer: `src/engines/scoring.ts`.

Tots els càlculs són en **mil·lipunts** (enters). Mai hi ha un decimal
intermedi. `0,25` punts de penalització són `250`.

Regles de la convocatòria de Roses, codificades a `content/.../exams.ts`:

| | Cultura general | Coneixements professionals |
| --- | --- | --- |
| Preguntes | 20 | 40 |
| Durada | 20 min | 60 min |
| Encert | `+1000` | `+500` |
| Error | `−250` | `−125` |
| En blanc | `0` | `0` |
| Sobre | `20000` | `20000` |
| Apte | `≥ 10000` | `≥ 10000` |
| Reserva | 1 | 2 |

### Simulacre complet

El simulacre complet no és un plànol nou sinó una **composició** dels dos que ja
hi ha (`ExamComposition` a `content/.../exams.ts`). Un intent es modela amb
**seccions**: cada secció porta el seu plànol, el seu nombre de preguntes, la
seva durada i el temps consumit propi.

Conseqüències, totes buscades:

- El temporitzador de coneixements professionals no comença fins que acaba el
  de cultura general.
- Tancar la primera prova és irreversible, com el dia de l'examen; la
  interfície ho avisa abans.
- Cada prova es puntua amb les seves regles i el veredicte exigeix **aprovar
  totes dues per separat**: no es fa mitjana.
- El resultat no mostra cap suma sobre 40. Sumar 20 + 20 convidaria a llegir-ho
  com una nota mitjana, que és exactament el que no és.
- Cap pregunta pot sortir a les dues proves del mateix quadernet
  (`buildExamPaper` accepta exclusions).

Els intents anteriors a aquesta funció no tenien seccions: `migrateExamAttempt`
els en deriva una de sola, de manera que un simulacre a mitges d'abans es pot
reprendre igualment.

### Un simulacre és vàlid quan reprodueix la prova, no quan hi caben les preguntes

Fitxer: `src/engines/availability.ts`.

Les bases fixen la composició de la prova de cultura general: 10 preguntes de
cultura general i 10 d'actualitat social, cultural i política. Un banc amb 22
preguntes de cultura general i cap d'actualitat **no pot muntar aquesta prova**,
per molt que 22 sigui més gran que 20. Muntar-ne vint de cultura general seria
ensenyar un format fals i donar una nota que no prediu res.

`examAvailability(pool, blueprint, today)` és l'única resposta a «es pot muntar
aquesta prova, avui?», i la fan servir tres llocs que han de coincidir sempre:
la validació de contingut, l'informe de cobertura i la pantalla de simulacres.

Tres propietats que no són accidentals:

- **Cada quota es compta a part.** Sobrar-ne d'una no compensa que en falti
  d'una altra: el tribunal no les intercanvia.
- **Es mesura contra el dia d'avui.** El contingut dinàmic porta `reviewBy` i
  deixa de comptar quan caduca. Una prova que avui es pot muntar pot deixar de
  poder-se muntar d'aquí a tres mesos sense que ningú toqui una línia. Això vol
  dir que el build falla quan el paquet d'actualitat caduca, que és exactament
  la pressió que ha de rebre el contingut que caduca.
- **El dèficit no es pot amagar ni quedar enganxat.** El plànol declara el seu
  estat amb `contentStatus`, i la validació ho comprova en tots dos sentits: un
  plànol que no es pot muntar sense declarar-ho trenca el build, i un plànol
  declarat bloquejat que ja es podria muntar també. Va passar: el dia que es va
  adoptar el paquet d'actualitat, el build va fallar demanant que es tragués el
  marcador de bloqueig del simulacre de cultura general.

Quan un plànol es bloqueja, es bloqueja a tot arreu: el botó de la llista, el
simulacre complet que el conté i l'enllaç directe a `#/exam/<id>`. La pantalla
diu quina quota falta i quantes preguntes hi ha, i ofereix el mode d'entrenament
perquè les preguntes que sí que hi ha segueixin sent útils.

### Exàmens oficials importats

Els quadernets de Roses no fan servir un sol conveni per marcar la resposta del
tribunal, i descobrir-ho va ser la meitat de la feina:

| Convocatòria | Com marca la resposta |
| --- | --- |
| La majoria (2016–2018, 2021–2026) | Asterisc al final de l'opció |
| 2019 (interins i propietat) | L'opció **acolorida** en blau |
| 2024 interins, professionals | **Negreta sintètica**: el mateix text dibuixat dues vegades, una d'omplerta i una de resseguida |

Cap dels tres es dedueix: `scripts/transcription/extract_exam.py` llegeix el
senyal real del PDF. El color només compta si és **cromàtic** i minoritari —els
documents barregen negre pur amb grisos quasi negres que no marquen res— i el
traç només compta si és **selectiu**: en un document on el 94 % del text va
resseguit, resseguir no vol dir res.

Una pregunta sense exactament una marca s'importa **sense clau**, mai amb una
resposta inferida. La densitat de tinta discrimina prou bé la negreta però és
una heurística, i per això es fa servir per decidir què cal mirar amb els ulls,
mai per fixar una resposta.

El tema `roses-examen-oficial` és un **contenidor**, no un tema del temari: el
tribunal no etiqueta les preguntes per tema i assignar-los-en un seria afirmar
el que el quadernet no diu. No surt a la ruta dels 40 temes ni compta per al
domini per tema.

Les preguntes de **cultura general** dels quadernets s'importen amb
`dynamic: true` i `reviewBy` igual a la data de l'examen. Com que aquesta data
ja ha passat, `isCurrent()` les deixa fora dels simulacres i de la quota
d'actualitat: mig examen de cultura general són preguntes com «qui és l'actual
ministre/a de Defensa?», certes el dia de la prova i falses avui. Segueixen
consultables com a material històric, amb la seva data.

### Preguntes de reserva

El quadernet real porta preguntes de reserva al final —una a cultura general,
dues a coneixements professionals— i el simulacre les reprodueix:

- `buildExamPaper` munta `questionCount + reserveCount` preguntes i deixa les de
  reserva **a la cua**, sense barrejar-les amb el cos. Així el motor de
  puntuació pot tallar per índex sense marcar pregunta per pregunta.
- Si el banc no dona per a tot, el primer que se sacrifica és la reserva: el cos
  de la prova té prioritat sobre unes preguntes que ni tan sols compten.
- La interfície les numera a part (`R1`, `R2`), les anuncia amb un avís i les
  compta al seu propi comptador; el `1/40` de la barra superior es refereix
  sempre al cos.
- `ExamSection.reserveCount` diu quantes de les últimes de la secció ho són.
  `scoreExam` les rep amb `reserve: true` i les deixa fora del càlcul.
- Com que els comptadors d'encerts, errors i blancs deixen de sumar el total del
  quadernet, el resultat ho diu explícitament en comptes de deixar-ho a l'aire.

Les preguntes de reserva i les **anul·lades** pel tribunal es compten a part i no
entren al càlcul. El resultat net pot ser negatiu; es mostra amb terra a 0 però
l'aprovat es mesura sobre el net real.

La validació de contingut comprova que `preguntes × punts_per_encert` doni
exactament la nota màxima declarada, de manera que un plànol incoherent no pot
arribar a producció.

---

## 5. Motor de repetició espaiada

Fitxer: `src/engines/srs.ts`.

No és un SM-2. Per a un temari tancat d'oposició, una escala fixa amb regressió
per error és més previsible, més fàcil d'explicar i molt més fàcil de provar.

**Escala d'intervals (dies):** `[1, 3, 7, 14, 30, 60]`, indexada per
`intervalStep`.

**Transicions:**

| Resultat | Efecte sobre `intervalStep` | Altres efectes |
| --- | --- | --- |
| `correct-sure` | `+1` (topa al màxim) | `streak +1` |
| `correct-unsure` | `1` si era `0`; si no, es queda igual | `streak +1` |
| `wrong` | `max(0, step − 2)` | `lapses +1`, `streak = 0` |
| `dont-know` | `max(0, step − 1)` | `lapses +1`, `streak = 0` |

Dues decisions deliberades:

- **Encertar amb dubtes no val el mateix que encertar amb seguretat.** Consolida
  però no accelera.
- **"No ho sé" penalitza menys que fallar.** És un error d'aprenentatge honest;
  castigar-lo igual empeny a endevinar.

**Fase resultant:**

```
step === 0                                  → learning
1 ≤ step ≤ 3                                → review
step ≥ 4 i streak ≥ 2 i la resposta         → mastered
  no ha estat un error
step ≥ 4 en qualsevol altre cas             → review
```

**Venciment:** `dueDay = avui + INTERVALS[step]`. Una pregunta és vençuda quan
`reps > 0` i `dueDay ≤ avui`.

**Prioritat de repàs:** `retard × 10 + errors × 5 + (marcada ? 25 : 0)`.

---

## 6. Selecció de sessions

Fitxer: `src/engines/selection.ts`.

Els filtres de la pantalla Entrenar (bloc, tema, dificultat, origen i estat de
repàs) viatgen **a la URL**, de manera que una sessió filtrada es pot recrear,
compartir o recarregar sense perdre'n la configuració.

Les preguntes es reparteixen en quatre grups: vençudes, fallades no vençudes,
noves i febles. Per a les sessions mixtes (missió del dia, patrulla, exprés, per
tema) la composició objectiu és **50 % repassos vençuts, 20 % errors i la resta
contingut nou**; si un grup és buit, el següent n'ocupa el lloc.

La tria és **determinista**: amb la mateixa llavor i el mateix banc surt sempre
el mateix conjunt. La barreja de presentació també ho és. Això fa que els tests
siguin fiables i que una sessió es pugui reconstruir.

Els simulacres es munten amb `buildExamPaper`, que va prenent preguntes de cada
tema en ronda per repartir la cobertura en comptes de concentrar-la en un bloc.
Les de reserva surten de la mateixa ronda i s'afegeixen al final sense reordenar
el cos: amb la mateixa llavor, les 40 primeres són idèntiques hi hagi reserva o
no.

---

## 7. Domini per tema

Fitxer: `src/engines/mastery.ts`.

Força individual d'una pregunta, en centèsimes senceres:

```
força = 70 · (intervalStep / MAX_STEP)
      + 20 · (streak ≥ 1)
      + 10 · (lastOutcome === 'correct-sure')
```

Una pregunta mai vista val 0. La mitjana es fa sobre **totes** les preguntes
actives del tema, no només sobre les vistes: així el domini reflecteix també la
cobertura i no es pot arribar al 100 % havent contestat tres preguntes de vint.

```
domini = round(100 · (0,60 · forçaMitjana + 0,40 · exactitudRecent))
```

L'exactitud recent es calcula sobre les últimes 20 respostes del tema.

**Honestedat estadística:** amb menys de 3 respostes al tema, `mastery` és
`null` i la interfície mostra "sense dades" en comptes d'un percentatge
construït sobre no res. El semàfor és vermell sota 40, ambre sota 70 i verd a
partir de 70.

El càlcul es fa amb enters perquè `0,7 + 0,2 + 0,1` en coma flotant dona
`0,9999999999999999` i un tema perfectament dominat es mostraria com a 99 %.

---

## 8. Persistència

- **`localStorage`** només guarda els ajustos i el punter de versió del
  contingut. Són pocs bytes i s'han de llegir de manera síncrona en arrencar.
- **IndexedDB** (base `policia-quest`) guarda el volum:

| Magatzem | Clau | Contingut |
| --- | --- | --- |
| `reviews` | `questionId` | Estat de repetició espaiada |
| `sessions` | `sessionId` | Sessions d'estudi |
| `attempts` | `attemptId` | Intents de simulacre |
| `answers` | autoincremental | Registre de respostes (analític) |
| `progress` | `'current'` | XP, ratxa, comptadors i assoliments |

### Migracions

`src/persistence/migrations.ts` migra en **llegir**, no en escriure. Cada
lectura passa per la migració, de manera que una base escrita per una versió
antiga sempre es llegeix bé. Les migracions són idempotents i additives: mai
esborren un camp sense una migració explícita.

**Regla inviolable:** actualitzar el contingut no pot esborrar el progrés. Els
estats de repàs de preguntes que ja no existeixen es conserven al magatzem per
si la pregunta torna.

### Escriptura de respostes

Cada resposta s'escriu immediatament. Hi va haver una versió amb un retard de
400 ms per agrupar escriptures; es va treure perquè obria una finestra en què
tancar l'app just després de contestar perdia la resposta, i l'estalvi no
compensava. El buidat a `pagehide` queda com a xarxa de seguretat.

### Còpies de seguretat

Format `policia-quest-backup`, amb versió i suma de comprovació.

La suma es calcula sobre una **serialització canònica**: les claus de tots els
objectes s'ordenen de manera recursiva i els camps `undefined` s'ometen. És
imprescindible: en exportar, els objectes tenen l'ordre de claus que els ha
donat el codi; en importar, Zod els reconstrueix en l'ordre de l'esquema. Sense
canonicalització, tota còpia legítima es rebutjaria com a manipulada.

La còpia **no** inclou el registre detallat de respostes (`answers`): és un log
analític que creix sense límit i que només alimenta estadístiques derivades.
Sí que inclou tot el que governa què toca repassar i quina és la ratxa.

---

## 9. Interfície

- **Encaminament per fragment** (`#/ruta`). Funciona en mode PWA sense servidor
  i en obrir el fitxer directament.
- **Cinc destinacions** a la barra inferior, com a màxim, i s'amaga a les
  pantalles immersives (sessió i simulacre).
- **La correcció mai es comunica només amb color**: cada opció porta símbol
  (`✓` / `✕`) i text.
- **Àrees tàctils** de 44 px com a mínim; `safe-area-inset-*` respectat.
- **`prefers-reduced-motion`** suportat, i a més hi ha un interruptor propi.
- **Els enunciats sempre porten `lang="ca"`**, encara que la interfície estigui
  en castellà: és la llengua de l'examen i els lectors de pantalla ho han de
  saber.

### Accessibilitat, comprovada i no declarada

`tests/e2e/accessibility.spec.ts` passa axe-core per les set pantalles en els dos
temes, més l'onboarding, la sessió d'estudi amb la seva correcció i el simulacre
sencer fins al resultat: 23 auditories amb els conjunts de regles WCAG 2.0, 2.1 i
2.2 en nivell A i AA. Falla si n'apareix cap incompliment.

Dues coses van sortir d'aquí i no de la revisió a ull:

- **El contrast de la paleta.** Els valors de `src/styles/tokens.css` estan
  mesurats sobre la superfície més clara on pot aparèixer cada text, que és el
  cas pitjor. Els fons de píndola (`*-dim`) són colors sòlids i no capes amb
  alfa, perquè amb alfa el mateix component passava sobre una targeta i fallava
  sobre una altra.
- **`aria-label` només on el rol el permet.** Un `div` sense rol no en pot
  portar. L'indicador de passos de l'onboarding és `role="progressbar"` i cada
  cel·la del calendari d'activitat és `role="img"`, perquè comuniquen un valor
  només amb la forma o el color.

L'auditoria també comprova que es pot respondre una pregunta només amb el
teclat, que el focus és visible en tabular i que cap control baixa de l'àrea
tàctil mínima. Una eina automàtica no sap si un text alternatiu té sentit; sí
que atrapa tot això.

### So

Àudio procedural amb WebAudio: no hi ha cap fitxer amb llicència dubtosa. El
context d'àudio no es crea fins que hi ha una interacció de l'usuari. Tot és
desactivable i l'app està pensada per ser excel·lent en silenci.

---

## 10. Límits deliberats d'aquesta fase

No hi ha, i és una decisió, no un oblit:

- Compte d'usuari, sincronització i pagaments.
- Servidor i base de dades remota.
- IA en temps d'execució.
- Traçadors, analítiques externes i anuncis.
- Panell editorial.

Les interfícies estan pensades perquè s'hi puguin afegir: `MunicipalityPack`
permet més municipis sense tocar cap pantalla; les migracions permeten canviar
l'esquema de progrés; el format de còpia és el que faria servir una
sincronització.

---

## 11. Rendiment

| Recurs | Mida | Gzip |
| --- | --- | --- |
| JS inicial | ~674 kB | ~190 kB |
| Lliçons (càrrega diferida) | ~176 kB | ~57 kB |
| CSS | ~15 kB | ~4 kB |

El gruix del paquet inicial és el banc de preguntes, que ha d'estar disponible
sense connexió. El service worker precarrega 14 entrades (~916 kB) i, a partir
de la primera càrrega, l'app funciona sencera fora de línia.
