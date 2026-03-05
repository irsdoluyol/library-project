import { useEffect, useState } from "react";
import "../App.css";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMyBooks } from "../api/booksApi.js";

function MyBooksPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchMyBooks(token);
        if (!cancelled) {
          setItems(data || []);
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
  }, [token]);

  return (
    <section className="page">
      <h1 className="page__title">My books</h1>
      {error && <p className="page__text">{error}</p>}
      {loading ? (
        <p className="page__text">Loading...</p>
      ) : items.length === 0 ? (
        <p className="page__text">
          You do not have any active borrowings yet.
        </p>
      ) : (
        <ul className="page__list">
          {items.map((borrowing) => (
            <li key={borrowing._id} className="page__list-item">
              <strong>{borrowing.book?.title}</strong>{" "}
              {borrowing.book?.author && `— ${borrowing.book.author}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyBooksPage;

