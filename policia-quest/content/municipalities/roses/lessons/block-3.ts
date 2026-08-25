/** Microlliçons dels temes 31 a 36 (bloc Roses, trànsit i convivència). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, ref, refv } from '../authoring.ts'

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
      refv('roses-ordenances-index', 'delimitació d’àmbits i zones al terme municipal', '2026-08-24'),
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
      refv('rd-818-2009-rgcond', 'classes de permisos i llicències de conducció', '2026-08-24'),
      refv('rdleg-6-2015-ltsv', 'immobilització, retirada i vehicles abandonats', '2026-08-24'),
      refv('rd-2822-1998-rgv', 'condicions tècniques i documentació dels vehicles', '2026-08-24'),
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
      refv('rdleg-6-2015-ltsv', 'obligació de sotmetre’s a les proves i règim sancionador', '2026-08-24'),
      refv('rd-1428-2003-rgc', 'normes sobre begudes alcohòliques i estupefaents, i pràctica de les proves', '2026-08-24'),
      refv('lo-10-1995-cp', 'art. 379.2 i 383', '2026-08-24'),
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
      refv('llei-50-1999-app', 'llicència, registre i obligacions', '2026-08-24'),
      refv('rd-287-2002-app', 'llista de races i requisits de la llicència', '2026-08-24'),
      refv('llei-10-1999-gossos-cat', 'llista catalana de races i règim propi', '2026-08-24'),
      refv('roses-tramits-animals', 'requisits municipals de la llicència a Roses', '2026-08-24'),
    ],
  ),

  lesson(
    35,
    'Ordenança municipal de circulació de Roses',
    'Ordenanza municipal de circulación de Roses',
    6,
    [
      idea(
        'El temari demana tres coses concretes d’aquesta ordenança: objecte, àmbit d’aplicació i normes sobre ordenació del trànsit. Són el Títol I (article 1) i el Títol II (articles 2 a 50) del text aprovat el 27 de setembre de 2010, que s’ha de llegir **juntament amb la modificació de 2021**.',
        'El temario pide tres cosas concretas de esta ordenanza: objeto, ámbito de aplicación y normas sobre ordenación del tráfico. Son el Título I (artículo 1) y el Título II (artículos 2 a 50) del texto aprobado el 27 de septiembre de 2010, que debe leerse **junto con la modificación de 2021**.',
      ),
      explain(
        'Article 1: objecte i àmbit',
        'Artículo 1: objeto y ámbito',
        'L’objecte és desplegar la competència municipal en matèria d’ordenació del trànsit de persones i de vehicles a les vies urbanes de Roses, dins el marc de les normes autonòmiques, estatals i les directrius europees. Les normes s’apliquen a **totes les vies del terme municipal**. I atenció al concepte de via urbana que fa servir l’ordenança: comprèn la vialitat en sentit estricte, les places i altres espais públics municipals aptes per circular, i també **els elements de vialitat i terrenys de titularitat privada destinats amb caràcter general a la circulació de vehicles**. Quan les circumstàncies ho requereixin es poden adoptar mesures especials de regulació: prohibir o restringir la circulació, canalitzar entrades i sortides per determinades vies o reordenar l’estacionament.',
        'El objeto es desplegar la competencia municipal en materia de ordenación del tráfico de personas y de vehículos en las vías urbanas de Roses, dentro del marco de las normas autonómicas, estatales y las directrices europeas. Las normas se aplican a **todas las vías del término municipal**. Y atención al concepto de vía urbana que usa la ordenanza: comprende la vialidad en sentido estricto, las plazas y otros espacios públicos municipales aptos para circular, y también **los elementos de vialidad y terrenos de titularidad privada destinados con carácter general a la circulación de vehículos**. Cuando las circunstancias lo requieran pueden adoptarse medidas especiales de regulación: prohibir o restringir la circulación, canalizar entradas y salidas por determinadas vías o reordenar el estacionamiento.',
      ),
      explain(
        'Com s’ordena el Títol II',
        'Cómo se ordena el Título II',
        'Catorze capítols, en aquest ordre: senyalització (art. 2–6), obstacles a la via pública (7–8), vianants (9–10), parada (11–13), estacionament (14–20), retirada de vehicles (21–26), vehicles abandonats (27–28), mesures circulatòries especials (29–32), transport col·lectiu de viatgers (33–36), càrrega i descàrrega (37–42), contenidors (43), mesures generals de circulació (44–48), usos restringits a la via pública (49) i circulació de vehicles pesants i mercaderies perilloses (50). Saber en quin capítol viu cada matèria val tant com saber-ne el contingut.',
        'Catorce capítulos, en este orden: señalización (art. 2–6), obstáculos en la vía pública (7–8), peatones (9–10), parada (11–13), estacionamiento (14–20), retirada de vehículos (21–26), vehículos abandonados (27–28), medidas circulatorias especiales (29–32), transporte colectivo de viajeros (33–36), carga y descarga (37–42), contenedores (43), medidas generales de circulación (44–48), usos restringidos en la vía pública (49) y circulación de vehículos pesados y mercancías peligrosas (50). Saber en qué capítulo vive cada materia vale tanto como saber su contenido.',
      ),
      explain(
        'Article 2: règim dels senyals',
        'Artículo 2: régimen de las señales',
        'Els senyals preceptius col·locats a l’entrada del terme municipal regeixen a **tot el seu àmbit territorial**, excepte els senyals específics per a un tram de carrer o via. Els senyals de les entrades de les illes de vianants o zones de circulació restringida regeixen per a tot el perímetre respectiu. I la regla que decideix qualsevol conflicte: **els senyals i ordres dels agents de la Policia Local o d’altres agents de l’autoritat prevalen sobre qualsevol altre tipus de senyalització**.',
        'Las señales preceptivas colocadas en la entrada del término municipal rigen en **todo su ámbito territorial**, salvo las señales específicas para un tramo de calle o vía. Las señales de las entradas de las islas de peatones o zonas de circulación restringida rigen para todo el perímetro respectivo. Y la regla que decide cualquier conflicto: **las señales y órdenes de los agentes de la Policía Local o de otros agentes de la autoridad prevalecen sobre cualquier otro tipo de señalización**.',
      ),
      explain(
        'La modificació de 2021: mobilitat personal i reserves per a discapacitat',
        'La modificación de 2021: movilidad personal y reservas por discapacidad',
        'El Ple de 28 d’octubre de 2020 va aprovar una modificació que es va publicar al BOP de Girona núm. 42, de 3 de març de 2021. Toca quatre punts. **Article 19**: les zones d’estacionament reservades per a persones amb discapacitat i mobilitat reduïda poden ser d’ús general o **d’ús individual**, aquestes últimes per a un titular determinat i el vehicle que consti a la senyalització vertical. **Article 46.2**: pel carril bici hi poden circular cicles, bicicletes **i vehicles de mobilitat personal**. **Article 46 bis**, de nova creació, regula els VMP. **Article 49**: els patins i monopatins que no siguin VMP segons la normativa vigent no poden circular per la calçada.',
        'El Pleno de 28 de octubre de 2020 aprobó una modificación publicada en el BOP de Girona núm. 42, de 3 de marzo de 2021. Toca cuatro puntos. **Artículo 19**: las zonas de estacionamiento reservadas para personas con discapacidad y movilidad reducida pueden ser de uso general o **de uso individual**, estas últimas para un titular determinado y el vehículo que conste en la señalización vertical. **Artículo 46.2**: por el carril bici pueden circular ciclos, bicicletas **y vehículos de movilidad personal**. **Artículo 46 bis**, de nueva creación, regula los VMP. **Artículo 49**: los patines y monopatines que no sean VMP según la normativa vigente no pueden circular por la calzada.',
      ),
      compare(
        'Article 46 bis: on pot i on no pot circular un VMP',
        'Artículo 46 bis: dónde puede y dónde no puede circular un VMP',
        'Pot circular', 'Puede circular',
        'No pot circular', 'No puede circular',
        [
          ['Calçada', 'Calzada', 'Per vies urbanes amb velocitat permesa no superior a 30 km/h', 'Por vías urbanas con velocidad permitida no superior a 30 km/h', 'Per vies amb velocitat superior a 30 km/h o amb més d’un carril per sentit', 'Por vías con velocidad superior a 30 km/h o con más de un carril por sentido'],
          ['Carril bici', 'Carril bici', 'Pels carrils bici adequadament senyalitzats', 'Por los carriles bici adecuadamente señalizados', '—', '—'],
          ['Vorera i zona de vianants', 'Acera y zona peatonal', 'Només si està expressament autoritzada, amb les limitacions que s’hi fixin', 'Solo si está expresamente autorizada, con las limitaciones que se fijen', 'Per les voreres i zones de vianants en general', 'Por las aceras y zonas peatonales en general'],
        ],
      ),
      explain(
        'Requisits per conduir un VMP a Roses',
        'Requisitos para conducir un VMP en Roses',
        'L’article 46 bis.4 exigeix: edat mínima de **15 anys**; no fer servir telèfon mòbil ni auriculars connectats a aparells de so mentre es condueix; respectar les normes generals de circulació; disposar de timbre o avís acústic i, de nit o amb poca visibilitat, enllumenat idoni o elements reflectants; portar la documentació necessària; no circular arrossegat ni arrossegant un altre vehicle; **transportar una única persona**; i **circular amb casc homologat**. A més, els VMP destinats a activitats econòmiques de tipus turístic o d’oci han de disposar d’assegurança que cobreixi la seva responsabilitat en cas d’accident.',
        'El artículo 46 bis.4 exige: edad mínima de **15 años**; no usar teléfono móvil ni auriculares conectados a aparatos de sonido mientras se conduce; respetar las normas generales de circulación; disponer de timbre o aviso acústico y, de noche o con poca visibilidad, alumbrado idóneo o elementos reflectantes; llevar la documentación necesaria; no circular arrastrado ni arrastrando otro vehículo; **transportar una única persona**; y **circular con casco homologado**. Además, los VMP destinados a actividades económicas de tipo turístico o de ocio deben disponer de seguro que cubra su responsabilidad en caso de accidente.',
      ),
      pitfall(
        'El casc homologat per a VMP és una exigència **de l’ordenança de Roses**, no de la norma estatal general. Al terme de Roses és obligatori, i circular-hi sense és infracció greu segons l’annex 1.',
        'El casco homologado para VMP es una exigencia **de la ordenanza de Roses**, no de la norma estatal general. En el término de Roses es obligatorio, y circular sin él es infracción grave según el anexo 1.',
      ),
      pitfall(
        'Un detall que cal saber i no memoritzar malament: al text de l’article 46 bis.4 el transport d’una sola persona és la lletra **g** i el casc la lletra **h**, però la taula de l’annex 1 els cita com a **h** i **i**. La lletra no quadra entre els dos documents. Estudia la conducta, no la lletra: en una pregunta d’examen la conducta és el que es demana.',
        'Un detalle que hay que saber y no memorizar mal: en el texto del artículo 46 bis.4 el transporte de una sola persona es la letra **g** y el casco la letra **h**, pero la tabla del anexo 1 los cita como **h** e **i**. La letra no cuadra entre ambos documentos. Estudia la conducta, no la letra: en una pregunta de examen la conducta es lo que se pide.',
      ),
      checkpoint(
        'Un patinet elèctric que sí que és VMP, pot circular per un carrer urbà amb límit de 50 km/h?',
        'Un patinete eléctrico que sí es VMP, ¿puede circular por una calle urbana con límite de 50 km/h?',
        'No. L’article 46 bis només permet la calçada quan la velocitat permesa no supera els 30 km/h, i prohibeix expressament les vies amb velocitat superior o amb més d’un carril per sentit.',
        'No. El artículo 46 bis solo permite la calzada cuando la velocidad permitida no supera los 30 km/h, y prohíbe expresamente las vías con velocidad superior o con más de un carril por sentido.',
      ),
    ],
    [
      refv('roses-ordenanca-circulacio', 'art. 1 (objecte i àmbit) i títol II, pàgines 1–3 del PDF', '2010-12-13'),
      refv('roses-ordenanca-circulacio', 'art. 2 (règim dels senyals), pàgina 3 del PDF', '2010-12-13'),
      refv('roses-ordenanca-circulacio-mod-2021', 'art. 19, 46, 46 bis i 49, pàgines 1–4 del PDF', '2021-03-03'),
      refv('roses-ordenanca-circulacio-mod-2021', 'annex 1 (quadre d’infraccions), pàgines 5–6 del PDF', '2021-03-03',
        'La taula de l’annex cita 46 bis.4.h i 46 bis.4.i mentre que l’articulat només arriba a la lletra h. La discrepància és del document oficial i s’ha deixat constar sense resoldre-la.'),
    ],
  ),

  lesson(
    36,
    'Ordenança de convivència ciutadana de Roses',
    'Ordenanza de convivencia ciudadana de Roses',
    6,
    [
      idea(
        'Aquesta ordenança es va aprovar el 28 de gener de 2019 i es va publicar al BOP de Girona núm. 103, de 29 de maig de 2019. El Ple de 24 de febrer de 2021 en va aprovar definitivament una modificació que toca els articles 10, 11, 20, 28 i l’annex. Qui estudiï només el text de 2019 estudiarà imports i qualificacions que ja no són els vigents.',
        'Esta ordenanza se aprobó el 28 de enero de 2019 y se publicó en el BOP de Girona núm. 103, de 29 de mayo de 2019. El Pleno de 24 de febrero de 2021 aprobó definitivamente una modificación que toca los artículos 10, 11, 20, 28 y el anexo. Quien estudie solo el texto de 2019 estudiará importes y calificaciones que ya no son los vigentes.',
      ),
      explain(
        'Objecte i àmbit (articles 1 i 2)',
        'Objeto y ámbito (artículos 1 y 2)',
        'L’objecte és **preservar l’espai públic com a lloc de convivència i civisme**, on totes les persones puguin desenvolupar en llibertat les seves activitats de lliure circulació, oci, trobada i esbarjo, amb ple respecte a la dignitat i als drets dels altres i a la pluralitat d’expressions culturals, polítiques, lingüístiques i religioses i de formes de vida. S’aplica a tot el terme municipal de Roses i, especialment, als espais de domini públic municipal i als d’ús públic.',
        'El objeto es **preservar el espacio público como lugar de convivencia y civismo**, donde todas las personas puedan desarrollar en libertad sus actividades de libre circulación, ocio, encuentro y esparcimiento, con pleno respeto a la dignidad y a los derechos de los demás y a la pluralidad de expresiones culturales, políticas, lingüísticas y religiosas y de formas de vida. Se aplica a todo el término municipal de Roses y, especialmente, a los espacios de dominio público municipal y a los de uso público.',
      ),
      explain(
        'Article 10: consum de begudes alcohòliques',
        'Artículo 10: consumo de bebidas alcohólicas',
        'El text de 2019 prohibeix el consum a l’espai públic **quan com a conseqüència d’aquest consum resulti alterada la convivència ciutadana**, i concreta quan es produeix aquesta alteració: si la morfologia del lloc convida a l’aglomeració; si es pot deteriorar la tranquil·litat de l’entorn o provocar insalubritat; si el consum s’exterioritza de forma denigrant; o si el lloc es caracteritza per l’afluència de menors. La modificació de 2021 hi **afegeix el punt 4**, que prohibeix el consum a l’espai públic **encara que no es pertorbi la convivència**, excepte en establiments i espais reservats expressament per a aquesta finalitat —terrasses i vetlladors— i en festes o actes populars amb l’oportuna autorització.',
        'El texto de 2019 prohíbe el consumo en el espacio público **cuando como consecuencia de ese consumo resulte alterada la convivencia ciudadana**, y concreta cuándo se produce esa alteración: si la morfología del lugar invita a la aglomeración; si puede deteriorarse la tranquilidad del entorno o provocarse insalubridad; si el consumo se exterioriza de forma denigrante; o si el lugar se caracteriza por la afluencia de menores. La modificación de 2021 **añade el punto 4**, que prohíbe el consumo en el espacio público **aunque no se perturbe la convivencia**, salvo en establecimientos y espacios reservados expresamente para esa finalidad —terrazas y veladores— y en fiestas o actos populares con la oportuna autorización.',
      ),
      explain(
        'Article 11: comerç ambulant no autoritzat',
        'Artículo 11: comercio ambulante no autorizado',
        'La modificació de 2021 canvia dues coses. El punt 1 passa a prohibir la venda ambulant sense autorització municipal **a tot el municipi**, sense l’excepció de l’àmbit del mercat de no sedentaris que hi havia al text de 2019, i afegeix que si la venda s’exerceix amb ocupació de via pública, l’ocupació se sanciona per la normativa sectorial. El punt 2 amplia la col·laboració prohibida: facilitar el gènere **o el seu transport**, o vigilar i alertar sobre la presència dels agents. El punt 3, del text original, prohibeix comprar o adquirir a l’espai públic productes procedents de la venda ambulant no autoritzada.',
        'La modificación de 2021 cambia dos cosas. El punto 1 pasa a prohibir la venta ambulante sin autorización municipal **en todo el municipio**, sin la excepción del ámbito del mercado de no sedentarios que había en el texto de 2019, y añade que si la venta se ejerce con ocupación de vía pública, la ocupación se sanciona por la normativa sectorial. El punto 2 amplía la colaboración prohibida: facilitar el género **o su transporte**, o vigilar y alertar sobre la presencia de los agentes. El punto 3, del texto original, prohíbe comprar o adquirir en el espacio público productos procedentes de la venta ambulante no autorizada.',
      ),
      compare(
        'Què va canviar l’annex el 2021',
        'Qué cambió el anexo en 2021',
        'Text de 2019', 'Texto de 2019',
        'Vigent des de 2021', 'Vigente desde 2021',
        [
          ['Art. 10.4 — consum d’alcohol sense pertorbar', 'Art. 10.4 — consumo de alcohol sin perturbar', 'No estava tipificat', 'No estaba tipificado', 'Lleu, 100 €', 'Leve, 100 €'],
          ['Art. 11.1 — venda ambulant no autoritzada', 'Art. 11.1 — venta ambulante no autorizada', 'Greu, 1.500 €', 'Grave, 1.500 €', 'Lleu, 600 €', 'Leve, 600 €'],
          ['Art. 11.2 — col·laborar-hi', 'Art. 11.2 — colaborar', 'Greu, 750 €', 'Grave, 750 €', 'Lleu, 500 €', 'Leve, 500 €'],
          ['Art. 16 — conductes vandàliques', 'Art. 16 — conductas vandálicas', 'Greu, 1.000 €', 'Grave, 1.000 €', 'Lleu, 300 €', 'Leve, 300 €'],
        ],
      ),
      explain(
        'Articles 20 i 28: llançament de materials i reducció de la sanció',
        'Artículos 20 y 28: lanzamiento de materiales y reducción de la sanción',
        'L’article 20.1, en la redacció de 2021, prohibeix llançar a la via pública objectes com cigarretes, papers, xiclets, recipients, galledes d’aigua o deixalles de tota mena, i afegeix que si l’abandonament o abocament es considera que perjudica el medi ambient se sanciona per la normativa sectorial vigent. L’article 28 hi guanya un règim de reducció: en cas de **pagament voluntari abans de la resolució sancionadora** s’aplica una bonificació del 20 %; la persona presumptament responsable també pot **reconèixer voluntàriament la responsabilitat**, i en tots dos casos s’aplica una reducció de com a mínim el 20 %, **acumulables entre si**, condicionada al desistiment o renúncia de qualsevol acció o recurs en via administrativa.',
        'El artículo 20.1, en la redacción de 2021, prohíbe lanzar a la vía pública objetos como cigarrillos, papeles, chicles, recipientes, cubos de agua o desperdicios de todo tipo, y añade que si el abandono o vertido se considera que perjudica el medio ambiente se sanciona por la normativa sectorial vigente. El artículo 28 gana un régimen de reducción: en caso de **pago voluntario antes de la resolución sancionadora** se aplica una bonificación del 20 %; la persona presuntamente responsable también puede **reconocer voluntariamente la responsabilidad**, y en ambos casos se aplica una reducción de al menos el 20 %, **acumulables entre sí**, condicionada al desistimiento o renuncia de cualquier acción o recurso en vía administrativa.',
      ),
      pitfall(
        'La modificació de 2021 **abaixa** la qualificació i l’import de la venda ambulant i del vandalisme: de greu a lleu. És contraintuïtiu i per això cau a l’examen. Si recordes «venda ambulant, 1.500 €, greu» estàs recordant el text derogat.',
        'La modificación de 2021 **rebaja** la calificación y el importe de la venta ambulante y del vandalismo: de grave a leve. Es contraintuitivo y por eso cae en el examen. Si recuerdas «venta ambulante, 1.500 €, grave» estás recordando el texto derogado.',
      ),
      checkpoint(
        'Beure una llauna en un banc d’una plaça de Roses, sense molestar ningú, és infracció?',
        'Beber una lata en un banco de una plaza de Roses, sin molestar a nadie, ¿es infracción?',
        'Sí, des de 2021. L’article 10.4 prohibeix el consum a l’espai públic encara que no es pertorbi la convivència, i l’annex el qualifica de lleu amb 100 €. Les excepcions són les terrasses i vetlladors i les festes o actes populars autoritzats.',
        'Sí, desde 2021. El artículo 10.4 prohíbe el consumo en el espacio público aunque no se perturbe la convivencia, y el anexo lo califica de leve con 100 €. Las excepciones son las terrazas y veladores y las fiestas o actos populares autorizados.',
      ),
    ],
    [
      refv('roses-ordenanca-convivencia', 'art. 1 i 2 (objecte i àmbit), pàgina 3 del PDF', '2019-05-29'),
      refv('roses-ordenanca-convivencia', 'art. 10 (consum de begudes alcohòliques) i art. 11 (comerç ambulant), pàgina 4 del PDF', '2019-05-29'),
      refv('roses-ordenanca-convivencia-mod-2021', 'modificacions primera a quarta (art. 10, 11, 20 i 28), pàgines 1–2 del PDF', '2021-03-19'),
      refv('roses-ordenanca-convivencia-mod-2021', 'modificació cinquena (annex: art. 10.4, 11.1, 11.2 i 16), pàgines 3–4 del PDF', '2021-03-19'),
      refv('llei-7-1985-lrbrl', 'art. 139 a 141 (tipificació d’infraccions i límits de les multes)', '2026-08-24'),
    ],
  ),
]
