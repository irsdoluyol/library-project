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

function BookCard({ book, isFavorite, onFavoriteToggle, pendingFavoriteId }) {
  const isFavPending = pendingFavoriteId === book._id;
  const rating = useMemo(() => getBookRating(book._id), [book._id]);

  const infoBlock = (
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
  );

  const coverInner = (
    <>
      {book.coverPath ? (
        <img src={getCoverUrl(book._id)} alt="" className={styles.coverImg} />
      ) : (
        <div className={styles.coverPlaceholder} />
      )}
      {onFavoriteToggle && (
        <button
          type="button"
          className={styles.favoriteBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteToggle(book._id);
          }}
          disabled={isFavPending}
          aria-label={isFavorite ? "Убрать из сохранённого" : "Добавить в сохранённое"}
        >
          {isFavorite ? <IconBookmarkFilled /> : <IconBookmark />}
        </button>
      )}
    </>
  );

  return (
    <article className={styles.book}>
      <Link
        to={`/book/${book._id}`}
        className={styles.cardLink}
        aria-label={`${book.title || "Книга"} — подробнее`}
      >
        <div className={styles.cover}>{coverInner}</div>
        {infoBlock}
      </Link>
    </article>
  );
}

export default BookCard;
