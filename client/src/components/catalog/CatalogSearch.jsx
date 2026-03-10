import styles from "./CatalogSearch.module.css";

const GENRE_OPTIONS = [
  { value: "", label: "Все жанры" },
  { value: "Роман", label: "Роман" },
  { value: "Детектив", label: "Детектив" },
  { value: "Фантастика", label: "Фантастика" },
  { value: "Детская литература", label: "Детская литература" },
  { value: "Классика", label: "Классика" },
];

function CatalogSearch({ search, genre, onSearchChange, onGenreChange }) {
  return (
    <div className={styles.search}>
      <input
        type="search"
        className={styles.input}
        placeholder="Поиск по названию или автору"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Поиск книг"
      />
      <select
        className={styles.select}
        value={genre}
        onChange={(e) => onGenreChange(e.target.value)}
        aria-label="Жанр"
      >
        {GENRE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CatalogSearch;
