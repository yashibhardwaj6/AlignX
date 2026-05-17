import { Lock, Target, Weight } from "lucide-react";
import ProgressBar from "./ProgressBar.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function GoalCard({ goal, progress = 0, children }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{goal.thrust_area}</p>
          <h3 className="mt-1 text-lg font-bold text-ink">{goal.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-graphite">{goal.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {goal.locked && <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-100 text-graphite" title="Locked"><Lock size={16} /></span>}
          <StatusBadge status={goal.status} />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-mist p-3 text-sm"><Target size={16} className="mb-1 text-brand" />Target <b>{goal.target}</b></div>
        <div className="rounded-md bg-mist p-3 text-sm"><Weight size={16} className="mb-1 text-brand" />Weightage <b>{goal.weightage}%</b></div>
        <div className="rounded-md bg-mist p-3 text-sm">UoM <b>{goal.uom_type}</b></div>
      </div>
      <div className="mt-5"><ProgressBar value={progress} /></div>
      {children && <div className="mt-5 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
