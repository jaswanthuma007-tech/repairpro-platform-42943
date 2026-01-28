import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";

const highlights = [
  {
    title: "3000+ Service Points",
    desc: "Nationwide coverage with convenient locations.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    )
  },
  {
    title: "Trained Service Experts",
    desc: "Certified specialists for modern devices.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M4 20a8 8 0 0 1 16 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18.5 6.5 20 8l3-3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    title: "Genuine Parts",
    desc: "Quality parts with reliable warranty support.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 8.5V15.5c0 .8-.43 1.54-1.13 1.93l-6 3.46c-.54.31-1.2.31-1.74 0l-6-3.46A2.23 2.23 0 0 1 4 15.5V8.5c0-.8.43-1.54 1.13-1.93l6-3.46c.54-.31 1.2-.31 1.74 0l6 3.46c.7.39 1.13 1.13 1.13 1.93Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 12 4.8 7.8M12 12l7.2-4.2M12 12v8.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
];

// PUBLIC_INTERFACE
export default function HomePage() {
  /** Samsung-style marketing home with full-bleed hero, dark gradient overlay, and glass highlight cards. */
  return (
    <PageLayout variant="fullBleed">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background image (blurred) */}
        <div
          className="absolute inset-0 bg-center bg-cover scale-110 blur-sm"
          style={{
            backgroundImage:
              // Showroom-style abstract backdrop (no external asset required)
              "url(https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=2400&q=80)"
          }}
          aria-hidden="true"
        />

        {/* Dark gradient overlay (Samsung-like) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="min-h-[70vh] pt-14 pb-12 flex items-center">
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="mx-auto max-w-3xl text-center"
              >
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium tracking-wide text-white/90 ring-1 ring-white/15 backdrop-blur">
                  MobileRepair Service Center
                </div>

                <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                  Service Center
                </h1>

                <p className="mt-4 text-base sm:text-lg text-white/80">
                  Fast, professional repairs with genuine parts—book in minutes and track updates in realtime.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                  <Link
                    to="/book"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 active:bg-gray-200 transition"
                  >
                    Book Repair
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15 active:bg-white/20 transition"
                  >
                    Track my repair
                  </Link>
                </div>
              </motion.div>

              {/* Glass highlight cards */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08, delayChildren: 0.05 }
                  }
                }}
                className="mt-10"
              >
                <div className="mx-auto max-w-5xl grid gap-4 sm:grid-cols-3">
                  {highlights.map((h) => (
                    <motion.div
                      key={h.title}
                      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="rounded-2xl bg-white/12 ring-1 ring-white/20 backdrop-blur-md shadow-samsung px-5 py-5 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                          {h.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{h.title}</div>
                          <div className="mt-1 text-sm text-white/75">{h.desc}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mx-auto max-w-5xl mt-6 text-center text-xs sm:text-sm text-white/65">
                  Tip: For device-specific pricing and options, use the Book Repair flow.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
