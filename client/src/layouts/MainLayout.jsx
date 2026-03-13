import { useMemo, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import Footer from "../components/layout/Footer.jsx";
import layoutStyles from "./MainLayout.module.css";
import sidebarStyles from "./Sidebar.module.css";
import headerStyles from "./Header.module.css";
import ChevronLeftIcon from "../assets/icons/ChevronLeftIcon.jsx";

const FACTS = [
  "Чтение 6 минут в день снижает стресс на 68%.",
  "В среднем человек читает 200–400 слов в минуту.",
  "Самый длинный роман — «Люди доброй воли» М. Ромена: 2 млн слов.",
  "Библиотека Александрии хранила около 700 000 свитков.",
  "Книги увеличивают словарный запас на 20%.",
];

function MainLayout() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const showFact = location.pathname === "/";
  const factIndex = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    return Math.floor((today - start) / 86400000) % FACTS.length;
  }, []);

  const navItems = [
    { to: "/", label: "Каталог" },
    { to: "/my-books", label: "Мои книги" },
    ...(user ? [{ to: "/my-requests", label: "Обращения" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Админ" }] : []),
  ];

  return (
    <div className={layoutStyles.root}>
      <aside
        className={`${sidebarStyles.sidebar} ${sidebarCollapsed ? sidebarStyles.sidebarCollapsed : ""}`}
      >
        <button
          type="button"
          className={sidebarStyles.toggle}
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
          title={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <span className={`${sidebarStyles.toggleArrow} ${sidebarCollapsed ? sidebarStyles.toggleArrowCollapsed : ""}`}>
            <ChevronLeftIcon />
          </span>
        </button>
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

      <div
        className={`${layoutStyles.content} ${location.pathname === "/" ? layoutStyles.contentMainPage : ""} ${sidebarCollapsed ? layoutStyles.contentSidebarCollapsed : ""}`}
      >
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
        {showFact && (
          <div className={headerStyles.factBar}>
            <span className={headerStyles.factLabel}>Факт дня</span>
            <span className={headerStyles.factText}>{FACTS[factIndex]}</span>
          </div>
        )}

        <main className={layoutStyles.main}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;
