# Auditoria d'experiència real d'estudi — 2026-08-24

No es pregunta si l'app funciona —això ja ho responen 191 tests i 50 fluxos
d'extrem a extrem— sinó si **ajuda a aprendre**: què veu, què entén i què fa
l'endemà una persona que estudia de debò. El mètode va ser recórrer el cicle
sencer com una estudiant (lliçó → entrenament → error → «no ho sé» → tornar
l'endemà → simulacre → repassar errors → progrés), amb el rellotge del
navegador controlat per poder viure dos dies seguits, i creuar-ho amb mètriques
de contingut sobre el banc sencer. Les captures de cada pas són a
`artifacts/experiencia/` i el recorregut es pot repetir amb
`node scripts/audit-experiencia.mjs`.

## El que ensenya bé (verificat, no suposat)

- **La correcció d'una pregunta pròpia és el punt més fort de l'app.** A la
  captura `10-correccio-1.png` hi ha tot el que la regla de producte demana:
  l'opció triada marcada amb símbol i text, el motiu pel qual falla **cada**
  alternativa (225 de 250 preguntes pròpies el porten complet), el «per què» de
  la bona, i la font amb article concret — amb l'avís honest de «referència
  pendent de contrast» quan la font encara no s'ha pogut verificar.
- **El cicle de repàs es tanca de debò.** Les dues preguntes fallades el dia 1
  van aparèixer el dia 2 a «Repassos pendents · 2» a l'inici, i la sessió de
  repàs va servir primer la fallada. «No ho sé» es tracta com a resposta
  honesta, tal com promet la regla.
- **La lliçó no és un PDF disfressat.** Idea clau → explicacions → «Sol
  confondre» → comprovació ràpida amb resposta tapada (record actiu) → botó
  «Practicar aquest tema». Les 40 en tenen totes checkpoint i pitfall.
- **El simulacre corregeix per aprendre, no només per puntuar.** El resultat
  desglossa punts bruts i penalització, agrupa els errors per tema, permet
  obrir cada pregunta amb la seva correcció completa i envia tots els errors a
  la cua de repàs amb un botó.
- **Els números difícils es diuen bé.** Un tema amb menys de 3 respostes no
  mostra percentatge; l'exactitud només surt amb 10 respostes; el resultat del
  simulacre complet mai suma les dues proves. La llengua es respecta: interfície
  i explicacions en castellà si es demana, enunciats sempre en català.

## El que la auditoria va trobar tort, i s'ha corregit en aquest bloc

1. **El selector de confiança mentia dues vegades.** Un encert sense tocar
   «Com ho veus?» es desava com a *segur*, inflant el panell «Confiança i
   precisió»; i un error mai desava la confiança, de manera que **«segur però
   incorrecte» —el senyal metacognitiu que el panell promet— era
   estructuralment impossible: sempre zero**. Ara es desa el que la persona va
   marcar de debò (o res), i un test d'extrem a extrem determinista ho fixa:
   tema 30 contestat tot «a» declarant «Ho tinc clar» dona exactament 1 «segur
   i correcte» i 4 «segur però incorrecte».
2. **«Domini global 40%» amb un sol tema practicat.** El número és la mitjana
   dels temes amb dades, però el rètol deia «global»: el primer dia feia
   creure que se sabia mig temari. Ara el denominador és a la vista («1 de 40
   temes amb dades; la resta encara no compta») i la fitxa d'un tema ja no
   reutilitza el rètol «Domini global» per al domini del tema.
3. **El resum de sessió era un carreró sense sortida.** Deia «3/5 i +35 XP» i
   només oferia tornar a l'inici; el que una persona que acaba de fallar dues
   preguntes necessita saber és què passa ara amb allò. Ara ho diu amb la
   veritat de l'SRS («Les 2 preguntes fallades ja són a la cua de repàs. Demà
   te'n tornaran a sortir 2.») i ofereix «Repassar ara els errors».
4. **El filtre «D'examen oficial» no podia servir mai res.** Exigia seleccionar
   temes del temari, però les 189 preguntes oficials viuen al tema contenidor
   dels quadernets, que no és al selector: el botó deia «0 disponibles» per
   sempre. Ara el filtre entrena el banc oficial directament, amb una nota que
   explica el perquè, i el test de filtres arrenca la sessió de debò en lloc de
   comprovar només que l'avís desapareix.
5. **El «per què» de les preguntes oficials no era un perquè.** Sota el rètol
   «PER QUÈ», 189 preguntes deien «Pregunta 4 del quadernet oficial de
   2026-04-15. La resposta és la que va marcar el tribunal…»: procedència
   vestida d'explicació. Redactar el fonament de memòria està prohibit per les
   regles del projecte (amb raó), així que el text ara diu la veritat i dona un
   camí: *«El tribunal va marcar la a) com a bona (al quadernet, amb asterisc).
   No en va publicar el fonament i aquesta app no l'inventa: si el perquè no et
   surt, busca'l al tema corresponent del temari i contrasta'l amb el quadernet
   enllaçat a la font.»* Regenerat amb l'importador; identificadors, enunciats
   i claus verificats intactes (només han canviat les 378 línies ca/es).

## Deute que queda, per ordre de valor per a qui estudia

1. **Fonamentar les correccions de les 189 preguntes oficials.** L'única
   manera honesta és escriure cada explicació contra la font real: avui només
   es podria fer amb les que citen les ordenances de Roses i les bases (ja
   adoptades amb hash); la majoria esperen les 43 fonts generals pendents
   (BOE, Portal Jurídic). Quan arribin, aquest és el primer contingut a
   escriure: és on la correcció ensenya menys precisament on les preguntes són
   més reals.
2. **Classificar les preguntes oficials per tema.** Sense això no alimenten el
   semàfor per temes ni l'entrenament per tema (el desglossament per temes del
   resultat de simulacre ja ho fa amb les pròpies). És feina de criteri,
   pregunta a pregunta; una assignació automàtica per paraules clau seria
   endevinar.
3. **Profunditat del banc propi: 31 de 40 temes tenen exactament 5 preguntes.**
   Una sessió per tema les esgota el primer dia i el repàs espaiat recicla
   sempre les mateixes. No s'omple amb volum dubtós (la regla de rigor mana);
   però és el límit real d'aprenentatge per tema a mitjà termini.
4. **La ratxa compta dies amb l'objectiu complet, no dies estudiats.** Estudiar
   5 preguntes d'un objectiu de 10 deixa «Ratxa · 0 dies» l'endemà. No bloqueja
   res (la regla es compleix), però és fred amb qui sí que va estudiar. Decisió
   de producte pendent, no un defecte: comptar «dies amb activitat» canviaria
   el significat dels assoliments.
5. **Menors, vistos i deixats estar:** el «3/5» verd del resum usa l'estil
   «aprovat» d'un simulacre quan una sessió d'estudi no aprova ni suspèn; la
   quarta targeta d'estadística (XP) salta sola a una segona fila; el locator
   de les fonts no es tradueix al castellà (és una citació; defensable).

## Com repetir-la

```bash
npm run build && npm run preview &
node scripts/audit-experiencia.mjs   # el recorregut de dos dies, amb captures
node scripts/audit-actualitat.mjs    # les 25 d'actualitat dins de l'app
node scripts/smoke.mjs               # pantalles generals i errors de consola
```

I després mirar les captures. Les dues troballes de contingut d'aquest projecte
que cap test havia vist (capçaleres colades a les opcions, explicacions que no
explicaven) han sortit totes dues de mirar l'app amb ulls de qui estudia.
