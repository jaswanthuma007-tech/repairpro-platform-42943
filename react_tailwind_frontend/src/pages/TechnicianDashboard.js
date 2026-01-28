import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import { apiGet, apiPatch } from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

const allowedStatuses = ["accepted", "in_progress", "completed"];

// PUBLIC_INTERFACE
export default function TechnicianDashboard() {
  /** Technician dashboard: list assigned jobs and update status. */
  const { accessToken } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState("accepted");
  const [errorMsg, setErrorMsg] = useState("");

  const selected = useMemo(() => jobs.find((j) => j.id === selectedId) || null, [jobs, selectedId]);

  async function loadJobs() {
    const data = await apiGet("/repairs/jobs", accessToken);
    setJobs(data || []);
    if (!selectedId && data?.length) setSelectedId(data[0].id);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErrorMsg("");
      try {
        await loadJobs();
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e.message || "Failed to load jobs.");
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    const channel = supabase
      .channel("tech-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "repairs" }, async () => {
        try {
          await loadJobs();
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

  async function updateStatus() {
    if (!selectedId) return;
    setErrorMsg("");
    try {
      await apiPatch(`/repairs/${selectedId}/status`, { status }, accessToken);
      await loadJobs();
    } catch (e) {
      setErrorMsg(e.message || "Failed to update status.");
    }
  }

  return (
    <PageLayout>
      <h1 className="text-2xl font-semibold text-gray-900">Assigned Jobs</h1>
      <p className="mt-1 text-sm text-gray-600">Update repair statuses in realtime.</p>

      {errorMsg && (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-samsung border border-gray-100 lg:col-span-1">
          <div className="text-sm font-semibold text-gray-900">Jobs</div>
          <div className="mt-3 space-y-2">
            {jobs.length === 0 ? (
              <div className="text-sm text-gray-600">No assigned jobs yet.</div>
            ) : (
              jobs.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setSelectedId(j.id)}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    j.id === selectedId ? "border-blue-200 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold text-gray-900">Repair #{j.id.slice(0, 8)}</div>
                  <div className="mt-1 text-xs text-gray-500">Status: {j.status}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-samsung border border-gray-100 lg:col-span-2">
          <div className="text-sm font-semibold text-gray-900">Details</div>
          {!selected ? (
            <div className="mt-4 text-sm text-gray-600">Select a job to view details.</div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <div className="text-gray-500">Repair ID</div>
                    <div className="font-semibold text-gray-900">{selected.id}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Customer</div>
                    <div className="font-semibold text-gray-900">{selected.customer_id.slice(0, 8)}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-gray-500">Issue</div>
                    <div className="font-semibold text-gray-900">{selected.issue_description}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-gray-500">Address</div>
                    <div className="font-semibold text-gray-900">{selected.address}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-gray-900">Update status</div>
                <div className="flex gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
                  >
                    {allowedStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={updateStatus}
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:bg-blue-800 transition"
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Note: status transitions are validated by the backend and RLS scopes jobs to assigned technicians.
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
