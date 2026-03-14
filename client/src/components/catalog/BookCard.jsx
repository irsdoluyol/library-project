import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getCoverUrl } from "../../api/booksApi.js";
import { IconBookmark, IconBookmarkFilled } from "../common/Icons.jsx";
import styles from "./BookCard.module.css";

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getBookRating(bookId) {
  const h = simpleHash(bookId);
  return (4 + (h % 36) / 10).toFixed(1);
}

function StarRating({ value }) {
  return (
    <span className={styles.rating} aria-label={`Рейтинг ${value} из 5`}>
      ★ <span className={styles.ratingValue}>{value}</span>
    </span>
  );
}

function BookCard({
  book,
  user,
  isLoggedIn: isLoggedInProp,
  onBorrow,
  pendingBorrowId,
  isBorrowedByMe,
  onReturn,
  pendingReturnId,
  isFavorite,
  onFavoriteToggle,
  pendingFavoriteId,
}) {
  const isLoggedIn = !!user || !!isLoggedInProp;
  const isPending = pendingBorrowId === book._id;
  const isReturnPending = pendingReturnId === book._id;
  const isFavPending = pendingFavoriteId === book._id;
  const rating = useMemo(() => getBookRating(book._id), [book._id]);

  const renderActions = () => {
    if (!isLoggedIn) return null;
    if (isBorrowedByMe) {
      return (
        <div className={styles.actions}>
          {book.filePath && (
            <Link to={`/read/${book._id}`} className="button button--outline">
              Читать <span className={styles.btnArrow} aria-hidden>→</span>
            </Link>
          )}
          <button
            type="button"
            className="button button--ghost"
            onClick={() => onReturn?.(book._id)}
            disabled={isReturnPending}
          >
            {isReturnPending ? "..." : "Вернуть"}
          </button>
        </div>
      );
    }
    return (
      <div className={styles.actions}>
        {book.available ? (
          <button
            type="button"
            className="button button--outline"
            onClick={() => onBorrow?.(book._id)}
            disabled={isPending}
          >
            {isPending ? "..." : "Читать "}
            <span className={styles.btnArrow} aria-hidden>→</span>
          </button>
        ) : (
          <span className={styles.unavailable}>Недоступно</span>
        )}
      </div>
    );
  };

  return (
    <article className={styles.book}>
      <div className={styles.cover}>
        {book.coverPath ? (
          <img src={getCoverUrl(book._id)} alt="" className={styles.coverImg} />
        ) : (
          <div className={styles.coverPlaceholder} />
        )}
        {onFavoriteToggle && (
          <button
            type="button"
            className={styles.favoriteBtn}
            onClick={() => onFavoriteToggle(book._id)}
            disabled={isFavPending}
            aria-label={isFavorite ? "Убрать из сохранённого" : "Добавить в сохранённое"}
          >
            {isFavorite ? <IconBookmarkFilled /> : <IconBookmark />}
          </button>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{book.title || "—"}</h3>
        <p className={styles.author}>{book.author || "—"}</p>
        <StarRating value={rating} />
        <div className={styles.meta}>
          {book.genre && <span className={styles.genreBadge}>{book.genre}</span>}
          {book.year && <span className={styles.year}>{book.year}</span>}
          {!book.genre && !book.year && "—"}
        </div>
      </div>
      {renderActions()}
    </article>
  );
}

export default BookCard;
