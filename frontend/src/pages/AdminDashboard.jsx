import { Activity, AlertTriangle, Building2, ClipboardList, ShieldCheck, Users } from "lucide-react";
import Button from "../components/Button.jsx";
import KpiCard from "../components/KpiCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { DepartmentBars, QuarterlyTrend, StatusPie, TeamLine } from "../charts/AnalyticsCharts.jsx";
import { useApi } from "../hooks/useApi.js";
import { api } from "../services/api.js";

export default function AdminDashboard() {
  const { data: analytics } = useApi("/analytics/dashboard");
  const { data: users = [] } = useApi("/admin/users", []);
  const { data: audits = [] } = useApi("/admin/audits", []);
  const { data: escalations = [] } = useApi("/admin/escalations", []);
  const { data: goals = [], refresh: refreshGoals } = useApi("/goals", []);

  async function unlock(goal) {
    await api(`/goals/${goal.id}/unlock`, { method: "POST" });
    refreshGoals();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Admin / HR Command Center</p>
        <h1 className="text-3xl font-black text-ink">Organization analytics, governance, and cycle control</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Employees" value={users.length} icon={Users} />
        <KpiCard label="Total Goals" value={analytics?.kpis?.goals ?? 0} icon={ClipboardList} />
        <KpiCard label="Avg Progress" value={`${analytics?.kpis?.avgProgress ?? 0}%`} icon={Activity} tone="green" />
        <KpiCard label="Escalations" value={analytics?.kpis?.escalations ?? 0} icon={AlertTriangle} tone="red" />
        <KpiCard label="Audit Events" value={audits.length} icon={ShieldCheck} tone="brand" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DepartmentBars data={analytics?.departmentPerformance} />
        <QuarterlyTrend data={analytics?.quarterlyTrend} />
        <StatusPie data={analytics?.statusBreakdown} />
        <TeamLine data={analytics?.teamAchievement} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-lg p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink"><Building2 size={18} /> Goal Unlock Control</h3>
          <div className="space-y-3">
            {goals.filter((goal) => goal.locked).slice(0, 6).map((goal) => (
              <div key={goal.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-white p-3">
                <div><p className="font-bold">{goal.employee?.name}</p><p className="text-sm text-graphite">{goal.title}</p></div>
                <Button variant="subtle" onClick={() => unlock(goal)}>Unlock</Button>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h3 className="mb-4 text-base font-bold text-ink">Escalation Monitoring</h3>
          <div className="space-y-3">
            {escalations.map((item) => (
              <div key={item.id} className="rounded-md border border-line bg-white p-3">
                <StatusBadge status={item.resolved ? "Completed" : "Delayed"} />
                <p className="mt-2 font-bold">{item.escalation_type}</p>
                <p className="text-sm text-graphite">Level: {item.escalation_level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass rounded-lg p-5">
        <h3 className="mb-4 text-base font-bold text-ink">Audit Trail</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-xs uppercase text-graphite"><tr><th className="py-3">Action</th><th>Changed By</th><th>Previous</th><th>Updated</th><th>Timestamp</th></tr></thead>
            <tbody>
              {audits.slice(0, 8).map((log) => (
                <tr key={log.id} className="border-t border-line"><td className="py-3 font-semibold">{log.action}</td><td>{log.changed_by}</td><td>{log.previous_value}</td><td>{log.updated_value}</td><td>{new Date(log.timestamp).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
