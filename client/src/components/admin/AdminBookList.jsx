import pageStyles from "../../styles/common/Page.module.css";
import styles from "./AdminBookList.module.css";

function AdminBookList({ books, loading, saving, onEdit, onDelete, onUpload }) {
  const handleFileChange = (bookId, e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(bookId, file);
      e.target.value = "";
    }
  };

  if (loading) {
    return <p className={pageStyles.text}>Загрузка книг...</p>;
  }

  if (!books.length) {
    return <p className={pageStyles.text}>В каталоге пока нет книг.</p>;
  }

  return (
    <ul className={pageStyles.list}>
      {books.map((book) => (
        <li key={book._id} className={pageStyles.listItem}>
          <div>
            <strong>{book.title}</strong>{" "}
            {book.author && `— ${book.author}`}
            {book.genre && <span> ({book.genre})</span>}
            {book.year && <span>, {book.year}</span>}
            {book.filePath && (
              <span className={styles.fileBadge}>📄 {book.fileType}</span>
            )}
          </div>
          <div className={pageStyles.listActions}>
            <label className={`button button--ghost ${styles.upload}`}>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => handleFileChange(book._id, e)}
                disabled={saving}
                style={{ display: "none" }}
              />
              {book.filePath ? "Заменить файл" : "Загрузить файл"}
            </label>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => onEdit(book)}
              disabled={saving}
            >
              Редактировать
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
  );
}

export default AdminBookList;

