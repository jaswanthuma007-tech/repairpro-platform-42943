import React from "react";

// PUBLIC_INTERFACE
export default function StepConfirm({
  selectedBrand,
  selectedModel,
  selectedService,
  issueDescription,
  address,
  contactPhone,
  result
}) {
  /** Step 5: confirm summary and show created booking result. */
  return (
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
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800 border border-blue-100">
          Booking created. Repair ID: <span className="font-semibold">{result.id}</span>
        </div>
      )}
    </div>
  );
}
