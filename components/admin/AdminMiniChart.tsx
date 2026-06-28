"use client";

interface AdminMiniChartProps {
  title: string;
  data: { label: string; value: number }[];
  valuePrefix?: string;
  barClassName?: string;
}

export function AdminMiniChart({
  title,
  data,
  valuePrefix = "",
  barClassName = "bg-green-dark",
}: AdminMiniChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="admin-card p-5">
      <h3 className="font-medium text-text-dark">{title}</h3>
      {data.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-grey">No data yet</p>
      ) : (
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {data.map((point) => (
            <div key={point.label} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${barClassName} opacity-80 group-hover:opacity-100`}
                  style={{ height: `${Math.max(8, (point.value / max) * 100)}%` }}
                  title={`${valuePrefix}${point.value.toLocaleString()}`}
                />
              </div>
              <span className="truncate text-[10px] text-text-grey">{point.label.slice(5)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
