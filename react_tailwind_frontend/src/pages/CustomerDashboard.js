import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../contexts/AuthContext";
import { apiGet } from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";

function StatusPill({ status }) {
  const map = {
    pending: "bg-gray-100 text-gray-700",
    accepted: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-800",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700"
  };
  const cls = map[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

// PUBLIC_INTERFACE
export default function CustomerDashboard() {
  /** Customer dashboard showing "My Repairs" with realtime updates. */
  const { accessToken } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedRepair = useMemo(
    () => repairs.find((r) => r.id === selectedRepairId) || null,
    [repairs, selectedRepairId]
  );

  async function loadRepairs() {
    const data = await apiGet("/repairs/my", accessToken);
    setRepairs(data || []);
    if (!selectedRepairId && data?.length) setSelectedRepairId(data[0].id);
  }

  async function loadHistory(repairId) {
    if (!repairId) {
      setHistory([]);
      return;
    }
    const h = await apiGet(`/repairs/${repairId}/history`, accessToken);
    setHistory(h || []);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErrorMsg("");
      try {
        await loadRepairs();
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e.message || "Failed to load repairs.");
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErrorMsg("");
      try {
        await loadHistory(selectedRepairId);
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e.message || "Failed to load history.");
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepairId]);

  useEffect(() => {
    // Supabase Realtime: listen for any changes in repairs/history and refresh current lists.
    // RLS will ensure only visible rows are delivered to this client.
    const channel = supabase
      .channel("customer-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repairs" },
        async () => {
          try {
            await loadRepairs();
          } catch {
            // ignore transient failures
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repair_status_history" },
        async (payload) => {
          const repairId = payload?.new?.repair_id || payload?.old?.repair_id;
          if (repairId && repairId === selectedRepairId) {
            try {
              await loadHistory(selectedRepairId);
            } catch {
              // ignore
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepairId, accessToken]);

  return (
    <PageLayout>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Repairs</h1>
          <p className="mt-1 text-sm text-gray-600">Realtime tracking for your active jobs.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-samsung border border-gray-100 lg:col-span-1">
          <div className="text-sm font-semibold text-gray-900">Repairs</div>
          <div className="mt-3 space-y-2">
            {repairs.length === 0 ? (
              <div className="text-sm text-gray-600">No repairs yet. Create one via Book Repair.</div>
            ) : (
              repairs.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRepairId(r.id)}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    r.id === selectedRepairId
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-100 hover:bg-gray-50"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-900">Repair #{r.id.slice(0, 8)}</div>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-samsung border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">Tracking</div>
            {selectedRepair && <StatusPill status={selectedRepair.status} />}
          </div>

          {!selectedRepair ? (
            <div className="mt-4 text-sm text-gray-600">Select a repair to view details.</div>
          ) : (
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <div className="text-gray-500">Repair ID</div>
                    <div className="font-semibold text-gray-900">{selectedRepair.id}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Technician</div>
                    <div className="font-semibold text-gray-900">
                      {selectedRepair.technician_id ? selectedRepair.technician_id.slice(0, 8) : "Unassigned"}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-gray-500">Issue</div>
                    <div className="font-semibold text-gray-900">{selectedRepair.issue_description}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-900">Status history</div>
                <div className="mt-3 space-y-2">
                  {history.length === 0 ? (
                    <div className="text-sm text-gray-600">No history entries yet.</div>
                  ) : (
                    history
                      .slice()
                      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""))
                      .map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3"
                        >
                          <div className="text-sm font-semibold text-gray-900">{h.status}</div>
                          <div className="text-xs text-gray-500">
                            {h.created_at ? new Date(h.created_at).toLocaleString() : ""}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
