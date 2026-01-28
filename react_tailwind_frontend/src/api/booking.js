import { apiGet } from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

/**
 * Booking API helpers for the multi-step booking wizard.
 *
 * NOTE:
 * - Catalog reads prefer FastAPI endpoints (so JWT + RLS rules are consistently applied).
 * - Final booking is inserted directly into Supabase `repairs` table per requirements.
 *   (RLS must permit authenticated customer inserts.)
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
export async function createBookingInSupabase({
  brandId,
  modelId,
  serviceId,
  issueDescription,
  address,
  contactPhone,
  customerId
}) {
  /**
   * Insert a booking into Supabase `repairs` table.
   *
   * Requirements:
   * - Uses Supabase client for insert.
   * - Requires an authenticated user session (handled by supabase client).
   *
   * Throws Error with a user-friendly message on failure.
   */
  const payload = {
    customer_id: customerId,
    technician_id: null,
    brand_id: brandId,
    device_model_id: modelId,
    service_id: serviceId,
    issue_description: issueDescription.trim(),
    address: address.trim(),
    contact_phone: contactPhone.trim(),
    status: "pending"
  };

  const { data, error } = await supabase.from("repairs").insert(payload).select("*").single();

  if (error) {
    // Keep message short but actionable.
    throw new Error(error.message || "Failed to create booking in Supabase.");
  }
  return data;
}
