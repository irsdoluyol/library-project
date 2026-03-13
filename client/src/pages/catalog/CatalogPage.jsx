import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchBooks, borrowBook } from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useAuth } from "../../context/useAuth.js";
import BookCard from "../../components/catalog/BookCard.jsx";
import HeroCarousel from "../../components/catalog/HeroCarousel.jsx";
import catalogStyles from "./CatalogPage.module.css";
import shelfStyles from "../../styles/pages/catalog/Shelf.module.css";

function CatalogPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const findTrigger = searchParams.get("t") ?? "";
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingBorrowId, setPendingBorrowId] = useState(null);
  const [borrowError, setBorrowError] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error } = useAsyncLoad(
    () => fetchBooks({ search: debouncedSearch, genre, page, limit: 10, sort: "title" }),
    [debouncedSearch, genre, page, refreshTrigger, findTrigger]
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

  return (
    <section className={catalogStyles.catalog}>
      <HeroCarousel />

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
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", String(Math.max(1, page - 1)));
                return next;
              });
            }}
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
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", String(Math.min(pages, page + 1)));
                return next;
              });
            }}
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
