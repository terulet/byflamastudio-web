/** Microlliçons dels temes 16 a 20 (bloc Institucions i Administració). */
import type { Lesson } from '../../../schemas/index.ts'
import { checkpoint, compare, example, explain, idea, lesson, pitfall, ref } from '../authoring.ts'

export const LESSONS_16_20: Lesson[] = [
  lesson(
    16,
    'Les fases del procediment administratiu',
    'Las fases del procedimiento administrativo',
    5,
    [
      idea(
        'Tot procediment recorre quatre fases: iniciació, ordenació, instrucció i finalització. Saber en quina fase encaixa cada tràmit resol la meitat de les preguntes del tema.',
        'Todo procedimiento recorre cuatro fases: iniciación, ordenación, instrucción y finalización. Saber en qué fase encaja cada trámite resuelve la mitad de las preguntas del tema.',
      ),
      explain(
        'Iniciació',
        'Iniciación',
        'D’ofici o a sol·licitud de la persona interessada. L’inici d’ofici pot venir per pròpia iniciativa de l’òrgan, per ordre superior, per petició raonada d’altres òrgans o per denúncia. Abans d’iniciar es poden obrir actuacions prèvies per determinar si escau, i es poden adoptar mesures provisionals per assegurar l’eficàcia de la resolució.',
        'De oficio o a solicitud de la persona interesada. El inicio de oficio puede venir por propia iniciativa del órgano, por orden superior, por petición razonada de otros órganos o por denuncia. Antes de iniciar se pueden abrir actuaciones previas para determinar si procede, y se pueden adoptar medidas provisionales para asegurar la eficacia de la resolución.',
      ),
      explain(
        'Ordenació i instrucció',
        'Ordenación e instrucción',
        'L’ordenació impulsa el procediment d’ofici i en garanteix la celeritat: els tràmits del mateix nivell s’acorden simultàniament i s’ordenen per rigorós ordre d’incoació els assumptes homogenis. La instrucció aporta els elements de judici: al·legacions, prova, informes i el tràmit d’audiència. L’audiència s’ha de donar abans de redactar la proposta de resolució, per un termini no inferior a deu dies ni superior a quinze.',
        'La ordenación impulsa el procedimiento de oficio y garantiza su celeridad: los trámites del mismo nivel se acuerdan simultáneamente y se ordenan por riguroso orden de incoación los asuntos homogéneos. La instrucción aporta los elementos de juicio: alegaciones, prueba, informes y el trámite de audiencia. La audiencia debe darse antes de redactar la propuesta de resolución, por un plazo no inferior a diez días ni superior a quince.',
      ),
      explain(
        'Finalització',
        'Finalización',
        'Formes de finalització: la resolució, el desistiment, la renúncia al dret en què es fonamenta la sol·licitud, la declaració de caducitat i la impossibilitat material de continuar per causes sobrevingudes. També hi cap la terminació convencional mitjançant acords o pactes que no siguin contraris a l’ordenament ni versin sobre matèries no susceptibles de transacció.',
        'Formas de finalización: la resolución, el desistimiento, la renuncia al derecho en que se fundamenta la solicitud, la declaración de caducidad y la imposibilidad material de continuar por causas sobrevenidas. También cabe la terminación convencional mediante acuerdos o pactos que no sean contrarios al ordenamiento ni versen sobre materias no susceptibles de transacción.',
      ),
      pitfall(
        'Desistir i renunciar no és el mateix. Qui desisteix abandona la sol·licitud però conserva el dret i el pot tornar a exercir. Qui renuncia abandona el dret mateix i ja no el pot tornar a exercir.',
        'Desistir y renunciar no es lo mismo. Quien desiste abandona la solicitud pero conserva el derecho y puede volver a ejercerlo. Quien renuncia abandona el derecho mismo y ya no puede volver a ejercerlo.',
      ),
      checkpoint(
        'Quin és el termini del tràmit d’audiència?',
        '¿Cuál es el plazo del trámite de audiencia?',
        'No inferior a deu dies ni superior a quinze.',
        'No inferior a diez días ni superior a quince.',
      ),
    ],
    [
      ref('llei-39-2015-pac', 'art. 54 a 95 (iniciació, ordenació, instrucció i finalització)'),
    ],
  ),

  lesson(
    17,
    'Execució i revisió de l’acte administratiu',
    'Ejecución y revisión del acto administrativo',
    6,
    [
      idea(
        'Els actes administratius són executius: l’Administració els pot fer complir per si mateixa, sense demanar permís a un jutge. A canvi, la llei li imposa límits estrictes i un catàleg tancat de mitjans d’execució forçosa.',
        'Los actos administrativos son ejecutivos: la Administración puede hacerlos cumplir por sí misma, sin pedir permiso a un juez. A cambio, la ley le impone límites estrictos y un catálogo cerrado de medios de ejecución forzosa.',
      ),
      explain(
        'Mitjans d’execució forçosa',
        'Medios de ejecución forzosa',
        'Constrenyiment sobre el patrimoni, execució subsidiària, multa coercitiva i compulsió sobre les persones. Cal advertiment previ i s’ha d’escollir sempre el mitjà menys restrictiu de la llibertat individual. La compulsió sobre les persones només és possible en els casos expressament previstos per la llei i respectant sempre la dignitat i els drets fonamentals.',
        'Apremio sobre el patrimonio, ejecución subsidiaria, multa coercitiva y compulsión sobre las personas. Se requiere apercibimiento previo y debe escogerse siempre el medio menos restrictivo de la libertad individual. La compulsión sobre las personas solo es posible en los casos expresamente previstos por la ley y respetando siempre la dignidad y los derechos fundamentales.',
      ),
      explain(
        'Revisió d’ofici',
        'Revisión de oficio',
        'L’Administració pot declarar d’ofici la nul·litat dels actes nuls de ple dret, en qualsevol moment i amb dictamen favorable previ de l’òrgan consultiu. Per anul·lar actes favorables que només siguin anul·lables ha de declarar-los lesius per a l’interès públic dins els quatre anys següents i impugnar-los davant la jurisdicció contenciosa administrativa. També pot revocar en qualsevol moment els actes desfavorables o de gravamen i rectificar els errors materials, de fet o aritmètics.',
        'La Administración puede declarar de oficio la nulidad de los actos nulos de pleno derecho, en cualquier momento y con dictamen favorable previo del órgano consultivo. Para anular actos favorables que solo sean anulables debe declararlos lesivos para el interés público dentro de los cuatro años siguientes e impugnarlos ante la jurisdicción contencioso-administrativa. También puede revocar en cualquier momento los actos desfavorables o de gravamen y rectificar los errores materiales, de hecho o aritméticos.',
      ),
      compare(
        'Recursos administratius',
        'Recursos administrativos',
        'Alçada',
        'Alzada',
        'Reposició (potestatiu)',
        'Reposición (potestativo)',
        [
          ['Contra què', 'Contra qué', 'Actes que NO posen fi a la via administrativa', 'Actos que NO ponen fin a la vía administrativa', 'Actes que SÍ posen fi a la via administrativa', 'Actos que SÍ ponen fin a la vía administrativa'],
          ['Termini d’interposició', 'Plazo de interposición', 'Un mes si l’acte és exprés; tres mesos si és presumpte', 'Un mes si el acto es expreso; tres meses si es presunto', 'Un mes si l’acte és exprés; tres mesos si és presumpte', 'Un mes si el acto es expreso; tres meses si es presunto'],
          ['Termini per resoldre', 'Plazo para resolver', 'Tres mesos', 'Tres meses', 'Un mes', 'Un mes'],
          ['Silenci', 'Silencio', 'Desestimatori', 'Desestimatorio', 'Desestimatori', 'Desestimatorio'],
        ],
      ),
      explain(
        'Recurs extraordinari de revisió',
        'Recurso extraordinario de revisión',
        'Cap contra actes ferms en via administrativa i només per motius taxats: error de fet que resulti dels mateixos documents de l’expedient, aparició de documents essencials posteriors o d’impossible aportació, documents o testimonis declarats falsos per sentència judicial ferma, o resolució dictada com a conseqüència de prevaricació, suborn, violència o maquinació fraudulenta.',
        'Cabe contra actos firmes en vía administrativa y solo por motivos tasados: error de hecho que resulte de los propios documentos del expediente, aparición de documentos esenciales posteriores o de imposible aportación, documentos o testimonios declarados falsos por sentencia judicial firme, o resolución dictada como consecuencia de prevaricación, cohecho, violencia o maquinación fraudulenta.',
      ),
      pitfall(
        'Contra les sancions municipals de trànsit no cal esgotar l’alçada: acaben la via administrativa i el que cap és el recurs potestatiu de reposició o directament el contenciós administratiu. Comprova sempre què diu el peu de recurs de la notificació.',
        'Contra las sanciones municipales de tráfico no hay que agotar la alzada: acaban la vía administrativa y lo que cabe es el recurso potestativo de reposición o directamente el contencioso-administrativo. Comprueba siempre lo que dice el pie de recurso de la notificación.',
      ),
      checkpoint(
        'Quins són els quatre mitjans d’execució forçosa?',
        '¿Cuáles son los cuatro medios de ejecución forzosa?',
        'Constrenyiment sobre el patrimoni, execució subsidiària, multa coercitiva i compulsió sobre les persones.',
        'Apremio sobre el patrimonio, ejecución subsidiaria, multa coercitiva y compulsión sobre las personas.',
      ),
    ],
    [
      ref('llei-39-2015-pac', 'art. 98 a 126 (executivitat, execució forçosa, revisió i recursos)'),
    ],
  ),

  lesson(
    18,
    'Transparència i accés a la informació pública',
    'Transparencia y acceso a la información pública',
    5,
    [
      idea(
        'La transparència té dues cares: la publicitat activa —el que l’Administració ha de publicar sense que ningú ho demani— i el dret d’accés —el que qualsevol persona pot demanar i obtenir.',
        'La transparencia tiene dos caras: la publicidad activa —lo que la Administración debe publicar sin que nadie lo pida— y el derecho de acceso —lo que cualquier persona puede pedir y obtener.',
      ),
      explain(
        'Publicitat activa',
        'Publicidad activa',
        'Les administracions han de publicar de manera periòdica i actualitzada informació institucional, organitzativa i de planificació; informació de rellevància jurídica (normes, projectes i consultes públiques); i informació econòmica, pressupostària i estadística, incloent-hi contractes, convenis, subvencions, pressupostos, comptes anuals i retribucions dels alts càrrecs.',
        'Las administraciones deben publicar de manera periódica y actualizada información institucional, organizativa y de planificación; información de relevancia jurídica (normas, proyectos y consultas públicas); e información económica, presupuestaria y estadística, incluyendo contratos, convenios, subvenciones, presupuestos, cuentas anuales y retribuciones de los altos cargos.',
      ),
      explain(
        'Dret d’accés',
        'Derecho de acceso',
        'Qualsevol persona hi té dret, sense necessitat de motivar la sol·licitud, tot i que es pot exposar el motiu i això es tindrà en compte. La sol·licitud no es pot rebutjar per no motivar-la. La resolució s’ha de dictar i notificar en el termini màxim d’un mes des de la recepció. A Catalunya, la Llei 19/2014 reforça el dret i crea la Comissió de Garantia del Dret d’Accés a la Informació Pública com a òrgan de reclamació.',
        'Cualquier persona tiene derecho, sin necesidad de motivar la solicitud, aunque puede exponer el motivo y eso se tendrá en cuenta. La solicitud no puede rechazarse por no motivarla. La resolución debe dictarse y notificarse en el plazo máximo de un mes desde la recepción. En Cataluña, la Ley 19/2014 refuerza el derecho y crea la Comisión de Garantía del Derecho de Acceso a la Información Pública como órgano de reclamación.',
      ),
      explain(
        'Límits',
        'Límites',
        'L’accés es pot limitar quan suposi un perjudici per a la seguretat nacional, la defensa, les relacions exteriors, la seguretat pública, la prevenció i investigació d’il·lícits penals, administratius o disciplinaris, la igualtat de les parts en un procés judicial, les funcions administratives de vigilància i inspecció, els interessos econòmics i comercials, la política econòmica i monetària, el secret professional, la confidencialitat en els processos de decisió i la protecció del medi ambient. L’aplicació dels límits ha de ser justificada i proporcionada.',
        'El acceso puede limitarse cuando suponga un perjuicio para la seguridad nacional, la defensa, las relaciones exteriores, la seguridad pública, la prevención e investigación de ilícitos penales, administrativos o disciplinarios, la igualdad de las partes en un proceso judicial, las funciones administrativas de vigilancia e inspección, los intereses económicos y comerciales, la política económica y monetaria, el secreto profesional, la confidencialidad en los procesos de decisión y la protección del medio ambiente. La aplicación de los límites debe ser justificada y proporcionada.',
      ),
      pitfall(
        'Que la informació estigui relacionada amb una investigació policial no la fa automàticament secreta. Cal justificar el perjudici concret i, si es pot, donar accés parcial ocultant només allò protegit.',
        'Que la información esté relacionada con una investigación policial no la hace automáticamente secreta. Hay que justificar el perjuicio concreto y, si se puede, dar acceso parcial ocultando solo lo protegido.',
      ),
      checkpoint(
        'Cal motivar una sol·licitud d’accés a la informació pública?',
        '¿Hay que motivar una solicitud de acceso a la información pública?',
        'No. Es pot exposar el motiu, però la sol·licitud no es pot rebutjar per no fer-ho.',
        'No. Se puede exponer el motivo, pero la solicitud no puede rechazarse por no hacerlo.',
      ),
    ],
    [
      ref('llei-19-2013-transp', 'art. 5 a 24 (publicitat activa, dret d’accés i límits)'),
      ref('llei-19-2014-transp-cat', 'dret d’accés i Comissió de Garantia del Dret d’Accés'),
    ],
  ),

  lesson(
    19,
    'Ciberseguretat: reptes i autoprotecció',
    'Ciberseguridad: retos y autoprotección',
    4,
    [
      idea(
        'La ciberseguretat ja no és un assumpte tècnic apartat: la major part dels incidents comencen amb una persona que fa clic on no toca. Per a la policia local, és alhora un risc intern i un tipus de delicte que arriba a la comissaria.',
        'La ciberseguridad ya no es un asunto técnico apartado: la mayoría de los incidentes empiezan con una persona que hace clic donde no debe. Para la policía local, es a la vez un riesgo interno y un tipo de delito que llega a la comisaría.',
      ),
      explain(
        'Amenaces més freqüents',
        'Amenazas más frecuentes',
        'Pesca d’identitat (phishing) per correu, per SMS (smishing) o per telèfon (vishing); programari de segrest (ransomware) que xifra la informació i demana rescat; programari maliciós en general; suplantació d’identitat; frau del CEO; i enginyeria social, que explota la confiança i la pressa més que no pas cap fallada tècnica.',
        'Pesca de identidad (phishing) por correo, por SMS (smishing) o por teléfono (vishing); programa de secuestro (ransomware) que cifra la información y pide rescate; programa malicioso en general; suplantación de identidad; fraude del CEO; e ingeniería social, que explota la confianza y la prisa más que ningún fallo técnico.',
      ),
      explain(
        'L’Agència de Ciberseguretat de Catalunya',
        'La Agencia de Ciberseguridad de Cataluña',
        'És l’organisme de la Generalitat encarregat d’executar les polítiques públiques en matèria de ciberseguretat: prevenir i respondre incidents, garantir la seguretat de les xarxes i els sistemes d’informació del sector públic, i difondre la cultura de la ciberseguretat entre la ciutadania, les empreses i les administracions locals.',
        'Es el organismo de la Generalitat encargado de ejecutar las políticas públicas en materia de ciberseguridad: prevenir y responder a incidentes, garantizar la seguridad de las redes y los sistemas de información del sector público, y difundir la cultura de la ciberseguridad entre la ciudadanía, las empresas y las administraciones locales.',
      ),
      explain(
        'Mesures d’autoprotecció',
        'Medidas de autoprotección',
        'Contrasenyes llargues i úniques per a cada servei, gestor de contrasenyes, verificació en dos passos, actualitzacions al dia, còpies de seguretat periòdiques i comprovades, desconfiança davant qualsevol missatge que exigeixi urgència o secret, i mai reutilitzar credencials professionals en serveis personals.',
        'Contraseñas largas y únicas para cada servicio, gestor de contraseñas, verificación en dos pasos, actualizaciones al día, copias de seguridad periódicas y comprobadas, desconfianza ante cualquier mensaje que exija urgencia o secreto, y nunca reutilizar credenciales profesionales en servicios personales.',
      ),
      example(
        'Una persona arriba a la comissaria de Roses després de pagar per un lloguer d’estiu que no existia. La feina de l’agent és preservar les proves: captures amb data i URL completa, justificants de transferència, converses senceres i dades del compte de destinació. Esborrar o reenviar sense preservar destrueix la traça.',
        'Una persona llega a la comisaría de Roses después de pagar por un alquiler de verano que no existía. El trabajo del agente es preservar las pruebas: capturas con fecha y URL completa, justificantes de transferencia, conversaciones enteras y datos de la cuenta de destino. Borrar o reenviar sin preservar destruye la traza.',
      ),
      pitfall(
        'La verificació en dos passos per SMS és millor que res, però és la més feble: el segrest de la línia (SIM swapping) la burla. Sempre que es pugui, cal fer servir aplicació d’autenticació o clau física.',
        'La verificación en dos pasos por SMS es mejor que nada, pero es la más débil: el secuestro de la línea (SIM swapping) la burla. Siempre que se pueda, hay que usar aplicación de autenticación o llave física.',
      ),
      checkpoint(
        'Quin és el vector d’entrada més habitual dels incidents?',
        '¿Cuál es el vector de entrada más habitual de los incidentes?',
        'L’enginyeria social, i molt especialment la pesca d’identitat per correu.',
        'La ingeniería social, y muy especialmente la pesca de identidad por correo.',
      ),
    ],
    [
      ref('agencia-ciberseguretat-catalunya', 'funcions i recomanacions d’autoprotecció'),
    ],
  ),

  lesson(
    20,
    'Protecció de dades',
    'Protección de datos',
    6,
    [
      idea(
        'La protecció de dades és un dret fonamental autònom, diferent del dret a la intimitat. L’article 18.4 de la Constitució en va posar la llavor i el Reglament general de protecció de dades el desplega.',
        'La protección de datos es un derecho fundamental autónomo, distinto del derecho a la intimidad. El artículo 18.4 de la Constitución puso la semilla y el Reglamento general de protección de datos lo desarrolla.',
      ),
      explain(
        'Els principis del tractament',
        'Los principios del tratamiento',
        'Licitud, lleialtat i transparència; limitació de la finalitat; minimització de dades; exactitud; limitació del termini de conservació; integritat i confidencialitat; i responsabilitat proactiva, que obliga el responsable no només a complir sinó a poder demostrar que compleix.',
        'Licitud, lealtad y transparencia; limitación de la finalidad; minimización de datos; exactitud; limitación del plazo de conservación; integridad y confidencialidad; y responsabilidad proactiva, que obliga al responsable no solo a cumplir sino a poder demostrar que cumple.',
      ),
      explain(
        'Bases de legitimació',
        'Bases de legitimación',
        'Consentiment de la persona interessada, execució d’un contracte, compliment d’una obligació legal, protecció d’interessos vitals, compliment d’una missió d’interès públic o exercici de poders públics, i interès legítim del responsable. En l’actuació policial la base habitual no és el consentiment, sinó el compliment d’una obligació legal i l’exercici de poders públics.',
        'Consentimiento de la persona interesada, ejecución de un contrato, cumplimiento de una obligación legal, protección de intereses vitales, cumplimiento de una misión de interés público o ejercicio de poderes públicos, e interés legítimo del responsable. En la actuación policial la base habitual no es el consentimiento, sino el cumplimiento de una obligación legal y el ejercicio de poderes públicos.',
      ),
      explain(
        'Drets de les persones',
        'Derechos de las personas',
        'Accés, rectificació, supressió (dret a l’oblit), limitació del tractament, portabilitat, oposició i dret a no ser objecte de decisions automatitzades amb efectes jurídics. Es coneixen com a drets ARSULIPO o, més senzillament, «drets de l’article 15 al 22».',
        'Acceso, rectificación, supresión (derecho al olvido), limitación del tratamiento, portabilidad, oposición y derecho a no ser objeto de decisiones automatizadas con efectos jurídicos. Se conocen como derechos ARSULIPO o, más sencillamente, «derechos del artículo 15 al 22».',
      ),
      pitfall(
        'Els tractaments amb finalitats de prevenció, investigació, detecció o enjudiciament d’infraccions penals NO es regeixen pel règim general del Reglament, sinó per la normativa específica que transposa la Directiva (UE) 2016/680. Confondre els dos règims és un error freqüent.',
        'Los tratamientos con fines de prevención, investigación, detección o enjuiciamiento de infracciones penales NO se rigen por el régimen general del Reglamento, sino por la normativa específica que traspone la Directiva (UE) 2016/680. Confundir los dos regímenes es un error frecuente.',
      ),
      example(
        'Gravar amb la càmera del vehicle policial no és lliure: cal una base legal, informació sobre el tractament quan sigui possible, un termini de conservació limitat i un control d’accés a les imatges. Publicar-les a xarxes socials seria un tractament nou i, gairebé sempre, il·lícit.',
        'Grabar con la cámara del vehículo policial no es libre: hace falta una base legal, información sobre el tratamiento cuando sea posible, un plazo de conservación limitado y un control de acceso a las imágenes. Publicarlas en redes sociales sería un tratamiento nuevo y, casi siempre, ilícito.',
      ),
      checkpoint(
        'Quina base de legitimació fa servir habitualment la policia?',
        '¿Qué base de legitimación usa habitualmente la policía?',
        'El compliment d’una obligació legal i l’exercici de poders públics, no el consentiment.',
        'El cumplimiento de una obligación legal y el ejercicio de poderes públicos, no el consentimiento.',
      ),
    ],
    [
      ref('rgpd-2016-679', 'art. 5, 6 i 15 a 22'),
      ref('lo-3-2018-lopdgdd', 'disposicions generals i drets'),
      ref('ce-1978', 'art. 18.4'),
    ],
  ),
]
