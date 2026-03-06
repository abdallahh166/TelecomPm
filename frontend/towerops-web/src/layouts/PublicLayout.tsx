import { Outlet } from "react-router-dom";
import { initI18n, t } from "../i18n";

initI18n();

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-d-bg text-d-text font-sans">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,420px)] lg:items-center lg:gap-10 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[28px] border border-d-border bg-d-surface/85 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8 lg:min-h-[640px] lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,194,255,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,184,0,0.08),transparent_32%)]" />
          <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-blue/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-6 right-6 h-40 w-40 rounded-full bg-amber/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-blue/20 bg-blue/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[1.8px] text-blue">
                {t("app.title")}
              </span>
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-black tracking-tight text-d-text sm:text-5xl lg:text-[58px] lg:leading-[0.95]">
                  Tower<span className="text-blue">Ops</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-d-muted sm:text-lg">
                  {t("app.tagline")}
                </p>
              </div>
              <p className="max-w-xl text-sm leading-7 text-d-muted/90 sm:text-[15px]">
                {t("auth.login.hint")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-d-border bg-d-surface2/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <p className="font-mono text-[11px] uppercase tracking-[1.6px] text-blue">
                  {t("auth.login.platform")}
                </p>
                <p className="mt-2 text-sm leading-6 text-d-muted">{t("auth.help")}</p>
              </div>
              <div className="rounded-2xl border border-d-border bg-d-surface2/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <p className="font-mono text-[11px] uppercase tracking-[1.6px] text-blue">
                  {t("nav.dashboard")}
                </p>
                <p className="mt-2 text-sm leading-6 text-d-muted">
                  {t("dashboard.phase1.authenticatedSuffix")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex w-full items-center justify-center lg:justify-end">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
