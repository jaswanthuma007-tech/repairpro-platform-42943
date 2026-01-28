import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import BookingStepper from "../components/BookingStepper";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchBrands,
  fetchModelsByBrand,
  fetchIssues,
  fetchServices,
  createRepairBooking
} from "../api/booking";

import StepBrand from "../components/booking/StepBrand";
import StepModel from "../components/booking/StepModel";
import StepIssue from "../components/booking/StepIssue";
import StepAddress from "../components/booking/StepAddress";
import StepConfirm from "../components/booking/StepConfirm";

const steps = ["Brand", "Model", "Issue", "Address", "Confirm"];

function toUserFacingFetchError(err) {
  const msg = err?.message || "";
  // The requirement specifically calls out showing "Failed to fetch" styling for API failures.
  // We keep message concise, but include details if present.
  if (/failed to fetch/i.test(msg)) return "Failed to fetch. Check backend URL/CORS and try again.";
  return msg || "Failed to fetch.";
}

// PUBLIC_INTERFACE
export default function BookingPage() {
  /** Samsung-style stepper-driven booking flow with backend catalog + Supabase insert. */
  const { accessToken } = useAuth();
  const location = useLocation();

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [services, setServices] = useState([]);
  const [issues, setIssues] = useState([]);
  const [issueId, setIssueId] = useState("");

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

  // Load brands + services (catalog)
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingCatalog(true);
      setErrorMsg("");
      try {
        const [b, s] = await Promise.all([fetchBrands(accessToken), fetchServices(accessToken)]);
        if (!mounted) return;
        setBrands(b || []);
        setServices(s || []);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(toUserFacingFetchError(e));
      } finally {
        if (mounted) setLoadingCatalog(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  // Preselect brand from URL (?brand=Samsung) once brands are available.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brandFromUrl = (params.get("brand") || "").trim();
    if (!brandFromUrl) return;
    if (!brands?.length) return;

    // Case-insensitive match against catalog brand names.
    const match = brands.find((b) => (b?.name || "").toLowerCase() === brandFromUrl.toLowerCase());
    if (!match) return;

    setBrandId(match.id);
    // If user arrived from Home brand cards, proceed to next step automatically.
    setStepIndex((prev) => (prev === 0 ? 1 : prev));
  }, [location.search, brands]);

  // Load models when brand changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      setErrorMsg("");
      if (!brandId) {
        setModels([]);
        setModelId("");
        setIssues([]);
        setIssueId("");
        return;
      }

      setLoadingModels(true);
      try {
        const m = await fetchModelsByBrand(brandId, accessToken);
        if (!mounted) return;
        setModels(m || []);
        // Reset model selection if it no longer exists
        setModelId((prev) => (m?.some((x) => x.id === prev) ? prev : ""));
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(toUserFacingFetchError(e));
      } finally {
        if (mounted) setLoadingModels(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [brandId, accessToken]);

  // Load issues when model changes (Step 3 catalog)
  useEffect(() => {
    let mounted = true;

    (async () => {
      setErrorMsg("");
      if (!modelId) {
        setIssues([]);
        setIssueId("");
        return;
      }

      try {
        const list = await fetchIssues(modelId, accessToken);
        if (!mounted) return;
        setIssues(list || []);
        setIssueId((prev) => (list?.some((x) => x.id === prev) ? prev : ""));
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(toUserFacingFetchError(e));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [modelId, accessToken]);

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
    setSubmitting(true);
    try {
      if (!accessToken) throw new Error("You must be signed in to create a booking.");

      const created = await createRepairBooking(
        {
          brandId,
          modelId,
          serviceId,
          issueDescription,
          address,
          contactPhone
        },
        accessToken
      );

      setResult(created);
    } catch (e) {
      setErrorMsg(e?.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const showConfirmButton = stepIndex === steps.length - 1;

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-6 shadow-samsung border border-gray-100">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Book a repair</h1>
            <p className="mt-1 text-sm text-gray-600">Complete the steps below to create a booking.</p>
          </div>

          <div className="mt-5">
            <BookingStepper stepIndex={stepIndex} />
          </div>

          {errorMsg && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              {errorMsg}
            </div>
          )}

          {loadingCatalog ? (
            <div className="mt-6 text-sm text-gray-600">Loading…</div>
          ) : (
            <motion.div
              key={stepIndex}
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {stepIndex === 0 && (
                <StepBrand
                  brands={brands}
                  brandId={brandId}
                  onChangeBrandId={setBrandId}
                  onSelected={() => setStepIndex(1)}
                />
              )}

              {stepIndex === 1 && (
                <div className="space-y-3">
                  {loadingModels && <div className="text-sm text-gray-600">Loading models…</div>}
                  <StepModel
                    brandSelected={Boolean(brandId)}
                    models={models}
                    services={services}
                    modelId={modelId}
                    serviceId={serviceId}
                    onChangeModelId={setModelId}
                    onChangeServiceId={setServiceId}
                  />
                </div>
              )}

              {stepIndex === 2 && (
                <div className="space-y-3">
                  {issues?.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium text-gray-700">Issue (optional)</div>
                        <select
                          value={issueId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            setIssueId(nextId);

                            const match = issues.find((x) => x.id === nextId);
                            // If user chooses a catalog issue, prefill the textarea (still editable).
                            if (match?.title) setIssueDescription(match.title);
                          }}
                          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        >
                          <option value="">Select issue…</option>
                          {issues.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  <StepIssue issueDescription={issueDescription} onChangeIssueDescription={setIssueDescription} />
                </div>
              )}

              {stepIndex === 3 && (
                <StepAddress
                  address={address}
                  contactPhone={contactPhone}
                  onChangeAddress={setAddress}
                  onChangeContactPhone={setContactPhone}
                />
              )}

              {stepIndex === 4 && (
                <StepConfirm
                  selectedBrand={selectedBrand}
                  selectedModel={selectedModel}
                  selectedService={selectedService}
                  issueDescription={issueDescription}
                  address={address}
                  contactPhone={contactPhone}
                  result={result}
                />
              )}
            </motion.div>
          )}

          <div className="mt-7 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={stepIndex === 0 || submitting}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition"
            >
              Back
            </button>

            {!showConfirmButton ? (
              <button
                type="button"
                onClick={next}
                disabled={!canProceed() || loadingCatalog || submitting}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submitBooking}
                disabled={!canProceed() || Boolean(result) || submitting}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition"
              >
                {result ? "Booked" : submitting ? "Booking…" : "Confirm booking"}
              </button>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            If you see <span className="font-semibold">Failed to fetch</span>, verify:
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>
                Frontend env: <span className="font-mono">REACT_APP_API_BASE_URL</span> (authoritative), or{" "}
                <span className="font-mono">REACT_APP_API_BASE</span> / <span className="font-mono">REACT_APP_BACKEND_URL</span>{" "}
                (legacy)
              </li>
              <li>
                Backend CORS: allow this site origin (e.g. <span className="font-mono">http://localhost:3000</span> in dev).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
