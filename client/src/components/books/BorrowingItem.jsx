import { Link } from "react-router-dom";
import pageStyles from "../../styles/common/Page.module.css";

function BorrowingItem({ borrowing, onReturn, isPending }) {
  const book = borrowing.book;
  if (!book) return null;

  return (
    <li className={pageStyles.listItem}>
      <div>
        <strong>{book.title}</strong>{" "}
        {book.author && `— ${book.author}`}
      </div>
      <div className={pageStyles.listActions}>
        {book.filePath && (
          <Link
            to={`/read/${book._id}`}
            className="button button--outline"
          >
            Читать{" "}
            <span className={pageStyles.btnArrow} aria-hidden>→</span>
          </Link>
        )}
        <button
          type="button"
          className="button button--ghost"
          onClick={() => onReturn(book._id)}
          disabled={isPending}
        >
          {isPending ? "..." : "Вернуть"}
        </button>
      </div>
    </li>
  );
}

export default BorrowingItem;
