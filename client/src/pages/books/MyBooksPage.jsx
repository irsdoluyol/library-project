import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { fetchMyBooks, returnBook } from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import BorrowingItem from "../../components/books/BorrowingItem.jsx";
import pageStyles from "../../styles/common/Page.module.css";

function MyBooksPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [returnError, setReturnError] = useState("");

  const { data: items = [], loading, error } = useAsyncLoad(
    () => (user ? fetchMyBooks() : Promise.resolve([])),
    [user, refreshTrigger]
  );

  const handleReturn = async (bookId) => {
    if (!user) return;
    setReturnError("");
    setPendingReturnId(bookId);
    try {
      await returnBook(bookId);
      setRefreshTrigger((t) => t + 1);
      toast.success("Книга возвращена");
    } catch (err) {
      setReturnError(err.message);
      toast.error(err.message);
    } finally {
      setPendingReturnId(null);
    }
  };

  return (
    <section className={pageStyles.page}>
      <h1 className={pageStyles.title}>Мои книги</h1>
      {(error || returnError) && (
        <p className={pageStyles.text}>{error || returnError}</p>
      )}
      {loading ? (
        <p className={pageStyles.text}>Загрузка...</p>
      ) : items.length === 0 ? (
        <p className={pageStyles.text}>
          У вас пока нет выданных книг.
        </p>
      ) : (
        <ul className={pageStyles.list}>
          {items.map((borrowing) => (
            <BorrowingItem
              key={borrowing._id}
              borrowing={borrowing}
              isPending={pendingReturnId === borrowing.book?._id}
              onReturn={handleReturn}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyBooksPage;
