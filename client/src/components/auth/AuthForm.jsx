import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { validateRegister } from "../../utils/validation.js";
import AuthCard from "./AuthCard.jsx";

/**
 * Объединённая форма входа и регистрации.
 * mode: "login" | "register"
 */
function AuthForm({ mode }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        navigate("/");
      } catch (err) {
        setSubmitError(err.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const errors = validateRegister({ name, surname, email, password });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await register(
        name.trim(),
        surname.trim() || undefined,
        email.trim().toLowerCase(),
        password
      );
      navigate("/");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = isLogin ? "Вход" : "Регистрация";
  const description = isLogin
    ? "Введите данные для доступа к библиотеке."
    : "Создайте аккаунт, чтобы брать книги из онлайн-каталога.";

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
          <input
            type="password"
            className={`form-input ${fieldErrors.password ? "form-input--invalid" : ""}`}
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
          {fieldErrors.password && (
            <span id="password-error" className="auth__error" role="alert">
              {fieldErrors.password}
            </span>
          )}
        </label>

        {submitError && (
          <p className="auth__error auth__error--submit" role="alert">
            {submitError}
          </p>
        )}

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
      </form>
    </AuthCard>
  );
}

export default AuthForm;
