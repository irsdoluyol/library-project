import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../App.css";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__card">
        <h1 className="page__title">Sign up</h1>
        <p className="page__text">
          Create an account to borrow books from the online catalog.
        </p>
        <form className="auth__form" onSubmit={handleSubmit}>
          <label className="auth__field">
            <span>Name</span>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label className="auth__field">
            <span>Email</span>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="auth__field">
            <span>Password</span>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="page__text">{error}</p>}
          <button
            type="submit"
            className="button button--primary auth__submit"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;

