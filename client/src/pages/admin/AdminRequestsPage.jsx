import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { fetchAllRequests, updateRequestStatus } from "../../api/requestsApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import pageStyles from "../../styles/common/Page.module.css";
import styles from "./AdminRequestsPage.module.css";

const STATUS_OPTIONS = [
  { value: "new", label: "Новое" },
  { value: "in_progress", label: "В работе" },
  { value: "closed", label: "Закрыто" },
];

function AdminRequestsPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const { data: requests = [], loading } = useAsyncLoad(
    () => (user ? fetchAllRequests() : Promise.resolve([])),
    [user, refreshTrigger]
  );

  const handleStatusChange = async (id, status) => {
    if (!user) return;
    setError("");
    setUpdatingId(id);
    try {
      await updateRequestStatus(id, status);
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const authorName = (r) => {
    const a = r.author;
    if (!a) return "—";
    return [a.name, a.surname].filter(Boolean).join(" ") || a.email;
  };

  return (
    <section className={pageStyles.page}>
      <h1 className={pageStyles.title}>Обращения пользователей</h1>
      <p className={pageStyles.text}>
        Просмотр и управление статусами обращений в службу поддержки.
      </p>

      {error && <p className="auth__error">{error}</p>}

      {loading ? (
        <p className={pageStyles.text}>Загрузка...</p>
      ) : requests.length === 0 ? (
        <p className={pageStyles.text}>Обращений пока нет.</p>
      ) : (
        <div className={styles.table}>
          {requests.map((r) => (
            <div key={r._id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.itemSubject}>{r.subject}</span>
                <span className={styles.itemAuthor}>{authorName(r)}</span>
              </div>
              <p className={styles.itemMessage}>{r.message}</p>
              <div className={styles.itemFooter}>
                <span className={styles.itemDate}>
                  {new Date(r.createdAt).toLocaleString("ru-RU")}
                </span>
                <select
                  className={`form-input ${styles.itemSelect}`}
                  value={r.status}
                  onChange={(e) => handleStatusChange(r._id, e.target.value)}
                  disabled={updatingId === r._id}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminRequestsPage;
