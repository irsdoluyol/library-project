import { Outlet, NavLink, Link } from "react-router-dom";
import styles from "./AdminLayout.module.css";

function AdminLayout() {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Админ</div>
        <Link to="/" className={styles.back}>
          ← Назад на сайт
        </Link>
        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
          >
            Панель
          </NavLink>
          <NavLink
            to="/admin/requests"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
          >
            Обращения
          </NavLink>
        </nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

