/**
 * Inventari de les fonts normatives que encara no s'han pogut baixar.
 *
 * Aquest script **no toca contingut**: llegeix el manifest i el banc, els creua
 * i escriu dos artefactes que serveixen per preparar un paquet offline de
 * fonts, de la mateixa manera que es van preparar els dos paquets anteriors:
 *
 *     artifacts/rescat-fonts-normatives.json   ← llegible per una màquina
 *     artifacts/rescat-fonts-normatives.md     ← llegible per una persona
 *
 *     npm run sources:inventory
 *
 * Per què existeix
 * ───────────────
 *
 * Les 43 fonts pendents són la causa arrel de dues coses alhora: 43 referències
 * del banc segueixen en `pending-source-verification`, i les 189 preguntes
 * oficials no poden portar una explicació jurídica de debò. Qui tingui accés a
 * la xarxa ha de poder baixar-les **sense haver de reconstruir aquest context**:
 * quina norma exacta, quins articles, per demostrar quina afirmació i per a
 * quins consumidors.
 *
 * D'on surt cada dada
 * ───────────────────
 *
 * Del manifest i del banc surten els consumidors, els localitzadors, els temes,
 * les lliçons i les preguntes oficials que cada font podria explicar. De la
 * taula `ENRICHMENT` d'aquest fitxer surt el que el manifest no desa: quin text
 * consolidat cal, quines alternatives oficials hi ha i què ha de contenir el
 * fitxer baixat perquè valgui. Aquesta taula es revisa a mà, com el mapa de
 * classificació dels quadernets.
 *
 * El que aquest script **no** fa
 * ──────────────────────────────
 *
 *   - No baixa res. Aquest entorn no arriba a cap d'aquests dominis.
 *   - No inventa URL. Les canòniques surten del manifest; les derivades van
 *     marcades com a derivades perquè qui baixi les comprovi.
 *   - No canvia cap pregunta, cap clau, cap `topicId` ni cap explicació: ho
 *     comprova ell mateix contra git i falla si el contingut s'ha mogut.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { allowedHostsFor } from './lib/official-hosts.ts'
import { fileURLToPath } from 'node:url'
import { ROSES_PACK } from '../content/municipalities/roses/index.ts'
import manifestJson from '../sources/source-manifest.json' with { type: 'json' }
import type { Question, Source } from '../content/schemas/index.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const JSON_OUT = `${ROOT}artifacts/rescat-fonts-normatives.json`
const MD_OUT = `${ROOT}artifacts/rescat-fonts-normatives.md`
const GENERATED_ON = '2026-08-24'

type Alternative = {
  url: string
  kind: 'canonical' | 'pdf' | 'index' | 'gazette'
  /** Construïda a partir d'un patró conegut i **no** comprovada des d'aquí. */
  derived: boolean
  note?: string
}

interface Enrichment {
  /** Norma o document exacte, tal com s'ha de demanar. */
  document: string
  /** Identificador legal: llei, reial decret, decret, ordre o acord. */
  legalId: string
  /** Butlletí on es va publicar, quan es coneix amb certesa. */
  gazette?: string
  consolidation: 'consolidat' | 'text-original' | 'pagina-viva' | 'recopilacio'
  consolidationNote?: string
  format: 'pdf' | 'html' | 'both'
  /** Llengua del text oficial que es baixarà: decideix les comprovacions. */
  lang: 'es' | 'ca'
  alternatives: Alternative[]
  /** Què cal del document, més enllà dels articles que citen les referències. */
  needed: string
  filename: string
  mime: string
  minBytes: number
  /**
   * Sostre de mida. Un mínim sol no detecta el fracàs silenciós: una descàrrega
   * del Reglament general de circulació va tornar 258 MB i va passar per «OK»
   * perquè superava el mínim. Un reglament consolidat no pesa això.
   */
  maxBytes?: number
  /**
   * Hosts oficials als quals la descàrrega pot acabar resolent legítimament.
   * El Portal Jurídic serveix els documents des del portal del DOGC: una
   * allowlist que només contingui el host de la URL canònica rebutja la
   * descàrrega bona.
   */
  resolvedHosts?: string[]
  /** Cadenes que el fitxer ha de contenir per no ser una pàgina d'error. */
  mustContain: string[]
  /** Entrades que aquest mateix text podria cobrir, sense canviar-ne el sourceId. */
  covers?: string[]
  dedupeNote?: string
}

/**
 * Taula revisada a mà. Cada entrada correspon a una font pendent.
 *
 * Les URL canòniques **no** es repeteixen aquí: surten del manifest. El que hi
 * ha és el que el manifest no desa i qui baixi necessita saber.
 */
const ENRICHMENT: Record<string, Enrichment> = {
  // ── Ajuntament de Roses ────────────────────────────────────────────────
  'roses-arxiu-examens': {
    document: 'Arxiu d’exàmens de proves d’oposició de l’Ajuntament de Roses',
    legalId: 'Pàgina institucional, sense identificador normatiu',
    consolidation: 'pagina-viva',
    format: 'html',
    lang: 'ca',
    alternatives: [
      { url: 'https://www.roses.cat/ajuntament/informacio-administrativa/oferta-publica-docupacio', kind: 'index', derived: false, note: 'Índex superior d’oferta pública, si canvia la ruta de l’arxiu.' },
    ],
    needed:
      'La llista completa d’enllaços als quadernets publicats. És el punt d’entrada per als 24 exàmens històrics que queden per transcriure; no sosté cap afirmació del banc.',
    filename: 'roses-arxiu-examens.html',
    mime: 'text/html',
    minBytes: 4_000,
    mustContain: ['roses', 'examen'],
  },
  'roses-ordenances-index': {
    document: 'Índex d’ordenances i bans municipals de Roses',
    legalId: 'Pàgina institucional, sense identificador normatiu',
    consolidation: 'pagina-viva',
    format: 'html',
    lang: 'ca',
    alternatives: [
      { url: 'https://www.roses.cat/ajuntament/informacio-administrativa', kind: 'index', derived: false, note: 'Índex superior d’informació administrativa.' },
    ],
    needed:
      'La relació d’ordenances vigents amb la seva data. Serveix per confirmar que les dues ordenances ja adoptades són les vigents i per delimitar àmbits i zones del terme municipal.',
    filename: 'roses-ordenances-index.html',
    mime: 'text/html',
    minBytes: 4_000,
    mustContain: ['ordenan'],
  },
  'roses-web-municipi': {
    document: 'Web municipal de Roses: municipi, nuclis, patrimoni i equipaments',
    legalId: 'Pàgina institucional, sense identificador normatiu',
    consolidation: 'pagina-viva',
    format: 'html',
    lang: 'ca',
    alternatives: [
      { url: 'https://www.roses.cat/el-municipi', kind: 'index', derived: true, note: 'Secció «El municipi»; comprovar la ruta exacta en baixar.' },
    ],
    needed:
      'Les seccions de geografia, nuclis i urbanitzacions, patrimoni (Ciutadella, Castell de la Trinitat, patrimoni megalític) i equipaments. És la font del tema 31, l’únic tema de coneixement local del temari.',
    filename: 'roses-web-municipi.html',
    mime: 'text/html',
    minBytes: 8_000,
    mustContain: ['Roses'],
  },
  'roses-tramits-animals': {
    document: 'Tràmit municipal de llicència per a la tinença i conducció d’animals potencialment perillosos',
    legalId: 'Pàgina institucional, sense identificador normatiu',
    consolidation: 'pagina-viva',
    format: 'html',
    lang: 'ca',
    alternatives: [
      { url: 'https://www.roses.cat/tramits', kind: 'index', derived: false, note: 'Índex de tràmits municipals.' },
    ],
    needed: 'Els requisits municipals de la llicència: documentació, vigència i taxa.',
    filename: 'roses-tramits-animals.html',
    mime: 'text/html',
    minBytes: 3_000,
    mustContain: ['llic'],
  },

  // ── BOE: constitucional i institucional ────────────────────────────────
  'ce-1978': {
    document: 'Constitució espanyola de 1978 (text consolidat)',
    legalId: 'Constitució espanyola',
    gazette: 'BOE núm. 311, de 29/12/1978 (BOE-A-1978-31229)',
    consolidation: 'consolidat',
    consolidationNote: 'Inclou les reformes de 1992 (art. 13.2) i 2011 (art. 135).',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/pdf/1978/BOE-A-1978-31229-consolidado.pdf', kind: 'pdf', derived: true, note: 'Patró de PDF consolidat del BOE a partir de l’identificador BOE-A.' },
      { url: 'https://www.boe.es/eli/es/c/1978/12/27/(1)/con', kind: 'canonical', derived: true, note: 'Fitxa ELI de la Constitució.' },
    ],
    needed:
      'Text íntegre. És la font més consumida del banc: títol preliminar, títol I sencer (art. 10-55), títol VI (poder judicial), títol VIII (organització territorial), títol IX (Tribunal Constitucional) i títol X (reforma).',
    filename: 'ce-1978.pdf',
    mime: 'application/pdf',
    minBytes: 200_000,
    mustContain: ['Constitución', 'Artículo 1', 'Artículo 159'],
  },
  'lo-6-2006-eac': {
    document: 'Estatut d’autonomia de Catalunya de 2006 (text consolidat)',
    legalId: 'Llei orgànica 6/2006, de 19 de juliol',
    consolidation: 'consolidat',
    consolidationNote:
      'El text consolidat recull la STC 31/2010: cal el text vigent, no el publicat el 2006.',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.parlament.cat/document/cataleg/48089.pdf', kind: 'pdf', derived: true, note: 'Edició del Parlament de Catalunya; comprovar la vigència en baixar.' },
      { url: 'https://portaljuridic.gencat.cat/eli/es-ct/lo/2006/07/19/6', kind: 'canonical', derived: true, note: 'Fitxa ELI al Portal Jurídic, en català.' },
    ],
    needed:
      'Títol I (drets i deures), el capítol de drets i deures lingüístics, el títol de govern local, les institucions (Parlament, Presidència, Govern), el poder judicial a Catalunya i les competències en seguretat pública.',
    filename: 'lo-6-2006-eac.pdf',
    mime: 'application/pdf',
    minBytes: 200_000,
    mustContain: ['Estatuto', 'Artículo 6'],
  },
  'llei-7-1985-lrbrl': {
    document: 'Llei reguladora de les bases del règim local (text consolidat)',
    legalId: 'Llei 7/1985, de 2 d’abril',
    consolidation: 'consolidat',
    consolidationNote:
      'Molt modificada; la redacció de competències municipals (art. 25-26) depèn de la reforma de la Llei 27/2013.',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1985-5392', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Art. 1, 4, 11, 12, 15, 16, 20, 21.1.e, 22, 25, 26, 49, 65.2, 70.2, 84 i 139-141 (tipificació d’infraccions i límits de les multes).',
    filename: 'llei-7-1985-lrbrl.pdf',
    mime: 'application/pdf',
    minBytes: 150_000,
    mustContain: ['Bases del Régimen Local', 'Artículo 25'],
  },
  'rdleg-5-2015-trebep': {
    document: 'Text refós de la Llei de l’Estatut bàsic de l’empleat públic',
    legalId: 'Reial decret legislatiu 5/2015, de 30 d’octubre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11719', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Art. 8 (classes d’empleats públics), 14 i 15 (drets), i 52-54 (deures i codi de conducta).',
    filename: 'rdleg-5-2015-trebep.pdf',
    mime: 'application/pdf',
    minBytes: 150_000,
    mustContain: ['empleado público', 'Artículo 52'],
  },
  'llei-53-1984-incompat': {
    document: 'Llei d’incompatibilitats del personal al servei de les administracions públiques',
    legalId: 'Llei 53/1984, de 26 de desembre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1985-151', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Art. 1 (principi general), 3, 11 i 12 (activitats privades), 14 (autorització de compatibilitat) i 16 (excepcions).',
    filename: 'llei-53-1984-incompat.pdf',
    mime: 'application/pdf',
    minBytes: 60_000,
    mustContain: ['incompatibilidades', 'Artículo 14'],
  },
  'rdleg-2-2004-trlrhl': {
    document: 'Text refós de la Llei reguladora de les hisendes locals',
    legalId: 'Reial decret legislatiu 2/2004, de 5 de març',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Art. 2 (recursos), 20 i 41 (taxes i preus públics), 59 (tributs propis), 162, 164, 168 i 169 (pressupost: elaboració i aprovació).',
    filename: 'rdleg-2-2004-trlrhl.pdf',
    mime: 'application/pdf',
    minBytes: 200_000,
    mustContain: ['Haciendas Locales', 'Artículo 169'],
  },

  // ── BOE: procediment administratiu i transparència ─────────────────────
  'llei-39-2015-pac': {
    document: 'Llei del procediment administratiu comú de les administracions públiques',
    legalId: 'Llei 39/2015, d’1 d’octubre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Text íntegre: el banc en cita 34 localitzadors diferents, del títol preliminar als recursos (art. 3-13, 21-33, 34-52, 54-95, 98-126).',
    filename: 'llei-39-2015-pac.pdf',
    mime: 'application/pdf',
    minBytes: 200_000,
    mustContain: ['Procedimiento Administrativo Común', 'Artículo 21'],
  },
  'llei-40-2015-rjsp': {
    document: 'Llei de règim jurídic del sector públic',
    legalId: 'Llei 40/2015, d’1 d’octubre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Art. 23 i 24 (abstenció i recusació) i art. 25-31 (òrgans col·legiats).',
    filename: 'llei-40-2015-rjsp.pdf',
    mime: 'application/pdf',
    minBytes: 200_000,
    mustContain: ['Régimen Jurídico del Sector Público', 'Artículo 23'],
  },
  'llei-19-2013-transp': {
    document: 'Llei de transparència, accés a la informació pública i bon govern',
    legalId: 'Llei 19/2013, de 9 de desembre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-12887', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Art. 5-8 (publicitat activa), 14 i 16 (límits i accés parcial), 17 (sol·licitud) i 20 (resolució).',
    filename: 'llei-19-2013-transp.pdf',
    mime: 'application/pdf',
    minBytes: 100_000,
    mustContain: ['transparencia', 'Artículo 17'],
  },
  'lo-3-2018-lopdgdd': {
    document: 'Llei orgànica de protecció de dades personals i garantia dels drets digitals',
    legalId: 'Llei orgànica 3/2018, de 5 de desembre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Objecte i àmbit (art. 1-3), tractaments per obligació legal (art. 8) i drets (títol III).',
    filename: 'lo-3-2018-lopdgdd.pdf',
    mime: 'application/pdf',
    minBytes: 150_000,
    mustContain: ['Protección de Datos Personales', 'Artículo 8'],
  },
  'lo-7-2021-dades-policials': {
    document:
      'Llei orgànica de protecció de dades personals tractades per a fins de prevenció, detecció, investigació i enjudiciament d’infraccions penals',
    legalId: 'Llei orgànica 7/2021, de 26 de maig',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-8806', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Objecte i àmbit d’aplicació (art. 1-3) i finalitats del tractament (art. 5-6).',
    filename: 'lo-7-2021-dades-policials.pdf',
    mime: 'application/pdf',
    minBytes: 100_000,
    mustContain: ['infracciones penales', 'Artículo 1'],
  },

  // ── BOE: seguretat, penal i processal ──────────────────────────────────
  'lo-2-1986-fcs': {
    document: 'Llei orgànica de forces i cossos de seguretat',
    legalId: 'Llei orgànica 2/1986, de 13 de març',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1986-6859', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Art. 1 i 2 (concepte i cossos), 5 sencer (principis bàsics d’actuació, amb 5.1, 5.2.c i 5.2.d), 7 (Guàrdia Civil com a força armada), 9 (àmbits), 11 i 12 (funcions del CNP), 29-53 (policies locals, funcions compartides) i 48 (Consell de Política de Seguretat).',
    filename: 'lo-2-1986-fcs.pdf',
    mime: 'application/pdf',
    minBytes: 120_000,
    mustContain: ['Fuerzas y Cuerpos de Seguridad', 'Artículo 5'],
  },
  'lo-4-2015-psc': {
    document: 'Llei orgànica de protecció de la seguretat ciutadana',
    legalId: 'Llei orgànica 4/2015, de 30 de març',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-3442', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Art. 4 (principis), 15-20 (potestats: entrada, identificació, registres), 16 i 16.3 (identificació i termini màxim), 23 (reunions i manifestacions) i 35-39 (règim sancionador i quanties).',
    filename: 'lo-4-2015-psc.pdf',
    mime: 'application/pdf',
    minBytes: 120_000,
    mustContain: ['Seguridad Ciudadana', 'Artículo 16'],
  },
  'lo-10-1995-cp': {
    document: 'Codi penal (text consolidat)',
    legalId: 'Llei orgànica 10/1995, de 23 de novembre',
    consolidation: 'consolidat',
    consolidationNote:
      'El text consolidat ja incorpora la reforma de la LO 1/2015: la redacció vigent dels articles surt d’aquí.',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Art. 1-9 (garanties i aplicació de la llei penal), 10 (concepte de delicte), 33 (classes de penes), 234-242 (furts i robatoris), 250 (estafa agreujada) i 379-385 ter (seguretat viària).',
    filename: 'lo-10-1995-cp.pdf',
    mime: 'application/pdf',
    minBytes: 400_000,
    mustContain: ['Código Penal', 'Artículo 379', 'Artículo 237'],
  },
  'lo-1-2015-reforma-cp': {
    document: 'Llei orgànica de modificació del Codi penal de 2015 (text original)',
    legalId: 'Llei orgànica 1/2015, de 30 de març',
    consolidation: 'text-original',
    consolidationNote:
      'Aquí cal el text **original**, no el consolidat del Codi penal: el que se’n cita és el preàmbul i la supressió del llibre III, que el text consolidat ja no mostra com a tals.',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2015-3439', kind: 'canonical', derived: true, note: 'Fitxa del text original al BOE.' },
    ],
    needed:
      'Preàmbul (justificació de la reforma), la disposició derogatòria del llibre III (faltes), la presó permanent revisable i la reforma dels delictes contra el patrimoni.',
    filename: 'lo-1-2015-reforma-cp.pdf',
    mime: 'application/pdf',
    minBytes: 200_000,
    mustContain: ['Código Penal', 'preámbulo'],
  },
  'lecrim-1882': {
    document: 'Llei d’enjudiciament criminal (text consolidat)',
    legalId: 'Reial decret de 14 de setembre de 1882',
    gazette: 'Gaceta de Madrid, de 17/09/1882 (BOE-A-1882-6036)',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/pdf/1882/BOE-A-1882-6036-consolidado.pdf', kind: 'pdf', derived: true, note: 'Patró de PDF consolidat del BOE a partir de l’identificador BOE-A.' },
    ],
    needed:
      'Art. 490, 492, 496 i 520 (detenció i drets de la persona detinguda), 519 (presó provisional en peça separada), 544 ter sencer (ordre de protecció, apartats 1, 3, 4 i 7), la competència per a delictes lleus i el valor de l’atestat.',
    filename: 'lecrim-1882.pdf',
    mime: 'application/pdf',
    minBytes: 500_000,
    mustContain: ['Enjuiciamiento Criminal', 'Artículo 520', 'Artículo 544 ter'],
  },
  'lo-6-1984-habeas': {
    document: 'Llei orgànica reguladora del procediment d’habeas corpus',
    legalId: 'Llei orgànica 6/1984, de 24 de maig',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1984-11620', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Art. 1 (supòsits), 2 (competència), 3 (legitimació) i 7 (termini de 24 hores).',
    filename: 'lo-6-1984-habeas.pdf',
    mime: 'application/pdf',
    minBytes: 30_000,
    mustContain: ['Habeas Corpus', 'Artículo 3'],
  },
  'lo-5-2000-menors': {
    document: 'Llei orgànica reguladora de la responsabilitat penal dels menors',
    legalId: 'Llei orgànica 5/2000, de 12 de gener',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2000-641', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Exposició de motius, art. 1 i 3 (àmbit i menors de catorze anys), 7 (mesures) i 16-17 (detenció: 17.3 i 17.4, entrevista reservada i termini màxim).',
    filename: 'lo-5-2000-menors.pdf',
    mime: 'application/pdf',
    minBytes: 150_000,
    mustContain: ['responsabilidad penal de los menores', 'Artículo 17'],
  },
  'llei-27-2003-ordre-proteccio': {
    document: 'Llei reguladora de l’ordre de protecció de les víctimes de la violència domèstica',
    legalId: 'Llei 27/2003, de 31 de juliol',
    consolidation: 'consolidat',
    consolidationNote:
      'És una llei d’article únic: el contingut material viu a l’art. 544 ter de la LECrim, que introdueix.',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-15411', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Article únic i el procediment: competència judicial i presentació de la sol·licitud.',
    filename: 'llei-27-2003-ordre-proteccio.pdf',
    mime: 'application/pdf',
    minBytes: 20_000,
    mustContain: ['orden de protección'],
  },
  'lo-3-2007-igualtat': {
    document: 'Llei orgànica per a la igualtat efectiva de dones i homes',
    legalId: 'Llei orgànica 3/2007, de 22 de març',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6115', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Art. 3 (principi d’igualtat), 6 (discriminació directa i indirecta), 7 (assetjament sexual i per raó de sexe), 8 (discriminació per embaràs), 9 (indemnitat) i 11 i 51 (accions positives).',
    filename: 'lo-3-2007-igualtat.pdf',
    mime: 'application/pdf',
    minBytes: 200_000,
    mustContain: ['igualdad efectiva', 'Artículo 7'],
  },

  // ── BOE: trànsit i animals ─────────────────────────────────────────────
  'rdleg-6-2015-ltsv': {
    document: 'Text refós de la Llei sobre trànsit, circulació de vehicles de motor i seguretat viària',
    legalId: 'Reial decret legislatiu 6/2015, de 30 d’octubre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Immobilització i retirada de vehicles, tractament del vehicle residual o abandonat, obligació de sotmetre’s a les proves de detecció, presència de drogues i el règim sancionador (incloent-hi la prescripció de les infraccions).',
    filename: 'rdleg-6-2015-ltsv.pdf',
    mime: 'application/pdf',
    minBytes: 300_000,
    mustContain: ['Tráfico', 'Seguridad Vial'],
  },
  'rd-1428-2003-rgc': {
    document: 'Reglament general de circulació',
    legalId: 'Reial decret 1428/2003, de 21 de novembre',
    consolidation: 'consolidat',
    consolidationNote:
      'Es baixa en HTML a propòsit: el PDF consolidat d’aquest reglament passa dels 250 MB perquè hi van tots els senyals de trànsit en imatge. L’HTML porta el mateix articulat.',
    format: 'html',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Art. 20-28 (normes sobre begudes alcohòliques i estupefaents): taxes d’alcoholèmia, taxes especials de ciclistes i conductors novells, i pràctica de les proves de detecció.',
    filename: 'rd-1428-2003-rgc.html',
    mime: 'text/html',
    minBytes: 200_000,
    mustContain: ['Reglamento General de Circulación', 'Artículo 20'],
  },
  'rd-818-2009-rgcond': {
    document: 'Reglament general de conductors',
    legalId: 'Reial decret 818/2009, de 8 de maig',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2009-9481', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Art. 4-7 i annex: classes de permisos i llicències, vehicles que autoritza cada classe i edats mínimes (inclòs el D1).',
    filename: 'rd-818-2009-rgcond.pdf',
    mime: 'application/pdf',
    minBytes: 400_000,
    mustContain: ['Reglamento General de Conductores', 'permiso'],
  },
  'rd-2822-1998-rgv': {
    document: 'Reglament general de vehicles',
    legalId: 'Reial decret 2822/1998, de 23 de desembre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1999-1826', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Condicions tècniques i documentació dels vehicles, i la periodicitat de la inspecció tècnica (ITV) per categoria de vehicle.',
    filename: 'rd-2822-1998-rgv.pdf',
    mime: 'application/pdf',
    minBytes: 400_000,
    mustContain: ['Reglamento General de Vehículos'],
  },
  'llei-50-1999-app': {
    document: 'Llei sobre el règim jurídic de la tinença d’animals potencialment perillosos',
    legalId: 'Llei 50/1999, de 23 de desembre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1999-24419', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Art. 2 (concepte), 3 (llicència administrativa) i els requisits per obtenir-la.',
    filename: 'llei-50-1999-app.pdf',
    mime: 'application/pdf',
    minBytes: 40_000,
    mustContain: ['animales potencialmente peligrosos'],
  },
  'rd-287-2002-app': {
    document: 'Reglament de desplegament de la Llei 50/1999, d’animals potencialment perillosos',
    legalId: 'Reial decret 287/2002, de 22 de març',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2002-6016', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed:
      'Llista estatal de races (annex I), requisits de la llicència (art. 3) i mesures de seguretat a la via pública: corretja i morrió (art. 8).',
    filename: 'rd-287-2002-app.pdf',
    mime: 'application/pdf',
    minBytes: 40_000,
    mustContain: ['potencialmente peligrosos', 'Anexo'],
  },
  'llei-7-2023-benestar-animal': {
    document: 'Llei de protecció dels drets i el benestar dels animals',
    legalId: 'Llei 7/2023, de 28 de març',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-7936', kind: 'canonical', derived: true, note: 'Fitxa clàssica del BOE per identificador.' },
    ],
    needed: 'Obligacions generals de les persones titulars d’animals de companyia (títol II).',
    filename: 'llei-7-2023-benestar-animal.pdf',
    mime: 'application/pdf',
    minBytes: 150_000,
    mustContain: ['bienestar de los animales'],
  },

  // ── Portal Jurídic de Catalunya i Generalitat ──────────────────────────
  'llei-16-1991-policies-locals': {
    resolvedHosts: ['portaldogc.gencat.cat'],
    document: 'Llei de les policies locals de Catalunya (text consolidat)',
    legalId: 'Llei 16/1991, de 10 de juliol',
    consolidation: 'consolidat',
    consolidationNote:
      'Cal la versió consolidada: escales i categories i el règim disciplinari han estat modificats diverses vegades.',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=53539', kind: 'canonical', derived: true, note: 'Fitxa clàssica del Portal Jurídic; comprovar l’identificador en baixar.' },
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1991-19970', kind: 'gazette', derived: true, note: 'Versió castellana al BOE, per si el Portal Jurídic no és accessible.' },
    ],
    needed:
      'Naturalesa i dependència municipal dels cossos, àmbit territorial, art. 12 (policia judicial), 24 (escales i categories), 25 (categories segons població) i tot el règim disciplinari (classificació de faltes, catàleg i graduació de sancions, art. 51 sobre encobriment).',
    filename: 'llei-16-1991-policies-locals.pdf',
    mime: 'application/pdf',
    minBytes: 40_000,
    mustContain: ['policies locals', 'Article 25'],
  },
  'llei-4-2003-seguretat-publica': {
    resolvedHosts: ['portaldogc.gencat.cat'],
    document: 'Llei d’ordenació del sistema de seguretat pública de Catalunya (text consolidat)',
    legalId: 'Llei 4/2003, de 7 d’abril',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-9013', kind: 'gazette', derived: true, note: 'Versió castellana al BOE, per si el Portal Jurídic no és accessible.' },
    ],
    needed:
      'Art. 1-10: objecte, integrants del sistema (art. 3.1), funcions de l’alcalde (art. 4), Consell de Seguretat de Catalunya (art. 6), juntes locals de seguretat (art. 9, amb els convidats amb veu i sense vot), planificació i coordinació de policies locals.',
    filename: 'llei-4-2003-seguretat-publica.pdf',
    mime: 'application/pdf',
    minBytes: 15_000,
    mustContain: ['seguretat pública', 'Article 9'],
  },
  'decret-179-2015-disciplinari': {
    resolvedHosts: ['portaldogc.gencat.cat'],
    document: 'Decret pel qual s’aprova el Reglament del procediment disciplinari de les policies locals',
    legalId: 'Decret 179/2015, de 4 d’agost',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=700380', kind: 'canonical', derived: true, note: 'Fitxa clàssica del Portal Jurídic; comprovar l’identificador en baixar.' },
    ],
    needed: 'El reglament del procediment sencer i les mesures cautelars.',
    filename: 'decret-179-2015-disciplinari.pdf',
    mime: 'application/pdf',
    minBytes: 60_000,
    mustContain: ['disciplinari'],
  },
  'decret-151-1998-juntes': {
    resolvedHosts: ['portaldogc.gencat.cat'],
    document: 'Decret de regulació de les juntes locals de seguretat',
    legalId: 'Decret 151/1998, de 23 de juny',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://dogc.gencat.cat/ca/document-del-dogc/?documentId=194957', kind: 'gazette', derived: true, note: 'Publicació al DOGC; comprovar l’identificador en baixar.' },
    ],
    needed: 'Àmbit d’aplicació, composició i presidència, funcions, funcionament i coordinació de dispositius.',
    filename: 'decret-151-1998-juntes.pdf',
    mime: 'application/pdf',
    minBytes: 30_000,
    mustContain: ['juntes locals de seguretat'],
  },
  'llei-19-2014-transp-cat': {
    document: 'Llei de transparència, accés a la informació pública i bon govern de Catalunya',
    legalId: 'Llei 19/2014, de 29 de desembre',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-470', kind: 'gazette', derived: true, note: 'Versió castellana al BOE, per si el Portal Jurídic no és accessible.' },
    ],
    needed: 'El dret d’accés i la Comissió de Garantia del Dret d’Accés a la Informació Pública (GAIP).',
    filename: 'llei-19-2014-transp-cat.pdf',
    mime: 'application/pdf',
    minBytes: 100_000,
    mustContain: ['transparència'],
  },
  'llei-10-1999-gossos-cat': {
    resolvedHosts: ['portaldogc.gencat.cat'],
    document: 'Llei sobre la tinença de gossos considerats potencialment perillosos',
    legalId: 'Llei 10/1999, de 30 de juliol',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1999-17124', kind: 'gazette', derived: true, note: 'Versió castellana al BOE, per si el Portal Jurídic no és accessible.' },
    ],
    needed:
      'Art. 1-2 (gossos considerats potencialment perillosos i llista catalana de races), identificació i registre censal, art. 7 (infraccions lleus) i el règim propi respecte de la llei estatal.',
    filename: 'llei-10-1999-gossos-cat.pdf',
    mime: 'application/pdf',
    minBytes: 12_000,
    mustContain: ['gossos', 'perillosos'],
  },
  'codi-etic-policia-catalunya': {
    document: 'Codi d’ètica de la policia de Catalunya',
    legalId: 'Acord GOV/25/2015, de 24 de febrer',
    consolidation: 'text-original',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=685998', kind: 'canonical', derived: true, note: 'Publicació de l’Acord GOV/25/2015 al Portal Jurídic; comprovar l’identificador.' },
    ],
    needed: 'El text de l’Acord GOV/25/2015: principis i pautes de conducta, amb integritat i imparcialitat.',
    filename: 'codi-etic-policia-catalunya.pdf',
    mime: 'application/pdf',
    minBytes: 30_000,
    mustContain: ['ètica'],
  },
  'codi-seguretat-catalunya': {
    document: 'Codi de seguretat de Catalunya (recopilació normativa consolidada)',
    legalId: 'Recopilació del Portal Jurídic, sense identificador normatiu propi',
    consolidation: 'recopilacio',
    consolidationNote:
      'És un recull, no una norma: el seu valor és portar en un sol PDF la normativa catalana de seguretat ja consolidada.',
    format: 'html',
    lang: 'ca',
    alternatives: [
      { url: 'https://portaljuridic.gencat.cat/ca/normativa/dret-a-catalunya/Codis-legislacio/', kind: 'index', derived: false, note: 'Índex de codis de legislació del Portal Jurídic.' },
    ],
    needed:
      'El PDF complet del codi. Cap referència del banc l’apunta directament: el seu interès és de logística, no de contingut.',
    filename: 'codi-seguretat-catalunya.html',
    mime: 'text/html',
    minBytes: 10_000,
    mustContain: ['seguretat'],
    covers: [
      'llei-16-1991-policies-locals',
      'llei-4-2003-seguretat-publica',
      'decret-179-2015-disciplinari',
      'decret-151-1998-juntes',
    ],
    dedupeNote:
      'No és paraigua: baixat el 2026-08-24, el recull resulta ser un **índex d’enllaços** —els catorze apartats, de «Constitució i Estatut» a «Organismes», amb el títol de cada norma— i no el text de cap. Serveix de punt d’entrada per trobar-les; cada norma ha de seguir baixant-se a part i conserva el seu `sourceId`.',
  },
  'agencia-ciberseguretat-catalunya': {
    document: 'Agència de Ciberseguretat de Catalunya: funcions, amenaces i autoprotecció',
    legalId: 'Pàgina institucional; l’Agència es crea per la Llei 15/2019, de 29 de novembre',
    consolidation: 'pagina-viva',
    format: 'html',
    lang: 'ca',
    alternatives: [
      { url: 'https://portaljuridic.gencat.cat/eli/es-ct/l/2019/11/29/15', kind: 'canonical', derived: true, note: 'Llei de creació de l’Agència, si cal una base normativa i no només la pàgina.' },
    ],
    needed:
      'Funcions institucionals, tipologia d’amenaces i incidents, mesures d’autoprotecció i preservació de proves digitals.',
    filename: 'agencia-ciberseguretat-catalunya.html',
    mime: 'text/html',
    minBytes: 5_000,
    mustContain: ['ciberseguretat'],
  },

  // ── Fonts internacionals ───────────────────────────────────────────────
  'carta-drets-ue': {
    document: 'Carta dels drets fonamentals de la Unió Europea',
    legalId: 'Carta dels drets fonamentals de la UE (2012/C 326/02)',
    gazette: 'DOUE C 326, de 26/10/2012',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:12012P/TXT', kind: 'canonical', derived: true, note: 'Mateix document en castellà, si la versió catalana no és accessible.' },
    ],
    needed: 'Preàmbul, estructura en set títols i el valor jurídic que li dona l’art. 6 del TUE.',
    filename: 'carta-drets-ue.pdf',
    mime: 'application/pdf',
    minBytes: 100_000,
    mustContain: ['drets fonamentals'],
  },
  'rgpd-2016-679': {
    document: 'Reglament general de protecció de dades',
    legalId: 'Reglament (UE) 2016/679, de 27 d’abril de 2016',
    gazette: 'DOUE L 119, de 04/05/2016',
    consolidation: 'consolidat',
    format: 'both',
    lang: 'ca',
    alternatives: [
      { url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679', kind: 'canonical', derived: true, note: 'Mateix reglament en castellà.' },
    ],
    needed: 'Art. 5 (principis, amb 5.1.b), 6 (bases de legitimació) i 15-22 (drets de les persones).',
    filename: 'rgpd-2016-679.pdf',
    mime: 'application/pdf',
    minBytes: 300_000,
    mustContain: ['2016/679'],
  },
  'ddhh-1948': {
    document: 'Declaració Universal dels Drets Humans',
    legalId: 'Resolució 217 A (III) de l’Assemblea General de les Nacions Unides',
    consolidation: 'text-original',
    format: 'both',
    lang: 'es',
    alternatives: [
      { url: 'https://www.un.org/es/documents/udhr/UDHR_booklet_SP_web.pdf', kind: 'pdf', derived: true, note: 'Fullet en PDF de les Nacions Unides; comprovar la ruta en baixar.' },
    ],
    needed: 'Preàmbul i els 30 articles; la seva naturalesa jurídica (resolució, no tractat) i la data de proclamació.',
    filename: 'ddhh-1948.html',
    mime: 'text/html',
    minBytes: 10_000,
    mustContain: ['Derechos Humanos'],
  },
}

/* ─────────────────────────── Càlcul ─────────────────────────── */

const manifest = manifestJson as unknown as { sources: Source[] }
const sources = manifest.sources
const pending = sources.filter((s) => s.fetchStatus === 'pending-download')
/**
 * Fonts que **ja** tenen còpia local però que van passar per aquesta taula.
 *
 * Quan el rescat s'acaba no queda res pendent, i si el document només mirés les
 * pendents es buidaria: es perdria justament la fitxa que diu d'on baixar cada
 * norma, amb quin MIME i amb quines comprovacions mínimes. Es conserven en una
 * secció pròpia, marcades com a rescatades, i **no** compten a cap total de
 * pendents.
 */
const alreadyRescued = sources.filter(
  (s) => s.fetchStatus !== 'pending-download' && ENRICHMENT[s.sourceId] !== undefined,
)
const questions = ROSES_PACK.questions
const lessons = ROSES_PACK.lessons
const topics = ROSES_PACK.syllabus.topics

/** Una afirmació concreta que una referència ha de poder demostrar. */
interface Claim {
  consumer: string
  consumerKind: 'pregunta' | 'llico'
  topicId: string
  locator: string
  reviewStatus: string
  claim: string
}

function questionClaim(q: Question): string {
  const correct = q.options.find((o) => o.optionId === q.correct)
  const stem = q.stem.length > 130 ? `${q.stem.slice(0, 127)}…` : q.stem
  return `Que, en el punt citat, la resposta a «${stem}» és «${correct?.text ?? '?'}».`
}

function articlesFrom(locators: readonly string[]): number[] {
  const found = new Set<number>()
  for (const loc of locators) {
    for (const m of loc.matchAll(/\b(?:art\.?|article|artículo)\s*([0-9]+)/gi)) {
      found.add(Number(m[1]))
    }
    // Rangs escrits «art. 5 a 24» i llistes «art. 1, 4, 11 i 25».
    for (const m of loc.matchAll(/\b([0-9]{1,3})\s*(?:a|-)\s*([0-9]{1,3})\b/g)) {
      const from = Number(m[1])
      const to = Number(m[2])
      if (to > from && to - from <= 60) {
        found.add(from)
        found.add(to)
      }
    }
  }
  return [...found].sort((a, b) => a - b)
}

const describe = (source: Source) => {
  const id = source.sourceId
  const enrichment = ENRICHMENT[id]
  if (!enrichment) {
    console.error(
      `\n✗ La font pendent «${id}» no és a la taula ENRICHMENT de ` +
        `scripts/inventory-pending-sources.ts.\n` +
        `  L'inventari no s'escriu a mitges: afegeix-hi l'entrada, amb la norma exacta,\n` +
        `  què en cal i com comprovar el fitxer baixat, i torna-ho a executar.`,
    )
    process.exit(1)
  }

  const claims: Claim[] = []
  for (const q of questions) {
    for (const r of q.references) {
      if (r.sourceId !== id) continue
      claims.push({
        consumer: q.questionId,
        consumerKind: 'pregunta',
        topicId: q.topicId,
        locator: r.locator,
        reviewStatus: r.reviewStatus,
        claim: questionClaim(q),
      })
    }
  }
  for (const l of lessons) {
    for (const r of l.references ?? []) {
      if (r.sourceId !== id) continue
      claims.push({
        consumer: l.lessonId,
        consumerKind: 'llico',
        topicId: l.topicId,
        locator: r.locator,
        reviewStatus: r.reviewStatus,
        claim: `Que el punt citat sosté el contingut de la microlliçó «${l.title.ca}».`,
      })
    }
  }

  const ownQuestions = claims.filter((c) => c.consumerKind === 'pregunta').map((c) => c.consumer)
  const lessonIds = claims.filter((c) => c.consumerKind === 'llico').map((c) => c.consumer)
  const primaryFor = topics.filter((t) => t.primarySourceIds.includes(id)).map((t) => t.topicId)
  const topicIds = [...new Set([...claims.map((c) => c.topicId), ...primaryFor])].sort()

  // Preguntes oficials que aquesta font podria explicar: les que la
  // classificació editorial ha posat en un tema que ja consumeix aquesta font.
  // És una candidatura, no una assignació: qui escrigui l'explicació ha de
  // comprovar que la norma respon de debò la pregunta.
  const topicSet = new Set(topicIds)
  const officialQuestions = questions
    .filter((q) => q.origin === 'official' && topicSet.has(q.topicId))
    .map((q) => q.questionId)

  const locators = [...new Set(claims.map((c) => c.locator))].sort()
  const totalConsumers = ownQuestions.length + lessonIds.length
  const priority: 'P0' | 'P1' | 'P2' =
    officialQuestions.length >= 5 || totalConsumers >= 10
      ? 'P0'
      : totalConsumers <= 1
        ? 'P2'
        : 'P1'

  const lang = enrichment.lang
  const articleWord = lang === 'ca' ? 'Article' : 'Artículo'
  const articles = articlesFrom(locators)
  const mustContain = [
    ...enrichment.mustContain,
    ...articles.slice(0, 2).map((n) => `${articleWord} ${n}`),
  ]

  /*
   * Sostre per tipus quan l'entrada no en fixa un. Els valors són generosos a
   * posta —el Reglament general de vehicles fa 8 MB amb tots els annexos— però
   * tallen l'ordre de magnitud que delata una descàrrega equivocada.
   */
  const maxBytes = enrichment.maxBytes ?? (enrichment.mime === 'application/pdf' ? 60_000_000 : 8_000_000)

  /*
   * Un parell d'`issuer` del manifest porten el butlletí enganxat al nom de
   * l'organisme («Portal Jurídic de Catalunya — DOGC núm. 2948»). Aquí no es
   * toca el manifest: es normalitza per agrupar i se'n recupera el butlletí,
   * i queda anotat com a troballa d'higiene de dades.
   */
  const [organisation, issuerGazette] = source.issuer.split(' — ')

  return {
    sourceId: id,
    priority,
    document: enrichment.document,
    issuer: source.issuer,
    organisation: organisation!.trim(),
    legalId: enrichment.legalId,
    gazette: enrichment.gazette ?? (issuerGazette ? issuerGazette.trim() : null),
    publishedAt: source.publishedAt ?? null,
    consolidation: enrichment.consolidation,
    consolidationNote: enrichment.consolidationNote ?? null,
    format: enrichment.format,
    lang,
    canonicalUrl: source.url,
    domain: new URL(source.url).hostname,
    alternatives: enrichment.alternatives,
    needed: enrichment.needed,
    articlesCited: articles,
    locators,
    claims,
    consumers: {
      ownQuestions,
      lessons: lessonIds,
      topics: topicIds,
      primarySourceForTopics: primaryFor,
      officialQuestionsItCouldExplain: officialQuestions,
      totalConsumers,
    },
    offlinePackage: {
      filename: enrichment.filename,
      downloadUrl: source.url,
      domain: new URL(source.url).hostname,
      expectedMime: enrichment.mime,
      minBytes: enrichment.minBytes,
      maxBytes,
      resolvedHosts: enrichment.resolvedHosts ?? [],
      mustContain: [...new Set(mustContain)],
    },
    dedupe: {
      covers: enrichment.covers ?? [],
      note: enrichment.dedupeNote ?? null,
    },
  }
}

const entries = pending.map(describe)
const rescuedEntries = alreadyRescued.map(describe)

/* ───────────────────────── Validacions ───────────────────────── */

const failures: string[] = []
const checks: { id: string; title: string; detail: string; ok: boolean }[] = []

function check(id: string, title: string, ok: boolean, detail: string): void {
  checks.push({ id, title, detail, ok })
  if (!ok) failures.push(`${id}: ${title} — ${detail}`)
}

// 1. 43/43 inventariades.
check(
  '1',
  'Totes les fonts pendents són a l’inventari',
  entries.length === pending.length,
  pending.length === 0
    ? 'Cap font amb fetchStatus pending-download: totes tenen còpia local. La taula ENRICHMENT es conserva com a registre del rescat.'
    : `${entries.length} entrades per a ${pending.length} fonts amb fetchStatus pending-download.`,
)

// 2. Cap referència pendent es queda sense consumidor a l'inventari.
const pendingRefs: { consumer: string; sourceId: string }[] = []
for (const q of questions) {
  for (const r of q.references) {
    if (r.reviewStatus === 'pending-source-verification') {
      pendingRefs.push({ consumer: q.questionId, sourceId: r.sourceId })
    }
  }
}
for (const l of lessons) {
  for (const r of l.references ?? []) {
    if (r.reviewStatus === 'pending-source-verification') {
      pendingRefs.push({ consumer: l.lessonId, sourceId: r.sourceId })
    }
  }
}
const inventoried = new Set(entries.map((e) => e.sourceId))
const listedConsumers = new Set(
  entries.flatMap((e) => e.claims.map((c) => `${c.consumer}::${e.sourceId}`)),
)
const orphanRefs = pendingRefs.filter(
  (r) => inventoried.has(r.sourceId) && !listedConsumers.has(`${r.consumer}::${r.sourceId}`),
)
// Les referències pendents que apunten a una font **ja baixada** no són cosa
// d'aquest inventari, però tampoc es poden amagar: es compten a part.
const pendingRefsOnAdoptedSources = pendingRefs.filter((r) => !inventoried.has(r.sourceId))
check(
  '2',
  'Cap referència pendent d’una font inventariada es queda fora',
  orphanRefs.length === 0,
  `${pendingRefs.length} referències pendents en total; ${pendingRefs.length - pendingRefsOnAdoptedSources.length} apunten a fonts inventariades i totes hi consten. ` +
    (pendingRefsOnAdoptedSources.length > 0
      ? `${pendingRefsOnAdoptedSources.length} apunten a fonts ja adoptades i queden anotades com a troballa.`
      : ''),
)

// 3. Cap font ja verificada dins l'inventari.
const wrongly = entries.filter((e) => {
  const s = sources.find((x) => x.sourceId === e.sourceId)
  return !s || s.fetchStatus !== 'pending-download'
})
check(
  '3',
  'Cap font ja baixada no s’ha colat a l’inventari',
  wrongly.length === 0,
  wrongly.length === 0
    ? `Les ${entries.length} entrades tenen fetchStatus pending-download al manifest.`
    : `S’hi han colat: ${wrongly.map((w) => w.sourceId).join(', ')}.`,
)

// 4. El contingut no s'ha mogut: ni preguntes, ni claus, ni topicId, ni explicacions.
const fingerprint = createHash('sha256')
  .update(
    JSON.stringify(
      [...questions]
        .sort((a, b) => a.questionId.localeCompare(b.questionId))
        .map((q) => [q.questionId, q.topicId, q.correct, q.stem, q.explanation.ca, q.explanation.es ?? '']),
    ),
  )
  .digest('hex')
const questionIds = new Set(questions.map((q) => q.questionId))
const lessonIds = new Set(lessons.map((l) => l.lessonId))
const goneConsumers = entries.flatMap((e) =>
  e.claims
    .map((c) => c.consumer)
    .filter((id) => !questionIds.has(id) && !lessonIds.has(id))
    .map((id) => `${e.sourceId}::${id}`),
)
check(
  '4',
  'Cap afirmació de l’inventari apunta a una pregunta o lliçó que ja no existeix',
  goneConsumers.length === 0,
  goneConsumers.length === 0
    ? `${questions.length} preguntes i ${lessons.length} lliçons resolen tots els consumidors; empremta de contingut: ${fingerprint.slice(0, 16)}…`
    : `Consumidors desapareguts: ${goneConsumers.join(', ')}.`,
)

// 5. L'inventari surt de les dades reals i cau si apareix una font nova.
const issuersWithGazette = entries
  .filter((e) => e.issuer !== e.organisation)
  .map((e) => ({ sourceId: e.sourceId, issuer: e.issuer }))
const knownIds = new Set(sources.map((s) => s.sourceId))
// Una entrada la font de la qual ja s'ha adoptat **no** sobra: és el registre
// del rescat, amb la URL, el MIME i les comprovacions mínimes que caldrien per
// tornar-la a baixar. El que sí que és un error és una entrada que no
// correspongui a cap font del manifest.
const rescued = Object.keys(ENRICHMENT).filter((id) => knownIds.has(id) && !inventoried.has(id))
const unknownEnrichment = Object.keys(ENRICHMENT).filter((id) => !knownIds.has(id))
check(
  '5',
  'La taula revisada i les dades reals quadren exactament',
  unknownEnrichment.length === 0,
  unknownEnrichment.length > 0
    ? `Entrades a ENRICHMENT que no són cap font del manifest: ${unknownEnrichment.join(', ')}.`
    : rescued.length === 0
      ? 'Cap entrada sobrera a ENRICHMENT; una font pendent nova sense classificar atura l’script abans d’escriure res.'
      : `${rescued.length} entrades corresponen a fonts ja rescatades i es conserven com a registre; cap entrada desconeguda.`,
)

/* ─────────────────────────── Sortida ─────────────────────────── */

const allowedOfficialHosts = [
  ...new Set([...entries, ...rescuedEntries].flatMap((e) => allowedHostsFor(e.offlinePackage.downloadUrl))),
].sort()

const byPriority = { P0: 0, P1: 0, P2: 0 }
const byIssuer = new Map<string, number>()
for (const e of entries) {
  byPriority[e.priority]++
  byIssuer.set(e.organisation, (byIssuer.get(e.organisation) ?? 0) + 1)
}

const totals = {
  pendingSources: entries.length,
  pendingReferences: pendingRefs.length,
  ownQuestionsBlocked: new Set(entries.flatMap((e) => e.consumers.ownQuestions)).size,
  lessonsBlocked: new Set(entries.flatMap((e) => e.consumers.lessons)).size,
  officialQuestionsUnlockable: new Set(
    entries.flatMap((e) => e.consumers.officialQuestionsItCouldExplain),
  ).size,
  byPriority,
  byIssuer: Object.fromEntries([...byIssuer].sort((a, b) => b[1] - a[1])),
}

mkdirSync(`${ROOT}artifacts`, { recursive: true })
writeFileSync(
  JSON_OUT,
  `${JSON.stringify(
    {
      _note: [
        'Inventari de les fonts normatives pendents de baixar. Generat per',
        'scripts/inventory-pending-sources.ts; no s’edita a mà.',
        'Pensat per preparar un paquet offline: cada entrada porta nom de fitxer',
        'proposat, URL de descàrrega, domini, MIME esperat i comprovacions mínimes.',
        'Les URL marcades derived:true s’han construït amb un patró conegut i no',
        's’han pogut comprovar des de l’entorn de construcció.',
      ],
      generatedOn: GENERATED_ON,
      generator: 'scripts/inventory-pending-sources.ts',
      priorityRule: {
        P0: 'pot explicar 5 preguntes oficials o més, o té 10 consumidors o més',
        P1: 'necessària per a lliçons i preguntes pròpies (entre 2 i 9 consumidors)',
        P2: 'un sol consumidor o cap: impacte menor',
      },
      contentFingerprint: fingerprint,
      /**
       * Tots els amfitrions on pot acabar legítimament la baixada d'alguna
       * d'aquestes fonts, en una sola llista.
       *
       * Qui munti el paquet offline la necessita sencera: mantenir-la a mà és
       * el que va fer fallar nou descàrregues el 2026-08-24, perquè el Portal
       * Jurídic serveix els PDF des de `portaldogc.gencat.cat` i aquell
       * amfitrió no hi era.
       */
      allowedOfficialHosts,
      totals,
      validations: checks,
      findings: {
        pendingReferencesOnAdoptedSources: pendingRefsOnAdoptedSources,
        issuersWithGazetteInline: issuersWithGazette,
      },
      sources: entries,
      rescued: rescuedEntries,
    },
    null,
    2,
  )}\n`,
  'utf-8',
)

const fmt = (n: number): string => n.toLocaleString('ca-ES')
const md: string[] = []
md.push('# Rescat de fonts normatives: inventari de les que falten')
md.push('')
md.push('**Generat** per `scripts/inventory-pending-sources.ts`. No s’edita a mà: si canvia el')
md.push('manifest o el banc, es torna a generar i canvia amb ells.')
md.push('')
md.push(`Aquest document i el seu bessó \`rescat-fonts-normatives.json\` no baixen res: descriuen`)
md.push('**què** cal baixar, **d’on**, **quins articles** i **per demostrar quina afirmació**, de')
md.push('manera que qui tingui accés a la xarxa pugui preparar el paquet sense reconstruir el')
md.push('context. És el mateix camí que van seguir els dos paquets anteriors.')
md.push('')
if (entries.length === 0) {
  md.push('**El rescat està fet.** Cap font del manifest té `fetchStatus: pending-download`: les 43')
  md.push('normes generals que faltaven es van adoptar el 2026-08-24 des d’un paquet portat a mà, i')
  md.push('la taula revisada d’aquest script es conserva com a registre de com tornar-les a baixar.')
  md.push('Què demostra cada referència i què encara no: `content/municipalities/roses/`')
  md.push('`adopcio-normativa-2026-08-24.json` i `artifacts/adopcio-fonts-normatives-2026-08-24.md`.')
  md.push('')
}
md.push('## Totals')
md.push('')
md.push('| | |')
md.push('| --- | --- |')
md.push(`| Fonts pendents | **${fmt(totals.pendingSources)}** |`)
md.push(`| Referències del banc en \`pending-source-verification\` | ${fmt(totals.pendingReferences)} |`)
md.push(`| Preguntes pròpies que en depenen | ${fmt(totals.ownQuestionsBlocked)} |`)
md.push(`| Microlliçons que en depenen | ${fmt(totals.lessonsBlocked)} |`)
md.push(`| Preguntes oficials que es podrien explicar | ${fmt(totals.officialQuestionsUnlockable)} |`)
md.push('')
md.push('### Per prioritat')
md.push('')
md.push('| Prioritat | Fonts | Criteri |')
md.push('| --- | --- | --- |')
md.push(`| **P0** | ${byPriority.P0} | Pot explicar 5 preguntes oficials o més, o té 10 consumidors o més. |`)
md.push(`| **P1** | ${byPriority.P1} | Necessària per a lliçons i preguntes pròpies (2-9 consumidors). |`)
md.push(`| **P2** | ${byPriority.P2} | Un sol consumidor o cap: impacte menor. |`)
md.push('')
if (byIssuer.size > 0) {
  md.push('### Per organisme')
  md.push('')
  md.push('| Organisme | Fonts |')
  md.push('| --- | --- |')
  for (const [issuer, n] of [...byIssuer].sort((a, b) => b[1] - a[1])) {
    md.push(`| ${issuer} | ${n} |`)
  }
  md.push('')
}
md.push('## Amfitrions oficials que ha de permetre el baixador')
md.push('')
md.push('Aquesta és la llista sencera, i és el que va fallar la primera vegada: el Portal')
md.push('Jurídic serveix els PDF des de `portaldogc.gencat.cat`, i com que aquell amfitrió no')
md.push('era a la llista de l’operador, cinc normes catalanes no es van poder baixar. Mantenir-la')
md.push('a mà és el problema; aquí es genera de les fonts reals.')
md.push('')
for (const host of allowedOfficialHosts) md.push(`- \`${host}\``)
md.push('')
md.push('`scripts/lib/official-hosts.ts` porta la mateixa taula per al baixador d’aquest')
md.push('repositori, que **refusa** desar una descàrrega que acabi en un amfitrió que no hi')
md.push('sigui: un SHA-256 demostra que el fitxer no ha canviat, no que vingui de qui toca.')
md.push('')
md.push('## Com llegir una entrada')
md.push('')
md.push('De cada font hi ha la norma exacta amb el seu identificador legal, l’estat de')
md.push('consolidació que cal, els articles que el banc cita de debò, **l’afirmació concreta**')
md.push('que cada referència ha de poder demostrar, i qui la consumeix. Les preguntes oficials')
md.push('que hi surten són **candidates**: la classificació editorial les ha posat en un tema')
md.push('que ja consumeix aquesta font, però qui escrigui l’explicació ha de comprovar que la')
md.push('norma respon de debò la pregunta.')
md.push('')

for (const priority of ['P0', 'P1', 'P2'] as const) {
  const group = entries
    .filter((e) => e.priority === priority)
    .sort(
      (a, b) =>
        b.consumers.officialQuestionsItCouldExplain.length -
          a.consumers.officialQuestionsItCouldExplain.length ||
        b.consumers.totalConsumers - a.consumers.totalConsumers,
    )
  // Amb el rescat acabat no queda cap font pendent: tres capçaleres buides no
  // informen de res, i el registre de sota sí.
  if (group.length === 0) continue
  md.push(`## ${priority} — ${group.length} fonts`)
  md.push('')
  for (const e of group) {
    card(e)
  }
}

function card(e: (typeof entries)[number]): void {
  {
    md.push(`### \`${e.sourceId}\` — ${e.document}`)
    md.push('')
    md.push(`- **Identificador legal:** ${e.legalId}${e.gazette ? ` · ${e.gazette}` : ''}`)
    md.push(`- **Organisme:** ${e.organisation}`)
    md.push(
      `- **Publicació:** ${e.publishedAt ?? 'sense data (pàgina viva)'} · **consolidació:** ${e.consolidation}` +
        (e.consolidationNote ? ` — ${e.consolidationNote}` : ''),
    )
    md.push(`- **URL canònica:** ${e.canonicalUrl}`)
    if (e.alternatives.length > 0) {
      md.push(
        `- **Alternatives oficials:** ${e.alternatives
          .map((a) => `${a.url}${a.derived ? ' *(derivada, cal comprovar-la)*' : ''}`)
          .join(' · ')}`,
      )
    }
    md.push(`- **Format esperat:** ${e.format} · MIME \`${e.offlinePackage.expectedMime}\``)
    md.push(`- **Què en cal:** ${e.needed}`)
    if (e.articlesCited.length > 0) {
      md.push(`- **Articles citats pel banc:** ${e.articlesCited.join(', ')}`)
    }
    md.push(
      `- **Consumidors:** ${e.consumers.ownQuestions.length} preguntes pròpies · ` +
        `${e.consumers.lessons.length} microlliçons · ${e.consumers.topics.length} temes · ` +
        `**${e.consumers.totalConsumers} en total**`,
    )
    if (e.consumers.officialQuestionsItCouldExplain.length > 0) {
      md.push(
        `- **Preguntes oficials que podria explicar:** ${e.consumers.officialQuestionsItCouldExplain.length}`,
      )
    }
    if (e.dedupe.note) md.push(`- **Duplicitat:** ${e.dedupe.note}`)
    md.push(
      `- **Paquet offline:** \`${e.offlinePackage.filename}\` · entre ${fmt(e.offlinePackage.minBytes)} i ` +
        `${fmt(e.offlinePackage.maxBytes)} bytes · ` +
        `ha de contenir ${e.offlinePackage.mustContain.map((x) => `«${x}»`).join(', ')}`,
    )
    if (e.offlinePackage.resolvedHosts.length > 0) {
      md.push(
        `- **També pot resoldre a:** ${e.offlinePackage.resolvedHosts.join(', ')} — cal tenir-ho a la llista de hosts oficials.`,
      )
    }
    const sample = e.claims.slice(0, 3)
    if (sample.length > 0) {
      md.push('')
      md.push('  Afirmacions que ha de demostrar (mostra):')
      for (const c of sample) {
        md.push(`  - \`${c.consumer}\` · *${c.locator}* — ${c.claim}`)
      }
      if (e.claims.length > sample.length) {
        md.push(`  - …i ${e.claims.length - sample.length} més, totes al JSON.`)
      }
    }
    md.push('')
  }
}

if (rescuedEntries.length > 0) {
  md.push(`## Registre del rescat — ${rescuedEntries.length} fonts ja adoptades`)
  md.push('')
  md.push('Aquestes fonts ja tenen còpia local i **no compten com a pendents**. La fitxa es')
  md.push('conserva perquè és el que caldria per tornar-les a baixar: la URL, el format, la mida')
  md.push('esperada, les comprovacions mínimes i els hosts alternatius. Què demostra cada')
  md.push('referència després de la revisió és a `adopcio-normativa-2026-08-24.json`.')
  md.push('')
  for (const e of [...rescuedEntries].sort(
    (a, b) => a.priority.localeCompare(b.priority) || a.sourceId.localeCompare(b.sourceId),
  )) {
    card(e)
  }
}

md.push('## Duplicitats detectades')
md.push('')
const dedupes = [...entries, ...rescuedEntries].filter((e) => e.dedupe.covers.length > 0)
if (dedupes.length === 0) {
  md.push('Cap font cobreix cap altra.')
} else {
  for (const e of dedupes) {
    md.push(`- \`${e.sourceId}\` podria cobrir: ${e.dedupe.covers.map((c) => `\`${c}\``).join(', ')}.`)
    md.push(`  ${e.dedupe.note}`)
  }
}
md.push('')
md.push('El cas que **no** és una duplicitat, i val la pena dir-ho: `lo-1-2015-reforma-cp` no el')
md.push('cobreix el Codi penal consolidat. El consolidat mostra la redacció vigent, i el que se’n')
md.push('cita és justament el que el consolidat ja no ensenya com a tal: el preàmbul de la reforma')
md.push('i la supressió del llibre III de faltes. Calen els dos textos.')
md.push('')

if (pendingRefsOnAdoptedSources.length > 0) {
  md.push('## Troballa: referències pendents sobre fonts ja adoptades')
  md.push('')
  md.push('Aquestes referències segueixen marcades `pending-source-verification` tot i que la seva')
  md.push('font ja té còpia local amb el hash comprovat. Tenir el document no verifica la cita: o bé')
  md.push('la descàrrega no en porta el text, o bé el document no diu el que la referència afirma.')
  md.push('El motiu de cada una és a `adopcio-normativa-2026-08-24.json`, camp `verdict`:')
  md.push('')
  for (const r of pendingRefsOnAdoptedSources) {
    md.push(`- \`${r.consumer}\` → \`${r.sourceId}\``)
  }
  md.push('')
}

if (issuersWithGazette.length > 0) {
  md.push('## Troballa: butlletí incrustat al nom de l’organisme')
  md.push('')
  md.push('Al manifest, l’`issuer` d’aquestes fonts porta el butlletí enganxat al nom de')
  md.push('l’organisme. Aquí només s’ha normalitzat per agrupar i se n’ha recuperat el butlletí;')
  md.push('el manifest no s’ha tocat, perquè aquest bloc és només d’inventari:')
  md.push('')
  for (const i of issuersWithGazette) {
    md.push(`- \`${i.sourceId}\` → «${i.issuer}»`)
  }
  md.push('')
}

md.push('## Validacions')
md.push('')
md.push('| # | Comprovació | Resultat |')
md.push('| --- | --- | --- |')
for (const c of checks) {
  md.push(`| ${c.id} | ${c.title} | ${c.ok ? '✓' : '✗'} ${c.detail} |`)
}
md.push('')
md.push(`Empremta del contingut (identificadors, temes, claus i explicacions de les`)
md.push(`${fmt(questions.length)} preguntes): \`${fingerprint}\`.`)
md.push('')

writeFileSync(MD_OUT, `${md.join('\n')}\n`, 'utf-8')

console.log('── Inventari de fonts pendents ──')
console.log(`fonts: ${entries.length}   P0: ${byPriority.P0}   P1: ${byPriority.P1}   P2: ${byPriority.P2}`)
console.log(`referències pendents: ${totals.pendingReferences}`)
console.log(`preguntes pròpies afectades: ${totals.ownQuestionsBlocked}`)
console.log(`preguntes oficials que es podrien explicar: ${totals.officialQuestionsUnlockable}`)
console.log('')
for (const c of checks) console.log(`  ${c.ok ? '✓' : '✗'} ${c.id}. ${c.title}\n     ${c.detail}`)
console.log('')
if (failures.length > 0) {
  console.error('Validacions fallides:')
  for (const f of failures) console.error(`  ✗ ${f}`)
  process.exit(1)
}
console.log(`Escrit artifacts/rescat-fonts-normatives.json`)
console.log(`Escrit artifacts/rescat-fonts-normatives.md`)
