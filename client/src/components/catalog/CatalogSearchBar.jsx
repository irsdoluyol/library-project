import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchBooks } from "../../api/booksApi.js";
import { useDebounce } from "../../hooks/useDebounce.js";
import styles from "./CatalogSearchBar.module.css";

const GENRE_OPTIONS = [
  { value: "", label: "Все жанры" },
  { value: "Роман", label: "Роман" },
  { value: "Детектив", label: "Детектив" },
  { value: "Фантастика", label: "Фантастика" },
  { value: "Детская литература", label: "Детская литература" },
  { value: "Классика", label: "Классика" },
];

function CatalogSearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [genreOpen, setGenreOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const genreRef = useRef(null);
  const searchWrapRef = useRef(null);
  const search = searchParams.get("search") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const debouncedSearch = useDebounce(search, 300);

  const currentLabel = GENRE_OPTIONS.find((o) => o.value === genre)?.label ?? "Все жанры";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) {
        setGenreOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = debouncedSearch.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      return;
    }
    let cancelled = false;
    setSuggestionsLoading(true);
    setShowSuggestions(true);
    fetchBooks({ search: q, genre, page: 1, limit: 6 })
      .then((res) => {
        if (!cancelled) {
          setSuggestions(res?.books ?? []);
          setShowSuggestions(true);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setSuggestionsLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedSearch, genre]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    next.delete("page");
    setSearchParams(next);
  };

  const handleSearchChange = (e) => {
    updateParams({ search: e.target.value });
  };

  const handleGenreSelect = (value) => {
    updateParams({ genre: value });
    setGenreOpen(false);
  };

  const handleFindClick = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      next.set("t", String(Date.now()));
      return next;
    }, { replace: true });
  };

  const handleSuggestionClick = (book) => {
    updateParams({ search: book.title || "" });
    setShowSuggestions(false);
  };

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchBar__inputWrap} ref={searchWrapRef}>
        <input
          type="search"
          className={styles.searchBar__input}
          placeholder="Поиск по названию или автору"
          autoComplete="off"
          value={search}
          onChange={handleSearchChange}
          onFocus={() => (suggestions.length > 0 || suggestionsLoading) && setShowSuggestions(true)}
          aria-label="Поиск книг"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
        />
        {showSuggestions && (
          <ul
            id="search-suggestions"
            className={styles.searchBar__suggestions}
            role="listbox"
            aria-label="Подсказки книг"
          >
            {suggestionsLoading ? (
              <li className={styles.searchBar__suggestionItem}>Загрузка...</li>
            ) : suggestions.length === 0 ? (
              <li className={styles.searchBar__suggestionItem}>Ничего не найдено</li>
            ) : (
              suggestions.map((book) => (
                <li
                  key={book._id}
                  role="option"
                  className={styles.searchBar__suggestionItem}
                  onClick={() => handleSuggestionClick(book)}
                >
                  <span className={styles.searchBar__suggestionTitle}>{book.title || "—"}</span>
                  {book.author && (
                    <span className={styles.searchBar__suggestionAuthor}> — {book.author}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <div className={styles.searchBar__genreWrap} ref={genreRef}>
        <button
          type="button"
          className={`${styles.searchBar__genreBtn} ${genreOpen ? styles["searchBar__genreBtn--open"] : ""}`}
          onClick={() => setGenreOpen((o) => !o)}
          aria-expanded={genreOpen}
          aria-haspopup="listbox"
          aria-label="Жанр"
        >
          {currentLabel}
          <svg className={styles.searchBar__genreArrow} width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {genreOpen && (
          <ul
            className={styles.searchBar__genreList}
            role="listbox"
            aria-label="Выберите жанр"
          >
            {GENRE_OPTIONS.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={genre === opt.value}
                className={`${styles.searchBar__genreItem} ${genre === opt.value ? styles["searchBar__genreItem--active"] : ""}`}
                onClick={() => handleGenreSelect(opt.value)}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className={styles.searchBar__findBtn}
        onClick={handleFindClick}
      >
        Найти
      </button>
    </div>
  );
}

export default CatalogSearchBar;
