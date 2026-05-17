import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#16a34a", "#d99a10", "#dc2626", "#64748b", "#1769e0", "#16b8c5"];

function Panel({ title, children }) {
  return (
    <div className="glass rounded-lg p-5">
      <h3 className="mb-4 text-base font-bold text-ink">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  );
}

export function StatusPie({ data = [] }) {
  return (
    <Panel title="Goal Completion Mix">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data.length ? data : [{ name: "No goals", value: 1 }]} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
            {(data.length ? data : [{ name: "No goals" }]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
}

export function QuarterlyTrend({ data = [] }) {
  return (
    <Panel title="Quarterly Performance Trend">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trend" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#1769e0" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1769e0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde5ef" />
          <XAxis dataKey="quarter" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Area type="monotone" dataKey="progress" stroke="#1769e0" fill="url(#trend)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}

export function DepartmentBars({ data = [] }) {
  return (
    <Panel title="Department-wise Performance">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde5ef" />
          <XAxis dataKey="department" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="score" fill="#16b8c5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

export function TeamLine({ data = [] }) {
  return (
    <Panel title="Team Achievement Comparison">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde5ef" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="progress" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  );
}
