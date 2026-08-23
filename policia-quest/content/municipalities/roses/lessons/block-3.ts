/** Microlliçons dels temes 31 a 36 (bloc Roses, trànsit i convivència). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, ref } from '../authoring.ts'

export const LESSONS_31_36: Lesson[] = [
  lesson(
    31,
    'Roses: territori, història i equipaments',
    'Roses: territorio, historia y equipamientos',
    6,
    [
      idea(
        'Aquest tema no s’estudia amb un manual: s’estudia amb el mapa del municipi a la mà. Roses és un municipi de l’Alt Empordà, a la província de Girona, situat a l’extrem nord del golf de Roses, a la Costa Brava.',
        'Este tema no se estudia con un manual: se estudia con el mapa del municipio en la mano. Roses es un municipio del Alt Empordà, en la provincia de Girona, situado en el extremo norte del golfo de Roses, en la Costa Brava.',
      ),
      explain(
        'Situació i entorn natural',
        'Situación y entorno natural',
        'Roses queda encaixada entre dos parcs naturals: el de Cap de Creus, al nord i a l’est, i el dels Aiguamolls de l’Empordà, al sud. Aquesta posició explica bona part de la feina policial: costa esquerpa amb cales de difícil accés, zona humida protegida i una franja urbana molt densa a la badia.',
        'Roses queda encajada entre dos parques naturales: el de Cap de Creus, al norte y al este, y el de los Aiguamolls de l’Empordà, al sur. Esta posición explica buena parte del trabajo policial: costa abrupta con calas de difícil acceso, zona húmeda protegida y una franja urbana muy densa en la bahía.',
      ),
      explain(
        'Patrimoni històric',
        'Patrimonio histórico',
        'La Ciutadella de Roses és el conjunt monumental de referència: recinte fortificat renaixentista que conserva a l’interior les restes de la colònia grega de Rhode, la vil·la romana, el monestir romànic de Santa Maria i la vila medieval. El Castell de la Trinitat, sobre la badia, va ser manat construir per Carles V el 1543 i pren el nom d’una capella anterior de 1508. Al terme també hi ha el dolmen de la Creu d’en Cobertella, el més gran de Catalunya, i el poblat visigòtic de Puig Rom.',
        'La Ciutadella de Roses es el conjunto monumental de referencia: recinto fortificado renacentista que conserva en su interior los restos de la colonia griega de Rhode, la villa romana, el monasterio románico de Santa María y la villa medieval. El Castell de la Trinitat, sobre la bahía, fue mandado construir por Carlos V en 1543 y toma el nombre de una capilla anterior de 1508. En el término también están el dolmen de la Creu d’en Cobertella, el mayor de Cataluña, y el poblado visigótico de Puig Rom.',
      ),
      explain(
        'Nuclis, urbanitzacions i platges',
        'Núcleos, urbanizaciones y playas',
        'Al nucli urbà i la badia hi ha les platges de la Punta, Nova, del Rastell i el Salatar. Al sud, la urbanització de Santa Margarida, travessada per canals navegables. Cap al nord i l’est, les cales de Canyelles Petites, l’Almadrava, Montjoi —on hi va haver el restaurant elBulli—, Rostella i Murtra, i les urbanitzacions de Mas Fumats, Mas Oliva, Puig Rom i Els Grecs. El port acull flota pesquera i esportiva, amb llotja de peix.',
        'En el casco urbano y la bahía están las playas de la Punta, Nova, del Rastell y el Salatar. Al sur, la urbanización de Santa Margarida, atravesada por canales navegables. Hacia el norte y el este, las calas de Canyelles Petites, l’Almadrava, Montjoi —donde estuvo el restaurante elBulli—, Rostella y Murtra, y las urbanizaciones de Mas Fumats, Mas Oliva, Puig Rom y Els Grecs. El puerto acoge flota pesquera y deportiva, con lonja de pescado.',
      ),
      example(
        'La diferència entre patrullar el febrer i patrullar l’agost a Roses és brutal: la població de fet es multiplica amb la temporada turística. Els dispositius, els accessos a les cales i la gestió de l’estacionament es planifiquen pensant en aquest pic estacional.',
        'La diferencia entre patrullar en febrero y patrullar en agosto en Roses es brutal: la población de hecho se multiplica con la temporada turística. Los dispositivos, los accesos a las calas y la gestión del estacionamiento se planifican pensando en este pico estacional.',
      ),
      pitfall(
        'Aquest és el tema amb més contingut que caduca: xifres de població, noms d’equipaments, carrers de nova urbanització i serveis municipals canvien. Estudia’l sempre contra el web municipal actualitzat, no contra apunts d’altres anys.',
        'Este es el tema con más contenido que caduca: cifras de población, nombres de equipamientos, calles de nueva urbanización y servicios municipales cambian. Estúdialo siempre contra la web municipal actualizada, no contra apuntes de otros años.',
      ),
      checkpoint(
        'Entre quins dos parcs naturals se situa el terme municipal de Roses?',
        '¿Entre qué dos parques naturales se sitúa el término municipal de Roses?',
        'El Parc Natural de Cap de Creus i el Parc Natural dels Aiguamolls de l’Empordà.',
        'El Parque Natural de Cap de Creus y el Parque Natural de los Aiguamolls de l’Empordà.',
      ),
    ],
    [
      ref('roses-web-municipi', 'informació del municipi, barris, serveis i equipaments'),
      ref('roses-ordenances-index', 'delimitació d’àmbits i zones al terme municipal'),
    ],
  ),

  lesson(
    32,
    'Permisos, llicències i retirada de vehicles',
    'Permisos, licencias y retirada de vehículos',
    6,
    [
      idea(
        'Dues coses diferents que sovint es barregen: la **immobilització** deixa el vehicle on és fins que desapareix la causa; la **retirada** se l’emporta al dipòsit. Tenen causes distintes i regulació distinta.',
        'Dos cosas distintas que a menudo se mezclan: la **inmovilización** deja el vehículo donde está hasta que desaparece la causa; la **retirada** se lo lleva al depósito. Tienen causas distintas y regulación distinta.',
      ),
      explain(
        'Classes de permisos',
        'Clases de permisos',
        'AM per a ciclomotors, A1, A2 i A per a motocicletes segons cilindrada i potència, B per a turismes, BE per a conjunts amb remolc, C1 i C per a camions, D1 i D per a autobusos, i les corresponents variants amb E per a remolc. A més hi ha llicències: la de ciclomotor de tres rodes i quadricicles lleugers i la de vehicles especials agrícoles.',
        'AM para ciclomotores, A1, A2 y A para motocicletas según cilindrada y potencia, B para turismos, BE para conjuntos con remolque, C1 y C para camiones, D1 y D para autobuses, y las correspondientes variantes con E para remolque. Además hay licencias: la de ciclomotor de tres ruedas y cuadriciclos ligeros y la de vehículos especiales agrícolas.',
      ),
      compare(
        'Immobilització i retirada',
        'Inmovilización y retirada',
        'Immobilització',
        'Inmovilización',
        'Retirada al dipòsit',
        'Retirada al depósito',
        [
          ['Què passa amb el vehicle', 'Qué pasa con el vehículo', 'Es queda al lloc, sense poder circular', 'Se queda en el lugar, sin poder circular', 'Se l’emporta la grua', 'Se lo lleva la grúa'],
          ['Causes típiques', 'Causas típicas', 'Excés de taxa d’alcohol o presència de drogues, negativa a les proves, mancança d’assegurança obligatòria, excés de càrrega o pes, manca d’autorització administrativa', 'Exceso de tasa de alcohol o presencia de drogas, negativa a las pruebas, carencia de seguro obligatorio, exceso de carga o peso, falta de autorización administrativa', 'Perill, pertorbació greu de la circulació o d’un servei públic, doble filera sense conductor, obstaculitzar sortides, ocupar plaça reservada a persones amb discapacitat o carril reservat', 'Peligro, perturbación grave de la circulación o de un servicio público, doble fila sin conductor, obstaculizar salidas, ocupar plaza reservada a personas con discapacidad o carril reservado'],
          ['Qui assumeix les despeses', 'Quién asume los gastos', 'La persona titular o conductora', 'La persona titular o conductora', 'La persona titular o conductora, un cop acreditada la procedència', 'La persona titular o conductora, una vez acreditada la procedencia'],
        ],
      ),
      explain(
        'Vehicles abandonats',
        'Vehículos abandonados',
        'Es presumeix que un vehicle està abandonat quan roman al dipòsit més de dos mesos, o quan està estacionat a la via pública durant més d’un mes amb desperfectes que facin impossible desplaçar-lo pels seus propis mitjans o li faltin les plaques de matrícula. En aquests casos l’Administració pot ordenar-ne el trasllat a un centre autoritzat de tractament per destruir-lo i donar-lo de baixa.',
        'Se presume que un vehículo está abandonado cuando permanece en el depósito más de dos meses, o cuando está estacionado en la vía pública durante más de un mes con desperfectos que hagan imposible desplazarlo por sus propios medios o le falten las placas de matrícula. En estos casos la Administración puede ordenar su traslado a un centro autorizado de tratamiento para destruirlo y darlo de baja.',
      ),
      pitfall(
        'Un vehicle mal estacionat no es pot retirar «per estar mal aparcat» sense més. Cal que concorri una de les causes taxades: perill, pertorbació greu, obstaculització o ocupació d’espai reservat. Si no, la retirada és improcedent i les despeses no es poden repercutir.',
        'Un vehículo mal estacionado no puede retirarse «por estar mal aparcado» sin más. Debe concurrir una de las causas tasadas: peligro, perturbación grave, obstaculización u ocupación de espacio reservado. Si no, la retirada es improcedente y los gastos no pueden repercutirse.',
      ),
      checkpoint(
        'Quant de temps ha d’estar un vehicle al dipòsit perquè es presumeixi abandonat?',
        '¿Cuánto tiempo debe estar un vehículo en el depósito para presumirse abandonado?',
        'Més de dos mesos.',
        'Más de dos meses.',
      ),
    ],
    [
      ref('rd-818-2009-rgcond', 'classes de permisos i llicències de conducció'),
      ref('rdleg-6-2015-ltsv', 'immobilització, retirada i vehicles abandonats'),
      ref('rd-2822-1998-rgv', 'condicions tècniques i documentació dels vehicles'),
    ],
  ),

  lesson(
    33,
    'Alcohol i drogues al volant',
    'Alcohol y drogas al volante',
    6,
    [
      idea(
        'Hi ha dos llindars que s’han de saber de memòria i no confondre mai: el llindar **administratiu**, que genera denúncia i sanció, i el llindar **penal**, que converteix la conducta en delicte.',
        'Hay dos umbrales que hay que saber de memoria y no confundir nunca: el umbral **administrativo**, que genera denuncia y sanción, y el umbral **penal**, que convierte la conducta en delito.',
      ),
      compare(
        'Taxes d’alcohol',
        'Tasas de alcohol',
        'Aire espirat (mg/l)',
        'Aire espirado (mg/l)',
        'Sang (g/l)',
        'Sangre (g/l)',
        [
          ['Conductors en general', 'Conductores en general', 'Més de 0,25', 'Más de 0,25', 'Més de 0,5', 'Más de 0,5'],
          ['Novells i professionals', 'Noveles y profesionales', 'Més de 0,15', 'Más de 0,15', 'Més de 0,3', 'Más de 0,3'],
          ['Llindar penal', 'Umbral penal', 'Superior a 0,60', 'Superior a 0,60', 'Superior a 1,2', 'Superior a 1,2'],
        ],
      ),
      explain(
        'Qui està obligat a sotmetre’s a les proves',
        'Quién está obligado a someterse a las pruebas',
        'Qualsevol persona que condueixi un vehicle; qualsevol persona implicada directament com a possible responsable en un accident de circulació; qui presenti símptomes evidents, manifesti un comportament que faci presumir que condueix sota la influència de begudes alcohòliques o drogues; i qui hagi comès una infracció de trànsit. També qui es disposi a conduir en el marc dels controls preventius reglamentaris.',
        'Cualquier persona que conduzca un vehículo; cualquier persona implicada directamente como posible responsable en un accidente de circulación; quien presente síntomas evidentes, manifieste un comportamiento que haga presumir que conduce bajo la influencia de bebidas alcohólicas o drogas; y quien haya cometido una infracción de tráfico. También quien se disponga a conducir en el marco de los controles preventivos reglamentarios.',
      ),
      explain(
        'Com es fa la prova',
        'Cómo se hace la prueba',
        'La prova d’alcoholèmia consisteix en dues determinacions successives amb un etilòmetre homologat, separades per un interval mínim de deu minuts. La persona interessada té dret a contrastar el resultat mitjançant anàlisi de sang, amb les despeses al seu càrrec si es confirma la infracció. En el cas de drogues, la prova salival de detecció es complementa amb una mostra que s’envia a laboratori per a la confirmació.',
        'La prueba de alcoholemia consiste en dos determinaciones sucesivas con un etilómetro homologado, separadas por un intervalo mínimo de diez minutos. La persona interesada tiene derecho a contrastar el resultado mediante análisis de sangre, con los gastos a su cargo si se confirma la infracción. En el caso de drogas, la prueba salival de detección se complementa con una muestra que se envía a laboratorio para la confirmación.',
      ),
      pitfall(
        'En matèria de drogues no hi ha «taxa permesa»: la infracció és conduir amb presència de drogues a l’organisme. L’excepció són les substàncies utilitzades sota prescripció facultativa i amb una finalitat terapèutica, sempre que no afectin la capacitat de conduir.',
        'En materia de drogas no hay «tasa permitida»: la infracción es conducir con presencia de drogas en el organismo. La excepción son las sustancias utilizadas bajo prescripción facultativa y con una finalidad terapéutica, siempre que no afecten a la capacidad de conducir.',
      ),
      example(
        'Un conductor dona 0,68 mg/l a la primera prova i 0,66 a la segona. No és una denúncia administrativa: se supera el llindar penal de 0,60 mg/l, i el que correspon és instruir atestat per delicte contra la seguretat viària.',
        'Un conductor da 0,68 mg/l en la primera prueba y 0,66 en la segunda. No es una denuncia administrativa: se supera el umbral penal de 0,60 mg/l, y lo que corresponde es instruir atestado por delito contra la seguridad vial.',
      ),
      checkpoint(
        'Quina taxa en aire espirat converteix la conducta en delicte?',
        '¿Qué tasa en aire espirado convierte la conducta en delito?',
        'Una taxa superior a 0,60 mg/l (o superior a 1,2 g/l en sang).',
        'Una tasa superior a 0,60 mg/l (o superior a 1,2 g/l en sangre).',
      ),
    ],
    [
      ref('rdleg-6-2015-ltsv', 'obligació de sotmetre’s a les proves i règim sancionador'),
      ref('rd-1428-2003-rgc', 'normes sobre begudes alcohòliques i estupefaents, i pràctica de les proves'),
      ref('lo-10-1995-cp', 'art. 379.2 i 383'),
    ],
  ),

  lesson(
    34,
    'Animals de companyia i gossos potencialment perillosos',
    'Animales de compañía y perros potencialmente peligrosos',
    6,
    [
      idea(
        'Hi ha tres capes normatives superposades: la llei estatal de 1999 amb el seu reglament, la llei catalana de 1999 amb la seva pròpia llista de races, i l’ordenança municipal. La llista catalana i l’estatal **no són idèntiques**.',
        'Hay tres capas normativas superpuestas: la ley estatal de 1999 con su reglamento, la ley catalana de 1999 con su propia lista de razas, y la ordenanza municipal. La lista catalana y la estatal **no son idénticas**.',
      ),
      explain(
        'Quan un gos és potencialment perillós',
        'Cuándo un perro es potencialmente peligroso',
        'Per tres vies. Primera: pertànyer a una de les races incloses a la llista o ser-ne un encreuament. Segona: haver tingut episodis d’agressions a persones o a altres gossos. Tercera: haver estat ensinistrat per a l’atac i la defensa. També s’hi inclouen els exemplars que reuneixen determinades característiques físiques —musculatura, perímetre toràcic, alçada i configuració del cap— tot i no pertànyer a cap raça de la llista.',
        'Por tres vías. Primera: pertenecer a una de las razas incluidas en la lista o ser un cruce. Segunda: haber tenido episodios de agresiones a personas o a otros perros. Tercera: haber sido adiestrado para el ataque y la defensa. También se incluyen los ejemplares que reúnen determinadas características físicas —musculatura, perímetro torácico, altura y configuración de la cabeza— aunque no pertenezcan a ninguna raza de la lista.',
      ),
      explain(
        'La llicència municipal',
        'La licencia municipal',
        'La tinença exigeix llicència administrativa atorgada per l’ajuntament del municipi de residència. Els requisits són: ser major d’edat, no haver estat condemnat per determinats delictes ni sancionat per infraccions greus o molt greus en la matèria, disposar de capacitat física i aptitud psicològica acreditades per certificat, i tenir subscrita una assegurança de responsabilitat civil per danys a tercers amb la cobertura mínima que fixa la norma. La llicència té una vigència limitada i és renovable.',
        'La tenencia exige licencia administrativa otorgada por el ayuntamiento del municipio de residencia. Los requisitos son: ser mayor de edad, no haber sido condenado por determinados delitos ni sancionado por infracciones graves o muy graves en la materia, disponer de capacidad física y aptitud psicológica acreditadas por certificado, y tener suscrito un seguro de responsabilidad civil por daños a terceros con la cobertura mínima que fija la norma. La licencia tiene una vigencia limitada y es renovable.',
      ),
      explain(
        'Obligacions a la via pública',
        'Obligaciones en la vía pública',
        'A les vies públiques i als espais públics, el gos ha d’anar lligat amb corretja o cadena no extensible de longitud limitada i amb morrió adequat a la seva raça. Una mateixa persona no pot portar més d’un gos potencialment perillós alhora. La llicència i el certificat d’inscripció al registre municipal s’han de portar a sobre i exhibir a requeriment dels agents.',
        'En las vías públicas y en los espacios públicos, el perro debe ir atado con correa o cadena no extensible de longitud limitada y con bozal adecuado a su raza. Una misma persona no puede llevar más de un perro potencialmente peligroso a la vez. La licencia y el certificado de inscripción en el registro municipal deben llevarse encima y exhibirse a requerimiento de los agentes.',
      ),
      pitfall(
        'La identificació per microxip i la inscripció al registre censal municipal són obligatòries per a **tots** els gossos, no només per als potencialment perillosos. La llicència, en canvi, només cal per als potencialment perillosos.',
        'La identificación por microchip y la inscripción en el registro censal municipal son obligatorias para **todos** los perros, no solo para los potencialmente peligrosos. La licencia, en cambio, solo hace falta para los potencialmente peligrosos.',
      ),
      checkpoint(
        'Quantes vies hi ha perquè un gos sigui considerat potencialment perillós?',
        '¿Cuántas vías hay para que un perro sea considerado potencialmente peligroso?',
        'Per raça o encreuament, per episodis d’agressió previs i per ensinistrament per a l’atac.',
        'Por raza o cruce, por episodios de agresión previos y por adiestramiento para el ataque.',
      ),
    ],
    [
      ref('llei-50-1999-app', 'llicència, registre i obligacions'),
      ref('rd-287-2002-app', 'llista de races i requisits de la llicència'),
      ref('llei-10-1999-gossos-cat', 'llista catalana de races i règim propi'),
      ref('roses-tramits-animals', 'requisits municipals de la llicència a Roses'),
    ],
  ),

  lesson(
    35,
    'Ordenança municipal de circulació de Roses',
    'Ordenanza municipal de circulación de Roses',
    5,
    [
      idea(
        'L’ordenança de circulació no inventa el dret de trànsit: el concreta al terme municipal dins l’espai que la llei estatal deixa als ajuntaments. Saber quin és aquest espai és la clau del tema.',
        'La ordenanza de circulación no inventa el derecho de tráfico: lo concreta en el término municipal dentro del espacio que la ley estatal deja a los ayuntamientos. Saber cuál es ese espacio es la clave del tema.',
      ),
      explain(
        'Competències municipals en trànsit',
        'Competencias municipales en tráfico',
        'La llei de trànsit atribueix als municipis la regulació, l’ordenació, la gestió, la vigilància i la disciplina del trànsit a les vies urbanes; la instrucció dels expedients sancionadors per infraccions comeses en aquestes vies; la immobilització i la retirada de vehicles; l’autorització de proves esportives que discorrin íntegrament pel nucli urbà; la realització de les proves de detecció d’alcohol i drogues; i el tancament de vies urbanes quan sigui necessari.',
        'La ley de tráfico atribuye a los municipios la regulación, la ordenación, la gestión, la vigilancia y la disciplina del tráfico en las vías urbanas; la instrucción de los expedientes sancionadores por infracciones cometidas en dichas vías; la inmovilización y la retirada de vehículos; la autorización de pruebas deportivas que discurran íntegramente por el casco urbano; la realización de las pruebas de detección de alcohol y drogas; y el cierre de vías urbanas cuando sea necesario.',
      ),
      explain(
        'Què conté típicament l’ordenança',
        'Qué contiene típicamente la ordenanza',
        'Objecte i àmbit d’aplicació al terme municipal; ordenació de la circulació de vehicles i de vianants; règim de parada i estacionament, incloent-hi zones regulades, càrrega i descàrrega, guals i reserves; usos especials de la via; circulació de bicicletes i vehicles de mobilitat personal; grua i dipòsit municipal; i el règim de denúncies i procediment sancionador remès a la normativa estatal.',
        'Objeto y ámbito de aplicación en el término municipal; ordenación de la circulación de vehículos y de peatones; régimen de parada y estacionamiento, incluyendo zonas reguladas, carga y descarga, vados y reservas; usos especiales de la vía; circulación de bicicletas y vehículos de movilidad personal; grúa y depósito municipal; y el régimen de denuncias y procedimiento sancionador remitido a la normativa estatal.',
      ),
      pitfall(
        '**Aquest tema exigeix llegir el text vigent de l’ordenança de Roses.** Els articles concrets, les zones regulades i els horaris de càrrega i descàrrega són dades municipals que canvien i que no es poden deduir de la llei estatal. Descarrega l’ordenança des del web municipal abans de l’examen.',
        '**Este tema exige leer el texto vigente de la ordenanza de Roses.** Los artículos concretos, las zonas reguladas y los horarios de carga y descarga son datos municipales que cambian y que no pueden deducirse de la ley estatal. Descarga la ordenanza desde la web municipal antes del examen.',
      ),
      example(
        'Si a l’examen et pregunten per l’horari d’una zona de càrrega i descàrrega concreta del passeig marítim, la resposta no és a cap manual: és a l’ordenança municipal i a la senyalització vigent.',
        'Si en el examen te preguntan por el horario de una zona de carga y descarga concreta del paseo marítimo, la respuesta no está en ningún manual: está en la ordenanza municipal y en la señalización vigente.',
      ),
      checkpoint(
        'On acaba la competència municipal en matèria de trànsit?',
        '¿Dónde acaba la competencia municipal en materia de tráfico?',
        'A les vies urbanes del terme municipal; fora d’aquest àmbit la competència és d’una altra administració.',
        'En las vías urbanas del término municipal; fuera de ese ámbito la competencia es de otra administración.',
      ),
    ],
    [
      ref('roses-ordenanca-circulacio', 'text vigent de l’ordenança municipal de circulació', 'Pendent de descàrrega: cal llegir l’articulat concret al web municipal.'),
      ref('rdleg-6-2015-ltsv', 'competències dels municipis en matèria de trànsit'),
    ],
  ),

  lesson(
    36,
    'Ordenança de convivència ciutadana de Roses',
    'Ordenanza de convivencia ciudadana de Roses',
    5,
    [
      idea(
        'L’ordenança de convivència és l’eina amb què el municipi regula l’ús de l’espai públic i el comportament cívic. La seva base legal és la potestat municipal per tipificar infraccions quan no hi ha una normativa sectorial que ho faci.',
        'La ordenanza de convivencia es la herramienta con que el municipio regula el uso del espacio público y el comportamiento cívico. Su base legal es la potestad municipal para tipificar infracciones cuando no hay una normativa sectorial que lo haga.',
      ),
      explain(
        'La base legal de la potestat sancionadora municipal',
        'La base legal de la potestad sancionadora municipal',
        'La llei de bases del règim local permet als ajuntaments tipificar infraccions i sancions a les ordenances per a la relació de convivència d’interès local i l’ús dels serveis, equipaments, infraestructures i espais públics, sempre que no hi hagi normativa sectorial específica. Els límits econòmics de les multes són escalonats: fins a tres mil euros per a les infraccions molt greus, fins a mil cinc-cents per a les greus i fins a set-cents cinquanta per a les lleus.',
        'La ley de bases del régimen local permite a los ayuntamientos tipificar infracciones y sanciones en las ordenanzas para la relación de convivencia de interés local y el uso de los servicios, equipamientos, infraestructuras y espacios públicos, siempre que no exista normativa sectorial específica. Los límites económicos de las multas son escalonados: hasta tres mil euros para las infracciones muy graves, hasta mil quinientos para las graves y hasta setecientos cincuenta para las leves.',
      ),
      explain(
        'Matèries habituals',
        'Materias habituales',
        'Ús comú de l’espai públic i actituds incíviques; sorolls i contaminació acústica; neteja i residus; pintades i grafits; consum d’alcohol a la via pública; tinença d’animals; ocupació de la via pública amb terrasses i activitats comercials; ús de platges i zones de bany; i jocs i activitats en espais públics.',
        'Uso común del espacio público y actitudes incívicas; ruidos y contaminación acústica; limpieza y residuos; pintadas y grafitis; consumo de alcohol en la vía pública; tenencia de animales; ocupación de la vía pública con terrazas y actividades comerciales; uso de playas y zonas de baño; y juegos y actividades en espacios públicos.',
      ),
      pitfall(
        'Si una conducta ja està tipificada per una norma sectorial —per exemple, per la Llei orgànica 4/2015— l’ordenança municipal no la pot tornar a tipificar per aplicar-hi una sanció pròpia. Escollir la via equivocada fa caure l’expedient.',
        'Si una conducta ya está tipificada por una norma sectorial —por ejemplo, por la Ley orgánica 4/2015— la ordenanza municipal no puede volver a tipificarla para aplicarle una sanción propia. Escoger la vía equivocada hace caer el expediente.',
      ),
      example(
        '**Aquest tema, com el 35, exigeix el text vigent de l’ordenança de Roses.** Les conductes concretes que s’hi tipifiquen, la seva qualificació i els imports són dades municipals: descarrega l’ordenança de convivència des del web de l’Ajuntament i treballa-hi directament.',
        '**Este tema, como el 35, exige el texto vigente de la ordenanza de Roses.** Las conductas concretas que se tipifican, su calificación y los importes son datos municipales: descarga la ordenanza de convivencia desde la web del Ayuntamiento y trabaja directamente sobre ella.',
      ),
      checkpoint(
        'Quin és el límit màxim de multa municipal per a una infracció molt greu tipificada per ordenança?',
        '¿Cuál es el límite máximo de multa municipal para una infracción muy grave tipificada por ordenanza?',
        'Tres mil euros.',
        'Tres mil euros.',
      ),
    ],
    [
      ref('roses-ordenanca-convivencia', 'text vigent de l’ordenança de convivència ciutadana', 'Pendent de descàrrega: cal llegir l’articulat concret al web municipal.'),
      ref('llei-7-1985-lrbrl', 'art. 139 a 141 (tipificació d’infraccions i límits de les multes)'),
    ],
  ),
]
