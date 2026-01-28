import React from "react";
import { motion } from "framer-motion";

const STEPS = ["Brand", "Model", "Issue", "Address", "Confirm"];

// PUBLIC_INTERFACE
export default function BookingStepper({ stepIndex }) {
  /** Samsung-style stepper with circles and animated progress bar. */
  const clamped = Math.max(0, Math.min(stepIndex ?? 0, STEPS.length - 1));
  const progressPct = (clamped / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full">
      <div className="relative">
        {/* Track */}
        <div className="absolute left-0 right-0 top-4 h-[3px] rounded-full bg-gray-200" />
        {/* Animated progress */}
        <motion.div
          className="absolute left-0 top-4 h-[3px] rounded-full bg-blue-600"
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
        />

        {/* Steps */}
        <div className="relative flex items-start justify-between">
          {STEPS.map((label, idx) => {
            const active = idx === clamped;
            const done = idx < clamped;

            const circleCls = done
              ? "bg-blue-600 text-white border-blue-600"
              : active
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-100 text-gray-600 border-gray-200";

            return (
              <div key={label} className="flex w-full flex-col items-center">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                    circleCls
                  ].join(" ")}
                >
                  {idx + 1}
                </div>
                <div className={active ? "mt-2 text-xs font-semibold text-gray-900" : "mt-2 text-xs text-gray-600"}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
