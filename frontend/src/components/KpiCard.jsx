export default function KpiCard({ label, value, icon: Icon, tone = "brand", delta }) {
  const tones = {
    brand: "bg-blue-50 text-brand",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-100 text-gray-700"
  };
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-graphite">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        {Icon && <div className={`grid h-11 w-11 place-items-center rounded-md ${tones[tone]}`}><Icon size={22} /></div>}
      </div>
      {delta && <p className="mt-4 text-xs font-semibold text-graphite">{delta}</p>}
    </div>
  );
}
