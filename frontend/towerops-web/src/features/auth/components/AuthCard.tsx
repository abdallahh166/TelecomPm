import type { PropsWithChildren, ReactNode } from "react";
import { t } from "../../../i18n";

type AuthCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
}>;

export function AuthCard({
  title,
  description,
  footer,
  className = "",
  children,
}: AuthCardProps) {
  return (
    <section
      className={`w-full rounded-[24px] border border-d-border bg-d-surface/95 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8 ${className}`.trim()}
    >
      <header className="space-y-3">
        <span className="inline-flex rounded-full border border-blue/20 bg-blue/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[1.8px] text-blue">
          {t("app.title")}
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-d-text sm:text-[34px]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-xl text-sm leading-6 text-d-muted sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-6">{children}</div>

      {footer ? <footer className="mt-6">{footer}</footer> : null}
    </section>
  );
}
