import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { fetchMyBooks, returnBook } from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import BorrowingItem from "../../components/books/BorrowingItem.jsx";
import PageWithHeader from "../../components/common/PageWithHeader.jsx";
import ContentState from "../../components/common/ContentState.jsx";
import pageStyles from "../../styles/common/Page.module.css";

function MyBooksPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [returnError, setReturnError] = useState("");

  const { data, loading, error } = useAsyncLoad(
    () => (user ? fetchMyBooks() : Promise.resolve([])),
    [user, refreshTrigger]
  );
  const items = data ?? [];

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

  const displayError = error || returnError;

  return (
    <PageWithHeader title="Мои книги">
      <ContentState
        error={displayError}
        loading={loading}
        isEmpty={items.length === 0}
        emptyText="У вас пока нет выданных книг."
      >
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
      </ContentState>
    </PageWithHeader>
  );
}

export default MyBooksPage;
