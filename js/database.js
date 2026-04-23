/* =====================================================
   K&A Balloons Studio — Base de Datos Local
   Almacena usuarios en localStorage usando
   Web Crypto API (SHA-256) para hashear contraseñas.
   ===================================================== */

const _DB_KEY    = 'ka_users_db';
const _TOKEN_KEY = 'ka_reset_tokens';

/* ---- Helpers internos ---- */
async function _hashPassword(password) {
  const encoder = new TextEncoder();
  // Concatenamos una sal estática para dificultar ataques de diccionario
  const data = encoder.encode('ka2025salt!' + password + '@BalloonStudio');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function _loadUsers() {
  try { return JSON.parse(localStorage.getItem(_DB_KEY) || '[]'); }
  catch { return []; }
}

function _saveUsers(users) {
  localStorage.setItem(_DB_KEY, JSON.stringify(users));
}

function _loadTokens() {
  try { return JSON.parse(localStorage.getItem(_TOKEN_KEY) || '{}'); }
  catch { return {}; }
}

function _saveTokens(tokens) {
  localStorage.setItem(_TOKEN_KEY, JSON.stringify(tokens));
}

/* =====================================================
   API PÚBLICA — window.KADatabase
   ===================================================== */
const KADatabase = {

  /* ---- Registrar usuario ---- */
  async registerUser(name, email, password) {
    const users = _loadUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, code: 'auth/email-already-in-use' };
    }
    const passwordHash = await _hashPassword(password);
    const user = {
      uid:          'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      passwordHash,
      createdAt:    new Date().toISOString(),
    };
    users.push(user);
    _saveUsers(users);
    const publicUser = { uid: user.uid, name: user.name, email: user.email, photo: null };
    console.log('[KADatabase] Usuario registrado:', user.email);
    return { success: true, user: publicUser };
  },

  /* ---- Iniciar sesión ---- */
  async signIn(email, password) {
    const users = _loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return { success: false, code: 'auth/user-not-found' };
    }
    const hash = await _hashPassword(password);
    if (hash !== user.passwordHash) {
      return { success: false, code: 'auth/wrong-password' };
    }
    const publicUser = { uid: user.uid, name: user.name, email: user.email, photo: null };
    return { success: true, user: publicUser };
  },

  /* ---- Verificar si existe un correo ---- */
  emailExists(email) {
    const users = _loadUsers();
    return !!users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  },

  /* ---- Generar token de recuperación (válido 30 min) ---- */
  generateResetToken(email) {
    const token = crypto.randomUUID ? crypto.randomUUID() :
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    const tokens = _loadTokens();
    tokens[email.toLowerCase()] = {
      token,
      expires: Date.now() + 30 * 60 * 1000, // 30 minutos
    };
    _saveTokens(tokens);
    return token;
  },

  /* ---- Validar token ---- */
  validateResetToken(email, token) {
    const tokens = _loadTokens();
    const entry = tokens[email.toLowerCase()];
    if (!entry) return false;
    if (Date.now() > entry.expires) return false;
    return entry.token === token;
  },

  /* ---- Cambiar contraseña con token ---- */
  async resetPassword(email, token, newPassword) {
    if (!this.validateResetToken(email, token)) {
      return { success: false, message: 'El enlace de recuperación es inválido o ha expirado.' };
    }
    const users = _loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }
    users[idx].passwordHash = await _hashPassword(newPassword);
    _saveUsers(users);
    // Eliminar token usado
    const tokens = _loadTokens();
    delete tokens[email.toLowerCase()];
    _saveTokens(tokens);
    console.log('[KADatabase] Contraseña actualizada para:', email);
    return { success: true };
  },

  /* ---- Cambiar contraseña (usuario autenticado) ---- */
  async changePassword(email, oldPassword, newPassword) {
    const check = await this.signIn(email, oldPassword);
    if (!check.success) {
      return { success: false, message: 'Contraseña actual incorrecta.' };
    }
    const users = _loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    users[idx].passwordHash = await _hashPassword(newPassword);
    _saveUsers(users);
    return { success: true };
  },

  /* ---- Listado de usuarios (sin contraseñas) ---- */
  getAllUsers() {
    return _loadUsers().map(({ uid, name, email, createdAt }) => ({ uid, name, email, createdAt }));
  },

  /* ---- Contar usuarios ---- */
  count() {
    return _loadUsers().length;
  },
};

window.KADatabase = KADatabase;
