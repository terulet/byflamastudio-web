/**
 * Amfitrions oficials on pot acabar la descàrrega d'una font.
 *
 * Viu a part perquè el test el pugui provar: `download-sources.ts` baixa coses
 * de la xarxa en carregar-se i no es pot importar des d'un test.
 */
/**
 * On pot acabar legítimament una redirecció, per amfitrió d'origen.
 *
 * Es baixa amb `redirect: 'follow'`, i seguir una redirecció a cegues vol dir
 * desar el que torni **qui sigui** i beneir-ho amb un SHA-256 al manifest. El
 * hash demostraria que el fitxer no ha canviat des que es va baixar, no que
 * vingui de qui hauria de venir.
 *
 * La taula no s'endevina: surt de les redireccions que van passar de debò en
 * baixar el paquet del 2026-08-24, comprovades al seu registre. Els portals
 * oficials les fan servir de manera normal —el Portal Jurídic serveix els PDF
 * des del DOGC, i remet al BOE les normes publicades als dos— i sense taula
 * cada una d'aquestes és una descàrrega fallida o, pitjor, acceptada a cegues.
 *
 * Afegir-hi una entrada és una decisió: vol dir «aquest amfitrió també és
 * oficial per a aquesta font». Si apareix un amfitrió que no hi és, la
 * descàrrega falla dient quin és, i qui la revisi decideix.
 */
export const OFFICIAL_REDIRECTS: Readonly<Record<string, readonly string[]>> = {
  // El Portal Jurídic serveix els PDF consolidats des del DOGC, i per a les
  // normes publicades al BOE hi remet directament.
  'portaljuridic.gencat.cat': ['portaldogc.gencat.cat', 'dogc.gencat.cat', 'www.boe.es'],
  // L'Estatut d'autonomia: el BOE remet al text del Parlament.
  'www.boe.es': ['www.parlament.cat'],
  // EUR-Lex serveix els PDF des de l'Oficina de Publicacions de la UE.
  'eur-lex.europa.eu': ['op.europa.eu'],
  // El Departament d'Interior té els continguts de seguretat pública en un
  // subdomini propi.
  'interior.gencat.cat': ['dsp.interior.gencat.cat'],
}

/** Amfitrions on pot acabar la baixada d'aquesta font, l'origen inclòs. */
export function allowedHostsFor(url: string): string[] {
  const origin = new URL(url).hostname
  return [origin, ...(OFFICIAL_REDIRECTS[origin] ?? [])]
}
