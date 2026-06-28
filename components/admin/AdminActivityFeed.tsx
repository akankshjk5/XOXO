"use client";

import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  time?: string | Date;
}

interface AdminActivityFeedProps {
  title: string;
  items: ActivityItem[];
  emptyMessage?: string;
}

export function AdminActivityFeed({ title, items, emptyMessage = "Nothing yet" }: AdminActivityFeedProps) {
  return (
    <div className="admin-card p-5">
      <h3 className="font-medium text-text-dark">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.length === 0 ? (
          <li className="py-6 text-center text-sm text-text-grey">{emptyMessage}</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-dark">{item.title}</p>
                {item.subtitle && (
                  <p className="truncate text-xs text-text-grey">{item.subtitle}</p>
                )}
              </div>
              {item.time && (
                <time className="shrink-0 text-[10px] text-text-grey">
                  {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                </time>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
