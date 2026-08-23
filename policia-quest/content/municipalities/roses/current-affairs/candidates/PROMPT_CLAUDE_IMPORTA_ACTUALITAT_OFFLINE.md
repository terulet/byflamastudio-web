# Encàrrec per a Claude — importar actualitat des de les instantànies oficials del paquet

Treballa sobre `claude/new-session-34eyi7`, partint del commit `741b2fa`. Comprova branca, commit i arbre net abans de modificar res. Si no coincideixen o hi ha canvis aliens, atura't; no els descartis.

Aquest és el segon paquet. Resol el bloqueig de xarxa de l'informe anterior: ara conté **19 instantànies textuals independents**, una per pàgina oficial, dins `snapshots/`. Es van capturar obrint les pàgines institucionals el 24 d'agost de 2026. No són un resum factual com l'antic `sources.evidence.json`: cada fitxer conserva les metadades de la pàgina i el fragment oficial que demostra la resposta.

No intentis tornar a obrir les URL des del contenidor. Ja sabem que el proxy les rebutja amb `CONNECT 403`. La verificació d'aquesta iteració és offline contra les instantànies i els seus SHA-256.

## Regles inviolables

1. No relaxis `availability.ts`, `actualitat.ts`, `isCurrent()`, el validador, les quotes, `contentStatus`, els requisits de `publishedAt`, `reviewBy` o `verified`, ni cap bloqueig de ruta o interfície.
2. No adoptis des de `sources.evidence.json`. Per a cada pregunta has d'obrir el fitxer `snapshots/<sourceId>.txt` i comprovar que el text preservat demostra exactament l'opció correcta.
3. Verifica abans els dos nivells d'integritat: `SHA256SUMS.txt` a l'arrel i `snapshots/SHA256SUMS.txt` dins les instantànies.
4. Adopta cada instantània com el document font real comprovat: desa-la a `sources/cache/`, conserva la URL canònica, editor, data de publicació, data de captura i SHA-256 del fitxer exacte.
5. Només marca una referència com a `verified` després de contrastar pregunta, resposta i explicació contra la instantània corresponent.
6. Si una instantània no conté prou text per demostrar el fet, rebutja només aquella pregunta. No completis res de memòria ni des de la fitxa resum.
7. Totes les preguntes continuen sent `dynamic: true`; respecta `reviewBy` i no l'allarguis.
8. No converteixis material d'examen històric en actualitat vigent.

## Correccions incorporades respecte del primer paquet

- Les sèries numèriques, dates, percentatges i ordinals estan ordenades.
- Els enunciats són autosuficients i inclouen la referència temporal necessària.
- `cat-010` ja no caduca al cap de cinc setmanes: `reviewBy` és `2027-01-31`.
- `cat-011` ja no repeteix el titular; ara pregunta pel nombre de regions de l'ESRA.
- `cultura-024` ja no pregunta la ciutat que apareixia al titular; ara pregunta la data de la final.
- `roses-008` ja no presenta «Sirena de la Badia» com si fos necessàriament el títol formal del cartell.
- Els àmbits ara només són `roses`, `catalunya`, `espanya` i `internacional`. Si el nom natiu del quart valor difereix, adapta'l a l'enum existent sense crear un segon model.
- El directori real d'integració és `content/municipalities/roses/current-affairs/`.

## Ordre de treball

### 1. Auditoria del paquet

- Verifica tots els hashes.
- Executa també `node validate-pack.mjs`; qualsevol error és criteri de parada.
- Comprova 25 IDs únics, quatre opcions diferents, resposta 0–3, 19 fonts i 19 instantànies, dates ISO i tots els `reviewBy` posteriors a `2026-08-24`.
- Comprova que el `source_id` de cada instantània coincideix amb el seu nom i amb `sourceId` de les preguntes.
- Genera la taula de decisió 25/25 abans d'integrar.

### 2. Contrast offline, pregunta per pregunta

Per a cada candidata:

1. obre `snapshots/<sourceId>.txt`;
2. verifica editor, data, URL i títol;
3. busca el valor exacte de la resposta en `RELEVANT OFFICIAL TEXT`;
4. comprova que cap altra opció també sigui compatible;
5. revisa enunciat, opció, índex, explicació, localitzador i caducitat;
6. adopta o rebutja amb un motiu concret.

La coincidència no pot ser només textual: comprova unitat, període, subjecte i abast. Per exemple, no confonguis el pressupost consolidat de 48.400.660 € amb el pressupost específic de l'Ajuntament de 44.649.900 €.

### 3. Importació de fonts i contingut

- Amplia `scripts/transcription/import_current_affairs.py` amb un mode offline que llegeixi `snapshots/` i verifiqui els seus hashes. Mantén el mode de xarxa per a futures actualitzacions.
- Desa les instantànies adoptades al cache del projecte amb el patró natiu i actualitza el manifest de fonts.
- Integra les candidates adoptades a l'esquema existent de `content/municipalities/roses/current-affairs/`.
- No introdueixis un nou tipus de pregunta, font o àmbit si l'esquema existent ja en té un equivalent.
- Actualitza `contentStatus` només al final i només si el còmput real dona almenys deu preguntes verificades i vigents.
- El desbloqueig ha de sorgir de les mateixes funcions pures que ja comparteixen validador, informe, interfície i ruta directa.

### 4. Tests obligatoris

Demostra com a mínim:

1. cada pregunta adoptada referencia una font existent, adoptada i `verified`;
2. el hash del document cachejat coincideix amb el de la instantània del paquet;
3. cap pregunta manca de `publishedAt`, `dynamic: true`, paquet actiu o `reviewBy`;
4. totes són vigents el `2026-08-24` i caduquen segons la semàntica real del projecte;
5. cultura general munta exactament 10 permanents + 10 actualitat, sense substitució entre quotes;
6. el complet s'obre quan totes dues proves estan disponibles;
7. targeta, informe, ruta directa i validador coincideixen en disponible i bloquejat;
8. després de la caducitat, cultura general i complet tornen a bloquejar-se;
9. una font pendent, sense data, amb hash alterat o procedent d'un examen històric és rebutjada;
10. l'opció correcta i l'explicació coincideixen amb el text preservat;
11. els selectors normals de sessió no serveixen material caducat.

Recupera el recorregut E2E multisecció suspès a `CLAUDE.md`. Conserva també els tests del bloqueig utilitzant una data posterior a la caducitat o un banc controlat.

### 5. Inspecció real de l'app

- Executa unitàries/contingut, E2E, accessibilitat i `smoke.mjs`.
- Obre i mira: targetes, inici CG, transició 10+10, reserves, resultat, simulacre complet i correccions amb font/data.
- Revisa les 25 preguntes completes dins l'app: enunciat íntegre, quatre opcions, resposta, explicació i font.
- Prova `2026-08-24` i una data posterior al `reviewBy` més tardà.
- Cap error de consola, 404, desbordament, text tallat, contador contradictori ni plural incorrecte.

## Criteri de parada

Si menys de deu preguntes queden demostrades per les instantànies, mantén el bloqueig. Si en queden deu o més, obre cultura general i complet únicament mitjançant el contingut real i les regles existents.

## Informe de sortida

Retorna:

1. branca, commit, push i arbre;
2. hashes d'arrel i 19/19 instantànies;
3. taula 25/25 amb adoptada/rebutjada i motiu;
4. fonts cachejades amb URL i SHA-256;
5. disponibilitat quota per quota a `2026-08-24`;
6. primera data de canvi per caducitat;
7. proves automàtiques i inspecció visual;
8. qualsevol defecte conegut que continuï obert.
