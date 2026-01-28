/**
 * Minimal fetch wrapper for the FastAPI backend.
 *
 * Uses:
 * - REACT_APP_API_BASE (preferred)
 * - REACT_APP_BACKEND_URL (fallback)
 */
const API_BASE = (process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

function buildHeaders(accessToken) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function assertApiBase() {
  if (!API_BASE) {
    throw new Error(
      "Backend API base URL is not configured. Set REACT_APP_API_BASE (preferred) or REACT_APP_BACKEND_URL."
    );
  }
}

async function parseJsonOrThrow(resp) {
  const text = await resp.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // If backend returns non-JSON error (proxy/html), keep raw text for debugging.
    data = null;
  }

  if (!resp.ok) {
    const msg = data?.detail ? JSON.stringify(data.detail) : text || resp.statusText;
    throw new Error(`API error (${resp.status}): ${msg}`);
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiGet(path, accessToken) {
  /** GET helper for backend endpoints. */
  assertApiBase();
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(accessToken)
  });
  return parseJsonOrThrow(resp);
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, accessToken) {
  /** POST helper for backend endpoints. */
  assertApiBase();
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
  assertApiBase();
  const resp = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: buildHeaders(accessToken),
    body: JSON.stringify(body)
  });
  return parseJsonOrThrow(resp);
}
