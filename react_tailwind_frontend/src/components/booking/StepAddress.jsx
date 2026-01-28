import React from "react";

// PUBLIC_INTERFACE
export default function StepAddress({ address, contactPhone, onChangeAddress, onChangeContactPhone }) {
  /** Step 4: enter address and phone. */
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <div className="text-sm font-medium text-gray-700">Address</div>
        <input
          value={address}
          onChange={(e) => onChangeAddress(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          placeholder="Pickup / dropoff address"
        />
      </label>

      <label className="block sm:col-span-1">
        <div className="text-sm font-medium text-gray-700">Contact phone</div>
        <input
          value={contactPhone}
          onChange={(e) => onChangeContactPhone(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          placeholder="+1 555 123 4567"
        />
      </label>
    </div>
  );
}
