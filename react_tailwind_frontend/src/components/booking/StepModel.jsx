import React from "react";

// PUBLIC_INTERFACE
export default function StepModel({
  models,
  services,
  modelId,
  serviceId,
  onChangeModelId,
  onChangeServiceId,
  brandSelected
}) {
  /** Step 2: select model and service. */
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-gray-900">Choose model + service</div>

      {!brandSelected && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-100">
          Please select a brand first.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium text-gray-700">Model</div>
          <select
            value={modelId}
            onChange={(e) => onChangeModelId(e.target.value)}
            disabled={!brandSelected}
            className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Select model…</option>
            {(models || []).map((m) => (
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
            onChange={(e) => onChangeServiceId(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Select service…</option>
            {(services || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.base_price != null ? ` — $${s.base_price}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
