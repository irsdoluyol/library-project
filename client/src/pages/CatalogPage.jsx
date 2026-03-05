import { useEffect, useState } from "react";
import { fetchBooks } from "../api/booksApi.js";
import "../App.css";

function CatalogPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchBooks({ search, genre, page });
        if (!cancelled) {
          setBooks(data.books || []);
          setPages(data.pages || 1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [search, genre, page]);

  const handleSearchChange = (event) => {
    setPage(1);
    setSearch(event.target.value);
  };

  const handleGenreChange = (event) => {
    setPage(1);
    setGenre(event.target.value);
  };

  const handlePrevPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPage((current) => Math.min(pages, current + 1));
  };

  return (
    <section className="catalog">
      <header className="catalog__hero">
        <div>
          <h1 className="catalog__title">Keep the story going</h1>
          <p className="catalog__subtitle">
            Explore the online catalog, find a book and borrow it in a couple of
            clicks.
          </p>
        </div>
        <div className="catalog__search">
          <input
            className="catalog__search-input"
            type="text"
            placeholder="Search by title or author"
            value={search}
            onChange={handleSearchChange}
          />
          <select
            className="catalog__genre-select"
            value={genre}
            onChange={handleGenreChange}
          >
            <option value="">All genres</option>
            {/* жанры могут быть вынесены в константу или загружаться с бэка */}
            <option value="Novel">Novel</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Detective">Detective</option>
          </select>
        </div>
      </header>

      <section className="shelf">
        <h2 className="shelf__title">Popular now</h2>
        {error && <p className="page__text">{error}</p>}
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
                {/* пока просто фон и подпись снизу */}
                <div className="page__text">
                  {book.title}
                  <br />
                  <span>{book.author}</span>
                </div>
              </div>
            ))}
            {books.length === 0 && !error && (
              <p className="page__text">No books found.</p>
            )}
          </div>
        )}
        <div className="catalog__pagination">
          <button
            type="button"
            className="button button--ghost"
            onClick={handlePrevPage}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="catalog__page-indicator">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            className="button button--ghost"
            onClick={handleNextPage}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      </section>
    </section>
  );
}

export default CatalogPage;

