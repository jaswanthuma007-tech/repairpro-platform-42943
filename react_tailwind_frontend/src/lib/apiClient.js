/**
 * Minimal fetch wrapper for the FastAPI backend.
 *
 * Uses:
 * - REACT_APP_API_BASE (preferred)
 * - REACT_APP_BACKEND_URL (fallback)
 */
const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";

function buildHeaders(accessToken) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

async function parseJsonOrThrow(resp) {
  const text = await resp.text();
  const data = text ? JSON.parse(text) : null;
  if (!resp.ok) {
    const msg = data?.detail ? JSON.stringify(data.detail) : text || resp.statusText;
    throw new Error(`API error (${resp.status}): ${msg}`);
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiGet(path, accessToken) {
  /** GET helper for backend endpoints. */
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(accessToken)
  });
  return parseJsonOrThrow(resp);
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, accessToken) {
  /** POST helper for backend endpoints. */
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify(body)
  });
  return parseJsonOrThrow(resp);
}

// PUBLIC_INTERFACE
export async function apiPatch(path, body, accessToken) {
  /** PATCH helper for backend endpoints. */
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: buildHeaders(accessToken),
    body: JSON.stringify(body)
  });
  return parseJsonOrThrow(resp);
}
