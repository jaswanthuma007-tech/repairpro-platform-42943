import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";

const features = [
  { title: "3000+ Service Points", desc: "Nationwide coverage with convenient locations." },
  { title: "Trained Technicians", desc: "Certified experts for modern devices." },
  { title: "Genuine Parts", desc: "Quality parts with reliable warranty support." }
];

// PUBLIC_INTERFACE
export default function HomePage() {
  /** Samsung-style marketing home with hero + features + CTA. */
  return (
    <PageLayout>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Mobile Service Center
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Service Center
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Fast, professional repairs with genuine parts.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/book"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 transition"
            >
              Book Repair
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition"
            >
              Track my repair
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="rounded-3xl bg-gradient-to-br from-blue-500/10 to-gray-50 p-6 shadow-samsung"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
              >
                <div className="text-base font-semibold text-gray-900">{f.title}</div>
                <div className="mt-2 text-sm text-gray-600">{f.desc}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-5 border border-gray-100">
            <div className="text-sm font-semibold text-gray-900">How it works</div>
            <ol className="mt-3 space-y-2 text-sm text-gray-600">
              <li>1. Choose brand, model, and service.</li>
              <li>2. Describe the issue and add your address.</li>
              <li>3. Confirm booking and track progress in realtime.</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
