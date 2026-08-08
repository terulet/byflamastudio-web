/**
 * Pruebas de la página host del Embedded Signup (atlas/whatsapp-signup/).
 *
 * Ejecutan el script REAL extraído del HTML publicado, sobre un DOM mínimo
 * construido a mano: sin dependencias, sin navegador y sin red. Lo que se
 * comprueba es lo que puede convertir una página de un dominio de confianza en
 * un problema — que acepte un destino de retorno ajeno, que guarde o registre
 * el `state`, o que lleve dentro un valor que no debería estar ahí.
 *
 * El directorio se llama `_tests`: Jekyll (que sirve este sitio en GitHub
 * Pages) no publica los directorios que empiezan por guion bajo, así que estas
 * pruebas quedan en el repositorio pero NO en https://byflamastudio.com/.
 *
 * Uso:  node --test atlas/whatsapp-signup/_tests/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const dir = dirname(fileURLToPath(import.meta.url));
const PAGINA = join(dir, '..', 'index.html');
const html = readFileSync(PAGINA, 'utf8');

const BASE = 'https://byflamastudio.com/atlas/whatsapp-signup/';
const CALLBACK_OK = 'http://127.0.0.1:53127/oauth/whatsapp/callback';

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
function abrirPagina(query, { fb = null, enmarcada = false } = {}) {
  const registro = { navegaciones: [], scriptsCargados: [], listeners: {}, consola: [], historial: [] };
  const elemento = (id, disabled = false) => ({ id, textContent: '', className: '', disabled, _clicks: [],
    addEventListener(tipo, fn) { if (tipo === 'click') this._clicks.push(fn); } });
  const status = elemento('status');
  // El estado inicial del botón se LEE del HTML publicado: si algún día se
  // quitara el atributo `disabled`, la prueba tiene que enterarse en vez de
  // seguir midiendo un supuesto suyo.
  const button = elemento('go', /<button id="go"[^>]*\bdisabled\b/.test(html));

  const location = {
    href: `${BASE}${query}`,
    pathname: new URL(BASE).pathname,
    search: query.startsWith('?') ? query : `?${query}`,
    assign(destino) { registro.navegaciones.push(destino); },
  };
  const documentElement = { textContent: '' };
  const document = {
    documentElement,
    getElementById: (id) => (id === 'status' ? status : id === 'go' ? button : null),
    createElement: () => {
      const el = { tagName: 'script', src: '', async: false, defer: false, crossOrigin: '', onerror: null };
      registro.creado = el;
      return el;
    },
    head: { appendChild: (el) => registro.scriptsCargados.push(el) },
  };
  // Temporizadores deterministas: nada de esperas reales en la suite.
  const pendientes = new Map();
  let siguiente = 1;
  const temporizar = (fn) => { pendientes.set(siguiente, fn); return siguiente++; };
  const cancelar = (id) => pendientes.delete(id);
  const history = { replaceState: (_a, _b, url) => registro.historial.push(url) };
  const window = {
    addEventListener(tipo, fn) { (registro.listeners[tipo] ??= []).push(fn); },
    fbAsyncInit: null,
  };
  // Por defecto la página NO está enmarcada; `enmarcada: true` la mete en un
  // iframe para probar la defensa anti-clickjacking.
  window.self = window;
  window.top = enmarcada ? { ajena: true } : window;

  const sandbox = {
    window, document, location, history, URL, URLSearchParams, JSON, Object, Error, RegExp, setTimeout: temporizar, clearTimeout: cancelar, console: {
      log: (...a) => registro.consola.push(a), warn: (...a) => registro.consola.push(a), error: (...a) => registro.consola.push(a),
    },
    FB: fb,
  };
  sandbox.globalThis = sandbox;
  sandbox.__correrTemporizadores = () => { for (const fn of [...pendientes.values()]) fn(); pendientes.clear(); };
  vm.createContext(sandbox);
  let lanzo = null;
  try { vm.runInContext(scriptDeLaPagina(), sandbox); } catch (e) { lanzo = e; }
  return { ...registro, status, button, window, documentElement, sandbox, lanzo };
}

// ── 1. Carga estática ───────────────────────────────────────────────────────

test('carga estática: la página se sirve entera y pide el SDK de Meta por HTTPS', () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<title>Conectar WhatsApp con Atlas<\/title>/);
  // noindex obligatorio: es una página operativa, no contenido público.
  assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
  // El `state` no puede viajar en la cabecera Referer hacia Meta.
  assert.match(html, /<meta name="referrer" content="no-referrer" \/>/);

  const p = abrirPagina(`?app_id=1&config_id=2&state=abc&callback=${encodeURIComponent(CALLBACK_OK)}`);
  assert.equal(p.scriptsCargados.length, 1, 'carga exactamente un script externo');
  assert.equal(p.scriptsCargados[0].src, 'https://connect.facebook.net/es_ES/sdk.js');
  assert.equal(p.button.disabled, true, 'el botón sigue bloqueado hasta que el SDK inicializa');
});

// ── 2. Rechazo de callback externo (no es un redirector abierto) ────────────

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
    const p = abrirPagina(`?app_id=1&config_id=2&state=abc&callback=${encodeURIComponent(destino)}`);
    assert.equal(p.status.className, 'error', `debe rechazarse: ${destino}`);
    assert.match(p.status.textContent, /destino de retorno no es válido/, destino);
    assert.equal(p.button.disabled, true, `botón bloqueado con ${destino}`);
    assert.deepEqual(p.navegaciones, [], `NO puede navegar a ${destino}`);
    assert.equal(p.scriptsCargados.length, 0, `ni siquiera carga el SDK con ${destino}`);
  }
});

// ── 3. Aceptación del loopback de Atlas ─────────────────────────────────────

test('aceptación del loopback: 127.0.0.1 + /oauth/whatsapp/callback en cualquier puerto', () => {
  for (const destino of [
    'http://127.0.0.1:53127/oauth/whatsapp/callback',
    'http://127.0.0.1:8080/oauth/whatsapp/callback',
    'https://127.0.0.1:53127/oauth/whatsapp/callback',
  ]) {
    const p = abrirPagina(`?app_id=1&config_id=2&state=abc&callback=${encodeURIComponent(destino)}`);
    assert.notEqual(p.status.className, 'error', `debe aceptarse: ${destino}`);
    assert.equal(p.scriptsCargados.length, 1, `carga el SDK con ${destino}`);
  }
});

test('éxito: devuelve el code y el state TAL CUAL al loopback', () => {
  const state = 'ESTADO-OPACO-DE-ATLAS-123';
  const fb = {
    init() {},
    login(cb) { cb({ authResponse: { code: 'CODE-DE-META-XYZ' } }); },
  };
  const p = abrirPagina(`?app_id=1&config_id=2&state=${state}&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
  p.window.fbAsyncInit();
  assert.equal(p.button.disabled, false, 'el SDK habilita el botón');
  p.button._clicks[0]();

  assert.equal(p.navegaciones.length, 1);
  const url = new URL(p.navegaciones[0]);
  assert.equal(url.origin, 'http://127.0.0.1:53127');
  assert.equal(url.pathname, '/oauth/whatsapp/callback');
  assert.equal(url.searchParams.get('code'), 'CODE-DE-META-XYZ');
  assert.equal(url.searchParams.get('state'), state, 'el state se reenvía sin tocarlo');
});

test('el callback se RECONSTRUYE: una query colada en el parámetro se descarta', () => {
  // Sin esto, alguien podría inyectar parámetros al servidor local de Atlas a
  // través de una página de un dominio de confianza.
  const sucio = 'http://127.0.0.1:53127/oauth/whatsapp/callback?code=FALSO&admin=1#frag';
  const fb = { init() {}, login(cb) { cb({ authResponse: { code: 'CODE-REAL' } }); } };
  const p = abrirPagina(`?app_id=1&config_id=2&state=s1&callback=${encodeURIComponent(sucio)}`, { fb });
  p.window.fbAsyncInit();
  p.button._clicks[0]();

  const url = new URL(p.navegaciones[0]);
  assert.equal(url.searchParams.get('code'), 'CODE-REAL', 'gana el code real de Meta');
  assert.equal(url.searchParams.get('admin'), null, 'los parámetros colados se pierden');
  assert.equal(url.hash, '', 'el fragmento se descarta');
  assert.deepEqual([...url.searchParams.keys()].sort(), ['code', 'state']);
});

// ── 4. Falta de parámetros ──────────────────────────────────────────────────

test('falta de parámetros: se explica y NO se carga nada de Meta', () => {
  const completos = { app_id: '1', config_id: '2', state: 'abc', callback: CALLBACK_OK };
  for (const ausente of Object.keys(completos)) {
    const q = Object.entries(completos)
      .filter(([k]) => k !== ausente)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const p = abrirPagina(`?${q}`);
    assert.equal(p.status.className, 'error', `debe fallar sin ${ausente}`);
    assert.match(p.status.textContent, /Faltan parámetros/, `mensaje claro sin ${ausente}`);
    assert.equal(p.scriptsCargados.length, 0, `sin ${ausente} no se carga el SDK`);
    assert.deepEqual(p.navegaciones, []);
  }
  // Y sin ningún parámetro (alguien entra a la URL a pelo desde un buscador).
  const vacia = abrirPagina('');
  assert.match(vacia.status.textContent, /Faltan parámetros/);
  assert.equal(vacia.scriptsCargados.length, 0);
});

// ── 5. Cancelación y error de Meta ──────────────────────────────────────────

test('cancelación del usuario: vuelve a Atlas con access_denied y el state', () => {
  const fb = { init() {}, login(cb) { cb({ status: 'unknown' }); } };   // el usuario cierra el diálogo
  const p = abrirPagina(`?app_id=1&config_id=2&state=s-cancel&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
  p.window.fbAsyncInit();
  p.button._clicks[0]();

  const url = new URL(p.navegaciones[0]);
  assert.equal(url.searchParams.get('error'), 'access_denied');
  assert.equal(url.searchParams.get('state'), 's-cancel');
  assert.equal(url.searchParams.get('code'), null, 'jamás un code inventado');
});

test('respuesta de Meta sin code (o vacía): tampoco se inventa un éxito', () => {
  for (const respuesta of [null, undefined, {}, { authResponse: {} }, { authResponse: { code: '' } }]) {
    const fb = { init() {}, login(cb) { cb(respuesta); } };
    const p = abrirPagina(`?app_id=1&config_id=2&state=s2&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
    p.window.fbAsyncInit();
    p.button._clicks[0]();
    const url = new URL(p.navegaciones[0]);
    assert.equal(url.searchParams.get('error'), 'access_denied', `respuesta ${JSON.stringify(respuesta)}`);
    assert.equal(url.searchParams.get('code'), null);
  }
});

test('el SDK de Meta no carga: se avisa y el botón queda bloqueado', () => {
  const p = abrirPagina(`?app_id=1&config_id=2&state=s3&callback=${encodeURIComponent(CALLBACK_OK)}`);
  p.creado.onerror();
  assert.equal(p.status.className, 'error');
  assert.match(p.status.textContent, /No se pudo cargar el módulo de Meta/);
  assert.equal(p.button.disabled, true);
});

test('postMessage: solo se atiende a facebook.com por HTTPS, y nunca revienta', () => {
  const p = abrirPagina(`?app_id=1&config_id=2&state=s4&callback=${encodeURIComponent(CALLBACK_OK)}`);
  const escuchar = p.listeners.message[0];
  const finish = JSON.stringify({ type: 'WA_EMBEDDED_SIGNUP', event: 'FINISH' });

  // Orígenes que NO son Meta: se ignoran sin lanzar.
  for (const origin of ['https://atacante.example', 'http://www.facebook.com', 'https://notfacebook.com', 'null', '']) {
    assert.doesNotThrow(() => escuchar({ origin, data: finish }), `origen ${origin}`);
  }
  assert.ok(!/Cuenta seleccionada/.test(p.status.textContent), 'ningún origen ajeno cambia la interfaz');

  // Datos ilegibles desde un origen legítimo: tampoco lanzan.
  assert.doesNotThrow(() => escuchar({ origin: 'https://www.facebook.com', data: 'no es json' }));

  escuchar({ origin: 'https://www.facebook.com', data: finish });
  assert.match(p.status.textContent, /Cuenta seleccionada/);
});

// ── 6. Ausencia de secretos y de rastro ─────────────────────────────────────

test('la página NO lleva App ID, config_id, tokens ni ningún valor de despliegue', () => {
  // Todo llega por query string en cada apertura: en reposo no hay nada que robar.
  const prohibidos = [
    ['App ID de la app canaria', /\b1538119581128850\b/],
    ['config_id de Embedded Signup', /\b1431463065493437\b/],
    ['cualquier App ID largo incrustado', /appId\s*[:=]\s*['"]\d{6,}/],
    ['cualquier config_id incrustado', /config_?[iI]d\s*[:=]\s*['"]\d{6,}/],
    ['token de Meta', /\bEA[A-Za-z0-9]{20,}\b/],
    ['App Secret / hexadecimal largo', /\b[A-Fa-f0-9]{32,}\b/],
    ['clave privada', /PRIVATE KEY/],
  ];
  for (const [nombre, patron] of prohibidos) {
    assert.ok(!patron.test(html), `la página no puede contener ${nombre}`);
  }
  // Los cuatro parámetros se LEEN del query string, no de constantes.
  for (const p of ['app_id', 'config_id', 'state', 'callback']) {
    assert.ok(html.includes(`params.get('${p}')`), `${p} debe venir por query string`);
  }
});

test('la página NO almacena ni registra nada', () => {
  const script = scriptDeLaPagina();
  const prohibidos = [
    'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
    'fetch(', 'XMLHttpRequest', 'sendBeacon', 'console.',
  ];
  for (const api of prohibidos) {
    assert.ok(!script.includes(api), `el script no puede usar ${api}`);
  }
  // Y en ejecución real no se llama a la consola ni una vez.
  const fb = { init() {}, login(cb) { cb({ authResponse: { code: 'C' } }); } };
  const p = abrirPagina(`?app_id=1&config_id=2&state=SECRETO-OPACO&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
  p.window.fbAsyncInit();
  p.button._clicks[0]();
  assert.deepEqual(p.consola, [], 'ni un registro, ni siquiera de diagnóstico');
  // El único destino externo es el SDK; el state no viaja a ningún otro sitio.
  assert.deepEqual(p.scriptsCargados.map((s) => s.src), ['https://connect.facebook.net/es_ES/sdk.js']);
  assert.ok(!p.scriptsCargados[0].src.includes('SECRETO-OPACO'));
});

test('el SDK se inicializa con telemetría desactivada', () => {
  let opciones = null;
  const fb = { init(o) { opciones = o; }, login() {} };
  const p = abrirPagina(`?app_id=99&config_id=2&state=s&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
  p.window.fbAsyncInit();
  assert.equal(opciones.autoLogAppEvents, false, 'sin eventos automáticos hacia Meta');
  assert.equal(opciones.xfbml, false);
  assert.equal(opciones.appId, '99', 'el App ID sale del query string, no del código');
});

// ── 7. Defensas de la propia página (lo que la revisión adversarial exigió) ──

test('la CSP sigue en su sitio, sin comodines y con el hash del script real', () => {
  // La cabecera del fichero invita a retirar la CSP si bloqueara algo; sin esta
  // prueba, retirarla no dejaría ni rastro.
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
  assert.match(csp, /script-src[^;]*https:\/\/connect\.facebook\.net/);

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
  // `frame-ancestors` se ignora en una CSP declarada por <meta> y GitHub Pages
  // no permite cabeceras propias: la defensa tiene que estar en el script.
  const p = abrirPagina(`?app_id=1&config_id=2&state=abc&callback=${encodeURIComponent(CALLBACK_OK)}`, { enmarcada: true });
  assert.ok(p.lanzo, 'el script debe abortar');
  assert.match(p.documentElement.textContent, /no puede mostrarse dentro de otra/);
  assert.equal(p.scriptsCargados.length, 0, 'enmarcada no carga ni el SDK');
  assert.deepEqual(p.navegaciones, []);
});

test('el state sale de la barra de direcciones en cuanto se ha leído', () => {
  const p = abrirPagina(`?app_id=1&config_id=2&state=ESTADO-OPACO&callback=${encodeURIComponent(CALLBACK_OK)}`);
  assert.deepEqual(p.historial, ['/atlas/whatsapp-signup/'], 'se limpia la query, no el path');
  // Y aun así el flujo sigue funcionando: los valores ya están en variables.
  assert.equal(p.scriptsCargados.length, 1);
});

test('formas numéricas de 127.0.0.1: se aceptan y acaban en el loopback normalizado', () => {
  // El parser del navegador las normaliza. Se fija aquí para que nadie
  // «endurezca» la validación con una comparación textual y las rompa.
  for (const host of ['2130706433', '0x7f000001', '127.1', '127.0.1']) {
    const destino = `http://${host}:53127/oauth/whatsapp/callback`;
    const fb = { init() {}, login(cb) { cb({ authResponse: { code: 'C' } }); } };
    const p = abrirPagina(`?app_id=1&config_id=2&state=s&callback=${encodeURIComponent(destino)}`, { fb });
    assert.notEqual(p.status.className, 'error', `debe aceptarse: ${host}`);
    p.window.fbAsyncInit();
    p.button._clicks[0]();
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
    const p = abrirPagina(`?app_id=1&config_id=2&state=abc&callback=${encodeURIComponent(destino)}`);
    assert.equal(p.status.className, 'error', `debe rechazarse: ${destino}`);
    assert.equal(p.scriptsCargados.length, 0);
  }
});

test('graph_version y feature van al SDK solo si tienen la forma esperada', () => {
  const casos = [
    ['v22.0', 'v22.0'],
    ['../../evil', 'v23.0'],
    ['v99.99.99', 'v23.0'],
    ['', 'v23.0'],
  ];
  for (const [entrada, esperado] of casos) {
    let opciones = null;
    const fb = { init(o) { opciones = o; }, login() {} };
    const p = abrirPagina(`?app_id=1&config_id=2&state=s&graph_version=${encodeURIComponent(entrada)}&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
    p.window.fbAsyncInit();
    assert.equal(opciones.version, esperado, `graph_version=${entrada}`);
  }

  // `feature` llega a extras.featureType: solo minúsculas y guiones bajos.
  for (const [entrada, debePasar] of [['whatsapp_business_app_onboarding', true], ['<img src=x>', false], ['A'.repeat(200), false]]) {
    let opciones = null;
    const fb = { init() {}, login(_cb, o) { opciones = o; } };
    const p = abrirPagina(`?app_id=1&config_id=2&state=s&feature=${encodeURIComponent(entrada)}&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
    p.window.fbAsyncInit();
    p.button._clicks[0]();
    assert.equal('featureType' in opciones.extras, debePasar, `feature=${entrada.slice(0, 20)}`);
  }
});

test('si Meta no responde nunca, la página se recupera sola', () => {
  const fb = { init() {}, login() { /* nunca llama al callback */ } };
  const p = abrirPagina(`?app_id=1&config_id=2&state=s&callback=${encodeURIComponent(CALLBACK_OK)}`, { fb });
  p.window.fbAsyncInit();
  p.button._clicks[0]();
  assert.equal(p.button.disabled, true, 'mientras espera, el botón está bloqueado');
  p.sandbox.__correrTemporizadores();
  assert.equal(p.button.disabled, false, 'tras el plazo se puede reintentar');
  assert.match(p.status.textContent, /Meta no ha respondido/);
  assert.deepEqual(p.navegaciones, [], 'no se inventa ni un code ni un error');
});
