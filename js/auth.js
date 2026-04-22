/* =====================================================
   K&A Balloons Studio — Authentication
   Firebase Email/Password + Google Sign-In
   ===================================================== */

/*
  ⚠️  CONFIGURACIÓN REQUERIDA / SETUP REQUIRED:

  PASO 1 — Crear proyecto Firebase
    → Ve a https://console.firebase.google.com y crea un proyecto.

  PASO 2 — Obtener credenciales
    → Menú ⚙️ → "Configuración del proyecto" → pestaña "General"
    → Sección "Tus apps" → haz clic en el icono Web (</>)
    → Registra la app (cualquier nombre) y copia el objeto firebaseConfig.

  PASO 3 — Activar proveedores de autenticación
    → Authentication → "Comenzar" → Sign-in method:
       ✓ Correo electrónico/contraseña → Activar
       ✓ Google → Activar (pon un correo de soporte del proyecto)

  PASO 4 — Agregar dominio autorizado
    → Authentication → Settings → Dominios autorizados
    → Agrega tu dominio de producción (ej: kaballoonsstudio.com)
    → Para pruebas locales, "localhost" ya está incluido por defecto.

  PASO 5 — Reemplaza los valores de abajo con tu configuración real.
*/

const firebaseConfig = {
  apiKey:            "AIzaSyCWGuviGHx3sTfpW93-UL2B0aHn2k8IXe0",
  authDomain:        "k-a-balloons-studio.firebaseapp.com",
  projectId:         "k-a-balloons-studio",
  storageBucket:     "k-a-balloons-studio.firebasestorage.app",
  messagingSenderId: "881100625834",
  appId:             "1:881100625834:web:58f11ed2e9f1eb19cb3dd3",
  measurementId:     "G-8WMM49J5SM"
};

/* Detecta si el config es el de ejemplo o tiene valores reales */
function isFirebaseConfigured() {
  return (
    typeof firebaseConfig.apiKey === 'string' &&
    firebaseConfig.apiKey.length > 10 &&
    firebaseConfig.apiKey !== 'TU_API_KEY' &&
    firebaseConfig.projectId !== 'tu-proyecto'
  );
}

/* ============================================================
   FIREBASE INIT
   ============================================================ */
let auth = null;
let googleProvider = null;
let firebaseReady = false;

function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('[K&A Auth] Firebase no configurado — modo local activo. Sigue los pasos en auth.js para activar Google Sign-In.');
    return;
  }
  try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      googleProvider = new firebase.auth.GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      firebaseReady = true;
      console.log('[K&A Auth] Firebase inicializado correctamente.');
      watchAuthState();
      handleRedirectResult();
    }
  } catch (err) {
    console.warn('[K&A Auth] Error al inicializar Firebase:', err.message);
  }
}

/* ============================================================
   AUTH STATE WATCHER
   ============================================================ */
function watchAuthState() {
  if (!auth) return;
  auth.onAuthStateChanged(user => {
    if (user) {
      const userData = {
        uid:    user.uid,
        name:   user.displayName || user.email.split('@')[0],
        email:  user.email,
        photo:  user.photoURL || null,
      };
      localStorage.setItem('ka_user', JSON.stringify(userData));
      sessionStorage.setItem('ka_user', JSON.stringify(userData));
      // If on auth page, redirect to home
      const page = window.location.pathname.split('/').pop();
      if (['login.html', 'register.html'].includes(page)) {
        setTimeout(() => (window.location.href = 'index.html'), 500);
      }
    } else {
      localStorage.removeItem('ka_user');
      sessionStorage.removeItem('ka_user');
    }
  });
}

/* ============================================================
   GOOGLE REDIRECT RESULT
   Gestiona el resultado cuando signInWithRedirect fue invocado
   (fallback cuando el navegador bloquea el popup).
   ============================================================ */
async function handleRedirectResult() {
  if (!auth) return;
  try {
    const result = await auth.getRedirectResult();
    if (result && result.user) {
      const displayName = result.user.displayName || result.user.email.split('@')[0];
      window.KA?.showToast('success', `¡Bienvenido, ${displayName}!`, '', 2500);
      setTimeout(() => (window.location.href = 'index.html'), 800);
    }
  } catch (err) {
    if (err.code && err.code !== 'auth/no-current-user') {
      console.error('[K&A Auth] Error en redirect result:', err.code);
      window.KA?.showToast('error', 'Error con Google', mapAuthError(err.code));
    }
  }
}

/* ============================================================
   EMAIL / PASSWORD — SIGN IN
   ============================================================ */
async function signIn(email, password) {
  // Admin bypass — always checked before Firebase
  if (email === 'admin@kaballoonsstudio.com' && password === 'Admin@KA2026!') {
    return await dbSignIn(email, password);
  }
  if (!firebaseReady) {
    return await dbSignIn(email, password);
  }
  try {
    await auth.signInWithEmailAndPassword(email, password);
    return { success: true };
  } catch (err) {
    return { success: false, code: err.code, message: mapAuthError(err.code) };
  }
}

/* ============================================================
   EMAIL / PASSWORD — REGISTER
   ============================================================ */
async function register(name, email, password) {
  if (!firebaseReady) {
    return await dbRegister(name, email, password);
  }
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    return { success: true };
  } catch (err) {
    return { success: false, code: err.code, message: mapAuthError(err.code) };
  }
}

/* ============================================================
   GOOGLE SIGN IN
   Intenta popup primero; si el navegador lo bloquea, usa redirect.
   ============================================================ */
async function signInWithGoogle() {
  if (!firebaseReady) {
    return {
      success: false,
      code:    'auth/not-configured',
      message: mapAuthError('auth/not-configured'),
    };
  }
  try {
    await auth.signInWithPopup(googleProvider);
    return { success: true };
  } catch (err) {
    // Popup bloqueado por el navegador → fallback a redirect
    if (err.code === 'auth/popup-blocked') {
      try {
        await auth.signInWithRedirect(googleProvider);
        return { success: true }; // la página se recargará; handleRedirectResult() toma el control
      } catch (redirectErr) {
        return { success: false, code: redirectErr.code, message: mapAuthError(redirectErr.code) };
      }
    }
    return { success: false, code: err.code, message: mapAuthError(err.code) };
  }
}

/* ============================================================
   FORGOT PASSWORD
   ============================================================ */
async function sendPasswordReset(email) {
  if (!firebaseReady) {
    if (!window.KADatabase) return { success: true };
    if (!window.KADatabase.emailExists(email)) {
      return { success: false, code: 'auth/user-not-found', message: mapAuthError('auth/user-not-found') };
    }
    const token = window.KADatabase.generateResetToken(email);
    return { success: true, token, email };
  }
  try {
    await auth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (err) {
    return { success: false, code: err.code, message: mapAuthError(err.code) };
  }
}

/* ============================================================
   SIGN OUT
   ============================================================ */
async function signOut() {
  if (firebaseReady && auth) {
    try { await auth.signOut(); } catch (_) {}
  }
  localStorage.removeItem('ka_user');
  sessionStorage.removeItem('ka_user');
  window.location.href = 'index.html';
}

/* ============================================================
   ERROR MAP (ES + EN)
   ============================================================ */
function mapAuthError(code) {
  const lang = localStorage.getItem('ka_lang') || 'es';
  const errors = {
    es: {
      'auth/invalid-email':             'El correo electrónico no es válido.',
      'auth/user-disabled':             'Esta cuenta ha sido deshabilitada.',
      'auth/user-not-found':            'No existe una cuenta con este correo.',
      'auth/wrong-password':            'Contraseña incorrecta.',
      'auth/email-already-in-use':      'Ya existe una cuenta con este correo.',
      'auth/weak-password':             'La contraseña debe tener al menos 6 caracteres.',
      'auth/operation-not-allowed':     'Método de inicio de sesión no habilitado.',
      'auth/too-many-requests':         'Demasiados intentos. Intenta más tarde.',
      'auth/network-request-failed':    'Error de red. Verifica tu conexión.',
      'auth/popup-closed-by-user':      'Ventana cerrada. Intenta de nuevo.',
      'auth/popup-blocked':             'Ventana emergente bloqueada. Redirigiendo con método alternativo…',
      'auth/cancelled-popup-request':   'Solo puede haber una ventana de Google abierta a la vez.',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método de inicio de sesión.',
      'auth/not-configured':            'Google Sign-In no está habilitado. El administrador debe configurar Firebase.',
      'auth/invalid-credential':        'Credencial inválida o expirada. Intenta de nuevo.',
      'default':                        'Ocurrió un error. Intenta de nuevo.',
    },
    en: {
      'auth/invalid-email':             'The email address is invalid.',
      'auth/user-disabled':             'This account has been disabled.',
      'auth/user-not-found':            'No account found with this email.',
      'auth/wrong-password':            'Incorrect password.',
      'auth/email-already-in-use':      'An account with this email already exists.',
      'auth/weak-password':             'Password must be at least 6 characters.',
      'auth/operation-not-allowed':     'Sign-in method not enabled.',
      'auth/too-many-requests':         'Too many attempts. Try again later.',
      'auth/network-request-failed':    'Network error. Check your connection.',
      'auth/popup-closed-by-user':      'Window closed. Try again.',
      'auth/popup-blocked':             'Popup blocked. Redirecting with alternative method…',
      'auth/cancelled-popup-request':   'Only one Google sign-in window can be open at a time.',
      'auth/account-exists-with-different-credential': 'An account with this email already exists using a different sign-in method.',
      'auth/not-configured':            'Google Sign-In is not enabled. The administrator must configure Firebase.',
      'auth/invalid-credential':        'Invalid or expired credential. Try again.',
      'default':                        'An error occurred. Try again.',
    }
  };
  const map = errors[lang] || errors.es;
  return map[code] || map['default'];
}

/* ============================================================
   DEMO MODE (when Firebase not configured)
   ============================================================ */
function demoSignIn(email, password) {
  const userData = {
    uid:   'demo_' + Date.now(),
    name:  email.split('@')[0],
    email: email,
    photo: null,
    demo:  true,
  };
  localStorage.setItem('ka_user', JSON.stringify(userData));
  sessionStorage.setItem('ka_user', JSON.stringify(userData));
  return { success: true };
}
function demoRegister(name, email, password) {
  const userData = { uid: 'demo_' + Date.now(), name, email, photo: null, demo: true };
  localStorage.setItem('ka_user', JSON.stringify(userData));
  sessionStorage.setItem('ka_user', JSON.stringify(userData));
  return { success: true };
}

/* ============================================================
   ADMIN CREDENTIALS
   ============================================================ */
const ADMIN_EMAIL    = 'admin@kaballoonsstudio.com';
const ADMIN_PASSWORD = 'Admin@KA2026!';

function isAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

/* ============================================================
   LOCAL DATABASE WRAPPERS
   ============================================================ */
async function dbSignIn(email, password) {
  // Admin hard-coded credentials check
  if (isAdminCredentials(email, password)) {
    const adminUser = {
      uid:   'admin_ka',
      name:  'Administrador K&A',
      email: ADMIN_EMAIL,
      photo: null,
      demo:  true,
      role:  'admin',
    };
    localStorage.setItem('ka_user', JSON.stringify(adminUser));
    sessionStorage.setItem('ka_user', JSON.stringify(adminUser));
    return { success: true, role: 'admin' };
  }
  if (!window.KADatabase) return demoSignIn(email, password);
  const res = await window.KADatabase.signIn(email, password);
  if (!res.success) return { ...res, message: mapAuthError(res.code) };
  localStorage.setItem('ka_user', JSON.stringify(res.user));
  sessionStorage.setItem('ka_user', JSON.stringify(res.user));
  return { success: true };
}
async function dbRegister(name, email, password) {
  if (!window.KADatabase) return demoRegister(name, email, password);
  const res = await window.KADatabase.registerUser(name, email, password);
  if (!res.success) return { ...res, message: mapAuthError(res.code) };
  localStorage.setItem('ka_user', JSON.stringify(res.user));
  sessionStorage.setItem('ka_user', JSON.stringify(res.user));
  return { success: true };
}

/* ============================================================
   FORM VALIDATION HELPERS
   ============================================================ */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pass) {
  return pass.length >= 8 && /[a-zA-Z]/.test(pass) && /[0-9]/.test(pass);
}
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + '-error');
  if (field)  field.classList.add('error');
  if (error) { error.textContent = message; error.classList.add('show'); }
}
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + '-error');
  if (field)  field.classList.remove('error');
  if (error)  error.classList.remove('show');
}
function clearAllErrors() {
  document.querySelectorAll('.form-input.error, .form-select.error, .form-textarea.error')
    .forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.form-error.show')
    .forEach(el => el.classList.remove('show'));
}
function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn._origText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._origText || btn.innerHTML;
    btn.disabled = false;
  }
}

/* ============================================================
   LOGIN PAGE LOGIC
   ============================================================ */
function initLoginPage() {
  const loginForm    = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const forgotForm   = document.getElementById('form-forgot');
  const resetForm    = document.getElementById('form-reset');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');
  const showForgot   = document.getElementById('show-forgot');
  const backToLogin  = document.getElementById('back-to-login');
  const googleBtns   = document.querySelectorAll('.btn-google');

  // Tab switching — uses CSS class 'active' (display:block) vs default display:none
  function switchTab(tab) {
    [loginForm, registerForm, forgotForm, resetForm].forEach(f => f && f.classList.remove('active'));
    [tabLogin, tabRegister].forEach(t => t && t.classList.remove('active'));
    clearAllErrors();
    if (tab === 'login')    { loginForm?.classList.add('active');    tabLogin?.classList.add('active'); }
    if (tab === 'register') { registerForm?.classList.add('active'); tabRegister?.classList.add('active'); }
    if (tab === 'forgot')   { forgotForm?.classList.add('active'); }
    if (tab === 'reset')    { resetForm?.classList.add('active'); }
  }

  tabLogin    && tabLogin.addEventListener('click',    () => switchTab('login'));
  tabRegister && tabRegister.addEventListener('click', () => switchTab('register'));
  showForgot  && showForgot.addEventListener('click', e => { e.preventDefault(); switchTab('forgot'); });
  backToLogin && backToLogin.addEventListener('click', e => { e.preventDefault(); switchTab('login'); });
  document.getElementById('back-from-reset')?.addEventListener('click', () => switchTab('login'));
  document.getElementById('goto-register')?.addEventListener('click', e => { e.preventDefault(); switchTab('register'); });
  document.getElementById('goto-login')?.addEventListener('click',    e => { e.preventDefault(); switchTab('login'); });

  // Auto-switch to register tab if URL hash is #register
  if (window.location.hash === '#register') switchTab('register');

  // Google
  googleBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      setLoading(btn, true);
      const res = await signInWithGoogle();
      setLoading(btn, false);
      if (res.success) {
        window.KA?.showToast('success', '¡Bienvenido! / Welcome!', '', 2000);
        setTimeout(() => (window.location.href = 'index.html'), 800);
      } else {
        window.KA?.showToast('error', 'Error', res.message);
      }
    });
  });

  // === LOGIN FORM ===
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      clearAllErrors();
      const email    = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value;
      const btn      = loginForm.querySelector('[type="submit"]');
      let valid = true;

      if (!email || !validateEmail(email)) {
        showFieldError('login-email', window.KA?.t('err_email') || 'Correo inválido.');
        valid = false;
      }
      if (!password) {
        showFieldError('login-password', window.KA?.t('err_required') || 'Campo requerido.');
        valid = false;
      }
      if (!valid) return;

      setLoading(btn, true);
      const res = await signIn(email, password);
      setLoading(btn, false);

      if (res.success) {
        window.KA?.showToast('success', '¡Bienvenido de nuevo!', '', 2000);
        const stored = JSON.parse(localStorage.getItem('ka_user') || '{}');
        const dest = stored.role === 'admin' ? 'admin-reservations.html' : 'index.html';
        setTimeout(() => (window.location.href = dest), 800);
      } else {
        window.KA?.showToast('error', 'Error al iniciar sesión', res.message);
      }
    });
  }

  // === REGISTER FORM ===
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      clearAllErrors();
      const name     = document.getElementById('reg-name')?.value.trim();
      const email    = document.getElementById('reg-email')?.value.trim();
      const password = document.getElementById('reg-password')?.value;
      const confirm  = document.getElementById('reg-confirm')?.value;
      const terms    = document.getElementById('reg-terms')?.checked;
      const btn      = registerForm.querySelector('[type="submit"]');
      let valid = true;

      if (!name) { showFieldError('reg-name', window.KA?.t('err_required') || 'Campo requerido.'); valid = false; }
      if (!email || !validateEmail(email)) { showFieldError('reg-email', window.KA?.t('err_email') || 'Correo inválido.'); valid = false; }
      if (!password || !validatePassword(password)) { showFieldError('reg-password', window.KA?.t('err_weakPass') || 'Mínimo 8 caracteres.'); valid = false; }
      if (password !== confirm) { showFieldError('reg-confirm', window.KA?.t('err_passMatch') || 'Contraseñas no coinciden.'); valid = false; }
      if (!terms) { showFieldError('reg-terms', window.KA?.t('err_terms') || 'Acepta los términos.'); valid = false; }
      if (!valid) return;

      setLoading(btn, true);
      const res = await register(name, email, password);
      setLoading(btn, false);

      if (res.success) {
        window.KA?.showToast('success', '¡Cuenta creada! / Account created!', '', 2500);
        setTimeout(() => (window.location.href = 'index.html'), 900);
      } else {
        window.KA?.showToast('error', 'Error al registrarse', res.message);
      }
    });
  }

  // === FORGOT PASSWORD FORM ===
  if (forgotForm) {
    forgotForm.addEventListener('submit', async e => {
      e.preventDefault();
      clearAllErrors();
      const email = document.getElementById('forgot-email')?.value.trim();
      const btn   = forgotForm.querySelector('[type="submit"]');

      if (!email || !validateEmail(email)) {
        showFieldError('forgot-email', window.KA?.t('err_email') || 'Correo inválido.');
        return;
      }
      setLoading(btn, true);
      const res = await sendPasswordReset(email);
      setLoading(btn, false);

      if (res.success) {
        if (res.token) {
          // Base de datos local — abrir formulario de nueva contraseña
          const disp    = document.getElementById('reset-email-display');
          const hiddenE = document.getElementById('reset-email-hidden');
          const hiddenT = document.getElementById('reset-token-hidden');
          if (disp)    disp.textContent = email;
          if (hiddenE) hiddenE.value    = email;
          if (hiddenT) hiddenT.value    = res.token;
          forgotForm.reset();
          switchTab('reset');
        } else {
          // Firebase — correo enviado
          window.KA?.showToast('success', window.KA?.t('reset_sent') || '¡Correo enviado!', email, 4000);
          forgotForm.reset();
          switchTab('login');
        }
      } else {
        if (res.code === 'auth/user-not-found') {
          showFieldError('forgot-email', res.message);
        } else {
          window.KA?.showToast('error', 'Error', res.message);
        }
      }
    });
  }

  // === NUEVA CONTRASEÑA (flujo de recuperación local) ===
  if (resetForm) {
    resetForm.addEventListener('submit', async e => {
      e.preventDefault();
      clearAllErrors();
      const email    = document.getElementById('reset-email-hidden')?.value;
      const token    = document.getElementById('reset-token-hidden')?.value;
      const password = document.getElementById('reset-new-password')?.value;
      const confirm  = document.getElementById('reset-confirm-password')?.value;
      const btn      = resetForm.querySelector('[type="submit"]');
      let valid = true;

      if (!password || !validatePassword(password)) {
        showFieldError('reset-new-password', window.KA?.t('err_weakPass') || 'Mínimo 8 caracteres, incluye letra y número.');
        valid = false;
      }
      if (password !== confirm) {
        showFieldError('reset-confirm-password', window.KA?.t('err_passMatch') || 'Las contraseñas no coinciden.');
        valid = false;
      }
      if (!valid) return;

      setLoading(btn, true);
      const res = await window.KADatabase.resetPassword(email, token, password);
      setLoading(btn, false);

      if (res.success) {
        window.KA?.showToast('success', '¡Contraseña actualizada!', 'Ya puedes iniciar sesión con tu nueva contraseña.', 4000);
        resetForm.reset();
        switchTab('login');
      } else {
        window.KA?.showToast('error', 'Error', res.message || 'No se pudo cambiar la contraseña.');
      }
    });
  }

  // Password visibility toggle
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isText = target.type === 'text';
      target.type = isText ? 'password' : 'text';
      btn.innerHTML = isText
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
      const bpScene = document.getElementById('bp-' + btn.dataset.target);
      if (bpScene) bpScene.classList.toggle('watching', !isText);
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  if (document.getElementById('form-login') || document.getElementById('form-register')) {
    initLoginPage();
  }
});

/* Expose */
window.KAAuth = { signIn, register, signInWithGoogle, sendPasswordReset, signOut };
