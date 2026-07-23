(function () {
  const isCa = document.documentElement.lang === 'ca';
  const formatter = new Intl.NumberFormat(isCa ? 'ca-ES' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  const els = {
    units: document.getElementById('units'),
    months: document.getElementById('months'),
    adr: document.getElementById('adr'),
    occupancy: document.getElementById('occupancy'),
    ota: document.getElementById('ota'),
    commission: document.getElementById('commission'),
    recovery: document.getElementById('recovery'),
    unitsValue: document.getElementById('unitsValue'),
    monthsValue: document.getElementById('monthsValue'),
    adrValue: document.getElementById('adrValue'),
    occupancyValue: document.getElementById('occupancyValue'),
    otaValue: document.getElementById('otaValue'),
    commissionValue: document.getElementById('commissionValue'),
    recoveryValue: document.getElementById('recoveryValue'),
    mainRecovery: document.getElementById('mainRecovery'),
    mainRecoveryText: document.getElementById('mainRecoveryText'),
    seasonRevenue: document.getElementById('seasonRevenue'),
    otaRevenue: document.getElementById('otaRevenue'),
    intermediationCost: document.getElementById('intermediationCost'),
    targetRecovery: document.getElementById('targetRecovery'),
    scenario5: document.getElementById('scenario5'),
    scenario10: document.getElementById('scenario10'),
    scenario15: document.getElementById('scenario15'),
    scenario20: document.getElementById('scenario20')
  };

  function numberValue(input) {
    return Number(input.value || 0);
  }

  function calculate() {
    const unidades = numberValue(els.units);
    const mesesAbierto = numberValue(els.months);
    const precioMedio = numberValue(els.adr);
    const ocupacion = numberValue(els.occupancy) / 100;
    const porcentajeOTA = numberValue(els.ota) / 100;
    const comisionOTA = numberValue(els.commission) / 100;
    const objetivoRecuperacion = numberValue(els.recovery) / 100;

    const nochesAbiertas = mesesAbierto * 30;
    const nochesDisponibles = unidades * nochesAbiertas;
    const nochesVendidas = nochesDisponibles * ocupacion;
    const facturacionTemporada = nochesVendidas * precioMedio;
    const facturacionOTA = facturacionTemporada * porcentajeOTA;
    const costeIntermediacion = facturacionOTA * comisionOTA;
    const margenRecuperable = facturacionOTA * objetivoRecuperacion * comisionOTA;

    const escenario5 = facturacionOTA * 0.05 * comisionOTA;
    const escenario10 = facturacionOTA * 0.10 * comisionOTA;
    const escenario15 = facturacionOTA * 0.15 * comisionOTA;
    const escenario20 = facturacionOTA * 0.20 * comisionOTA;

    els.unitsValue.textContent = unidades.toString();
    els.monthsValue.textContent = isCa
      ? `${mesesAbierto} ${mesesAbierto === 1 ? 'mes' : 'mesos'} · ${nochesAbiertas} nits`
      : `${mesesAbierto} ${mesesAbierto === 1 ? 'mes' : 'meses'} · ${nochesAbiertas} noches`;
    els.adrValue.textContent = `${precioMedio} €`;
    els.occupancyValue.textContent = `${Math.round(ocupacion * 100)}%`;
    els.otaValue.textContent = `${Math.round(porcentajeOTA * 100)}%`;
    els.commissionValue.textContent = `${Math.round(comisionOTA * 100)}%`;
    els.recoveryValue.textContent = `${Math.round(objetivoRecuperacion * 100)}%`;

    els.mainRecovery.textContent = formatter.format(margenRecuperable);
    els.mainRecoveryText.textContent = isCa
      ? `Movent un ${Math.round(objetivoRecuperacion * 100)}% de les reserves OTA cap al canal directe.`
      : `Moviendo un ${Math.round(objetivoRecuperacion * 100)}% de las reservas OTA hacia canal directo.`;
    els.seasonRevenue.textContent = formatter.format(facturacionTemporada);
    els.otaRevenue.textContent = formatter.format(facturacionOTA);
    els.intermediationCost.textContent = formatter.format(costeIntermediacion);
    els.targetRecovery.textContent = formatter.format(margenRecuperable);
    els.scenario5.textContent = formatter.format(escenario5);
    els.scenario10.textContent = formatter.format(escenario10);
    els.scenario15.textContent = formatter.format(escenario15);
    els.scenario20.textContent = formatter.format(escenario20);
  }

  ['units', 'months', 'adr', 'occupancy', 'ota', 'commission', 'recovery'].forEach((key) => {
    if (els[key]) els[key].addEventListener('input', calculate);
  });

  calculate();

  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const form = document.getElementById('auditForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      const keyInput = form.querySelector('input[name="access_key"]');
      if (keyInput && keyInput.value.includes('PEGA_AQUI')) {
        event.preventDefault();
        alert('Falta poner la access_key real de Web3Forms en el formulario antes de publicar. Si ya tienes una clave en tu web actual, copia ese value aquí.');
      }
    });
  }
})();
