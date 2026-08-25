/**
 * Banc de preguntes de **cultura general** per al simulacre corresponent.
 *
 * La prova de cultura general de Roses combina cultura general amb actualitat
 * social, cultural i política. Aquest fitxer cobreix la primera meitat: totes
 * les preguntes són traçables a una font oficial registrada (Constitució,
 * Estatut, Declaració Universal, Carta de la UE o el web municipal de Roses).
 *
 * La segona meitat —l'actualitat— **no** s'omple aquí a propòsit. L'actualitat
 * caduca i s'ha de gestionar amb paquets versionats amb data de revisió;
 * vegeu content/municipalities/roses/current-affairs/. En aquesta primera
 * versió el paquet d'actualitat està buit i l'informe de cobertura ho reporta
 * de manera explícita.
 */
import type { Question } from '../../../schemas/index.ts'
import { questionsFor, ref, refv } from '../authoring.ts'

const CG = { track: 'cultura-general' as const, tags: ['cultura-general'] }

export const QUESTIONS_CULTURA_GENERAL: Question[] = [
  ...questionsFor(31, [
    {
      n: 101, ...CG,
      stem: 'A quina província pertany el municipi de Roses?',
      options: ['Barcelona', 'Girona', 'Lleida', 'Tarragona'],
      correct: 'b',
      whyWrong: { a: 'Roses és a l’extrem nord-est de Catalunya.', c: 'Lleida és a l’interior occidental.', d: 'Tarragona és al sud.' },
      explainCa: 'Roses pertany a la província de Girona, dins la comarca de l’Alt Empordà, la capital de la qual és Figueres.',
      explainEs: 'Roses pertenece a la provincia de Girona, dentro de la comarca del Alt Empordà, cuya capital es Figueres.',
      refs: [ref('roses-web-municipi', 'situació administrativa del municipi')],
      difficulty: 'facil',
    },
    {
      n: 102, ...CG,
      stem: 'Quina és la capital de la comarca de l’Alt Empordà?',
      options: ['Roses', 'Figueres', 'Castelló d’Empúries', 'Cadaqués'],
      correct: 'b',
      whyWrong: { a: 'Roses és un dels municipis de la comarca, però no la capital.', c: 'És un municipi veí, no la capital.', d: 'És un municipi veí, no la capital.' },
      explainCa: 'La capital de l’Alt Empordà és Figueres. Roses és un dels municipis costaners més poblats de la comarca.',
      explainEs: 'La capital del Alt Empordà es Figueres. Roses es uno de los municipios costeros más poblados de la comarca.',
      refs: [ref('roses-web-municipi', 'context comarcal')],
      difficulty: 'facil',
    },
    {
      n: 103, ...CG,
      stem: 'La badia sobre la qual s’obre el municipi de Roses s’anomena:',
      options: ['Golf de Sant Jordi', 'Golf de Roses', 'Badia de Palamós', 'Golf de Lleó'],
      correct: 'b',
      whyWrong: { a: 'És al sud de Catalunya, a les Terres de l’Ebre.', c: 'És una badia del Baix Empordà.', d: 'És una entitat marítima molt més àmplia, al sud de França.' },
      explainCa: 'Roses se situa a l’extrem nord del golf de Roses, una àmplia badia de la Costa Brava que s’estén fins a l’Escala i el massís del Montgrí.',
      explainEs: 'Roses se sitúa en el extremo norte del golfo de Roses, una amplia bahía de la Costa Brava que se extiende hasta l’Escala y el macizo del Montgrí.',
      refs: [ref('roses-web-municipi', 'situació geogràfica')],
      difficulty: 'facil',
    },
    {
      n: 104, ...CG,
      stem: 'La urbanització de Roses coneguda pels seus canals navegables és:',
      options: ['Mas Fumats', 'Santa Margarida', 'Puig Rom', 'Els Grecs'],
      correct: 'b',
      whyWrong: { a: 'És una urbanització de vessant, sense canals.', c: 'És coneguda pel jaciment visigòtic.', d: 'És una altra urbanització del municipi.' },
      explainCa: 'La urbanització de Santa Margarida, al sud del nucli de Roses, està travessada per una xarxa de canals navegables que la comuniquen amb el mar.',
      explainEs: 'La urbanización de Santa Margarida, al sur del núcleo de Roses, está atravesada por una red de canales navegables que la comunican con el mar.',
      refs: [ref('roses-web-municipi', 'nuclis i urbanitzacions')],
      difficulty: 'mitjana',
    },
    {
      n: 105, ...CG,
      stem: 'A quin període històric pertany el jaciment de Puig Rom, al terme de Roses?',
      options: ['Època grega', 'Època romana', 'Època visigòtica', 'Època medieval tardana'],
      correct: 'c',
      whyWrong: { a: 'La colònia grega de Rhode ocupa l’àrea de la Ciutadella.', b: 'La vil·la romana també es troba dins la Ciutadella.', d: 'La vila medieval és a la Ciutadella.' },
      explainCa: 'Puig Rom és un poblat fortificat d’època visigòtica situat al terme de Roses, un dels jaciments d’aquest període més rellevants de Catalunya.',
      explainEs: 'Puig Rom es un poblado fortificado de época visigótica situado en el término de Roses, uno de los yacimientos de este período más relevantes de Cataluña.',
      refs: [ref('roses-web-municipi', 'patrimoni arqueològic')],
      difficulty: 'dificil',
    },
    {
      n: 106, ...CG,
      stem: 'Quin monestir romànic es conserva dins el recinte de la Ciutadella de Roses?',
      options: ['Santa Maria', 'Sant Pere de Rodes', 'Sant Quirze de Colera', 'Sant Miquel de Cuixà'],
      correct: 'a',
      whyWrong: { b: 'És al municipi veí del Port de la Selva.', c: 'És al municipi de Rabós.', d: 'És al Conflent, a la Catalunya Nord.' },
      explainCa: 'El monestir de Santa Maria de Roses, d’origen romànic, es conserva dins el recinte de la Ciutadella juntament amb les restes gregues, romanes i la vila medieval.',
      explainEs: 'El monasterio de Santa María de Roses, de origen románico, se conserva dentro del recinto de la Ciutadella junto con los restos griegos, romanos y la villa medieval.',
      refs: [ref('roses-web-municipi', 'patrimoni: Ciutadella')],
      difficulty: 'mitjana',
    },
    {
      n: 107, ...CG,
      stem: 'El massís natural situat al nord i a l’est del terme de Roses és:',
      options: ['El Montgrí', 'Cap de Creus', 'El Montseny', 'Les Gavarres'],
      correct: 'b',
      whyWrong: { a: 'És a l’extrem sud del golf de Roses.', c: 'És a la Catalunya central.', d: 'És al Baix Empordà.' },
      explainCa: 'El Parc Natural de Cap de Creus limita el terme de Roses pel nord i per l’est. És el primer parc marítim i terrestre de Catalunya.',
      explainEs: 'El Parque Natural de Cap de Creus limita el término de Roses por el norte y por el este. Es el primer parque marítimo y terrestre de Cataluña.',
      refs: [ref('roses-web-municipi', 'entorn natural')],
      difficulty: 'mitjana',
    },
    {
      n: 108, ...CG,
      stem: 'Quina activitat econòmica, juntament amb el turisme, ha estat tradicionalment fonamental a Roses?',
      options: ['La mineria', 'La pesca', 'La indústria siderúrgica', 'La producció d’energia hidroelèctrica'],
      correct: 'b',
      whyWrong: { a: 'No hi ha tradició minera al municipi.', c: 'No hi ha tradició siderúrgica al municipi.', d: 'No hi ha aprofitaments hidroelèctrics rellevants.' },
      explainCa: 'Roses conserva un port pesquer actiu amb llotja de peix, activitat que juntament amb el turisme i el comerç estructura l’economia del municipi.',
      explainEs: 'Roses conserva un puerto pesquero activo con lonja de pescado, actividad que junto con el turismo y el comercio estructura la economía del municipio.',
      refs: [ref('roses-web-municipi', 'activitat econòmica')],
      difficulty: 'facil',
    },
  ]),

  ...questionsFor(1, [
    {
      n: 101, ...CG,
      stem: 'En quina data es va celebrar el referèndum de ratificació de la Constitució espanyola?',
      options: ['El 6 de desembre de 1978', 'El 27 de desembre de 1978', 'El 29 de desembre de 1978', 'El 31 d’octubre de 1978'],
      correct: 'a',
      whyWrong: { b: 'És la data de sanció pel Rei.', c: 'És la data de publicació al BOE.', d: 'És la data d’aprovació per les Corts.' },
      explainCa: 'La seqüència és: aprovació per les Corts el 31 d’octubre, referèndum el 6 de desembre, sanció reial el 27 de desembre i publicació al BOE el 29 de desembre de 1978.',
      explainEs: 'La secuencia es: aprobación por las Cortes el 31 de octubre, referéndum el 6 de diciembre, sanción real el 27 de diciembre y publicación en el BOE el 29 de diciembre de 1978.',
      refs: [ref('ce-1978', 'tramitació i promulgació')],
      difficulty: 'mitjana',
    },
    {
      n: 102, ...CG,
      stem: 'Quantes comunitats autònomes i ciutats autònomes hi ha a Espanya?',
      options: ['15 comunitats i 2 ciutats autònomes', '17 comunitats i 2 ciutats autònomes', '17 comunitats i 3 ciutats autònomes', '19 comunitats autònomes'],
      correct: 'b',
      whyWrong: { a: 'El nombre de comunitats autònomes és disset.', c: 'Les ciutats autònomes són dues: Ceuta i Melilla.', d: 'No és la configuració territorial vigent.' },
      explainCa: 'L’Estat autonòmic desplegat a partir del títol VIII de la Constitució està format per disset comunitats autònomes i dues ciutats autònomes, Ceuta i Melilla.',
      explainEs: 'El Estado autonómico desplegado a partir del título VIII de la Constitución está formado por diecisiete comunidades autónomas y dos ciudades autónomas, Ceuta y Melilla.',
      refs: [ref('ce-1978', 'títol VIII, organització territorial')],
      difficulty: 'facil',
    },
    {
      n: 103, ...CG,
      stem: 'Segons la Constitució, la llengua espanyola oficial de l’Estat és:',
      options: ['El castellà', 'L’espanyol peninsular', 'El castellà i les altres llengües espanyoles per igual a tot l’Estat', 'No se’n designa cap'],
      correct: 'a',
      whyWrong: { b: 'No és la denominació constitucional.', c: 'Les altres llengües són oficials a les respectives comunitats autònomes.', d: 'La Constitució sí que en designa una.' },
      explainCa: 'L’article 3 estableix que el castellà és la llengua espanyola oficial de l’Estat i que les altres llengües espanyoles seran també oficials a les respectives comunitats autònomes d’acord amb els seus estatuts.',
      explainEs: 'El artículo 3 establece que el castellano es la lengua española oficial del Estado y que las demás lenguas españolas serán también oficiales en las respectivas comunidades autónomas de acuerdo con sus estatutos.',
      refs: [refv('ce-1978', 'art. 3', '2026-08-24')],
      difficulty: 'facil',
    },
  ]),

  ...questionsFor(2, [
    {
      n: 101, ...CG,
      stem: 'Quin article de la Constitució proclama la igualtat davant la llei sense discriminació?',
      options: ['L’article 10', 'L’article 14', 'L’article 15', 'L’article 24'],
      correct: 'b',
      whyWrong: { a: 'Proclama la dignitat de la persona com a fonament de l’ordre polític.', c: 'Reconeix el dret a la vida i a la integritat física i moral.', d: 'Reconeix la tutela judicial efectiva.' },
      explainCa: 'L’article 14 estableix que els espanyols són iguals davant la llei, sense que hi pugui prevaler cap discriminació per raó de naixement, raça, sexe, religió, opinió o qualsevol altra condició o circumstància personal o social.',
      explainEs: 'El artículo 14 establece que los españoles son iguales ante la ley, sin que pueda prevalecer discriminación alguna por razón de nacimiento, raza, sexo, religión, opinión o cualquier otra condición o circunstancia personal o social.',
      refs: [refv('ce-1978', 'art. 14', '2026-08-24')],
      difficulty: 'facil',
    },
    {
      n: 102, ...CG,
      stem: 'La pena de mort a Espanya:',
      options: [
        'Està vigent per a delictes de terrorisme',
        'Està abolida, tret del que puguin disposar les lleis penals militars en temps de guerra',
        'Està abolida sense cap excepció des de 1978',
        'La decideix cada comunitat autònoma',
      ],
      correct: 'b',
      whyWrong: { a: 'No està prevista per a cap delicte comú.', c: 'La Constitució en manté l’excepció militar en temps de guerra.', d: 'No és una matèria autonòmica.' },
      explainCa: 'L’article 15 de la Constitució aboleix la pena de mort, llevat del que puguin disposar les lleis penals militars per a temps de guerra. Aquesta excepció es va suprimir posteriorment per llei orgànica, però el text constitucional la conserva.',
      explainEs: 'El artículo 15 de la Constitución abole la pena de muerte, salvo lo que puedan disponer las leyes penales militares para tiempos de guerra. Esta excepción se suprimió posteriormente por ley orgánica, pero el texto constitucional la conserva.',
      refs: [refv('ce-1978', 'art. 15', '2026-08-24')],
      difficulty: 'dificil',
    },
  ]),

  ...questionsFor(3, [
    {
      n: 101, ...CG,
      stem: 'Quantes llengües són oficials a Catalunya?',
      options: ['Una', 'Dues', 'Tres', 'Quatre'],
      correct: 'c',
      whyWrong: { a: 'El castellà també és oficial.', b: 'L’aranès també és oficial a Catalunya.', d: 'No n’hi ha quatre.' },
      explainCa: 'A Catalunya són oficials el català —llengua pròpia—, el castellà i l’aranès, que és la llengua pròpia de l’Aran i també és llengua oficial a Catalunya.',
      explainEs: 'En Cataluña son oficiales el catalán —lengua propia—, el castellano y el aranés, que es la lengua propia del Arán y también es lengua oficial en Cataluña.',
      refs: [refv('lo-6-2006-eac', 'règim lingüístic', '2026-08-24')],
      difficulty: 'mitjana',
    },
    {
      n: 102, ...CG,
      stem: 'L’aranès és la variant d’una llengua més àmplia. Quina?',
      options: ['El basc', 'L’occità', 'El francoprovençal', 'El gallec'],
      correct: 'b',
      whyWrong: { a: 'És una llengua no indoeuropea sense relació amb l’aranès.', c: 'És una altra llengua romànica, diferent de l’occità.', d: 'És la llengua pròpia de Galícia.' },
      explainCa: 'L’aranès és la variant de l’occità parlada a la Vall d’Aran. L’Estatut la reconeix com a llengua pròpia de l’Aran i com a llengua oficial a tot Catalunya.',
      explainEs: 'El aranés es la variante del occitano hablada en el Valle de Arán. El Estatuto la reconoce como lengua propia del Arán y como lengua oficial en toda Cataluña.',
      refs: [refv('lo-6-2006-eac', 'l’aranès', '2026-08-24')],
      difficulty: 'mitjana',
    },
  ]),

  ...questionsFor(4, [
    {
      n: 101, ...CG,
      stem: 'Quantes vegades s’ha reformat l’Estatut d’autonomia de Catalunya des de la Transició?',
      options: [
        'Cap: continua vigent el de 1979',
        'Una: el de 2006 va substituir el de 1979',
        'Tres',
        'Cinc',
      ],
      correct: 'b',
      whyWrong: { a: 'L’Estatut de 1979 va ser substituït el 2006.', c: 'No s’ha reformat tres vegades.', d: 'No s’ha reformat cinc vegades.' },
      explainCa: 'Catalunya ha tingut dos estatuts d’autonomia des de la Transició: el de Sau, de 1979, i el vigent, aprovat el 2006 per la Llei orgànica 6/2006, que el va substituir.',
      explainEs: 'Cataluña ha tenido dos estatutos de autonomía desde la Transición: el de Sau, de 1979, y el vigente, aprobado en 2006 por la Ley orgánica 6/2006, que lo sustituyó.',
      refs: [refv('lo-6-2006-eac', 'antecedents i norma aprovatòria', '2026-08-24')],
      difficulty: 'mitjana',
    },
    {
      // Retirada el 2026-08-24 en revisar-ne la font. Dues coses no quadren: cap
      // dels 43 documents del paquet normatiu enumera les comarques de la
      // província de Girona —l'Estatut no ho fa—, i la mateixa explicació que
      // acompanyava la pregunta en llistava vuit mentre la resposta bona deia
      // «set». No hi ha opció «Vuit» per corregir-ho amb el canvi mínim i aquí
      // no s'inventa una divisió comarcal de memòria: es queda en draft fins
      // que algú la contrasti amb la font oficial (IDESCAT o el Decret de
      // divisió territorial), i mentrestant no la veu ningú.
      n: 102, ...CG, status: 'draft',
      stem: 'Quantes comarques té la província de Girona a la qual pertany Roses?',
      options: [
        'Cinc',
        'Set, entre les quals l’Alt Empordà',
        'Deu',
        'Dotze',
      ],
      correct: 'b',
      whyWrong: { a: 'És un nombre inferior al real.', c: 'És un nombre superior al real.', d: 'És un nombre superior al real.' },
      explainCa: 'La província de Girona agrupa set comarques: l’Alt Empordà, el Baix Empordà, la Cerdanya, la Garrotxa, el Gironès, el Pla de l’Estany i el Ripollès, a més de la Selva. Roses pertany a l’Alt Empordà. Comprova sempre la divisió comarcal vigent, que pot variar per llei.',
      explainEs: 'La provincia de Girona agrupa siete comarcas: el Alt Empordà, el Baix Empordà, la Cerdanya, la Garrotxa, el Gironès, el Pla de l’Estany y el Ripollès, además de la Selva. Roses pertenece al Alt Empordà. Comprueba siempre la división comarcal vigente, que puede variar por ley.',
      refs: [ref('lo-6-2006-eac', 'organització territorial de Catalunya')],
      difficulty: 'dificil',
      dynamic: true,
      reviewBy: '2027-08-23',
    },
  ]),

  ...questionsFor(7, [
    {
      n: 101, ...CG,
      stem: 'Quants vocals té el Consell General del Poder Judicial, a més del seu president?',
      options: ['Dotze', 'Quinze', 'Vint', 'Vint-i-cinc'],
      correct: 'c',
      whyWrong: { a: 'Dotze és el nombre de magistrats del Tribunal Constitucional.', b: 'No correspon a cap dada constitucional.', d: 'No correspon a cap dada constitucional.' },
      explainCa: 'El Consell General del Poder Judicial està integrat pel president del Tribunal Suprem, que el presideix, i per vint vocals nomenats pel Rei per un període de cinc anys.',
      explainEs: 'El Consejo General del Poder Judicial está integrado por el presidente del Tribunal Supremo, que lo preside, y por veinte vocales nombrados por el Rey por un período de cinco años.',
      refs: [refv('ce-1978', 'art. 122.3', '2026-08-24')],
      difficulty: 'mitjana',
    },
    {
      n: 102, ...CG,
      stem: 'Quin òrgan té encomanada la defensa dels drets del títol I de la Constitució com a alt comissionat de les Corts?',
      options: ['El Tribunal Constitucional', 'El Defensor del Poble', 'El Consell d’Estat', 'El Tribunal de Comptes'],
      correct: 'b',
      whyWrong: { a: 'És l’intèrpret suprem de la Constitució.', c: 'És el suprem òrgan consultiu del Govern.', d: 'És el suprem òrgan fiscalitzador de comptes.' },
      explainCa: 'L’article 54 crea el Defensor del Poble com a alt comissionat de les Corts Generals per a la defensa dels drets del títol I, amb la facultat de supervisar l’activitat de l’Administració.',
      explainEs: 'El artículo 54 crea al Defensor del Pueblo como alto comisionado de las Cortes Generales para la defensa de los derechos del título I, con la facultad de supervisar la actividad de la Administración.',
      refs: [refv('ce-1978', 'art. 54', '2026-08-24')],
      difficulty: 'facil',
    },
  ]),

  ...questionsFor(25, [
    {
      n: 101, ...CG,
      stem: 'En quina data es va proclamar la Declaració Universal dels Drets Humans?',
      options: ['El 24 d’octubre de 1945', 'El 10 de desembre de 1948', 'El 4 de novembre de 1950', 'El 26 de juny de 1945'],
      correct: 'b',
      whyWrong: { a: 'És la data d’entrada en vigor de la Carta de les Nacions Unides.', c: 'És la data del Conveni Europeu de Drets Humans.', d: 'És la data de signatura de la Carta de les Nacions Unides.' },
      explainCa: 'La Declaració Universal dels Drets Humans va ser adoptada i proclamada per l’Assemblea General de les Nacions Unides el 10 de desembre de 1948, a París, mitjançant la Resolució 217 A (III).',
      explainEs: 'La Declaración Universal de los Derechos Humanos fue adoptada y proclamada por la Asamblea General de las Naciones Unidas el 10 de diciembre de 1948, en París, mediante la Resolución 217 A (III).',
      refs: [refv('ddhh-1948', 'proclamació', '2026-08-24')],
      difficulty: 'mitjana',
    },
    {
      n: 102, ...CG,
      stem: 'Quants títols té la Carta de Drets Fonamentals de la Unió Europea?',
      options: ['Cinc', 'Sis', 'Set', 'Deu'],
      correct: 'c',
      whyWrong: { a: 'És un nombre inferior al real.', b: 'Sis són els títols substantius; el setè conté les disposicions generals.', d: 'És un nombre superior al real.' },
      explainCa: 'La Carta s’organitza en set títols: dignitat, llibertats, igualtat, solidaritat, ciutadania, justícia i disposicions generals, amb un total de cinquanta-quatre articles.',
      explainEs: 'La Carta se organiza en siete títulos: dignidad, libertades, igualdad, solidaridad, ciudadanía, justicia y disposiciones generales, con un total de cincuenta y cuatro artículos.',
      refs: [refv('carta-drets-ue', 'estructura', '2026-08-24')],
      difficulty: 'dificil',
    },
    {
      n: 103, ...CG,
      stem: 'L’article 1 de la Declaració Universal dels Drets Humans proclama que tots els éssers humans neixen:',
      options: [
        'Subjectes a la llei del seu Estat',
        'Lliures i iguals en dignitat i drets',
        'Amb dret a la propietat privada',
        'Amb dret a la nacionalitat del lloc de naixement',
      ],
      correct: 'b',
      whyWrong: { a: 'No és el contingut de l’article 1.', c: 'La propietat es reconeix en un altre article.', d: 'La nacionalitat es reconeix en un altre article.' },
      explainCa: 'L’article 1 de la Declaració estableix que tots els éssers humans neixen lliures i iguals en dignitat i drets i que, dotats com estan de raó i consciència, han de comportar-se fraternalment els uns amb els altres.',
      explainEs: 'El artículo 1 de la Declaración establece que todos los seres humanos nacen libres e iguales en dignidad y derechos y que, dotados como están de razón y conciencia, deben comportarse fraternalmente los unos con los otros.',
      refs: [refv('ddhh-1948', 'art. 1', '2026-08-24')],
      difficulty: 'facil',
    },
  ]),
]
