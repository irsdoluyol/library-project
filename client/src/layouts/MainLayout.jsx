import { useMemo, useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import Footer from "../components/layout/Footer.jsx";
import CatalogSearchBar from "../components/catalog/CatalogSearchBar.jsx";
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
  "Первая печатная книга — Библия Гутенберга (1455).",
  "Самый читающий город России — Санкт-Петербург.",
  "Дети, которые читают 20 минут в день, узнают 1,8 млн слов в год.",
  "Электронные книги экономят до 67% воды при производстве.",
  "В Японии книги читают в среднем 4 часа в неделю.",
  "Бумага изобретена в Китае во II веке до н. э.",
  "Самый популярный жанр в мире — романтика.",
  "Чтение перед сном улучшает качество сна.",
  "В Финляндии 80% семей посещают библиотеку.",
  "Книга рекордов Гиннесса — самая крадомая книга в библиотеках.",
  "Первый роман — «Гэндзи-моногатари» (XI век, Япония).",
  "Чтение замедляет развитие деменции.",
  "В Исландии на Рождество дарят книги.",
  "Средняя длина романа — 80 000–100 000 слов.",
  "Библиотека Конгресса — крупнейшая в мире (170+ млн единиц).",
  "Аудиокниги активируют те же области мозга, что и чтение.",
  "В XIX веке книги красили зелёной краской с мышьяком.",
  "Самый длинный палиндром — роман «Сатана, носи сатану».",
  "Чтение повышает эмпатию.",
  "В Корее дети читают в среднем 11 книг в год.",
  "Первая библиотека в России — при Софийском соборе (1037).",
  "Книги на полках живут дольше, чем в коробках.",
  "Чтение 30 минут в день продлевает жизнь на 2 года.",
  "В Норвегии государство дарит книги первоклассникам.",
  "Самый маленький роман — 6 слов Эрнеста Хемингуэя.",
  "Библиотерапия — лечение с помощью книг.",
  "В среднем человек тратит 6 часов в неделю на чтение.",
  "Книги-раскладушки появились в XIII веке.",
  "Чтение снижает уровень кортизола.",
  "В Швеции есть закон о поддержке книгоиздания.",
  "Самый переводимый автор — Агата Кристи.",
  "Книги помогают развивать критическое мышление.",
  "В Индии печатают больше всего книг на хинди.",
  "Чтение вслух укрепляет связи в семье.",
  "Первая книга на русском — «Апостол» (1564).",
  "Библиотеки существуют более 4000 лет.",
  "Чтение улучшает концентрацию внимания.",
  "В Германии книги имеют фиксированную цену.",
  "Самый продаваемый роман — «Повесть о двух городах» Диккенса.",
  "Книги снижают тревожность лучше, чем музыка.",
  "В Египте была библиотека в Александрии.",
  "Чтение расширяет словарный запас на 50%.",
  "Книги-бестселлеры составляют 1% от всех изданий.",
  "В Канаде библиотеки выдают семена для огорода.",
  "Чтение перед экраном снижает вред синего света.",
  "Самый старый текст — «Эпос о Гильгамеше» (XVIII в. до н. э.).",
  "Книги делают людей более открытыми новому.",
];

function MainLayout() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const mainRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const showFact = location.pathname === "/";

  // При навигации фокус — в основной контент, а не в хедер
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

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
        className={`${sidebarStyles.sidebar} ${sidebarCollapsed ? sidebarStyles["sidebar--collapsed"] : ""}`}
      >
        <button
          type="button"
          className={sidebarStyles.sidebar__toggle}
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
          title={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <span className={`${sidebarStyles.sidebar__toggleArrow} ${sidebarCollapsed ? sidebarStyles["sidebar__toggleArrow--collapsed"] : ""}`}>
            <ChevronLeftIcon />
          </span>
        </button>
        <Link to="/" className={sidebarStyles.sidebar__logo}>
          <span className={sidebarStyles.sidebar__logoText}>Библиотека</span>
        </Link>
        <nav className={sidebarStyles.sidebar__nav}>
          {navItems.map(({ to, label }) => {
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            const isMyBooksGuest = to === "/my-books" && !user;
            if (isMyBooksGuest) {
              return (
                <button
                  key={to}
                  type="button"
                  className={`${sidebarStyles.sidebar__navItem} ${sidebarStyles["sidebar__navItem--button"]}`}
                  onClick={() => setShowLoginModal(true)}
                >
                  {label}
                </button>
              );
            }
            return (
              <Link
                key={to}
                to={to}
                className={`${sidebarStyles.sidebar__navItem} ${isActive ? sidebarStyles["sidebar__navItem--active"] : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className={sidebarStyles.sidebar__footer}>
          {user ? (
            <div className={sidebarStyles.sidebar__user}>
              <div className={sidebarStyles.sidebar__avatar}>
                {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
              </div>
              <span className={sidebarStyles.sidebar__userName}>
                {[user.name, user.surname].filter(Boolean).join(" ") || user.email}
              </span>
            </div>
          ) : null}
        </div>
      </aside>

      <div
        className={`${layoutStyles.content} ${location.pathname === "/" ? layoutStyles.contentMainPage : ""} ${sidebarCollapsed ? layoutStyles.contentSidebarCollapsed : ""}`}
        data-sidebar-collapsed={sidebarCollapsed || undefined}
      >
        <header className={`${headerStyles.header} ${showFact ? headerStyles.headerWithFact : ""}`}>
          <Link to="/" className={headerStyles.header__logo}>
            <span className={headerStyles.header__logoText}>Библиотека</span>
          </Link>

          <div className={headerStyles.header__center}>
            <span className={headerStyles.header__greeting}>
              {user ? `Добро пожаловать, ${[user.name, user.surname].filter(Boolean).join(" ") || user.email}!` : "Добро пожаловать!"}
            </span>
            <span className={headerStyles.header__tagline}>
              {user ? "Открывайте для себя новые миры" : "Читайте с удовольствием"}
            </span>
          </div>

          <div className={headerStyles.header__right}>
            <Link
              to="/"
              className={`${headerStyles.header__navLink} ${location.pathname === "/" ? headerStyles["header__navLink--active"] : ""}`}
            >
              Каталог
            </Link>
            {user ? (
              <Link
                to="/my-books"
                className={`${headerStyles.header__navLink} ${location.pathname.startsWith("/my-books") ? headerStyles["header__navLink--active"] : ""}`}
              >
                Мои книги
              </Link>
            ) : (
              <button
                type="button"
                className={headerStyles.header__navLink}
                onClick={() => setShowLoginModal(true)}
              >
                Мои книги
              </button>
            )}
            {user ? (
              <>
                <div
                  className={headerStyles.header__avatar}
                  title={[user.name, user.surname].filter(Boolean).join(" ") || user.email}
                >
                  {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                </div>
                <button
                  type="button"
                  className={headerStyles.header__logout}
                  onClick={logout}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${headerStyles.header__navLink} ${location.pathname === "/login" ? headerStyles["header__navLink--active"] : ""}`}
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className={`${headerStyles.header__navLink} ${headerStyles["header__navLink--register"]} ${location.pathname === "/register" ? headerStyles["header__navLink--active"] : ""}`}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </header>
        {showFact && (
          <div className={layoutStyles.factBar}>
            <span className={layoutStyles.factLabel}>Факт дня</span>
            <span className={layoutStyles.factText}>{FACTS[factIndex]}</span>
          </div>
        )}

        {showFact && <CatalogSearchBar />}

        <main ref={mainRef} className={layoutStyles.main} tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
      </div>

      {showLoginModal && (
        <div
          className={layoutStyles.modalOverlay}
          onClick={() => setShowLoginModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          <div
            className={layoutStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="login-modal-title" className={layoutStyles.modalTitle}>
              Войдите в аккаунт
            </h2>
            <p className={layoutStyles.modalText}>
              Войдите или зарегистрируйтесь, чтобы просмотреть свои книги.
            </p>
            <div className={layoutStyles.modalActions}>
              <Link
                to="/login"
                className="button button--primary"
                onClick={() => setShowLoginModal(false)}
              >
                Войти
              </Link>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setShowLoginModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
