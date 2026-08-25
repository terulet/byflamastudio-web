/** Microlliçons dels temes 26 a 30 (bloc Seguretat, policia i dret penal). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, refv } from '../authoring.ts'

export const LESSONS_26_30: Lesson[] = [
  lesson(
    26,
    'Protecció de la seguretat ciutadana',
    'Protección de la seguridad ciudadana',
    6,
    [
      idea(
        'La Llei orgànica 4/2015 és l’eina administrativa del dia a dia: identificacions, controls, registres, reunions i el règim sancionador. No és dret penal, però delimita fins on pot arribar un agent sense ordre judicial.',
        'La Ley orgánica 4/2015 es la herramienta administrativa del día a día: identificaciones, controles, registros, reuniones y el régimen sancionador. No es derecho penal, pero delimita hasta dónde puede llegar un agente sin orden judicial.',
      ),
      explain(
        'Identificació de persones',
        'Identificación de personas',
        'Els agents poden requerir la identificació quan hi hagi indicis que la persona pot haver participat en una infracció, o quan calgui per prevenir raonablement la comissió d’un delicte. Si no s’aconsegueix identificar-la per cap mitjà, se la pot requerir per acompanyar els agents a dependències properes que disposin dels mitjans adequats, pel temps estrictament necessari i mai més de sis hores. S’ha de portar un llibre-registre d’aquestes diligències.',
        'Los agentes pueden requerir la identificación cuando existan indicios de que la persona puede haber participado en una infracción, o cuando sea necesario para prevenir razonablemente la comisión de un delito. Si no se consigue identificarla por ningún medio, se la puede requerir para acompañar a los agentes a dependencias próximas que dispongan de los medios adecuados, por el tiempo estrictamente necesario y nunca más de seis horas. Debe llevarse un libro-registro de estas diligencias.',
      ),
      explain(
        'Registres corporals',
        'Registros corporales',
        'El registre corporal extern i superficial és possible quan hi hagi indicis racionals per trobar instruments, efectes o altres objectes rellevants. S’ha de fer respectant la dignitat i, sempre que sigui possible, per un agent del mateix sexe. Si obliga a deixar a la vista parts del cos normalment cobertes, s’ha de fer en un lloc reservat i fora de la vista de tercers, i se n’ha d’estendre diligència.',
        'El registro corporal externo y superficial es posible cuando existan indicios racionales para encontrar instrumentos, efectos u otros objetos relevantes. Debe hacerse respetando la dignidad y, siempre que sea posible, por un agente del mismo sexo. Si obliga a dejar a la vista partes del cuerpo normalmente cubiertas, debe hacerse en un lugar reservado y fuera de la vista de terceros, y debe extenderse diligencia.',
      ),
      explain(
        'Reunions i manifestacions',
        'Reuniones y manifestaciones',
        'El dret de reunió pacífica i sense armes no necessita autorització prèvia; en llocs de trànsit públic i en manifestacions cal comunicació prèvia a l’autoritat. L’autoritat pot acordar-ne la dissolució quan siguin il·lícites penalment, quan es produeixin alteracions de l’ordre públic amb perill per a persones o béns, o quan es facin amb ús d’uniformes paramilitars. La dissolució ha d’anar precedida dels avisos corresponents.',
        'El derecho de reunión pacífica y sin armas no necesita autorización previa; en lugares de tránsito público y en manifestaciones se requiere comunicación previa a la autoridad. La autoridad puede acordar su disolución cuando sean ilícitas penalmente, cuando se produzcan alteraciones del orden público con peligro para personas o bienes, o cuando se hagan con uso de uniformes paramilitares. La disolución debe ir precedida de los avisos correspondientes.',
      ),
      compare(
        'Règim sancionador',
        'Régimen sancionador',
        'Classes d’infracció',
        'Clases de infracción',
        'Sanció econòmica',
        'Sanción económica',
        [
          ['Molt greus', 'Muy graves', 'Prescriuen als tres anys', 'Prescriben a los tres años', 'De 30.001 a 600.000 euros', 'De 30.001 a 600.000 euros'],
          ['Greus', 'Graves', 'Prescriuen a l’any', 'Prescriben al año', 'De 601 a 30.000 euros', 'De 601 a 30.000 euros'],
          ['Lleus', 'Leves', 'Prescriuen als sis mesos', 'Prescriben a los seis meses', 'De 100 a 600 euros', 'De 100 a 600 euros'],
        ],
      ),
      pitfall(
        'El trasllat a dependències per identificar NO és una detenció: és una diligència d’identificació amb un límit màxim de sis hores. No genera antecedents ni els drets de l’article 520 de la Llei d’enjudiciament criminal, però sí que s’ha de documentar al llibre-registre.',
        'El traslado a dependencias para identificar NO es una detención: es una diligencia de identificación con un límite máximo de seis horas. No genera antecedentes ni los derechos del artículo 520 de la Ley de enjuiciamiento criminal, pero sí debe documentarse en el libro-registro.',
      ),
      checkpoint(
        'Quin és el temps màxim de permanència en dependències per a una diligència d’identificació?',
        '¿Cuál es el tiempo máximo de permanencia en dependencias para una diligencia de identificación?',
        'El estrictament necessari i, en tot cas, un màxim de sis hores.',
        'El estrictamente necesario y, en todo caso, un máximo de seis horas.',
      ),
    ],
    [
      refv('lo-4-2015-psc', 'art. 4, 15 a 20, 23 i 35 a 39', '2026-08-24'),
      refv('ce-1978', 'art. 21 (dret de reunió)', '2026-08-24'),
    ],
  ),

  lesson(
    27,
    'Furts i robatoris',
    'Hurtos y robos',
    6,
    [
      idea(
        'La diferència entre furt i robatori no és el valor del que s’emporten: és **com** s’ho emporten. Si hi ha força en les coses o violència o intimidació en les persones, és robatori. Si no n’hi ha, és furt.',
        'La diferencia entre hurto y robo no es el valor de lo que se llevan: es **cómo** se lo llevan. Si hay fuerza en las cosas o violencia o intimidación en las personas, es robo. Si no la hay, es hurto.',
      ),
      explain(
        'El furt',
        'El hurto',
        'Comet furt qui, amb ànim de lucre, pren coses mobles alienes sense la voluntat del seu propietari. Si el valor del que s’ha sostret excedeix els 400 euros, és delicte; si no els excedeix, és delicte lleu. Hi ha supòsits agreujats: valor artístic, històric, cultural o científic, coses de primera necessitat, conduccions o cablejat, victimització especial, ús de menors, o multireincidència.',
        'Comete hurto quien, con ánimo de lucro, toma cosas muebles ajenas sin la voluntad de su propietario. Si el valor de lo sustraído excede los 400 euros, es delito; si no los excede, es delito leve. Hay supuestos agravados: valor artístico, histórico, cultural o científico, cosas de primera necesidad, conducciones o cableado, victimización especial, uso de menores, o multirreincidencia.',
      ),
      explain(
        'Força en les coses',
        'Fuerza en las cosas',
        'El Codi penal enumera de manera tancada què és força en les coses: escalament; trencament de paret, sostre o terra, o fractura de porta o finestra; fractura d’armaris, arques o altres mobles o objectes tancats o segellats, o forçament de panys o descobriment de claus per sostreure’n el contingut, dins o fora del lloc del robatori; ús de claus falses; i inutilització de sistemes específics d’alarma o guarda.',
        'El Código penal enumera de manera cerrada qué es fuerza en las cosas: escalamiento; rompimiento de pared, techo o suelo, o fractura de puerta o ventana; fractura de armarios, arcas u otra clase de muebles u objetos cerrados o sellados, o forzamiento de cerraduras o descubrimiento de claves para sustraer su contenido, dentro o fuera del lugar del robo; uso de llaves falsas; e inutilización de sistemas específicos de alarma o guarda.',
      ),
      explain(
        'Claus falses',
        'Llaves falsas',
        'Es consideren claus falses els ganxets i altres instruments anàlegs; les claus legítimes perdudes pel propietari o obtingudes per un mitjà que constitueixi infracció penal; i qualsevol altra que no sigui la destinada pel propietari per obrir el pany violentat. Les targetes magnètiques o perforades i els comandaments o instruments d’obertura a distància es consideren claus a aquests efectes.',
        'Se consideran llaves falsas las ganzúas y otros instrumentos análogos; las llaves legítimas perdidas por el propietario u obtenidas por un medio que constituya infracción penal; y cualquier otra que no sea la destinada por el propietario para abrir la cerradura violentada. Las tarjetas magnéticas o perforadas y los mandos o instrumentos de apertura a distancia se consideran llaves a estos efectos.',
      ),
      example(
        'Un turista deixa la bicicleta lligada al passeig. Si en tallen el cadenat, hi ha força en les coses i és robatori. Si se l’enduen perquè estava sense lligar, no hi ha força: és furt, i el valor decidirà si és delicte o delicte lleu.',
        'Un turista deja la bicicleta atada en el paseo. Si cortan el candado, hay fuerza en las cosas y es robo. Si se la llevan porque estaba sin atar, no hay fuerza: es hurto, y el valor decidirá si es delito o delito leve.',
      ),
      pitfall(
        'La força que converteix un furt en robatori ha de ser força **per accedir** a la cosa. La força emprada només per emportar-se l’objecte —arrencar-lo perquè pesa— no converteix el fet en robatori amb força.',
        'La fuerza que convierte un hurto en robo debe ser fuerza **para acceder** a la cosa. La fuerza empleada solo para llevarse el objeto —arrancarlo porque pesa— no convierte el hecho en robo con fuerza.',
      ),
      checkpoint(
        'Quin és el llindar que separa el furt delicte del furt delicte lleu?',
        '¿Cuál es el umbral que separa el hurto delito del hurto delito leve?',
        'Els 400 euros: per damunt és delicte, fins a aquesta quantia és delicte lleu.',
        'Los 400 euros: por encima es delito, hasta esa cuantía es delito leve.',
      ),
    ],
    [
      refv('lo-10-1995-cp', 'art. 234 a 242', '2026-08-24'),
    ],
  ),

  lesson(
    28,
    'La jurisdicció penal',
    'La jurisdicción penal',
    5,
    [
      idea(
        'Saber qui jutja què evita errors bàsics a l’atestat i a la declaració. La regla és senzilla: la gravetat de la pena decideix l’òrgan competent.',
        'Saber quién juzga qué evita errores básicos en el atestado y en la declaración. La regla es sencilla: la gravedad de la pena decide el órgano competente.',
      ),
      explain(
        'Els òrgans',
        'Los órganos',
        'Els jutjats d’instrucció investiguen els delictes i enjudicien els delictes lleus. Els jutjats penals jutgen els delictes amb pena privativa de llibertat de fins a cinc anys. Les audiències provincials jutgen els delictes més greus i resolen els recursos contra les resolucions dels jutjats. Hi ha jutjats especialitzats: de violència sobre la dona, de menors i de vigilància penitenciària. Per damunt, el Tribunal Superior de Justícia de Catalunya, l’Audiència Nacional i el Tribunal Suprem, amb la Sala Segona com a òrgan penal superior.',
        'Los juzgados de instrucción investigan los delitos y enjuician los delitos leves. Los juzgados de lo penal juzgan los delitos con pena privativa de libertad de hasta cinco años. Las audiencias provinciales juzgan los delitos más graves y resuelven los recursos contra las resoluciones de los juzgados. Hay juzgados especializados: de violencia sobre la mujer, de menores y de vigilancia penitenciaria. Por encima, el Tribunal Superior de Justicia de Cataluña, la Audiencia Nacional y el Tribunal Supremo, con la Sala Segunda como órgano penal superior.',
      ),
      explain(
        'Les parts',
        'Las partes',
        'Acusadores: el Ministeri Fiscal, que exerceix l’acció penal en defensa de la legalitat; l’acusació particular, que és la persona ofesa pel delicte; l’acusació popular, oberta a qualsevol ciutadà en els delictes públics; i l’acusació privada, en els delictes que només es persegueixen a instància de part. Acusada: la persona investigada, encausada o acusada segons la fase, sempre assistida de lletrat. També hi pot haver responsable civil, directe o subsidiari.',
        'Acusadores: el Ministerio Fiscal, que ejerce la acción penal en defensa de la legalidad; la acusación particular, que es la persona ofendida por el delito; la acusación popular, abierta a cualquier ciudadano en los delitos públicos; y la acusación privada, en los delitos que solo se persiguen a instancia de parte. Acusada: la persona investigada, encausada o acusada según la fase, siempre asistida de letrado. También puede haber responsable civil, directo o subsidiario.',
      ),
      explain(
        'El paper de la policia',
        'El papel de la policía',
        'La policia judicial actua sota la dependència funcional dels jutges, tribunals i del Ministeri Fiscal en les seves funcions d’esbrinament del delicte i descobriment i assegurament del delinqüent. L’atestat policial té, en principi, valor de denúncia; adquireix valor probatori quan el seu contingut es reprodueix i es sotmet a contradicció en el judici oral, amb l’excepció de les diligències objectives irrepetibles.',
        'La policía judicial actúa bajo la dependencia funcional de los jueces, tribunales y del Ministerio Fiscal en sus funciones de averiguación del delito y descubrimiento y aseguramiento del delincuente. El atestado policial tiene, en principio, valor de denuncia; adquiere valor probatorio cuando su contenido se reproduce y se somete a contradicción en el juicio oral, con la excepción de las diligencias objetivas irrepetibles.',
      ),
      pitfall(
        'L’atestat no és prova per si mateix. Per això importa tant que reculli bé les diligències irrepetibles —inspecció ocular, croquis, fotografies, actes d’intervenció— i que els agents puguin ratificar-lo al judici.',
        'El atestado no es prueba por sí mismo. Por eso importa tanto que recoja bien las diligencias irrepetibles —inspección ocular, croquis, fotografías, actas de intervención— y que los agentes puedan ratificarlo en el juicio.',
      ),
      checkpoint(
        'Qui enjudicia els delictes lleus?',
        '¿Quién enjuicia los delitos leves?',
        'Els jutjats d’instrucció.',
        'Los juzgados de instrucción.',
      ),
    ],
    [
      refv('lecrim-1882', 'competència dels òrgans penals, parts i valor de l’atestat', '2026-08-24'),
      refv('ce-1978', 'art. 117 a 127', '2026-08-24'),
    ],
  ),

  lesson(
    29,
    'Codi penal: garanties i seguretat viària',
    'Código penal: garantías y seguridad vial',
    6,
    [
      idea(
        'El principi de legalitat penal és absolut: no hi ha delicte ni pena sense una llei anterior que ho prevegi. I les lleis penals no són retroactives, llevat que afavoreixin la persona reu.',
        'El principio de legalidad penal es absoluto: no hay delito ni pena sin una ley anterior que lo prevea. Y las leyes penales no son retroactivas, salvo que favorezcan a la persona reo.',
      ),
      explain(
        'Garanties i aplicació de la llei penal',
        'Garantías y aplicación de la ley penal',
        'Garantia criminal (cap delicte sense llei), penal (cap pena sense llei), jurisdiccional (cap pena sense judici) i d’execució (cap pena executada fora de la forma prevista). Es prohibeix l’analogia in malam partem. Les lleis penals favorables tenen efecte retroactiu, fins i tot si hi ha sentència ferma.',
        'Garantía criminal (ningún delito sin ley), penal (ninguna pena sin ley), jurisdiccional (ninguna pena sin juicio) y de ejecución (ninguna pena ejecutada fuera de la forma prevista). Se prohíbe la analogía in malam partem. Las leyes penales favorables tienen efecto retroactivo, incluso si hay sentencia firme.',
      ),
      explain(
        'Excés de velocitat penal',
        'Exceso de velocidad penal',
        'Constitueix delicte conduir un vehicle de motor o un ciclomotor a una velocitat superior en seixanta quilòmetres per hora a la permitida reglamentàriament en via urbana, o en vuitanta quilòmetres per hora en via interurbana.',
        'Constituye delito conducir un vehículo de motor o un ciclomotor a una velocidad superior en sesenta kilómetros por hora a la permitida reglamentariamente en vía urbana, o en ochenta kilómetros por hora en vía interurbana.',
      ),
      explain(
        'Altres delictes contra la seguretat viària',
        'Otros delitos contra la seguridad vial',
        'Conducció sota la influència de drogues o alcohol, amb el llindar objectiu de taxa. Conducció temerària. Conducció amb manifest menyspreu per la vida dels altres. Negativa a sotmetre’s a les proves de detecció. Conducció sense permís: per pèrdua total de punts, per decisió judicial de privació, o sense haver-lo obtingut mai. I la creació d’un risc greu per a la circulació col·locant obstacles, vessant substàncies lliscants o inflamables o no restablint la seguretat de la via quan s’hi està obligat.',
        'Conducción bajo la influencia de drogas o alcohol, con el umbral objetivo de tasa. Conducción temeraria. Conducción con manifiesto desprecio por la vida de los demás. Negativa a someterse a las pruebas de detección. Conducción sin permiso: por pérdida total de puntos, por decisión judicial de privación, o sin haberlo obtenido nunca. Y la creación de un riesgo grave para la circulación colocando obstáculos, derramando sustancias deslizantes o inflamables o no restableciendo la seguridad de la vía cuando se está obligado.',
      ),
      pitfall(
        'La negativa a sotmetre’s a les proves és un delicte **autònom**, castigat encara que la persona no anés beguda. No és una infracció administrativa agreujada: és un delicte de desobediència específic.',
        'La negativa a someterse a las pruebas es un delito **autónomo**, castigado aunque la persona no fuera bebida. No es una infracción administrativa agravada: es un delito de desobediencia específico.',
      ),
      checkpoint(
        'A partir de quin excés de velocitat hi ha delicte en via urbana?',
        '¿A partir de qué exceso de velocidad hay delito en vía urbana?',
        'Quan se supera en 60 km/h la velocitat permesa reglamentàriament.',
        'Cuando se supera en 60 km/h la velocidad permitida reglamentariamente.',
      ),
    ],
    [
      refv('lo-10-1995-cp', 'art. 1 a 9 i art. 379 a 385 ter', '2026-08-24'),
    ],
  ),

  lesson(
    30,
    'La reforma penal de 2015',
    'La reforma penal de 2015',
    5,
    [
      idea(
        'La Llei orgànica 1/2015 va ser la reforma més profunda del Codi penal des de 1995. El canvi que més afecta la feina diària: van desaparèixer les faltes.',
        'La Ley orgánica 1/2015 fue la reforma más profunda del Código penal desde 1995. El cambio que más afecta al trabajo diario: desaparecieron las faltas.',
      ),
      explain(
        'De faltes a delictes lleus',
        'De faltas a delitos leves',
        'Es va suprimir el llibre III del Codi penal, que contenia les faltes. Algunes conductes es van despenalitzar i van passar a l’àmbit administratiu —moltes d’elles a la Llei orgànica 4/2015— i altres es van reconvertir en delictes lleus, integrats al llibre II. Això va canviar el procediment: ja no hi ha judici de faltes, sinó judici per delicte lleu.',
        'Se suprimió el libro III del Código penal, que contenía las faltas. Algunas conductas se despenalizaron y pasaron al ámbito administrativo —muchas de ellas a la Ley orgánica 4/2015— y otras se reconvirtieron en delitos leves, integrados en el libro II. Esto cambió el procedimiento: ya no hay juicio de faltas, sino juicio por delito leve.',
      ),
      explain(
        'Altres novetats',
        'Otras novedades',
        'Introducció de la presó permanent revisable per a supòsits d’excepcional gravetat. Nova regulació de la suspensió de l’execució de les penes privatives de llibertat, unificant suspensió i substitució. Ampliació de la mesura de llibertat vigilada. Nou règim del decomís, incloent-hi el decomís ampliat i el decomís sense sentència. Nous tipus penals: assetjament o fustigació persistent, difusió no consentida d’imatges íntimes obtingudes amb consentiment, matrimoni forçat i manipulació genètica de l’àmbit informàtic.',
        'Introducción de la prisión permanente revisable para supuestos de excepcional gravedad. Nueva regulación de la suspensión de la ejecución de las penas privativas de libertad, unificando suspensión y sustitución. Ampliación de la medida de libertad vigilada. Nuevo régimen del decomiso, incluyendo el decomiso ampliado y el decomiso sin sentencia. Nuevos tipos penales: acoso u hostigamiento persistente, difusión no consentida de imágenes íntimas obtenidas con consentimiento, matrimonio forzado y manipulación del ámbito informático.',
      ),
      explain(
        'Impacte en el furt',
        'Impacto en el hurto',
        'La reforma va introduir la multireincidència com a agreujant del furt: la comissió reiterada de furts lleus pot passar a tractar-se com a delicte, amb independència que cada fet aïllat no superi els 400 euros. Aquesta és la resposta que el legislador va donar a la desaparició de la falta de furt.',
        'La reforma introdujo la multirreincidencia como agravante del hurto: la comisión reiterada de hurtos leves puede pasar a tratarse como delito, con independencia de que cada hecho aislado no supere los 400 euros. Esta es la respuesta que el legislador dio a la desaparición de la falta de hurto.',
      ),
      pitfall(
        'Despenalitzar no vol dir tolerar. Moltes conductes que abans eren faltes ara són infraccions administratives sancionables per la Llei orgànica 4/2015 o per l’ordenança municipal. L’agent no deixa d’actuar: canvia la via.',
        'Despenalizar no significa tolerar. Muchas conductas que antes eran faltas ahora son infracciones administrativas sancionables por la Ley orgánica 4/2015 o por la ordenanza municipal. El agente no deja de actuar: cambia la vía.',
      ),
      checkpoint(
        'Quin llibre del Codi penal va suprimir la Llei orgànica 1/2015?',
        '¿Qué libro del Código penal suprimió la Ley orgánica 1/2015?',
        'El llibre III, que contenia les faltes.',
        'El libro III, que contenía las faltas.',
      ),
    ],
    [
      refv('lo-1-2015-reforma-cp', 'preàmbul i modificacions principals', '2026-08-24'),
      refv('lo-10-1995-cp', 'text consolidat després de la reforma de 2015', '2026-08-24'),
    ],
  ),
]
