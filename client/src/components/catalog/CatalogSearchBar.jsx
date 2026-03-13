import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  const genreRef = useRef(null);
  const search = searchParams.get("search") ?? "";
  const genre = searchParams.get("genre") ?? "";

  const currentLabel = GENRE_OPTIONS.find((o) => o.value === genre)?.label ?? "Все жанры";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

  return (
    <div className={styles.searchBar}>
      <input
        type="search"
        className={styles.searchBar__input}
        placeholder="Поиск по названию или автору"
        value={search}
        onChange={handleSearchChange}
        aria-label="Поиск книг"
      />
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
