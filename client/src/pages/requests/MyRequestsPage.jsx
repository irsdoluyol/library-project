import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { createRequest, fetchMyRequests } from "../../api/requestsApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import PageWithHeader from "../../components/common/PageWithHeader.jsx";
import ContentState from "../../components/common/ContentState.jsx";
import pageStyles from "../../styles/common/Page.module.css";
import styles from "./MyRequestsPage.module.css";

const STATUS_LABELS = {
  new: "Новое",
  in_progress: "В работе",
  closed: "Закрыто",
};

function MyRequestsPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data, loading, error } = useAsyncLoad(
    () => (user ? fetchMyRequests() : Promise.resolve([])),
    [user, refreshTrigger]
  );
  const requests = data ?? [];

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
      await createRequest({ subject: s, message: m });
      setSubject("");
      setMessage("");
      setRefreshTrigger((t) => t + 1);
      toast.success("Обращение отправлено");
    } catch (err) {
      setSubmitError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWithHeader
      title="Мои обращения"
      description="Оставьте обращение в службу поддержки. Мы ответим в ближайшее время."
    >
      <div className={styles.wrapper}>
        <form className={`${styles.form} ${styles.formGrid}`} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Тема *</span>
            <input
              type="text"
              className={styles.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Например: Вопрос о книге"
              maxLength={200}
              required
            />
          </label>
          <label className={`${styles.field} ${styles.fieldMessage}`}>
            <span className={styles.label}>Сообщение *</span>
            <textarea
              className={`${styles.input} ${styles.inputTextarea}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Опишите ваш вопрос или проблему..."
              rows={5}
              maxLength={2000}
              required
            />
          </label>
          {submitError && <p className={styles.error}>{submitError}</p>}
          <div className={styles.actions}>
            <button
              type="submit"
              className="button button--primary"
              disabled={submitting}
            >
              {submitting ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>

        <section className={styles.historySection}>
          <h2 className={styles.historyHeading}>История обращений</h2>
          {error && <p className={pageStyles.text}>{error}</p>}
          <ContentState
            loading={loading}
            isEmpty={requests.length === 0}
            emptyText="У вас пока нет обращений."
          >
            <ul className={styles.list}>
          {requests.map((r) => (
            <li key={r._id} className={styles.item}>
              <div className={styles.subject}>{r.subject}</div>
              <div className={styles.meta}>
                <span className={`${styles.status} ${styles[`status${r.status === 'in_progress' ? 'InProgress' : r.status === 'closed' ? 'Closed' : 'New'}`]}`}>
                  {STATUS_LABELS[r.status] || r.status}
                </span>
                <span className={styles.date}>
                  {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <p className={styles.message}>{r.message}</p>
            </li>
            ))}
            </ul>
          </ContentState>
        </section>
      </div>
    </PageWithHeader>
  );
}

export default MyRequestsPage;
