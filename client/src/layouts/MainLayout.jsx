import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../App.css";

function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">Online Library</div>
        <nav className="app__nav">
          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "app__nav-link app__nav-link--active"
                : "app__nav-link"
            }
          >
            Catalog
          </Link>
          <Link
            to="/my-books"
            className={
              location.pathname === "/my-books"
                ? "app__nav-link app__nav-link--active"
                : "app__nav-link"
            }
          >
            My books
          </Link>
        </nav>
        <div className="app__auth-actions">
          {user ? (
            <>
              <span>{user.name || user.email}</span>
              <button
                type="button"
                className="button button--ghost"
                onClick={logout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button--ghost">
                Log in
              </Link>
              <Link to="/register" className="button button--primary">
                Sign up
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

