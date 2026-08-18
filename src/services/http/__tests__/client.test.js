import { ENV } from 'core/config/env';
import { httpGet, httpPost, httpPut, httpDelete } from 'services/http/client';

jest.mock('core/config/env', () => ({ ENV: { API_BASE_URL: '' } }));

const jsonResponse = (body, { ok = true, status = 200, statusText = 'OK' } = {}) => ({
  ok,
  status,
  statusText,
  headers: { get: () => 'application/json; charset=utf-8' },
  json: () => Promise.resolve(body),
  text: () => Promise.resolve(JSON.stringify(body)),
});

const textResponse = (body, { ok = true, status = 200, statusText = 'OK' } = {}) => ({
  ok,
  status,
  statusText,
  headers: { get: () => 'text/plain' },
  json: () => Promise.reject(new Error('not json')),
  text: () => Promise.resolve(body),
});

const lastCall = () => global.fetch.mock.calls[global.fetch.mock.calls.length - 1];

beforeEach(() => {
  ENV.API_BASE_URL = '';
  global.fetch = jest.fn().mockResolvedValue(jsonResponse({ ok: true }));
});

afterEach(() => {
  delete global.fetch;
});

describe('url building', () => {
  it('resolves paths against the page origin', async () => {
    await httpGet('/products');
    expect(lastCall()[0]).toBe(`${window.location.origin}/products`);
  });

  it('prefixes the configured base url and strips its trailing slash', async () => {
    ENV.API_BASE_URL = 'https://api.example.com/v1/';
    await httpGet('/products');
    expect(lastCall()[0]).toBe('https://api.example.com/v1/products');
  });

  it('serializes params and skips null or undefined values', async () => {
    await httpGet('/search', { params: { q: 'shirt', page: 2, empty: '', missing: null, nope: undefined } });
    const url = new URL(lastCall()[0]);
    expect(url.searchParams.get('q')).toBe('shirt');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('empty')).toBe('');
    expect(url.searchParams.has('missing')).toBe(false);
    expect(url.searchParams.has('nope')).toBe(false);
  });

  it('appends one entry per array item', async () => {
    await httpGet('/search', { params: { tag: ['new', 'sale'] } });
    expect(new URL(lastCall()[0]).searchParams.getAll('tag')).toEqual(['new', 'sale']);
  });
});

describe('request methods', () => {
  it('sends a GET with merged headers', async () => {
    await expect(httpGet('/products', { headers: { 'X-Test': '1' } })).resolves.toEqual({ ok: true });
    expect(lastCall()[1]).toEqual({
      method: 'GET',
      headers: { Accept: 'application/json', 'X-Test': '1' },
    });
  });

  it('sends a POST with a JSON body', async () => {
    await httpPost('/orders', { body: { id: 1 } });
    expect(lastCall()[1]).toMatchObject({ method: 'POST', body: JSON.stringify({ id: 1 }) });
    expect(lastCall()[1].headers['Content-Type']).toBe('application/json');
  });

  it('omits the body when none is given', async () => {
    await httpPost('/ping');
    expect(lastCall()[1].body).toBeUndefined();
  });

  it('sends a PUT with a JSON body', async () => {
    await httpPut('/orders/1', { body: { status: 'Shipped' } });
    expect(lastCall()[1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ status: 'Shipped' }) });
  });

  it('sends a DELETE without a body', async () => {
    await httpDelete('/orders/1', { headers: { 'X-Test': '1' } });
    expect(lastCall()[1]).toEqual({
      method: 'DELETE',
      headers: { Accept: 'application/json', 'X-Test': '1' },
    });
  });

  it('ignores params on non-GET requests', async () => {
    await httpPost('/orders');
    expect(lastCall()[0]).toBe(`${window.location.origin}/orders`);
  });
});

describe('response handling', () => {
  it('returns text for non-JSON responses', async () => {
    global.fetch.mockResolvedValue(textResponse('pong'));
    await expect(httpGet('/ping')).resolves.toBe('pong');
  });

  it('returns an empty object when the JSON body is unparseable', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.reject(new Error('broken')),
    });
    await expect(httpGet('/products')).resolves.toEqual({});
  });

  it('throws an error carrying the status and body for error responses', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, { ok: false, status: 404, statusText: 'Not Found' })
    );

    await expect(httpGet('/products/999')).rejects.toMatchObject({
      message: 'Not found',
      status: 404,
      body: { message: 'Not found' },
    });
  });

  it('falls back to the status text when the body has no message', async () => {
    global.fetch.mockResolvedValue(jsonResponse({}, { ok: false, status: 500, statusText: 'Server Error' }));
    await expect(httpGet('/products')).rejects.toThrow('Server Error');
  });

  it('falls back to a generic message without a status text', async () => {
    global.fetch.mockResolvedValue(jsonResponse({}, { ok: false, status: 500, statusText: '' }));
    await expect(httpGet('/products')).rejects.toThrow('Request failed');
  });
});
