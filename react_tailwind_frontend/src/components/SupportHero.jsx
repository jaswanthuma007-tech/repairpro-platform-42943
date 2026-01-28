import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function SupportHero() {
  /** Hero-style support section with image + copy, Samsung-like rounded container and subtle gradient. */
  return (
    <section className="bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-3xl shadow-samsung border border-gray-200 overflow-hidden"
        >
          <div className="relative">
            {/* Light cream gradient background */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-100/40"
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-1 md:grid-cols-2">
              {/* Left: Image */}
              <div className="relative h-[220px] sm:h-[280px] md:h-full md:min-h-[340px]">
                <img
                  src="/assets/support-hero.png"
                  alt="Get Support demo"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                {/* Subtle overlay for text legibility when image is on top (mobile) */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0 md:hidden"
                  aria-hidden="true"
                />
              </div>

              {/* Right: Text */}
              <div className="flex items-center">
                <div className="w-full px-6 py-8 sm:px-8 sm:py-10 md:px-10">
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                    Get Support
                  </h2>

                  <p className="mt-3 text-sm sm:text-base text-gray-700 max-w-prose">
                    “Please select the problem description of product and we will recommend the most
                    appropriate solution for you”
                  </p>

                  <div className="mt-6">
                    <Link
                      to="/service-centers"
                      className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black active:bg-gray-800 transition"
                    >
                      Start Now
                    </Link>
                  </div>

                  {/* Small helper line (keeps Samsung-like “calm” spacing) */}
                  <div className="mt-4 text-xs text-gray-500">
                    Need quick help? Start here and we’ll guide you to the best option.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Note for future agent: ensure /public/assets/support-hero.jpg exists (matches design reference). */}
      </div>
    </section>
  );
}
