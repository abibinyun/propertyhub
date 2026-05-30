export default function AnalyticsLoading() {
  return (
    <div className="py-2 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-muted" />
        <div className="space-y-1.5">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-3.5 w-32 rounded bg-muted" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border p-4 space-y-2">
            <div className="h-3.5 w-24 rounded bg-muted" />
            <div className="h-7 w-16 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="h-4 w-28 rounded bg-muted mb-4" />
        <div className="h-[220px] rounded-xl bg-muted" />
      </div>
    </div>
  );
}
