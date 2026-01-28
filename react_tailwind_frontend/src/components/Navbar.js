import React, { useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/category/phones", label: "Phones" },
  { to: "/category/tablets", label: "Tablets" },
  { to: "/category/tv", label: "TV & Smart Home" },
  { to: "/category/wearables", label: "Smart Watch & Audio" },
  { to: "/services", label: "Services" },
  { to: "/service-centers", label: "Service Centers" }
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

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Top sticky Samsung-style navigation with 3-section flex layout. (Search + Cart icons removed per product requirement.) */
  const { session, role, signOut } = useAuth();
  const navigate = useNavigate();

  const accountLabel = useMemo(() => {
    if (!session) return "Account";
    if (role === "admin") return "Admin";
    if (role === "technician") return "Technician";
    return "Account";
  }, [session, role]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-6xl px-4">
        {/* 3-section layout: Left (logo+menu) / Center (reserved) / Right (actions) */}
        <div className="flex h-16 items-center gap-4">
          {/* LEFT: logo + desktop nav (single line, no wrapping) */}
          <div className="flex min-w-0 flex-1 items-center gap-6">
            {/* Mobile menu icon (kept for parity; can later open drawer) */}
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

            <nav className="hidden lg:block min-w-0">
              <ul className="flex min-w-0 flex-nowrap items-center gap-7 text-sm text-gray-700">
                {navItems.map((item) => (
                  <li key={item.to} className="shrink-0">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          "relative block py-2 leading-none whitespace-nowrap hover:text-gray-900 transition",
                          // Underline stays aligned under text regardless of container widths.
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
          </div>

          {/* CENTER: reserved column (prevents overlap) */}
          <div className="hidden lg:flex min-w-0 flex-[0_0_420px] items-center justify-center" />

          {/* RIGHT: actions (never wrap; shrink-0) */}
          <div className="flex shrink-0 items-center gap-1">
            <IconButton label={accountLabel} onClick={() => navigate("/dashboard")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                  stroke="#111827"
                  strokeWidth="2"
                />
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
  );
}
