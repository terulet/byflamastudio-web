/** Microlliçons dels temes 1 a 5 (bloc Institucions i Administració). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, refv } from '../authoring.ts'

export const LESSONS_1_5: Lesson[] = [
  lesson(
    1,
    'La Constitució de 1978: l’esquelet de tot el sistema',
    'La Constitución de 1978: el esqueleto de todo el sistema',
    5,
    [
      idea(
        'La Constitució no és un text més: és la norma suprema. Tota la resta de normes —lleis, decrets, ordenances de Roses— hi han de cabre a dins. Si una norma la contradiu, és nul·la.',
        'La Constitución no es un texto más: es la norma suprema. Todas las demás normas —leyes, decretos, ordenanzas de Roses— deben caber dentro de ella. Si una norma la contradice, es nula.',
      ),
      explain(
        'Quatre dades que cauen sempre',
        'Cuatro datos que caen siempre',
        'Aprovada per les Corts el 31 d’octubre de 1978, ratificada en referèndum el 6 de desembre, sancionada pel Rei el 27 de desembre i publicada al BOE el 29 de desembre. Té 169 articles, repartits en un títol preliminar i deu títols, més quatre disposicions addicionals, nou transitòries, una derogatòria i una final.',
        'Aprobada por las Cortes el 31 de octubre de 1978, ratificada en referéndum el 6 de diciembre, sancionada por el Rey el 27 de diciembre y publicada en el BOE el 29 de diciembre. Tiene 169 artículos, repartidos en un título preliminar y diez títulos, más cuatro disposiciones adicionales, nueve transitorias, una derogatoria y una final.',
      ),
      explain(
        'L’article 1: valors, sobirania i forma política',
        'El artículo 1: valores, soberanía y forma política',
        'L’article 1.1 proclama Espanya com a Estat social i democràtic de dret i fixa quatre valors superiors: llibertat, justícia, igualtat i pluralisme polític. L’1.2 diu que la sobirania nacional resideix en el poble espanyol, del qual emanen els poders de l’Estat. L’1.3 estableix que la forma política és la monarquia parlamentària.',
        'El artículo 1.1 proclama España como Estado social y democrático de derecho y fija cuatro valores superiores: libertad, justicia, igualdad y pluralismo político. El 1.2 dice que la soberanía nacional reside en el pueblo español, del que emanan los poderes del Estado. El 1.3 establece que la forma política es la monarquía parlamentaria.',
      ),
      explain(
        'L’article 9.3: la llista que fa de xarxa de seguretat',
        'El artículo 9.3: la lista que hace de red de seguridad',
        'Garanteix set principis: legalitat, jerarquia normativa, publicitat de les normes, irretroactivitat de les disposicions sancionadores no favorables o restrictives de drets individuals, seguretat jurídica, responsabilitat i interdicció de l’arbitrarietat dels poders públics. Per a un agent, el més operatiu és el de legalitat: només es pot fer allò que la norma habilita.',
        'Garantiza siete principios: legalidad, jerarquía normativa, publicidad de las normas, irretroactividad de las disposiciones sancionadoras no favorables o restrictivas de derechos individuales, seguridad jurídica, responsabilidad e interdicción de la arbitrariedad de los poderes públicos. Para un agente, el más operativo es el de legalidad: solo se puede hacer aquello que la norma habilita.',
      ),
      example(
        'Un veí et diu que una ordenança de Roses «no val» perquè li retalla un dret. La resposta correcta no és opinar: l’ordenança és vàlida mentre no es declari nul·la, però qualsevol norma municipal ha de respectar la Constitució i la llei. El control el fan els tribunals, no l’agent al carrer.',
        'Un vecino te dice que una ordenanza de Roses «no vale» porque le recorta un derecho. La respuesta correcta no es opinar: la ordenanza es válida mientras no se declare nula, pero cualquier norma municipal debe respetar la Constitución y la ley. El control lo hacen los tribunales, no el agente en la calle.',
      ),
      pitfall(
        'Es confonen les dues vies de reforma. La del article 167 és l’ordinària (3/5 de cada cambra). La de l’article 168 és l’agreujada i només s’aplica a una revisió total o que afecti el títol preliminar, la secció 1a del capítol II del títol I (drets fonamentals) o el títol II (la Corona): exigeix 2/3, dissolució de les Corts, ratificació per les noves cambres per 2/3 i referèndum obligatori.',
        'Se confunden las dos vías de reforma. La del artículo 167 es la ordinaria (3/5 de cada cámara). La del artículo 168 es la agravada y solo se aplica a una revisión total o que afecte al título preliminar, la sección 1ª del capítulo II del título I (derechos fundamentales) o el título II (la Corona): exige 2/3, disolución de las Cortes, ratificación por las nuevas cámaras por 2/3 y referéndum obligatorio.',
      ),
      checkpoint(
        'Quants articles té la Constitució i quins són els quatre valors superiors?',
        '¿Cuántos artículos tiene la Constitución y cuáles son los cuatro valores superiores?',
        '169 articles. Llibertat, justícia, igualtat i pluralisme polític (art. 1.1).',
        '169 artículos. Libertad, justicia, igualdad y pluralismo político (art. 1.1).',
      ),
    ],
    [
      refv('ce-1978', 'art. 1, 2, 9 i títol X (art. 166-169)', '2026-08-24'),
      refv('ce-1978', 'estructura general: títol preliminar i títols I a X', '2026-08-24'),
    ],
  ),

  lesson(
    2,
    'Drets fonamentals: què protegeix cada nivell',
    'Derechos fundamentales: qué protege cada nivel',
    6,
    [
      idea(
        'No tots els drets del títol I tenen la mateixa protecció. Saber en quin calaix cau cada dret és el que decideix si es pot anar a l’empara del Tribunal Constitucional o no.',
        'No todos los derechos del título I tienen la misma protección. Saber en qué cajón cae cada derecho es lo que decide si se puede ir al amparo del Tribunal Constitucional o no.',
      ),
      explain(
        'Els tres nivells de protecció',
        'Los tres niveles de protección',
        'Nivell màxim: l’article 14 (igualtat), la secció 1a del capítol II (articles 15 a 29) i l’objecció de consciència de l’article 30.2. Es regulen per llei orgànica, vinculen tots els poders públics, tenen procediment preferent i sumari davant els tribunals ordinaris i recurs d’empara davant el Tribunal Constitucional. Nivell intermedi: la secció 2a (articles 30 a 38), que vincula els poders públics i es regula per llei, però sense empara. Nivell mínim: els principis rectors del capítol III (articles 39 a 52), que informen la legislació però només es poden al·legar segons el que disposin les lleis que els desenvolupin.',
        'Nivel máximo: el artículo 14 (igualdad), la sección 1ª del capítulo II (artículos 15 a 29) y la objeción de conciencia del artículo 30.2. Se regulan por ley orgánica, vinculan a todos los poderes públicos, tienen procedimiento preferente y sumario ante los tribunales ordinarios y recurso de amparo ante el Tribunal Constitucional. Nivel intermedio: la sección 2ª (artículos 30 a 38), que vincula a los poderes públicos y se regula por ley, pero sin amparo. Nivel mínimo: los principios rectores del capítulo III (artículos 39 a 52), que informan la legislación pero solo se pueden alegar según lo que dispongan las leyes que los desarrollen.',
      ),
      explain(
        'Els drets que toca un agent cada dia',
        'Los derechos que toca un agente cada día',
        'Article 15: dret a la vida i a la integritat física i moral; prohibició de tortures i de tractes inhumans o degradants. Article 17: llibertat i seguretat; la detenció preventiva no pot durar més del temps estrictament necessari i, com a màxim, 72 hores. Article 18: honor, intimitat, pròpia imatge, inviolabilitat del domicili i secret de les comunicacions. Article 21: reunió pacífica i sense armes, que no necessita autorització prèvia. Article 24: tutela judicial efectiva i presumpció d’innocència.',
        'Artículo 15: derecho a la vida y a la integridad física y moral; prohibición de torturas y de tratos inhumanos o degradantes. Artículo 17: libertad y seguridad; la detención preventiva no puede durar más del tiempo estrictamente necesario y, como máximo, 72 horas. Artículo 18: honor, intimidad, propia imagen, inviolabilidad del domicilio y secreto de las comunicaciones. Artículo 21: reunión pacífica y sin armas, que no necesita autorización previa. Artículo 24: tutela judicial efectiva y presunción de inocencia.',
      ),
      compare(
        'Suspensió general i suspensió individual',
        'Suspensión general y suspensión individual',
        'Article 55.1 — estats d’excepció i de setge',
        'Artículo 55.1 — estados de excepción y de sitio',
        'Article 55.2 — bandes armades i terrorisme',
        'Artículo 55.2 — bandas armadas y terrorismo',
        [
          ['A qui afecta', 'A quién afecta', 'A tothom, de manera col·lectiva', 'A todos, de forma colectiva', 'A persones concretes investigades', 'A personas concretas investigadas'],
          ['Com s’activa', 'Cómo se activa', 'Declaració de l’estat d’excepció o de setge', 'Declaración del estado de excepción o de sitio', 'Llei orgànica, amb intervenció judicial i control parlamentari', 'Ley orgánica, con intervención judicial y control parlamentario'],
          ['Drets afectats', 'Derechos afectados', 'Art. 17, 18.2 i 18.3, 19, 20.1.a i d, 20.5, 21, 28.2 i 37.2', 'Art. 17, 18.2 y 18.3, 19, 20.1.a y d, 20.5, 21, 28.2 y 37.2', 'Només art. 17.2, 18.2 i 18.3', 'Solo art. 17.2, 18.2 y 18.3'],
        ],
      ),
      example(
        'En una detenció, l’agent ha de comunicar de manera immediata i comprensible els drets i les raons de la detenció (art. 17.3). Això no és una formalitat: si no es fa, la detenció pot ser declarada il·legal encara que el fet delictiu existís.',
        'En una detención, el agente debe comunicar de manera inmediata y comprensible los derechos y las razones de la detención (art. 17.3). Esto no es una formalidad: si no se hace, la detención puede ser declarada ilegal aunque el hecho delictivo existiera.',
      ),
      pitfall(
        'L’estat d’alarma NO permet suspendre drets fonamentals: l’article 55.1 només esmenta l’estat d’excepció i el de setge. L’alarma permet limitar-los, però no suspendre’ls.',
        'El estado de alarma NO permite suspender derechos fundamentales: el artículo 55.1 solo menciona el estado de excepción y el de sitio. La alarma permite limitarlos, pero no suspenderlos.',
      ),
      checkpoint(
        'Quins articles cobreix el recurs d’empara?',
        '¿Qué artículos cubre el recurso de amparo?',
        'L’article 14, els articles 15 a 29 i l’objecció de consciència de l’article 30.2 (art. 53.2).',
        'El artículo 14, los artículos 15 a 29 y la objeción de conciencia del artículo 30.2 (art. 53.2).',
      ),
    ],
    [
      refv('ce-1978', 'títol I, art. 10 a 55', '2026-08-24'),
      refv('ce-1978', 'art. 53 i 54 (garanties i Defensor del Poble)', '2026-08-24'),
    ],
  ),

  lesson(
    3,
    'L’Estatut d’Autonomia de Catalunya de 2006',
    'El Estatuto de Autonomía de Cataluña de 2006',
    5,
    [
      idea(
        'L’Estatut és la norma institucional bàsica de Catalunya. Formalment és una llei orgànica de l’Estat —la Llei orgànica 6/2006, de 19 de juliol— però funciona com la «constitució interna» del país: defineix drets, institucions i competències.',
        'El Estatuto es la norma institucional básica de Cataluña. Formalmente es una ley orgánica del Estado —la Ley orgánica 6/2006, de 19 de julio— pero funciona como la «constitución interna» del país: define derechos, instituciones y competencias.',
      ),
      explain(
        'Drets civils i socials, i drets polítics',
        'Derechos civiles y sociales, y derechos políticos',
        'El títol I recull drets, deures i principis rectors. En l’àmbit civil i social hi ha, entre altres, els drets relatius a la família, a viure amb dignitat el procés de la mort, a la protecció de dades, als consumidors i a l’habitatge. En l’àmbit polític i de l’Administració hi ha el dret de participació, el dret a una bona administració, el dret d’accés als serveis públics i el dret a la protecció davant les administracions.',
        'El título I recoge derechos, deberes y principios rectores. En el ámbito civil y social están, entre otros, los derechos relativos a la familia, a vivir con dignidad el proceso de la muerte, a la protección de datos, a los consumidores y a la vivienda. En el ámbito político y de la Administración están el derecho de participación, el derecho a una buena administración, el derecho de acceso a los servicios públicos y el derecho a la protección ante las administraciones.',
      ),
      explain(
        'Drets i deures lingüístics',
        'Derechos y deberes lingüísticos',
        'El català és la llengua pròpia de Catalunya i, juntament amb el castellà, llengua oficial. L’Estatut reconeix el dret d’opció lingüística: les persones tenen dret a ser ateses en la llengua oficial que triïn i les administracions han de garantir-ho. L’aranès és la llengua pròpia de l’Aran i també és oficial a Catalunya.',
        'El catalán es la lengua propia de Cataluña y, junto con el castellano, lengua oficial. El Estatuto reconoce el derecho de opción lingüística: las personas tienen derecho a ser atendidas en la lengua oficial que elijan y las administraciones deben garantizarlo. El aranés es la lengua propia del Arán y también es oficial en Cataluña.',
      ),
      explain(
        'Govern local i seguretat',
        'Gobierno local y seguridad',
        'L’Estatut dedica un capítol al govern local: reconeix el municipi com a ens bàsic, la vegueria com a àmbit territorial i la comarca i la província com a ens supramunicipals. En matèria de seguretat, atribueix a la Generalitat la competència sobre seguretat pública i sobre la coordinació de les policies locals, i configura els Mossos d’Esquadra com a policia integral de Catalunya.',
        'El Estatuto dedica un capítulo al gobierno local: reconoce el municipio como ente básico, la veguería como ámbito territorial y la comarca y la provincia como entes supramunicipales. En materia de seguridad, atribuye a la Generalitat la competencia sobre seguridad pública y sobre la coordinación de las policías locales, y configura a los Mossos d’Esquadra como policía integral de Cataluña.',
      ),
      pitfall(
        'La sentència del Tribunal Constitucional 31/2010 va declarar inconstitucionals o va reinterpretar diversos preceptes de l’Estatut. Quan estudiïs un article concret, comprova sempre si està afectat: hi ha preguntes d’exàmens antics redactades sobre la versió original.',
        'La sentencia del Tribunal Constitucional 31/2010 declaró inconstitucionales o reinterpretó varios preceptos del Estatuto. Cuando estudies un artículo concreto, comprueba siempre si está afectado: hay preguntas de exámenes antiguos redactadas sobre la versión original.',
      ),
      checkpoint(
        'Quina norma aprova l’Estatut vigent i de quin any és?',
        '¿Qué norma aprueba el Estatuto vigente y de qué año es?',
        'La Llei orgànica 6/2006, de 19 de juliol, de reforma de l’Estatut d’autonomia de Catalunya.',
        'La Ley orgánica 6/2006, de 19 de julio, de reforma del Estatuto de autonomía de Cataluña.',
      ),
    ],
    [
      refv('lo-6-2006-eac', 'títol I (drets i deures) i capítol de govern local', '2026-08-24'),
      refv('lo-6-2006-eac', 'competències en matèria de seguretat pública', '2026-08-24'),
    ],
  ),

  lesson(
    4,
    'Generalitat, Parlament i Govern',
    'Generalitat, Parlamento y Gobierno',
    5,
    [
      idea(
        'La Generalitat és el sistema institucional en què s’organitza políticament l’autogovern de Catalunya. No és només el Govern: inclou el Parlament, la Presidència, el Govern i les institucions estatutàries de control.',
        'La Generalitat es el sistema institucional en que se organiza políticamente el autogobierno de Cataluña. No es solo el Gobierno: incluye el Parlamento, la Presidencia, el Gobierno y las instituciones estatutarias de control.',
      ),
      explain(
        'El Parlament',
        'El Parlamento',
        'Representa el poble de Catalunya i és elegit per sufragi universal, lliure, igual, directe i secret per a un mandat de quatre anys. Exerceix la potestat legislativa, aprova els pressupostos, controla i impulsa l’acció política i de govern, i elegeix el president o presidenta de la Generalitat. És inviolable.',
        'Representa al pueblo de Cataluña y es elegido por sufragio universal, libre, igual, directo y secreto para un mandato de cuatro años. Ejerce la potestad legislativa, aprueba los presupuestos, controla e impulsa la acción política y de gobierno, y elige al presidente o presidenta de la Generalitat. Es inviolable.',
      ),
      explain(
        'La Presidència i el Govern',
        'La Presidencia y el Gobierno',
        'El president o presidenta de la Generalitat és elegit pel Parlament d’entre els seus membres i nomenat pel Rei. Té la més alta representació de la Generalitat i la representació ordinària de l’Estat a Catalunya. El Govern (Consell Executiu) és l’òrgan superior col·legiat que dirigeix l’acció política i l’Administració de la Generalitat; exerceix la funció executiva i la potestat reglamentària, i està format pel president, el conseller primer o vicepresident si n’hi ha, i els consellers.',
        'El presidente o presidenta de la Generalitat es elegido por el Parlamento de entre sus miembros y nombrado por el Rey. Tiene la más alta representación de la Generalitat y la representación ordinaria del Estado en Cataluña. El Gobierno (Consell Executiu) es el órgano superior colegiado que dirige la acción política y la Administración de la Generalitat; ejerce la función ejecutiva y la potestad reglamentaria, y está formado por el presidente, el conseller primer o vicepresidente si lo hay, y los consellers.',
      ),
      explain(
        'Competències en seguretat',
        'Competencias en seguridad',
        'La Generalitat té competència exclusiva en seguretat pública dins el marc constitucional, crea i organitza la Policia de la Generalitat–Mossos d’Esquadra, i coordina les policies locals. El departament competent en matèria de seguretat exerceix aquesta coordinació a través, entre altres instruments, de l’Institut de Seguretat Pública de Catalunya, que forma els agents.',
        'La Generalitat tiene competencia exclusiva en seguridad pública dentro del marco constitucional, crea y organiza la Policía de la Generalitat–Mossos d’Esquadra, y coordina las policías locales. El departamento competente en materia de seguridad ejerce esta coordinación a través, entre otros instrumentos, del Instituto de Seguridad Pública de Cataluña, que forma a los agentes.',
      ),
      pitfall(
        'Coordinar no és manar. La Generalitat coordina les policies locals, però la dependència jeràrquica de la Policia Local de Roses és de l’alcalde o alcaldessa, no del Departament d’Interior.',
        'Coordinar no es mandar. La Generalitat coordina las policías locales, pero la dependencia jerárquica de la Policía Local de Roses es del alcalde o alcaldesa, no del Departamento de Interior.',
      ),
      checkpoint(
        'Qui elegeix el president de la Generalitat i qui el nomena?',
        '¿Quién elige al presidente de la Generalitat y quién lo nombra?',
        'L’elegeix el Parlament d’entre els seus membres i el nomena el Rei.',
        'Lo elige el Parlamento de entre sus miembros y lo nombra el Rey.',
      ),
    ],
    [
      refv('lo-6-2006-eac', 'institucions de la Generalitat: Parlament, Presidència i Govern', '2026-08-24'),
      refv('llei-4-2003-seguretat-publica', 'art. 1 a 10, sistema de seguretat pública de Catalunya', '2026-08-24'),
    ],
  ),

  lesson(
    5,
    'El municipi: territori, població i organització',
    'El municipio: territorio, población y organización',
    5,
    [
      idea(
        'El municipi és l’entitat bàsica de l’organització territorial de l’Estat i el canal immediat de participació ciutadana. Té personalitat jurídica pròpia i plena capacitat per complir les seves finalitats.',
        'El municipio es la entidad básica de la organización territorial del Estado y el cauce inmediato de participación ciudadana. Tiene personalidad jurídica propia y plena capacidad para cumplir sus fines.',
      ),
      explain(
        'Els tres elements',
        'Los tres elementos',
        'Territori: el terme municipal, on l’ajuntament exerceix les seves competències. Població: el conjunt de persones inscrites al padró municipal d’habitants, que en són veïns. Organització: l’estructura de govern, formada com a mínim per l’alcalde, els tinents d’alcalde i el ple. Als municipis de més de 5.000 habitants —i a Roses— també hi ha junta de govern local.',
        'Territorio: el término municipal, donde el ayuntamiento ejerce sus competencias. Población: el conjunto de personas inscritas en el padrón municipal de habitantes, que son sus vecinos. Organización: la estructura de gobierno, formada como mínimo por el alcalde, los tenientes de alcalde y el pleno. En los municipios de más de 5.000 habitantes —y en Roses— también hay junta de gobierno local.',
      ),
      explain(
        'Potestats municipals',
        'Potestades municipales',
        'La llei de bases atribueix als municipis, entre altres, la potestat reglamentària i d’autoorganització, la tributària i financera, la de programació o planificació, l’expropiatòria i la d’investigació, delimitació i recuperació d’ofici dels seus béns, la presumpció de legitimitat i l’executivitat dels seus actes, les potestats d’execució forçosa i sancionadora, la inembargabilitat dels seus béns i drets en els termes legals, i les prerrogatives de prelació i preferència.',
        'La ley de bases atribuye a los municipios, entre otras, la potestad reglamentaria y de autoorganización, la tributaria y financiera, la de programación o planificación, la expropiatoria y la de investigación, deslinde y recuperación de oficio de sus bienes, la presunción de legitimidad y la ejecutividad de sus actos, las potestades de ejecución forzosa y sancionadora, la inembargabilidad de sus bienes y derechos en los términos legales, y las prerrogativas de prelación y preferencia.',
      ),
      explain(
        'Competències pròpies',
        'Competencias propias',
        'Entre les competències que la llei reconeix als municipis hi ha la seguretat en llocs públics i la policia local, la protecció civil i la prevenció i extinció d’incendis, el trànsit i l’estacionament de vehicles i la mobilitat, l’urbanisme, el medi ambient urbà, l’abastament d’aigua i la gestió de residus, la protecció de la salubritat pública, els serveis socials, la promoció de l’esport i la cultura i la protecció del patrimoni.',
        'Entre las competencias que la ley reconoce a los municipios están la seguridad en lugares públicos y la policía local, la protección civil y la prevención y extinción de incendios, el tráfico y el estacionamiento de vehículos y la movilidad, el urbanismo, el medio ambiente urbano, el abastecimiento de agua y la gestión de residuos, la protección de la salubridad pública, los servicios sociales, la promoción del deporte y la cultura y la protección del patrimonio.',
      ),
      example(
        'Quan un agent de Roses denuncia un estacionament indegut, l’habilitació no surt del no-res: neix de la competència municipal sobre trànsit, es concreta a l’ordenança municipal de circulació i s’exerceix amb la potestat sancionadora del municipi.',
        'Cuando un agente de Roses denuncia un estacionamiento indebido, la habilitación no sale de la nada: nace de la competencia municipal sobre tráfico, se concreta en la ordenanza municipal de circulación y se ejerce con la potestad sancionadora del municipio.',
      ),
      pitfall(
        'Veí i resident no són sinònims administratius: veí és qui està inscrit al padró municipal d’habitants. Una persona pot viure de fet a Roses i no ser-ne veïna si no s’hi ha empadronat.',
        'Vecino y residente no son sinónimos administrativos: vecino es quien está inscrito en el padrón municipal de habitantes. Una persona puede vivir de hecho en Roses y no ser vecina si no se ha empadronado.',
      ),
      checkpoint(
        'Quins són els tres elements del municipi?',
        '¿Cuáles son los tres elementos del municipio?',
        'Territori, població i organització.',
        'Territorio, población y organización.',
      ),
    ],
    [
      refv('llei-7-1985-lrbrl', 'art. 1, 4, 11, 12, 15, 16, 20 i 25', '2026-08-24'),
    ],
  ),
]
