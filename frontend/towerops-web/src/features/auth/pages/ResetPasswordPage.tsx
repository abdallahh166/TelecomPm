import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { authApi } from "../api/authApi";
import { ApiRequestError } from "../../../services/errorAdapter";
import { t } from "../../../i18n";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setMessage(res.message);
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
    <div className="w-full max-w-md rounded-2xl border border-d-border bg-d-surface p-6 shadow-xl">
      <h1 className="font-display text-2xl font-bold">{t("auth.reset.title")}</h1>
      <p className="text-d-muted text-sm mt-1">
        {t("auth.reset.hint")}
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label={t("auth.reset.email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t("auth.reset.otp")}
          type="text"
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Input
          label={t("auth.reset.newPassword")}
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {message && <p className="text-green text-sm">{message}</p>}
        {error && <p className="text-red text-sm" role="alert">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {t("auth.reset.submit")}
        </Button>
      </form>
      <Link
        to="/login"
        className="inline-block mt-4 text-sm text-blue hover:underline"
      >
        {t("auth.reset.back")}
      </Link>
    </div>
  );
}
