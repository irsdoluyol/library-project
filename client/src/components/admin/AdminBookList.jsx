import { getCoverUrl } from "../../api/booksApi.js";
import Pagination from "../common/Pagination.jsx";
import pageStyles from "../../styles/common/Page.module.css";
import styles from "./AdminBookList.module.css";

function AdminBookList({
  books,
  totalCount,
  loading,
  saving,
  search,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onUpload,
  onUploadCover,
}) {
  const handleFileChange = (bookId, e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(bookId, file);
      e.target.value = "";
    }
  };

  const handleCoverChange = (bookId, e) => {
    const file = e.target.files?.[0];
    if (file && onUploadCover) {
      onUploadCover(bookId, file);
      e.target.value = "";
    }
  };

  if (loading) {
    return <p className={pageStyles.text}>Загрузка книг...</p>;
  }

  return (
    <div className={styles.bookList}>
      <div className={styles.bookList__searchRow}>
        <input
          type="search"
          className={styles.bookList__searchInput}
          placeholder="Поиск по названию, автору, жанру..."
          value={search}
          onChange={(e) => {
            onSearchChange?.(e.target.value);
            onPageChange?.(1);
          }}
          aria-label="Поиск"
        />
        <button type="button" className={styles.bookList__searchBtn} aria-label="Найти">
          Найти
        </button>
      </div>
      <p className={styles.bookList__count}>Найдено: {totalCount} книг</p>

      {!books.length ? (
        <p className={pageStyles.text}>
          {search?.trim() ? "Ничего не найдено." : "В каталоге пока нет книг."}
        </p>
      ) : (
        <>
          <ul className={styles.bookList__list}>
            {books.map((book) => (
              <li key={book._id} className={styles.bookList__item}>
                <div className={styles.bookList__coverCell}>
                  {book.coverPath ? (
                    <>
                      <img
                        src={getCoverUrl(book._id)}
                        alt=""
                        className={styles.bookList__coverImg}
                      />
                      <span className={styles.bookList__coverCheck} aria-hidden>✓</span>
                    </>
                  ) : null}
                </div>
                <div className={styles.bookList__info}>
                  <span className={styles.bookList__title}>{book.title || "—"}</span>
                  <span className={styles.bookList__meta}>
                    {[book.author, book.genre, book.year].filter(Boolean).join(", ") || "—"}
                    {book.filePath && (
                      <span className={styles.bookList__fileIcon} aria-hidden> ■</span>
                    )}
                  </span>
                </div>
                <div className={styles.bookList__uploads}>
                  <label className={styles.bookList__coverUpload}>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(e) => handleCoverChange(book._id, e)}
                      disabled={saving}
                      style={{ display: "none" }}
                    />
                    {book.coverPath ? "Заменить" : "Загрузить"}
                  </label>
                  <label className={styles.bookList__fileUpload}>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => handleFileChange(book._id, e)}
                      disabled={saving}
                      style={{ display: "none" }}
                    />
                    {book.filePath ? `📄 ${book.fileType || "PDF"}` : "Загрузить"}
                  </label>
                </div>
                <div className={styles.bookList__actions}>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => onEdit(book)}
                    disabled={saving}
                  >
                    Редакт.
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => onDelete(book._id)}
                    disabled={saving}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(newPage) => onPageChange?.(newPage)}
              prevLabel="← Назад"
              nextLabel="Вперёд →"
              format="{page} / {total}"
            />
          )}
        </>
      )}
    </div>
  );
}

export default AdminBookList;

