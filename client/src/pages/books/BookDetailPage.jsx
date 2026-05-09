import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchBook,
  getCoverUrl,
  getBookReaderUrl,
  borrowBook,
  returnBook,
  toggleFavorite,
} from "../../api/booksApi.js";
import { useAsyncLoad } from "../../hooks/useAsyncLoad.js";
import { useAuth } from "../../context/useAuth.js";
import { useAuthPrompt } from "../../context/AuthPromptContext.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { IconBookmark, IconBookmarkFilled } from "../../components/common/Icons.jsx";
import pageStyles from "../../styles/common/Page.module.css";
import styles from "./BookDetailPage.module.css";

const MAX_PREVIEW_SENTENCES = 6;

function splitDescription(text) {
  if (!text) return [];
  const normalized = String(text).trim();
  if (!normalized) return [];

  let sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  sentences = sentences.slice(0, MAX_PREVIEW_SENTENCES);
  const joined = sentences.join(" ");

  const byBlocks = joined
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (byBlocks.length > 1 && byBlocks.every((p) => p.length < 450)) return byBlocks;

  if (sentences.length <= 3) return [joined];

  const mid = Math.ceil(sentences.length / 2);
  const first = sentences.slice(0, mid).join(" ");
  const second = sentences.slice(mid).join(" ");
  return [first, second].filter(Boolean);
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openPrompt } = useAuthPrompt();
  const { books: favoritesBooks, refresh: refreshFavorites } = useFavorites();
  const [pending, setPending] = useState(null);

  const { data: book, loading, error, reload } = useAsyncLoad(
    () => (id ? fetchBook(id) : Promise.resolve(null)),
    [id]
  );

  const favoriteIds = new Set((favoritesBooks ?? []).map((b) => String(b._id)));
  const isFavorite = book ? favoriteIds.has(String(book._id)) : false;
  const hasFile = Boolean(book?.filePath ?? book?.hasBookFile);

  const handleFavorite = async () => {
    if (!book || pending) return;
    if (!user) {
      openPrompt("Чтобы добавить книгу в сохранённое, войдите или зарегистрируйтесь.");
      return;
    }
    setPending("fav");
    try {
      const res = await toggleFavorite(book._id);
      refreshFavorites();
      toast.success(res.added ? "Добавлено в сохранённое" : "Удалено из сохранённого");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(null);
    }
  };

  const goRead = () => {
    if (book?._id) navigate(`/read/${book._id}`);
  };

  const handleStartReading = async () => {
    if (!book || pending) return;
    if (!user) {
      openPrompt("Чтобы взять книгу и читать в приложении, войдите или зарегистрируйтесь.");
      return;
    }
    if (!hasFile) {
      toast.error("У этой книги пока нет файла для чтения.");
      return;
    }
    if (book.borrowedByMe) {
      goRead();
      return;
    }
    if (!book.available) {
      toast.error("Книга сейчас недоступна.");
      return;
    }
    setPending("borrow");
    try {
      await borrowBook(book._id);
      toast.success("Книга выдана");
      await reload();
      goRead();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(null);
    }
  };

  const handleReturn = async () => {
    if (!book || pending) return;
    setPending("return");
    try {
      await returnBook(book._id);
      toast.success("Книга возвращена");
      await reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(null);
    }
  };

  const startDisabled = pending === "borrow";
  const descriptionParts = splitDescription(book?.description);

  if (loading) {
    return (
      <section className={`${pageStyles.page} ${styles.bookDetailWrap}`}>
        <p className={styles.muted}>Загрузка…</p>
      </section>
    );
  }

  if (error || !book) {
    return (
      <section className={`${pageStyles.page} ${styles.bookDetailWrap}`}>
        <p className={styles.errorText}>{error || "Книга не найдена."}</p>
        <Link to="/" className="button button--primary">
          На главную
        </Link>
      </section>
    );
  }

  return (
    <section className={`${pageStyles.page} ${styles.bookDetailWrap}`}>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <div className={styles.layout}>
        <div className={styles.coverCol}>
          <div className={styles.coverFrame}>
            {book.coverPath ? (
              <img src={getCoverUrl(book._id)} alt="" className={styles.coverImg} />
            ) : (
              <div className={styles.coverPlaceholder} />
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>{book.title || "Книга"}</h1>
            <button
              type="button"
              className={`button button--ghost ${styles.favoriteInline}`}
              onClick={handleFavorite}
              disabled={pending === "fav"}
            >
              {isFavorite ? <IconBookmarkFilled /> : <IconBookmark />}
              <span>{isFavorite ? "В сохранённом" : "Сохранить"}</span>
            </button>
          </div>
          <p className={styles.author}>{book.author || "—"}</p>
          <div className={styles.meta}>
            {book.genre && <span className={styles.badge}>{book.genre}</span>}
            {book.year != null && <span className={styles.year}>{book.year}</span>}
            {book.available === false && !book.borrowedByMe && (
              <span className={styles.unavailable}>Сейчас у другого читателя</span>
            )}
          </div>

          <section className={styles.description}>
            <h2 className={styles.sectionTitle}>О книге</h2>
            {descriptionParts.length ? (
              <div className={styles.descriptionText}>
                {descriptionParts.map((part) => (
                  <p key={part}>{part}</p>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>Описание пока не добавлено.</p>
            )}
          </section>

          <div className={styles.actions}>
            {hasFile && (
              <>
                <button
                  type="button"
                  className={`button button--primary ${styles.startReadingButton}`}
                  onClick={handleStartReading}
                  disabled={startDisabled}
                >
                  {pending === "borrow"
                    ? "Выдаём…"
                    : book.borrowedByMe
                      ? "Читать в приложении"
                      : "Взять и читать"}
                </button>
                {book.borrowedByMe && user && (
                  <button
                    type="button"
                    className="button button--outline"
                    onClick={() =>
                      window.open(
                        getBookReaderUrl(book._id, book.fileType || "pdf"),
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Открыть во вкладке
                  </button>
                )}
              </>
            )}
            {book.borrowedByMe && (
              <button
                type="button"
                className="button button--outline"
                onClick={handleReturn}
                disabled={pending === "return"}
              >
                {pending === "return" ? "…" : "Вернуть книгу"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookDetailPage;
