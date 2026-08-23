# Contingut i fonts

Com es troba, es baixa, es redacta, es revisa i s'actualitza el contingut de
Policia Quest. Aquest document és el manual de la **Content Factory**.

---

## 1. La regla que ho governa tot

> **Cap pregunta activa pot existir sense una referència resoluble a una font
> registrada.**

No és una recomanació. `npm run content:validate` falla, els tests de contingut
es posen vermells i `npm run check` no passa. Una pregunta sense font pot
quedar-se en estat `draft`, però `draft` no arriba mai a l'usuari.

I la seva germana:

> **El contingut d'un examen oficial només es transcriu del document oficial.**

Si el quadernet no és accessible, l'examen queda registrat com a pendent amb la
seva URL i el motiu. No s'inventa mai.

---

## 2. El flux complet

```
                  ┌─────────────────────────────────────────┐
                  │ sources/source-manifest.json            │
                  │ Registre de les fonts: URL, organisme,   │
                  │ dates, àmbit, vigència, estat de còpia   │
                  └────────────────┬────────────────────────┘
                                   │  npm run sources:download
                                   ▼
                  ┌─────────────────────────────────────────┐
                  │ sources/cache/     còpies + SHA-256      │
                  └────────────────┬────────────────────────┘
                                   │  npm run sources:extract
                                   ▼
                  ┌─────────────────────────────────────────┐
                  │ sources/extracted/   text normalitzat    │
                  └────────┬───────────────────┬────────────┘
                           │                   │  npm run exams:import
        redacció humana    │                   ▼
                           │      ┌──────────────────────────────┐
                           │      │ content/.../exams/*.draft.json│
                           │      │ Esborranys, sempre en `draft` │
                           │      └──────────────┬───────────────┘
                           ▼                     │ revisió humana
        ┌────────────────────────────────────────▼───────────┐
        │ content/municipalities/roses/                       │
        │   lessons/  questions/  exams.ts  current-affairs/   │
        └────────────────────────┬───────────────────────────┘
                                 │  npm run content:validate
                                 ▼
                  ┌─────────────────────────────────────────┐
                  │ Build, tests i informe de cobertura      │
                  └─────────────────────────────────────────┘
```

---

## 3. Registre de fonts

Fitxer: `sources/source-manifest.json`. Cada entrada porta:

| Camp | Obligatori | Descripció |
| --- | --- | --- |
| `sourceId` | sí | Identificador estable en minúscules amb guions |
| `title` | sí | Títol oficial complet |
| `issuer` | sí | Organisme emissor |
| `url` | sí | URL oficial. **Mai una URL inventada o deduïda** |
| `kind` | sí | Tipus de document |
| `scope` | sí | `estatal`, `catalunya`, `roses`, `ue`, `internacional` |
| `publishedAt` | quan es coneix | Data de publicació oficial |
| `consultedAt` | sí | Data de l'última consulta |
| `status` | sí | `vigent`, `historica`, `substituida`, `pendent-revisar` |
| `fetchStatus` | sí | `downloaded`, `pending-download`, `not-required` |
| `sha256` | si s'ha baixat | Suma de la còpia local |
| `cacheFile` | si s'ha baixat | Nom del fitxer a `sources/cache/` |
| `fetchNote` | si està pendent | **Per què** no s'ha pogut baixar |
| `notes` | opcional | Versió, consolidació, avisos |

### Com s'obtenen les URL

Per a normativa estatal i catalana s'utilitza l'**ELI** (European Legislation
Identifier), que és determinista a partir del tipus, la data i el número de la
norma:

```
https://www.boe.es/eli/es/<tipus>/<AAAA>/<MM>/<DD>/<num>/con
https://portaljuridic.gencat.cat/eli/es-ct/<tipus>/<AAAA>/<MM>/<DD>/<num>
```

Quan l'ELI no és aplicable (Constitució, LECrim, acords de govern, pàgines
institucionals) s'utilitza la URL canònica publicada per l'organisme.

**Mai** s'ha de construir una URL "que probablement existeixi". Si no se'n
coneix la directa —com passa amb els quadernets P1 de l'arxiu municipal— cal
apuntar a la pàgina índex que sí que existeix i deixar-ho escrit a `note`.

### Afegir una font

1. Afegeix l'entrada al manifest amb `fetchStatus: "pending-download"`.
2. `npm run sources:download -- --id=<sourceId>`.
3. Si baixa, l'script hi posa el SHA-256 i canvia l'estat sol.
4. Si no baixa, l'script hi escriu el motiu i **continua**: mai trenca el build.
5. `npm run content:report` regenera `SOURCES.md`.

---

## 4. Traçabilitat del contingut

Cada lliçó i cada pregunta porten una o més `SourceReference`:

```ts
{
  sourceId: 'lo-4-2015-psc',
  locator: 'art. 16',            // article, apartat, secció o pàgina exacta
  validAt: '2026-08-23',         // data a partir de la qual se sap vigent
  reviewStatus: 'pending-source-verification',
  note: 'opcional'
}
```

### Els tres estats de revisió

| Estat | Significat | Es mostra a l'usuari? |
| --- | --- | --- |
| `verified` | Contrastada contra la còpia local del text consolidat | Sí, sense avís |
| `pending-source-verification` | Redactada a partir de la norma citada, però encara sense contrast automàtic | Sí, **amb avís visible a la correcció** |
| `outdated` | Se sap que la redacció ha canviat | Cal actualitzar-la abans de publicar |

En aquesta primera versió **totes** les referències són
`pending-source-verification`, perquè l'entorn de construcció no va poder baixar
cap font. L'app ho diu a cada correcció i l'informe de cobertura ho quantifica.

---

## 5. Redactar contingut

El contingut s'escriu en TypeScript, no en JSON pla, per tres motius: l'editor
comprova els tipus mentre s'escriu, `npm run typecheck` ja valida l'estructura
abans de cap test, i es poden fer servir ajudes com `ref()`.

### Una microlliçó

Segueix el model pedagògic: idea clau → explicació → exemple → punt que confon →
comprovació ràpida. De 3 a 7 minuts i mínim quatre targetes. Res de murs de
text: hi ha targetes de comparació (`compare`) i de comprovació (`checkpoint`)
precisament per trencar-los.

```ts
lesson(
  26,                                  // número de tema
  'Títol en català', 'Título en castellano',
  6,                                   // minuts
  [
    idea('Text en català…', 'Texto en castellano…'),
    explain('Títol', 'Título', 'Cos en català…', 'Cuerpo en castellano…'),
    compare(/* … */),
    example('…', '…'),
    pitfall('El que sol confondre…', 'Lo que suele confundir…'),
    checkpoint('Pregunta?', '¿Pregunta?', 'Resposta', 'Respuesta'),
  ],
  [ref('lo-4-2015-psc', 'art. 4, 15 a 20, 23 i 35 a 39')],
)
```

Al cos es pot fer servir `**èmfasi**`; la interfície el converteix en negreta
sense passar per HTML arbitrari.

### Una pregunta

```ts
{
  n: 1,                                // correlatiu dins el tema
  stem: 'Enunciat en català.',         // SEMPRE en català: és la llengua de l'examen
  options: ['a', 'b', 'c', 'd'],
  correct: 'b',
  whyWrong: {                          // per què fallen les altres
    a: 'Motiu concret, no "és fals".',
    c: '…',
    d: '…',
  },
  explainCa: 'Correcció raonada…',
  explainEs: 'Corrección razonada…',
  refs: [ref('ce-1978', 'art. 53.2')],
  difficulty: 'mitjana',
}
```

Criteris de qualitat que la validació **no** pot comprovar i que depenen de qui
redacta:

- Els distractors han de ser plausibles, no absurds. Un distractor que ningú
  triaria no ensenya res.
- `whyWrong` ha de dir per què falla aquella opció concreta, no repetir la
  resposta correcta.
- L'explicació ha d'ensenyar, no confirmar. Si es pot afegir el criteri que
  distingeix el cas, s'hi afegeix.
- L'enunciat no ha de ser una pregunta trampa de memòria pura si el que importa
  és el criteri.

### Contingut que caduca

Càrrecs, xifres, premis, notícies i dades municipals canviants es marquen amb
`dynamic: true` i `reviewBy: 'AAAA-MM-DD'`. La validació falla si una pregunta
dinàmica està activa sense data de revisió.

---

## 6. Exàmens oficials

### El registre

`content/municipalities/roses/exams.ts` llista tots els quadernets coneguts amb
la seva URL, prioritat i `importStatus`:

- **P0** — els quatre exigits per la convocatòria vigent: propietat 2025 i
  interins 2026, cultura general i coneixements professionals.
- **P1** — convocatòries anteriors publicades a l'arxiu municipal.

### La importació

```bash
npm run sources:download    # baixa els quadernets
npm run sources:extract     # els converteix en text (necessita pdftotext)
npm run exams:import        # genera esborranys de transcripció
```

`import-roses-exams.ts` detecta blocs numerats amb quatre opcions etiquetades i
cerca el full de respostes publicat pel tribunal. Escriu esborranys a
`content/municipalities/roses/exams/<examId>.draft.json`.

### Els esborranys **sempre** necessiten revisió humana

L'extracció de PDF trenca accents, parteix línies i confon columnes. Per això
els esborranys surten amb `status: 'draft'` i `topicId: 'roses-t01'` provisional.
La persona revisora ha de:

1. Comprovar la transcripció literal contra el PDF original.
2. Assignar el tema correcte.
3. Redactar la correcció raonada.
4. Documentar a `transcriptionNotes` **qualsevol** correcció tècnica aplicada.
5. Canviar l'estat a `historical`.

### Regles innegociables

- **La resposta publicada pel tribunal no es canvia en silenci.** Si el contingut
  ha quedat obsolet per un canvi normatiu, es marca `archived` o `historical` i
  s'hi afegeix una nota; la resposta oficial es conserva tal com es va publicar.
  La validació falla si `officialAnswer` divergeix de `correct` sense
  `transcriptionNotes`.
- **Els exàmens històrics no entren al banc actiu.** Es veuen dins el seu mode
  "Examen oficial històric", amb la nota de vigència.
- **L'actualitat antiga no es barreja amb els entrenaments actuals.**

---

## 7. Actualitat

Els paquets viuen a `content/municipalities/roses/current-affairs/` i porten
data de creació, període cobert, data de caducitat, àmbit i estat.

Per omplir-ne un:

1. Verifica cada fet contra una font oficial o periodística fiable i registra-la
   al manifest.
2. Redacta la pregunta amb `dynamic: true` i `reviewBy`.
3. Afegeix el seu identificador a `questionIds` del paquet.

**No s'omple mai amb notícies redactades de memòria.** En aquesta versió el
paquet és buit a propòsit i l'informe de cobertura ho reporta.

---

## 8. Validació automàtica

`npm run content:validate` falla si:

1. No hi ha exactament 40 temes de Roses.
2. Hi ha identificadors duplicats (temes, lliçons, preguntes, fonts, exàmens).
3. Falta la resposta correcta d'alguna pregunta.
4. Una pregunta activa no té cap referència.
5. Algun tema té menys de 4 preguntes actives.
6. El banc actiu baixa de 200 preguntes.
7. Un examen importat ha perdut les metadades o les té incoherents.
8. Una pregunta dinàmica està activa sense data de revisió.
9. Una referència apunta a una font que no existeix.
10. Un plànol de simulacre no respecta les regles de puntuació de Roses.
11. Dues preguntes tenen el mateix enunciat normalitzat.
12. Falta la microlliçó d'algun tema.

A més avisa (sense fallar) de preguntes molt semblants dins un mateix tema i
d'exàmens amb un nombre de preguntes diferent de l'esperat.

### Deduplicació

`scripts/lib/dedupe.ts` normalitza l'enunciat traient diacrítics, puntuació,
majúscules i espais sobrants, i n'hash amb SHA-256. Això atrapa còpies literals
i variacions cosmètiques. Per a variacions més subtils, la validació hi afegeix
una comprovació de similitud de Jaccard sobre les paraules dels enunciats del
mateix tema.

---

## 9. Rutina d'actualització

**Cada convocatòria nova**

1. Afegeix les bases al manifest i baixa-les.
2. Compara el temari amb `syllabus.json`. Si canvia l'ordre, actualitza
   `number2025` (o afegeix l'any nou) i **no** trenquis els `topicId`: el
   progrés de la gent hi està lligat.
3. Comprova el format i la penalització de les proves contra `exams.ts`.
4. Puja `packVersion` a `pack-core.ts`.

**Cada trimestre**

1. `npm run sources:download -- --all` i mira quins SHA-256 han canviat: una
   font que canvia és una norma que s'ha modificat.
2. Revisa les preguntes amb `reviewBy` vençut.
3. Arxiva el paquet d'actualitat caducat i crea'n un de nou.
4. `npm run content:report` i treballa la llista de revisió humana.

**Quan surt un examen nou**

1. Afegeix el quadernet al manifest i a `exams.ts`.
2. Importa, revisa i publica com a `historical`.
