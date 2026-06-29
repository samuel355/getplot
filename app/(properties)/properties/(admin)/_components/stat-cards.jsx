export default function StatCards({ stats }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {stat.title}
            </p>
            {stat.icon}
          </div>
          <p className="text-3xl font-bold text-slate-900 leading-none">
            {stat.value ?? 0}
          </p>
          {stat.description && (
            <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
