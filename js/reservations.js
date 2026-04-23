/* =====================================================
   K&A Balloons Studio — Reservation Form Validation
   Location restricted to Bogotá & nearby municipalities
   ===================================================== */

/* ============================================================
   BOGOTÁ LOCALITIES (UPZ / localidades)
   ============================================================ */
const BOGOTA_LOCALITIES = [
  // Bogotá official localities
  'usaquen','chapinero','santa fe','san cristóbal','san cristobal','usme',
  'tunjuelito','bosa','kennedy','fontibón','fontibon','engativá','engativa',
  'suba','barrios unidos','teusaquillo','los mártires','los martires',
  'antonio nariño','antonio narino','puente aranda','la candelaria',
  'rafael uribe uribe','rafael uribe','ciudad bolívar','ciudad bolivar',
  'sumapaz',
  // Common Bogotá neighborhoods / zones
  'chapinero alto','usaquén','chico','rosales','zona rosa','candelaria',
  'la soledad','palermo','teusaquillo','modelia','niza','castilla','kennedy',
  'tintal','corabastos','avenida jimenez','centro histórico','centro historico',
  'bogotá','bogota','norte de bogotá','norte de bogota','sur de bogotá',
  'occidente bogotá','oriente bogotá',
];

/* ============================================================
   NEARBY MUNICIPALITIES (Sabana de Bogotá + zona)
   ============================================================ */
const NEARBY_MUNICIPALITIES = [
  'chía','chia','cajicá','cajica','zipaquirá','zipaquira',
  'facatativá','facatativa','la calera','mosquera','madrid','funza',
  'cota','tenjo','tabio','sopó','sopo','tocancipá','tocancipa',
  'gachancipá','gachancipa','cogua','nemocon','nemocón','subachoque',
  'el rosal','bojáca','bojaca','zipacón','zipakon',
  'zipacon','anapoima','apulo','anolaima','vianí','viani','la mesa',
  'arbelaez','pasca','san bernardo','gutierrez','gutiérrez',
  // Broader Cundinamarca (extra coverage up to ~80km)
  'girardot','fusagasuga','fusagasugá','une','chipaque','ubaque',
  'choachi','choachí','guasca','guatavita','sesquilé','sesquile',
  'briceño','briceno','tocaima','ricaurte','villeta','nocaima',
];

const ALL_VALID_LOCATIONS = [...BOGOTA_LOCALITIES, ...NEARBY_MUNICIPALITIES];

/* ============================================================
   VALIDATION FUNCTION
   ============================================================ */
function isValidLocation(input) {
  if (!input || !input.trim()) return false;
  const normalized = input.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove accents for comparison

  return ALL_VALID_LOCATIONS.some(loc => {
    const normLoc = loc.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(normLoc) || normLoc.includes(normalized);
  });
}

/* ============================================================
   LOCATION AUTOCOMPLETE / SUGGESTIONS
   ============================================================ */
const LOCATION_OPTIONS_ES = [
  // Bogotá localities
  'Usaquén, Bogotá',
  'Chapinero, Bogotá',
  'Santa Fe, Bogotá',
  'San Cristóbal, Bogotá',
  'Usme, Bogotá',
  'Tunjuelito, Bogotá',
  'Bosa, Bogotá',
  'Kennedy, Bogotá',
  'Fontibón, Bogotá',
  'Engativá, Bogotá',
  'Suba, Bogotá',
  'Barrios Unidos, Bogotá',
  'Teusaquillo, Bogotá',
  'Los Mártires, Bogotá',
  'Antonio Nariño, Bogotá',
  'Puente Aranda, Bogotá',
  'La Candelaria, Bogotá',
  'Rafael Uribe Uribe, Bogotá',
  'Ciudad Bolívar, Bogotá',
  // Nearby
  'Chía, Cundinamarca',
  'Cajicá, Cundinamarca',
  'Zipaquirá, Cundinamarca',
  'Facatativá, Cundinamarca',
  'La Calera, Cundinamarca',
  'Mosquera, Cundinamarca',
  'Madrid, Cundinamarca',
  'Funza, Cundinamarca',
  'Cota, Cundinamarca',
  'Tenjo, Cundinamarca',
  'Tabio, Cundinamarca',
  'Sopó, Cundinamarca',
  'Tocancipá, Cundinamarca',
  'Gachancipá, Cundinamarca',
];

function buildLocationDatalist(datalistId) {
  const dl = document.getElementById(datalistId);
  if (!dl) return;
  LOCATION_OPTIONS_ES.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    dl.appendChild(opt);
  });
}

/* ============================================================
   FORM SUBMISSION HANDLER
   ============================================================ */
function initReservationForm() {
  const form = document.getElementById('form-reservation');
  if (!form) return;

  buildLocationDatalist('location-datalist');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearReservationErrors();

    const lang = localStorage.getItem('ka_lang') || 'es';
    const t = typeof window.KA?.t === 'function' ? window.KA.t : k => k;
    let valid = true;

    // Collect values
    const name      = form.querySelector('[name="res-name"]')?.value.trim();
    const email     = form.querySelector('[name="res-email"]')?.value.trim();
    const phone     = form.querySelector('[name="res-phone"]')?.value.trim();
    const service   = form.querySelector('[name="res-service"]')?.value;
    const date      = form.querySelector('[name="res-date"]')?.value;
    const location  = form.querySelector('[name="res-location"]')?.value.trim();
    const address   = form.querySelector('[name="res-address"]')?.value.trim();
    const notes     = form.querySelector('[name="res-notes"]')?.value.trim();

    // Validations
    if (!name) { setResError('res-name', t('err_required')); valid = false; }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResError('res-email', t('err_email')); valid = false;
    }

    if (!phone || phone.length < 7) {
      setResError('res-phone', t('err_phone')); valid = false;
    }

    if (!service) { setResError('res-service', t('err_required')); valid = false; }

    if (!date) {
      setResError('res-date', t('err_required')); valid = false;
    } else {
      const selected = new Date(date + 'T00:00:00');
      const today    = new Date(); today.setHours(0,0,0,0);
      if (selected <= today) { setResError('res-date', t('err_date')); valid = false; }
    }

    // ★ LOCATION VALIDATION — Bogotá / nearby only
    if (!location) {
      setResError('res-location', t('err_required')); valid = false;
    } else if (!isValidLocation(location)) {
      setResError('res-location', t('err_location')); valid = false;
    }

    if (!address) { setResError('res-address', t('err_required')); valid = false; }

    if (!valid) return;

    // Submit
    const btn = form.querySelector('[type="submit"]');
    setResLoading(btn, true);

    let saved = false;
    // Save reservation to localStorage for admin review
    try {
      const stored = JSON.parse(localStorage.getItem('ka_reservations') || '[]');
      stored.push({
        id:        'res_' + Date.now(),
        name, email, phone, service, date, location, address,
        notes:     notes || '',
        status:    'pendiente',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('ka_reservations', JSON.stringify(stored));
      saved = true;
    } catch (_) {
      saved = false;
    }

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1400));

    setResLoading(btn, false);
    if (saved) {
      form.reset();
      showResConfirmModal('success');
    } else {
      showResConfirmModal('error');
    }
  });

  // Real-time location feedback
  const locInput = form.querySelector('[name="res-location"]');
  if (locInput) {
    locInput.addEventListener('blur', () => {
      const val = locInput.value.trim();
      if (val && !isValidLocation(val)) {
        setResError('res-location',
          (localStorage.getItem('ka_lang') === 'en')
            ? 'We only serve Bogotá and nearby municipalities.'
            : 'Solo prestamos servicios en Bogotá y municipios cercanos.'
        );
      } else {
        clearResError('res-location');
      }
    });
    locInput.addEventListener('input', () => {
      if (isValidLocation(locInput.value.trim())) clearResError('res-location');
    });
  }
}

/* ============================================================
   RESERVATION CONFIRMATION MODAL
   ============================================================ */
function showResConfirmModal(state) {
  const modal   = document.getElementById('res-confirm-modal');
  const success = document.getElementById('rcm-success');
  const error   = document.getElementById('rcm-error');
  const closeBtn = document.getElementById('rcm-close-btn');
  if (!modal) return;

  success.hidden = (state !== 'success');
  error.hidden   = (state !== 'error');

  // Show overlay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('rcm-show'));
  });

  function hideModal() {
    modal.classList.remove('rcm-show');
  }
  closeBtn.onclick = hideModal;
  modal.addEventListener('click', e => { if (e.target === modal) hideModal(); }, { once: true });
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') { hideModal(); document.removeEventListener('keydown', onEsc); }
  });
}

/* ============================================================
   CONTACT FORM HANDLER
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('form-contact');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearContactErrors();

    const t = typeof window.KA?.t === 'function' ? window.KA.t : k => k;
    let valid = true;

    const name    = form.querySelector('[name="c-name"]')?.value.trim();
    const email   = form.querySelector('[name="c-email"]')?.value.trim();
    const message = form.querySelector('[name="c-message"]')?.value.trim();

    if (!name)  { setCError('c-name',    t('err_required')); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCError('c-email', t('err_email')); valid = false;
    }
    if (!message) { setCError('c-message', t('err_required')); valid = false; }
    if (!valid) return;

    const btn = form.querySelector('[type="submit"]');
    setResLoading(btn, true);
    await new Promise(r => setTimeout(r, 1200));
    setResLoading(btn, false);

    window.KA?.showToast('success', '¡Mensaje Enviado! / Message Sent!', '', 4000);
    form.reset();
  });
}

/* ============================================================
   HELPERS
   ============================================================ */
function setResError(name, msg) {
  const input = document.querySelector(`[name="${name}"]`);
  const error = document.getElementById(name + '-error');
  if (input)  input.classList.add('error');
  if (error) { error.textContent = msg; error.classList.add('show'); }
}
function clearResError(name) {
  const input = document.querySelector(`[name="${name}"]`);
  const error = document.getElementById(name + '-error');
  if (input)  input.classList.remove('error');
  if (error)  error.classList.remove('show');
}
function clearReservationErrors() {
  document.querySelectorAll('#form-reservation .form-input.error, #form-reservation .form-select.error, #form-reservation .form-textarea.error')
    .forEach(el => el.classList.remove('error'));
  document.querySelectorAll('#form-reservation .form-error.show')
    .forEach(el => el.classList.remove('show'));
}
function setCError(name, msg) {
  const input = document.querySelector(`#form-contact [name="${name}"]`);
  const error = document.getElementById(name + '-cerror');
  if (input)  input.classList.add('error');
  if (error) { error.textContent = msg; error.classList.add('show'); }
}
function clearContactErrors() {
  document.querySelectorAll('#form-contact .form-input.error, #form-contact .form-textarea.error')
    .forEach(el => el.classList.remove('error'));
  document.querySelectorAll('#form-contact .form-error.show')
    .forEach(el => el.classList.remove('show'));
}
function setResLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn._text = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._text || btn.innerHTML;
    btn.disabled = false;
  }
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initReservationForm();
  initContactForm();
  // Populate min date for date input
  const dateInput = document.querySelector('[name="res-date"]');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }
});
