import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { createRequest, fetchMyRequests } from "../../api/requestsApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import "../../styles/pages/requests/MyRequestsPage.css";

const STATUS_LABELS = {
  new: "Новое",
  in_progress: "В работе",
  closed: "Закрыто",
};

function MyRequestsPage() {
  const { token } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: requests = [], loading, error } = useAsyncLoad(
    () => (token ? fetchMyRequests(token) : Promise.resolve([])),
    [token, refreshTrigger]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const s = subject.trim();
    const m = message.trim();
    if (!s || s.length < 2) {
      setSubmitError("Тема должна содержать не менее 2 символов");
      return;
    }
    if (!m || m.length < 5) {
      setSubmitError("Сообщение должно содержать не менее 5 символов");
      return;
    }
    setSubmitting(true);
    try {
      await createRequest(token, { subject: s, message: m });
      setSubject("");
      setMessage("");
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page requests-page">
      <h1 className="page__title">Мои обращения</h1>
      <p className="page__text">
        Оставьте обращение в службу поддержки. Мы ответим в ближайшее время.
      </p>

      <form className="requests-form" onSubmit={handleSubmit}>
        <label className="auth__field">
          <span>Тема *</span>
          <input
            type="text"
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Например: Вопрос о книге"
            maxLength={200}
            required
          />
        </label>
        <label className="auth__field">
          <span>Сообщение *</span>
          <textarea
            className="form-input form-input--textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите ваш вопрос или проблему..."
            rows={4}
            maxLength={2000}
            required
          />
        </label>
        {submitError && <p className="auth__error">{submitError}</p>}
        <button
          type="submit"
          className="button button--primary"
          disabled={submitting}
        >
          {submitting ? "Отправка..." : "Отправить"}
        </button>
      </form>

      <h2 className="page__subtitle">История обращений</h2>
      {error && <p className="page__text">{error}</p>}
      {loading ? (
        <p className="page__text">Загрузка...</p>
      ) : requests.length === 0 ? (
        <p className="page__text">У вас пока нет обращений.</p>
      ) : (
        <ul className="requests-list">
          {requests.map((r) => (
            <li key={r._id} className="requests-list__item">
              <div className="requests-list__subject">{r.subject}</div>
              <div className="requests-list__meta">
                <span className={`requests-list__status requests-list__status--${r.status}`}>
                  {STATUS_LABELS[r.status] || r.status}
                </span>
                <span className="requests-list__date">
                  {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <p className="requests-list__message">{r.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyRequestsPage;
