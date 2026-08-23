/** Microlliçons dels temes 37 a 40 (bloc Actuació policial i protecció). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, ref } from '../authoring.ts'

export const LESSONS_37_40: Lesson[] = [
  lesson(
    37,
    'Detenció, drets i habeas corpus',
    'Detención, derechos y habeas corpus',
    7,
    [
      idea(
        'La detenció és la mesura més invasiva que pot adoptar un agent sense ordre judicial. Per això té un catàleg de drets tancat, uns terminis rígids i un procediment específic per revisar-la: l’habeas corpus.',
        'La detención es la medida más invasiva que puede adoptar un agente sin orden judicial. Por eso tiene un catálogo de derechos cerrado, unos plazos rígidos y un procedimiento específico para revisarla: el habeas corpus.',
      ),
      explain(
        'Quan es pot detenir',
        'Cuándo se puede detener',
        'Els particulars **poden** detenir en supòsits taxats: qui intenta cometre un delicte en el moment d’anar a cometre’l, el delinqüent in fraganti, qui s’ha fugat d’un establiment penal o mentre és conduït a la presó, i el processat o condemnat en rebel·lia. L’autoritat i els agents de policia judicial **han** de detenir en aquests casos i, a més, quan hi hagi motius racionalment bastants per creure en l’existència d’un delicte i per creure que la persona hi va participar.',
        'Los particulares **pueden** detener en supuestos tasados: quien intenta cometer un delito en el momento de ir a cometerlo, el delincuente in fraganti, quien se ha fugado de un establecimiento penal o mientras es conducido a prisión, y el procesado o condenado en rebeldía. La autoridad y los agentes de policía judicial **deben** detener en estos casos y, además, cuando existan motivos racionalmente bastantes para creer en la existencia de un delito y para creer que la persona participó en él.',
      ),
      explain(
        'Drets de la persona detinguda',
        'Derechos de la persona detenida',
        'Ser informada per escrit, de manera immediata i comprensible, dels fets que se li atribueixen i dels motius de la privació de llibertat. Guardar silenci, no declarar contra si mateixa i no confessar-se culpable. Designar advocat i ser assistida per ell sense demora injustificada. Accedir als elements de les actuacions essencials per impugnar la legalitat de la detenció. Que es comuniqui la detenció i el lloc de custòdia a un familiar o persona que designi. Comunicar-se telefònicament amb un tercer. Ser assistida gratuïtament per intèrpret. Ser reconeguda pel metge forense. I ser assistida per les autoritats consulars si és estrangera.',
        'Ser informada por escrito, de manera inmediata y comprensible, de los hechos que se le atribuyen y de los motivos de la privación de libertad. Guardar silencio, no declarar contra sí misma y no confesarse culpable. Designar abogado y ser asistida por él sin demora injustificada. Acceder a los elementos de las actuaciones esenciales para impugnar la legalidad de la detención. Que se comunique la detención y el lugar de custodia a un familiar o persona que designe. Comunicarse telefónicamente con un tercero. Ser asistida gratuitamente por intérprete. Ser reconocida por el médico forense. Y ser asistida por las autoridades consulares si es extranjera.',
      ),
      explain(
        'Terminis',
        'Plazos',
        'La detenció preventiva no pot durar més del temps estrictament necessari per fer les esbrinacions tendents a l’esclariment dels fets. En tot cas, dins les setanta-dues hores la persona detinguda ha de ser posada en llibertat o a disposició de l’autoritat judicial. El límit constitucional de setanta-dues hores és un màxim absolut, no un termini que es pugui esgotar per rutina.',
        'La detención preventiva no puede durar más del tiempo estrictamente necesario para practicar las averiguaciones tendentes al esclarecimiento de los hechos. En todo caso, dentro de las setenta y dos horas la persona detenida debe ser puesta en libertad o a disposición de la autoridad judicial. El límite constitucional de setenta y dos horas es un máximo absoluto, no un plazo que pueda agotarse por rutina.',
      ),
      explain(
        'Habeas corpus',
        'Habeas corpus',
        'És un procediment sumari i urgent per posar immediatament a disposició judicial qualsevol persona detinguda il·legalment. Poden instar-lo la persona privada de llibertat, el seu cònjuge o persona unida per relació anàloga d’afectivitat, descendents, ascendents, germans, els representants legals si és menor o persona amb la capacitat modificada, el Ministeri Fiscal i el Defensor del Poble. És competent el jutge d’instrucció del lloc on es troba la persona detinguda. El jutge ha de resoldre en un termini de vint-i-quatre hores.',
        'Es un procedimiento sumario y urgente para poner inmediatamente a disposición judicial a cualquier persona detenida ilegalmente. Pueden instarlo la persona privada de libertad, su cónyuge o persona unida por relación análoga de afectividad, descendientes, ascendientes, hermanos, los representantes legales si es menor o persona con la capacidad modificada, el Ministerio Fiscal y el Defensor del Pueblo. Es competente el juez de instrucción del lugar donde se encuentra la persona detenida. El juez debe resolver en un plazo de veinticuatro horas.',
      ),
      pitfall(
        'L’habeas corpus no serveix per discutir si la persona és culpable ni per revisar el fons de la causa. Només examina la **legalitat de la privació de llibertat**: si és il·legal, s’acorda l’alliberament o la posada a disposició judicial.',
        'El habeas corpus no sirve para discutir si la persona es culpable ni para revisar el fondo de la causa. Solo examina la **legalidad de la privación de libertad**: si es ilegal, se acuerda la liberación o la puesta a disposición judicial.',
      ),
      checkpoint(
        'En quin termini ha de resoldre el jutge un procediment d’habeas corpus?',
        '¿En qué plazo debe resolver el juez un procedimiento de habeas corpus?',
        'En vint-i-quatre hores.',
        'En veinticuatro horas.',
      ),
    ],
    [
      ref('lecrim-1882', 'art. 490, 492, 496 i 520'),
      ref('lo-6-1984-habeas', 'art. 1 a 9 (legitimació, competència i termini)'),
      ref('ce-1978', 'art. 17'),
    ],
  ),

  lesson(
    38,
    'L’ordre de protecció de les víctimes',
    'La orden de protección de las víctimas',
    5,
    [
      idea(
        'L’ordre de protecció és una resolució judicial única que activa alhora mesures penals, civils i d’assistència social. Un sol document dona a la víctima un estatut integral de protecció.',
        'La orden de protección es una resolución judicial única que activa a la vez medidas penales, civiles y de asistencia social. Un solo documento da a la víctima un estatuto integral de protección.',
      ),
      explain(
        'Pressupòsits',
        'Presupuestos',
        'Calen dos elements: indicis fundats de la comissió d’un delicte contra la vida, la integritat física o moral, la llibertat sexual, la llibertat o la seguretat d’alguna de les persones incloses a l’àmbit de la violència domèstica o de gènere; i una situació objectiva de risc per a la víctima que requereixi l’adopció d’alguna mesura de protecció.',
        'Se necesitan dos elementos: indicios fundados de la comisión de un delito contra la vida, la integridad física o moral, la libertad sexual, la libertad o la seguridad de alguna de las personas incluidas en el ámbito de la violencia doméstica o de género; y una situación objetiva de riesgo para la víctima que requiera la adopción de alguna medida de protección.',
      ),
      explain(
        'Qui la pot demanar i com',
        'Quién puede pedirla y cómo',
        'La pot sol·licitar la víctima, les persones del seu entorn familiar més proper, el Ministeri Fiscal, o acordar-la el jutge d’ofici. La sol·licitud es pot presentar directament davant l’autoritat judicial o el Ministeri Fiscal, però també davant les forces i cossos de seguretat, les oficines d’atenció a la víctima i els serveis socials o assistencials. Aquestes institucions l’han de remetre immediatament al jutge competent.',
        'Puede solicitarla la víctima, las personas de su entorno familiar más cercano, el Ministerio Fiscal, o acordarla el juez de oficio. La solicitud puede presentarse directamente ante la autoridad judicial o el Ministerio Fiscal, pero también ante las fuerzas y cuerpos de seguridad, las oficinas de atención a la víctima y los servicios sociales o asistenciales. Estas instituciones deben remitirla inmediatamente al juez competente.',
      ),
      explain(
        'Tramitació i contingut',
        'Tramitación y contenido',
        'Rebuda la sol·licitud, el jutge de guàrdia convoca una audiència urgent amb la víctima, el sol·licitant, el presumpte agressor assistit d’advocat i el Ministeri Fiscal. Aquesta audiència s’ha de celebrar en un termini màxim de setanta-dues hores. Les mesures penals poden ser l’allunyament, la prohibició de comunicació, la prohibició de residència o la presó provisional. Les mesures civils —atribució de l’ús de l’habitatge, custòdia, règim de visites, aliments— tenen una vigència temporal limitada i s’han de ratificar en el procés civil corresponent.',
        'Recibida la solicitud, el juez de guardia convoca una audiencia urgente con la víctima, el solicitante, el presunto agresor asistido de abogado y el Ministerio Fiscal. Esta audiencia debe celebrarse en un plazo máximo de setenta y dos horas. Las medidas penales pueden ser el alejamiento, la prohibición de comunicación, la prohibición de residencia o la prisión provisional. Las medidas civiles —atribución del uso de la vivienda, custodia, régimen de visitas, alimentos— tienen una vigencia temporal limitada y deben ratificarse en el proceso civil correspondiente.',
      ),
      example(
        'Si una víctima arriba a la comissaria de Roses demanant protecció, l’agent no ha de derivar-la al jutjat: ha de recollir la sol·licitud, instruir les diligències i remetre-la immediatament al jutjat de guàrdia. Fer-la anar pel seu compte és un incompliment.',
        'Si una víctima llega a la comisaría de Roses pidiendo protección, el agente no debe derivarla al juzgado: debe recoger la solicitud, instruir las diligencias y remitirla inmediatamente al juzgado de guardia. Hacerla ir por su cuenta es un incumplimiento.',
      ),
      pitfall(
        'L’ordre de protecció l’acorda **sempre un jutge**. La policia no la dicta: la recull, la tramita i, un cop dictada, la fa complir i la inscriu al registre corresponent.',
        'La orden de protección la acuerda **siempre un juez**. La policía no la dicta: la recoge, la tramita y, una vez dictada, la hace cumplir y la inscribe en el registro correspondiente.',
      ),
      checkpoint(
        'En quin termini màxim s’ha de celebrar l’audiència urgent?',
        '¿En qué plazo máximo debe celebrarse la audiencia urgente?',
        'En setanta-dues hores des de la recepció de la sol·licitud.',
        'En setenta y dos horas desde la recepción de la solicitud.',
      ),
    ],
    [
      ref('llei-27-2003-ordre-proteccio', 'article únic i procediment'),
      ref('lecrim-1882', 'art. 544 ter (ordre de protecció)'),
    ],
  ),

  lesson(
    39,
    'Igualtat efectiva entre dones i homes',
    'Igualdad efectiva entre mujeres y hombres',
    5,
    [
      idea(
        'La llei d’igualtat no es limita a prohibir la discriminació: obliga les administracions a actuar activament per corregir desigualtats. Per això parla de transversalitat i d’accions positives.',
        'La ley de igualdad no se limita a prohibir la discriminación: obliga a las administraciones a actuar activamente para corregir desigualdades. Por eso habla de transversalidad y de acciones positivas.',
      ),
      compare(
        'Tipus de discriminació',
        'Tipos de discriminación',
        'Directa',
        'Directa',
        'Indirecta',
        'Indirecta',
        [
          ['Definició', 'Definición', 'Una persona és tractada de manera menys favorable que una altra en situació comparable per raó de sexe', 'Una persona es tratada de manera menos favorable que otra en situación comparable por razón de sexo', 'Una disposició, criteri o pràctica aparentment neutres posen persones d’un sexe en desavantatge particular', 'Una disposición, criterio o práctica aparentemente neutros ponen a personas de un sexo en desventaja particular'],
          ['Exemple', 'Ejemplo', 'Excloure candidates d’un procés per estar embarassades', 'Excluir candidatas de un proceso por estar embarazadas', 'Exigir una alçada mínima sense justificació funcional acreditada', 'Exigir una altura mínima sin justificación funcional acreditada'],
          ['Justificació possible', 'Justificación posible', 'Pràcticament cap', 'Prácticamente ninguna', 'Sí, si respon a una finalitat legítima i els mitjans són adequats i necessaris', 'Sí, si responde a una finalidad legítima y los medios son adecuados y necesarios'],
        ],
      ),
      explain(
        'Assetjament',
        'Acoso',
        'L’assetjament sexual és qualsevol comportament, verbal o físic, de naturalesa sexual que tingui el propòsit o produeixi l’efecte d’atemptar contra la dignitat d’una persona, especialment quan crea un entorn intimidatori, degradant o ofensiu. L’assetjament per raó de sexe és el comportament realitzat en funció del sexe d’una persona amb el mateix propòsit o efecte. Tots dos es consideren sempre discriminatoris i el condicionament d’un dret a acceptar-los és també discriminació.',
        'El acoso sexual es cualquier comportamiento, verbal o físico, de naturaleza sexual que tenga el propósito o produzca el efecto de atentar contra la dignidad de una persona, en particular cuando crea un entorno intimidatorio, degradante u ofensivo. El acoso por razón de sexo es el comportamiento realizado en función del sexo de una persona con el mismo propósito o efecto. Ambos se consideran siempre discriminatorios y el condicionamiento de un derecho a aceptarlos es también discriminación.',
      ),
      explain(
        'Instruments d’actuació',
        'Instrumentos de actuación',
        'Transversalitat: integrar la perspectiva de gènere en totes les polítiques. Accions positives: mesures específiques i temporals per corregir situacions de desigualtat de fet. Presència equilibrada en òrgans i tribunals de selecció. Plans d’igualtat a les empreses i a les administracions. I la indemnitat davant represàlies: ningú pot patir un tracte advers per haver denunciat o participat en un procediment sobre discriminació.',
        'Transversalidad: integrar la perspectiva de género en todas las políticas. Acciones positivas: medidas específicas y temporales para corregir situaciones de desigualdad de hecho. Presencia equilibrada en órganos y tribunales de selección. Planes de igualdad en las empresas y en las administraciones. Y la indemnidad frente a represalias: nadie puede sufrir un trato adverso por haber denunciado o participado en un procedimiento sobre discriminación.',
      ),
      pitfall(
        'Les accions positives no són discriminació inversa prohibida: la llei les admet expressament quan són raonables, proporcionades i temporals, mentre subsisteixi la situació de desigualtat que pretenen corregir.',
        'Las acciones positivas no son discriminación inversa prohibida: la ley las admite expresamente cuando son razonables, proporcionadas y temporales, mientras subsista la situación de desigualdad que pretenden corregir.',
      ),
      checkpoint(
        'Quina diferència hi ha entre discriminació directa i indirecta?',
        '¿Qué diferencia hay entre discriminación directa e indirecta?',
        'La directa tracta pitjor per raó de sexe; la indirecta aplica un criteri aparentment neutre que perjudica de fet un sexe.',
        'La directa trata peor por razón de sexo; la indirecta aplica un criterio aparentemente neutro que perjudica de hecho a un sexo.',
      ),
    ],
    [
      ref('lo-3-2007-igualtat', 'art. 3 a 11 i 51 (igualtat, discriminació, assetjament i accions positives)'),
    ],
  ),

  lesson(
    40,
    'Responsabilitat penal i detenció de menors',
    'Responsabilidad penal y detención de menores',
    6,
    [
      idea(
        'Dos números manen en aquest tema: **catorze** i **divuit**. Per sota dels catorze anys no hi ha responsabilitat penal. Entre catorze i divuit s’aplica la llei del menor, que és formalment penal però materialment educativa.',
        'Dos números mandan en este tema: **catorce** y **dieciocho**. Por debajo de los catorce años no hay responsabilidad penal. Entre catorce y dieciocho se aplica la ley del menor, que es formalmente penal pero materialmente educativa.',
      ),
      explain(
        'Àmbit d’aplicació',
        'Ámbito de aplicación',
        'La llei s’aplica a les persones majors de catorze anys i menors de divuit per la comissió de fets tipificats com a delictes. Als menors de catorze anys no se’ls exigeix responsabilitat penal: se’ls aplica la normativa de protecció de menors i s’ha de donar trasllat del cas a l’entitat pública de protecció.',
        'La ley se aplica a las personas mayores de catorce años y menores de dieciocho por la comisión de hechos tipificados como delitos. A los menores de catorce años no se les exige responsabilidad penal: se les aplica la normativa de protección de menores y debe darse traslado del caso a la entidad pública de protección.',
      ),
      explain(
        'Mesures aplicables',
        'Medidas aplicables',
        'Internament en règim tancat, semiobert, obert o terapèutic; tractament ambulatori; assistència a un centre de dia; permanència de cap de setmana; llibertat vigilada; prohibició d’aproximar-se o comunicar-se amb la víctima; convivència amb una altra persona, família o grup educatiu; prestacions en benefici de la comunitat; realització de tasques socioeducatives; amonestació; privació del permís de conduir o del dret a obtenir-lo; i inhabilitació absoluta. El criteri per triar-les és sempre l’interès superior del menor.',
        'Internamiento en régimen cerrado, semiabierto, abierto o terapéutico; tratamiento ambulatorio; asistencia a un centro de día; permanencia de fin de semana; libertad vigilada; prohibición de aproximarse o comunicarse con la víctima; convivencia con otra persona, familia o grupo educativo; prestaciones en beneficio de la comunidad; realización de tareas socioeducativas; amonestación; privación del permiso de conducir o del derecho a obtenerlo; e inhabilitación absoluta. El criterio para elegirlas es siempre el interés superior del menor.',
      ),
      explain(
        'La detenció d’un menor',
        'La detención de un menor',
        'S’ha de practicar de la forma que menys perjudiqui el menor i s’ha d’informar immediatament, en llenguatge comprensible, dels fets i dels drets que l’assisteixen. Cal notificar-ho de manera immediata als seus representants legals i al Ministeri Fiscal. El menor detingut ha de romandre custodiat en dependències adequades i separades de les que s’utilitzen per als majors d’edat. La declaració es fa sempre en presència de lletrat i dels representants legals o, si no és possible, del Ministeri Fiscal. El termini màxim és de vint-i-quatre hores per posar-lo en llibertat o a disposició del Ministeri Fiscal.',
        'Debe practicarse de la forma que menos perjudique al menor y debe informarse inmediatamente, en lenguaje comprensible, de los hechos y de los derechos que le asisten. Debe notificarse de manera inmediata a sus representantes legales y al Ministerio Fiscal. El menor detenido debe permanecer custodiado en dependencias adecuadas y separadas de las que se utilizan para los mayores de edad. La declaración se hace siempre en presencia de letrado y de los representantes legales o, si no es posible, del Ministerio Fiscal. El plazo máximo es de veinticuatro horas para ponerlo en libertad o a disposición del Ministerio Fiscal.',
      ),
      pitfall(
        'El termini per al menor detingut és de **vint-i-quatre hores**, no de setanta-dues. I la posada a disposició no és davant el jutge, sinó davant el **Ministeri Fiscal**, que és qui dirigeix la investigació en el procés de menors.',
        'El plazo para el menor detenido es de **veinticuatro horas**, no de setenta y dos. Y la puesta a disposición no es ante el juez, sino ante el **Ministerio Fiscal**, que es quien dirige la investigación en el proceso de menores.',
      ),
      checkpoint(
        'Quin és el termini màxim de detenció d’un menor i davant qui se’l posa a disposició?',
        '¿Cuál es el plazo máximo de detención de un menor y ante quién se le pone a disposición?',
        'Vint-i-quatre hores, i es posa a disposició del Ministeri Fiscal.',
        'Veinticuatro horas, y se pone a disposición del Ministerio Fiscal.',
      ),
    ],
    [
      ref('lo-5-2000-menors', 'art. 1, 3, 7 i 17'),
    ],
  ),
]
