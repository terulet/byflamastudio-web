/** Microlliçons dels temes 21 a 25 (bloc Seguretat, policia i dret penal). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, ref, refv } from '../authoring.ts'

export const LESSONS_21_25: Lesson[] = [
  lesson(
    21,
    'Llei orgànica 2/1986: el mapa dels cossos policials',
    'Ley orgánica 2/1986: el mapa de los cuerpos policiales',
    6,
    [
      idea(
        'La seguretat pública és competència exclusiva de l’Estat, però l’exerceixen tres nivells de cossos: els estatals, els autonòmics i els locals. La Llei orgànica 2/1986 és la norma que els ordena i, sobretot, la que fixa com han d’actuar.',
        'La seguridad pública es competencia exclusiva del Estado, pero la ejercen tres niveles de cuerpos: los estatales, los autonómicos y los locales. La Ley orgánica 2/1986 es la norma que los ordena y, sobre todo, la que fija cómo deben actuar.',
      ),
      explain(
        'Els cossos',
        'Los cuerpos',
        'De l’Estat: el Cos Nacional de Policia, de naturalesa civil, i la Guàrdia Civil, de naturalesa militar. De les comunitats autònomes: a Catalunya, la Policia de la Generalitat–Mossos d’Esquadra. De les corporacions locals: els cossos de policia local. Tots ells són forces i cossos de seguretat i han de col·laborar, cooperar i prestar-se auxili mutu.',
        'Del Estado: el Cuerpo Nacional de Policía, de naturaleza civil, y la Guardia Civil, de naturaleza militar. De las comunidades autónomas: en Cataluña, la Policía de la Generalitat–Mossos d’Esquadra. De las corporaciones locales: los cuerpos de policía local. Todos ellos son fuerzas y cuerpos de seguridad y deben colaborar, cooperar y prestarse auxilio mutuo.',
      ),
      explain(
        'Els principis bàsics d’actuació',
        'Los principios básicos de actuación',
        'Són el nucli de tot el temari. Es reparteixen en sis grups: adequació a l’ordenament jurídic; relacions amb la comunitat; tractament de les persones detingudes; dedicació professional; secret professional; i responsabilitat. Dins l’adequació a l’ordenament hi ha el deure d’actuar amb integritat i dignitat, l’obediència no cega i la subjecció a la Constitució.',
        'Son el núcleo de todo el temario. Se reparten en seis grupos: adecuación al ordenamiento jurídico; relaciones con la comunidad; tratamiento de las personas detenidas; dedicación profesional; secreto profesional; y responsabilidad. Dentro de la adecuación al ordenamiento están el deber de actuar con integridad y dignidad, la obediencia no ciega y la sujeción a la Constitución.',
      ),
      explain(
        'Congruència, oportunitat i proporcionalitat',
        'Congruencia, oportunidad y proporcionalidad',
        'En les relacions amb la comunitat, la llei imposa actuar amb congruència, oportunitat i proporcionalitat en la utilització dels mitjans al seu abast. I afegeix un límit específic per a les armes: només es poden utilitzar en situacions en què hi hagi un risc racionalment greu per a la vida o la integritat física dels agents o de terceres persones, o un risc greu per a la seguretat ciutadana, i sempre d’acord amb aquells principis.',
        'En las relaciones con la comunidad, la ley impone actuar con congruencia, oportunidad y proporcionalidad en la utilización de los medios a su alcance. Y añade un límite específico para las armas: solo se pueden utilizar en situaciones en que exista un riesgo racionalmente grave para la vida o la integridad física de los agentes o de terceras personas, o un riesgo grave para la seguridad ciudadana, y siempre de acuerdo con aquellos principios.',
      ),
      explain(
        'Funcions de les policies locals',
        'Funciones de las policías locales',
        'Protegir les autoritats de la corporació local i vigilar-ne els edificis i les instal·lacions; ordenar, senyalitzar i dirigir el trànsit al nucli urbà; instruir atestats per accidents de circulació dins el nucli urbà; policia administrativa en matèria d’ordenances, bans i altres disposicions municipals; participar en funcions de policia judicial; prestar auxili en accidents, catàstrofes i calamitats públiques; efectuar diligències de prevenció per evitar la comissió d’actes delictius; vigilar els espais públics; i cooperar en la resolució de conflictes privats quan siguin requerides.',
        'Proteger a las autoridades de la corporación local y vigilar sus edificios e instalaciones; ordenar, señalizar y dirigir el tráfico en el casco urbano; instruir atestados por accidentes de circulación dentro del casco urbano; policía administrativa en materia de ordenanzas, bandos y demás disposiciones municipales; participar en funciones de policía judicial; prestar auxilio en accidentes, catástrofes y calamidades públicas; efectuar diligencias de prevención para evitar la comisión de actos delictivos; vigilar los espacios públicos; y cooperar en la resolución de conflictos privados cuando sean requeridas.',
      ),
      pitfall(
        'Instruir atestats per accidents de circulació és funció de la policia local **dins el nucli urbà**. Fora d’aquest àmbit correspon a un altre cos, tot i que els primers auxilis i l’asseguració del lloc són sempre obligació de qui hi arriba primer.',
        'Instruir atestados por accidentes de circulación es función de la policía local **dentro del casco urbano**. Fuera de este ámbito corresponde a otro cuerpo, aunque los primeros auxilios y el aseguramiento del lugar son siempre obligación de quien llega primero.',
      ),
      checkpoint(
        'Quan es poden utilitzar les armes de foc?',
        '¿Cuándo se pueden utilizar las armas de fuego?',
        'Només davant un risc racionalment greu per a la vida o la integritat física pròpia o de tercers, o un risc greu per a la seguretat ciutadana, i amb congruència, oportunitat i proporcionalitat.',
        'Solo ante un riesgo racionalmente grave para la vida o la integridad física propia o de terceros, o un riesgo grave para la seguridad ciudadana, y con congruencia, oportunidad y proporcionalidad.',
      ),
    ],
    [
      refv('lo-2-1986-fcs', 'art. 1, 2, 5, 9, 11 i 53', '2026-08-24'),
    ],
  ),

  lesson(
    22,
    'El sistema de seguretat pública de Catalunya',
    'El sistema de seguridad pública de Cataluña',
    5,
    [
      idea(
        'La Llei 4/2003 no crea un cos nou: crea un **sistema**. Ordena com es relacionen la Generalitat, els ajuntaments, els cossos policials i els serveis d’emergències perquè la seguretat funcioni com un conjunt i no com peces soltes.',
        'La Ley 4/2003 no crea un cuerpo nuevo: crea un **sistema**. Ordena cómo se relacionan la Generalitat, los ayuntamientos, los cuerpos policiales y los servicios de emergencias para que la seguridad funcione como un conjunto y no como piezas sueltas.',
      ),
      explain(
        'Què integra el sistema',
        'Qué integra el sistema',
        'Les administracions amb competències en seguretat (Generalitat i ens locals), els cossos policials (Mossos d’Esquadra i policies locals), els serveis de prevenció i extinció d’incendis i salvaments, els serveis de protecció civil, els serveis d’emergències mèdiques i, en allò que la llei preveu, la seguretat privada i els col·lectius que hi col·laboren.',
        'Las administraciones con competencias en seguridad (Generalitat y entes locales), los cuerpos policiales (Mossos d’Esquadra y policías locales), los servicios de prevención y extinción de incendios y salvamentos, los servicios de protección civil, los servicios de emergencias médicas y, en lo que la ley prevé, la seguridad privada y los colectivos que colaboran.',
      ),
      explain(
        'Òrgans del sistema',
        'Órganos del sistema',
        'El Consell de Seguretat de Catalunya és l’òrgan consultiu i de participació superior en matèria de seguretat. La Comissió del Govern per a la Seguretat coordina l’acció dels departaments. Al territori hi ha les juntes locals de seguretat en l’àmbit municipal i les taules de coordinació operativa per a la coordinació dels serveis en actuacions concretes.',
        'El Consejo de Seguridad de Cataluña es el órgano consultivo y de participación superior en materia de seguridad. La Comisión del Gobierno para la Seguridad coordina la acción de los departamentos. En el territorio están las juntas locales de seguridad en el ámbito municipal y las mesas de coordinación operativa para la coordinación de los servicios en actuaciones concretas.',
      ),
      explain(
        'Els instruments de planificació',
        'Los instrumentos de planificación',
        'El Pla general de seguretat de Catalunya fixa els objectius i les prioritats per a tot el país. Els plans locals de seguretat concreten aquests objectius al municipi a partir de l’anàlisi de la realitat local i els aprova la junta local de seguretat. Roses, com a municipi amb cos de policia local propi i forta estacionalitat turística, és un cas clàssic de planificació amb pics d’activitat molt marcats.',
        'El Plan general de seguridad de Cataluña fija los objetivos y las prioridades para todo el país. Los planes locales de seguridad concretan estos objetivos en el municipio a partir del análisis de la realidad local y los aprueba la junta local de seguridad. Roses, como municipio con cuerpo de policía local propio y fuerte estacionalidad turística, es un caso clásico de planificación con picos de actividad muy marcados.',
      ),
      pitfall(
        'El Consell de Seguretat de Catalunya és consultiu i de participació: no dona ordres operatives. Qui coordina l’operativa al municipi és la junta local de seguretat, i qui mana sobre la policia local és l’alcalde.',
        'El Consejo de Seguridad de Cataluña es consultivo y de participación: no da órdenes operativas. Quien coordina la operativa en el municipio es la junta local de seguridad, y quien manda sobre la policía local es el alcalde.',
      ),
      checkpoint(
        'Quin instrument concreta els objectius de seguretat al municipi?',
        '¿Qué instrumento concreta los objetivos de seguridad en el municipio?',
        'El pla local de seguretat, aprovat per la junta local de seguretat.',
        'El plan local de seguridad, aprobado por la junta local de seguridad.',
      ),
    ],
    [
      refv('llei-4-2003-seguretat-publica', 'sistema de seguretat pública, òrgans i planificació', '2026-08-24'),
    ],
  ),

  lesson(
    23,
    'Les juntes locals de seguretat',
    'Las juntas locales de seguridad',
    4,
    [
      idea(
        'La junta local de seguretat és l’òrgan on s’asseuen a la mateixa taula l’ajuntament, els Mossos d’Esquadra i la policia local per decidir la política de seguretat del municipi. És obligatòria als municipis que tenen cos de policia local propi, com Roses.',
        'La junta local de seguridad es el órgano donde se sientan en la misma mesa el ayuntamiento, los Mossos d’Esquadra y la policía local para decidir la política de seguridad del municipio. Es obligatoria en los municipios que tienen cuerpo de policía local propio, como Roses.',
      ),
      explain(
        'Composició',
        'Composición',
        'La presideix l’alcalde o alcaldessa. Hi participen el representant del Govern de la Generalitat al territori, els caps dels cossos policials que hi actuen —el cap de la policia local i el comandament dels Mossos d’Esquadra de l’àrea bàsica policial—, i els regidors o tècnics municipals amb competències relacionades. Hi poden assistir altres persones convidades per raó de l’assumpte.',
        'La preside el alcalde o alcaldesa. Participan el representante del Gobierno de la Generalitat en el territorio, los jefes de los cuerpos policiales que actúan —el jefe de la policía local y el mando de los Mossos d’Esquadra del área básica policial—, y los concejales o técnicos municipales con competencias relacionadas. Pueden asistir otras personas invitadas por razón del asunto.',
      ),
      explain(
        'Funcions',
        'Funciones',
        'Analitzar i valorar la situació de seguretat del municipi; elaborar i aprovar el pla local de seguretat i fer-ne el seguiment; establir els criteris de coordinació i col·laboració entre els cossos que hi actuen; concretar els dispositius conjunts per a esdeveniments singulars; i canalitzar la informació entre administracions. Les seves decisions es documenten en actes i vinculen els serveis representats en allò que els correspon.',
        'Analizar y valorar la situación de seguridad del municipio; elaborar y aprobar el plan local de seguridad y hacer su seguimiento; establecer los criterios de coordinación y colaboración entre los cuerpos que actúan; concretar los dispositivos conjuntos para eventos singulares; y canalizar la información entre administraciones. Sus decisiones se documentan en actas y vinculan a los servicios representados en lo que les corresponde.',
      ),
      example(
        'Un dispositiu conjunt per a la Festa Major o per a un cap de setmana d’agost a Roses és exactament el tipus de decisió que es prepara i s’acorda a la junta local de seguretat: qui cobreix què, amb quins efectius i amb quin comandament únic.',
        'Un dispositivo conjunto para la Fiesta Mayor o para un fin de semana de agosto en Roses es exactamente el tipo de decisión que se prepara y se acuerda en la junta local de seguridad: quién cubre qué, con qué efectivos y con qué mando único.',
      ),
      pitfall(
        'La junta local de seguretat no és un òrgan de comandament operatiu en temps real. Coordina, planifica i acorda criteris; la direcció d’un dispositiu concret correspon als comandaments dels cossos segons el que s’hi hagi acordat.',
        'La junta local de seguridad no es un órgano de mando operativo en tiempo real. Coordina, planifica y acuerda criterios; la dirección de un dispositivo concreto corresponde a los mandos de los cuerpos según lo que se haya acordado.',
      ),
      checkpoint(
        'Qui presideix la junta local de seguretat?',
        '¿Quién preside la junta local de seguridad?',
        'L’alcalde o alcaldessa del municipi.',
        'El alcalde o alcaldesa del municipio.',
      ),
    ],
    [
      refv('llei-4-2003-seguretat-publica', 'juntes locals de seguretat', '2026-08-24'),
      refv('decret-151-1998-juntes', 'composició, funcions i funcionament', '2026-08-24'),
    ],
  ),

  lesson(
    24,
    'Llei 16/1991: estructura i funcions de les policies locals',
    'Ley 16/1991: estructura y funciones de las policías locales',
    6,
    [
      idea(
        'Aquesta és la llei pròpia de la teva feina. Defineix què és un cos de policia local a Catalunya, com s’organitza en escales i categories, de qui depèn i què pot fer.',
        'Esta es la ley propia de tu trabajo. Define qué es un cuerpo de policía local en Cataluña, cómo se organiza en escalas y categorías, de quién depende y qué puede hacer.',
      ),
      explain(
        'Naturalesa i dependència',
        'Naturaleza y dependencia',
        'Els cossos de policia local són instituts armats de naturalesa civil, amb estructura i organització jerarquitzada. Depenen de l’alcalde o alcaldessa, que n’és el cap superior. Només poden actuar dins el terme municipal, llevat dels supòsits d’emergència, quan actuen en funcions de protecció d’autoritats de la corporació o quan ho autoritzi expressament la normativa.',
        'Los cuerpos de policía local son institutos armados de naturaleza civil, con estructura y organización jerarquizada. Dependen del alcalde o alcaldesa, que es su jefe superior. Solo pueden actuar dentro del término municipal, salvo los supuestos de emergencia, cuando actúan en funciones de protección de autoridades de la corporación o cuando lo autorice expresamente la normativa.',
      ),
      explain(
        'Escales i categories',
        'Escalas y categorías',
        'L’estructura s’organitza en escales. L’escala bàsica correspon a la categoria d’agent, que és la porta d’entrada al cos i la que es convoca a Roses. Per damunt hi ha l’escala intermèdia (caporal i sergent), l’escala executiva (sotsinspector i inspector) i l’escala superior (intendent, intendent major i superintendent). L’accés a la categoria d’agent és pel grup C1.',
        'La estructura se organiza en escalas. La escala básica corresponde a la categoría de agente, que es la puerta de entrada al cuerpo y la que se convoca en Roses. Por encima están la escala intermedia (cabo y sargento), la escala ejecutiva (subinspector e inspector) y la escala superior (intendente, intendente mayor y superintendente). El acceso a la categoría de agente es por el grupo C1.',
      ),
      explain(
        'Funcions',
        'Funciones',
        'Coincideixen en essència amb les de la Llei orgànica 2/1986 i s’hi afegeix la vessant de policia de proximitat: protegir les autoritats locals, ordenar i dirigir el trànsit urbà, instruir atestats d’accidents al nucli urbà, exercir de policia administrativa, col·laborar en funcions de policia judicial, prestar auxili en emergències, prevenir la delinqüència, vigilar l’espai públic i cooperar en la resolució de conflictes privats quan siguin requerides.',
        'Coinciden en esencia con las de la Ley orgánica 2/1986 y se añade la vertiente de policía de proximidad: proteger a las autoridades locales, ordenar y dirigir el tráfico urbano, instruir atestados de accidentes en el casco urbano, ejercer de policía administrativa, colaborar en funciones de policía judicial, prestar auxilio en emergencias, prevenir la delincuencia, vigilar el espacio público y cooperar en la resolución de conflictos privados cuando sean requeridas.',
      ),
      pitfall(
        'La Llei 16/1991 ha estat modificada diverses vegades, entre altres per la Llei 3/2023. Quan estudiïs categories, requisits d’accés o segona activitat, treballa sempre sobre el text consolidat del Portal Jurídic i no sobre apunts antics.',
        'La Ley 16/1991 ha sido modificada varias veces, entre otras por la Ley 3/2023. Cuando estudies categorías, requisitos de acceso o segunda actividad, trabaja siempre sobre el texto consolidado del Portal Jurídico y no sobre apuntes antiguos.',
      ),
      checkpoint(
        'De qui depèn jeràrquicament la policia local i quin és el seu àmbit territorial?',
        '¿De quién depende jerárquicamente la policía local y cuál es su ámbito territorial?',
        'De l’alcalde o alcaldessa, i actua dins el terme municipal excepte en els supòsits que la llei preveu.',
        'Del alcalde o alcaldesa, y actúa dentro del término municipal excepto en los supuestos que la ley prevé.',
      ),
    ],
    [
      refv('llei-16-1991-policies-locals', 'naturalesa, dependència, escales, categories i funcions', '2026-08-24'),
      refv('roses-bases-2026-interins', 'capçalera de la convocatòria (grup de titulació C1)', '2026-08-24'),
    ],
  ),

  lesson(
    25,
    'Ètica i deontologia professional',
    'Ética y deontología profesional',
    5,
    [
      idea(
        'La deontologia no és un afegit moral: és el que separa una actuació legítima d’un abús. Tres textos la sostenen: la Declaració Universal dels Drets Humans, la Carta de Drets Fonamentals de la Unió Europea i el Codi d’ètica de la Policia de Catalunya.',
        'La deontología no es un añadido moral: es lo que separa una actuación legítima de un abuso. Tres textos la sostienen: la Declaración Universal de los Derechos Humanos, la Carta de Derechos Fundamentales de la Unión Europea y el Código de ética de la Policía de Cataluña.',
      ),
      explain(
        'La Declaració Universal dels Drets Humans',
        'La Declaración Universal de los Derechos Humanos',
        'Adoptada i proclamada per l’Assemblea General de les Nacions Unides el 10 de desembre de 1948 a París, mitjançant la Resolució 217 A (III). Té un preàmbul i trenta articles. L’article 1 proclama que tots els éssers humans neixen lliures i iguals en dignitat i drets. No és un tractat vinculant en si mateixa, però ha inspirat pràcticament tot el dret internacional dels drets humans posterior.',
        'Adoptada y proclamada por la Asamblea General de las Naciones Unidas el 10 de diciembre de 1948 en París, mediante la Resolución 217 A (III). Tiene un preámbulo y treinta artículos. El artículo 1 proclama que todos los seres humanos nacen libres e iguales en dignidad y derechos. No es un tratado vinculante en sí misma, pero ha inspirado prácticamente todo el derecho internacional de los derechos humanos posterior.',
      ),
      explain(
        'La Carta de Drets Fonamentals de la UE',
        'La Carta de Derechos Fundamentales de la UE',
        'Proclamada a Niça l’any 2000 i amb el mateix valor jurídic que els Tractats des de l’entrada en vigor del Tractat de Lisboa el 2009. Té cinquanta-quatre articles agrupats en set títols: dignitat, llibertats, igualtat, solidaritat, ciutadania, justícia i disposicions generals. S’aplica a les institucions de la Unió i als estats membres quan apliquen dret de la Unió.',
        'Proclamada en Niza en el año 2000 y con el mismo valor jurídico que los Tratados desde la entrada en vigor del Tratado de Lisboa en 2009. Tiene cincuenta y cuatro artículos agrupados en siete títulos: dignidad, libertades, igualdad, solidaridad, ciudadanía, justicia y disposiciones generales. Se aplica a las instituciones de la Unión y a los estados miembros cuando aplican derecho de la Unión.',
      ),
      explain(
        'El Codi d’ètica de la Policia de Catalunya',
        'El Código de ética de la Policía de Cataluña',
        'Aprovat per l’Acord GOV/25/2015, de 24 de febrer. Recull els principis, valors i pautes de conducta que orienten l’actuació policial a Catalunya: respecte als drets humans, integritat, imparcialitat, proporcionalitat en l’ús de la força, transparència, servei a la ciutadania i responsabilitat. S’aplica als Mossos d’Esquadra i a les policies locals, que poden desenvolupar-ne codis propis.',
        'Aprobado por el Acuerdo GOV/25/2015, de 24 de febrero. Recoge los principios, valores y pautas de conducta que orientan la actuación policial en Cataluña: respeto a los derechos humanos, integridad, imparcialidad, proporcionalidad en el uso de la fuerza, transparencia, servicio a la ciudadanía y responsabilidad. Se aplica a los Mossos d’Esquadra y a las policías locales, que pueden desarrollar códigos propios.',
      ),
      example(
        'Un company t’explica que ha «arreglat» una denúncia a un conegut. Això no és un favor: és un tracte de favor prohibit pels principis ètics, una possible falta disciplinària i, segons el cas, un delicte. La deontologia obliga també davant els propis.',
        'Un compañero te cuenta que ha «arreglado» una denuncia a un conocido. Eso no es un favor: es un trato de favor prohibido por los principios éticos, una posible falta disciplinaria y, según el caso, un delito. La deontología obliga también ante los propios.',
      ),
      pitfall(
        'La Declaració Universal no és un tractat i no crea per si sola obligacions exigibles davant un tribunal. La Carta de la UE sí que té valor jurídic vinculant. Aquesta diferència es pregunta sovint.',
        'La Declaración Universal no es un tratado y no crea por sí sola obligaciones exigibles ante un tribunal. La Carta de la UE sí tiene valor jurídico vinculante. Esta diferencia se pregunta a menudo.',
      ),
      checkpoint(
        'Quants articles té la Declaració Universal i en quina data es va proclamar?',
        '¿Cuántos artículos tiene la Declaración Universal y en qué fecha se proclamó?',
        'Trenta articles, proclamada el 10 de desembre de 1948.',
        'Treinta artículos, proclamada el 10 de diciembre de 1948.',
      ),
    ],
    [
      refv('ddhh-1948', 'preàmbul i art. 1 a 30', '2026-08-24'),
      refv('carta-drets-ue', 'títols I a VII', '2026-08-24'),
      refv('codi-etic-policia-catalunya', 'Acord GOV/25/2015, principis i pautes de conducta', '2026-08-24'),
    ],
  ),
]
