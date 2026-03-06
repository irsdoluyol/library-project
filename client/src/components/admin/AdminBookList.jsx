import "../../styles/components/admin/AdminBookList.css";

function AdminBookList({ books, loading, saving, onEdit, onDelete, onUpload }) {
  const handleFileChange = (bookId, e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(bookId, file);
      e.target.value = "";
    }
  };

  if (loading) {
    return <p className="page__text">Загрузка книг...</p>;
  }

  if (!books.length) {
    return <p className="page__text">В каталоге пока нет книг.</p>;
  }

  return (
    <ul className="page__list">
      {books.map((book) => (
        <li key={book._id} className="page__list-item">
          <div>
            <strong>{book.title}</strong>{" "}
            {book.author && `— ${book.author}`}
            {book.genre && <span> ({book.genre})</span>}
            {book.year && <span>, {book.year}</span>}
            {book.filePath && (
              <span className="admin-book__file-badge">📄 {book.fileType}</span>
            )}
          </div>
          <div className="page__list-actions">
            <label className="button button--ghost admin-book__upload">
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

