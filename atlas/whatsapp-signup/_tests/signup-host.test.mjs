/**
 * Pruebas de la página host del Embedded Signup (atlas/whatsapp-signup/).
 *
 * Ejecutan el script REAL extraído del HTML publicado, sobre un DOM mínimo
 * construido a mano: sin dependencias, sin navegador y sin red. Lo que se
 * comprueba es lo que puede convertir una página de un dominio de confianza en
 * un problema — que acepte un destino de retorno ajeno, que guarde o registre
 * el `state`, o que lleve dentro un valor que no debería estar ahí.
 *
 * Desde 6e0a1c4 la página usa el flujo de REDIRECCIÓN, no el SDK de
 * JavaScript: `FB.login()` acuñaba el `code` contra un `redirect_uri` interno
 * de Meta con partes aleatorias por apertura, irreproducible en el servidor
 * que canjea. Aquí se fija lo contrario: un `redirect_uri` único, literal e
 * idéntico al de la fuente única de identificadores.
 *
 * Esta copia protege la página PUBLICADA; la fuente vive en el monorepo
 * (terulet/atlas-platform, docs/whatsapp-cloud/signup-host/) con estas mismas
 * pruebas: si alguna vez divergen, el endurecimiento de una no protege a la
 * otra — que es exactamente lo que pasó la primera vez.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const dir = dirname(fileURLToPath(import.meta.url));
// La página FUENTE del monorepo. La copia publicada vive en
// terulet/byflamastudio-web (atlas/whatsapp-signup/index.html) y lleva estas
// mismas pruebas: si alguna vez divergen, el endurecimiento de una no protege
// a la otra — que es exactamente lo que pasó la primera vez.
const PAGINA = join(dir, '..', 'index.html');
const html = readFileSync(PAGINA, 'utf8');
// Fuente ÚNICA de los identificadores públicos de Meta. La lee también el
// gateway (va dentro de su imagen) para construir el candidato de
// `redirect_uri` del canje, y check-bundled-config.mjs para el instalador.
// Copia LITERAL de docs/whatsapp-cloud/meta-identificadores.json del monorepo
// (terulet/atlas-platform), que es la fuente única. Aquí no existe ese fichero,
// así que se replica: si allí cambia, esta copia tiene que cambiar con él.
const IDS = {
  "nombre": "Atlas by Byflama",
  "appId": "2028110217821893",
  "configId": "2137703466787056",
  "esUrl": "https://byflamastudio.com/atlas/whatsapp-signup/"
};
const RETIRADOS = [
  {
    "nombre": "Atlas Inbox Test",
    "appId": "1538119581128850",
    "configId": "1431463065493437"
  },
  {
    "nombre": "Pareja descartada (F4-B, ninguna app accesible)",
    "appId": "1558374839123463",
    "configId": "1075072988792533"
  }
];

const BASE = IDS.esUrl;
const CALLBACK_OK = 'http://127.0.0.1:53127/oauth/whatsapp/callback';
const APP_ID = IDS.appId;
const CONFIG_ID = IDS.configId;
/** Query de IDA con la pareja correcta y lo que se le añada o sustituya. */
const q = (extra = {}) => '?' + new URLSearchParams({
  app_id: APP_ID, config_id: CONFIG_ID, state: 'abc', callback: CALLBACK_OK, ...extra,
}).toString();

// El `state` de las pruebas. 16 hex a propósito: la página admite de 16 a 128,
// y un hex de 32 SUELTO en el código lo marca check-secrets como posible App
// Secret pegado — con razón. La longitud real (48) se cubre aparte, construida
// en tiempo de ejecución para no dejar una ristra larga en el fuente.
const ESTADO = '0a1b2c3d4e5f6a7b';
const ESTADO_REAL = 'ab'.repeat(24);   // 48 hex: lo que genera Atlas de verdad

/** El `state` empaquetado que la página manda a Meta y Meta devuelve tal cual. */
const empaquetar = (state, callback) =>
  Buffer.from(JSON.stringify({ s: state, cb: callback }), 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
/** Query de VUELTA, tal como la construye Meta al redirigir. */
const qVuelta = (extra) => '?' + new URLSearchParams(extra).toString();

/** El script inline de la página, tal cual se publica. */
function scriptDeLaPagina() {
  const m = /<script>([\s\S]*?)<\/script>/.exec(html);
  assert.ok(m, 'la página debe llevar su script inline');
  return m[1];
}

/**
 * DOM mínimo suficiente para este script. Devuelve el entorno para poder
 * inspeccionarlo después (qué se mostró, adónde se navegó, qué se cargó).
 */
function abrirPagina(query, { enmarcada = false, base = BASE } = {}) {
  const registro = { navegaciones: [], scriptsCargados: [], listeners: {}, consola: [], historial: [] };
  const elemento = (id, disabled = false) => ({ id, textContent: '', className: '', disabled, _clicks: [],
    addEventListener(tipo, fn) { if (tipo === 'click') this._clicks.push(fn); } });
  const status = elemento('status');
  // El estado inicial del botón se LEE del HTML publicado: si algún día se
  // quitara el atributo `disabled`, la prueba tiene que enterarse en vez de
  // seguir midiendo un supuesto suyo.
  const button = elemento('go', /<button id="go"[^>]*\bdisabled\b/.test(html));

  const urlBase = new URL(base);
  const location = {
    href: `${base}${query}`,
    origin: urlBase.origin,
    pathname: urlBase.pathname,
    search: query.startsWith('?') ? query : query ? `?${query}` : '',
    assign(destino) { registro.navegaciones.push(destino); },
  };
  const documentElement = { textContent: '' };
  const document = {
    documentElement,
    getElementById: (id) => (id === 'status' ? status : id === 'go' ? button : null),
    // Se conservan aunque el flujo nuevo no cargue nada: si alguien vuelve a
    // meter un script de terceros, las pruebas tienen que verlo.
    createElement: () => {
      const el = { tagName: 'script', src: '', async: false, defer: false, crossOrigin: '', onerror: null };
      registro.creado = el;
      return el;
    },
    head: { appendChild: (el) => registro.scriptsCargados.push(el) },
  };
  const history = { replaceState: (_a, _b, url) => registro.historial.push(url) };
  const window = { addEventListener(tipo, fn) { (registro.listeners[tipo] ??= []).push(fn); } };
  // Por defecto la página NO está enmarcada; `enmarcada: true` la mete en un
  // iframe para probar la defensa anti-clickjacking.
  window.self = window;
  window.top = enmarcada ? { ajena: true } : window;

  const sandbox = {
    window, document, location, history, URL, URLSearchParams, JSON, Object, Error, RegExp, String, btoa, atob,
    console: { log: (...a) => registro.consola.push(a), warn: (...a) => registro.consola.push(a), error: (...a) => registro.consola.push(a) },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  let lanzo = null;
  try { vm.runInContext(scriptDeLaPagina(), sandbox); } catch (e) { lanzo = e; }
  return { ...registro, status, button, window, documentElement, sandbox, lanzo };
}

/** Lanza el flujo de ida y devuelve la URL del diálogo de Meta. */
function urlDelDialogo(p) {
  assert.equal(p.button.disabled, false, 'el botón debe quedar habilitado');
  p.button._clicks[0]();
  assert.equal(p.navegaciones.length, 1, 'debe navegar al diálogo de Meta');
  return new URL(p.navegaciones[0]);
}

// ── 1. Carga estática ───────────────────────────────────────────────────────

test('carga estática: la página se sirve entera y NO carga ningún script de terceros', () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<title>Conectar WhatsApp con Atlas<\/title>/);
  // noindex obligatorio: es una página operativa, no contenido público.
  assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
  // El `state` no puede viajar en la cabecera Referer hacia Meta.
  assert.match(html, /<meta name="referrer" content="no-referrer" \/>/);

  const p = abrirPagina(q());
  assert.equal(p.scriptsCargados.length, 0, 'el flujo de redirección no necesita SDK: cero scripts externos');
  // Lo que importa es que no se CARGUE, no que no se nombre: el comentario de
  // la CSP explica justamente por qué ya no hace falta permitirlo.
  assert.ok(!/src\s*=\s*["']?https:\/\/connect\.facebook\.net/.test(html), 'el SDK de Meta ya no se carga desde ninguna etiqueta');
  assert.ok(!/\bFB\./.test(scriptDeLaPagina()), 'el script ya no llama a ninguna API del SDK');
  assert.equal(p.button.disabled, false, 'con parámetros válidos el botón queda listo sin esperar a nada');
});

// ── 2. El redirect_uri: el corazón de este cambio ───────────────────────────

test('el redirect_uri del diálogo es EXACTAMENTE el de la fuente única de identificadores', () => {
  // Esta es LA prueba de la regresión. El canje del `code` lo hace el gateway
  // con `esUrl` de meta-identificadores.json; el diálogo lo abre esta página.
  // Si los dos valores se separan aunque sea en la barra final, Meta devuelve
  // «code=100 subcode=36008 … redirect_uri is identical» y el alta muere sin
  // ninguna pista útil. Aquí se atan.
  const p = abrirPagina(q());
  const dialogo = urlDelDialogo(p);
  assert.equal(dialogo.origin, 'https://www.facebook.com');
  assert.equal(dialogo.pathname, '/v23.0/dialog/oauth');
  assert.equal(dialogo.searchParams.get('redirect_uri'), IDS.esUrl);
  assert.equal(dialogo.searchParams.get('client_id'), APP_ID);
  assert.equal(dialogo.searchParams.get('config_id'), CONFIG_ID);
  assert.equal(dialogo.searchParams.get('response_type'), 'code');
  assert.equal(dialogo.searchParams.get('override_default_response_type'), 'true');
  assert.deepEqual(JSON.parse(dialogo.searchParams.get('extras')), { setup: {}, sessionInfoVersion: '3' });
});

test('publicada en una ruta distinta de la declarada: se PARA con un motivo', () => {
  // Servir la página en otra ruta (o sin la barra final) rompe la igualdad con
  // el `redirect_uri` del canje. Antes eso se descubría veinte minutos después
  // como un subcode ininteligible; ahora se dice aquí.
  for (const otra of ['https://byflamastudio.com/atlas/whatsapp-signup', 'https://byflamastudio.com/otra/ruta/', 'https://ajeno.example/atlas/whatsapp-signup/']) {
    const p = abrirPagina(q(), { base: otra });
    assert.equal(p.status.className, 'error', `debe pararse publicada en ${otra}`);
    assert.match(p.status.textContent, /no está publicada en la dirección que espera/);
    assert.deepEqual(p.navegaciones, [], `no puede abrir el diálogo desde ${otra}`);
  }
});

// ── 3. Rechazo de callback externo (no es un redirector abierto) ────────────

test('rechazo de callback EXTERNO: ningún destino fuera del loopback de Atlas', () => {
  const ajenos = [
    'https://atacante.example/roba',
    'https://byflamastudio.com/atlas/whatsapp-signup/',
    'http://127.0.0.1.atacante.example/oauth/whatsapp/callback',
    'http://localhost:53127/oauth/whatsapp/callback',      // nombre, no la IP exacta
    'http://[::1]:53127/oauth/whatsapp/callback',          // loopback IPv6: tampoco
    'http://127.0.0.1:53127/otra/ruta',                    // IP correcta, ruta ajena
    'http://127.0.0.1:53127/oauth/whatsapp/callback/../..', // travesía de ruta
    'http://127.0.0.1@atacante.example/oauth/whatsapp/callback', // el host real es el atacante
    'javascript:alert(1)',                                  // esquema peligroso
    'data:text/html,<script>alert(1)</script>',
    '//atacante.example/oauth/whatsapp/callback',           // relativo de protocolo
    'not a url',
  ];
  for (const destino of ajenos) {
    const p = abrirPagina(q({ callback: destino }));
    assert.equal(p.status.className, 'error', `debe rechazarse: ${destino}`);
    assert.match(p.status.textContent, /destino de retorno no es válido/, destino);
    assert.equal(p.button.disabled, true, `botón bloqueado con ${destino}`);
    assert.deepEqual(p.navegaciones, [], `NO puede navegar a ${destino}`);
  }
});

test('aceptación del loopback: 127.0.0.1 + /oauth/whatsapp/callback en cualquier puerto', () => {
  for (const destino of [
    'http://127.0.0.1:53127/oauth/whatsapp/callback',
    'http://127.0.0.1:8080/oauth/whatsapp/callback',
    'https://127.0.0.1:53127/oauth/whatsapp/callback',
  ]) {
    const p = abrirPagina(q({ callback: destino }));
    assert.notEqual(p.status.className, 'error', `debe aceptarse: ${destino}`);
    assert.equal(p.button.disabled, false);
  }
});

// ── 4. La vuelta de Meta ────────────────────────────────────────────────────

test('vuelta con code: devuelve el code y el state ORIGINAL al loopback', () => {
  const state = ESTADO;
  const p = abrirPagina(qVuelta({ code: 'CODE-DE-META-XYZ', state: empaquetar(state, CALLBACK_OK) }));
  assert.equal(p.navegaciones.length, 1);
  const url = new URL(p.navegaciones[0]);
  assert.equal(url.origin, 'http://127.0.0.1:53127');
  assert.equal(url.pathname, '/oauth/whatsapp/callback');
  assert.equal(url.searchParams.get('code'), 'CODE-DE-META-XYZ');
  assert.equal(url.searchParams.get('state'), state, 'Atlas recibe SU state, no el empaquetado');
  assert.deepEqual([...url.searchParams.keys()].sort(), ['code', 'state']);
});

test('la longitud REAL del state de Atlas (48 hex) viaja y vuelve intacta', () => {
  // ESTADO usa 16 hex para no dejar un hex de 32 suelto en el fuente; esta
  // prueba cubre la longitud que Atlas genera de verdad (randomBytes(24)),
  // construida en ejecución.
  const p = abrirPagina(qVuelta({ code: 'C', state: empaquetar(ESTADO_REAL, CALLBACK_OK) }));
  assert.equal(new URL(p.navegaciones[0]).searchParams.get('state'), ESTADO_REAL);
});

test('vuelta con error: se propaga sin inventar un code', () => {
  const state = ESTADO;
  const p = abrirPagina(qVuelta({ error: 'access_denied', state: empaquetar(state, CALLBACK_OK) }));
  const url = new URL(p.navegaciones[0]);
  assert.equal(url.searchParams.get('error'), 'access_denied');
  assert.equal(url.searchParams.get('state'), state);
  assert.equal(url.searchParams.get('code'), null, 'jamás un code inventado');
});

test('vuelta con un error de forma rara: se normaliza, no se refleja', () => {
  const state = ESTADO;
  const p = abrirPagina(qVuelta({ error: '<img src=x onerror=1>', state: empaquetar(state, CALLBACK_OK) }));
  assert.equal(new URL(p.navegaciones[0]).searchParams.get('error'), 'access_denied');
});

test('vuelta con un state que no es nuestro: NO se navega a ninguna parte', () => {
  const malos = [
    'no-es-base64',
    Buffer.from('{}', 'utf8').toString('base64'),
    // cb fuera del loopback: el empaquetado NO es un permiso, se revalida.
    empaquetar(ESTADO, 'https://atacante.example/oauth/whatsapp/callback'),
    // state original con forma imposible (no es el hex que genera Atlas).
    empaquetar('../../evil', CALLBACK_OK),
    empaquetar('', CALLBACK_OK),
  ];
  for (const state of malos) {
    const p = abrirPagina(qVuelta({ code: 'C', state }));
    assert.deepEqual(p.navegaciones, [], `no puede navegar con state=${state.slice(0, 24)}`);
    assert.equal(p.status.className, 'error');
    assert.match(p.status.textContent, /no se puede asociar a esta sesión/);
  }
  // Y sin `state` en absoluto.
  const sin = abrirPagina(qVuelta({ code: 'C' }));
  assert.deepEqual(sin.navegaciones, []);
});

test('el callback se RECONSTRUYE: una query colada en el empaquetado se descarta', () => {
  // Sin esto, alguien podría inyectar parámetros al servidor local de Atlas a
  // través de una página de un dominio de confianza.
  const sucio = 'http://127.0.0.1:53127/oauth/whatsapp/callback?code=FALSO&admin=1#frag';
  const state = ESTADO;
  const p = abrirPagina(qVuelta({ code: 'CODE-REAL', state: empaquetar(state, sucio) }));
  const url = new URL(p.navegaciones[0]);
  assert.equal(url.searchParams.get('code'), 'CODE-REAL', 'gana el code real de Meta');
  assert.equal(url.searchParams.get('admin'), null, 'los parámetros colados se pierden');
  assert.equal(url.hash, '', 'el fragmento se descarta');
  assert.deepEqual([...url.searchParams.keys()].sort(), ['code', 'state']);
});

test('el code sale de la barra de direcciones antes de volver a Atlas', () => {
  const state = ESTADO;
  const p = abrirPagina(qVuelta({ code: 'C', state: empaquetar(state, CALLBACK_OK) }));
  assert.deepEqual(p.historial, ['/atlas/whatsapp-signup/'], 'se limpia la query, no el path');
});

// ── 5. Falta de parámetros ──────────────────────────────────────────────────

test('falta de parámetros: se explica y no se navega a ninguna parte', () => {
  const completos = { app_id: APP_ID, config_id: CONFIG_ID, state: 'abc', callback: CALLBACK_OK };
  for (const ausente of Object.keys(completos)) {
    const query = Object.entries(completos)
      .filter(([k]) => k !== ausente)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const p = abrirPagina(`?${query}`);
    assert.equal(p.status.className, 'error', `debe fallar sin ${ausente}`);
    assert.match(p.status.textContent, /Faltan parámetros/, `mensaje claro sin ${ausente}`);
    assert.deepEqual(p.navegaciones, []);
  }
  // Y sin ningún parámetro (alguien entra a la URL a pelo desde un buscador).
  const vacia = abrirPagina('');
  assert.match(vacia.status.textContent, /Faltan parámetros/);
  assert.deepEqual(vacia.navegaciones, []);
});

// ── 6. Defensas de la propia página ─────────────────────────────────────────

test('la CSP sigue en su sitio, sin comodines y con el hash del script real', () => {
  const m = /<meta http-equiv="Content-Security-Policy" content="([\s\S]*?)"/.exec(html);
  assert.ok(m, 'la CSP no puede desaparecer sin que esta prueba lo diga');
  const csp = m[1];
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'none'/);
  assert.match(csp, /form-action 'none'/);
  assert.ok(!/script-src[^;]*\*/.test(csp), 'script-src no admite comodines');
  assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp), "'unsafe-inline' dejaría la CSP sin valor ante un XSS");
  assert.ok(!/'unsafe-eval'/.test(csp));
  // Sin SDK, la CSP se cierra del todo: ningún origen externo de script.
  assert.ok(!/script-src[^;]*https:/.test(csp), 'script-src ya no admite ningún origen remoto');

  // El hash tiene que corresponder al script que se publica: si alguien edita
  // el script y no recalcula el hash, la página deja de funcionar en silencio.
  const hash = `sha256-${createHash('sha256').update(scriptDeLaPagina(), 'utf8').digest('base64')}`;
  assert.ok(csp.includes(`'${hash}'`), `la CSP debe llevar el hash del script actual (${hash})`);
});

test('ningún sink peligroso: los parámetros nunca se interpretan como HTML ni código', () => {
  const s = scriptDeLaPagina();
  for (const sink of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'eval(', 'new Function', 'srcdoc', 'setAttribute']) {
    assert.ok(!s.includes(sink), `el script no puede usar ${sink}`);
  }
  assert.ok(!/\bon[a-z]+\s*=\s*["']/.test(html), 'sin manejadores de eventos en atributos HTML');
  assert.equal((html.match(/<script/g) ?? []).length, 1, 'un solo bloque de script: el extractor de estas pruebas ve TODO el código');
});

test('enmarcada en otra página: se niega a mostrarse (clickjacking)', () => {
  const p = abrirPagina(q(), { enmarcada: true });
  assert.ok(p.lanzo, 'el script debe abortar');
  assert.match(p.documentElement.textContent, /no puede mostrarse dentro de otra/);
  assert.deepEqual(p.navegaciones, []);
});

test('el state sale de la barra de direcciones en cuanto se ha leído', () => {
  const p = abrirPagina(q({ state: 'ESTADO-OPACO' }));
  assert.deepEqual(p.historial, ['/atlas/whatsapp-signup/'], 'se limpia la query, no el path');
  // Y aun así el flujo sigue funcionando: los valores ya están en variables.
  assert.equal(p.button.disabled, false);
});

test('formas numéricas de 127.0.0.1: se aceptan y acaban en el loopback normalizado', () => {
  // El parser del navegador las normaliza. Se fija aquí para que nadie
  // «endurezca» la validación con una comparación textual y las rompa.
  const state = ESTADO;
  for (const host of ['2130706433', '0x7f000001', '127.1', '127.0.1']) {
    const destino = `http://${host}:53127/oauth/whatsapp/callback`;
    assert.notEqual(abrirPagina(q({ callback: destino })).status.className, 'error', `debe aceptarse: ${host}`);
    const p = abrirPagina(qVuelta({ code: 'C', state: empaquetar(state, destino) }));
    assert.equal(new URL(p.navegaciones[0]).hostname, '127.0.0.1', `${host} debe normalizarse a 127.0.0.1`);
  }
});

test('esquemas no navegables y credenciales embebidas: rechazados', () => {
  for (const destino of [
    'ws://127.0.0.1:53127/oauth/whatsapp/callback',
    'wss://127.0.0.1:53127/oauth/whatsapp/callback',
    'ftp://127.0.0.1/oauth/whatsapp/callback',
    'http://atacante.example@127.0.0.1:53127/oauth/whatsapp/callback',
    'http://usuario:clave@127.0.0.1:53127/oauth/whatsapp/callback',
  ]) {
    const p = abrirPagina(q({ callback: destino }));
    assert.equal(p.status.className, 'error', `debe rechazarse: ${destino}`);
    assert.deepEqual(p.navegaciones, []);
  }
});

test('graph_version y feature van al diálogo solo si tienen la forma esperada', () => {
  for (const [entrada, esperado] of [['v22.0', '/v22.0/dialog/oauth'], ['../../evil', '/v23.0/dialog/oauth'], ['v99.99.99', '/v23.0/dialog/oauth'], ['', '/v23.0/dialog/oauth']]) {
    const dialogo = urlDelDialogo(abrirPagina(q({ graph_version: entrada })));
    assert.equal(dialogo.pathname, esperado, `graph_version=${entrada}`);
    assert.equal(dialogo.origin, 'https://www.facebook.com', `graph_version=${entrada} no puede cambiar el host`);
  }

  // `feature` llega a extras.featureType: solo minúsculas y guiones bajos.
  for (const [entrada, debePasar] of [['whatsapp_business_app_onboarding', true], ['<img src=x>', false], ['A'.repeat(200), false]]) {
    const dialogo = urlDelDialogo(abrirPagina(q({ feature: entrada })));
    const extras = JSON.parse(dialogo.searchParams.get('extras'));
    assert.equal('featureType' in extras, debePasar, `feature=${entrada.slice(0, 20)}`);
  }
});

// ── 7. Pareja app_id/config_id fijada ───────────────────────────────────────
// Sin esto, cualquiera podía enlazar la página con SU app de Meta y presentar
// un diálogo de consentimiento ajeno bajo un dominio de confianza: el `code`
// no se filtraba, pero los permisos se concedían a la app del atacante.

test('pareja CORRECTA: la página funciona y usa exactamente los valores de la URL', () => {
  const p = abrirPagina(q());
  assert.notEqual(p.status.className, 'error');
  const dialogo = urlDelDialogo(p);
  assert.equal(dialogo.searchParams.get('client_id'), APP_ID);
  assert.equal(dialogo.searchParams.get('config_id'), CONFIG_ID);
});

test('app_id INCORRECTO: rechazo explícito, sin sustituirlo en silencio', () => {
  for (const ajeno of ['9999999999999999', RETIRADOS[0].appId, '0', 'abc', `${APP_ID} `, ` ${APP_ID}`]) {
    const p = abrirPagina(q({ app_id: ajeno }));
    assert.equal(p.status.className, 'error', `debe rechazarse app_id=${ajeno}`);
    assert.match(p.status.textContent, /solo funciona con la aplicación de Atlas/);
    assert.match(p.status.textContent, /la aplicación no coincide/, 'dice CUÁL no cuadra');
    assert.deepEqual(p.navegaciones, [], `no abre ningún diálogo con app_id=${ajeno}`);
  }
});

test('config_id INCORRECTO: mismo trato', () => {
  for (const ajeno of [RETIRADOS[0].configId, '0', 'x']) {
    const p = abrirPagina(q({ config_id: ajeno }));
    assert.equal(p.status.className, 'error', `debe rechazarse config_id=${ajeno}`);
    assert.match(p.status.textContent, /la configuración no coincide/);
    assert.deepEqual(p.navegaciones, []);
  }
});

test('los dos incorrectos a la vez: se dice que fallan los dos', () => {
  const p = abrirPagina(q({ app_id: RETIRADOS[0].appId, config_id: RETIRADOS[0].configId }));
  assert.match(p.status.textContent, /la aplicación y la configuración no coinciden/);
  assert.deepEqual(p.navegaciones, []);
});

test('la pareja RETIRADA no puede volver por la puerta de atrás', () => {
  // `retirados` de meta-identificadores.json: la app de pruebas y la pareja
  // descartada. Ninguna puede abrir un diálogo desde esta página.
  const retirados = RETIRADOS;
  assert.ok(retirados.length > 0, 'la lista de retirados no puede quedarse vacía sin que se note');
  for (const r of retirados) {
    const p = abrirPagina(q({ app_id: r.appId, config_id: r.configId }));
    assert.equal(p.status.className, 'error', `${r.nombre} debe rechazarse`);
    assert.deepEqual(p.navegaciones, [], `${r.nombre} no puede abrir ningún diálogo`);
  }
});
