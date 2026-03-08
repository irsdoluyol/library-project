import styles from "./BookCard.module.css";

function BookCard({ book, user, isLoggedIn: isLoggedInProp, onBorrow, pendingBorrowId }) {
  const isLoggedIn = !!user || !!isLoggedInProp;
  const isPending = pendingBorrowId === book._id;
  return (
    <div className={styles.book}>
      <div className={styles.text}>
        {book.title}
        <br />
        <span>{book.author}</span>
      </div>
      {isLoggedIn && (
        <div className={styles.actions}>
          {book.available ? (
            <button
              type="button"
              className="button button--primary"
              onClick={() => onBorrow(book._id)}
              disabled={isPending}
            >
              {isPending ? "..." : "Взять"}
            </button>
          ) : (
            <span className={`${styles.text} ${styles.unavailable}`}>
              Недоступно
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default BookCard;
