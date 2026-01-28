import React from "react";

// PUBLIC_INTERFACE
export default function StepBrand({ brands, brandId, onChangeBrandId }) {
  /** Step 1: select brand. */
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-900">Choose a brand</div>
      <select
        value={brandId}
        onChange={(e) => onChangeBrandId(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      >
        <option value="">Select brand…</option>
        {(brands || []).map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
