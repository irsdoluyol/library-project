import styles from "./CatalogSearch.module.css";

const GENRES = [
  { value: "", label: "Все жанры" },
  { value: "Novel", label: "Роман" },
  { value: "Fantasy", label: "Фэнтези" },
  { value: "Detective", label: "Детектив" },
];

function CatalogSearch({ search, genre, onSearchChange, onGenreChange }) {
  return (
    <div className={styles.search}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Поиск по названию или автору"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        className={styles.genreSelect}
        value={genre}
        onChange={(e) => onGenreChange(e.target.value)}
      >
        {GENRES.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CatalogSearch;
