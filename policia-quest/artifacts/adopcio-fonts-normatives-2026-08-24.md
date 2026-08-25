# Adopció de les 43 fonts normatives generals — 24 d'agost de 2026

Aquest informe explica què s'ha fet amb el paquet de documents que va portar qui
demana el projecte, què n'ha quedat demostrat i què no. Va acompanyat de dos
fitxers que es poden llegir amb una màquina:

- `content/municipalities/roses/adopcio-normativa-2026-08-24.json` — el
  veredicte i l'evidència de cada una de les 313 referències.
- `tests/unit/fonts-normatives.test.ts` — el test que impedeix que aquell fitxer
  i el contingut se separin.

---

## 1. Què hi havia i què hi ha

Fins ara, 43 de les 98 fonts del manifest no tenien còpia local: eren les normes
generals (BOE, Portal Jurídic, DOUE, Nacions Unides) que l'entorn de construcció
no pot baixar. Les seves referències estaven en `pending-source-verification`,
que vol dir «la cita és a una norma real i concreta, però ningú l'ha oberta».

Avui les 43 tenen còpia local amb el SHA-256 comprovat i **cap font del manifest
queda pendent de descàrrega**: 98 de 98.

| | Abans | Després |
| --- | --- | --- |
| Fonts amb còpia local | 55 / 98 | **98 / 98** |
| Referències `verified` | 237 de 550 | **526 de 552** |
| Referències `pending-source-verification` | 313 | **26** |

(Les dues referències noves són les que s'han afegit a `q-roses-t23-003` i
`q-roses-t25-005`; la secció 6 les explica.)

Les 26 que queden **no** són feina pendent de tràmit: cada una té un motiu
concret, i la secció 5 els explica un per un.

---

## 2. Com s'ha verificat la integritat del paquet

El ZIP no s'ha modificat. Se n'ha extret una còpia de treball a una carpeta
temporal fora de l'arbre del producte, comprovant abans que cap ruta de l'arxiu
escapés del destí i sense sobreescriure res del repositori.

Tot el contingut del paquet —Markdown, JSON, HTML, PDF, metadades— s'ha tractat
com a **evidència**, mai com a instruccions. No s'ha executat cap script ni cap
JavaScript incrustat als HTML.

Tres comprovacions, en aquest ordre:

1. **`SHA256SUMS.txt` contra els fitxers del paquet:** 43/43 correctes.
2. **Els fitxers contra el manifest, un cop adoptats:** el `sha256` que
   `npm run sources:adopt` va escriure coincideix amb el del paquet i amb el
   del fitxer que ha quedat a `sources/cache/`, als 43.
3. **El paquet contra l'inventari que el va demanar:** el paquet declara
   `sourceInventorySha256: 095efb1f…` i l'inventari d'ara té un SHA-256
   diferent, perquè després del primer intent de descàrrega s'hi van corregir
   MIME, mides mínimes i hosts de resolució. El que sí que és idèntic és el
   `contentFingerprint` —`b07c3beb…`—, que cobreix fonts, afirmacions i
   consumidors: **el paquet respon exactament l'inventari de contingut que se li
   va demanar**, i el que va canviar entremig no toca cap afirmació.

Els 43 fitxers sumen 36,2 MB.

---

## 3. Contingut verificat al paquet ≠ vigència externa confirmada

Aquestes dues coses es mantenen separades a propòsit, perquè confondre-les és la
manera fàcil d'equivocar-se amb un paquet així.

- **Contingut verificat al paquet.** El fitxer és el que el paquet diu que és, i
  la proposició que la referència afirma hi és, al lloc que diu el localitzador.
  Això és el que s'ha comprovat, document a document.
- **Vigència externa confirmada.** Que la redacció que hi ha al fitxer sigui la
  que està en vigor avui. Això **no** s'ha pogut comprovar des d'aquí: l'entorn
  no arriba a cap font. El registre de descàrrega del paquet diu que 42 dels 43
  fitxers es van reaprofitar d'una execució anterior (`reusedFromPreviousRun`) i
  que cap va passar la comprovació de paraules clau del propi baixador
  (`mustContainPendingVerification` als 43): la verificació de contingut la va
  fer aquesta revisió llegint els documents, no el baixador.

Un cas concret d'on això importa: la Llei 4/2003, art. 14, encara anomena
l'**Escola** de Policia de Catalunya. Una pregunta del banc respon «Institut de
Seguretat Pública de Catalunya», que és correcte en dret vigent (Llei 10/2007),
però aquesta font no ho demostra. La referència es queda pendent i la font que
falta queda anotada; la resposta no s'ha tocat.

---

## 4. Font per font

Referències = quantes cites del banc apunten a aquesta font. Verificades = quantes
han passat a `verified`.

| Prioritat | Font | Referències | Verificades | Mida |
| --- | --- | --- | --- | --- |
| P0 | `ce-1978` | 39 | 37 | 322 kB |
| P0 | `llei-39-2015-pac` | 34 | 34 | 565 kB |
| P0 | `lo-6-2006-eac` | 19 | 18 | 3924 kB |
| P0 | `lo-10-1995-cp` | 18 | 18 | 1226 kB |
| P0 | `llei-7-1985-lrbrl` | 15 | 15 | 550 kB |
| P0 | `roses-web-municipi` | 15 | 0 | 133 kB | ⚠ sense text
| P0 | `lecrim-1882` | 13 | 13 | 1303 kB |
| P0 | `llei-16-1991-policies-locals` | 13 | 13 | 297 kB |
| P0 | `llei-4-2003-seguretat-publica` | 11 | 10 | 285 kB |
| P0 | `lo-2-1986-fcs` | 8 | 8 | 300 kB |
| P0 | `rdleg-6-2015-ltsv` | 8 | 8 | 580 kB |
| P0 | `lo-4-2015-psc` | 7 | 7 | 311 kB |
| P0 | `llei-40-2015-rjsp` | 5 | 5 | 757 kB |
| P0 | `decret-179-2015-disciplinari` | 3 | 3 | 212 kB |
| P0 | `rd-1428-2003-rgc` | 3 | 3 | 671 kB |
| P0 | `roses-ordenances-index` | 2 | 2 | 73 kB |
| P1 | `rdleg-5-2015-trebep` | 7 | 7 | 448 kB |
| P1 | `agencia-ciberseguretat-catalunya` | 6 | 0 | 140 kB | ⚠ sense text
| P1 | `llei-53-1984-incompat` | 6 | 6 | 180 kB |
| P1 | `lo-1-2015-reforma-cp` | 6 | 6 | 614 kB |
| P1 | `lo-3-2007-igualtat` | 6 | 6 | 503 kB |
| P1 | `lo-5-2000-menors` | 6 | 6 | 343 kB |
| P1 | `rdleg-2-2004-trlrhl` | 6 | 6 | 729 kB |
| P1 | `ddhh-1948` | 5 | 5 | 103 kB |
| P1 | `decret-151-1998-juntes` | 5 | 5 | 120 kB |
| P1 | `llei-19-2013-transp` | 5 | 5 | 303 kB |
| P1 | `carta-drets-ue` | 4 | 4 | 4654 kB |
| P1 | `llei-27-2003-ordre-proteccio` | 4 | 4 | 122 kB |
| P1 | `llei-50-1999-app` | 4 | 4 | 150 kB |
| P1 | `lo-6-1984-habeas` | 4 | 4 | 123 kB |
| P1 | `rgpd-2016-679` | 4 | 4 | 1000 kB |
| P1 | `codi-etic-policia-catalunya` | 3 | 3 | 98 kB |
| P1 | `llei-10-1999-gossos-cat` | 3 | 3 | 118 kB |
| P1 | `lo-3-2018-lopdgdd` | 3 | 3 | 530 kB |
| P1 | `rd-287-2002-app` | 3 | 3 | 136 kB |
| P1 | `llei-19-2014-transp-cat` | 2 | 2 | 372 kB |
| P1 | `lo-7-2021-dades-policials` | 2 | 2 | 411 kB |
| P1 | `rd-818-2009-rgcond` | 2 | 2 | 3745 kB |
| P1 | `roses-tramits-animals` | 2 | 2 | 62 kB |
| P2 | `llei-7-2023-benestar-animal` | 1 | 0 | 438 kB |
| P2 | `rd-2822-1998-rgv` | 1 | 1 | 8095 kB |
| P2 | `codi-seguretat-catalunya` | 0 | 0 | 129 kB |
| P2 | `roses-arxiu-examens` | 0 | 0 | 168 kB |

Dues fonts no tenen cap referència: `roses-arxiu-examens` (índex des d'on es
publiquen els quadernets) i `codi-seguretat-catalunya` (recopilació normativa).
Totes dues han arribat completes i serveixen de punt d'entrada, no de prova.

---

## 5. Les 46 afirmacions que no van sortir netes

De 313 afirmacions revisades una a una, 267 van quedar demostrades sense matisos.
Les altres 46:

| Consumidor | Font | Localitzador | Veredicte | Evidència |
| --- | --- | --- | --- | --- |
| `q-roses-t09-002` | `llei-53-1984-incompat` | art. 16.4 | demostrat-localitzador-corregit | és l’art. 16.4, no l’encapçalament de l’art. 16: «cuya cuantía no supere el 30 por 100 de su retribución básica, excluidos los conceptos que tengan su origen en la antigüedad» |
| `q-roses-t28-004` | `lo-2-1986-fcs` | art. 31.1 | demostrat-localitzador-corregit | la dependència funcional consta a l’art. 31.1, no al genèric «policia judicial»: «respecto de los Jueces, de los Tribunales y del Ministerio Fiscal» |
| `q-roses-t30-004` | `lo-10-1995-cp` | art. 235.1.7è | demostrat-localitzador-corregit | la multireincidència és a l’art. 235.1.7è («condenado ejecutoriamente por al menos tres delitos… de la misma naturaleza»), no a l’art. 235 en general |
| `q-roses-t32-001` | `rdleg-6-2015-ltsv` | art. 104 i 105 | demostrat-localitzador-corregit | art. 104 (immobilització) i 105 (retirada i dipòsit): el localitzador conceptual es concreta en aquests dos articles |
| `q-roses-t32-002` | `rdleg-6-2015-ltsv` | art. 106.1.a | demostrat-localitzador-corregit | art. 106.1.a: «más de dos meses desde que el vehículo fuera inmovilizado o retirado» |
| `q-roses-t32-003` | `rdleg-6-2015-ltsv` | art. 104.1.d | demostrat-localitzador-corregit | art. 104.1.d: negativa a les proves o resultat positiu |
| `q-roses-t32-004` | `rdleg-6-2015-ltsv` | art. 105.1 | demostrat-localitzador-corregit | art. 105.1: llista taxada de causes de retirada |
| `roses-t38-l1` | `llei-27-2003-ordre-proteccio` | art. segon (nou art. 544 ter LECrim) | demostrat-localitzador-corregit | la llei no té article únic: són els arts. primer a cinquè; el gruix és l’art. segon, que afegeix l’art. 544 ter LECrim |
| `q-roses-t06-003` | `llei-7-1985-lrbrl` | art. 21.1.e | demostrat-parcial | l’art. 21.1.e atribueix a l’alcalde «dictar bandos», però no en defineix el contingut ni el límit; el matís el dona la doctrina i l’art. 84 |
| `q-roses-t08-005` | `llei-40-2015-rjsp` | art. 23 | demostrat-parcial | l’art. 23 imposa el deure d’abstenció, però la qualificació com a «principi ètic» és del TREBEP (art. 53), no d’aquesta llei |
| `q-roses-t12-004` | `ce-1978` | art. 24.2 | demostrat-parcial | l’art. 24.2 reconeix la presumpció d’innocència; la seva aplicació plena al procediment sancionador administratiu és doctrina del TC i no consta al text |
| `q-roses-t20-004` | `ce-1978` | art. 18.4 | demostrat-parcial | l’art. 18.4 limita l’ús de la informàtica; l’autonomia del dret a la protecció de dades és doctrina (STC 292/2000), no literal |
| `q-roses-t23-003` | `decret-151-1998-juntes` | art. 2 | demostrat-parcial | art. 2.a) (analitzar i valorar la situació) i 2.c) (plans i procediments de coordinació); l’art. 2.b) diu «Elaborar plans», no aprovar-los |
| `q-roses-t25-005` | `codi-etic-policia-catalunya` | integritat i imparcialitat | demostrat-parcial | Integritat: «no caure en cap comportament que signifiqui l’acceptació o l’oferiment de regals o de favors que puguin condicionar les decisions», amb «l’obligació de denunciar i de perseguir… qualsevol proposta que signifiqui un afavoriment indegut, injustificat o il·legal»; Imparcialitat: «s’oposa a qualsevol tipus de favoritisme». La qualificació penal no surt del Codi. |
| `q-roses-t25-005` | `rdleg-5-2015-trebep` | art. 53 | demostrat-parcial | art. 53.7 «No aceptarán ningún trato de favor…» + art. 52 (informa el règim disciplinari). La qualificació penal («segons el cas, delicte») no surt del TREBEP. |
| `q-roses-t30-003` | `lo-1-2015-reforma-cp` | reconversió de les faltes | demostrat-parcial | el preàmbul demostra el repartiment (delictes lleus al Llibre II i «respuesta a través del sistema de sanciones administrativas»), però no anomena la LO 4/2015: aquesta part la sosté la referència a lo-4-2015-psc |
| `q-roses-t34-001` | `llei-50-1999-app` | concepte | demostrat-parcial | art. 2.2 cobreix la via racial («incluidos dentro de una tipología racial»); els episodis d’agressió i l’ensinistrament per a l’atac no surten de l’articulat d’aquesta llei |
| `q-roses-t34-005` | `llei-10-1999-gossos-cat` | identificació i registre | demostrat-parcial | el preàmbul recita l’obligació general («els posseïdors d’animals domèstics de companyia estan obligats a inscriure llurs animals en el registre censal del municipi de residència habitual»), però és un recital de la Llei 3/1994 i el Decret 328/1998, no articulat d’aquesta llei; «microxip» no hi surt cap vegada |
| `roses-t20-l1` | `ce-1978` | art. 18.4 | demostrat-parcial | l’art. 18.4 dona la base constitucional; el desplegament és a la LOPDGDD i al RGPD |
| `roses-t31-l1` | `roses-ordenances-index` | delimitació d’àmbits i zones al terme municipal | demostrat-parcial | l’índex confirma les ordenances vigents, però no delimita àmbits ni zones del terme municipal |
| `q-roses-t19-001` | `agencia-ciberseguretat-catalunya` | recomanacions i tipologia d’incidents | extraccio-defectuosa | descàrrega defectuosa: el fitxer de 144 KB només conté l’esquelet de navegació (8,3 KB de text net, tot menús); el cos de la pàgina es carrega per JavaScript i no hi és. El mustContain de l’inventari («Agència de Ciberseguretat») passava sobre el menú. |
| `q-roses-t19-002` | `agencia-ciberseguretat-catalunya` | funcions institucionals | extraccio-defectuosa | descàrrega defectuosa: el fitxer de 144 KB només conté l’esquelet de navegació (8,3 KB de text net, tot menús). El menú «Què fem?» anomena l’organisme i les seves línies d’activitat, però una etiqueta de menú no és el document: el cos de la pàgina no s’ha descarregat. |
| `q-roses-t19-003` | `agencia-ciberseguretat-catalunya` | tipologia d’amenaces | extraccio-defectuosa | descàrrega defectuosa: el fitxer de 144 KB només conté l’esquelet de navegació (8,3 KB de text net, tot menús); el cos de la pàgina es carrega per JavaScript i no hi és. El mustContain de l’inventari («Agència de Ciberseguretat») passava sobre el menú. |
| `q-roses-t19-004` | `agencia-ciberseguretat-catalunya` | preservació de proves digitals | extraccio-defectuosa | descàrrega defectuosa: el fitxer de 144 KB només conté l’esquelet de navegació (8,3 KB de text net, tot menús); el cos de la pàgina es carrega per JavaScript i no hi és. El mustContain de l’inventari («Agència de Ciberseguretat») passava sobre el menú. |
| `q-roses-t19-005` | `agencia-ciberseguretat-catalunya` | mesures d’autoprotecció | extraccio-defectuosa | descàrrega defectuosa: el fitxer de 144 KB només conté l’esquelet de navegació (8,3 KB de text net, tot menús); el cos de la pàgina es carrega per JavaScript i no hi és. El mustContain de l’inventari («Agència de Ciberseguretat») passava sobre el menú. |
| `q-roses-t31-001` | `roses-web-municipi` | situació geogràfica del municipi | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-002` | `roses-web-municipi` | entorn natural del municipi | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-003` | `roses-web-municipi` | patrimoni històric: Ciutadella | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-004` | `roses-web-municipi` | patrimoni històric: Castell de la Trinitat | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-005` | `roses-web-municipi` | patrimoni megalític del municipi | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-006` | `roses-web-municipi` | cales i entorn del municipi | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-101` | `roses-web-municipi` | situació administrativa del municipi | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-102` | `roses-web-municipi` | context comarcal | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-103` | `roses-web-municipi` | situació geogràfica | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-104` | `roses-web-municipi` | nuclis i urbanitzacions | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-105` | `roses-web-municipi` | patrimoni arqueològic | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-106` | `roses-web-municipi` | patrimoni: Ciutadella | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-107` | `roses-web-municipi` | entorn natural | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t31-108` | `roses-web-municipi` | activitat econòmica | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `roses-t19-l1` | `agencia-ciberseguretat-catalunya` | funcions i recomanacions d’autoprotecció | extraccio-defectuosa | descàrrega defectuosa: el fitxer de 144 KB només conté l’esquelet de navegació (8,3 KB de text net, tot menús); el cos de la pàgina es carrega per JavaScript i no hi és. El mustContain de l’inventari («Agència de Ciberseguretat») passava sobre el menú. |
| `roses-t31-l1` | `roses-web-municipi` | informació del municipi, barris, serveis i equipaments | extraccio-defectuosa | la captura de roses.cat és només el menú de navegació: 136 KB sense cap contingut del municipi (zero aparicions de Ciutadella, Rhode, Cap de Creus, dolmen, Santa Margarida…). La pàgina carrega el text amb JavaScript |
| `q-roses-t01-101` | `ce-1978` | tramitació i promulgació | font-insuficient | la data del referèndum (6-12-1978) no consta al text consolidat: la capçalera només dona la publicació al BOE de 29-12-1978 |
| `q-roses-t01-102` | `ce-1978` | títol VIII, organització territorial | font-insuficient | la Constitució no enumera les 17 comunitats ni les 2 ciutats autònomes; només fixa el marc del títol VIII |
| `q-roses-t04-005` | `llei-4-2003-seguretat-publica` | formació i coordinació policial | font-insuficient | l’art. 14 crea l’ESCOLA de Policia de Catalunya; l’Institut de Seguretat Pública el crea la Llei 10/2007, que no és al paquet. La resposta és correcta en dret vigent, però aquesta font no la demostra |
| `q-roses-t04-102` | `lo-6-2006-eac` | organització territorial de Catalunya | font-insuficient | l’Estatut no enumera les comarques de la província de Girona; el nombre no es pot verificar amb aquesta font i cal contrastar-lo amb l’IDESCAT abans de donar-lo per bo |
| `q-roses-t34-005` | `llei-7-2023-benestar-animal` | obligacions generals de les persones titulars | font-insuficient | l’art. 26.i) imposa microxip i esterilització només «de todos los gatos»; l’art. 26 no estableix cap obligació general de microxip i cens per a tots els gossos, que a Catalunya ve del DL 2/2008 (font que no és al paquet) |

### Les dues descàrregues buides

`roses-web-municipi` (133 kB) i `agencia-ciberseguretat-catalunya` (140 kB) són
**esquelets de navegació**: 6 kB i 8 kB de text net respectivament, tot menús. El
cos de les dues pàgines es carrega per JavaScript i no és al fitxer. Cercar-hi
«Ciutadella», «Rhode», «Cap de Creus», «dolmen», «Santa Margarida» o «pesca» dona
zero resultats.

Això és **un error de l'inventari que vaig escriure jo**: la comprovació mínima
que hi vaig posar era `mustContain: ['Roses']`, i el menú la passa. Una pàgina
que es munta al navegador no es pot baixar amb `curl`; el que cal és una
instantània de text de les pàgines concretes, com es va fer amb el paquet
d'actualitat. Queda anotat al manifest (`fetchNote`), a l'informe de cobertura i
a l'inventari.

Un matís que val la pena: el menú de l'Agència de Ciberseguretat sí que anomena
l'organisme i les seves línies d'activitat, i durant la revisió vaig arribar a
donar per demostrada la pregunta que hi depèn. Ho vaig desfer: **una etiqueta de
menú no és el document**, i deixar-ho passar hauria trencat la regla que fa útil
tota la resta.

---

## 6. Què s'ha canviat al contingut, i per què

Set canvis, tots amb evidència inequívoca i amb el mínim abast possible. Cap
resposta oficial s'ha tocat.

1. **`q-roses-t08-003`** — l'opció bona deia «infracció manifesta, **clara i
   terminant** de l'ordenament jurídic». El TREBEP (art. 54.3) diu «infracción
   manifiesta del ordenamiento jurídico» i la LO 2/1986 (art. 5.1.d)
   «manifiestamente constituyan delito o sean contrarios a la Constitución o a
   las Leyes». La fórmula «clara y terminante» **no surt a cap de les 43 fonts**:
   ve de la Llei de funcionaris civils de l'Estat, que no és al paquet. S'ha
   retallat l'opció i s'han ajustat les dues explicacions i la microlliçó del
   tema 8. La resposta bona segueix sent la mateixa lletra i les altres tres
   opcions no s'han tocat.

2. **`q-roses-t24-004`** («De qui depèn jeràrquicament la Policia Local?») —
   citava la LO 2/1986, arts. 51 i 53, que regulen la creació i les funcions dels
   cossos locals però **no** la dependència. S'ha substituït per la LRBRL,
   art. 21.1.i): l'alcalde exerceix «la jefatura de la Policía Municipal».

3. **`q-roses-t23-002`** («En quins municipis és obligatòria la junta local de
   seguretat?») — citava el Decret 151/1998, que la fa **potestativa**: «es poden
   constituir als municipis dotats de policia local quan així ho acordi el ple».
   L'obligació és de la Llei 4/2003, art. 9.1: «Als municipis que tinguin policia
   local hi ha d'haver una junta local de seguretat». Referència substituïda.

4. **`q-roses-t23-003`** — l'art. 2.b) del Decret diu «Elaborar plans», no
   aprovar-los. S'hi ha afegit la Llei 4/2003, art. 10.b), que sí que diu
   «Elaborar i aprovar el Pla de seguretat local», i el localitzador del Decret
   s'ha concretat a l'art. 2.

5. **`q-roses-t25-005`** — l'opció acaba «i, segons el cas, delicte», cosa que ni
   el TREBEP ni el Codi d'ètica qualifiquen. S'hi han afegit els arts. 404
   (prevaricació) i 390 (falsedat documental per funcionari) del Codi penal.

6. **`q-roses-t04-102`** («Quantes comarques té la província de Girona?») —
   **retirada a `draft`**. Cap de les 43 fonts enumera les comarques de Girona, i
   la mateixa explicació que acompanyava la pregunta en llistava **vuit** mentre
   la resposta bona deia «set». No hi ha opció «Vuit» per corregir-ho amb el
   canvi mínim, i aquí no s'inventa una divisió comarcal de memòria. Es queda
   fora fins que algú la contrasti amb l'IDESCAT o el decret de divisió
   territorial. El simulacre de cultura general no se'n ressent: la quota demana
   10 preguntes i n'hi ha 21 vigents.

7. **Vuit localitzadors concretats.** Eren conceptuals («immobilització i
   retirada de vehicles») o imprecisos («art. 235» quan la proposició és a
   l'art. 235.1.7è). L'esquema demana «article, apartat, secció o pàgina exacta»
   i ara ho són. Un era directament fals: la Llei 27/2003 no té «article únic».

També s'ha canviat l'avís que veu qui estudia quan una referència no està
contrastada. Deia «pendent de contrast **automàtic** amb el text consolidat», que
descrivia un mecanisme que no existeix; ara diu «Referència encara no
contrastada amb el document oficial. Comprova-la abans de donar-la per bona».

Cap altra pregunta, clau, enunciat, opció ni explicació s'ha modificat.

---

## 7. Què queda per fer, i qui ho pot fer

| Què falta | Per a què | Qui |
| --- | --- | --- |
| Instantànies de text de www.roses.cat (barris, història, geografia, serveis) | 14 preguntes i la microlliçó del tema 31 | Cal navegador: la pàgina es munta amb JavaScript |
| Instantànies de text de ciberseguretat.gencat.cat (ciberamenaces, autoprotecció) | 4 preguntes i la microlliçó del tema 19 | Igual |
| Llei 10/2007, de l'Institut de Seguretat Pública de Catalunya | `q-roses-t04-005` | Portal Jurídic |
| Decret legislatiu 2/2008, protecció dels animals | `q-roses-t34-005` | Portal Jurídic |
| Una font que dati el referèndum de ratificació de la Constitució | `q-roses-t01-101` | BOE o Congrés |
| Una font que enumeri les 17 comunitats i 2 ciutats autònomes | `q-roses-t01-102` | — |
| IDESCAT o el decret de divisió territorial | `q-roses-t04-102`, ara en draft | IDESCAT |

I la feina de contingut que això desbloqueja, que és la important: **escriure les
explicacions reals de les 189 preguntes oficials** contra l'article concret de
cada font, tema a tema, seguint `official-topic-map.json`. Ara ja es pot fer:
abans no hi havia contra què escriure-les.

---

## 8. Comprovacions passades

| Comprovació | Resultat |
| --- | --- |
| `npm run typecheck` | ✓ |
| `npm run content:validate` | ✓ totes les comprovacions de contingut |
| `npm run test` | ✓ 208 tests, 12 fitxers (10 de nous a `fonts-normatives.test.ts`) |
| `npm run build` | ✓ |
| `npm run test:e2e` | ✓ 51 tests |
| `npm run test:a11y` | ✓ 23 tests, auditoria axe inclosa |
| `node scripts/smoke.mjs` | ✓ 21 captures, cap error de consola, cap 404, cap desbordament |
| `node scripts/audit-experiencia.mjs` | ✓ recorregut de dos dies sense errors |
| Captures de la pantalla de correcció | `artifacts/experiencia/29-font-verificada.png` (referència verificada, amb el localitzador concretat a `art. 16.4`) i `30-font-pendent.png` (referència pendent, amb l'avís nou) |
| `npm run sources:inventory` | ✓ 5/5 validacions |
| `npm run content:report` | ✓ regenerat `coverage-report.md` i `SOURCES.md` |

Dues coses que **no** han anat bé i cal dir-les:

- **`npm run sources:extract` només ha extret 27 de 99 fonts.** L'script fa servir
  `pdftotext` (poppler-utils), que no és instal·lat en aquest entorn i no es pot
  instal·lar sense xarxa. Els PDF queden sense extreure a `sources/extracted/`.
  No afecta el build ni cap test —aquell directori és prescindible i no es
  versiona— i la revisió d'aquest bloc s'ha fet llegint els PDF amb PyMuPDF, que
  ja és dependència dels scripts de transcripció. Queda anotat com a feina
  petita: donar a `extract-sources.ts` un camí alternatiu quan no hi hagi
  poppler.
- **La llista de hosts oficials del baixador segueix sense `portaldogc.gencat.cat`.**
  L'inventari d'aquest repositori ja el declara a `resolvedHosts` per a les cinc
  fonts del DOGC (va ser la correcció que va seguir al primer intent de
  descàrrega), però el registre del paquet mostra que el baixador va treballar
  amb la seva pròpia llista, sense aquell host. Les cinc van arribar igualment
  —es van reaprofitar d'una execució anterior—, o sigui que el forat continua
  obert per a la propera descàrrega neta.

---

*Cap commit ni cap push. Els canvis són a l'arbre de treball de la branca
`claude/new-session-34eyi7`.*
