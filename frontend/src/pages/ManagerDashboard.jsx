import { ClipboardCheck, Gauge, TimerReset, Users } from "lucide-react";
import KpiCard from "../components/KpiCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Button from "../components/Button.jsx";
import { DepartmentBars, QuarterlyTrend, StatusPie, TeamLine } from "../charts/AnalyticsCharts.jsx";
import { useApi } from "../hooks/useApi.js";
import { api } from "../services/api.js";

export default function ManagerDashboard() {
  const { data: analytics, refresh } = useApi("/analytics/dashboard");
  const { data: goals = [], refresh: refreshGoals } = useApi("/goals", []);
  const pending = goals.filter((goal) => goal.status === "Submitted");

  async function review(goal, action) {
    await api(`/goals/${goal.id}/review`, { method: "POST", body: JSON.stringify({ action, manager_comment: action === "approve" ? "Approved for the current cycle." : "Please refine the target or business impact." }) });
    refreshGoals();
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Manager L1 Cockpit</p>
        <h1 className="text-3xl font-black text-ink">Team performance, approvals, and quarterly trends</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Team Goals" value={analytics?.kpis?.goals ?? 0} icon={Gauge} />
        <KpiCard label="Pending Approvals" value={analytics?.kpis?.pending ?? 0} icon={TimerReset} tone="yellow" />
        <KpiCard label="Approved Goals" value={analytics?.kpis?.approved ?? 0} icon={ClipboardCheck} tone="green" />
        <KpiCard label="Team Members" value={analytics?.teamAchievement?.length ?? 0} icon={Users} tone="brand" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <TeamLine data={analytics?.teamAchievement} />
        <StatusPie data={analytics?.statusBreakdown} />
        <QuarterlyTrend data={analytics?.quarterlyTrend} />
        <DepartmentBars data={analytics?.departmentPerformance} />
      </div>
      <div className="glass rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">Pending Approval Queue</h3>
          <StatusBadge status={`${pending.length} Pending`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-graphite">
              <tr><th className="py-3">Employee</th><th>Goal</th><th>Target</th><th>Weight</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pending.map((goal) => (
                <tr key={goal.id} className="border-t border-line">
                  <td className="py-3 font-semibold">{goal.employee?.name}</td>
                  <td>{goal.title}</td>
                  <td>{goal.target}</td>
                  <td>{goal.weightage}%</td>
                  <td><StatusBadge status={goal.status} /></td>
                  <td className="flex gap-2 py-2">
                    <Button variant="success" onClick={() => review(goal, "approve")}>Approve</Button>
                    <Button variant="subtle" onClick={() => review(goal, "return")}>Return</Button>
                    <Button variant="danger" onClick={() => review(goal, "reject")}>Reject</Button>
                  </td>
                </tr>
              ))}
              {!pending.length && <tr><td colSpan="6" className="py-8 text-center text-graphite">No pending approvals.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
