import { useState } from "react";
import toast from "react-hot-toast";
import { fetchBooks, borrowBook } from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useAuth } from "../../context/useAuth.js";
import BookCard from "../../components/catalog/BookCard.jsx";
import CatalogSearch from "../../components/catalog/CatalogSearch.jsx";
import catalogStyles from "./CatalogPage.module.css";
import shelfStyles from "../../styles/pages/catalog/Shelf.module.css";

function CatalogPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingBorrowId, setPendingBorrowId] = useState(null);
  const [borrowError, setBorrowError] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error } = useAsyncLoad(
    () => fetchBooks({ search: debouncedSearch, genre, page }),
    [debouncedSearch, genre, page, refreshTrigger]
  );

  const books = data?.books ?? [];
  const pages = data?.pages ?? 1;

  const handleBorrow = async (bookId) => {
    if (!user) return;
    setBorrowError("");
    setPendingBorrowId(bookId);
    try {
      await borrowBook(bookId);
      setRefreshTrigger((t) => t + 1);
      toast.success("Книга успешно выдана");
    } catch (err) {
      setBorrowError(err.message);
      toast.error(err.message);
    } finally {
      setPendingBorrowId(null);
    }
  };

  const handleSearchChange = (value) => {
    setPage(1);
    setSearch(value);
  };

  const handleGenreChange = (value) => {
    setPage(1);
    setGenre(value);
  };

  return (
    <section className={catalogStyles.catalog}>
      <header className={catalogStyles.hero}>
        <div>
          <h1 className={catalogStyles.title}>Онлайн-библиотека</h1>
          <p className={catalogStyles.subtitle}>
            Изучайте каталог, находите книги и берите их в несколько кликов.
          </p>
        </div>
        <CatalogSearch
          search={search}
          genre={genre}
          onSearchChange={handleSearchChange}
          onGenreChange={handleGenreChange}
        />
      </header>

      <section className={shelfStyles.shelf}>
        <h2 className={shelfStyles.title}>Популярное</h2>
        {(error || borrowError) && (
          <p className={catalogStyles.text}>{error || borrowError}</p>
        )}
        {loading ? (
          <div className={shelfStyles.list}>
            <div className={`${shelfStyles.book} ${shelfStyles.bookPlaceholder}`} />
            <div className={`${shelfStyles.book} ${shelfStyles.bookPlaceholder}`} />
            <div className={`${shelfStyles.book} ${shelfStyles.bookPlaceholder}`} />
            <div className={`${shelfStyles.book} ${shelfStyles.bookPlaceholder}`} />
          </div>
        ) : (
          <div className={shelfStyles.list}>
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                user={user}
                pendingBorrowId={pendingBorrowId}
                onBorrow={handleBorrow}
              />
            ))}
            {books.length === 0 && !error && (
              <p className={catalogStyles.text}>Книги не найдены.</p>
            )}
          </div>
        )}
        <div className={catalogStyles.pagination}>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Назад
          </button>
          <span className={catalogStyles.pageIndicator}>
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
