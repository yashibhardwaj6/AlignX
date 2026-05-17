import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useApi } from "../hooks/useApi.js";
import { api } from "../services/api.js";

export default function CheckIns() {
  const { user } = useAuth();
  const { data: goals = [] } = useApi("/goals", []);
  const { data: checkins = [], refresh } = useApi("/checkins", []);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ quarter: "Q1", planned_target: "", actual_achievement: "", progress_status: "On Track" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/checkins", { method: "POST", body: JSON.stringify({ ...form, goal_id: selected.id }) });
      setSelected(null);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function completionPercent(item) {
    if (item.progress_status === "Completed") return 100;
    return item.progress_percent ?? 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Quarterly Check-in Module</p>
        <h1 className="text-3xl font-black text-ink">Planned vs actual progress by cycle</h1>
      </div>
      <div className="glass rounded-lg p-5">
        <h3 className="mb-4 text-base font-bold text-ink">Goal Check-in Actions</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-md border border-line bg-white p-4">
              <div className="flex justify-between gap-3">
                <div><p className="font-bold">{goal.title}</p><p className="text-sm text-graphite">{goal.target} · {goal.uom_type}</p></div>
                <StatusBadge status={goal.status} />
              </div>
              {user.role === "employee" && <Button className="mt-4" variant="subtle" onClick={() => setSelected(goal)}><ClipboardCheck size={16} />Submit Check-in</Button>}
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-lg p-5">
        <h3 className="mb-4 text-base font-bold text-ink">Quarterly Completion Tracker</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-graphite"><tr><th className="py-3">Quarter</th><th>Goal</th><th>Planned</th><th>Actual</th><th>Status</th><th>Completion</th></tr></thead>
            <tbody>
              {checkins.map((item) => {
                const goal = goals.find((g) => g.id === item.goal_id);
                return <tr key={item.id} className="border-t border-line"><td className="py-3 font-bold">{item.quarter}</td><td>{goal?.title || item.goal_id}</td><td>{item.planned_target}</td><td>{item.actual_achievement}</td><td><StatusBadge status={item.progress_status} /></td><td className="w-52"><ProgressBar value={completionPercent(item)} /></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selected && (
        <Modal title={`Submit ${selected.title} check-in`} onClose={() => setSelected(null)}>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">Quarter<select className="mt-2 w-full rounded-md border border-line p-3" value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })}>{["Q1", "Q2", "Q3", "Q4"].map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="text-sm font-bold">Status<select className="mt-2 w-full rounded-md border border-line p-3" value={form.progress_status} onChange={(e) => setForm({ ...form, progress_status: e.target.value })}>{["Not Started", "On Track", "Completed"].map((x) => <option key={x}>{x}</option>)}</select></label>
              <Input label="Planned Target" value={form.planned_target} onChange={(v) => setForm({ ...form, planned_target: v })} />
              <Input label="Actual Achievement" value={form.actual_achievement} onChange={(v) => setForm({ ...form, actual_achievement: v })} />
            </div>
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <Button type="submit">Submit Quarterly Update</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Input({ label, value, onChange }) {
  return <label className="text-sm font-bold">{label}<input required className="mt-2 w-full rounded-md border border-line p-3 outline-none focus:border-brand" value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
