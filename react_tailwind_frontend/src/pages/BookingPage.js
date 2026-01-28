import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import { apiGet, apiPost } from "../lib/apiClient";

const steps = ["Brand", "Model", "Issue", "Address", "Confirm"];

function Stepper({ stepIndex }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {steps.map((s, idx) => {
        const active = idx === stepIndex;
        const done = idx < stepIndex;
        return (
          <div key={s} className="flex items-center gap-3">
            <div
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition",
                done ? "bg-blue-600 text-white" : active ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
              ].join(" ")}
            >
              {idx + 1}
            </div>
            <div className={active ? "text-sm font-semibold text-gray-900" : "text-sm text-gray-600"}>
              {s}
            </div>
            {idx !== steps.length - 1 && <div className="h-px w-10 bg-gray-200" />}
          </div>
        );
      })}
    </div>
  );
}

// PUBLIC_INTERFACE
export default function BookingPage() {
  /** Stepper-driven booking flow that creates a repair via backend API. */
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [services, setServices] = useState([]);

  const [stepIndex, setStepIndex] = useState(0);

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [serviceId, setServiceId] = useState("");

  const [issueDescription, setIssueDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedBrand = useMemo(() => brands.find((b) => b.id === brandId) || null, [brands, brandId]);
  const selectedModel = useMemo(() => models.find((m) => m.id === modelId) || null, [models, modelId]);
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const [b, s] = await Promise.all([apiGet("/brands", accessToken), apiGet("/services", accessToken)]);
        if (!mounted) return;
        setBrands(b || []);
        setServices(s || []);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e.message || "Failed to load catalog.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!brandId) {
        setModels([]);
        setModelId("");
        return;
      }
      try {
        const m = await apiGet(`/device-models?brand_id=${encodeURIComponent(brandId)}`, accessToken);
        if (!mounted) return;
        setModels(m || []);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e.message || "Failed to load device models.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [brandId, accessToken]);

  function next() {
    setErrorMsg("");
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function prev() {
    setErrorMsg("");
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function canProceed() {
    if (stepIndex === 0) return Boolean(brandId);
    if (stepIndex === 1) return Boolean(modelId && serviceId);
    if (stepIndex === 2) return issueDescription.trim().length >= 5;
    if (stepIndex === 3) return address.trim().length >= 5 && contactPhone.trim().length >= 6;
    return true;
  }

  async function submitBooking() {
    setErrorMsg("");
    try {
      const payload = {
        brand_id: brandId,
        device_model_id: modelId,
        service_id: serviceId,
        issue_description: issueDescription.trim(),
        address: address.trim(),
        contact_phone: contactPhone.trim()
      };
      const created = await apiPost("/repairs", payload, accessToken);
      setResult(created);
      setStepIndex(steps.length - 1);
    } catch (e) {
      setErrorMsg(e.message || "Booking failed.");
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-6 shadow-samsung border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Book a repair</h1>
              <p className="mt-1 text-sm text-gray-600">Complete the steps below to create a booking.</p>
            </div>
          </div>

          <div className="mt-5">
            <Stepper stepIndex={stepIndex} />
          </div>

          {errorMsg && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
          )}

          {loading ? (
            <div className="mt-6 text-sm text-gray-600">Loading catalog…</div>
          ) : (
            <motion.div
              key={stepIndex}
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {stepIndex === 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Choose a brand</div>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-900">Choose model + service</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="text-sm font-medium text-gray-700">Model</div>
                      <select
                        value={modelId}
                        onChange={(e) => setModelId(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      >
                        <option value="">Select model…</option>
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-sm font-medium text-gray-700">Service</div>
                      <select
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      >
                        <option value="">Select service…</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                            {s.base_price != null ? ` — $${s.base_price}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Describe the issue</div>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    placeholder="Example: Screen flickers after drop. Touch input delayed…"
                  />
                </div>
              )}

              {stepIndex === 3 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <div className="text-sm font-medium text-gray-700">Address</div>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      placeholder="Pickup / dropoff address"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <div className="text-sm font-medium text-gray-700">Contact phone</div>
                    <input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      placeholder="+1 555 123 4567"
                    />
                  </label>
                </div>
              )}

              {stepIndex === 4 && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-900">Confirm</div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <div className="text-gray-500">Brand</div>
                        <div className="font-semibold text-gray-900">{selectedBrand?.name || "-"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Model</div>
                        <div className="font-semibold text-gray-900">{selectedModel?.name || "-"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Service</div>
                        <div className="font-semibold text-gray-900">{selectedService?.name || "-"}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-gray-500">Issue</div>
                        <div className="font-semibold text-gray-900">{issueDescription || "-"}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-gray-500">Address</div>
                        <div className="font-semibold text-gray-900">{address || "-"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Phone</div>
                        <div className="font-semibold text-gray-900">{contactPhone || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {result && (
                    <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      Booking created. Repair ID: <span className="font-semibold">{result.id}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-7 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={stepIndex === 0}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition"
            >
              Back
            </button>

            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canProceed()}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submitBooking}
                disabled={!canProceed() || Boolean(result)}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition"
              >
                {result ? "Booked" : "Confirm booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
