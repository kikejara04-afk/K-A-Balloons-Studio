/* =====================================================
   K&A Balloons Studio — Admin Guard & Utilities
   ===================================================== */

const KA_ADMIN_EMAIL = 'admin@kaballoonsstudio.com';

/* ============================================================
   GUARD — redirect non-admin users away from this page
   ============================================================ */
(function guardAdmin() {
  try {
    const raw  = localStorage.getItem('ka_user') || sessionStorage.getItem('ka_user');
    const user = raw ? JSON.parse(raw) : null;
    if (!user || user.role !== 'admin') {
      window.location.replace('login.html');
    }
  } catch (_) {
    window.location.replace('login.html');
  }
})();

/* ============================================================
   CURRENT ADMIN USER
   ============================================================ */
function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem('ka_user') || sessionStorage.getItem('ka_user') || 'null');
  } catch (_) { return null; }
}

/* ============================================================
   LOGOUT
   ============================================================ */
function adminLogout() {
  localStorage.removeItem('ka_user');
  sessionStorage.removeItem('ka_user');
  window.location.href = 'login.html';
}

/* ============================================================
   RESERVATIONS — localStorage key: 'ka_reservations'
   ============================================================ */
function getReservations() {
  try {
    return JSON.parse(localStorage.getItem('ka_reservations') || '[]');
  } catch (_) { return []; }
}
function saveReservations(list) {
  localStorage.setItem('ka_reservations', JSON.stringify(list));
}

/* ============================================================
   INVENTORY — localStorage key: 'ka_inventory'
   ============================================================ */
function getInventory() {
  try {
    return JSON.parse(localStorage.getItem('ka_inventory') || '[]');
  } catch (_) { return []; }
}
function saveInventory(list) {
  localStorage.setItem('ka_inventory', JSON.stringify(list));
}

/* ============================================================
   SHARED HEADER INIT (sets admin name in topbar)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const user = getAdminUser();
  const nameEl = document.getElementById('admin-user-name');
  if (nameEl && user) nameEl.textContent = user.name || 'Admin';

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);
});
