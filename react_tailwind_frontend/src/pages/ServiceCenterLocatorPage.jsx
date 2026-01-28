import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { apiGet } from "../lib/apiClient";
import { useAuth } from "../contexts/AuthContext";

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

function buildMapboxEmbedUrl({ lat, lng, zoom = 11 }) {
  // Mapbox static embed (no JS SDK dependency). You can swap to Google Maps later.
  // Requires REACT_APP_MAPBOX_PUBLIC_TOKEN if you want a styled map. If missing, we fallback to OpenStreetMap embed.
  const token = process.env.REACT_APP_MAPBOX_PUBLIC_TOKEN;

  if (token && lat != null && lng != null) {
    const base = "https://api.mapbox.com/styles/v1/mapbox/streets-v12.html";
    const params = new URLSearchParams({
      title: "false",
      access_token: token,
      zoomwheel: "true"
    });

    // Mapbox embed uses hash for view state.
    return `${base}?${params.toString()}#${zoom}/${lat}/${lng}`;
  }

  // Fallback: OpenStreetMap embed.
  // Compute a small bbox around the center.
  const delta = 0.08;
  const left = (lng ?? 77.5946) - delta;
  const right = (lng ?? 77.5946) + delta;
  const top = (lat ?? 12.9716) + delta;
  const bottom = (lat ?? 12.9716) - delta;

  const qs = new URLSearchParams({
    bbox: `${left},${bottom},${right},${top}`,
    layer: "mapnik",
    marker: `${lat ?? 12.9716},${lng ?? 77.5946}`
  });

  return `https://www.openstreetmap.org/export/embed.html?${qs.toString()}`;
}

function normalizeRadius(value) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  return 10;
}

// PUBLIC_INTERFACE
export default function ServiceCenterLocatorPage() {
  /** Samsung-style "Find a Service Center" page: category tabs, left search card, right map + results list. */
  const { session } = useAuth();

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[1]); // Mobile Phone default.
  const [cityOrPincode, setCityOrPincode] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);

  const [userCoords, setUserCoords] = useState(null); // {lat, lng}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState(null);

  const selectedCenter = useMemo(
    () => centers.find((c) => c.id === selectedCenterId) || null,
    [centers, selectedCenterId]
  );

  const mapCenter = useMemo(() => {
    if (selectedCenter) return { lat: selectedCenter.lat, lng: selectedCenter.lng };
    if (userCoords) return userCoords;
    // Default to a generic center (Bengaluru) if nothing else is known.
    return { lat: 12.9716, lng: 77.5946 };
  }, [selectedCenter, userCoords]);

  async function runSearch({ preferGeolocation = false } = {}) {
    setError("");
    setLoading(true);

    try {
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error("Please sign in to search service centers.");
      }

      // Heuristic: if user typed digits, assume pincode; else city.
      const trimmed = cityOrPincode.trim();
      const isLikelyPincode = /^\d{4,10}$/.test(trimmed);

      const params = new URLSearchParams();
      params.set("category", activeCategory);

      if (trimmed) {
        if (isLikelyPincode) params.set("pincode", trimmed);
        else params.set("city", trimmed);
      }

      // If user location is available (or requested), include lat/lng to enable sorting and radius filtering.
      if (preferGeolocation && userCoords) {
        params.set("lat", String(userCoords.lat));
        params.set("lng", String(userCoords.lng));
        params.set("radius", String(radiusKm));
      }

      const data = await apiGet(`/service-centers?${params.toString()}`, accessToken);
      const nextCenters = Array.isArray(data?.centers) ? data.centers : [];

      setCenters(nextCenters);
      setSelectedCenterId(nextCenters[0]?.id || null);
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
        // Re-run search with radius filtering enabled.
        runSearch({ preferGeolocation: true });
      },
      (err) => {
        setLoading(false);
        setError(err?.message || "Unable to get your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    // Initial search when authenticated (no location by default).
    if (session?.access_token) {
      runSearch({ preferGeolocation: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  useEffect(() => {
    // When category changes, refresh results.
    if (session?.access_token) {
      runSearch({ preferGeolocation: Boolean(userCoords) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

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
        <div className="w-full bg-[#1F2937]">
          <div className="mx-auto max-w-6xl px-2 sm:px-4">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const active = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={[
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                      active
                        ? "bg-white text-gray-900"
                        : "bg-white/10 text-white hover:bg-white/20"
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

        {/* Main: Left search + Right map */}
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left panel */}
            <section className="lg:col-span-4">
              <div className="rounded-3xl bg-white p-6 shadow-samsung border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">How to search</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Select a product category, enter your city/town or pincode, then choose a radius.
                    </p>
                  </div>
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

                <div className="mt-6 space-y-3">
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
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                      <option value={50}>50 km</option>
                    </select>
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => runSearch({ preferGeolocation: Boolean(userCoords) })}
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 transition"
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Search"}
                    </button>

                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition"
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

                {/* Results list */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Service centers</h3>
                    <span className="text-xs text-gray-500">{centers.length} found</span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {centers.length === 0 && !loading ? (
                      <div className="text-sm text-gray-600">
                        No service centers matched your search.
                      </div>
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
                              active
                                ? "border-blue-200 bg-blue-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
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

            {/* Right panel */}
            <section className="lg:col-span-8">
              <div className="rounded-3xl bg-white shadow-samsung border border-gray-100 overflow-hidden">
                {/* Map */}
                <div className="aspect-[16/10] w-full bg-gray-50">
                  <iframe
                    title="Service center map"
                    src={buildMapboxEmbedUrl({ lat: mapCenter.lat, lng: mapCenter.lng, zoom: 11 })}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Selected center details */}
                <div className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {selectedCenter ? selectedCenter.name : "Select a service center"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedCenter
                          ? `${selectedCenter.city} • ${selectedCenter.pincode}`
                          : "Search and select a marker/result to see details."}
                      </p>
                      {selectedCenter && (
                        <p className="mt-2 text-sm text-gray-700">
                          Contact: <span className="font-semibold">{selectedCenter.phone}</span>
                        </p>
                      )}
                    </div>

                    {selectedCenter && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          `${selectedCenter.lat},${selectedCenter.lng}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-semibold text-white hover:bg-black transition"
                      >
                        Directions
                      </a>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    Tip: Use “Use my location” to apply radius filtering and sort by nearest centers.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
