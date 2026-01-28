import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { apiGet } from "../lib/apiClient";
import { useAuth } from "../contexts/AuthContext";
import { loadGoogleMaps } from "../lib/googleMaps";

/**
 * Hardcoded Samsung-like top categories required by the spec.
 * Stored as display strings because backend uses `category` text.
 */
const CATEGORIES = [
  "TV & AV",
  "Mobile Phone",
  "Home Appliance",
  "PC & Office",
  "Displays",
  "Storage",
  "Camera & Camcorder",
  "Healthcare"
];

const RADIUS_OPTIONS = [
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 50, label: "50 km" }
];

function normalizeRadius(value) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  return 10;
}

function isLikelyPincode(s) {
  return /^\d{4,10}$/.test((s || "").trim());
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * In-page, lightweight marker popup (Samsung-style card) anchored over map.
 * We use a controlled "selected center" instead of Google InfoWindow so we can style it freely.
 */
function MapPopupCard({ center, onClose }) {
  if (!center) return null;

  return (
    <div className="absolute left-3 right-3 top-3 z-10 sm:left-6 sm:right-auto sm:top-6 sm:w-[360px]">
      <div className="rounded-3xl bg-white shadow-samsung border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">{center.name}</div>
            <div className="mt-1 text-xs text-gray-600">
              {center.city} • {center.pincode}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {center.address && <div className="mt-3 text-sm text-gray-700">{center.address}</div>}

        <div className="mt-3 text-sm text-gray-700">
          Phone: <span className="font-semibold text-gray-900">{center.phone}</span>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/book"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 transition"
          >
            Book Repair
          </Link>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${center.lat},${center.lng}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition"
          >
            Directions
          </a>
        </div>
      </div>
    </div>
  );
}

function MobileBottomSheet({ open, onClose, children }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          "fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full"
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Search filters"
      >
        <div className="mx-auto max-w-6xl">
          <div className="rounded-t-3xl bg-white shadow-samsung border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Search filters</div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
                aria-label="Close filters"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-3">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

// PUBLIC_INTERFACE
export default function ServiceCenterLocatorPage() {
  /** Samsung-style “Find a Service Center” page with category tabs, filters, and Google Maps markers. */
  const { session } = useAuth();

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[1]); // Mobile Phone default.
  const [cityOrPincode, setCityOrPincode] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);

  const [userCoords, setUserCoords] = useState(null); // {lat, lng}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState(null);

  const [mapType, setMapType] = useState("roadmap"); // roadmap | satellite
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedCenter = useMemo(
    () => centers.find((c) => c.id === selectedCenterId) || null,
    [centers, selectedCenterId]
  );

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // id -> marker
  const googleRef = useRef(null);

  const mapCenter = useMemo(() => {
    if (selectedCenter) return { lat: selectedCenter.lat, lng: selectedCenter.lng };
    if (userCoords) return userCoords;
    // Default to Bengaluru.
    return { lat: 12.9716, lng: 77.5946 };
  }, [selectedCenter, userCoords]);

  async function runSearch({ preferGeolocation = false } = {}) {
    setError("");
    setLoading(true);

    try {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Please sign in to search service centers.");

      const trimmed = cityOrPincode.trim();
      const params = new URLSearchParams();
      params.set("category", activeCategory);

      if (trimmed) {
        if (isLikelyPincode(trimmed)) params.set("pincode", trimmed);
        else params.set("city", trimmed);
      }

      // Only apply radius query if we have coords (from "Use my location").
      if (preferGeolocation && userCoords) {
        params.set("lat", String(userCoords.lat));
        params.set("lng", String(userCoords.lng));
        params.set("radius", String(radiusKm));
      }

      const data = await apiGet(`/service-centers?${params.toString()}`, accessToken);
      const raw = Array.isArray(data?.centers) ? data.centers : [];

      // Normalize API response fields (backend uses lat/lng, but user asked for latitude/longitude in Supabase doc).
      const normalized = raw
        .map((c) => ({
          ...c,
          lat: safeNumber(c.lat ?? c.latitude),
          lng: safeNumber(c.lng ?? c.longitude),
          address: c.address ?? null
        }))
        .filter((c) => c.lat != null && c.lng != null);

      setCenters(normalized);
      setSelectedCenterId(normalized[0]?.id || null);
    } catch (e) {
      setCenters([]);
      setSelectedCenterId(null);
      setError(e?.message || "Failed to search service centers.");
    } finally {
      setLoading(false);
    }
  }

  function handleUseMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        runSearch({ preferGeolocation: true });
      },
      (err) => {
        setLoading(false);
        setError(err?.message || "Unable to get your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Load Google Maps + initialize map once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const maps = await loadGoogleMaps();
        if (cancelled) return;

        googleRef.current = window.google;

        if (!mapContainerRef.current) return;

        // Initialize map only once.
        if (!mapRef.current) {
          mapRef.current = new maps.Map(mapContainerRef.current, {
            center: mapCenter,
            zoom: 11,
            mapTypeId: mapType,
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false, // we render our own Samsung-like toggle
            clickableIcons: false
          });
        }
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Failed to load Google Maps.");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep map center + type in sync with state.
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    mapRef.current.setMapTypeId(mapType);
  }, [mapType]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo(mapCenter);
  }, [mapCenter]);

  // Update markers when centers change.
  useEffect(() => {
    const g = googleRef.current;
    const map = mapRef.current;
    if (!g?.maps || !map) return;

    const existing = markersRef.current;

    // Remove markers that are no longer present
    for (const [id, marker] of existing.entries()) {
      if (!centers.some((c) => c.id === id)) {
        marker.setMap(null);
        existing.delete(id);
      }
    }

    // Add/update markers
    centers.forEach((c) => {
      if (existing.has(c.id)) return;

      const marker = new g.maps.Marker({
        map,
        position: { lat: c.lat, lng: c.lng },
        title: c.name
      });

      marker.addListener("click", () => {
        setSelectedCenterId(c.id);
      });

      existing.set(c.id, marker);
    });
  }, [centers]);

  // Initial search and refresh on category change.
  useEffect(() => {
    if (session?.access_token) {
      runSearch({ preferGeolocation: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.access_token) {
      runSearch({ preferGeolocation: Boolean(userCoords) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const filtersContent = (
    <>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-800">
          City / Town / Pincode
          <input
            value={cityOrPincode}
            onChange={(e) => setCityOrPincode(e.target.value)}
            placeholder="e.g. Mumbai or 400001"
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
          />
        </label>

        <label className="block text-sm font-medium text-gray-800">
          Radius
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(normalizeRadius(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => runSearch({ preferGeolocation: Boolean(userCoords) })}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            onClick={handleUseMyLocation}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60"
            disabled={loading}
          >
            Use my location
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </>
  );

  return (
    <PageLayout variant="fullBleed">
      <div className="w-full bg-brand-background">
        {/* Title */}
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-6">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-gray-900">
            Find a Service Center
          </h1>
        </div>

        {/* Category bar */}
        <div className="w-full bg-[#111827]">
          <div className="mx-auto max-w-6xl px-2 sm:px-4">
            <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((cat) => {
                const active = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={[
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                      active ? "bg-white text-gray-900" : "bg-white/10 text-white hover:bg-white/20"
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left panel (desktop) */}
            <section className="hidden lg:block lg:col-span-4">
              <div className="rounded-3xl bg-white p-6 shadow-samsung border border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">How to search</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Select a product category, enter your city/town or pincode, then choose a radius.
                  </p>
                </div>

                <ol className="mt-4 space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      1
                    </span>
                    <span>Select product category</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      2
                    </span>
                    <span>Enter city / town / pincode</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      3
                    </span>
                    <span>Choose search radius (10km, 20km, 50km)</span>
                  </li>
                </ol>

                <div className="mt-6">{filtersContent}</div>

                {/* Results list */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Service centers</h3>
                    <span className="text-xs text-gray-500">{centers.length} found</span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {centers.length === 0 && !loading ? (
                      <div className="text-sm text-gray-600">No service centers matched your search.</div>
                    ) : (
                      centers.map((c) => {
                        const active = c.id === selectedCenterId;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCenterId(c.id)}
                            className={[
                              "w-full rounded-2xl border p-4 text-left transition",
                              active ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                                <div className="mt-1 text-xs text-gray-600">
                                  {c.city} • {c.pincode}
                                </div>
                                <div className="mt-2 text-xs text-gray-600">
                                  Phone: <span className="font-medium text-gray-900">{c.phone}</span>
                                </div>
                              </div>
                              <span
                                className={[
                                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold",
                                  active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                                ].join(" ")}
                              >
                                {c.category}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Right panel (map) */}
            <section className="lg:col-span-8">
              <div className="rounded-3xl bg-white shadow-samsung border border-gray-100 overflow-hidden">
                {/* Map container */}
                <div className="relative aspect-[16/10] w-full bg-gray-50">
                  <div ref={mapContainerRef} className="absolute inset-0" />

                  {/* Styled map type toggle */}
                  <div className="absolute right-3 top-3 z-10 sm:right-6 sm:top-6">
                    <div className="rounded-full bg-white shadow-samsung border border-gray-100 p-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => setMapType("roadmap")}
                        className={[
                          "h-9 rounded-full px-4 text-sm font-semibold transition",
                          mapType === "roadmap" ? "bg-gray-900 text-white" : "text-gray-900 hover:bg-gray-100"
                        ].join(" ")}
                        aria-pressed={mapType === "roadmap"}
                      >
                        Map
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapType("satellite")}
                        className={[
                          "h-9 rounded-full px-4 text-sm font-semibold transition",
                          mapType === "satellite" ? "bg-gray-900 text-white" : "text-gray-900 hover:bg-gray-100"
                        ].join(" ")}
                        aria-pressed={mapType === "satellite"}
                      >
                        Satellite
                      </button>
                    </div>
                  </div>

                  {/* Popup card */}
                  <MapPopupCard center={selectedCenter} onClose={() => setSelectedCenterId(null)} />

                  {/* Mobile: filters button */}
                  <div className="absolute left-3 bottom-3 z-10 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-gray-900 shadow-samsung border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition"
                    >
                      Filters
                    </button>
                  </div>
                </div>

                {/* Footer tips */}
                <div className="p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedCenter ? selectedCenter.name : "Select a service center"}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {selectedCenter
                          ? `${selectedCenter.city} • ${selectedCenter.pincode}`
                          : "Tap a marker or a result to see details and book a repair."}
                      </div>
                    </div>

                    <Link
                      to="/book"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 transition"
                    >
                      Book Repair
                    </Link>
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    Tip: Use “Use my location” to enable radius filtering and show nearest centers first.
                  </div>
                </div>
              </div>

              {/* Mobile results list under map (Samsung-ish) */}
              <div className="mt-5 lg:hidden">
                <div className="rounded-3xl bg-white p-5 shadow-samsung border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">Service centers</div>
                    <div className="text-xs text-gray-500">{centers.length} found</div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {centers.length === 0 && !loading ? (
                      <div className="text-sm text-gray-600">No service centers matched your search.</div>
                    ) : (
                      centers.map((c) => {
                        const active = c.id === selectedCenterId;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCenterId(c.id)}
                            className={[
                              "w-full rounded-2xl border p-4 text-left transition",
                              active ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                                <div className="mt-1 text-xs text-gray-600">
                                  {c.city} • {c.pincode}
                                </div>
                                <div className="mt-2 text-xs text-gray-600">
                                  Phone: <span className="font-medium text-gray-900">{c.phone}</span>
                                </div>
                              </div>
                              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700">
                                {c.category}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <MobileBottomSheet open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
          {filtersContent}
        </MobileBottomSheet>
      </div>
    </PageLayout>
  );
}
