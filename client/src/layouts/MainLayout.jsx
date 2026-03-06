import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import "../styles/layouts/MainLayout.css";

function MainLayout() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">Онлайн-библиотека</div>
        <nav className="app__nav">
          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "app__nav-link app__nav-link--active"
                : "app__nav-link"
            }
          >
            Каталог
          </Link>
          <Link
            to="/my-books"
            className={
              location.pathname === "/my-books"
                ? "app__nav-link app__nav-link--active"
                : "app__nav-link"
            }
          >
            Мои книги
          </Link>
          {user && (
            <Link
              to="/my-requests"
              className={
                location.pathname === "/my-requests"
                  ? "app__nav-link app__nav-link--active"
                  : "app__nav-link"
              }
            >
              Обращения
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={
                location.pathname.startsWith("/admin")
                  ? "app__nav-link app__nav-link--active"
                  : "app__nav-link"
              }
            >
              Админ
            </Link>
          )}
        </nav>
        <div className="app__auth-actions">
          {user ? (
            <>
              <span>{[user.name, user.surname].filter(Boolean).join(" ") || user.email}</span>
              <button
                type="button"
                className="button button--ghost"
                onClick={logout}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button--ghost">
                Вход
              </Link>
              <Link to="/register" className="button button--primary">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
