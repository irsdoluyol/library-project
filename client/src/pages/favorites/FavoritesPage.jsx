import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { toggleFavorite, borrowBook } from "../../api/booksApi.js";
import BookCard from "../../components/catalog/BookCard.jsx";
import BookShelf from "../../components/catalog/BookShelf.jsx";
import PageWithHeader from "../../components/common/PageWithHeader.jsx";

function FavoritesPage() {
  const { user } = useAuth();
  const { books, loading, error, refresh } = useFavorites();
  const [pendingFavoriteId, setPendingFavoriteId] = useState(null);
  const [pendingBorrowId, setPendingBorrowId] = useState(null);

  const handleBorrow = async (bookId) => {
    if (!user) return;
    setPendingBorrowId(bookId);
    try {
      await borrowBook(bookId);
      refresh();
      toast.success("Книга успешно выдана");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingBorrowId(null);
    }
  };

  const handleFavoriteToggle = async (bookId) => {
    if (!user) return;
    setPendingFavoriteId(bookId);
    try {
      const res = await toggleFavorite(bookId);
      refresh();
      toast.success(res.added ? "Добавлено в сохранённое" : "Удалено из сохранённого");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingFavoriteId(null);
    }
  };

  return (
    <PageWithHeader
      title="Сохранённое"
      description="Книги, которые вы сохранили."
    >
      <BookShelf
        loading={loading}
        isEmpty={!loading && books.length === 0}
        emptyText="У вас пока нет сохранённых книг. Добавьте их из раздела «Популярное»."
        error={error}
      >
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            user={user}
            isFavorite={true}
            onBorrow={handleBorrow}
            onFavoriteToggle={handleFavoriteToggle}
            pendingBorrowId={pendingBorrowId}
            pendingFavoriteId={pendingFavoriteId}
          />
        ))}
      </BookShelf>
    </PageWithHeader>
  );
}

export default FavoritesPage;
