import React from "react";
import PageLayout from "../components/PageLayout";

// PUBLIC_INTERFACE
export default function PlaceholderPage({ title, subtitle }) {
  /** Simple placeholder page for non-core routes. */
  return (
    <PageLayout>
      <div className="rounded-3xl bg-white p-6 shadow-samsung border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>
    </PageLayout>
  );
}
