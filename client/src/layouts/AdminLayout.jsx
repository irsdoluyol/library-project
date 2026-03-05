import { Outlet, NavLink } from "react-router-dom";
import "../App.css";

function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">Admin</div>
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
            Dashboard
          </NavLink>
          {/* здесь позже добавим разделы: Books, Borrowings, Users */}
        </nav>
      </aside>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

