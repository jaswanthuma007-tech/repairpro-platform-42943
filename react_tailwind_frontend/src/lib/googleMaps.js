let loadingPromise = null;

/**
 * Minimal Google Maps JavaScript API loader.
 *
 * We intentionally avoid adding a 3rd-party wrapper dependency to keep bundle size and control tight.
 *
 * Reads env:
 * - REACT_APP_GOOGLE_MAPS_API_KEY
 */

// PUBLIC_INTERFACE
export function loadGoogleMaps() {
  /** Loads the Google Maps JS API (with marker library). Resolves with `window.google.maps`. */
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in a browser environment."));
  }

  // Already loaded
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadingPromise) return loadingPromise;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error(
        "Missing Google Maps API key. Set REACT_APP_GOOGLE_MAPS_API_KEY in the frontend environment."
      )
    );
  }

  loadingPromise = new Promise((resolve, reject) => {
    // If a script is already present, attach listeners.
    const existing = document.querySelector('script[data-google-maps="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.maps));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps script (existing tag)."))
      );
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-google-maps", "true");
    script.async = true;
    script.defer = true;

    // Use the standard JS API script, and request marker library for AdvancedMarkerElement when available.
    // Note: We keep `libraries=marker` as required by the task.
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      libraries: "marker"
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

    script.onload = () => {
      if (!window.google?.maps) {
        reject(new Error("Google Maps script loaded, but `window.google.maps` is missing."));
        return;
      }
      resolve(window.google.maps);
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));

    document.head.appendChild(script);
  });

  return loadingPromise;
}
