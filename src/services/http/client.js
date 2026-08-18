import { ENV } from 'core/config/env';
import { logWarning } from 'core/utils/storage';

function buildUrl(path, params) {
  const base = ENV.API_BASE_URL?.replace(/\/$/, '') || '';
  const url = new URL(`${base}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v.forEach((vv) => url.searchParams.append(k, vv));
      else url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson
    ? await res.json().catch((error) => {
        logWarning(`http:parse:${res.url}`, error);
        return {};
      })
    : await res.text();
  if (!res.ok) {
    const err = new Error(body?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export async function httpGet(path, { params, headers } = {}) {
  const url = buildUrl(path, params);
  const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json', ...headers } });
  return handleResponse(res);
}

export async function httpPost(path, { body, headers } = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

export async function httpPut(path, { body, headers } = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

export async function httpDelete(path, { headers } = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json', ...headers } });
  return handleResponse(res);
}
