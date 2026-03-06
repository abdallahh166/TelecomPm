import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiRequestError } from "../../../services/errorAdapter";
import { getCurrentLocale, setStoredLocale, t, type Locale } from "../../../i18n";

type LoginFormProps = {
  onSubmit: (email: string, password: string, mfaCode?: string) => Promise<void>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => getCurrentLocale());

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(email.trim(), password, mfaCode.trim() || undefined);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.apiError.message);
      } else {
        setError(t("error.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const setLocale = (locale: Locale) => {
    setStoredLocale(locale);
    setCurrentLocale(locale);
  };

  return (
    <div className="relative w-full max-w-[420px] overflow-hidden rounded-[18px] border border-d-border bg-d-surface/95 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_1px_0_1px_rgba(255,255,255,0.04)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(0,194,255,0.08),transparent)]" />

      <form className="relative px-6 pb-6 pt-8 sm:px-[37px] sm:pb-[36px] sm:pt-[41px]" onSubmit={handleSubmit}>
        <div className="flex items-center gap-[11px]">
          <div className="relative size-[34px] shrink-0 rounded-full border border-blue/30 bg-d-surface2">
            <div className="absolute inset-[7px] rounded-full border border-blue/40" />
            <div className="absolute right-[4px] top-[2px] h-[8px] w-[8px] rounded-full bg-amber" />
          </div>
          <h2 className="font-display text-[30px] font-black leading-[30px] tracking-[-1px]">
            Tower<span className="text-blue">Ops</span>
          </h2>
        </div>

        <h1 className="mt-8 font-display text-[28px] font-bold leading-[30.8px] tracking-[-0.4px]">
          {t("auth.login.title")}
        </h1>
        <p className="mt-[6px] text-sm leading-[22.4px] text-d-muted">
          {t("auth.login.platform")}
        </p>

        <div className="mt-[27px] space-y-[17px]">
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[2px] text-d-muted">
              {t("auth.login.email")}
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-[6px] h-[43px] w-full rounded-[10px] border border-blue/30 bg-d-surface2 px-[15px] text-sm text-d-text placeholder-d-muted/80 transition focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="block font-mono text-[10px] uppercase tracking-[2px] text-d-muted">
                {t("auth.login.password")}
              </label>
              <Link to="/forgot-password" className="text-xs text-blue transition hover:text-blue/80 hover:underline">
                {t("auth.login.forgotLink")}
              </Link>
            </div>
            <div className="mt-[6px] flex h-[46px] items-center justify-between rounded-[10px] border border-d-border bg-d-surface2 px-[15px] transition focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/20">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-full w-full border-none bg-transparent text-sm tracking-[0.18em] text-d-text placeholder-d-muted focus:outline-none"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-d-muted transition hover:bg-white/5 hover:text-d-text"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[18px] w-[18px]"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword ? <path d="M4 4l16 16" /> : null}
                </svg>
              </button>
            </div>
          </div>

          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[2px] text-d-muted">
              {t("auth.login.mfaCode")}
            </span>
            <input
              type="text"
              autoComplete="one-time-code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="mt-[6px] h-[43px] w-full rounded-[10px] border border-d-border bg-d-surface2 px-[15px] text-sm text-d-text placeholder-d-muted/80 transition focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-[10px] border border-red/25 bg-red/10 px-3.5 py-3 text-sm text-red" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-[21px] inline-flex h-[43px] w-full items-center justify-center gap-2 rounded-[10px] bg-blue text-[14.5px] font-bold tracking-[0.2px] text-[#061424] shadow-[0_4px_20px_rgba(0,194,255,0.25)] transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30 focus-visible:ring-offset-2 focus-visible:ring-offset-d-surface disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}</span>
          {!isSubmitting ? <span aria-hidden="true">-&gt;</span> : null}
        </button>

        <div className="mt-[21px] flex flex-col gap-3 border-t border-d-border pt-[19px] sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11.5px] text-[#3A5070]">TowerOps - Seven Pictures</span>
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              onClick={() => setLocale("en-US")}
              aria-pressed={currentLocale === "en-US"}
              className={`h-[24px] rounded-[6px] border px-2 font-mono text-[10px] transition ${
                currentLocale === "en-US"
                  ? "border-blue/25 bg-blue/10 text-blue"
                  : "border-d-border text-d-muted hover:border-blue/25 hover:text-d-text"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("ar-EG")}
              aria-pressed={currentLocale === "ar-EG"}
              className={`h-[24px] rounded-[6px] border px-2 font-mono text-[10px] transition ${
                currentLocale === "ar-EG"
                  ? "border-blue/25 bg-blue/10 text-blue"
                  : "border-d-border text-d-muted hover:border-blue/25 hover:text-d-text"
              }`}
            >
              AR
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
