// Admin access-code handling for the demo admin UI.
//
// The access code lives in REACT_APP_ADMIN_ACCESS_CODE and is never committed.
// Anything shipped to the browser is public, so this gate only keeps the admin
// UI out of the way of regular visitors; real authorization must happen on the
// server for every admin request.

const SESSION_KEY = 'admin:session';

export const getAdminAccessCode = () =>
  (process.env.REACT_APP_ADMIN_ACCESS_CODE || '').trim();

export const isAdminAccessConfigured = () => getAdminAccessCode().length > 0;

export function startAdminSession(code) {
  const expected = getAdminAccessCode();
  if (!expected || String(code).trim() !== expected) return false;
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {}
  return true;
}

export function isAdminSessionValid() {
  if (!isAdminAccessConfigured()) return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function endAdminSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}
