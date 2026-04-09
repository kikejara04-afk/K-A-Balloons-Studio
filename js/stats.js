/**
 * stats.js — Contadores dinámicos y sistema de reseñas
 * K&A Balloons Studio
 *
 * Contadores en index.html:
 *   #stat-eventos    → ka_eventos_counter (base 7, +completadas desde admin)
 *   #stat-clientes   → 200 + total reservas, redondeado a la decena inferior
 *   #stat-calificacion → promedio de reseñas en ka_reviews (default "5★")
 *
 * Sección de reseñas:
 *   #reviews-grid   → top 3 reseñas por calificación
 *   #form-review    → formulario para que clientes dejen su reseña
 */

(function () {
  'use strict';

  /* ── LocalStorage helpers ─────────────────────────────────── */
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (_) { return fallback; }
  }
  function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  /* ── Formatear número de estadística ─────────────────────── */
  // Redondea a la decena inferior; si ≥ 1 000 devuelve "Xk"
  function fmtCount(n) {
    var rounded = Math.floor(n / 10) * 10;
    if (rounded >= 1000) return Math.floor(rounded / 1000) + 'k';
    return rounded;
  }

  /* ── Calcular valores ────────────────────────────────────── */
  function compute() {
    var reservations = loadJSON('ka_reservations', []);
    var reviews      = loadJSON('ka_reviews', []);

    // Eventos realizados: base 7 + reservas completadas (manejado desde admin)
    var eventos = Math.max(7, parseInt(localStorage.getItem('ka_eventos_counter') || '7', 10));

    // Clientes felices: base 200 + total reservas, redondeado a la decena
    var clientes = fmtCount(200 + reservations.length);

    // Calificación: promedio de reseñas o "5★" por defecto
    var rating = '5★';
    if (reviews.length > 0) {
      var avg = reviews.reduce(function (s, r) { return s + (r.rating || 5); }, 0) / reviews.length;
      rating = avg.toFixed(1).replace(/\.0$/, '') + '★';
    }

    return { eventos: eventos, clientes: clientes, rating: rating, reviews: reviews };
  }

  /* ── Animación numérica propia (independiente de main.js) ── */
  function animNum(el, target) {
    if (!el || typeof target !== 'number') return;
    var start    = performance.now();
    var duration = 1400;
    function frame(now) {
      var progress = Math.min((now - start) / duration, 1);
      var ease     = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      el.textContent = '+' + Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ── Actualizar contadores en el DOM ─────────────────────── */
  function renderStats() {
    var s = compute();

    // Eventos realizados — animado por stats.js (sin data-counter en HTML)
    var elEv = document.getElementById('stat-eventos');
    if (elEv) animNum(elEv, s.eventos);

    // Clientes felices
    var elCl = document.getElementById('stat-clientes');
    if (elCl) {
      if (typeof s.clientes === 'number') {
        animNum(elCl, s.clientes);
      } else {
        // Número tipo "10k"
        elCl.textContent = '+' + s.clientes;
      }
    }

    // Calificación (no es número, texto directo)
    var elRa = document.getElementById('stat-calificacion');
    if (elRa) elRa.textContent = s.rating;
  }

  /* ── Renderizar top 3 reseñas ───────────────────────────── */
  function renderReviews() {
    var grid = document.getElementById('reviews-grid');
    if (!grid) return;

    var reviews = loadJSON('ka_reviews', []);
    var emptyEl = document.getElementById('reviews-empty');

    // Sin reseñas reales: conservar el contenido estático de fallback
    if (reviews.length === 0) {
      return;
    }

    // Con reseñas: limpiar fallback y renderizar las reales
    grid.querySelectorAll('.review-card').forEach(function (el) { el.remove(); });
    if (emptyEl) emptyEl.style.display = 'none';

    // Top 3 por calificación desc, luego fecha desc
    var top3 = reviews.slice().sort(function (a, b) {
      return (b.rating - a.rating) || (new Date(b.date) - new Date(a.date));
    }).slice(0, 3);

    function esc(str) {
      return String(str || '').replace(/[<>&"]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
      });
    }

    top3.forEach(function (r) {
      var stars   = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      var dateStr = r.date
        ? new Date(r.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
      var initial = (r.name || '?').charAt(0).toUpperCase();

      var card = document.createElement('article');
      card.className = 'review-card';
      card.setAttribute('data-aos', 'fade-up');
      card.innerHTML =
        '<div class="rev-stars" aria-label="' + r.rating + ' de 5 estrellas">' + stars + '</div>' +
        '<p class="rev-text">&ldquo;' + esc(r.text) + '&rdquo;</p>' +
        '<div class="rev-author">' +
          '<div class="rev-avatar" aria-hidden="true">' + initial + '</div>' +
          '<div>' +
            '<strong class="rev-name">' + esc(r.name) + '</strong>' +
            (dateStr ? '<span class="rev-date">' + dateStr + '</span>' : '') +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  /* ── Selector de estrellas ───────────────────────────────── */
  function initStarPicker() {
    var picker      = document.getElementById('star-picker');
    var ratingInput = document.getElementById('rev-rating');
    if (!picker || !ratingInput) return;

    var selected = 0;
    var btns     = picker.querySelectorAll('.star-btn');

    function paint(max, cls) {
      btns.forEach(function (b) {
        b.classList.toggle(cls, parseInt(b.dataset.val, 10) <= max);
      });
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selected          = parseInt(this.dataset.val, 10);
        ratingInput.value = selected;
        paint(selected, 'active');
      });
      btn.addEventListener('mouseenter', function () {
        paint(parseInt(this.dataset.val, 10), 'hovered');
      });
    });

    picker.addEventListener('mouseleave', function () {
      paint(0, 'hovered');
    });
  }

  /* ── Sesión de usuario ───────────────────────────────────── */
  function getSessionUser() {
    try {
      var raw = localStorage.getItem('ka_user') || sessionStorage.getItem('ka_user');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  /**
   * Verifica que el usuario tenga sesión iniciada y al menos una reserva
   * en el sistema con el mismo email de su cuenta.
   * @returns {string|null} Motivo de bloqueo, o null si está habilitado.
   */
  function reviewBlockReason() {
    var user = getSessionUser();
    if (!user || !user.email) {
      return 'Debes <a href="login.html" data-no-transition>iniciar sesión</a> para dejar una reseña.';
    }
    // Admins no dejan reseñas
    if (user.role === 'admin') {
      return 'Las reseñas son solo para clientes.';
    }
    var reservations = loadJSON('ka_reservations', []);
    var userEmail    = (user.email || '').toLowerCase().trim();
    var hasReservation = reservations.some(function (r) {
      return (r.email || '').toLowerCase().trim() === userEmail;
    });
    if (!hasReservation) {
      return 'Solo clientes con al menos una reserva en el sistema pueden dejar reseñas. ' +
             '<a href="contact.html" data-no-transition>¿Quieres reservar?</a>';
    }
    return null; // habilitado
  }

  /* ── Formulario de reseña ─────────────────────────────────── */
  function initReviewForm() {
    var wrap = document.getElementById('review-form-wrap');
    var form = document.getElementById('form-review');
    if (!wrap && !form) return;

    var blockReason = reviewBlockReason();

    if (blockReason) {
      // Reemplazar formulario con mensaje informativo
      var notice = document.createElement('div');
      notice.className = 'review-blocked';
      notice.innerHTML = '<i class="fa-solid fa-lock"></i> ' + blockReason;
      if (wrap) {
        wrap.innerHTML = '';
        wrap.appendChild(notice);
      } else if (form) {
        form.parentNode.insertBefore(notice, form);
        form.style.display = 'none';
      }
      return;
    }

    // Usuario habilitado: pre-llenar nombre y bloquearlo
    var user    = getSessionUser();
    var nameEl  = document.getElementById('rev-name');
    if (nameEl && user && user.name) {
      nameEl.value    = user.name;
      nameEl.readOnly = true;
    }

    initStarPicker();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Re-verificar en el momento del envío (sesión puede haber expirado)
      if (reviewBlockReason()) {
        _toast('Ya no tienes permiso para enviar esta reseña. Recarga la página.');
        return;
      }

      var name   = ((document.getElementById('rev-name')   || {}).value || '').trim();
      var text   = ((document.getElementById('rev-text')   || {}).value || '').trim();
      var rating = parseInt(((document.getElementById('rev-rating') || {}).value || '0'), 10);

      if (!rating) { _toast('Por favor selecciona una calificación (1–5 estrellas).'); return; }
      if (!text)   { _toast('Por favor escribe tu reseña.'); return; }
      if (text.length > 500) { _toast('La reseña no puede superar los 500 caracteres.'); return; }

      var reviews = loadJSON('ka_reviews', []);

      // Prevenir duplicados: un usuario solo puede dejar una reseña
      var alreadyReviewed = reviews.some(function (r) {
        return (r.userEmail || '').toLowerCase() === (getSessionUser().email || '').toLowerCase();
      });
      if (alreadyReviewed) {
        _toast('Ya dejaste una reseña anteriormente. ¡Gracias por tu opinión!');
        return;
      }

      reviews.push({
        id:        'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name:      name,
        userEmail: (getSessionUser().email || '').toLowerCase(),
        rating:    rating,
        text:      text,
        date:      new Date().toISOString()
      });
      saveJSON('ka_reviews', reviews);

      // Resetear formulario
      form.reset();
      if (nameEl && user && user.name) { nameEl.value = user.name; nameEl.readOnly = true; }
      var picker = document.getElementById('star-picker');
      if (picker) picker.querySelectorAll('.star-btn').forEach(function (b) {
        b.classList.remove('active', 'hovered');
      });
      var ri = document.getElementById('rev-rating');
      if (ri) ri.value = '0';

      renderReviews();
      renderStats(); // actualizar calificación promedio
      _toast('¡Gracias por tu reseña! Tu opinión nos ayuda a mejorar. 🎈');
    });
  }

  /* ── Toast helper ────────────────────────────────────────── */
  function _toast(msg) {
    if (typeof window.showToast === 'function') { window.showToast(msg); return; }
    var c = document.getElementById('toast-container');
    if (!c) return;
    var t = document.createElement('div');
    t.className   = 'toast';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3500);
  }

  /* ── Actualizar contador en tiempo real (entre tabs) ───────── */
  window.addEventListener('storage', function (e) {
    if (e.key === 'ka_eventos_counter' || e.key === 'ka_reservations' || e.key === 'ka_reviews') {
      renderStats();
    }
    if (e.key === 'ka_reviews') {
      renderReviews();
    }
  });

  /* ── Init on DOM ready ────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    renderStats();
    renderReviews();
    initReviewForm();
  });

  // Bfcache: el navegador restaura la página sin disparar DOMContentLoaded
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) renderStats();
  });

})();
