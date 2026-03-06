import { useState } from "react";
import { fetchBooks, borrowBook } from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import { useAuth } from "../../context/useAuth.js";
import "../../styles/pages/catalog/CatalogPage.css";

function CatalogPage() {
  const { user, token } = useAuth();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingBorrowId, setPendingBorrowId] = useState(null);
  const [borrowError, setBorrowError] = useState("");

  const { data, loading, error } = useAsyncLoad(
    () => fetchBooks({ search, genre, page }),
    [search, genre, page, refreshTrigger]
  );

  const books = data?.books ?? [];
  const pages = data?.pages ?? 1;

  const handleBorrow = async (bookId) => {
    if (!token) return;
    setBorrowError("");
    setPendingBorrowId(bookId);
    try {
      await borrowBook(token, bookId);
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      setBorrowError(err.message);
    } finally {
      setPendingBorrowId(null);
    }
  };

  const handleSearchChange = (e) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const handleGenreChange = (e) => {
    setPage(1);
    setGenre(e.target.value);
  };

  return (
    <section className="catalog">
      <header className="catalog__hero">
        <div>
          <h1 className="catalog__title">Онлайн-библиотека</h1>
          <p className="catalog__subtitle">
            Изучайте каталог, находите книги и берите их в несколько кликов.
          </p>
        </div>
        <div className="catalog__search">
          <input
            className="catalog__search-input"
            type="text"
            placeholder="Поиск по названию или автору"
            value={search}
            onChange={handleSearchChange}
          />
          <select
            className="catalog__genre-select"
            value={genre}
            onChange={handleGenreChange}
          >
            <option value="">Все жанры</option>
            <option value="Novel">Роман</option>
            <option value="Fantasy">Фэнтези</option>
            <option value="Detective">Детектив</option>
          </select>
        </div>
      </header>

      <section className="shelf">
        <h2 className="shelf__title">Популярное</h2>
        {(error || borrowError) && (
          <p className="page__text">{error || borrowError}</p>
        )}
        {loading ? (
          <div className="shelf__list">
            <div className="shelf__book shelf__book--placeholder" />
            <div className="shelf__book shelf__book--placeholder" />
            <div className="shelf__book shelf__book--placeholder" />
            <div className="shelf__book shelf__book--placeholder" />
          </div>
        ) : (
          <div className="shelf__list">
            {books.map((book) => (
              <div key={book._id} className="shelf__book">
                <div className="page__text">
                  {book.title}
                  <br />
                  <span>{book.author}</span>
                </div>
                {user && (
                  <div className="shelf__book-actions">
                    {book.available ? (
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => handleBorrow(book._id)}
                        disabled={pendingBorrowId !== null}
                      >
                        {pendingBorrowId === book._id ? "..." : "Взять"}
                      </button>
                    ) : (
                      <span className="page__text shelf__book-unavailable">
                        Недоступно
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {books.length === 0 && !error && (
              <p className="page__text">Книги не найдены.</p>
            )}
          </div>
        )}
        <div className="catalog__pagination">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Назад
          </button>
          <span className="catalog__page-indicator">
            Страница {page} из {pages}
          </span>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Вперёд
          </button>
        </div>
      </section>
    </section>
  );
}

export default CatalogPage;
