/**
 * config.js — Configuración central de contacto y redes sociales
 * ──────────────────────────────────────────────────────────────────
 * Edita SOLO este archivo para actualizar el teléfono, correo,
 * redes sociales o el mensaje automático de WhatsApp en todo el sitio.
 *
 * Para mostrar u ocultar cada red social cambia el valor *Active:
 *   true  → el botón se muestra y enlaza al perfil real.
 *   false → el botón se oculta completamente en todas las páginas.
 */

const SITE_CONFIG = {

  // ── Datos de contacto ────────────────────────────────────────────
  /** Número sin espacios ni '+' (código de país incluido) */
  phone:        '573006036940',
  /** Número formateado para mostrar en pantalla            */
  phoneDisplay: '+57 300 603 6940',
  email:        'kya.balloonsstudio@gmail.com',

  // ── WhatsApp ─────────────────────────────────────────────────────
  /** Texto del mensaje automático (se codificará automáticamente)   */
  whatsappMessage: '¡Hola K&A Balloons Studio! Me encantaría saber más sobre sus decoraciones con globos. ¿Me pueden ayudar?',
  /** true → botones de WhatsApp visibles · false → ocultos          */
  whatsappActive:  true,

  // ── Instagram ────────────────────────────────────────────────────
  instagram:       'https://www.instagram.com/angelita._.esco',
  instagramHandle: '@angelita._.esco',
  /** true → botones de Instagram visibles · false → ocultos         */
  instagramActive: true,

  // ── TikTok ───────────────────────────────────────────────────────
  tiktok:          'https://www.tiktok.com/@kaballoonsstudio',
  tiktokHandle:    '@kaballoonsstudio',
  /** true → botones de TikTok visibles · false → ocultos            */
  tiktokActive:    false,

};

// ──────────────────────────────────────────────────────────────────
// Aplicar configuración al cargar el DOM
// ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  var waURL = 'https://wa.me/' + SITE_CONFIG.phone +
              '?text=' + encodeURIComponent(SITE_CONFIG.whatsappMessage);

  // ── WhatsApp: mostrar u ocultar según whatsappActive ─────────────
  var waEls = document.querySelectorAll(
    '.ms-btn.whatsapp, .fsoc.whatsapp, a.social-big-btn[aria-label*="WhatsApp"], a[href*="wa.me/"]'
  );
  if (SITE_CONFIG.whatsappActive) {
    waEls.forEach(function (a) {
      a.href = waURL;
      var t = a.textContent.trim();
      if (/^\+?\d/.test(t)) { a.textContent = SITE_CONFIG.phoneDisplay; }
    });
  } else {
    waEls.forEach(function (el) { el.style.display = 'none'; });
  }

  // ── Instagram: mostrar u ocultar según instagramActive ───────────
  var igEls = document.querySelectorAll(
    '.ms-btn.instagram, .fsoc.instagram, a.social-big-btn[aria-label*="Instagram"], a[href*="instagram.com"]'
  );
  if (SITE_CONFIG.instagramActive) {
    igEls.forEach(function (a) { a.href = SITE_CONFIG.instagram; });
  } else {
    igEls.forEach(function (el) { el.style.display = 'none'; });
  }

  // ── TikTok: mostrar u ocultar según tiktokActive ─────────────────
  var tiktokEls = document.querySelectorAll(
    '.ms-btn.tiktok, .fsoc.tiktok, a.social-big-btn[aria-label*="TikTok"]'
  );
  if (SITE_CONFIG.tiktokActive) {
    tiktokEls.forEach(function (a) {
      a.href   = SITE_CONFIG.tiktok;
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
    });
  } else {
    tiktokEls.forEach(function (el) {
      el.style.display = 'none';
    });
  }

  // ── Teléfono: actualizar href y texto visible ────────────────────
  document.querySelectorAll('a[href*="tel:"]').forEach(function (a) {
    a.href = 'tel:+' + SITE_CONFIG.phone;
    var t = a.textContent.trim();
    if (/^\+?\d/.test(t)) { a.textContent = SITE_CONFIG.phoneDisplay; }
  });

  // ── Correo: actualizar href y texto visible ──────────────────────
  document.querySelectorAll('a[href*="mailto:"]').forEach(function (a) {
    a.href = 'mailto:' + SITE_CONFIG.email;
    if (a.textContent.includes('@')) { a.textContent = SITE_CONFIG.email; }
  });

  // ── Tarjetas grandes de redes sociales (contact.html) ───────────
  document.querySelectorAll('a.social-big-btn[aria-label*="Instagram"] span')
    .forEach(function (s) { s.textContent = SITE_CONFIG.instagramHandle; });

  document.querySelectorAll('a.social-big-btn[aria-label*="WhatsApp"] span')
    .forEach(function (s) { s.textContent = SITE_CONFIG.phoneDisplay; });

  document.querySelectorAll('a.social-big-btn[aria-label*="TikTok"] span')
    .forEach(function (s) { s.textContent = SITE_CONFIG.tiktokHandle; });

});
