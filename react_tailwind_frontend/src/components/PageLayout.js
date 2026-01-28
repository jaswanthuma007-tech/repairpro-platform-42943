import React from "react";
import Navbar from "./Navbar";

// PUBLIC_INTERFACE
export default function PageLayout({ children }) {
  /** Standard page layout with top navbar and consistent max-width. */
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
