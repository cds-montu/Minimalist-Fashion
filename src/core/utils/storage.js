// Safe wrappers around Web Storage: never throw on quota/private-mode/SSR.

function getStore(session) {
  try {
    return session ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function readRaw(key, { session = false } = {}) {
  try {
    return getStore(session)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeRaw(key, value, { session = false } = {}) {
  try {
    getStore(session)?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function readJSON(key, fallback = null, { session = false } = {}) {
  const raw = readRaw(key, { session });
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value, { session = false } = {}) {
  try {
    return writeRaw(key, JSON.stringify(value), { session });
  } catch {
    return false;
  }
}

// Reads a value expected to be an array, coercing anything else to `fallback`.
export function readArray(key, fallback = [], { session = false } = {}) {
  const value = readJSON(key, fallback, { session });
  return Array.isArray(value) ? value : fallback;
}

export function readObject(key, fallback = {}, { session = false } = {}) {
  const value = readJSON(key, fallback, { session });
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

export function removeKeys(keys, { session = false } = {}) {
  const list = Array.isArray(keys) ? keys : [keys];
  const store = getStore(session);
  list.forEach((key) => {
    try {
      store?.removeItem(key);
    } catch {
      // ignore
    }
  });
}
