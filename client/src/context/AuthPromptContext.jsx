import { createContext, useCallback, useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import layoutStyles from "../layouts/MainLayout.module.css";

const AuthPromptContext = createContext(null);

const DEFAULT_MESSAGE =
  "Войдите или зарегистрируйтесь, чтобы пользоваться этой функцией.";

export function AuthPromptProvider({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const loginReturnTo = `${location.pathname}${location.search}`;

  const openPrompt = useCallback((msg) => {
    setMessage(msg && String(msg).trim() ? String(msg).trim() : DEFAULT_MESSAGE);
    setOpen(true);
  }, []);

  const closePrompt = useCallback(() => setOpen(false), []);

  return (
    <AuthPromptContext.Provider value={{ openPrompt, closePrompt }}>
      {children}
      {open ? (
        <div
          className={layoutStyles.modalOverlay}
          onClick={closePrompt}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-prompt-title"
        >
          <div className={layoutStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={layoutStyles.modalHeader}>
              <h2 id="auth-prompt-title" className={layoutStyles.modalTitle}>
                Вход или регистрация
              </h2>
              <button
                type="button"
                className={layoutStyles.modalClose}
                onClick={closePrompt}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <p className={layoutStyles.modalText}>{message}</p>
            <div className={layoutStyles.modalActions}>
              <Link
                to="/login"
                state={{ from: loginReturnTo }}
                className="button button--primary"
                onClick={closePrompt}
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="button button--outline"
                onClick={closePrompt}
              >
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) {
    throw new Error("useAuthPrompt must be used within AuthPromptProvider");
  }
  return ctx;
}
