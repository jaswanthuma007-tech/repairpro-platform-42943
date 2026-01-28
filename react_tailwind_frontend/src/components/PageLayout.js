import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// PUBLIC_INTERFACE
export default function PageLayout({ children, variant = "contained" }) {
  /** Standard page layout with top navbar and consistent max-width, with optional full-bleed variant. */
  const mainClassName =
    variant === "fullBleed" ? "w-full" : "mx-auto max-w-6xl px-4 py-10";

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Navbar />
      <main className={mainClassName}>{children}</main>
      <Footer />
    </div>
  );
}
