import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { authApi } from "../api/authApi";
import { ApiRequestError } from "../../../services/errorAdapter";
import { t } from "../../../i18n";
import { AuthCard } from "../components/AuthCard";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t("auth.change.mismatch"));
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      navigate("/", { replace: true });
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
    <div className="max-w-3xl">
      <AuthCard
        className="max-w-xl"
        title={t("auth.change.title")}
        description={t("auth.help")}
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label={t("auth.change.current")}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label={t("auth.change.new")}
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label={t("auth.change.confirm")}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error ? (
            <p className="rounded-xl border border-red/25 bg-red/10 px-4 py-3 text-sm text-red" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {t("auth.change.submit")}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}
