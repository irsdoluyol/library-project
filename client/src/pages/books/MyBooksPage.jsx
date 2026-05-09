import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { fetchMyBooks, toggleFavorite } from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import BookCard from "../../components/catalog/BookCard.jsx";
import BookShelf from "../../components/catalog/BookShelf.jsx";
import PageWithHeader from "../../components/common/PageWithHeader.jsx";

function MyBooksPage() {
  const { user } = useAuth();
  const { books: favoritesBooks, refresh: refreshFavorites } = useFavorites();
  const [pendingFavoriteId, setPendingFavoriteId] = useState(null);

  const { data, loading, error } = useAsyncLoad(
    () => (user ? fetchMyBooks() : Promise.resolve([])),
    [user]
  );
  const items = Array.isArray(data) ? data : [];
  const displayableBooks = items.filter((b) => b?.book);
  const favoriteIds = new Set((favoritesBooks ?? []).map((b) => b._id));

  const handleFavoriteToggle = async (bookId) => {
    if (!user) return;
    setPendingFavoriteId(bookId);
    try {
      const res = await toggleFavorite(bookId);
      refreshFavorites();
      toast.success(res.added ? "Добавлено в сохранённое" : "Удалено из сохранённого");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingFavoriteId(null);
    }
  };

  return (
    <PageWithHeader title="Мои книги" description="Книги, которые вам выданы. Нажмите на карточку — откроется страница с описанием и чтением.">
      <BookShelf
        loading={loading}
        isEmpty={!loading && displayableBooks.length === 0}
        emptyText="У вас пока нет выданных книг."
        error={error}
      >
        {items.map((borrowing) => {
          const book = borrowing.book;
          if (!book) return null;
          return (
            <BookCard
              key={borrowing._id}
              book={book}
              user={user}
              isFavorite={pendingFavoriteId === book._id ? !favoriteIds.has(book._id) : favoriteIds.has(book._id)}
              onFavoriteToggle={handleFavoriteToggle}
              pendingFavoriteId={pendingFavoriteId}
            />
          );
        })}
      </BookShelf>
    </PageWithHeader>
  );
}

export default MyBooksPage;
