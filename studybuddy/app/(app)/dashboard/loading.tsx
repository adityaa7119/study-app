// app/(app)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Chart + progress skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card col-span-2 h-60 animate-pulse bg-slate-50 dark:bg-slate-800" />
        <div className="card h-60 animate-pulse bg-slate-50 dark:bg-slate-800" />
      </div>
    </div>
  );
}
