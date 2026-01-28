import { apiGet, apiPost } from "../lib/apiClient";

/**
 * Booking API helpers for the multi-step booking wizard.
 *
 * Finalized wiring:
 * - Catalog reads from FastAPI:
 *   - GET /brands
 *   - GET /device-models?brand_id=...
 *   - GET /services
 * - Booking creation via FastAPI:
 *   - POST /repairs
 *
 * All requests should include `Authorization: Bearer <supabase_access_token>`.
 */

// PUBLIC_INTERFACE
export async function fetchBrands(accessToken) {
  /** Fetch available brands from the backend API. */
  return apiGet("/brands", accessToken);
}

// PUBLIC_INTERFACE
export async function fetchDeviceModels(brandId, accessToken) {
  /** Fetch device models filtered by brand_id from the backend API. */
  const qs = brandId ? `?brand_id=${encodeURIComponent(brandId)}` : "";
  return apiGet(`/device-models${qs}`, accessToken);
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
