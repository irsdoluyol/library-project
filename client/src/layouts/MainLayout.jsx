import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import layoutStyles from "./MainLayout.module.css";
import sidebarStyles from "./Sidebar.module.css";
import headerStyles from "./Header.module.css";

function MainLayout() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { to: "/", label: "Каталог" },
    { to: "/my-books", label: "Мои книги" },
    ...(user ? [{ to: "/my-requests", label: "Обращения" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Админ" }] : []),
  ];

  return (
    <div className={layoutStyles.root}>
      <aside className={sidebarStyles.sidebar}>
        <Link to="/" className={sidebarStyles.logo}>
          <span className={sidebarStyles.logoText}>Библиотека</span>
        </Link>
        <nav className={sidebarStyles.nav}>
          {navItems.map(({ to, label }) => {
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`${sidebarStyles.navItem} ${isActive ? sidebarStyles.navItemActive : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className={sidebarStyles.footer}>
          {user ? (
            <div className={sidebarStyles.user}>
              <div className={sidebarStyles.avatar}>
                {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
              </div>
              <span className={sidebarStyles.userName}>
                {[user.name, user.surname].filter(Boolean).join(" ") || user.email}
              </span>
            </div>
          ) : null}
        </div>
      </aside>

      <div className={layoutStyles.content}>
        <header className={headerStyles.header}>
          <div className={headerStyles.headerLeft}>
            <h1 className={headerStyles.greeting}>
              {user
                ? `Доброе чтение, ${user.name || "читатель"}!`
                : "Добро пожаловать в библиотеку"}
            </h1>
          </div>
          <div className={headerStyles.headerRight}>
            {user ? (
              <>
                <span className={headerStyles.userBadge}>
                  {[user.name, user.surname].filter(Boolean).join(" ") || user.email}
                </span>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={logout}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="button button--ghost button--sm">
                  Вход
                </Link>
                <Link to="/register" className="button button--primary button--sm">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </header>

        <main className={layoutStyles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
