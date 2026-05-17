export default function ProgressBar({ value = 0 }) {
  const percent = Math.min(100, Math.max(0, Number(value) || 0));
  const color = percent >= 80 ? "bg-green-500" : percent >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-graphite">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color} progress-stripe transition-all duration-700`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
