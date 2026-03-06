import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import AuthCard from "../../components/auth/AuthCard.jsx";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Вход"
      description="Введите данные для доступа к библиотеке."
    >
      <form className="auth__form" onSubmit={handleSubmit}>
          <label className="auth__field">
            <span>Email *</span>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="auth__field">
            <span>Пароль *</span>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="auth__error">{error}</p>}
          <button
            type="submit"
            className="button button--primary auth__submit"
            disabled={submitting}
          >
            {submitting ? "Вход..." : "Войти"}
          </button>
        </form>
    </AuthCard>
  );
}

export default LoginPage;

