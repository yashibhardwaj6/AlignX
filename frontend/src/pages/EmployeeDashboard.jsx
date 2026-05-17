import { CalendarClock, CheckCircle2, Clock3, Target } from "lucide-react";
import KpiCard from "../components/KpiCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { DepartmentBars, QuarterlyTrend, StatusPie } from "../charts/AnalyticsCharts.jsx";
import { useApi } from "../hooks/useApi.js";

export default function EmployeeDashboard() {
  const { data: analytics } = useApi("/analytics/dashboard");
  const { data: goals = [] } = useApi("/goals", []);
  const cycles = ["Goal Setting: May", "Q1: July", "Q2: October", "Q3: January", "Q4 / Annual: March-April"];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Employee Workspace</p>
        <h1 className="text-3xl font-black text-ink">Personal goals and quarterly achievement</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="My Goals" value={analytics?.kpis?.goals ?? 0} icon={Target} tone="brand" />
        <KpiCard label="Approved" value={analytics?.kpis?.approved ?? 0} icon={CheckCircle2} tone="green" />
        <KpiCard label="Pending Review" value={analytics?.kpis?.pending ?? 0} icon={Clock3} tone="yellow" />
        <KpiCard label="Avg Progress" value={`${analytics?.kpis?.avgProgress ?? 0}%`} icon={CalendarClock} tone="green" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <StatusPie data={analytics?.statusBreakdown} />
        <div className="xl:col-span-2"><QuarterlyTrend data={analytics?.quarterlyTrend} /></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <DepartmentBars data={analytics?.departmentPerformance} />
        <div className="glass rounded-lg p-5">
          <h3 className="text-base font-bold text-ink">Upcoming Cycle Windows</h3>
          <div className="mt-4 space-y-3">
            {cycles.map((cycle) => <div key={cycle} className="rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-graphite">{cycle}</div>)}
          </div>
        </div>
      </div>
      <div className="glass rounded-lg p-5">
        <h3 className="mb-4 text-base font-bold text-ink">Goal Status Breakdown</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-md border border-line bg-white p-4">
              <StatusBadge status={goal.status} />
              <p className="mt-3 font-bold text-ink">{goal.title}</p>
              <p className="mt-1 text-sm text-graphite">{goal.weightage}% · {goal.uom_type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
