/* =====================================================
   K&A Balloons Studio — Main JavaScript
   Navbar · Menu · Scroll · Counters · Confetti · AOS
   ===================================================== */

/* ============================================================
   PAGE TRANSITION
   ============================================================ */
const ptCurtain = document.getElementById('pt-curtain');

function pageTransitionOut(href) {
  if (!ptCurtain) { window.location.href = href; return; }
  ptCurtain.style.transition = 'transform .55s cubic-bezier(.77,0,.18,1)';
  ptCurtain.style.transformOrigin = 'left';
  ptCurtain.style.transform = 'scaleX(1)';
  setTimeout(() => { window.location.href = href; }, 560);
}

function pageTransitionIn() {
  if (!ptCurtain) return;
  ptCurtain.style.transition = 'none';
  ptCurtain.style.transformOrigin = 'right';
  ptCurtain.style.transform = 'scaleX(1)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ptCurtain.style.transition = 'transform .55s cubic-bezier(.77,0,.18,1)';
      ptCurtain.style.transform = 'scaleX(0)';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  pageTransitionIn();

  // Intercept all internal links (excluding #btn-nav-login — handled by dropdown)
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href &&
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto') &&
      !href.startsWith('tel') &&
      !href.startsWith('javascript') &&
      !link.hasAttribute('data-no-transition') &&
      link.id !== 'btn-nav-login'
    ) {
      link.addEventListener('click', e => {
        e.preventDefault();
        pageTransitionOut(href);
      });
    }
  });
});

/* ============================================================
   NAVBAR — scroll state
   ============================================================ */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ============================================================
   HAMBURGER MENU
   ============================================================ */
const hamburger  = document.getElementById('hamburger');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose   = document.getElementById('menu-close');
const menuBackdrop = document.getElementById('menu-backdrop');

function openMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.add('open');
  hamburger && hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.remove('open');
  hamburger && hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger    && hamburger.addEventListener('click',    openMenu);
menuClose    && menuClose.addEventListener('click',    closeMenu);
menuBackdrop && menuBackdrop.addEventListener('click', closeMenu);

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

// Mark active nav item
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.menu-nav-item a').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ============================================================
   SCROLL-BASED AOS
   ============================================================ */
function initAOS() {
  const targets = document.querySelectorAll('[data-aos]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay || 0);
        setTimeout(() => entry.target.classList.add('aos-animate'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => {
    // Stagger siblings by index
    const idx = Array.from(el.parentElement.children).indexOf(el);
    if (!el.dataset.aosDelay && el.parentElement.children.length > 1) {
      el.dataset.aosDelay = String(idx * 100);
    }
    observer.observe(el);
  });
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, duration = 1600) {
  const isFloat = String(target).includes('.');
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const start   = performance.now();
  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = isFloat
      ? (ease * parseFloat(target)).toFixed(1)
      : Math.round(ease * parseInt(target));
    el.textContent = prefix + value + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, el.dataset.counter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ============================================================
   CONFETTI GENERATOR
   ============================================================ */
function createConfetti(containerSelector = '.confetti-wrap', count = 35) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const colors = ['#BFDBFE','#DDD6FE','#FCD34D','#A5F3FC','#FDE68A','#C4B5FD'];
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'confetto';
    c.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width:  ${5 + Math.random() * 7}px;
      height: ${5 + Math.random() * 7}px;
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
      animation-duration: ${3 + Math.random() * 5}s;
      animation-delay:    ${Math.random() * 5}s;
    `;
    container.appendChild(c);
  }
}

/* ============================================================
   RIPPLE EFFECT ON BUTTONS
   ============================================================ */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `left:${x}px; top:${y}px;`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

/* ============================================================
   SMOOTH SCROLL (for same-page anchors)
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(a.dataset.offset || 80);
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        closeMenu();
      }
    });
  });
}

/* ============================================================
   PORTFOLIO FILTER (on portfolio page)
   ============================================================ */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.pf-btn');
  const items       = document.querySelectorAll('.port-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        const cat = item.dataset.category || 'all';
        item.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
      });
    });
  });
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg     = lb.querySelector('.lb-img');
  const lbCaption = lb.querySelector('.lb-caption');
  const lbClose   = lb.querySelector('.lb-close');
  const lbPrev    = lb.querySelector('.lb-prev');
  const lbNext    = lb.querySelector('.lb-next');
  const items     = Array.from(document.querySelectorAll('.port-item[data-full]'));
  let current = 0;

  function open(idx) {
    current = idx;
    const item = items[idx];
    if (!item) return;
    lbImg.src     = item.dataset.full;
    lbImg.alt     = item.dataset.title || '';
    if (lbCaption) lbCaption.textContent = item.dataset.title || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function prev() { open((current - 1 + items.length) % items.length); }
  function next() { open((current + 1) % items.length); }

  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });
  lbClose && lbClose.addEventListener('click', close);
  lbPrev  && lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  lbNext  && lbNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(type = 'success', title = '', message = '', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '🎈', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-ico">${icons[type] || icons.info}</span>
    <div class="toast-body">
      <strong>${title}</strong>
      ${message ? `<span>${message}</span>` : ''}
    </div>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ============================================================
   SECTION APPEAR (fallback reveal)
   ============================================================ */
function initSectionAppear() {
  const sections = document.querySelectorAll('.section-appear');
  if (!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  sections.forEach(s => obs.observe(s));
}

/* ============================================================
   USER SESSION — auth-aware nav dropdown
   ============================================================ */
function _phEsc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _tr(key, fallback) {
  return (typeof t === 'function' ? t(key) : null) || fallback;
}

function updateNavUser() {
  try {
    const raw   = sessionStorage.getItem('ka_user') || localStorage.getItem('ka_user');
    const user  = raw ? JSON.parse(raw) : null;
    const btnLogin = document.getElementById('btn-nav-login');

    /* ── helper: close all auth dropdowns ── */
    function closeAllDDs() {
      document.getElementById('ka-profile-dd')?.classList.remove('open');
      document.getElementById('ka-auth-dd')?.classList.remove('open');
    }

    /* ── helper: toggle a given dropdown id ── */
    function toggleDD(id) {
      const dd = document.getElementById(id);
      if (!dd) return;
      const wasOpen = dd.classList.contains('open');
      closeAllDDs();
      if (!wasOpen) dd.classList.add('open');
    }

    /* ── Close on outside click / Escape (registered once) ── */
    if (!window._kaNavListenersAdded) {
      window._kaNavListenersAdded = true;
      document.addEventListener('click', e => {
        const pdds = ['ka-profile-dd', 'ka-auth-dd'];
        pdds.forEach(id => {
          const dd = document.getElementById(id);
          if (dd && !dd.contains(e.target) && !btnLogin?.contains(e.target)) {
            dd.classList.remove('open');
          }
        });
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAllDDs();
      });
    }

    /* ══════════════════════════════════════
       NOT LOGGED IN → auth choice dropdown
       ══════════════════════════════════════ */
    if (!user || !user.name) {
      if (btnLogin) {
        btnLogin.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          toggleDD('ka-auth-dd');
        });
      }
      if (document.getElementById('ka-auth-dd')) return; // already built

      const dd = document.createElement('div');
      dd.id        = 'ka-auth-dd';
      dd.className = 'ka-profile-dd';
      dd.setAttribute('role', 'menu');
      dd.innerHTML = `
        <div class="kpd-header">
          <div class="kpd-avatar kpd-guest-ava"><i class="fa-solid fa-user" aria-hidden="true"></i></div>
          <div class="kpd-info">
            <strong class="kpd-name" data-i18n="dd_not_signed">No has iniciado sesión</strong>
            <span class="kpd-email" data-i18n="dd_auth_hint">Accede a tu cuenta</span>
          </div>
        </div>
        <div class="kpd-sep"></div>
        <a href="login.html" class="kpd-item" role="menuitem" data-no-transition>
          <i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
          <span data-i18n="dd_signin">Iniciar Sesión</span>
        </a>
        <a href="login.html#register" class="kpd-item" role="menuitem" data-no-transition>
          <i class="fa-solid fa-user-plus" aria-hidden="true"></i>
          <span data-i18n="dd_register">Crear cuenta</span>
        </a>
      `;
      const navRight = btnLogin?.parentElement ?? document.querySelector('.nav-right');
      navRight?.appendChild(dd);
      if (typeof applyTranslations === 'function') requestAnimationFrame(applyTranslations);
      return;
    }

    /* ══════════════════════════════════════
       LOGGED IN → profile dropdown
       ══════════════════════════════════════ */
    const firstName = user.name.split(' ')[0];
    const initials  = user.name.split(/\s+/).filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const isAdmin   = user.role === 'admin';

    // Update top nav button
    if (btnLogin) {
      btnLogin.innerHTML = `<span class="nav-user-ava">${_phEsc(initials)}</span> <span>${_phEsc(firstName)}</span>`;
      btnLogin.setAttribute('aria-label', 'Menú de perfil');
      btnLogin.removeAttribute('href');
      btnLogin.setAttribute('role', 'button');
      btnLogin.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        toggleDD('ka-profile-dd');
      });
    }

    // Update hamburger menu login link → profile
    const menuLoginAnchor = document.querySelector('.menu-nav a[href="login.html"]');
    if (menuLoginAnchor) {
      menuLoginAnchor.setAttribute('href', 'profile.html');
      const icon = menuLoginAnchor.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-id-card';
      const span = menuLoginAnchor.querySelector('[data-i18n]');
      if (span) { span.removeAttribute('data-i18n'); span.textContent = 'Mi Perfil'; }
    }

    if (document.getElementById('ka-profile-dd')) return; // already built

    const dd = document.createElement('div');
    dd.id        = 'ka-profile-dd';
    dd.className = 'ka-profile-dd';
    dd.setAttribute('role', 'menu');
    dd.innerHTML = `
      <div class="kpd-header">
        <div class="kpd-avatar">${_phEsc(initials)}</div>
        <div class="kpd-info">
          <strong class="kpd-name">${_phEsc(user.name)}</strong>
          <span class="kpd-email">${_phEsc(user.email || '')}</span>
        </div>
      </div>
      <div class="kpd-sep"></div>
      <a href="profile.html" class="kpd-item" role="menuitem" data-no-transition>
        <i class="fa-solid fa-id-card" aria-hidden="true"></i>
        <span data-i18n="dd_my_profile">Mi Perfil</span>
      </a>
      ${isAdmin ? `
      <a href="admin-reservations.html" class="kpd-item kpd-admin" role="menuitem" data-no-transition>
        <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
        <span data-i18n="dd_admin_panel">Panel de Administración</span>
      </a>` : ''}
      <div class="kpd-sep"></div>
      <button class="kpd-item kpd-logout" id="kpd-logout-btn" role="menuitem">
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
        <span data-i18n="dd_logout">Cerrar Sesión</span>
      </button>
    `;
    const navRight = btnLogin?.parentElement ?? document.querySelector('.nav-right');
    navRight?.appendChild(dd);

    document.getElementById('kpd-logout-btn')?.addEventListener('click', () => {
      sessionStorage.removeItem('ka_user');
      localStorage.removeItem('ka_user');
      window.location.reload();
    });

    if (typeof applyTranslations === 'function') requestAnimationFrame(applyTranslations);

  } catch (_) {}
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initCounters();
  initRipple();
  initSmoothScroll();
  initPortfolioFilter();
  initLightbox();
  initSectionAppear();
  createConfetti();
  updateNavUser();
});

/* Export globals */
window.KA = {
  showToast,
  pageTransitionOut,
  switchLang: typeof switchLang !== 'undefined' ? switchLang : null,
  t: typeof t !== 'undefined' ? t : k => k,
};
