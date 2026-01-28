import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SERVICE_MODES = {
  pickup: "pickup",
  doorstep: "doorstep"
};

const PROCESS_STEPS = [
  {
    id: "step1",
    number: 1,
    title: "Schedule a Pickup",
    description:
      "Pick a convenient time and location. Our team coordinates pickup for a smooth start."
  },
  {
    id: "step2",
    number: 2,
    title: "Expert Repair",
    description: "Your device is repaired by certified technicians using genuine parts."
  },
  {
    id: "step3",
    number: 3,
    title: "Safe Delivery",
    description: "We deliver your device back safely, with quality checks completed."
  }
];

const DETAIL_BY_MODE = {
  [SERVICE_MODES.pickup]: {
    badge: "Recommended",
    title: "Expert Repair",
    description: "Your device is repaired by certified technicians using genuine parts.",
    quote:
      "Our Pickup and Delivery service is highly recommended, offering the best quality repairs in a controlled environment to ensure long-term reliability without any unforeseen issues."
  },
  [SERVICE_MODES.doorstep]: {
    badge: null,
    title: "Doorstep Service",
    description:
      "Get select repairs completed at your doorstep with transparent diagnostics and quick turnaround.",
    quote:
      "Doorstep Service is ideal for quick fixes—our technician visits your location for supported repairs and immediate troubleshooting."
  }
};

// PUBLIC_INTERFACE
export default function ServiceProcess() {
  /** Samsung-style "Our Service Process" section with toggle, timeline, and animated detail card. */
  const [mode, setMode] = useState(SERVICE_MODES.pickup);
  const [activeStep, setActiveStep] = useState(2);

  const detail = DETAIL_BY_MODE[mode];

  const steps = useMemo(() => PROCESS_STEPS, []);

  const activeStepIndex = Math.max(0, Math.min(steps.length - 1, activeStep - 1));
  const progressPct = steps.length <= 1 ? 0 : (activeStepIndex / (steps.length - 1)) * 100;

  return (
    <section className="bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Our Service Process
          </h2>
        </div>

        {/* Toggle */}
        <div className="mt-7 flex justify-center">
          <div className="relative inline-flex items-center rounded-full bg-gray-100 p-1 ring-1 ring-gray-200">
            <ToggleButton
              active={mode === SERVICE_MODES.pickup}
              label="Pickup & Delivery"
              badge={mode === SERVICE_MODES.pickup ? "Recommended" : null}
              onClick={() => setMode(SERVICE_MODES.pickup)}
            />
            <ToggleButton
              active={mode === SERVICE_MODES.doorstep}
              label="Doorstep Service"
              onClick={() => setMode(SERVICE_MODES.doorstep)}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-10">
          <div className="relative mx-auto max-w-4xl">
            {/* Base line */}
            <div className="absolute left-0 right-0 top-[18px] h-[2px] bg-gray-200" aria-hidden="true" />
            {/* Active progress line */}
            <motion.div
              className="absolute left-0 top-[18px] h-[2px] bg-blue-600"
              style={{ width: `${progressPct}%` }}
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              aria-hidden="true"
            />

            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {steps.map((step) => {
                const isActive = step.number === activeStep;
                const isComplete = step.number < activeStep;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.number)}
                    className="group text-left focus:outline-none"
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1.05 : 1,
                          backgroundColor: isActive ? "rgb(37 99 235)" : isComplete ? "rgb(34 197 94)" : "rgb(255 255 255)",
                          borderColor: isActive
                            ? "rgba(37, 99, 235, 0.25)"
                            : isComplete
                              ? "rgba(34, 197, 94, 0.25)"
                              : "rgba(209, 213, 219, 1)"
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm"
                      >
                        <span
                          className={[
                            "text-sm font-semibold",
                            isActive ? "text-white" : isComplete ? "text-white" : "text-gray-800"
                          ].join(" ")}
                        >
                          {step.number}
                        </span>

                        {isActive ? (
                          <span className="absolute -inset-2 rounded-full bg-blue-600/10" aria-hidden="true" />
                        ) : null}
                      </motion.div>

                      <div className="mt-3 text-center">
                        <div
                          className={[
                            "text-sm font-semibold",
                            isActive ? "text-gray-900" : "text-gray-800"
                          ].join(" ")}
                        >
                          {step.title}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Animated detail card */}
        <div className="mt-8 sm:mt-10">
          <div className="mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${activeStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-3xl border border-gray-200 bg-white shadow-samsung overflow-hidden"
              >
                <div className="relative p-6 sm:p-8">
                  {/* Soft gradient accent (blue + green as requested) */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/10 via-emerald-400/10 to-transparent"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-blue-600/20 to-emerald-400/20 blur-2xl"
                    aria-hidden="true"
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      {detail.badge ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          {detail.badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                          Optional
                        </span>
                      )}

                      <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                        Step {activeStep} of {steps.length}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
                      {activeStep === 2 ? "Expert Repair" : steps[activeStepIndex].title}
                    </h3>

                    <p className="mt-2 text-sm sm:text-base text-gray-700">
                      {activeStep === 2 ? detail.description : steps[activeStepIndex].description}
                    </p>

                    <div className="mt-5 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                      <p className="text-sm text-gray-700 italic leading-relaxed">“{detail.quote}”</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Mobile helper */}
            <div className="mt-4 text-center text-xs text-gray-500 sm:hidden">
              Tap a step to see details.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToggleButton({ active, label, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-5 py-2 text-sm font-semibold transition",
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-700 hover:text-gray-900"
      ].join(" ")}
    >
      <span>{label}</span>

      {badge ? (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
