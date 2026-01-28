import React from "react";

// PUBLIC_INTERFACE
export default function StepIssue({ issueDescription, onChangeIssueDescription }) {
  /** Step 3: describe issue. */
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-900">Describe the issue</div>
      <textarea
        value={issueDescription}
        onChange={(e) => onChangeIssueDescription(e.target.value)}
        rows={5}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        placeholder="Example: Screen flickers after drop. Touch input delayed…"
      />
      <div className="text-xs text-gray-500">Minimum 5 characters.</div>
    </div>
  );
}
