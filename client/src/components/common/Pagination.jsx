import styles from "./Pagination.module.css";

function Pagination({
  page,
  totalPages,
  onPageChange,
  prevLabel = "Назад",
  nextLabel = "Вперёд",
  format = "Страница {page} из {total}",
}) {
  if (totalPages <= 1) return null;

  const indicator = format
    .replace("{page}", page)
    .replace("{total}", totalPages);

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className="button button--ghost"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {prevLabel}
      </button>
      <span className={styles.pageIndicator}>{indicator}</span>
      <button
        type="button"
        className="button button--ghost"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default Pagination;
