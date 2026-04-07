import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { fetchPendingUsers, approveUser, rejectUser } from "../../api/adminUsersApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import PageWithHeader from "../../components/common/PageWithHeader.jsx";
import pageStyles from "../../styles/common/Page.module.css";
import styles from "./AdminUsersPage.module.css";

function initialsFromUser(u) {
  const parts = [u.name, u.surname].filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const fromEmail = u.email?.[0];
  return (fromEmail || "?").toUpperCase();
}

function formatRelativeRu(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const now = Date.now();
  const diffSec = Math.floor((now - d.getTime()) / 1000);
  if (diffSec < 60) return "только что";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} мин. назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч. назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} дн. назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function AdminUsersPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState("");

  const { data, loading, error: loadError } = useAsyncLoad(
    () => (user ? fetchPendingUsers() : Promise.resolve({ users: [] })),
    [user, refreshTrigger]
  );

  const users = data?.users ?? [];

  const handleApprove = async (u) => {
    setError("");
    setPendingAction({ id: u._id, type: "approve" });
    try {
      await approveUser(u._id);
      toast.success(`Доступ открыт: ${u.email}`);
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleReject = async (u) => {
    const ok = window.confirm(
      `Отклонить заявку ${u.email}?\n\nПользователь не сможет войти в систему с этим email.`
    );
    if (!ok) return;

    setError("");
    setPendingAction({ id: u._id, type: "reject" });
    try {
      await rejectUser(u._id);
      toast.success("Заявка отклонена");
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <PageWithHeader
      className={styles.pageWide}
      title="Заявки на регистрацию"
      description="Обычно доступ открывается автоматически по ссылке из письма. Здесь — заявки без подтверждённого email и ручная модерация при необходимости."
    >
      <div className={styles.wrapper}>
        <aside className={styles.callout} aria-labelledby="admin-users-hint-title">
          <h2 id="admin-users-hint-title" className={styles.calloutTitle}>
            Как это работает
          </h2>
          <p className={styles.calloutText}>
            В норме человек переходит по ссылке из письма сразу после регистрации — без вашего участия
            и без очереди. Эта панель нужна, если письмо не дошло: вы можете подтвердить или отклонить
            заявку вручную.
          </p>
          <p className={styles.calloutText}>
            «Подтвердить» открывает доступ так же, как ссылка в письме. «Отклонить» — пользователь не
            сможет войти с этим email.
          </p>
        </aside>

        {error && <p className={styles.error}>{error}</p>}

        {loadError && <p className={pageStyles.text}>{loadError}</p>}

        {loading && <p className={pageStyles.text}>Загрузка...</p>}

        {!loading && !loadError && users.length === 0 ? (
          <p className={styles.empty}>
            Нет заявок на рассмотрение.
            <span className={styles.emptyHint}>
              Новые регистрации появятся здесь после отправки формы на странице «Регистрация».
            </span>
          </p>
        ) : null}

        {!loading && !loadError && users.length > 0 ? (
          <ul className={styles.list}>
            {users.map((u) => (
              <li key={u._id} className={styles.item}>
                <div className={styles.avatar} aria-hidden>
                  {initialsFromUser(u)}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>
                    {[u.name, u.surname].filter(Boolean).join(" ") || "Без имени"}
                  </span>
                  <span className={styles.email}>{u.email}</span>
                  {u.createdAt ? (
                    <div className={styles.meta}>
                      <span className={styles.dateRelative}>{formatRelativeRu(u.createdAt)}</span>
                      <span className={styles.date} title={new Date(u.createdAt).toLocaleString("ru-RU")}>
                        {new Date(u.createdAt).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className="button button--primary button--sm"
                    disabled={pendingAction?.id === u._id}
                    onClick={() => handleApprove(u)}
                  >
                    {pendingAction?.id === u._id && pendingAction?.type === "approve"
                      ? "Подождите…"
                      : "Подтвердить"}
                  </button>
                  <button
                    type="button"
                    className="button button--outline button--sm"
                    disabled={pendingAction?.id === u._id}
                    onClick={() => handleReject(u)}
                  >
                    {pendingAction?.id === u._id && pendingAction?.type === "reject"
                      ? "Подождите…"
                      : "Отклонить"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </PageWithHeader>
  );
}

export default AdminUsersPage;
