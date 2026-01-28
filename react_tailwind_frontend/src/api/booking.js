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
  return apiGet("/brands", accessToken);
}

// PUBLIC_INTERFACE
export async function fetchModelsByBrand(brandId, accessToken) {
  /** Fetch device models filtered by brand_id from the backend API (alias endpoint). */
  const qs = brandId ? `?brand_id=${encodeURIComponent(brandId)}` : "";
  return apiGet(`/models${qs}`, accessToken);
}

// PUBLIC_INTERFACE
export async function fetchIssues(modelId, accessToken) {
  /**
   * Fetch issues for a device model.
   *
   * Backend supports `?model=<uuid>` (legacy) and `?device_model_id=<uuid>` (preferred).
   * We use the preferred param.
   */
  if (!modelId) return [];
  return apiGet(`/issues?device_model_id=${encodeURIComponent(modelId)}`, accessToken);
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
   * This avoids direct client inserts when RLS is strict, and centralizes validation/business rules.
   */
  const payload = {
    brand_id: brandId,
    device_model_id: modelId,
    service_id: serviceId,
    issue_description: issueDescription.trim(),
    address: address.trim(),
    contact_phone: contactPhone.trim()
  };

  return apiPost("/repairs", payload, accessToken);
}
