"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  time?: string | Date;
  href?: string;
}

interface AdminActivityFeedProps {
  title: string;
  items: ActivityItem[];
  emptyMessage?: string;
  viewAllHref?: string;
}

export function AdminActivityFeed({
  title,
  items,
  emptyMessage = "Nothing yet",
  viewAllHref,
}: AdminActivityFeedProps) {
  return (
    <div className="admin-card p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-medium text-text-dark">{title}</h3>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs font-semibold text-green-dark hover:underline">
            View all
          </Link>
        )}
      </div>
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="py-6 text-center text-sm text-text-grey">{emptyMessage}</li>
        ) : (
          items.map((item) => {
            const inner = (
              <>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-dark">{item.title}</p>
                  {item.subtitle && <p className="truncate text-xs text-text-grey">{item.subtitle}</p>}
                </div>
                {item.time && (
                  <time className="shrink-0 text-[10px] text-text-grey">
                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                  </time>
                )}
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 px-3 py-2.5 hover:border-green-bright/30 hover:bg-white transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/50 px-3 py-2.5">
                    {inner}
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
