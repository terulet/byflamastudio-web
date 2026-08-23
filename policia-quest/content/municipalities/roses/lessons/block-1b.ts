/** Microlliçons dels temes 6 a 10 (bloc Institucions i Administració). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, ref } from '../authoring.ts'

export const LESSONS_6_10: Lesson[] = [
  lesson(
    6,
    'Ordenances i bans: les normes que aplica la policia local',
    'Ordenanzas y bandos: las normas que aplica la policía local',
    5,
    [
      idea(
        'L’ordenança és una norma reglamentària aprovada pel ple amb un procediment garantista. El ban és un acte de l’alcalde: recorda, concreta o adverteix, però no crea infraccions noves.',
        'La ordenanza es una norma reglamentaria aprobada por el pleno con un procedimiento garantista. El bando es un acto del alcalde: recuerda, concreta o advierte, pero no crea infracciones nuevas.',
      ),
      explain(
        'El procediment d’aprovació d’una ordenança',
        'El procedimiento de aprobación de una ordenanza',
        'Primer, aprovació inicial pel ple. Segon, informació pública i audiència a les persones interessades per un termini mínim de trenta dies perquè presentin reclamacions i suggeriments. Tercer, resolució de totes les reclamacions presentades i aprovació definitiva pel ple. Si no se’n presenta cap, l’acord fins llavors provisional esdevé definitiu automàticament.',
        'Primero, aprobación inicial por el pleno. Segundo, información pública y audiencia a las personas interesadas por un plazo mínimo de treinta días para que presenten reclamaciones y sugerencias. Tercero, resolución de todas las reclamaciones presentadas y aprobación definitiva por el pleno. Si no se presenta ninguna, el acuerdo hasta entonces provisional se convierte en definitivo automáticamente.',
      ),
      explain(
        'Publicació i entrada en vigor',
        'Publicación y entrada en vigor',
        'L’ordenança s’ha de publicar íntegrament al butlletí oficial de la província —a Roses, el BOP de Girona— i no entra en vigor fins que ha transcorregut el termini de quinze dies hàbils previst per a la comunicació a l’Administració de l’Estat i a la de la comunitat autònoma.',
        'La ordenanza debe publicarse íntegramente en el boletín oficial de la provincia —en Roses, el BOP de Girona— y no entra en vigor hasta que ha transcurrido el plazo de quince días hábiles previsto para la comunicación a la Administración del Estado y a la de la comunidad autónoma.',
      ),
      compare(
        'Ordenança i ban',
        'Ordenanza y bando',
        'Ordenança',
        'Ordenanza',
        'Ban',
        'Bando',
        [
          ['Qui l’aprova', 'Quién lo aprueba', 'El ple', 'El pleno', 'L’alcalde o alcaldessa', 'El alcalde o alcaldesa'],
          ['Naturalesa', 'Naturaleza', 'Norma reglamentària', 'Norma reglamentaria', 'Acte de l’autoritat municipal', 'Acto de la autoridad municipal'],
          ['Pot crear infraccions', 'Puede crear infracciones', 'Sí, dins els límits legals', 'Sí, dentro de los límites legales', 'No', 'No'],
          ['Procediment', 'Procedimiento', 'Aprovació inicial, informació pública i aprovació definitiva', 'Aprobación inicial, información pública y aprobación definitiva', 'Dictat directe i publicació', 'Dictado directo y publicación'],
        ],
      ),
      example(
        'Un ban d’estiu de l’alcaldia pot recordar l’horari de càrrega i descàrrega al passeig marítim i advertir de les conseqüències d’incomplir-lo, però la infracció i la sanció han d’estar previstes a l’ordenança municipal de circulació o a la llei.',
        'Un bando de verano de la alcaldía puede recordar el horario de carga y descarga en el paseo marítimo y advertir de las consecuencias de incumplirlo, pero la infracción y la sanción deben estar previstas en la ordenanza municipal de circulación o en la ley.',
      ),
      pitfall(
        'Es confon el termini d’informació pública (mínim trenta dies) amb el termini de quinze dies hàbils previ a l’entrada en vigor. Són dos moments diferents del mateix procediment.',
        'Se confunde el plazo de información pública (mínimo treinta días) con el plazo de quince días hábiles previo a la entrada en vigor. Son dos momentos distintos del mismo procedimiento.',
      ),
      checkpoint(
        'Quin és el termini mínim d’informació pública d’una ordenança?',
        '¿Cuál es el plazo mínimo de información pública de una ordenanza?',
        'Trenta dies per a reclamacions i suggeriments.',
        'Treinta días para reclamaciones y sugerencias.',
      ),
    ],
    [
      ref('llei-7-1985-lrbrl', 'art. 4.1.a, 21.1.e, 49, 70.2 i 84'),
      ref('roses-ordenances-index', 'ordenances vigents de Roses'),
    ],
  ),

  lesson(
    7,
    'Poder judicial i Tribunal Constitucional',
    'Poder judicial y Tribunal Constitucional',
    5,
    [
      idea(
        'El Tribunal Constitucional NO forma part del poder judicial. És un òrgan constitucional independent, situat fora dels tres poders clàssics. Aquesta és la distinció que més es pregunta.',
        'El Tribunal Constitucional NO forma parte del poder judicial. Es un órgano constitucional independiente, situado fuera de los tres poderes clásicos. Esta es la distinción que más se pregunta.',
      ),
      explain(
        'Principis del poder judicial',
        'Principios del poder judicial',
        'La justícia emana del poble i s’administra en nom del Rei per jutges i magistrats integrants del poder judicial, independents, inamovibles, responsables i sotmesos únicament a l’imperi de la llei. Regeix el principi d’unitat jurisdiccional; queda prohibit els tribunals d’excepció. El Consell General del Poder Judicial és el seu òrgan de govern: el presideix el president del Tribunal Suprem i té vint vocals nomenats per cinc anys.',
        'La justicia emana del pueblo y se administra en nombre del Rey por jueces y magistrados integrantes del poder judicial, independientes, inamovibles, responsables y sometidos únicamente al imperio de la ley. Rige el principio de unidad jurisdiccional; quedan prohibidos los tribunales de excepción. El Consejo General del Poder Judicial es su órgano de gobierno: lo preside el presidente del Tribunal Supremo y tiene veinte vocales nombrados por cinco años.',
      ),
      explain(
        'El Tribunal Constitucional',
        'El Tribunal Constitucional',
        'Es compon de dotze membres nomenats pel Rei: quatre a proposta del Congrés per majoria de tres cinquenes parts, quatre a proposta del Senat per la mateixa majoria, dos a proposta del Govern i dos a proposta del Consell General del Poder Judicial. El mandat és de nou anys i es renoven per terceres parts cada tres anys. Coneix del recurs i la qüestió d’inconstitucionalitat, del recurs d’empara i dels conflictes de competència entre l’Estat i les comunitats autònomes.',
        'Se compone de doce miembros nombrados por el Rey: cuatro a propuesta del Congreso por mayoría de tres quintas partes, cuatro a propuesta del Senado por la misma mayoría, dos a propuesta del Gobierno y dos a propuesta del Consejo General del Poder Judicial. El mandato es de nueve años y se renuevan por terceras partes cada tres años. Conoce del recurso y la cuestión de inconstitucionalidad, del recurso de amparo y de los conflictos de competencia entre el Estado y las comunidades autónomas.',
      ),
      explain(
        'A Catalunya',
        'En Cataluña',
        'El Tribunal Superior de Justícia de Catalunya culmina l’organització judicial dins el territori, sens perjudici de la jurisdicció que correspon al Tribunal Suprem. El Tribunal Suprem és l’òrgan jurisdiccional superior en tots els ordres, excepte en matèria de garanties constitucionals.',
        'El Tribunal Superior de Justicia de Cataluña culmina la organización judicial dentro del territorio, sin perjuicio de la jurisdicción que corresponde al Tribunal Supremo. El Tribunal Supremo es el órgano jurisdiccional superior en todos los órdenes, excepto en materia de garantías constitucionales.',
      ),
      pitfall(
        'El president del Tribunal Constitucional no el nomena el Congrés: l’elegeixen els mateixos magistrats d’entre els seus membres i el nomena el Rei, per un període de tres anys.',
        'El presidente del Tribunal Constitucional no lo nombra el Congreso: lo eligen los propios magistrados de entre sus miembros y lo nombra el Rey, por un período de tres años.',
      ),
      checkpoint(
        'Quants magistrats té el Tribunal Constitucional i quant dura el mandat?',
        '¿Cuántos magistrados tiene el Tribunal Constitucional y cuánto dura el mandato?',
        'Dotze magistrats, amb un mandat de nou anys i renovació per terceres parts cada tres.',
        'Doce magistrados, con un mandato de nueve años y renovación por terceras partes cada tres.',
      ),
    ],
    [
      ref('ce-1978', 'títol VI (art. 117-127) i títol IX (art. 159-165)'),
      ref('lo-6-2006-eac', 'el poder judicial a Catalunya i el TSJC'),
    ],
  ),

  lesson(
    8,
    'Drets, deures i codi de conducta dels funcionaris',
    'Derechos, deberes y código de conducta de los funcionarios',
    5,
    [
      idea(
        'L’Estatut bàsic de l’empleat públic separa els drets individuals dels drets col·lectius, i converteix el codi de conducta en dret positiu: incomplir-lo pot ser una falta disciplinària, no només un problema d’estil.',
        'El Estatuto básico del empleado público separa los derechos individuales de los derechos colectivos, y convierte el código de conducta en derecho positivo: incumplirlo puede ser una falta disciplinaria, no solo un problema de estilo.',
      ),
      explain(
        'Classes d’empleats públics',
        'Clases de empleados públicos',
        'Funcionaris de carrera, funcionaris interins, personal laboral (fix, per temps indefinit o temporal) i personal eventual. Els agents de la Policia Local són funcionaris de carrera; en una convocatòria com la de Roses de 2026 s’hi accedeix com a funcionari interí.',
        'Funcionarios de carrera, funcionarios interinos, personal laboral (fijo, por tiempo indefinido o temporal) y personal eventual. Los agentes de la Policía Local son funcionarios de carrera; en una convocatoria como la de Roses de 2026 se accede como funcionario interino.',
      ),
      explain(
        'Drets individuals i col·lectius',
        'Derechos individuales y colectivos',
        'Individuals: inamovibilitat en la condició de funcionari de carrera, exercici efectiu de les funcions del lloc, progressió en la carrera, retribucions, vacances i permisos, formació contínua, respecte a la intimitat i a la dignitat, protecció eficaç en matèria de seguretat i salut. Exercits col·lectivament: llibertat sindical, negociació col·lectiva, exercici de la vaga amb garantia dels serveis essencials, plantejament de conflictes col·lectius i reunió.',
        'Individuales: inamovilidad en la condición de funcionario de carrera, ejercicio efectivo de las funciones del puesto, progresión en la carrera, retribuciones, vacaciones y permisos, formación continua, respeto a la intimidad y a la dignidad, protección eficaz en materia de seguridad y salud. Ejercidos colectivamente: libertad sindical, negociación colectiva, ejercicio de la huelga con garantía de los servicios esenciales, planteamiento de conflictos colectivos y reunión.',
      ),
      explain(
        'Principis ètics i principis de conducta',
        'Principios éticos y principios de conducta',
        'Els principis ètics inclouen servir els interessos generals amb objectivitat, respectar la Constitució i la resta de l’ordenament, actuar amb lleialtat i bona fe, abstenir-se en els assumptes en què es tingui interès personal, no acceptar tractes de favor i guardar secret de les matèries reservades. Els principis de conducta inclouen tractar amb atenció i respecte la ciutadania, complir la jornada, obeir les instruccions dels superiors llevat que constitueixin una infracció manifesta de l’ordenament, i administrar amb austeritat els recursos públics.',
        'Los principios éticos incluyen servir a los intereses generales con objetividad, respetar la Constitución y el resto del ordenamiento, actuar con lealtad y buena fe, abstenerse en los asuntos en que se tenga interés personal, no aceptar tratos de favor y guardar secreto de las materias reservadas. Los principios de conducta incluyen tratar con atención y respeto a la ciudadanía, cumplir la jornada, obedecer las instrucciones de los superiores salvo que constituyan una infracción manifiesta del ordenamiento, y administrar con austeridad los recursos públicos.',
      ),
      pitfall(
        'El deure d’obediència no és absolut. No s’han d’obeir les instruccions que constitueixin una infracció manifesta, clara i terminant de l’ordenament jurídic. Aquesta excepció també apareix als principis bàsics d’actuació policial.',
        'El deber de obediencia no es absoluto. No deben obedecerse las instrucciones que constituyan una infracción manifiesta, clara y terminante del ordenamiento jurídico. Esta excepción también aparece en los principios básicos de actuación policial.',
      ),
      checkpoint(
        'Quan es pot desobeir una instrucció d’un superior?',
        '¿Cuándo se puede desobedecer una instrucción de un superior?',
        'Quan constitueixi una infracció manifesta, clara i terminant de l’ordenament jurídic.',
        'Cuando constituya una infracción manifiesta, clara y terminante del ordenamiento jurídico.',
      ),
    ],
    [
      ref('rdleg-5-2015-trebep', 'art. 8, 14, 15, 52, 53 i 54'),
    ],
  ),

  lesson(
    9,
    'Incompatibilitats: un sol lloc al sector públic',
    'Incompatibilidades: un solo puesto en el sector público',
    4,
    [
      idea(
        'La regla és senzilla i severa: el personal al servei de les administracions públiques només pot ocupar un lloc de treball al sector públic. La resta són excepcions taxades que cal autoritzar.',
        'La regla es sencilla y severa: el personal al servicio de las administraciones públicas solo puede ocupar un puesto de trabajo en el sector público. El resto son excepciones tasadas que hay que autorizar.',
      ),
      explain(
        'Activitats públiques',
        'Actividades públicas',
        'No es pot percebre més d’una remuneració amb càrrec a pressupostos públics, ni exercir activitats que impedeixin o menyscabin l’estricte compliment dels deures o comprometin la imparcialitat o la independència. Les excepcions —com la docència o la investigació— exigeixen autorització expressa de compatibilitat.',
        'No se puede percibir más de una remuneración con cargo a presupuestos públicos, ni ejercer actividades que impidan o menoscaben el estricto cumplimiento de los deberes o comprometan la imparcialidad o la independencia. Las excepciones —como la docencia o la investigación— exigen autorización expresa de compatibilidad.',
      ),
      explain(
        'Activitats privades',
        'Actividades privadas',
        'Cal reconeixement previ de compatibilitat. En cap cas es pot autoritzar l’activitat privada relacionada amb assumptes en què la persona intervingui o hagi intervingut els dos últims anys, ni la que impliqui representar o defensar interessos particulars davant la mateixa administració. El reconeixement de compatibilitat no pot modificar la jornada ni l’horari.',
        'Se necesita reconocimiento previo de compatibilidad. En ningún caso se puede autorizar la actividad privada relacionada con asuntos en que la persona intervenga o haya intervenido los dos últimos años, ni la que implique representar o defender intereses particulares ante la misma administración. El reconocimiento de compatibilidad no puede modificar la jornada ni el horario.',
      ),
      explain(
        'El límit del complement específic',
        'El límite del complemento específico',
        'No es pot autoritzar la compatibilitat per a activitats privades quan la retribució per complement específic o concepte equiparable supera el trenta per cent de la retribució bàsica, exclosos els conceptes que tinguin origen en l’antiguitat.',
        'No se puede autorizar la compatibilidad para actividades privadas cuando la retribución por complemento específico o concepto equiparable supera el treinta por ciento de la retribución básica, excluidos los conceptos que tengan su origen en la antigüedad.',
      ),
      example(
        'Un agent que vol treballar de vigilant de seguretat privada els caps de setmana topa amb dos problemes: el límit del complement específic i la relació directa de l’activitat amb la seva funció pública. És el cas típic de compatibilitat denegada.',
        'Un agente que quiere trabajar de vigilante de seguridad privada los fines de semana choca con dos problemas: el límite del complemento específico y la relación directa de la actividad con su función pública. Es el caso típico de compatibilidad denegada.',
      ),
      pitfall(
        'L’autorització de compatibilitat no és un tràmit automàtic ni una comunicació: és un acte administratiu previ i exprés. Començar l’activitat abans de tenir-la és, en si mateix, una infracció.',
        'La autorización de compatibilidad no es un trámite automático ni una comunicación: es un acto administrativo previo y expreso. Empezar la actividad antes de tenerla es, en sí mismo, una infracción.',
      ),
      checkpoint(
        'Quin percentatge del complement específic bloqueja la compatibilitat privada?',
        '¿Qué porcentaje del complemento específico bloquea la compatibilidad privada?',
        'Quan supera el 30 % de la retribució bàsica, exclosa l’antiguitat.',
        'Cuando supera el 30 % de la retribución básica, excluida la antigüedad.',
      ),
    ],
    [
      ref('llei-53-1984-incompat', 'art. 1, 3, 11, 12, 14 i 16'),
    ],
  ),

  lesson(
    10,
    'Pressupostos i hisendes locals',
    'Presupuestos y haciendas locales',
    6,
    [
      idea(
        'El pressupost municipal és l’expressió xifrada, conjunta i sistemàtica de les obligacions que l’ajuntament pot reconèixer com a màxim i dels drets que preveu liquidar durant l’exercici. És anual i coincideix amb l’any natural.',
        'El presupuesto municipal es la expresión cifrada, conjunta y sistemática de las obligaciones que el ayuntamiento puede reconocer como máximo y de los derechos que prevé liquidar durante el ejercicio. Es anual y coincide con el año natural.',
      ),
      explain(
        'Els recursos de la hisenda local',
        'Los recursos de la hacienda local',
        'Ingressos de dret privat, tributs propis (taxes, contribucions especials i impostos), recàrrecs sobre impostos d’altres administracions, participacions en els tributs de l’Estat i de les comunitats autònomes, subvencions, preus públics, operacions de crèdit, multes i sancions i altres prestacions de dret públic.',
        'Ingresos de derecho privado, tributos propios (tasas, contribuciones especiales e impuestos), recargos sobre impuestos de otras administraciones, participaciones en los tributos del Estado y de las comunidades autónomas, subvenciones, precios públicos, operaciones de crédito, multas y sanciones y otras prestaciones de derecho público.',
      ),
      compare(
        'Impostos municipals',
        'Impuestos municipales',
        'Obligatoris',
        'Obligatorios',
        'Potestatius',
        'Potestativos',
        [
          ['Quins són', 'Cuáles son', 'IBI, IAE i IVTM', 'IBI, IAE e IVTM', 'ICIO i IIVTNU (plusvàlua)', 'ICIO e IIVTNU (plusvalía)'],
          ['Els ha d’exigir el municipi', 'Los debe exigir el municipio', 'Sí, sempre', 'Sí, siempre', 'Només si els estableix per ordenança fiscal', 'Solo si los establece por ordenanza fiscal'],
        ],
      ),
      explain(
        'Tramitació del pressupost',
        'Tramitación del presupuesto',
        'El president de la corporació forma el pressupost general, l’informa la Intervenció i es remet al ple abans del 15 d’octubre. Després de l’aprovació inicial s’exposa al públic quinze dies per a reclamacions i s’aprova definitivament abans del 31 de desembre. Si l’1 de gener no està aprovat, es prorroga automàticament el de l’exercici anterior amb els seus crèdits inicials.',
        'El presidente de la corporación forma el presupuesto general, lo informa la Intervención y se remite al pleno antes del 15 de octubre. Tras la aprobación inicial se expone al público quince días para reclamaciones y se aprueba definitivamente antes del 31 de diciembre. Si el 1 de enero no está aprobado, se prorroga automáticamente el del ejercicio anterior con sus créditos iniciales.',
      ),
      explain(
        'Principis pressupostaris',
        'Principios presupuestarios',
        'Anualitat, unitat, universalitat, especialitat (qualitativa, quantitativa i temporal), no afectació dels ingressos, publicitat, equilibri i estabilitat pressupostària. El pressupost s’ha d’aprovar sense dèficit inicial.',
        'Anualidad, unidad, universalidad, especialidad (cualitativa, cuantitativa y temporal), no afectación de los ingresos, publicidad, equilibrio y estabilidad presupuestaria. El presupuesto debe aprobarse sin déficit inicial.',
      ),
      pitfall(
        'La taxa i el preu públic no són el mateix. La taxa es paga per un servei de recepció obligatòria o de monopoli públic; el preu públic, per un servei que també presta el sector privat i que es rep voluntàriament.',
        'La tasa y el precio público no son lo mismo. La tasa se paga por un servicio de recepción obligatoria o de monopolio público; el precio público, por un servicio que también presta el sector privado y que se recibe voluntariamente.',
      ),
      checkpoint(
        'Què passa si el pressupost no està aprovat l’1 de gener?',
        '¿Qué pasa si el presupuesto no está aprobado el 1 de enero?',
        'Es prorroga automàticament el de l’exercici anterior amb els seus crèdits inicials.',
        'Se prorroga automáticamente el del ejercicio anterior con sus créditos iniciales.',
      ),
    ],
    [
      ref('rdleg-2-2004-trlrhl', 'art. 2, 20, 41, 59, 162, 164, 168 i 169'),
    ],
  ),
]
