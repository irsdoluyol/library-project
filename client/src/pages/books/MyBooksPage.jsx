import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { fetchMyBooks, returnBook } from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";

function MyBooksPage() {
  const { token } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [returnError, setReturnError] = useState("");

  const { data: items = [], loading, error } = useAsyncLoad(
    () => (token ? fetchMyBooks(token) : Promise.resolve([])),
    [token, refreshTrigger]
  );

  const handleReturn = async (bookId) => {
    if (!token) return;
    setReturnError("");
    setPendingReturnId(bookId);
    try {
      await returnBook(token, bookId);
      setRefreshTrigger((t) => t + 1);
    } catch (err) {
      setReturnError(err.message);
    } finally {
      setPendingReturnId(null);
    }
  };

  return (
    <section className="page">
      <h1 className="page__title">Мои книги</h1>
      {(error || returnError) && (
        <p className="page__text">{error || returnError}</p>
      )}
      {loading ? (
        <p className="page__text">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="page__text">
          У вас пока нет выданных книг.
        </p>
      ) : (
        <ul className="page__list">
          {items.map((borrowing) => (
            <li key={borrowing._id} className="page__list-item">
              <div>
                <strong>{borrowing.book?.title}</strong>{" "}
                {borrowing.book?.author && `— ${borrowing.book.author}`}
              </div>
              <div className="page__list-actions">
                {borrowing.book?.filePath && (
                  <Link
                    to={`/read/${borrowing.book._id}`}
                    className="button button--primary"
                  >
                    Читать
                  </Link>
                )}
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => handleReturn(borrowing.book?._id)}
                  disabled={pendingReturnId !== null}
                >
                  {pendingReturnId === borrowing.book?._id ? "..." : "Вернуть"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyBooksPage;
