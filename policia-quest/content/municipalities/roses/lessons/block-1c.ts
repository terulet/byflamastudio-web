/** Microlliçons dels temes 11 a 15 (bloc Institucions i Administració). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, refv } from '../authoring.ts'

export const LESSONS_11_15: Lesson[] = [
  lesson(
    11,
    'Règim disciplinari de la policia local',
    'Régimen disciplinario de la policía local',
    5,
    [
      idea(
        'La policia local de Catalunya té règim disciplinari propi: el marca la Llei 16/1991 i el procediment el desenvolupa el Decret 179/2015. No s’aplica directament el règim general de l’EBEP, tot i que hi actua com a supletori.',
        'La policía local de Cataluña tiene régimen disciplinario propio: lo marca la Ley 16/1991 y el procedimiento lo desarrolla el Decreto 179/2015. No se aplica directamente el régimen general del EBEP, aunque actúa como supletorio.',
      ),
      explain(
        'Els tres graus de falta',
        'Los tres grados de falta',
        'Les faltes es classifiquen en molt greus, greus i lleus. Entre les molt greus hi ha típicament l’incompliment del deure de fidelitat a la Constitució i a l’Estatut, l’abús d’atribucions amb perjudici greu, la insubordinació greu, l’abandó del servei, la falta de col·laboració manifesta amb altres cossos i l’embriaguesa o el consum de drogues durant el servei quan repercuteixi en l’actuació. Entre les greus, l’incompliment de l’obligació de donar compte a la superioritat, la desobediència, l’exhibició d’armes sense causa o la falta de rendiment reiterada. Les lleus són les incorreccions menors amb la ciutadania o els companys, el descuit en la conservació dels mitjans i l’incompliment de la jornada sense causa justificada.',
        'Las faltas se clasifican en muy graves, graves y leves. Entre las muy graves está típicamente el incumplimiento del deber de fidelidad a la Constitución y al Estatuto, el abuso de atribuciones con perjuicio grave, la insubordinación grave, el abandono del servicio, la falta de colaboración manifiesta con otros cuerpos y la embriaguez o el consumo de drogas durante el servicio cuando repercuta en la actuación. Entre las graves, el incumplimiento de la obligación de dar cuenta a la superioridad, la desobediencia, la exhibición de armas sin causa o la falta de rendimiento reiterada. Las leves son las incorrecciones menores con la ciudadanía o los compañeros, el descuido en la conservación de los medios y el incumplimiento de la jornada sin causa justificada.',
      ),
      explain(
        'Sancions',
        'Sanciones',
        'Per a les faltes molt greus: separació del servei i suspensió de funcions de major durada. Per a les greus: suspensió de funcions de durada menor i destitució del càrrec de comandament. Per a les lleus: suspensió de funcions de molt curta durada, deducció proporcional de retribucions i amonestació. La sanció s’ha de graduar segons la intencionalitat, el perjudici causat, la reincidència i la pertorbació del servei.',
        'Para las faltas muy graves: separación del servicio y suspensión de funciones de mayor duración. Para las graves: suspensión de funciones de duración menor y destitución del cargo de mando. Para las leves: suspensión de funciones de muy corta duración, deducción proporcional de retribuciones y amonestación. La sanción debe graduarse según la intencionalidad, el perjuicio causado, la reincidencia y la perturbación del servicio.',
      ),
      explain(
        'El procediment',
        'El procedimiento',
        'El Decret 179/2015 regula el procediment disciplinari: acord d’incoació, nomenament d’instructor i secretari, possibilitat d’adoptar mesures cautelars com la suspensió provisional de funcions, plec de càrrecs, període de prova, proposta de resolució i resolució per l’òrgan competent. Les faltes lleus poden tramitar-se per un procediment abreujat, però sempre amb audiència de la persona interessada.',
        'El Decreto 179/2015 regula el procedimiento disciplinario: acuerdo de incoación, nombramiento de instructor y secretario, posibilidad de adoptar medidas cautelares como la suspensión provisional de funciones, pliego de cargos, período de prueba, propuesta de resolución y resolución por el órgano competente. Las faltas leves pueden tramitarse por un procedimiento abreviado, pero siempre con audiencia de la persona interesada.',
      ),
      pitfall(
        'La suspensió provisional de funcions és una mesura cautelar, no una sanció. Es pot acordar durant la instrucció i no prejutja el resultat de l’expedient; si l’expedient acaba sense sanció, la persona ha de ser reposada en els seus drets.',
        'La suspensión provisional de funciones es una medida cautelar, no una sanción. Puede acordarse durante la instrucción y no prejuzga el resultado del expediente; si el expediente acaba sin sanción, la persona debe ser repuesta en sus derechos.',
      ),
      checkpoint(
        'Quina norma regula el procediment disciplinari de les policies locals de Catalunya?',
        '¿Qué norma regula el procedimiento disciplinario de las policías locales de Cataluña?',
        'El Decret 179/2015, de 4 d’agost, que desenvolupa el règim previst a la Llei 16/1991.',
        'El Decreto 179/2015, de 4 de agosto, que desarrolla el régimen previsto en la Ley 16/1991.',
      ),
    ],
    [
      refv('llei-16-1991-policies-locals', 'règim disciplinari: classificació de faltes i sancions', '2026-08-24'),
      refv('decret-179-2015-disciplinari', 'procediment disciplinari i mesures cautelars', '2026-08-24'),
    ],
  ),

  lesson(
    12,
    'El procediment administratiu com a garantia',
    'El procedimiento administrativo como garantía',
    5,
    [
      idea(
        'El procediment no és burocràcia: és la garantia que l’Administració no decideix per impuls. Cada tràmit existeix perquè algú pugui defensar-se abans que la decisió l’afecti.',
        'El procedimiento no es burocracia: es la garantía de que la Administración no decide por impulso. Cada trámite existe para que alguien pueda defenderse antes de que la decisión le afecte.',
      ),
      explain(
        'Què regula la Llei 39/2015',
        'Qué regula la Ley 39/2015',
        'Regula les relacions externes de l’Administració amb les persones: els drets de la ciutadania, la capacitat d’obrar, la representació, els termes i terminis, els requisits dels actes, el procediment comú i els recursos administratius. La seva bessona, la Llei 40/2015, regula el funcionament intern del sector públic: òrgans, competència, abstenció i recusació, convenis i relacions entre administracions.',
        'Regula las relaciones externas de la Administración con las personas: los derechos de la ciudadanía, la capacidad de obrar, la representación, los términos y plazos, los requisitos de los actos, el procedimiento común y los recursos administrativos. Su gemela, la Ley 40/2015, regula el funcionamiento interno del sector público: órganos, competencia, abstención y recusación, convenios y relaciones entre administraciones.',
      ),
      explain(
        'Principis que travessen tot el procediment',
        'Principios que atraviesan todo el procedimiento',
        'Legalitat, contradicció, audiència de la persona interessada, oficialitat o impuls d’ofici, celeritat i eficàcia, transparència, gratuïtat com a regla general, i motivació dels actes que limiten drets. En matèria sancionadora s’hi afegeixen els principis de tipicitat, irretroactivitat, responsabilitat, proporcionalitat i presumpció d’innocència.',
        'Legalidad, contradicción, audiencia de la persona interesada, oficialidad o impulso de oficio, celeridad y eficacia, transparencia, gratuidad como regla general, y motivación de los actos que limitan derechos. En materia sancionadora se añaden los principios de tipicidad, irretroactividad, responsabilidad, proporcionalidad y presunción de inocencia.',
      ),
      example(
        'Quan un agent estén una denúncia per una infracció de l’ordenança de convivència, no imposa la sanció: inicia el procediment. La sanció l’imposa l’òrgan competent després de donar audiència a la persona denunciada.',
        'Cuando un agente extiende una denuncia por una infracción de la ordenanza de convivencia, no impone la sanción: inicia el procedimiento. La sanción la impone el órgano competente después de dar audiencia a la persona denunciada.',
      ),
      pitfall(
        'Denunciar no és sancionar. La denúncia és un acte d’iniciació; la sanció, un acte de resolució. Confondre-ho és el error més típic en preguntes de procediment aplicades a l’actuació policial.',
        'Denunciar no es sancionar. La denuncia es un acto de iniciación; la sanción, un acto de resolución. Confundirlo es el error más típico en preguntas de procedimiento aplicadas a la actuación policial.',
      ),
      checkpoint(
        'Quina llei regula el procediment i quina el règim jurídic del sector públic?',
        '¿Qué ley regula el procedimiento y cuál el régimen jurídico del sector público?',
        'La Llei 39/2015 el procediment administratiu comú; la Llei 40/2015 el règim jurídic del sector públic.',
        'La Ley 39/2015 el procedimiento administrativo común; la Ley 40/2015 el régimen jurídico del sector público.',
      ),
    ],
    [
      refv('llei-39-2015-pac', 'títol preliminar i disposicions generals', '2026-08-24'),
      refv('llei-40-2015-rjsp', 'objecte i àmbit d’aplicació', '2026-08-24'),
    ],
  ),

  lesson(
    13,
    'L’acte administratiu: validesa i invalidesa',
    'El acto administrativo: validez e invalidez',
    6,
    [
      idea(
        'Un acte administratiu és una declaració d’una administració subjecta al dret administratiu que produeix efectes jurídics. Es presumeix vàlid i és immediatament executiu des que es dicta.',
        'Un acto administrativo es una declaración de una administración sujeta al derecho administrativo que produce efectos jurídicos. Se presume válido y es inmediatamente ejecutivo desde que se dicta.',
      ),
      explain(
        'Requisits',
        'Requisitos',
        'Ha de dictar-lo l’òrgan competent, seguint el procediment establert, amb un contingut determinat, possible, lícit i adequat a la seva finalitat. Ha de constar per escrit —o pel mitjà que en permeti l’acreditació— i ha d’estar motivat en els casos que la llei preveu: actes que limiten drets subjectius, que resolen recursos, que se separen del criteri seguit en actuacions precedents, els sancionadors i els discrecionals.',
        'Debe dictarlo el órgano competente, siguiendo el procedimiento establecido, con un contenido determinado, posible, lícito y adecuado a su finalidad. Debe constar por escrito —o por el medio que permita su acreditación— y debe estar motivado en los casos que la ley prevé: actos que limitan derechos subjetivos, que resuelven recursos, que se apartan del criterio seguido en actuaciones precedentes, los sancionadores y los discrecionales.',
      ),
      compare(
        'Nul·litat i anul·labilitat',
        'Nulidad y anulabilidad',
        'Nul de ple dret',
        'Nulo de pleno derecho',
        'Anul·lable',
        'Anulable',
        [
          ['Gravetat', 'Gravedad', 'Vicis taxats i molt greus', 'Vicios tasados y muy graves', 'Qualsevol altra infracció de l’ordenament', 'Cualquier otra infracción del ordenamiento'],
          ['Exemples', 'Ejemplos', 'Lesionar drets susceptibles d’empara; dictar-lo un òrgan manifestament incompetent per raó de matèria o territori; prescindir totalment del procediment; contingut impossible; ser constitutiu d’infracció penal', 'Lesionar derechos susceptibles de amparo; dictarlo un órgano manifiestamente incompetente por razón de materia o territorio; prescindir totalmente del procedimiento; contenido imposible; ser constitutivo de infracción penal', 'Defectes de forma que impedeixen assolir el fi o causen indefensió; actes fora de termini quan el termini és essencial', 'Defectos de forma que impiden alcanzar el fin o causan indefensión; actos fuera de plazo cuando el plazo es esencial'],
          ['Efectes', 'Efectos', 'No produeix efectes des de l’origen; no es pot convalidar', 'No produce efectos desde el origen; no se puede convalidar', 'Produeix efectes fins que s’anul·la; es pot convalidar', 'Produce efectos hasta que se anula; se puede convalidar'],
        ],
      ),
      explain(
        'Notificació',
        'Notificación',
        'S’ha de notificar en el termini de deu dies des que es dicta l’acte. Ha de contenir el text íntegre de la resolució, indicar si posa fi o no a la via administrativa, els recursos que hi caben, l’òrgan davant el qual s’han de presentar i el termini per fer-ho. Una notificació incompleta no és nul·la automàticament: comença a produir efectes des que la persona interessada fa una actuació que en demostri el coneixement o interposa el recurs procedent.',
        'Debe notificarse en el plazo de diez días desde que se dicta el acto. Debe contener el texto íntegro de la resolución, indicar si pone fin o no a la vía administrativa, los recursos que caben, el órgano ante el que deben presentarse y el plazo para hacerlo. Una notificación incompleta no es nula automáticamente: empieza a producir efectos desde que la persona interesada realiza una actuación que demuestre su conocimiento o interpone el recurso procedente.',
      ),
      pitfall(
        'La incompetència que provoca nul·litat de ple dret és la manifesta per raó de la matèria o del territori. La incompetència jeràrquica —un òrgan inferior que dicta el que corresponia al superior— és causa d’anul·labilitat i, a més, és convalidable.',
        'La incompetencia que provoca nulidad de pleno derecho es la manifiesta por razón de la materia o del territorio. La incompetencia jerárquica —un órgano inferior que dicta lo que correspondía al superior— es causa de anulabilidad y, además, es convalidable.',
      ),
      checkpoint(
        'En quin termini s’ha de notificar un acte administratiu?',
        '¿En qué plazo debe notificarse un acto administrativo?',
        'En deu dies des que es dicta.',
        'En diez días desde que se dicta.',
      ),
    ],
    [
      refv('llei-39-2015-pac', 'art. 34 a 52 (requisits, eficàcia i invalidesa dels actes)', '2026-08-24'),
    ],
  ),

  lesson(
    14,
    'Les persones en el procediment',
    'Las personas en el procedimiento',
    5,
    [
      idea(
        'Tenir capacitat d’obrar davant l’Administració és més ampli que tenir-la en dret civil: els menors d’edat poden actuar per l’exercici i la defensa dels drets que l’ordenament els permet sense assistència.',
        'Tener capacidad de obrar ante la Administración es más amplio que tenerla en derecho civil: los menores de edad pueden actuar para el ejercicio y la defensa de los derechos que el ordenamiento les permite sin asistencia.',
      ),
      explain(
        'Qui és persona interessada',
        'Quién es persona interesada',
        'Qui promou el procediment com a titular de drets o interessos legítims individuals o col·lectius; qui, sense haver-lo iniciat, té drets que poden resultar afectats per la decisió; i qui té interessos legítims, individuals o col·lectius, que poden resultar afectats i es personen abans que recaigui la resolució.',
        'Quien promueve el procedimiento como titular de derechos o intereses legítimos individuales o colectivos; quien, sin haberlo iniciado, tiene derechos que pueden resultar afectados por la decisión; y quien tiene intereses legítimos, individuales o colectivos, que pueden resultar afectados y se personan antes de que recaiga la resolución.',
      ),
      explain(
        'Representació',
        'Representación',
        'Es pot actuar per mitjà de representant. Cal acreditar la representació per als actes greus: formular sol·licituds, presentar declaracions responsables o comunicacions, interposar recursos, desistir d’accions i renunciar a drets. Per als actes de tràmit ordinari es presumeix. L’acreditació es pot fer per qualsevol mitjà vàlid en dret que en deixi constància fidedigna, incloent-hi l’apoderament apud acta.',
        'Se puede actuar por medio de representante. Hay que acreditar la representación para los actos graves: formular solicitudes, presentar declaraciones responsables o comunicaciones, interponer recursos, desistir de acciones y renunciar a derechos. Para los actos de trámite ordinario se presume. La acreditación puede hacerse por cualquier medio válido en derecho que deje constancia fidedigna, incluido el apoderamiento apud acta.',
      ),
      explain(
        'Drets de les persones',
        'Derechos de las personas',
        'Entre altres: comunicar-se amb les administracions per mitjans electrònics, ser assistides en l’ús de mitjans electrònics, utilitzar les llengües oficials, conèixer l’estat de tramitació, accedir i obtenir còpia dels documents, no presentar documents ja aportats o elaborats per l’Administració, ser tractades amb respecte i deferència, exigir responsabilitats, i obtenir informació i orientació sobre els requisits jurídics o tècnics dels projectes.',
        'Entre otros: comunicarse con las administraciones por medios electrónicos, ser asistidas en el uso de medios electrónicos, utilizar las lenguas oficiales, conocer el estado de tramitación, acceder y obtener copia de los documentos, no presentar documentos ya aportados o elaborados por la Administración, ser tratadas con respeto y deferencia, exigir responsabilidades, y obtener información y orientación sobre los requisitos jurídicos o técnicos de los proyectos.',
      ),
      pitfall(
        'Denunciant no és sinònim d’interessat. Qui presenta una denúncia no adquireix, només per això, la condició de persona interessada en el procediment sancionador que se’n derivi: cal que sigui titular d’un dret o interès legítim afectat.',
        'Denunciante no es sinónimo de interesado. Quien presenta una denuncia no adquiere, solo por eso, la condición de persona interesada en el procedimiento sancionador que se derive: hace falta que sea titular de un derecho o interés legítimo afectado.',
      ),
      checkpoint(
        'Per a quins actes cal acreditar la representació?',
        '¿Para qué actos hay que acreditar la representación?',
        'Per formular sol·licituds, presentar declaracions responsables o comunicacions, interposar recursos, desistir d’accions i renunciar a drets.',
        'Para formular solicitudes, presentar declaraciones responsables o comunicaciones, interponer recursos, desistir de acciones y renunciar a derechos.',
      ),
    ],
    [
      refv('llei-39-2015-pac', 'art. 3 a 13 (capacitat, interessat, representació i drets)', '2026-08-24'),
    ],
  ),

  lesson(
    15,
    'Terminis, silenci i abstenció',
    'Plazos, silencio y abstención',
    6,
    [
      idea(
        'Tres mecanismes protegeixen la ciutadania davant la inactivitat i la parcialitat: el còmput estricte dels terminis, el silenci administratiu i el deure d’abstenció de qui té interès en l’assumpte.',
        'Tres mecanismos protegen a la ciudadanía frente a la inactividad y la parcialidad: el cómputo estricto de los plazos, el silencio administrativo y el deber de abstención de quien tiene interés en el asunto.',
      ),
      explain(
        'Còmput de terminis',
        'Cómputo de plazos',
        'Quan els terminis s’assenyalen per dies, s’entenen hàbils i s’exclouen els dissabtes, els diumenges i els declarats festius. Si s’expressen en dies naturals, s’ha de fer constar. Els terminis en mesos o anys es computen de data a data; si al mes de venciment no hi ha dia equivalent, el termini expira l’últim dia del mes. Si l’últim dia és inhàbil, s’entén prorrogat al primer dia hàbil següent.',
        'Cuando los plazos se señalan por días, se entienden hábiles y se excluyen los sábados, los domingos y los declarados festivos. Si se expresan en días naturales, debe hacerse constar. Los plazos en meses o años se computan de fecha a fecha; si en el mes de vencimiento no hay día equivalente, el plazo expira el último día del mes. Si el último día es inhábil, se entiende prorrogado al primer día hábil siguiente.',
      ),
      explain(
        'Obligació de resoldre i silenci',
        'Obligación de resolver y silencio',
        'L’Administració està obligada a dictar resolució expressa i a notificar-la en tots els procediments. Si la norma no fixa un termini, el màxim és de tres mesos. En procediments iniciats a sol·licitud de la persona interessada, el silenci és, com a regla general, estimatori, amb les excepcions previstes per llei. En els iniciats d’ofici, si són de reconeixement de drets el silenci és desestimatori; si són sancionadors o de gravamen, es produeix la caducitat.',
        'La Administración está obligada a dictar resolución expresa y a notificarla en todos los procedimientos. Si la norma no fija un plazo, el máximo es de tres meses. En procedimientos iniciados a solicitud de la persona interesada, el silencio es, como regla general, estimatorio, con las excepciones previstas por ley. En los iniciados de oficio, si son de reconocimiento de derechos el silencio es desestimatorio; si son sancionadores o de gravamen, se produce la caducidad.',
      ),
      explain(
        'Abstenció i recusació',
        'Abstención y recusación',
        'Qui té interès personal en l’assumpte, parentiu proper amb les persones interessades, amistat íntima o enemistat manifesta, o ha estat perit o testimoni en el procediment, s’ha d’abstenir d’intervenir-hi i comunicar-ho al superior. Si no ho fa, les persones interessades poden recusar-lo en qualsevol moment. L’actuació de qui havia d’abstenir-se no implica necessàriament la invalidesa de l’acte, però sí que pot generar responsabilitat.',
        'Quien tiene interés personal en el asunto, parentesco cercano con las personas interesadas, amistad íntima o enemistad manifiesta, o ha sido perito o testigo en el procedimiento, debe abstenerse de intervenir y comunicarlo al superior. Si no lo hace, las personas interesadas pueden recusarlo en cualquier momento. La actuación de quien debía abstenerse no implica necesariamente la invalidez del acto, pero sí puede generar responsabilidad.',
      ),
      pitfall(
        'El silenci estimatori NO és una excusa per no resoldre. L’Administració continua obligada a dictar resolució expressa, però si el silenci ha estat positiu ja no pot resoldre en sentit contrari.',
        'El silencio estimatorio NO es una excusa para no resolver. La Administración sigue obligada a dictar resolución expresa, pero si el silencio ha sido positivo ya no puede resolver en sentido contrario.',
      ),
      checkpoint(
        'Quin és el termini màxim per resoldre si la norma no en fixa cap?',
        '¿Cuál es el plazo máximo para resolver si la norma no fija ninguno?',
        'Tres mesos.',
        'Tres meses.',
      ),
    ],
    [
      refv('llei-39-2015-pac', 'art. 21, 24, 25, 29 a 33', '2026-08-24'),
      refv('llei-40-2015-rjsp', 'art. 23 i 24 (abstenció i recusació)', '2026-08-24'),
    ],
  ),
]
