import type { PropsWithChildren } from "react";

type MessageStateProps = PropsWithChildren<{
  title: string;
  tone?: "neutral" | "success" | "error";
}>;

export function LoadingState({ title }: { title: string }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-state__spinner" aria-hidden="true" />
      <span>{title}</span>
    </div>
  );
}

export function EmptyState({
  title,
  tone = "neutral",
  children,
}: MessageStateProps) {
  return (
    <div className={`empty-state empty-state--${tone}`}>
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export function InlineNotice({
  title,
  tone = "neutral",
  children,
}: MessageStateProps) {
  return (
    <div className={`inline-notice inline-notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
