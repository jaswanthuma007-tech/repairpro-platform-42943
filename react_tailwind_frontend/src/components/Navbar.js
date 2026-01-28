import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/category/phones", label: "Phones" },
  { to: "/category/tablets", label: "Tablets" },
  { to: "/category/tv", label: "TV & Smart Home" },
  { to: "/category/wearables", label: "Smart Watch & Audio" },
  { to: "/services", label: "Services" }
];

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
    >
      {children}
    </button>
  );
}

function SearchModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="mx-auto max-w-3xl px-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Search</div>
              <IconButton label="Close search" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </div>

            <div className="mt-4">
              <input
                autoFocus
                placeholder="Search products, services, repairs..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-base outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />
              <p className="mt-3 text-sm text-gray-500">
                Tip: use the Book Repair flow for service requests.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DesktopSearchPill() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex h-11 items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="#6B7280"
            strokeWidth="2"
          />
          <path
            d="M16 16l5 5"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <input
          placeholder="Search"
          className="min-w-0 w-full bg-transparent text-sm leading-none outline-none"
        />
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Top sticky Samsung-style navigation with centered desktop search and mobile modal search. */
  const { session, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const accountLabel = useMemo(() => {
    if (!session) return "Account";
    if (role === "admin") return "Admin";
    if (role === "technician") return "Technician";
    return "Account";
  }, [session, role]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          {/* Single-line header: left / center / right. All vertically aligned (items-center). */}
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Left: mobile menu + logo */}
            <div className="flex min-w-0 shrink-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => navigate("/")}
                className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <Link
                to="/"
                className="shrink-0 font-semibold tracking-tight text-gray-900 whitespace-nowrap"
              >
                MobileRepair
              </Link>
            </div>

            {/* Center: (desktop) menu + centered pill search. Both collapse gracefully via min-w-0. */}
            <div className="hidden lg:flex min-w-0 flex-1 items-center justify-center gap-6">
              {/* Menu: single line, no wrapping */}
              <nav className="min-w-0">
                <ul className="flex min-w-0 flex-nowrap items-center gap-7 text-sm text-gray-700">
                  {navItems.map((item) => (
                    <li key={item.to} className="shrink-0">
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          clsx(
                            "relative block py-2 leading-none whitespace-nowrap hover:text-gray-900 transition",
                            "after:absolute after:left-0 after:bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-gray-900 after:transition-transform after:duration-200 hover:after:scale-x-100",
                            isActive && "text-gray-900 after:scale-x-100"
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Search: fixed-ish max width, but allowed to shrink without overlapping */}
              <div className="min-w-0 flex items-center justify-center">
                <DesktopSearchPill />
              </div>
            </div>

            {/* Right: icons + CTAs (never wrap; shrink-0). */}
            <div className="flex shrink-0 items-center gap-1">
              {/* Mobile search icon (opens modal) */}
              <div className="lg:hidden">
                <IconButton label="Open search" onClick={() => setMobileSearchOpen(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="#111827"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 16l5 5"
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </IconButton>
              </div>

              <IconButton label="Cart" onClick={() => navigate("/cart")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6h15l-1.5 9h-12L6 6Z"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6l-2-2H2"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    fill="#111827"
                  />
                </svg>
              </IconButton>

              <IconButton label={accountLabel} onClick={() => navigate("/dashboard")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="#111827" strokeWidth="2" />
                  <path
                    d="M4 20a8 8 0 0 1 16 0"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>

              <Link
                to="/book"
                className="ml-2 hidden sm:inline-flex h-10 items-center rounded-full bg-blue-600 px-4 text-sm font-semibold leading-none text-white shadow hover:bg-blue-700 active:bg-blue-800 transition whitespace-nowrap"
              >
                Book Repair
              </Link>

              {session && (
                <button
                  type="button"
                  onClick={signOut}
                  className="ml-2 hidden sm:inline-flex h-10 items-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold leading-none text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition whitespace-nowrap"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchModal open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
    </>
  );
}
