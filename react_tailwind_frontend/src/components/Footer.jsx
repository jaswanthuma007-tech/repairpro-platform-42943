import React from "react";
import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Shop Home", to: "/" },
      { label: "SmartThings", to: "/services", external: true },
      { label: "Samsung Care+", to: "/services", external: true },
      { label: "Explore", to: "/category/phones", external: true }
    ]
  },
  {
    title: "Product",
    links: [
      { label: "Galaxy Smartphone", to: "/category/phones" },
      { label: "Galaxy Tab", to: "/category/tablets" },
      { label: "TVs", to: "/category/tv" },
      { label: "Washing Machines", to: "/category/washers", external: true },
      { label: "Accessories", to: "/category/wearables" }
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Support Home", to: "/services" },
      { label: "Book a Repair", to: "/book" },
      { label: "Track Repair", to: "/customer-dashboard" },
      { label: "Warranty Info", to: "/services", external: true },
      { label: "Service Center", to: "/service-centers" }
    ]
  },
  {
    title: "Account",
    links: [
      { label: "Orders", to: "/customer-dashboard" },
      { label: "My Page", to: "/dashboard" },
      { label: "Product Registration", to: "/services", external: true },
      { label: "Vouchers", to: "/services", external: true }
    ]
  },
  {
    title: "Sustainability",
    links: [
      { label: "Environment", to: "/services", external: true },
      { label: "Security & Privacy", to: "/services", external: true },
      { label: "Accessibility", to: "/services", external: true }
    ]
  },
  {
    title: "About Us",
    links: [
      { label: "Company Info", to: "/services", external: true },
      { label: "Careers", to: "/services", external: true },
      { label: "Investor Relations", to: "/services", external: true },
      { label: "Newsroom", to: "/services", external: true }
    ]
  }
];

function ExternalArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="ml-1 inline-block h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700 transition-colors"
      fill="none"
    >
      <path
        d="M14 5h5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14 19 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 14v5h-5"
        stroke="currentColor"
        strokeWidth="0"
        opacity="0"
      />
      <path
        d="M5 10v9h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0"
      />
    </svg>
  );
}

function FooterLink({ label, to, external }) {
  const commonClassName =
    "group inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors";

  // Underline animation: subtle, Samsung-like.
  const underlineClassName =
    "relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gray-900/70 after:transition-transform after:duration-200 group-hover:after:scale-x-100";

  // We do not have true external URLs in the current app. For "external" items we still use Link
  // (so navigation works) but add the visual affordance.
  return (
    <li className="py-1">
      <Link to={to} className={`${commonClassName} ${underlineClassName}`}>
        <span>{label}</span>
        {external ? <ExternalArrowIcon /> : null}
      </Link>
    </li>
  );
}

// PUBLIC_INTERFACE
export default function Footer() {
  /** Samsung-style mega footer: multi-column links with dividers + bottom copyright row. */
  return (
    <footer className="mt-16 w-full bg-white border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-4">
        {/* Columns */}
        <div className="py-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {footerColumns.map((col, idx) => (
              <div key={col.title} className="relative">
                {/* Vertical divider between columns on large screens */}
                {idx !== footerColumns.length - 1 ? (
                  <div className="hidden lg:block absolute -right-4 top-0 h-full w-px bg-gray-200" />
                ) : null}

                <h3 className="text-sm font-semibold text-gray-900">{col.title}</h3>
                <ul className="mt-4">
                  {col.links.map((l) => (
                    <FooterLink
                      key={`${col.title}-${l.label}`}
                      label={l.label}
                      to={l.to}
                      external={Boolean(l.external)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-gray-200 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              © 2026 MobileRepair. All Rights Reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
              <Link
                to="/services"
                className="hover:text-gray-900 transition-colors relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gray-900/70 after:transition-transform after:duration-200 hover:after:scale-x-100"
              >
                Privacy
              </Link>
              <Link
                to="/services"
                className="hover:text-gray-900 transition-colors relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gray-900/70 after:transition-transform after:duration-200 hover:after:scale-x-100"
              >
                Terms
              </Link>
              <Link
                to="/services"
                className="hover:text-gray-900 transition-colors relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gray-900/70 after:transition-transform after:duration-200 hover:after:scale-x-100"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
