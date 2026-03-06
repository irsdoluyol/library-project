import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { fetchAllRequests, updateRequestStatus } from "../../api/requestsApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import "../../styles/pages/admin/AdminRequestsPage.css";

const STATUS_OPTIONS = [
  { value: "new", label: "Новое" },
  { value: "in_progress", label: "В работе" },
  { value: "closed", label: "Закрыто" },
];

function AdminRequestsPage() {
  const { token } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const { data: requests = [], loading } = useAsyncLoad(
    () => (token ? fetchAllRequests(token) : Promise.resolve([])),
    [token, refreshTrigger]
  );

  const handleStatusChange = async (id, status) => {
    if (!token) return;
    setError("");
    setUpdatingId(id);
    try {
      await updateRequestStatus(token, id, status);
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
    <section className="page">
      <h1 className="page__title">Обращения пользователей</h1>
      <p className="page__text">
        Просмотр и управление статусами обращений в службу поддержки.
      </p>

      {error && <p className="auth__error">{error}</p>}

      {loading ? (
        <p className="page__text">Загрузка...</p>
      ) : requests.length === 0 ? (
        <p className="page__text">Обращений пока нет.</p>
      ) : (
        <div className="admin-requests-table">
          {requests.map((r) => (
            <div key={r._id} className="admin-requests-item">
              <div className="admin-requests-item__header">
                <span className="admin-requests-item__subject">{r.subject}</span>
                <span className="admin-requests-item__author">{authorName(r)}</span>
              </div>
              <p className="admin-requests-item__message">{r.message}</p>
              <div className="admin-requests-item__footer">
                <span className="admin-requests-item__date">
                  {new Date(r.createdAt).toLocaleString("ru-RU")}
                </span>
                <select
                  className="form-input admin-requests-item__select"
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
