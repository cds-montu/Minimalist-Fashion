// Centralized web-storage helpers.
// Reads degrade to a fallback (and log), writes propagate a StorageError so
// callers can tell the user their change was not persisted.

export class StorageError extends Error {
  constructor(key, cause) {
    super('Could not save your changes. Browser storage may be full or unavailable.');
    this.name = 'StorageError';
    this.key = key;
    this.cause = cause;
  }
}

export function logError(scope, error) {
  // eslint-disable-next-line no-console
  console.error(`[${scope}]`, error);
}

export function logWarning(scope, error) {
  // eslint-disable-next-line no-console
  console.warn(`[${scope}]`, error);
}

export function readJSON(key, fallback, storage = getStorage('local')) {
  try {
    const raw = storage?.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (error) {
    logWarning(`storage:read:${key}`, error);
    return fallback;
  }
}

export function writeJSON(key, value, storage = getStorage('local')) {
  try {
    if (!storage) throw new Error('Web storage is unavailable');
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logError(`storage:write:${key}`, error);
    throw new StorageError(key, error);
  }
}

export function removeKey(key, storage = getStorage('local')) {
  try {
    storage?.removeItem(key);
  } catch (error) {
    logError(`storage:remove:${key}`, error);
    throw new StorageError(key, error);
  }
}

export function getStorage(kind = 'local') {
  try {
    if (typeof window === 'undefined') return null;
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch (error) {
    logWarning(`storage:access:${kind}`, error);
    return null;
  }
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.message || fallback;
}
