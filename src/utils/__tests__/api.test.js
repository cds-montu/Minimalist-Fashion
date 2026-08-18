import { setAuthToken, getAuthToken, apiRequest, api } from 'utils/api';

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: () => Promise.resolve(body),
});

const lastCall = () => global.fetch.mock.calls[global.fetch.mock.calls.length - 1];

let consoleError;

beforeEach(() => {
  setAuthToken(null);
  localStorage.clear();
  sessionStorage.clear();
  global.fetch = jest.fn().mockResolvedValue(jsonResponse({ ok: true }));
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
  delete global.fetch;
});

describe('token handling', () => {
  it('returns null when no token is available', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('prefers the in-memory token over storage', () => {
    localStorage.setItem('auth:token', 'from-local');
    setAuthToken('in-memory');
    expect(getAuthToken()).toBe('in-memory');
  });

  it('falls back to localStorage then sessionStorage', () => {
    sessionStorage.setItem('auth:token', 'from-session');
    expect(getAuthToken()).toBe('from-session');

    localStorage.setItem('auth:token', 'from-local');
    expect(getAuthToken()).toBe('from-local');
  });

  it('tracks auth:login and auth:logout events', () => {
    window.dispatchEvent(new CustomEvent('auth:login', { detail: { token: 'event-token' } }));
    expect(getAuthToken()).toBe('event-token');

    window.dispatchEvent(new CustomEvent('auth:logout'));
    expect(getAuthToken()).toBeNull();
  });

  it('ignores auth:login events without a token', () => {
    setAuthToken('kept');
    window.dispatchEvent(new CustomEvent('auth:login', { detail: {} }));
    expect(getAuthToken()).toBe('kept');
  });
});

describe('apiRequest', () => {
  it('prefixes the endpoint with the base url and sends JSON headers', async () => {
    await expect(apiRequest('/products')).resolves.toEqual({ ok: true });
    expect(lastCall()[0]).toBe('/api/products');
    expect(lastCall()[1]).toMatchObject({
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(lastCall()[1].headers.Authorization).toBeUndefined();
  });

  it('adds a bearer token when one is available', async () => {
    setAuthToken('abc');
    await apiRequest('/products');
    expect(lastCall()[1].headers.Authorization).toBe('Bearer abc');
  });

  it('lets callers override headers', async () => {
    await apiRequest('/products', { headers: { 'Content-Type': 'text/plain', 'X-Test': '1' } });
    expect(lastCall()[1].headers).toMatchObject({ 'Content-Type': 'text/plain', 'X-Test': '1' });
  });

  it('stringifies object bodies and leaves strings untouched', async () => {
    await apiRequest('/products', { method: 'POST', body: { a: 1 } });
    expect(lastCall()[1].body).toBe(JSON.stringify({ a: 1 }));

    await apiRequest('/products', { method: 'POST', body: 'raw' });
    expect(lastCall()[1].body).toBe('raw');
  });

  it('returns an empty object when the response is not JSON', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.reject(new Error('no body')) });
    await expect(apiRequest('/products')).resolves.toEqual({});
  });

  it('throws an error carrying the status and payload', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ message: 'Bad request', field: 'email' }, { ok: false, status: 400 }));

    await expect(apiRequest('/products')).rejects.toMatchObject({
      message: 'Bad request',
      status: 400,
      data: { message: 'Bad request', field: 'email' },
    });
  });

  it('uses a generic message when the error payload has none', async () => {
    global.fetch.mockResolvedValue(jsonResponse({}, { ok: false, status: 500 }));
    await expect(apiRequest('/products')).rejects.toThrow('API request failed');
  });

  it('emits auth:expired on a 401', async () => {
    global.fetch.mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, { ok: false, status: 401 }));
    const listener = jest.fn();
    window.addEventListener('auth:expired', listener);

    await expect(apiRequest('/me')).rejects.toThrow('Unauthorized');

    window.removeEventListener('auth:expired', listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('rethrows network failures', async () => {
    global.fetch.mockRejectedValue(new Error('offline'));
    await expect(apiRequest('/products')).rejects.toThrow('offline');
  });
});

describe('api shortcuts', () => {
  it.each([
    ['get', 'GET'],
    ['delete', 'DELETE'],
  ])('%s issues a %s request', async (method, verb) => {
    await api[method]('/products');
    expect(lastCall()[1]).toMatchObject({ method: verb });
    expect(lastCall()[1].body).toBeUndefined();
  });

  it.each([
    ['post', 'POST'],
    ['put', 'PUT'],
    ['patch', 'PATCH'],
  ])('%s sends a %s request with a body', async (method, verb) => {
    await api[method]('/products', { a: 1 });
    expect(lastCall()[1]).toMatchObject({ method: verb, body: JSON.stringify({ a: 1 }) });
  });

  it('passes extra options through', async () => {
    await api.get('/products', { headers: { 'X-Test': '1' } });
    expect(lastCall()[1].headers['X-Test']).toBe('1');
  });
});
