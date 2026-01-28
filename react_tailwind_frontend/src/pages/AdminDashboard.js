import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import { apiGet, apiPatch } from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  /** Admin dashboard: all repairs, assign technician, analytics summary. */
  const { accessToken } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [technicianId, setTechnicianId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const selected = useMemo(() => repairs.find((r) => r.id === selectedId) || null, [repairs, selectedId]);

  async function loadAll() {
    const [jobs, a] = await Promise.all([
      apiGet("/repairs/jobs", accessToken),
      apiGet("/admin/analytics/repairs", accessToken)
    ]);
    setRepairs(jobs || []);
    setAnalytics(a || null);
    if (!selectedId && jobs?.length) setSelectedId(jobs[0].id);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErrorMsg("");
      try {
        await loadAll();
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e.message || "Failed to load admin data.");
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "repairs" }, async () => {
        try {
          await loadAll();
        } catch {
          // ignore
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function assign() {
    if (!selectedId || !technicianId) return;
    setErrorMsg("");
    try {
      await apiPatch(`/admin/repairs/${selectedId}/assign`, { technician_id: technicianId }, accessToken);
      await loadAll();
      setTechnicianId("");
    } catch (e) {
      setErrorMsg(e.message || "Failed to assign technician.");
    }
  }

  return (
    <PageLayout>
      <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>
      <p className="mt-1 text-sm text-gray-600">Oversee repairs, assignments, and analytics.</p>

      {errorMsg && (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-samsung border border-gray-100">
          <div className="text-sm font-semibold text-gray-900">Analytics</div>
          {!analytics ? (
            <div className="mt-3 text-sm text-gray-600">Loading…</div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <div className="text-xs text-gray-500">Total repairs</div>
                <div className="text-2xl font-semibold text-gray-900">{analytics.total_repairs}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <div className="text-xs text-gray-500">By status</div>
                <div className="mt-2 space-y-1 text-sm">
                  {Object.entries(analytics.by_status || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{k}</div>
                      <div className="text-gray-700">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-samsung border border-gray-100 lg:col-span-2">
          <div className="text-sm font-semibold text-gray-900">All Repairs</div>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {repairs.length === 0 ? (
                <div className="text-sm text-gray-600">No repairs found.</div>
              ) : (
                repairs.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      r.id === selectedId ? "border-blue-200 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                    ].join(" ")}
                  >
                    <div className="text-sm font-semibold text-gray-900">Repair #{r.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      Status: {r.status} • Tech: {r.technician_id ? r.technician_id.slice(0, 8) : "Unassigned"}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-900">Assignment</div>
              {!selected ? (
                <div className="mt-2 text-sm text-gray-600">Select a repair to assign.</div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="text-xs text-gray-500">Repair ID</div>
                  <div className="text-sm font-semibold text-gray-900">{selected.id}</div>

                  <label className="block">
                    <div className="text-sm font-medium text-gray-700">Technician user_id (UUID)</div>
                    <input
                      value={technicianId}
                      onChange={(e) => setTechnicianId(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      placeholder="Paste technician's auth user id"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={assign}
                    disabled={!technicianId}
                    className="w-full rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition"
                  >
                    Assign technician
                  </button>

                  <div className="text-xs text-gray-500">
                    This uses the backend admin endpoint which enforces admin role server-side.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
