/**
 * Seguir una redirecció a cegues és desar el que torni qui sigui.
 *
 * El baixador desa el fitxer i li posa un SHA-256 al manifest. Aquell hash
 * demostra que la còpia no ha canviat des que es va baixar; **no** demostra que
 * vingui de qui hauria de venir. Amb `redirect: 'follow'` i sense comprovar on
 * s'ha acabat, una redirecció segrestada entra a `sources/cache/` i surt del
 * manifest amb aparença de font verificada.
 *
 * Aquests tests fixen les dues meitats: que les redireccions oficials que passen
 * de debò segueixin funcionant —si no, cinc normes catalanes no es poden baixar
 * mai— i que qualsevol altre amfitrió quedi fora.
 */
import { describe, expect, it } from 'vitest'
import { OFFICIAL_REDIRECTS, allowedHostsFor } from '../../scripts/lib/official-hosts.ts'
import manifest from '../../sources/source-manifest.json' with { type: 'json' }

describe('on pot acabar una descàrrega', () => {
  it('el mateix amfitrió sempre val', () => {
    expect(allowedHostsFor('https://www.boe.es/eli/es/lo/1995/11/23/10/con')).toContain('www.boe.es')
  })

  it('el Portal Jurídic pot servir el PDF des del DOGC', () => {
    // Aquest és el cas que va fer fallar cinc normes catalanes a la primera
    // descàrrega del paquet: portaljuridic redirigeix a portaldogc i la llista
    // de l'operador no el tenia.
    expect(allowedHostsFor('https://portaljuridic.gencat.cat/eli/es-ct/l/1991/07/10/16')).toContain(
      'portaldogc.gencat.cat',
    )
  })

  it('i pot remetre al BOE les normes publicades als dos butlletins', () => {
    expect(allowedHostsFor('https://portaljuridic.gencat.cat/eli/es-ct/l/2014/12/29/19')).toContain(
      'www.boe.es',
    )
  })

  it('EUR-Lex serveix els PDF des de l’Oficina de Publicacions', () => {
    expect(allowedHostsFor('https://eur-lex.europa.eu/legal-content/CA/TXT/?uri=CELEX:12012P/TXT')).toContain(
      'op.europa.eu',
    )
  })

  it('un amfitrió que no és a la taula no val, encara que s’hi assembli', () => {
    const allowed = allowedHostsFor('https://portaljuridic.gencat.cat/eli/es-ct/l/1991/07/10/16')
    expect(allowed).not.toContain('portaljuridic.gencat.cat.exemple.com')
    expect(allowed).not.toContain('gencat.cat')
    expect(allowed).not.toContain('www.un.org')
  })

  it('una font sense redireccions conegudes només s’accepta al seu propi amfitrió', () => {
    expect(allowedHostsFor('https://www.roses.cat/')).toEqual(['www.roses.cat'])
  })
})

describe('la taula descriu fonts que existeixen de debò', () => {
  const manifestHosts = new Set(manifest.sources.map((s) => new URL(s.url).hostname))

  it('cap entrada és per a un amfitrió que el manifest no fa servir', () => {
    // Una entrada òrfena vol dir que algú va obrir la porta a un amfitrió que
    // aquest projecte no visita. Es tanca.
    const orphans = Object.keys(OFFICIAL_REDIRECTS).filter((h) => !manifestHosts.has(h))
    expect(orphans).toEqual([])
  })

  it('cap font del manifest apunta a un amfitrió buit o sense https', () => {
    for (const source of manifest.sources) {
      const url = new URL(source.url)
      expect(url.protocol, source.sourceId).toBe('https:')
      expect(url.hostname.length, source.sourceId).toBeGreaterThan(3)
    }
  })
})
