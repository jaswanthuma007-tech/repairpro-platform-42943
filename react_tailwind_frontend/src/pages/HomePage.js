import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";

const brandShowcase = [
  {
    name: "Samsung",
    logo: (
      <svg viewBox="0 0 120 44" className="h-6 w-auto" aria-hidden="true">
        <rect x="0" y="0" width="120" height="44" rx="12" fill="currentColor" opacity="0.06" />
        <text
          x="60"
          y="28"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
          fontSize="16"
          fontWeight="700"
          fill="currentColor"
        >
          SAMSUNG
        </text>
      </svg>
    )
  },
  {
    name: "Apple",
    logo: (
      <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
        <path
          fill="currentColor"
          d="M29.7 23.4c0-3.3 2.7-4.9 2.8-5-1.5-2.2-3.9-2.5-4.7-2.6-2-.2-3.9 1.2-4.9 1.2-1 0-2.6-1.2-4.2-1.2-2.2.03-4.2 1.3-5.4 3.2-2.3 3.9-.6 9.7 1.7 12.8 1.1 1.5 2.4 3.2 4.2 3.1 1.7-.1 2.3-1.1 4.4-1.1 2 0 2.6 1.1 4.4 1 1.8 0 3-1.6 4.1-3.1 1.3-1.9 1.9-3.8 1.9-3.9-.04-.02-3.6-1.4-3.6-5.4Z"
        />
        <path
          fill="currentColor"
          d="M26.5 12.7c.9-1.1 1.5-2.6 1.3-4.1-1.3.05-2.9.9-3.8 2-0.8 1-1.6 2.6-1.4 4.1 1.5.1 3-.8 3.9-2Z"
        />
      </svg>
    )
  },
  {
    name: "OnePlus",
    logo: (
      <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
        <rect x="6" y="6" width="32" height="32" rx="8" fill="currentColor" opacity="0.08" />
        <path
          d="M14 28V16h8c3.1 0 5 1.7 5 4.2 0 2.6-1.9 4.3-5 4.3h-5v3.5H14Zm3-6h5c1.3 0 2-.6 2-1.8 0-1.1-.7-1.7-2-1.7h-5v3.5Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    name: "Xiaomi",
    logo: (
      <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
        <rect x="6" y="6" width="32" height="32" rx="10" fill="currentColor" opacity="0.08" />
        <path
          d="M16 29V15h12v14h-3V18h-6v11h-3Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    name: "Realme",
    logo: (
      <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
        <rect x="6" y="6" width="32" height="32" rx="10" fill="currentColor" opacity="0.08" />
        <path
          d="M16 29V15h7c3 0 5 1.6 5 4.1 0 1.8-.9 3.1-2.5 3.7L29 29h-3.4l-2.9-5.3H19V29h-3Zm3-8h4c1.2 0 2-.6 2-1.8 0-1.1-.8-1.7-2-1.7h-4V21Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    name: "Oppo",
    logo: (
      <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
        <rect x="6" y="6" width="32" height="32" rx="10" fill="currentColor" opacity="0.08" />
        <path
          d="M22 29c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7Zm0-2.7c2.4 0 4.3-1.9 4.3-4.3S24.4 17.7 22 17.7 17.7 19.6 17.7 22s1.9 4.3 4.3 4.3Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    name: "Vivo",
    logo: (
      <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
        <rect x="6" y="6" width="32" height="32" rx="10" fill="currentColor" opacity="0.08" />
        <path
          d="M14 16h3.2l4.2 9.2L25.6 16H29l-6.4 13h-2.5L14 16Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    name: "Motorola",
    logo: (
      <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
        <circle cx="22" cy="22" r="16" fill="currentColor" opacity="0.08" />
        <path
          d="M22 14c-3.8 0-7 2.9-7 7.4V30h3.1v-8.2c0-2.4 1.5-4 3.9-4 2.3 0 3.9 1.6 3.9 4V30H33v-8.6c0-4.5-3.2-7.4-7-7.4Z"
          fill="currentColor"
        />
      </svg>
    )
  }
];

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
  const navigate = useNavigate();

  function handleBrandClick(brandName) {
    // Route to booking flow with a query param to preselect brand in Step 1.
    // We use brand name (static list now); BookingPage maps it to actual brand id once catalog loads.
    navigate(`/book?brand=${encodeURIComponent(brandName)}`);
  }

  return (
    <PageLayout variant="fullBleed">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background image (blurred) */}
        <div
          className="absolute inset-0 hero-kenburns"
          style={{
            // High-resolution Samsung-style service center image (local asset)
            backgroundImage: "url(/assets/hero-service-center.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            // Keep blur subtle so the service-center interior still reads (premium look).
            filter: "blur(2px)",
            transform: "scale(1.06)"
          }}
          aria-hidden="true"
        />

        {/* Dark gradient overlay (Samsung-like) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70"
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

      {/* Mobile Brands Section (below hero) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
                Choose Your Mobile Brand
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Select your brand to start booking a repair—fast checkout, genuine parts.
              </p>
            </div>

            <Link to="/book" className="hidden sm:inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>

          {/* Mobile horizontal scroll */}
          <div className="mt-6 sm:hidden">
            <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-3 w-max pb-2">
                {brandShowcase.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => handleBrandClick(b.name)}
                    className="group w-[172px] shrink-0 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition
                               hover:shadow-samsung hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-gray-900">{b.logo}</div>
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600/10 to-amber-500/10 ring-1 ring-gray-200 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M9 18l6-6-6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-700"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-gray-900">{b.name}</div>
                    <div className="mt-1 text-xs text-gray-500">Tap to book</div>

                    {/* Hover glow */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop grid */}
          <div className="mt-6 hidden sm:grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {brandShowcase.map((b) => (
              <button
                key={b.name}
                type="button"
                onClick={() => handleBrandClick(b.name)}
                className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition
                           hover:shadow-samsung hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <div className="flex items-center gap-4">
                  <div className="text-gray-900">{b.logo}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{b.name}</div>
                    <div className="mt-0.5 text-xs text-gray-500">Book repair</div>
                  </div>
                </div>

                {/* Subtle hover glow */}
                <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        </div>
      </motion.section>
    </PageLayout>
  );
}
