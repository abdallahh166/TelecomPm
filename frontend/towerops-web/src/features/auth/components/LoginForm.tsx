import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { ApiRequestError } from "../../../services/errorAdapter";
import { t } from "../../../i18n";

type LoginFormProps = {
  onSubmit: (email: string, password: string, mfaCode?: string) => Promise<void>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="w-full max-w-md rounded-2xl border border-d-border overflow-hidden bg-d-surface/95 shadow-xl grid md:grid-cols-[1fr_1.2fr]">
      <aside className="p-6 flex flex-col justify-between bg-gradient-to-b from-blue/10 to-transparent border-b md:border-b-0 md:border-r border-d-border">
        <div>
          <p className="font-mono text-xs tracking-widest text-blue uppercase mb-3">
            Operations Platform
          </p>
          <h2 className="font-display font-black text-4xl tracking-tight">
            Tower<span className="text-blue">Ops</span>
          </h2>
          <p className="text-d-muted text-sm mt-4 max-w-[28ch]">
            {t("app.tagline")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6">
          {[
            { label: "PM", sub: "Preventive" },
            { label: "CM", sub: "Corrective" },
            { label: "SLA", sub: "Control" },
          ].map(({ label, sub }) => (
            <div
              key={label}
              className="rounded-lg border border-d-border/80 p-2.5 bg-d-surface2/50"
            >
              <span className="font-display text-xl text-blue block">{label}</span>
              <span className="font-mono text-[10px] text-d-muted uppercase tracking-wider">
                {sub}
              </span>
            </div>
          ))}
        </div>
      </aside>
      <form className="p-6 flex flex-col gap-4 justify-center" onSubmit={handleSubmit}>
        <h1 className="font-display text-3xl font-bold">{t("auth.login.title")}</h1>
        <p className="text-d-muted text-sm">{t("auth.login.hint")}</p>

        <Input
          label={t("auth.login.email")}
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t("auth.login.password")}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label={t("auth.login.mfaCode")}
          type="text"
          autoComplete="one-time-code"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
        />

        {error && <p className="text-red text-sm" role="alert">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>

        <p className="text-d-muted text-xs">
          <Link to="/forgot-password" className="text-blue hover:underline">
            {t("auth.forgot.title")}
          </Link>
        </p>
        <p className="text-d-muted text-xs">{t("auth.help")}</p>
      </form>
    </div>
  );
}
