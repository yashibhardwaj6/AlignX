import { Download, FileSpreadsheet, Table2 } from "lucide-react";
import Button from "../components/Button.jsx";
import { reportUrl, token } from "../services/api.js";

const reports = [
  ["achievement-report", "Achievement Report", "Employee achievement against quarterly planned targets."],
  ["completion-dashboard", "Completion Dashboard", "Cycle completion, status, and completion percentages."],
  ["goal-tracking-report", "Goal Tracking Report", "Goal-level planned, actual, status, and completion view."]
];

export default function Reports() {
  function download(type, format) {
    fetch(reportUrl(type, format), { headers: { Authorization: `Bearer ${token()}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Reporting & Exports</p>
        <h1 className="text-3xl font-black text-ink">Exportable performance reports</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {reports.map(([type, title, description]) => (
          <div key={type} className="glass rounded-lg p-5">
            <FileSpreadsheet className="text-brand" />
            <h3 className="mt-4 text-lg font-black text-ink">{title}</h3>
            <p className="mt-2 text-sm text-graphite">{description}</p>
            <div className="mt-5 flex gap-2">
              <Button variant="subtle" onClick={() => download(type, "csv")}><Table2 size={16} />CSV</Button>
              <Button onClick={() => download(type, "xlsx")}><Download size={16} />Excel</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
