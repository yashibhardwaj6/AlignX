import { Plus, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import GoalCard from "../components/GoalCard.jsx";
import Modal from "../components/Modal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useApi } from "../hooks/useApi.js";
import { api } from "../services/api.js";

const emptyGoal = { thrust_area: "", title: "", description: "", uom_type: "Numeric", target: "", weightage: 10, direction: "min" };

export default function Goals() {
  const { user } = useAuth();
  const { data: goals = [], refresh } = useApi("/goals", []);
  const { data: checkins = [] } = useApi("/checkins", []);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyGoal);
  const [error, setError] = useState("");
  const totalWeight = useMemo(() => goals.reduce((sum, goal) => sum + Number(goal.weightage), 0), [goals]);

  function progressFor(goal) {
    const values = checkins.filter((item) => item.goal_id === goal.id).map((item) => item.progress_percent);
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/goals", { method: "POST", body: JSON.stringify(form) });
      setModal(false);
      setForm(emptyGoal);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitSheet() {
    setError("");
    try {
      await api("/goals/submit", { method: "POST" });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(goal) {
    await api(`/goals/${goal.id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand">Goal Creation Module</p>
          <h1 className="text-3xl font-black text-ink">Create, validate, submit, and track goals</h1>
        </div>
        {user.role === "employee" && <div className="flex gap-2"><Button variant="subtle" onClick={() => setModal(true)}><Plus size={16} />New Goal</Button><Button onClick={submitSheet}><Send size={16} />Submit Sheet</Button></div>}
      </div>
      <div className={`rounded-lg border p-4 font-semibold ${totalWeight === 100 ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-800"}`}>
        Total goal weightage: {totalWeight}%. Goal sheets can be submitted only when total weightage equals 100%, each goal is at least 10%, and max goals are 8.
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}
      <div className="grid gap-5">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} progress={progressFor(goal)}>
            {user.role === "employee" && goal.status === "Draft" && !goal.locked && <Button variant="danger" onClick={() => remove(goal)}><Trash2 size={16} />Delete Draft</Button>}
          </GoalCard>
        ))}
      </div>
      {modal && (
        <Modal title="Create goal" onClose={() => setModal(false)}>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Thrust Area" value={form.thrust_area} onChange={(v) => setForm({ ...form, thrust_area: v })} />
              <Input label="Goal Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            </div>
            <label className="text-sm font-bold">Goal Description<textarea required className="mt-2 min-h-24 w-full rounded-md border border-line p-3 outline-none focus:border-brand" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <div className="grid gap-4 sm:grid-cols-4">
              <label className="text-sm font-bold">UoM Type<select className="mt-2 w-full rounded-md border border-line p-3" value={form.uom_type} onChange={(e) => setForm({ ...form, uom_type: e.target.value })}>{["Numeric", "Percentage", "Timeline", "Zero-based"].map((x) => <option key={x}>{x}</option>)}</select></label>
              <Input label="Target" value={form.target} onChange={(v) => setForm({ ...form, target: v })} />
              <Input label="Weightage" type="number" value={form.weightage} onChange={(v) => setForm({ ...form, weightage: Number(v) })} />
              <label className="text-sm font-bold">Scoring<select className="mt-2 w-full rounded-md border border-line p-3" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}><option value="min">Higher is better</option><option value="max">Lower is better</option></select></label>
            </div>
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <Button type="submit">Save Draft Goal</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return <label className="text-sm font-bold">{label}<input required type={type} className="mt-2 w-full rounded-md border border-line p-3 outline-none focus:border-brand" value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
