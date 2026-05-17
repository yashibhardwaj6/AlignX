export default function StatusBadge({ status }) {
  const label = status || "Not Started";
  const normalized = label.toLowerCase();
  const color = normalized.includes("complete") || normalized.includes("approved") ? "status-completed"
    : normalized.includes("track") || normalized.includes("submitted") ? "status-ontrack"
    : normalized.includes("reject") || normalized.includes("return") || normalized.includes("delay") ? "status-delayed"
    : "status-notstarted";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${color}`}>{label}</span>;
}
