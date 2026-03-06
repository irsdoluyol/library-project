import { Outlet, NavLink, Link } from "react-router-dom";
import "../styles/layouts/AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">Админ</div>
        <Link to="/" className="admin__back">
          ← Назад на сайт
        </Link>
        <nav className="admin__nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive
                ? "admin__link admin__link--active"
                : "admin__link"
            }
          >
            Панель
          </NavLink>
          <NavLink
            to="/admin/requests"
            className={({ isActive }) =>
              isActive
                ? "admin__link admin__link--active"
                : "admin__link"
            }
          >
            Обращения
          </NavLink>
        </nav>
      </aside>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

