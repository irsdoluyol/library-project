import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { validateRegister } from "../../utils/validation.js";
import AuthCard from "./AuthCard.jsx";

function AuthForm({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setFieldErrors({});

    if (isLogin) {
      setSubmitting(true);
      try {
        await login(email, password);
        const from = location.state?.from;
        const target =
          typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
            ? from
            : "/";
        navigate(target, { replace: true });
      } catch (err) {
        setSubmitError(err.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const errors = validateRegister(
      { name, surname, email, password, acceptTerms: acceptedTerms },
      { requireAcceptedTerms: true }
    );
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const data = await register(
        name.trim(),
        surname.trim() || undefined,
        email.trim().toLowerCase(),
        password
      );
      const addr = email.trim().toLowerCase();
      if (data.emailSent) {
        toast.success(`Письмо отправлено на ${addr}. Откройте почту и перейдите по ссылке.`);
      } else {
        toast.success(data?.message || "Заявка создана. Проверьте инструкции на следующей странице.");
      }
      navigate("/verify-email", { state: { email: addr } });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = isLogin ? "Вход" : "Регистрация";
  const description = isLogin
    ? "Введите данные для доступа к библиотеке."
    : "На email придёт ссылка для подтверждения — после перехода по ней можно войти (без ожидания администратора).";

  return (
    <AuthCard title={title} description={description}>
      <form className="auth__form" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <label className={`auth__field ${fieldErrors.name ? "auth__field--invalid" : ""}`}>
              <span>Имя *</span>
              <input
                type="text"
                className={`form-input ${fieldErrors.name ? "form-input--invalid" : ""}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                }}
                onBlur={() => {
                  const err = validateRegister({ name, surname, email, password });
                  setFieldErrors((p) => {
                    const next = { ...p };
                    if (err.name) next.name = err.name;
                    else delete next.name;
                    return next;
                  });
                }}
                placeholder="Мария"
                minLength={2}
                maxLength={50}
                required
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
              />
              {fieldErrors.name && (
                <span id="name-error" className="auth__error" role="alert">
                  {fieldErrors.name}
                </span>
              )}
            </label>
            <label className={`auth__field ${fieldErrors.surname ? "auth__field--invalid" : ""}`}>
              <span>Фамилия</span>
              <input
                type="text"
                className={`form-input ${fieldErrors.surname ? "form-input--invalid" : ""}`}
                value={surname}
                onChange={(e) => {
                  setSurname(e.target.value);
                  clearFieldError("surname");
                }}
                onBlur={() => {
                  const err = validateRegister({ name, surname, email, password });
                  setFieldErrors((p) => {
                    const next = { ...p };
                    if (err.surname) next.surname = err.surname;
                    else delete next.surname;
                    return next;
                  });
                }}
                placeholder="Иванова"
                maxLength={50}
                aria-invalid={!!fieldErrors.surname}
                aria-describedby={fieldErrors.surname ? "surname-error" : undefined}
              />
              {fieldErrors.surname && (
                <span id="surname-error" className="auth__error" role="alert">
                  {fieldErrors.surname}
                </span>
              )}
            </label>
          </>
        )}

        <label className={`auth__field ${fieldErrors.email ? "auth__field--invalid" : ""}`}>
          <span>Email *</span>
          <input
            type="email"
            className={`form-input ${fieldErrors.email ? "form-input--invalid" : ""}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            onBlur={
              isLogin
                ? undefined
                : () => {
                    const err = validateRegister({ name, surname, email, password });
                    setFieldErrors((p) => {
                      const next = { ...p };
                      if (err.email) next.email = err.email;
                      else delete next.email;
                      return next;
                    });
                  }
            }
            placeholder="example@mail.ru"
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <span id="email-error" className="auth__error" role="alert">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label className={`auth__field ${fieldErrors.password ? "auth__field--invalid" : ""}`}>
          <span>Пароль *</span>
          <div className="auth__passwordRow">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={`form-input form-input--password ${fieldErrors.password ? "form-input--invalid" : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              onBlur={
                isLogin
                  ? undefined
                  : () => {
                      const err = validateRegister({ name, surname, email, password });
                      setFieldErrors((p) => {
                        const next = { ...p };
                        if (err.password) next.password = err.password;
                        else delete next.password;
                        return next;
                      });
                    }
              }
              placeholder={isLogin ? undefined : "Минимум 6 символов"}
              minLength={isLogin ? undefined : 6}
              maxLength={100}
              required
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              className="auth__passwordToggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <span id="password-error" className="auth__error" role="alert">
              {fieldErrors.password}
            </span>
          )}
        </label>

        {submitError && (
          <div className="auth__errorBlock" role="alert">
            <p className="auth__error auth__error--submit">{submitError}</p>
            {isLogin && /подтвердите email/i.test(submitError) && (
              <p className="auth__verifyLink auth__verifyLink--afterError">
                <Link to="/verify-email">Запросить письмо с подтверждением снова</Link>
              </p>
            )}
          </div>
        )}

        {!isLogin && (
          <div
            className={`auth__termsBlock ${fieldErrors.acceptTerms ? "auth__field--invalid" : ""}`}
          >
            <div className="auth__terms">
              <input
                id="auth-accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  clearFieldError("acceptTerms");
                }}
                aria-invalid={!!fieldErrors.acceptTerms}
                aria-describedby={fieldErrors.acceptTerms ? "accept-terms-error" : undefined}
              />
              <label htmlFor="auth-accept-terms" className="auth__termsLabel">
                Я соглашаюсь с{" "}
                <Link to="/terms">условиями использования и обработкой персональных данных</Link>
                {" "}*
              </label>
            </div>
            {fieldErrors.acceptTerms && (
              <span id="accept-terms-error" className="auth__error" role="alert">
                {fieldErrors.acceptTerms}
              </span>
            )}
          </div>
        )}

        <div className="auth__ctaCluster">
          <button
            type="submit"
            className="button button--primary auth__submit"
            disabled={submitting}
          >
            {isLogin
              ? submitting
                ? "Вход..."
                : "Войти"
              : submitting
                ? "Создание аккаунта..."
                : "Зарегистрироваться"}
          </button>

          <p className="auth__switch">
            {isLogin ? (
              <>
                Нет аккаунта?{" "}
                <Link to="/register">Зарегистрироваться</Link>
              </>
            ) : (
              <>
                Уже есть аккаунт?{" "}
                <Link to="/login">Войти</Link>
              </>
            )}
          </p>
        </div>

        {isLogin && (
          <p className="auth__footerNote">
            <Link to="/verify-email">Письмо не пришло или не успели подтвердить?</Link>
          </p>
        )}
      </form>
    </AuthCard>
  );
}

export default AuthForm;
