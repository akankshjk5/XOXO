import { ContextualError } from "@/components/ui/ContextualError";

interface DataLoadErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  title?: string;
}

/** Inline error banner with optional retry — delegates to premium ContextualError. */
export function DataLoadError({
  message = "Couldn't load this data. Please check your connection and try again.",
  onRetry,
  className = "",
  title = "Couldn't load data",
}: DataLoadErrorProps) {
  return (
    <ContextualError
      title={title}
      message={message}
      onRetry={onRetry}
      className={className}
      compact
    />
  );
}
