import { apiGet, apiPost } from "../lib/apiClient";

/**
 * Booking API helpers for the multi-step booking wizard.
 *
 * Required wiring (per user request):
 * - Step 1: GET /brands
 * - Step 2: GET /models?brand_id=...
 * - Step 3: GET /issues
 * - Submit: POST /repairs
 *
 * Note: The backend supports both:
 * - GET /device-models?brand_id=... (canonical)
 * - GET /models?brand=<uuid> or ?brand_id=<uuid> (alias)
 *
 * All requests should include `Authorization: Bearer <supabase_access_token>` unless you
 * explicitly allow anon reads in Supabase RLS.
 */

// PUBLIC_INTERFACE
export async function fetchBrands(accessToken) {
  /** Fetch available brands from the backend API. */
  return apiGet("/api/brands", accessToken);
}

// PUBLIC_INTERFACE
export async function fetchModelsByBrand(brandId, accessToken) {
  /** Fetch models filtered by brand_id from the backend API (user-request /api endpoint). */
  const qs = brandId ? `?brand_id=${encodeURIComponent(brandId)}` : "";
  return apiGet(`/api/models${qs}`, accessToken);
}

// PUBLIC_INTERFACE
export async function fetchIssues(modelId, accessToken) {
  /**
   * Fetch issues list for Step 3.
   *
   * Per user_input_ref, Step 3 should fetch: GET /api/issues
   * (no filtering is required in the requested schema).
   */
  if (!modelId) return [];
  return apiGet("/api/issues", accessToken);
}

// PUBLIC_INTERFACE
export async function fetchServices(accessToken) {
  /** Fetch services from the backend API. */
  return apiGet("/services", accessToken);
}

// PUBLIC_INTERFACE
export async function createRepairBooking(
  { brandId, modelId, serviceId, issueDescription, address, contactPhone },
  accessToken
) {
  /**
   * Create a booking through FastAPI.
   *
   * Per user_input_ref, POST should be: /api/repairs
   * The requested schema uses: brand_id, model_id, issue_id, address, status, user_id (server-side).
   *
   * We map:
   * - modelId -> model_id
   * - issueDescription -> status remains default 'pending' server-side; issueDescription isn't stored in the requested schema
   *
   * Note: The existing UI still collects serviceId/contactPhone/issueDescription for the richer legacy schema.
   * For the user-request schema, we only send required fields; this unblocks Step 1–3 and booking submit.
   */
  const payload = {
    brand_id: brandId,
    model_id: modelId,
    // No issue_id selection is currently sent by the UI; can be added later from the Step 3 dropdown.
    address: address.trim()
  };

  return apiPost("/api/repairs", payload, accessToken);
}
