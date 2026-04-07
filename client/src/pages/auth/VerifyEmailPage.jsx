import { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyEmail, resendVerification } from "../../api/authVerifyApi.js";
import { useAuth } from "../../context/useAuth.js";
import AuthCard from "../../components/auth/AuthCard.jsx";
import styles from "./VerifyEmailPage.module.css";

function VerifyEmailPage() {
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const tokenFromUrl = searchParams.get("token");

  const registeredEmail = location.state?.email ?? "";

  const [verifyStatus, setVerifyStatus] = useState(null);
  const [resendEmail, setResendEmail] = useState(registeredEmail);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (location.state?.email) setResendEmail(location.state.email);
  }, [location.state?.email]);

  useEffect(() => {
    if (!tokenFromUrl) return;

    (async () => {
      try {
        await verifyEmail(tokenFromUrl);
        setVerifyStatus("ok");
        toast.success("Email подтверждён");
        await refreshUser();
        window.location.replace(`${window.location.origin}/`);
      } catch (err) {
        setVerifyStatus(err.message || "Ошибка");
      }
    })();
  }, [tokenFromUrl, refreshUser]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResending(true);
    try {
      const data = await resendVerification(resendEmail.trim().toLowerCase());
      if (data.emailSent) {
        toast.success(`Письмо отправлено на ${resendEmail.trim().toLowerCase()}`);
      } else {
        toast(
          data?.message ||
            "Запрос принят. Если письма нет — проверьте SMTP в server/.env или папку «Спам».",
          { icon: "ℹ️" }
        );
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Подтверждение email"
      description={
        tokenFromUrl && verifyStatus == null
          ? "Проверяем ссылку…"
          : "После перехода по ссылке из письма можно войти в аккаунт."
      }
    >
      <div className={styles.wrap}>
        {tokenFromUrl && verifyStatus == null && (
          <p className={styles.lead}>Подождите, подтверждаем регистрацию…</p>
        )}

        {tokenFromUrl && verifyStatus && verifyStatus !== "ok" && (
          <p className={`${styles.status} ${styles.statusErr}`} role="alert">
            {verifyStatus}
          </p>
        )}

        {verifyStatus === "ok" && (
          <p className={`${styles.status} ${styles.statusOk}`}>
            Готово. Вы вошли в аккаунт — перенаправляем на главную…
          </p>
        )}

        {registeredEmail && verifyStatus !== "ok" && !tokenFromUrl && (
          <div className={styles.mailNotice}>
            <p className={styles.lead}>Мы отправили письмо на адрес:</p>
            <p className={styles.emailLine}>{registeredEmail}</p>
            <p className={styles.lead}>
              Откройте письмо и нажмите на ссылку — это займёт несколько секунд, без ожидания
              администратора.
            </p>
          </div>
        )}

        {!registeredEmail && !tokenFromUrl && verifyStatus !== "ok" && (
          <p className={styles.lead}>
            Если письма нет, проверьте папку «Спам». Ниже можно запросить ссылку ещё раз.
          </p>
        )}

        {verifyStatus !== "ok" && (
        <div className={styles.resend}>
          <h2 className={styles.resendTitle}>Не пришло письмо?</h2>
          <form className={styles.resendForm} onSubmit={handleResend}>
            <div className={styles.resendRow}>
              <label htmlFor="resend-email">Email при регистрации</label>
              <input
                id="resend-email"
                type="email"
                className="form-input"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" className="button button--primary auth__submit" disabled={resending}>
              {resending ? "Отправка…" : "Отправить ссылку снова"}
            </button>
          </form>
        </div>
        )}

        <p className={styles.links}>
          <Link to="/login">Войти</Link>
          {" · "}
          <Link to="/register">Регистрация</Link>
        </p>
      </div>
    </AuthCard>
  );
}

export default VerifyEmailPage;
