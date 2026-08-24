# Rescat de fonts normatives: inventari de les que falten

**Generat** per `scripts/inventory-pending-sources.ts`. No s’edita a mà: si canvia el
manifest o el banc, es torna a generar i canvia amb ells.

Aquest document i el seu bessó `rescat-fonts-normatives.json` no baixen res: descriuen
**què** cal baixar, **d’on**, **quins articles** i **per demostrar quina afirmació**, de
manera que qui tingui accés a la xarxa pugui preparar el paquet sense reconstruir el
context. És el mateix camí que van seguir els dos paquets anteriors.

## Totals

| | |
| --- | --- |
| Fonts pendents | **43** |
| Referències del banc en `pending-source-verification` | 313 |
| Preguntes pròpies que en depenen | 213 |
| Microlliçons que en depenen | 39 |
| Preguntes oficials que es podrien explicar | 129 |

### Per prioritat

| Prioritat | Fonts | Criteri |
| --- | --- | --- |
| **P0** | 16 | Pot explicar 5 preguntes oficials o més, o té 10 consumidors o més. |
| **P1** | 23 | Necessària per a lliçons i preguntes pròpies (2-9 consumidors). |
| **P2** | 4 | Un sol consumidor o cap: impacte menor. |

### Per organisme

| Organisme | Fonts |
| --- | --- |
| BOE | 27 |
| Portal Jurídic de Catalunya | 7 |
| Ajuntament de Roses | 4 |
| EUR-Lex | 2 |
| Departament d’Interior i Seguretat Pública | 1 |
| Generalitat de Catalunya | 1 |
| Nacions Unides | 1 |

## Com llegir una entrada

De cada font hi ha la norma exacta amb el seu identificador legal, l’estat de
consolidació que cal, els articles que el banc cita de debò, **l’afirmació concreta**
que cada referència ha de poder demostrar, i qui la consumeix. Les preguntes oficials
que hi surten són **candidates**: la classificació editorial les ha posat en un tema
que ja consumeix aquesta font, però qui escrigui l’explicació ha de comprovar que la
norma respon de debò la pregunta.

## P0 — 16 fonts

### `ce-1978` — Constitució espanyola de 1978 (text consolidat)

- **Identificador legal:** Constitució espanyola · BOE núm. 311, de 29/12/1978 (BOE-A-1978-31229)
- **Organisme:** BOE
- **Publicació:** 1978-12-29 · **consolidació:** consolidat — Inclou les reformes de 1992 (art. 13.2) i 2011 (art. 135).
- **URL canònica:** https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229
- **Alternatives oficials:** https://www.boe.es/buscar/pdf/1978/BOE-A-1978-31229-consolidado.pdf *(derivada, cal comprovar-la)* · https://www.boe.es/eli/es/c/1978/12/27/(1)/con *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Text íntegre. És la font més consumida del banc: títol preliminar, títol I sencer (art. 10-55), títol VI (poder judicial), títol VIII (organització territorial), títol IX (Tribunal Constitucional) i títol X (reforma).
- **Articles citats pel banc:** 1, 3, 9, 10, 14, 15, 17, 18, 21, 24, 53, 54, 55, 117, 122, 123, 125, 126, 127, 152, 159, 165, 166, 167, 169
- **Consumidors:** 30 preguntes pròpies · 9 microlliçons · 9 temes · **39 en total**
- **Preguntes oficials que podria explicar:** 29
- **Paquet offline:** `ce-1978.pdf` · mínim 200.000 bytes · ha de contenir «Constitución», «Artículo 1», «Artículo 159», «Artículo 3»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t01-001` · *estructura general* — Que, en el punt citat, la resposta a «Quants articles té la Constitució espanyola de 1978?» és «169 articles».
  - `q-roses-t01-002` · *art. 1.1* — Que, en el punt citat, la resposta a «Segons l’article 1.1 de la Constitució, quins són els valors superiors de l’ordenament jurídic?» és «La llibertat, la justícia, la igualtat i el pluralisme polític».
  - `q-roses-t01-003` · *art. 9.3* — Que, en el punt citat, la resposta a «Quin d’aquests principis NO està garantit expressament per l’article 9.3 de la Constitució?» és «La proporcionalitat de les penes».
  - …i 36 més, totes al JSON.

### `llei-16-1991-policies-locals` — Llei de les policies locals de Catalunya (text consolidat)

- **Identificador legal:** Llei 16/1991, de 10 de juliol
- **Organisme:** Portal Jurídic de Catalunya
- **Publicació:** 1991-07-19 · **consolidació:** consolidat — Cal la versió consolidada: escales i categories i el règim disciplinari han estat modificats diverses vegades.
- **URL canònica:** https://portaljuridic.gencat.cat/eli/es-ct/l/1991/07/10/16
- **Alternatives oficials:** https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=53539 *(derivada, cal comprovar-la)* · https://www.boe.es/buscar/act.php?id=BOE-A-1991-19970 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Naturalesa i dependència municipal dels cossos, àmbit territorial, art. 12 (policia judicial), 24 (escales i categories), 25 (categories segons població) i tot el règim disciplinari (classificació de faltes, catàleg i graduació de sancions, art. 51 sobre encobriment).
- **Consumidors:** 11 preguntes pròpies · 2 microlliçons · 4 temes · **13 en total**
- **Preguntes oficials que podria explicar:** 22
- **Paquet offline:** `llei-16-1991-policies-locals.pdf` · mínim 100.000 bytes · ha de contenir «policies locals», «Article 25»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t04-003` · *dependència dels cossos de policia local* — Que, en el punt citat, la resposta a «La relació entre la Generalitat i les policies locals de Catalunya és de:» és «Coordinació, mantenint la dependència de l’alcalde o alcaldessa».
  - `q-roses-t11-001` · *règim disciplinari* — Que, en el punt citat, la resposta a «El règim disciplinari dels cossos de policia local de Catalunya es regula principalment a:» és «La Llei 16/1991 i el Decret 179/2015».
  - `q-roses-t11-002` · *classificació de les faltes* — Que, en el punt citat, la resposta a «Com es classifiquen les faltes disciplinàries dels membres dels cossos de policia local?» és «Molt greus, greus i lleus».
  - …i 10 més, totes al JSON.

### `llei-39-2015-pac` — Llei del procediment administratiu comú de les administracions públiques

- **Identificador legal:** Llei 39/2015, d’1 d’octubre
- **Organisme:** BOE
- **Publicació:** 2015-10-02 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/l/2015/10/01/39/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Text íntegre: el banc en cita 34 localitzadors diferents, del títol preliminar als recursos (art. 3-13, 21-33, 34-52, 54-95, 98-126).
- **Articles citats pel banc:** 3, 4, 5, 13, 15, 21, 25, 29, 30, 33, 34, 35, 40, 47, 52, 53, 54, 56, 71, 82, 94, 95, 98, 100, 106, 122, 123, 124, 126
- **Consumidors:** 28 preguntes pròpies · 6 microlliçons · 6 temes · **34 en total**
- **Preguntes oficials que podria explicar:** 19
- **Paquet offline:** `llei-39-2015-pac.pdf` · mínim 200.000 bytes · ha de contenir «Procedimiento Administrativo Común», «Artículo 21», «Artículo 3», «Artículo 4»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t12-001` · *objecte i àmbit* — Que, en el punt citat, la resposta a «Quina llei regula el procediment administratiu comú de les administracions públiques?» és «La Llei 39/2015».
  - `q-roses-t12-002` · *art. 54, 58 i 63* — Que, en el punt citat, la resposta a «Quan un agent de la Policia Local de Roses formula una denúncia per infracció de l’ordenança de convivència:» és «Inicia el procediment sancionador, que resoldrà l’òrgan competent».
  - `q-roses-t12-004` · *art. 53.2 i 77* — Que, en el punt citat, la resposta a «La presumpció d’innocència en el procediment administratiu sancionador:» és «S’aplica plenament i correspon a l’Administració provar els fets».
  - …i 31 més, totes al JSON.

### `llei-7-1985-lrbrl` — Llei reguladora de les bases del règim local (text consolidat)

- **Identificador legal:** Llei 7/1985, de 2 d’abril
- **Organisme:** BOE
- **Publicació:** 1985-04-03 · **consolidació:** consolidat — Molt modificada; la redacció de competències municipals (art. 25-26) depèn de la reforma de la Llei 27/2013.
- **URL canònica:** https://www.boe.es/eli/es/l/1985/04/02/7/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1985-5392 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 1, 4, 11, 12, 15, 16, 20, 21.1.e, 22, 25, 26, 49, 65.2, 70.2, 84 i 139-141 (tipificació d’infraccions i límits de les multes).
- **Articles citats pel banc:** 1, 4, 11, 15, 20, 21, 22, 25, 49, 65, 139, 141
- **Consumidors:** 11 preguntes pròpies · 3 microlliçons · 4 temes · **14 en total**
- **Preguntes oficials que podria explicar:** 17
- **Paquet offline:** `llei-7-1985-lrbrl.pdf` · mínim 150.000 bytes · ha de contenir «Bases del Régimen Local», «Artículo 25», «Artículo 1», «Artículo 4»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t03-005` · *art. 1 i 11* — Que, en el punt citat, la resposta a «Segons l’Estatut, quin és l’ens bàsic de l’organització territorial de Catalunya i del govern local?» és «El municipi».
  - `q-roses-t05-001` · *art. 11* — Que, en el punt citat, la resposta a «Quins són els tres elements del municipi segons la legislació bàsica de règim local?» és «Territori, població i organització».
  - `q-roses-t05-002` · *art. 15 i 16* — Que, en el punt citat, la resposta a «Qui té la condició de veí d’un municipi?» és «Qui estigui inscrit al padró municipal d’habitants».
  - …i 11 més, totes al JSON.

### `lo-2-1986-fcs` — Llei orgànica de forces i cossos de seguretat

- **Identificador legal:** Llei orgànica 2/1986, de 13 de març
- **Organisme:** BOE
- **Publicació:** 1986-03-14 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/lo/1986/03/13/2/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1986-6859 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 1 i 2 (concepte i cossos), 5 sencer (principis bàsics d’actuació, amb 5.1, 5.2.c i 5.2.d), 7 (Guàrdia Civil com a força armada), 9 (àmbits), 11 i 12 (funcions del CNP), 29-53 (policies locals, funcions compartides) i 48 (Consell de Política de Seguretat).
- **Articles citats pel banc:** 1, 5, 9, 51, 53
- **Consumidors:** 8 preguntes pròpies · 1 microlliçons · 4 temes · **9 en total**
- **Preguntes oficials que podria explicar:** 17
- **Paquet offline:** `lo-2-1986-fcs.pdf` · mínim 120.000 bytes · ha de contenir «Fuerzas y Cuerpos de Seguridad», «Artículo 5», «Artículo 1»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t08-003` · *art. 5.1* — Que, en el punt citat, la resposta a «El deure d’obediència d’un empleat públic cedeix quan la instrucció rebuda:» és «Constitueix una infracció manifesta, clara i terminant de l’ordenament jurídic».
  - `q-roses-t21-001` · *art. 5.2.d* — Que, en el punt citat, la resposta a «Segons la Llei orgànica 2/1986, les armes de foc només es poden utilitzar:» és «En situacions de risc racionalment greu per a la vida o la integritat física pròpia o de tercers, o de risc greu per a la seguretat ciutadana».
  - `q-roses-t21-002` · *art. 5.2.c* — Que, en el punt citat, la resposta a «Quins principis han de regir la utilització dels mitjans a l’abast de la policia?» és «Congruència, oportunitat i proporcionalitat».
  - …i 6 més, totes al JSON.

### `lo-6-2006-eac` — Estatut d’autonomia de Catalunya de 2006 (text consolidat)

- **Identificador legal:** Llei orgànica 6/2006, de 19 de juliol
- **Organisme:** BOE
- **Publicació:** 2006-07-20 · **consolidació:** consolidat — El text consolidat recull la STC 31/2010: cal el text vigent, no el publicat el 2006.
- **URL canònica:** https://www.boe.es/eli/es/lo/2006/07/19/6/con
- **Alternatives oficials:** https://www.parlament.cat/document/cataleg/48089.pdf *(derivada, cal comprovar-la)* · https://portaljuridic.gencat.cat/eli/es-ct/lo/2006/07/19/6 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Títol I (drets i deures), el capítol de drets i deures lingüístics, el títol de govern local, les institucions (Parlament, Presidència, Govern), el poder judicial a Catalunya i les competències en seguretat pública.
- **Consumidors:** 15 preguntes pròpies · 4 microlliçons · 4 temes · **19 en total**
- **Preguntes oficials que podria explicar:** 15
- **Paquet offline:** `lo-6-2006-eac.pdf` · mínim 200.000 bytes · ha de contenir «Estatuto», «Artículo 6»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t03-001` · *norma aprovatòria* — Que, en el punt citat, la resposta a «L’Estatut d’autonomia de Catalunya vigent va ser aprovat per:» és «La Llei orgànica 6/2006, de 19 de juliol».
  - `q-roses-t03-002` · *drets i deures lingüístics* — Que, en el punt citat, la resposta a «Segons l’Estatut, la llengua pròpia de Catalunya és:» és «El català, que és també llengua oficial juntament amb el castellà».
  - `q-roses-t03-003` · *drets lingüístics davant les administracions* — Que, en el punt citat, la resposta a «El dret d’opció lingüística reconegut per l’Estatut implica que:» és «Les persones tenen dret a ser ateses en la llengua oficial que triïn».
  - …i 16 més, totes al JSON.

### `lo-10-1995-cp` — Codi penal (text consolidat)

- **Identificador legal:** Llei orgànica 10/1995, de 23 de novembre
- **Organisme:** BOE
- **Publicació:** 1995-11-24 · **consolidació:** consolidat — El text consolidat ja incorpora la reforma de la LO 1/2015: la redacció vigent dels articles surt d’aquí.
- **URL canònica:** https://www.boe.es/eli/es/lo/1995/11/23/10/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 1-9 (garanties i aplicació de la llei penal), 10 (concepte de delicte), 33 (classes de penes), 234-242 (furts i robatoris), 250 (estafa agreujada) i 379-385 ter (seguretat viària).
- **Articles citats pel banc:** 1, 2, 9, 234, 235, 238, 239, 242, 379, 383, 384, 385
- **Consumidors:** 13 preguntes pròpies · 4 microlliçons · 4 temes · **17 en total**
- **Preguntes oficials que podria explicar:** 13
- **Paquet offline:** `lo-10-1995-cp.pdf` · mínim 400.000 bytes · ha de contenir «Código Penal», «Artículo 379», «Artículo 237», «Artículo 1», «Artículo 2»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t27-001` · *art. 234 i 237* — Que, en el punt citat, la resposta a «Quina és la diferència essencial entre furt i robatori?» és «L’ús de força en les coses o de violència o intimidació en les persones».
  - `q-roses-t27-002` · *art. 234* — Que, en el punt citat, la resposta a «Quin és el llindar que separa el furt delicte del furt delicte lleu?» és «400 euros».
  - `q-roses-t27-003` · *art. 238* — Que, en el punt citat, la resposta a «Quin d’aquests supòsits NO constitueix força en les coses segons el Codi penal?» és «Arrencar un objecte pesant per poder-se’l endur».
  - …i 14 més, totes al JSON.

### `llei-4-2003-seguretat-publica` — Llei d’ordenació del sistema de seguretat pública de Catalunya (text consolidat)

- **Identificador legal:** Llei 4/2003, de 7 d’abril
- **Organisme:** Portal Jurídic de Catalunya
- **Publicació:** 2003-04-24 · **consolidació:** consolidat
- **URL canònica:** https://portaljuridic.gencat.cat/eli/es-ct/l/2003/04/07/4
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2003-9013 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 1-10: objecte, integrants del sistema (art. 3.1), funcions de l’alcalde (art. 4), Consell de Seguretat de Catalunya (art. 6), juntes locals de seguretat (art. 9, amb els convidats amb veu i sense vot), planificació i coordinació de policies locals.
- **Articles citats pel banc:** 1, 10
- **Consumidors:** 6 preguntes pròpies · 3 microlliçons · 3 temes · **9 en total**
- **Preguntes oficials que podria explicar:** 13
- **Paquet offline:** `llei-4-2003-seguretat-publica.pdf` · mínim 80.000 bytes · ha de contenir «seguretat pública», «Article 9», «Article 1», «Article 10»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t04-005` · *formació i coordinació policial* — Que, en el punt citat, la resposta a «La formació dels membres dels cossos de policia local de Catalunya correspon principalment a:» és «L’Institut de Seguretat Pública de Catalunya».
  - `q-roses-t22-001` · *objecte de la llei* — Que, en el punt citat, la resposta a «La Llei 4/2003 de Catalunya regula:» és «L’ordenació del sistema de seguretat pública de Catalunya».
  - `q-roses-t22-002` · *òrgans del sistema* — Que, en el punt citat, la resposta a «Quin és l’òrgan consultiu i de participació superior en matèria de seguretat de Catalunya?» és «El Consell de Seguretat de Catalunya».
  - …i 6 més, totes al JSON.

### `llei-40-2015-rjsp` — Llei de règim jurídic del sector públic

- **Identificador legal:** Llei 40/2015, d’1 d’octubre
- **Organisme:** BOE
- **Publicació:** 2015-10-02 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/l/2015/10/01/40/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 23 i 24 (abstenció i recusació) i art. 25-31 (òrgans col·legiats).
- **Articles citats pel banc:** 23, 25, 31
- **Consumidors:** 3 preguntes pròpies · 2 microlliçons · 3 temes · **5 en total**
- **Preguntes oficials que podria explicar:** 9
- **Paquet offline:** `llei-40-2015-rjsp.pdf` · mínim 200.000 bytes · ha de contenir «Régimen Jurídico del Sector Público», «Artículo 23», «Artículo 25»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t08-005` · *art. 23* — Que, en el punt citat, la resposta a «L’abstenció en els assumptes en què es tingui un interès personal és, segons l’Estatut bàsic:» és «Un principi ètic d’obligat compliment».
  - `q-roses-t12-003` · *art. 25 a 31* — Que, en el punt citat, la resposta a «Quin d’aquests principis és específic de la potestat sancionadora?» és «El principi de tipicitat».
  - `q-roses-t15-005` · *art. 23 i 24* — Que, en el punt citat, la resposta a «Un funcionari amb amistat íntima amb la persona interessada en un expedient:» és «S’ha d’abstenir i comunicar-ho al seu superior».
  - …i 2 més, totes al JSON.

### `rdleg-6-2015-ltsv` — Text refós de la Llei sobre trànsit, circulació de vehicles de motor i seguretat viària

- **Identificador legal:** Reial decret legislatiu 6/2015, de 30 d’octubre
- **Organisme:** BOE
- **Publicació:** 2015-10-31 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/rdlg/2015/10/30/6/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Immobilització i retirada de vehicles, tractament del vehicle residual o abandonat, obligació de sotmetre’s a les proves de detecció, presència de drogues i el règim sancionador (incloent-hi la prescripció de les infraccions).
- **Consumidors:** 6 preguntes pròpies · 2 microlliçons · 2 temes · **8 en total**
- **Preguntes oficials que podria explicar:** 8
- **Paquet offline:** `rdleg-6-2015-ltsv.pdf` · mínim 300.000 bytes · ha de contenir «Tráfico», «Seguridad Vial»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t32-001` · *immobilització i retirada de vehicles* — Que, en el punt citat, la resposta a «Quina diferència hi ha entre immobilització i retirada d’un vehicle?» és «La immobilització deixa el vehicle al lloc sense poder circular; la retirada el trasllada al dipòsit».
  - `q-roses-t32-002` · *tractament residual del vehicle* — Que, en el punt citat, la resposta a «Quan es presumeix que un vehicle està abandonat per romandre al dipòsit?» és «Quan hi ha estat més de dos mesos».
  - `q-roses-t32-003` · *causes d’immobilització* — Que, en el punt citat, la resposta a «Quina d’aquestes és causa d’immobilització d’un vehicle?» és «Que el conductor superi la taxa d’alcohol permesa o es negui a les proves».
  - …i 5 més, totes al JSON.

### `roses-ordenances-index` — Índex d’ordenances i bans municipals de Roses

- **Identificador legal:** Pàgina institucional, sense identificador normatiu
- **Organisme:** Ajuntament de Roses
- **Publicació:** sense data (pàgina viva) · **consolidació:** pagina-viva
- **URL canònica:** https://www.roses.cat/ajuntament/informacio-administrativa/ordenances-i-bans-1
- **Alternatives oficials:** https://www.roses.cat/ajuntament/informacio-administrativa
- **Format esperat:** html · MIME `text/html`
- **Què en cal:** La relació d’ordenances vigents amb la seva data. Serveix per confirmar que les dues ordenances ja adoptades són les vigents i per delimitar àmbits i zones del terme municipal.
- **Consumidors:** 0 preguntes pròpies · 2 microlliçons · 2 temes · **2 en total**
- **Preguntes oficials que podria explicar:** 8
- **Paquet offline:** `roses-ordenances-index.html` · mínim 4.000 bytes · ha de contenir «ordenan»

  Afirmacions que ha de demostrar (mostra):
  - `roses-t06-l1` · *ordenances vigents de Roses* — Que el punt citat sosté el contingut de la microlliçó «Ordenances i bans: les normes que aplica la policia local».
  - `roses-t31-l1` · *delimitació d’àmbits i zones al terme municipal* — Que el punt citat sosté el contingut de la microlliçó «Roses: territori, història i equipaments».

### `decret-179-2015-disciplinari` — Decret pel qual s’aprova el Reglament del procediment disciplinari de les policies locals

- **Identificador legal:** Decret 179/2015, de 4 d’agost
- **Organisme:** Portal Jurídic de Catalunya
- **Publicació:** 2015-08-06 · **consolidació:** consolidat
- **URL canònica:** https://portaljuridic.gencat.cat/eli/es-ct/d/2015/08/04/179
- **Alternatives oficials:** https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=700380 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** El reglament del procediment sencer i les mesures cautelars.
- **Consumidors:** 2 preguntes pròpies · 1 microlliçons · 1 temes · **3 en total**
- **Preguntes oficials que podria explicar:** 7
- **Paquet offline:** `decret-179-2015-disciplinari.pdf` · mínim 60.000 bytes · ha de contenir «disciplinari»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t11-001` · *reglament del procediment* — Que, en el punt citat, la resposta a «El règim disciplinari dels cossos de policia local de Catalunya es regula principalment a:» és «La Llei 16/1991 i el Decret 179/2015».
  - `q-roses-t11-003` · *mesures cautelars* — Que, en el punt citat, la resposta a «La suspensió provisional de funcions durant la tramitació d’un expedient disciplinari és:» és «Una mesura cautelar que no prejutja el resultat de l’expedient».
  - `roses-t11-l1` · *procediment disciplinari i mesures cautelars* — Que el punt citat sosté el contingut de la microlliçó «Règim disciplinari de la policia local».

### `roses-web-municipi` — Web municipal de Roses: municipi, nuclis, patrimoni i equipaments

- **Identificador legal:** Pàgina institucional, sense identificador normatiu
- **Organisme:** Ajuntament de Roses
- **Publicació:** sense data (pàgina viva) · **consolidació:** pagina-viva
- **URL canònica:** https://www.roses.cat/
- **Alternatives oficials:** https://www.roses.cat/el-municipi *(derivada, cal comprovar-la)*
- **Format esperat:** html · MIME `text/html`
- **Què en cal:** Les seccions de geografia, nuclis i urbanitzacions, patrimoni (Ciutadella, Castell de la Trinitat, patrimoni megalític) i equipaments. És la font del tema 31, l’únic tema de coneixement local del temari.
- **Consumidors:** 14 preguntes pròpies · 1 microlliçons · 1 temes · **15 en total**
- **Preguntes oficials que podria explicar:** 5
- **Paquet offline:** `roses-web-municipi.html` · mínim 8.000 bytes · ha de contenir «Roses»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t31-001` · *situació geogràfica del municipi* — Que, en el punt citat, la resposta a «A quina comarca pertany el municipi de Roses?» és «L'Alt Empordà».
  - `q-roses-t31-002` · *entorn natural del municipi* — Que, en el punt citat, la resposta a «Entre quins dos parcs naturals se situa el terme municipal de Roses?» és «Cap de Creus i Aiguamolls de l’Empordà».
  - `q-roses-t31-003` · *patrimoni històric: Ciutadella* — Que, en el punt citat, la resposta a «Quina colònia grega es va establir al lloc on avui hi ha la Ciutadella de Roses?» és «Rhode».
  - …i 12 més, totes al JSON.

### `lo-4-2015-psc` — Llei orgànica de protecció de la seguretat ciutadana

- **Identificador legal:** Llei orgànica 4/2015, de 30 de març
- **Organisme:** BOE
- **Publicació:** 2015-03-31 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/lo/2015/03/30/4/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2015-3442 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 4 (principis), 15-20 (potestats: entrada, identificació, registres), 16 i 16.3 (identificació i termini màxim), 23 (reunions i manifestacions) i 35-39 (règim sancionador i quanties).
- **Articles citats pel banc:** 4, 15, 16, 20, 23, 35, 39
- **Consumidors:** 6 preguntes pròpies · 1 microlliçons · 2 temes · **7 en total**
- **Preguntes oficials que podria explicar:** 5
- **Paquet offline:** `lo-4-2015-psc.pdf` · mínim 120.000 bytes · ha de contenir «Seguridad Ciudadana», «Artículo 16», «Artículo 4», «Artículo 15»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t26-001` · *art. 16* — Que, en el punt citat, la resposta a «El temps màxim de permanència en dependències policials per a una diligència d’identificació és de:» és «6 hores».
  - `q-roses-t26-002` · *art. 16.3* — Que, en el punt citat, la resposta a «El trasllat a dependències per a una diligència d’identificació:» és «No és una detenció, però s’ha de registrar al llibre-registre corresponent».
  - `q-roses-t26-003` · *art. 20* — Que, en el punt citat, la resposta a «Un registre corporal que obligui a deixar a la vista parts del cos normalment cobertes:» és «S’ha de fer en un lloc reservat, fora de la vista de tercers, i se n’ha d’estendre diligència».
  - …i 4 més, totes al JSON.

### `rd-1428-2003-rgc` — Reglament general de circulació

- **Identificador legal:** Reial decret 1428/2003, de 21 de novembre
- **Organisme:** BOE
- **Publicació:** 2003-12-23 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/rd/2003/11/21/1428/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 20-28 (normes sobre begudes alcohòliques i estupefaents): taxes d’alcoholèmia, taxes especials de ciclistes i conductors novells, i pràctica de les proves de detecció.
- **Consumidors:** 2 preguntes pròpies · 1 microlliçons · 1 temes · **3 en total**
- **Preguntes oficials que podria explicar:** 5
- **Paquet offline:** `rd-1428-2003-rgc.pdf` · mínim 400.000 bytes · ha de contenir «Reglamento General de Circulación», «Artículo 20»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t33-002` · *taxes d’alcoholèmia* — Que, en el punt citat, la resposta a «Quina és la taxa màxima d’alcohol en aire espirat per a un conductor novell o professional?» és «0,15 mg/l».
  - `q-roses-t33-003` · *pràctica de les proves de detecció alcohòlica* — Que, en el punt citat, la resposta a «La pràctica de la prova d’alcoholèmia amb etilòmetre exigeix:» és «Dues determinacions successives amb un interval mínim de deu minuts».
  - `roses-t33-l1` · *normes sobre begudes alcohòliques i estupefaents, i pràctica de les proves* — Que el punt citat sosté el contingut de la microlliçó «Alcohol i drogues al volant».

### `lecrim-1882` — Llei d’enjudiciament criminal (text consolidat)

- **Identificador legal:** Reial decret de 14 de setembre de 1882 · Gaceta de Madrid, de 17/09/1882 (BOE-A-1882-6036)
- **Organisme:** BOE
- **Publicació:** 1882-09-17 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/buscar/act.php?id=BOE-A-1882-6036
- **Alternatives oficials:** https://www.boe.es/buscar/pdf/1882/BOE-A-1882-6036-consolidado.pdf *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 490, 492, 496 i 520 (detenció i drets de la persona detinguda), 519 (presó provisional en peça separada), 544 ter sencer (ordre de protecció, apartats 1, 3, 4 i 7), la competència per a delictes lleus i el valor de l’atestat.
- **Articles citats pel banc:** 490, 520, 544
- **Consumidors:** 10 preguntes pròpies · 3 microlliçons · 3 temes · **13 en total**
- **Preguntes oficials que podria explicar:** 4
- **Paquet offline:** `lecrim-1882.pdf` · mínim 500.000 bytes · ha de contenir «Enjuiciamiento Criminal», «Artículo 520», «Artículo 544 ter», «Artículo 490»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t28-001` · *competència per a l’enjudiciament de delictes lleus* — Que, en el punt citat, la resposta a «Quin òrgan judicial enjudicia els delictes lleus?» és «El jutjat d’instrucció».
  - `q-roses-t28-002` · *parts acusadores* — Que, en el punt citat, la resposta a «L’acusació popular és la que exerceix:» és «Qualsevol ciutadà en els delictes públics, encara que no sigui la persona ofesa».
  - `q-roses-t28-003` · *valor de l’atestat* — Que, en el punt citat, la resposta a «Quin valor té, en principi, l’atestat policial en el procés penal?» és «Valor de denúncia».
  - …i 10 més, totes al JSON.

## P1 — 23 fonts

### `lo-5-2000-menors` — Llei orgànica reguladora de la responsabilitat penal dels menors

- **Identificador legal:** Llei orgànica 5/2000, de 12 de gener
- **Organisme:** BOE
- **Publicació:** 2000-01-13 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/lo/2000/01/12/5/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2000-641 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Exposició de motius, art. 1 i 3 (àmbit i menors de catorze anys), 7 (mesures) i 16-17 (detenció: 17.3 i 17.4, entrevista reservada i termini màxim).
- **Articles citats pel banc:** 1, 7, 16, 17
- **Consumidors:** 5 preguntes pròpies · 1 microlliçons · 1 temes · **6 en total**
- **Preguntes oficials que podria explicar:** 4
- **Paquet offline:** `lo-5-2000-menors.pdf` · mínim 150.000 bytes · ha de contenir «responsabilidad penal de los menores», «Artículo 17», «Artículo 1», «Artículo 7»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t40-001` · *art. 1 i 3* — Que, en el punt citat, la resposta a «A quines edats s’aplica la Llei orgànica 5/2000, reguladora de la responsabilitat penal dels menors?» és «A partir dels 14 i fins als 18 anys».
  - `q-roses-t40-002` · *art. 17.4* — Que, en el punt citat, la resposta a «Quin és el termini màxim de detenció d’un menor per part de funcionaris de policia?» és «24 hores».
  - `q-roses-t40-003` · *art. 16 i 17* — Que, en el punt citat, la resposta a «Un menor detingut ha de ser posat a disposició de:» és «El Ministeri Fiscal».
  - …i 3 més, totes al JSON.

### `rdleg-5-2015-trebep` — Text refós de la Llei de l’Estatut bàsic de l’empleat públic

- **Identificador legal:** Reial decret legislatiu 5/2015, de 30 d’octubre
- **Organisme:** BOE
- **Publicació:** 2015-10-31 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/rdlg/2015/10/30/5/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2015-11719 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 8 (classes d’empleats públics), 14 i 15 (drets), i 52-54 (deures i codi de conducta).
- **Articles citats pel banc:** 8, 14, 52, 53, 54
- **Consumidors:** 6 preguntes pròpies · 1 microlliçons · 2 temes · **7 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `rdleg-5-2015-trebep.pdf` · mínim 150.000 bytes · ha de contenir «empleado público», «Artículo 52», «Artículo 8», «Artículo 14»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t08-001` · *art. 8* — Que, en el punt citat, la resposta a «Segons l’Estatut bàsic de l’empleat públic, quines són les classes d’empleats públics?» és «Funcionaris de carrera, funcionaris interins, personal laboral i personal eventual».
  - `q-roses-t08-002` · *art. 14 i 15* — Que, en el punt citat, la resposta a «Quin d’aquests drets s’exerceix col·lectivament segons l’Estatut bàsic de l’empleat públic?» és «La llibertat sindical».
  - `q-roses-t08-003` · *art. 54* — Que, en el punt citat, la resposta a «El deure d’obediència d’un empleat públic cedeix quan la instrucció rebuda:» és «Constitueix una infracció manifesta, clara i terminant de l’ordenament jurídic».
  - …i 4 més, totes al JSON.

### `llei-53-1984-incompat` — Llei d’incompatibilitats del personal al servei de les administracions públiques

- **Identificador legal:** Llei 53/1984, de 26 de desembre
- **Organisme:** BOE
- **Publicació:** 1985-01-04 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/l/1984/12/26/53/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1985-151 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 1 (principi general), 3, 11 i 12 (activitats privades), 14 (autorització de compatibilitat) i 16 (excepcions).
- **Articles citats pel banc:** 1, 3, 11, 14, 16
- **Consumidors:** 5 preguntes pròpies · 1 microlliçons · 1 temes · **6 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `llei-53-1984-incompat.pdf` · mínim 60.000 bytes · ha de contenir «incompatibilidades», «Artículo 14», «Artículo 1», «Artículo 3»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t09-001` · *art. 1* — Que, en el punt citat, la resposta a «El principi general de la Llei 53/1984 d’incompatibilitats és que el personal al servei de les administracions públiques:» és «Només pot ocupar un lloc de treball al sector públic».
  - `q-roses-t09-002` · *art. 16* — Que, en el punt citat, la resposta a «No es pot autoritzar la compatibilitat per a activitats privades quan el complement específic o concepte equiparable supera:» és «El 30 % de la retribució bàsica, exclosa l’antiguitat».
  - `q-roses-t09-003` · *art. 14* — Que, en el punt citat, la resposta a «El reconeixement de compatibilitat per a una segona activitat:» és «No pot modificar la jornada de treball ni l’horari de la persona interessada».
  - …i 3 més, totes al JSON.

### `rdleg-2-2004-trlrhl` — Text refós de la Llei reguladora de les hisendes locals

- **Identificador legal:** Reial decret legislatiu 2/2004, de 5 de març
- **Organisme:** BOE
- **Publicació:** 2004-03-09 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/rdlg/2004/03/05/2/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 2 (recursos), 20 i 41 (taxes i preus públics), 59 (tributs propis), 162, 164, 168 i 169 (pressupost: elaboració i aprovació).
- **Articles citats pel banc:** 2, 20, 59, 168, 169
- **Consumidors:** 5 preguntes pròpies · 1 microlliçons · 1 temes · **6 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `rdleg-2-2004-trlrhl.pdf` · mínim 200.000 bytes · ha de contenir «Haciendas Locales», «Artículo 169», «Artículo 2», «Artículo 20»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t10-001` · *art. 59* — Que, en el punt citat, la resposta a «Quins impostos són d’exigència obligatòria per als ajuntaments?» és «IBI, IAE i IVTM».
  - `q-roses-t10-002` · *art. 169.6* — Que, en el punt citat, la resposta a «Si el pressupost municipal no està aprovat definitivament l’1 de gener:» és «Es prorroga automàticament el de l’exercici anterior amb els seus crèdits inicials».
  - `q-roses-t10-003` · *art. 20 i 41* — Que, en el punt citat, la resposta a «La diferència essencial entre una taxa i un preu públic és que:» és «La taxa retribueix serveis de recepció obligatòria o en règim de monopoli públic; el preu públic, serveis de recepció voluntària que també presta el sector privat».
  - …i 3 més, totes al JSON.

### `decret-151-1998-juntes` — Decret de regulació de les juntes locals de seguretat

- **Identificador legal:** Decret 151/1998, de 23 de juny
- **Organisme:** Portal Jurídic de Catalunya
- **Publicació:** 1998-06-30 · **consolidació:** consolidat
- **URL canònica:** https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=194957
- **Alternatives oficials:** https://dogc.gencat.cat/ca/document-del-dogc/?documentId=194957 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Àmbit d’aplicació, composició i presidència, funcions, funcionament i coordinació de dispositius.
- **Consumidors:** 5 preguntes pròpies · 1 microlliçons · 1 temes · **6 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `decret-151-1998-juntes.pdf` · mínim 30.000 bytes · ha de contenir «juntes locals de seguretat»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t23-001` · *composició i presidència* — Que, en el punt citat, la resposta a «Qui presideix la junta local de seguretat?» és «L’alcalde o alcaldessa».
  - `q-roses-t23-002` · *àmbit d’aplicació* — Que, en el punt citat, la resposta a «En quins municipis és obligatòria la constitució d’una junta local de seguretat?» és «En els municipis que disposen de cos de policia local propi».
  - `q-roses-t23-003` · *funcions* — Que, en el punt citat, la resposta a «Quina d’aquestes és una funció pròpia de la junta local de seguretat?» és «Analitzar la situació de seguretat, aprovar el pla local de seguretat i fixar criteris de coordinació».
  - …i 3 més, totes al JSON.

### `llei-19-2013-transp` — Llei de transparència, accés a la informació pública i bon govern

- **Identificador legal:** Llei 19/2013, de 9 de desembre
- **Organisme:** BOE
- **Publicació:** 2013-12-10 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/l/2013/12/09/19/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2013-12887 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 5-8 (publicitat activa), 14 i 16 (límits i accés parcial), 17 (sol·licitud) i 20 (resolució).
- **Articles citats pel banc:** 5, 8, 14, 17, 20, 24
- **Consumidors:** 4 preguntes pròpies · 1 microlliçons · 1 temes · **5 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `llei-19-2013-transp.pdf` · mínim 100.000 bytes · ha de contenir «transparencia», «Artículo 17», «Artículo 5», «Artículo 8»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t18-001` · *art. 17* — Que, en el punt citat, la resposta a «Per exercir el dret d’accés a la informació pública cal:» és «No cal motivar-la, tot i que es pot exposar el motiu».
  - `q-roses-t18-002` · *art. 20* — Que, en el punt citat, la resposta a «El termini màxim per resoldre una sol·licitud d’accés a la informació pública és de:» és «Un mes».
  - `q-roses-t18-004` · *art. 5 a 8* — Que, en el punt citat, la resposta a «La publicitat activa consisteix en:» és «Publicar periòdicament i actualitzada informació sense que ningú l’hagi demanat».
  - …i 2 més, totes al JSON.

### `rd-818-2009-rgcond` — Reglament general de conductors

- **Identificador legal:** Reial decret 818/2009, de 8 de maig
- **Organisme:** BOE
- **Publicació:** 2009-06-08 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/rd/2009/05/08/818/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 4-7 i annex: classes de permisos i llicències, vehicles que autoritza cada classe i edats mínimes (inclòs el D1).
- **Consumidors:** 1 preguntes pròpies · 1 microlliçons · 1 temes · **2 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `rd-818-2009-rgcond.pdf` · mínim 400.000 bytes · ha de contenir «Reglamento General de Conductores», «permiso»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t32-005` · *classes de permisos de conducció* — Que, en el punt citat, la resposta a «Quin permís habilita per conduir turismes?» és «El permís B».
  - `roses-t32-l1` · *classes de permisos i llicències de conducció* — Que el punt citat sosté el contingut de la microlliçó «Permisos, llicències i retirada de vehicles».

### `llei-19-2014-transp-cat` — Llei de transparència, accés a la informació pública i bon govern de Catalunya

- **Identificador legal:** Llei 19/2014, de 29 de desembre
- **Organisme:** Portal Jurídic de Catalunya
- **Publicació:** 2014-12-31 · **consolidació:** consolidat
- **URL canònica:** https://portaljuridic.gencat.cat/eli/es-ct/l/2014/12/29/19
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2015-470 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** El dret d’accés i la Comissió de Garantia del Dret d’Accés a la Informació Pública (GAIP).
- **Consumidors:** 1 preguntes pròpies · 1 microlliçons · 1 temes · **2 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `llei-19-2014-transp-cat.pdf` · mínim 100.000 bytes · ha de contenir «transparència»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t18-003` · *Comissió de Garantia del Dret d’Accés* — Que, en el punt citat, la resposta a «Quin òrgan resol les reclamacions en matèria d’accés a la informació pública a Catalunya?» és «La Comissió de Garantia del Dret d’Accés a la Informació Pública».
  - `roses-t18-l1` · *dret d’accés i Comissió de Garantia del Dret d’Accés* — Que el punt citat sosté el contingut de la microlliçó «Transparència i accés a la informació pública».

### `agencia-ciberseguretat-catalunya` — Agència de Ciberseguretat de Catalunya: funcions, amenaces i autoprotecció

- **Identificador legal:** Pàgina institucional; l’Agència es crea per la Llei 15/2019, de 29 de novembre
- **Organisme:** Generalitat de Catalunya
- **Publicació:** sense data (pàgina viva) · **consolidació:** pagina-viva
- **URL canònica:** https://ciberseguretat.gencat.cat/
- **Alternatives oficials:** https://portaljuridic.gencat.cat/eli/es-ct/l/2019/11/29/15 *(derivada, cal comprovar-la)*
- **Format esperat:** html · MIME `text/html`
- **Què en cal:** Funcions institucionals, tipologia d’amenaces i incidents, mesures d’autoprotecció i preservació de proves digitals.
- **Consumidors:** 5 preguntes pròpies · 1 microlliçons · 1 temes · **6 en total**
- **Preguntes oficials que podria explicar:** 2
- **Paquet offline:** `agencia-ciberseguretat-catalunya.html` · mínim 5.000 bytes · ha de contenir «ciberseguretat»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t19-001` · *recomanacions i tipologia d’incidents* — Que, en el punt citat, la resposta a «Quin és el vector d’entrada més freqüent dels incidents de ciberseguretat?» és «L’enginyeria social, especialment la pesca d’identitat per correu».
  - `q-roses-t19-002` · *funcions institucionals* — Que, en el punt citat, la resposta a «Quin organisme executa les polítiques públiques de ciberseguretat a Catalunya?» és «L’Agència de Ciberseguretat de Catalunya».
  - `q-roses-t19-003` · *tipologia d’amenaces* — Que, en el punt citat, la resposta a «Quina d’aquestes definicions correspon al ransomware?» és «Programari que xifra la informació de la víctima i n’exigeix un rescat».
  - …i 3 més, totes al JSON.

### `llei-50-1999-app` — Llei sobre el règim jurídic de la tinença d’animals potencialment perillosos

- **Identificador legal:** Llei 50/1999, de 23 de desembre
- **Organisme:** BOE
- **Publicació:** 1999-12-24 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/l/1999/12/23/50/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1999-24419 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 2 (concepte), 3 (llicència administrativa) i els requisits per obtenir-la.
- **Consumidors:** 3 preguntes pròpies · 1 microlliçons · 1 temes · **4 en total**
- **Preguntes oficials que podria explicar:** 2
- **Paquet offline:** `llei-50-1999-app.pdf` · mínim 40.000 bytes · ha de contenir «animales potencialmente peligrosos»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t34-001` · *concepte* — Que, en el punt citat, la resposta a «Quines vies hi ha perquè un gos sigui considerat potencialment perillós?» és «Per raça o encreuament, per episodis d’agressió previs i per ensinistrament per a l’atac i la defensa».
  - `q-roses-t34-002` · *llicència administrativa* — Que, en el punt citat, la resposta a «Qui atorga la llicència per a la tinença de gossos potencialment perillosos?» és «L’ajuntament del municipi de residència de la persona sol·licitant».
  - `q-roses-t34-003` · *requisits de la llicència* — Que, en el punt citat, la resposta a «Quin d’aquests NO és un requisit per obtenir la llicència de tinença d’un gos potencialment perillós?» és «Acreditar una formació prèvia com a ensinistrador caní».
  - …i 1 més, totes al JSON.

### `rd-287-2002-app` — Reglament de desplegament de la Llei 50/1999, d’animals potencialment perillosos

- **Identificador legal:** Reial decret 287/2002, de 22 de març
- **Organisme:** BOE
- **Publicació:** 2002-03-27 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/rd/2002/03/22/287/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2002-6016 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Llista estatal de races (annex I), requisits de la llicència (art. 3) i mesures de seguretat a la via pública: corretja i morrió (art. 8).
- **Consumidors:** 2 preguntes pròpies · 1 microlliçons · 1 temes · **3 en total**
- **Preguntes oficials que podria explicar:** 2
- **Paquet offline:** `rd-287-2002-app.pdf` · mínim 40.000 bytes · ha de contenir «potencialmente peligrosos», «Anexo»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t34-003` · *desenvolupament reglamentari* — Que, en el punt citat, la resposta a «Quin d’aquests NO és un requisit per obtenir la llicència de tinença d’un gos potencialment perillós?» és «Acreditar una formació prèvia com a ensinistrador caní».
  - `q-roses-t34-004` · *mesures de seguretat a la via pública* — Que, en el punt citat, la resposta a «A la via pública, un gos potencialment perillós ha d’anar:» és «Lligat amb corretja no extensible de longitud limitada i amb morrió».
  - `roses-t34-l1` · *llista de races i requisits de la llicència* — Que el punt citat sosté el contingut de la microlliçó «Animals de companyia i gossos potencialment perillosos».

### `llei-10-1999-gossos-cat` — Llei sobre la tinença de gossos considerats potencialment perillosos

- **Identificador legal:** Llei 10/1999, de 30 de juliol · DOGC núm. 2948
- **Organisme:** Portal Jurídic de Catalunya
- **Publicació:** 1999-08-09 · **consolidació:** consolidat
- **URL canònica:** https://portaljuridic.gencat.cat/eli/es-ct/l/1999/07/30/10
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1999-17124 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 1-2 (gossos considerats potencialment perillosos i llista catalana de races), identificació i registre censal, art. 7 (infraccions lleus) i el règim propi respecte de la llei estatal.
- **Consumidors:** 2 preguntes pròpies · 1 microlliçons · 1 temes · **3 en total**
- **Preguntes oficials que podria explicar:** 2
- **Paquet offline:** `llei-10-1999-gossos-cat.pdf` · mínim 30.000 bytes · ha de contenir «gossos», «perillosos»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t34-001` · *gossos considerats potencialment perillosos* — Que, en el punt citat, la resposta a «Quines vies hi ha perquè un gos sigui considerat potencialment perillós?» és «Per raça o encreuament, per episodis d’agressió previs i per ensinistrament per a l’atac i la defensa».
  - `q-roses-t34-005` · *identificació i registre* — Que, en el punt citat, la resposta a «La identificació per microxip i la inscripció al registre censal municipal són obligatòries per a:» és «Tots els gossos».
  - `roses-t34-l1` · *llista catalana de races i règim propi* — Que el punt citat sosté el contingut de la microlliçó «Animals de companyia i gossos potencialment perillosos».

### `roses-tramits-animals` — Tràmit municipal de llicència per a la tinença i conducció d’animals potencialment perillosos

- **Identificador legal:** Pàgina institucional, sense identificador normatiu
- **Organisme:** Ajuntament de Roses
- **Publicació:** sense data (pàgina viva) · **consolidació:** pagina-viva
- **URL canònica:** https://www.roses.cat/tramits/llicancia-per-a-la-tinenaa-i-conduccia-danimals
- **Alternatives oficials:** https://www.roses.cat/tramits
- **Format esperat:** html · MIME `text/html`
- **Què en cal:** Els requisits municipals de la llicència: documentació, vigència i taxa.
- **Consumidors:** 1 preguntes pròpies · 1 microlliçons · 1 temes · **2 en total**
- **Preguntes oficials que podria explicar:** 2
- **Paquet offline:** `roses-tramits-animals.html` · mínim 3.000 bytes · ha de contenir «llic»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t34-002` · *tràmit municipal a Roses* — Que, en el punt citat, la resposta a «Qui atorga la llicència per a la tinença de gossos potencialment perillosos?» és «L’ajuntament del municipi de residència de la persona sol·licitant».
  - `roses-t34-l1` · *requisits municipals de la llicència a Roses* — Que el punt citat sosté el contingut de la microlliçó «Animals de companyia i gossos potencialment perillosos».

### `lo-6-1984-habeas` — Llei orgànica reguladora del procediment d’habeas corpus

- **Identificador legal:** Llei orgànica 6/1984, de 24 de maig
- **Organisme:** BOE
- **Publicació:** 1984-05-26 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/lo/1984/05/24/6/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1984-11620 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 1 (supòsits), 2 (competència), 3 (legitimació) i 7 (termini de 24 hores).
- **Articles citats pel banc:** 1, 2, 3, 9
- **Consumidors:** 3 preguntes pròpies · 1 microlliçons · 1 temes · **4 en total**
- **Preguntes oficials que podria explicar:** 1
- **Paquet offline:** `lo-6-1984-habeas.pdf` · mínim 30.000 bytes · ha de contenir «Habeas Corpus», «Artículo 3», «Artículo 1», «Artículo 2»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t37-003` · *art. 3* — Que, en el punt citat, la resposta a «Qui NO està legitimat per instar un procediment d’habeas corpus?» és «Qualsevol veí del municipi sense relació amb la persona detinguda».
  - `q-roses-t37-004` · *art. 2 i 7* — Que, en el punt citat, la resposta a «Quin jutge és competent per conèixer d’un procediment d’habeas corpus?» és «El jutge d’instrucció del lloc on es trobi la persona detinguda».
  - `q-roses-t37-005` · *art. 1* — Que, en el punt citat, la resposta a «L’habeas corpus serveix per:» és «Examinar la legalitat de la privació de llibertat».
  - …i 1 més, totes al JSON.

### `rgpd-2016-679` — Reglament general de protecció de dades

- **Identificador legal:** Reglament (UE) 2016/679, de 27 d’abril de 2016 · DOUE L 119, de 04/05/2016
- **Organisme:** EUR-Lex
- **Publicació:** 2016-05-04 · **consolidació:** consolidat
- **URL canònica:** https://eur-lex.europa.eu/legal-content/CA/TXT/?uri=CELEX:32016R0679
- **Alternatives oficials:** https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 5 (principis, amb 5.1.b), 6 (bases de legitimació) i 15-22 (drets de les persones).
- **Articles citats pel banc:** 5, 6, 15, 22
- **Consumidors:** 3 preguntes pròpies · 1 microlliçons · 1 temes · **4 en total**
- **Preguntes oficials que podria explicar:** 1
- **Paquet offline:** `rgpd-2016-679.pdf` · mínim 300.000 bytes · ha de contenir «2016/679», «Article 5», «Article 6»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t20-001` · *art. 5* — Que, en el punt citat, la resposta a «Quin d’aquests NO és un principi del tractament de dades del Reglament general de protecció de dades?» és «Gratuïtat del tractament».
  - `q-roses-t20-002` · *art. 6* — Que, en el punt citat, la resposta a «Quina és la base de legitimació habitual del tractament de dades en l’actuació policial?» és «El compliment d’una obligació legal i l’exercici de poders públics».
  - `q-roses-t20-005` · *art. 5.1.b* — Que, en el punt citat, la resposta a «Publicar a xarxes socials imatges gravades per una càmera de vehicle policial seria:» és «Un tractament nou que necessitaria base legal pròpia i que, en general, seria il·lícit».
  - …i 1 més, totes al JSON.

### `lo-3-2018-lopdgdd` — Llei orgànica de protecció de dades personals i garantia dels drets digitals

- **Identificador legal:** Llei orgànica 3/2018, de 5 de desembre
- **Organisme:** BOE
- **Publicació:** 2018-12-06 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/lo/2018/12/05/3/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Objecte i àmbit (art. 1-3), tractaments per obligació legal (art. 8) i drets (títol III).
- **Consumidors:** 2 preguntes pròpies · 1 microlliçons · 1 temes · **3 en total**
- **Preguntes oficials que podria explicar:** 1
- **Paquet offline:** `lo-3-2018-lopdgdd.pdf` · mínim 150.000 bytes · ha de contenir «Protección de Datos Personales», «Artículo 8»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t20-002` · *tractaments per obligació legal* — Que, en el punt citat, la resposta a «Quina és la base de legitimació habitual del tractament de dades en l’actuació policial?» és «El compliment d’una obligació legal i l’exercici de poders públics».
  - `q-roses-t20-004` · *objecte* — Que, en el punt citat, la resposta a «El dret a la protecció de dades personals:» és «És un dret fonamental autònom, diferenciat del dret a la intimitat».
  - `roses-t20-l1` · *disposicions generals i drets* — Que el punt citat sosté el contingut de la microlliçó «Protecció de dades».

### `lo-7-2021-dades-policials` — Llei orgànica de protecció de dades personals tractades per a fins de prevenció, detecció, investigació i enjudiciament d’infraccions penals

- **Identificador legal:** Llei orgànica 7/2021, de 26 de maig
- **Organisme:** BOE
- **Publicació:** 2021-05-27 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/lo/2021/05/26/7/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2021-8806 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Objecte i àmbit d’aplicació (art. 1-3) i finalitats del tractament (art. 5-6).
- **Consumidors:** 2 preguntes pròpies · 0 microlliçons · 1 temes · **2 en total**
- **Preguntes oficials que podria explicar:** 1
- **Paquet offline:** `lo-7-2021-dades-policials.pdf` · mínim 100.000 bytes · ha de contenir «infracciones penales», «Artículo 1»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t20-003` · *objecte i àmbit d’aplicació* — Que, en el punt citat, la resposta a «Els tractaments de dades amb finalitats de prevenció, investigació i enjudiciament d’infraccions penals es regeixen per:» és «La normativa específica que transposa la Directiva (UE) 2016/680».
  - `q-roses-t20-005` · *finalitats del tractament* — Que, en el punt citat, la resposta a «Publicar a xarxes socials imatges gravades per una càmera de vehicle policial seria:» és «Un tractament nou que necessitaria base legal pròpia i que, en general, seria il·lícit».

### `lo-1-2015-reforma-cp` — Llei orgànica de modificació del Codi penal de 2015 (text original)

- **Identificador legal:** Llei orgànica 1/2015, de 30 de març
- **Organisme:** BOE
- **Publicació:** 2015-03-31 · **consolidació:** text-original — Aquí cal el text **original**, no el consolidat del Codi penal: el que se’n cita és el preàmbul i la supressió del llibre III, que el text consolidat ja no mostra com a tals.
- **URL canònica:** https://www.boe.es/eli/es/lo/2015/03/30/1/con
- **Alternatives oficials:** https://www.boe.es/buscar/doc.php?id=BOE-A-2015-3439 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Preàmbul (justificació de la reforma), la disposició derogatòria del llibre III (faltes), la presó permanent revisable i la reforma dels delictes contra el patrimoni.
- **Consumidors:** 5 preguntes pròpies · 1 microlliçons · 1 temes · **6 en total**
- **Paquet offline:** `lo-1-2015-reforma-cp.pdf` · mínim 200.000 bytes · ha de contenir «Código Penal», «preámbulo»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t30-001` · *supressió del llibre III* — Que, en el punt citat, la resposta a «Quin llibre del Codi penal va suprimir la Llei orgànica 1/2015?» és «El llibre III».
  - `q-roses-t30-002` · *presó permanent revisable* — Que, en el punt citat, la resposta a «Quina pena va introduir la Llei orgànica 1/2015 per a supòsits d’excepcional gravetat?» és «La presó permanent revisable».
  - `q-roses-t30-003` · *reconversió de les faltes* — Que, en el punt citat, la resposta a «Amb la desaparició de les faltes, moltes conductes menors van passar a ser:» és «Delictes lleus o infraccions administratives, especialment de la Llei orgànica 4/2015».
  - …i 3 més, totes al JSON.

### `lo-3-2007-igualtat` — Llei orgànica per a la igualtat efectiva de dones i homes

- **Identificador legal:** Llei orgànica 3/2007, de 22 de març
- **Organisme:** BOE
- **Publicació:** 2007-03-23 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/lo/2007/03/22/3/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2007-6115 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Art. 3 (principi d’igualtat), 6 (discriminació directa i indirecta), 7 (assetjament sexual i per raó de sexe), 8 (discriminació per embaràs), 9 (indemnitat) i 11 i 51 (accions positives).
- **Articles citats pel banc:** 3, 6, 7, 8, 9, 11
- **Consumidors:** 5 preguntes pròpies · 1 microlliçons · 1 temes · **6 en total**
- **Paquet offline:** `lo-3-2007-igualtat.pdf` · mínim 200.000 bytes · ha de contenir «igualdad efectiva», «Artículo 7», «Artículo 3», «Artículo 6»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t39-001` · *art. 6* — Que, en el punt citat, la resposta a «Es produeix discriminació indirecta per raó de sexe quan:» és «Una disposició, criteri o pràctica aparentment neutres posen persones d’un sexe en desavantatge particular».
  - `q-roses-t39-002` · *art. 7* — Que, en el punt citat, la resposta a «Segons la Llei orgànica 3/2007, l’assetjament sexual i l’assetjament per raó de sexe:» és «Es consideren sempre actes discriminatoris».
  - `q-roses-t39-003` · *art. 11* — Que, en el punt citat, la resposta a «Les accions positives previstes per la llei d’igualtat:» és «Són mesures específiques i temporals, admissibles mentre subsisteixi la desigualtat que pretenen corregir».
  - …i 3 més, totes al JSON.

### `ddhh-1948` — Declaració Universal dels Drets Humans

- **Identificador legal:** Resolució 217 A (III) de l’Assemblea General de les Nacions Unides
- **Organisme:** Nacions Unides
- **Publicació:** 1948-12-10 · **consolidació:** text-original
- **URL canònica:** https://www.un.org/es/about-us/universal-declaration-of-human-rights
- **Alternatives oficials:** https://www.un.org/es/documents/udhr/UDHR_booklet_SP_web.pdf *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `text/html`
- **Què en cal:** Preàmbul i els 30 articles; la seva naturalesa jurídica (resolució, no tractat) i la data de proclamació.
- **Articles citats pel banc:** 1, 30
- **Consumidors:** 4 preguntes pròpies · 1 microlliçons · 1 temes · **5 en total**
- **Paquet offline:** `ddhh-1948.html` · mínim 10.000 bytes · ha de contenir «Derechos Humanos», «Artículo 1», «Artículo 30»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t25-001` · *preàmbul i art. 1 a 30* — Que, en el punt citat, la resposta a «Quants articles té la Declaració Universal dels Drets Humans?» és «30 articles».
  - `q-roses-t25-004` · *naturalesa jurídica* — Que, en el punt citat, la resposta a «Quina diferència jurídica hi ha entre la Declaració Universal i la Carta de Drets Fonamentals de la UE?» és «La Declaració no és un tractat vinculant per si mateixa; la Carta sí que té valor jurídic vinculant».
  - `q-roses-t25-101` · *proclamació* — Que, en el punt citat, la resposta a «En quina data es va proclamar la Declaració Universal dels Drets Humans?» és «El 10 de desembre de 1948».
  - …i 2 més, totes al JSON.

### `llei-27-2003-ordre-proteccio` — Llei reguladora de l’ordre de protecció de les víctimes de la violència domèstica

- **Identificador legal:** Llei 27/2003, de 31 de juliol
- **Organisme:** BOE
- **Publicació:** 2003-08-01 · **consolidació:** consolidat — És una llei d’article únic: el contingut material viu a l’art. 544 ter de la LECrim, que introdueix.
- **URL canònica:** https://www.boe.es/eli/es/l/2003/07/31/27/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2003-15411 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Article únic i el procediment: competència judicial i presentació de la sol·licitud.
- **Consumidors:** 3 preguntes pròpies · 1 microlliçons · 1 temes · **4 en total**
- **Paquet offline:** `llei-27-2003-ordre-proteccio.pdf` · mínim 20.000 bytes · ha de contenir «orden de protección»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t38-001` · *competència judicial* — Que, en el punt citat, la resposta a «Qui pot acordar una ordre de protecció d’una víctima de violència domèstica?» és «El jutge competent».
  - `q-roses-t38-002` · *procediment* — Que, en el punt citat, la resposta a «En quin termini màxim s’ha de celebrar l’audiència urgent per resoldre una ordre de protecció?» és «72 hores».
  - `q-roses-t38-005` · *presentació de la sol·licitud* — Que, en el punt citat, la resposta a «Una víctima demana protecció a la comissaria de la Policia Local de Roses. L’actuació correcta és:» és «Recollir la sol·licitud, instruir les diligències i remetre-la immediatament al jutjat de guàrdia».
  - …i 1 més, totes al JSON.

### `carta-drets-ue` — Carta dels drets fonamentals de la Unió Europea

- **Identificador legal:** Carta dels drets fonamentals de la UE (2012/C 326/02) · DOUE C 326, de 26/10/2012
- **Organisme:** EUR-Lex
- **Publicació:** 2012-10-26 · **consolidació:** consolidat
- **URL canònica:** https://eur-lex.europa.eu/legal-content/CA/TXT/?uri=CELEX:12012P/TXT
- **Alternatives oficials:** https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012P/TXT *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Preàmbul, estructura en set títols i el valor jurídic que li dona l’art. 6 del TUE.
- **Consumidors:** 3 preguntes pròpies · 1 microlliçons · 1 temes · **4 en total**
- **Paquet offline:** `carta-drets-ue.pdf` · mínim 100.000 bytes · ha de contenir «drets fonamentals»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t25-002` · *valor jurídic i proclamació* — Que, en el punt citat, la resposta a «La Carta de Drets Fonamentals de la Unió Europea té el mateix valor jurídic que els Tractats des de:» és «L’entrada en vigor del Tractat de Lisboa el 2009».
  - `q-roses-t25-004` · *valor jurídic* — Que, en el punt citat, la resposta a «Quina diferència jurídica hi ha entre la Declaració Universal i la Carta de Drets Fonamentals de la UE?» és «La Declaració no és un tractat vinculant per si mateixa; la Carta sí que té valor jurídic vinculant».
  - `q-roses-t25-102` · *estructura* — Que, en el punt citat, la resposta a «Quants títols té la Carta de Drets Fonamentals de la Unió Europea?» és «Set».
  - …i 1 més, totes al JSON.

### `codi-etic-policia-catalunya` — Codi d’ètica de la policia de Catalunya

- **Identificador legal:** Acord GOV/25/2015, de 24 de febrer
- **Organisme:** Departament d’Interior i Seguretat Pública
- **Publicació:** 2015-02-26 · **consolidació:** text-original
- **URL canònica:** https://interior.gencat.cat/ca/arees_dactuacio/policia/comite-detica-de-la-policia-de-catalunya/codi-detica-de-la-policia-de-catalunya/
- **Alternatives oficials:** https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=685998 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** El text de l’Acord GOV/25/2015: principis i pautes de conducta, amb integritat i imparcialitat.
- **Consumidors:** 2 preguntes pròpies · 1 microlliçons · 1 temes · **3 en total**
- **Paquet offline:** `codi-etic-policia-catalunya.pdf` · mínim 30.000 bytes · ha de contenir «ètica»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t25-003` · *Acord GOV/25/2015* — Que, en el punt citat, la resposta a «El Codi d’ètica de la Policia de Catalunya va ser aprovat per:» és «L’Acord GOV/25/2015, de 24 de febrer».
  - `q-roses-t25-005` · *integritat i imparcialitat* — Que, en el punt citat, la resposta a «Un company t’explica que ha «arreglat» una denúncia a un conegut. Segons els principis ètics i deontològics, això és:» és «Un tracte de favor prohibit que pot constituir falta disciplinària i, segons el cas, delicte».
  - `roses-t25-l1` · *Acord GOV/25/2015, principis i pautes de conducta* — Que el punt citat sosté el contingut de la microlliçó «Ètica i deontologia professional».

## P2 — 4 fonts

### `rd-2822-1998-rgv` — Reglament general de vehicles

- **Identificador legal:** Reial decret 2822/1998, de 23 de desembre
- **Organisme:** BOE
- **Publicació:** 1999-01-26 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/rd/1998/12/23/2822/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-1999-1826 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Condicions tècniques i documentació dels vehicles, i la periodicitat de la inspecció tècnica (ITV) per categoria de vehicle.
- **Consumidors:** 0 preguntes pròpies · 1 microlliçons · 1 temes · **1 en total**
- **Preguntes oficials que podria explicar:** 3
- **Paquet offline:** `rd-2822-1998-rgv.pdf` · mínim 400.000 bytes · ha de contenir «Reglamento General de Vehículos»

  Afirmacions que ha de demostrar (mostra):
  - `roses-t32-l1` · *condicions tècniques i documentació dels vehicles* — Que el punt citat sosté el contingut de la microlliçó «Permisos, llicències i retirada de vehicles».

### `llei-7-2023-benestar-animal` — Llei de protecció dels drets i el benestar dels animals

- **Identificador legal:** Llei 7/2023, de 28 de març
- **Organisme:** BOE
- **Publicació:** 2023-03-29 · **consolidació:** consolidat
- **URL canònica:** https://www.boe.es/eli/es/l/2023/03/28/7/con
- **Alternatives oficials:** https://www.boe.es/buscar/act.php?id=BOE-A-2023-7936 *(derivada, cal comprovar-la)*
- **Format esperat:** both · MIME `application/pdf`
- **Què en cal:** Obligacions generals de les persones titulars d’animals de companyia (títol II).
- **Consumidors:** 1 preguntes pròpies · 0 microlliçons · 1 temes · **1 en total**
- **Preguntes oficials que podria explicar:** 2
- **Paquet offline:** `llei-7-2023-benestar-animal.pdf` · mínim 150.000 bytes · ha de contenir «bienestar de los animales»

  Afirmacions que ha de demostrar (mostra):
  - `q-roses-t34-005` · *obligacions generals de les persones titulars* — Que, en el punt citat, la resposta a «La identificació per microxip i la inscripció al registre censal municipal són obligatòries per a:» és «Tots els gossos».

### `roses-arxiu-examens` — Arxiu d’exàmens de proves d’oposició de l’Ajuntament de Roses

- **Identificador legal:** Pàgina institucional, sense identificador normatiu
- **Organisme:** Ajuntament de Roses
- **Publicació:** sense data (pàgina viva) · **consolidació:** pagina-viva
- **URL canònica:** https://www.roses.cat/ajuntament/informacio-administrativa/oferta-publica-docupacio/examens-1
- **Alternatives oficials:** https://www.roses.cat/ajuntament/informacio-administrativa/oferta-publica-docupacio
- **Format esperat:** html · MIME `text/html`
- **Què en cal:** La llista completa d’enllaços als quadernets publicats. És el punt d’entrada per als 24 exàmens històrics que queden per transcriure; no sosté cap afirmació del banc.
- **Consumidors:** 0 preguntes pròpies · 0 microlliçons · 0 temes · **0 en total**
- **Paquet offline:** `roses-arxiu-examens.html` · mínim 4.000 bytes · ha de contenir «roses», «examen»

### `codi-seguretat-catalunya` — Codi de seguretat de Catalunya (recopilació normativa consolidada)

- **Identificador legal:** Recopilació del Portal Jurídic, sense identificador normatiu propi
- **Organisme:** Portal Jurídic de Catalunya
- **Publicació:** sense data (pàgina viva) · **consolidació:** recopilacio — És un recull, no una norma: el seu valor és portar en un sol PDF la normativa catalana de seguretat ja consolidada.
- **URL canònica:** https://portaljuridic.gencat.cat/ca/normativa/dret-a-catalunya/Codis-legislacio/codi-de-Seguretat-Catalunya/
- **Alternatives oficials:** https://portaljuridic.gencat.cat/ca/normativa/dret-a-catalunya/Codis-legislacio/
- **Format esperat:** pdf · MIME `application/pdf`
- **Què en cal:** El PDF complet del codi. Cap referència del banc l’apunta directament: el seu interès és de logística, no de contingut.
- **Consumidors:** 0 preguntes pròpies · 0 microlliçons · 0 temes · **0 en total**
- **Duplicitat:** Candidat a paraigua: si el recull inclou aquestes quatre normes consolidades, una sola baixada les cobreix totes. **Cal comprovar-ne el contingut en baixar-lo**; els `sourceId` no es toquen ara, i cada norma conserva el seu perquè la referència ha d’apuntar a la norma, no al recull.
- **Paquet offline:** `codi-seguretat-catalunya.pdf` · mínim 500.000 bytes · ha de contenir «seguretat»

## Duplicitats detectades

- `codi-seguretat-catalunya` podria cobrir: `llei-16-1991-policies-locals`, `llei-4-2003-seguretat-publica`, `decret-179-2015-disciplinari`, `decret-151-1998-juntes`.
  Candidat a paraigua: si el recull inclou aquestes quatre normes consolidades, una sola baixada les cobreix totes. **Cal comprovar-ne el contingut en baixar-lo**; els `sourceId` no es toquen ara, i cada norma conserva el seu perquè la referència ha d’apuntar a la norma, no al recull.

El cas que **no** és una duplicitat, i val la pena dir-ho: `lo-1-2015-reforma-cp` no el
cobreix el Codi penal consolidat. El consolidat mostra la redacció vigent, i el que se’n
cita és justament el que el consolidat ja no ensenya com a tal: el preàmbul de la reforma
i la supressió del llibre III de faltes. Calen els dos textos.

## Troballa: referències pendents sobre fonts ja adoptades

Aquestes referències segueixen marcades `pending-source-verification` tot i que la seva
font ja té còpia local verificada. No és feina d’aquest bloc corregir-ho —aquí no es toca
contingut— però queda anotat perquè no es perdi:

- `q-roses-t24-002` → `roses-bases-2026-interins`
- `roses-t24-l1` → `roses-bases-2026-interins`

## Troballa: butlletí incrustat al nom de l’organisme

Al manifest, l’`issuer` d’aquestes fonts porta el butlletí enganxat al nom de
l’organisme. Aquí només s’ha normalitzat per agrupar i se n’ha recuperat el butlletí;
el manifest no s’ha tocat, perquè aquest bloc és només d’inventari:

- `llei-10-1999-gossos-cat` → «Portal Jurídic de Catalunya — DOGC núm. 2948»

## Validacions

| # | Comprovació | Resultat |
| --- | --- | --- |
| 1 | Totes les fonts pendents són a l’inventari | ✓ 43 entrades per a 43 fonts amb fetchStatus pending-download. |
| 2 | Cap referència pendent d’una font inventariada es queda fora | ✓ 313 referències pendents en total; 311 apunten a fonts inventariades i totes hi consten. 2 apunten a fonts ja adoptades i queden anotades com a troballa. |
| 3 | Cap font ja baixada no s’ha colat a l’inventari | ✓ Les 43 entrades tenen fetchStatus pending-download al manifest. |
| 4 | Cap pregunta, clau, topicId ni explicació ha canviat | ✓ content/ i src/ sense canvis respecte de HEAD; empremta de 439 preguntes: b07c3beb8f4cf817… |
| 5 | La taula revisada i les dades reals quadren exactament | ✓ Cap entrada sobrera a ENRICHMENT; una font pendent nova sense classificar atura l’script abans d’escriure res. |

Empremta del contingut (identificadors, temes, claus i explicacions de les
439 preguntes): `b07c3beb8f4cf817bea13b2fd2ba0165b9d08577018109e58fa365ffefcafb95`.

