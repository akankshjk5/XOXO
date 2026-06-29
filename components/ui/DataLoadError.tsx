import { RefreshCw } from "lucide-react";

interface DataLoadErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Inline error banner with optional retry — use when list/data fetch fails. */
export function DataLoadError({
  message = "Could not load data. Check your connection and try again.",
  onRetry,
  className = "",
}: DataLoadErrorProps) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Retry
        </button>
      )}
    </div>
  );
}
