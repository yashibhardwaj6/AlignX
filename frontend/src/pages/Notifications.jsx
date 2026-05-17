import { BellRing } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { useApi } from "../hooks/useApi.js";
import { api } from "../services/api.js";

export default function Notifications() {
  const { data: notifications = [], refresh } = useApi("/notifications", []);

  async function markRead(item) {
    await api(`/notifications/${item.id}/read`, { method: "PATCH" });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Notification Center</p>
        <h1 className="text-3xl font-black text-ink">Submissions, approvals, reminders, and escalation alerts</h1>
      </div>
      <div className="glass rounded-lg p-5">
        <div className="space-y-3">
          {notifications.map((item) => (
            <button key={item.id} onClick={() => markRead(item)} className="flex w-full items-start gap-4 rounded-md border border-line bg-white p-4 text-left transition hover:bg-mist">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-blue-50 text-brand"><BellRing size={18} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-ink">{item.title}</p>
                  <StatusBadge status={item.read_status ? "Completed" : "Pending"} />
                </div>
                <p className="mt-1 text-sm text-graphite">{item.message}</p>
                <p className="mt-2 text-xs font-semibold text-graphite">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            </button>
          ))}
          {!notifications.length && <p className="rounded-md border border-line bg-white p-6 text-center text-graphite">No notifications yet.</p>}
        </div>
      </div>
    </div>
  );
}
