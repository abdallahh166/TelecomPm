import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { authApi } from "../api/authApi";
import { ApiRequestError } from "../../../services/errorAdapter";
import { t } from "../../../i18n";
import { AuthCard } from "../components/AuthCard";

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
    <AuthCard
      className="max-w-md"
      title={t("auth.reset.title")}
      description={t("auth.reset.hint")}
      footer={(
        <Link
          to="/login"
          className="inline-flex text-sm font-medium text-blue transition hover:text-blue/80 hover:underline"
        >
          {t("auth.reset.back")}
        </Link>
      )}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
        {message ? (
          <p className="rounded-xl border border-green/25 bg-green/10 px-4 py-3 text-sm text-green">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red/25 bg-red/10 px-4 py-3 text-sm text-red" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {t("auth.reset.submit")}
        </Button>
      </form>
    </AuthCard>
  );
}
