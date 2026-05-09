import { useRef } from "react";
import SectionHeading from "../common/SectionHeading.jsx";
import { CATALOG_GENRE_OPTIONS } from "../catalog/catalogGenreOptions.js";
import uploadStyles from "./adminUploadTrigger.module.css";
import styles from "./AdminBookForm.module.css";

function AdminBookForm({
  form,
  saving,
  onChange,
  onSubmit,
  onCancel,
  onUpload,
  pendingBookFileLabel,
  onSelectPendingBookFile,
}) {
  const formRef = useRef(null);

  const genreOptions = CATALOG_GENRE_OPTIONS.filter((opt) => opt.value);
  const hasCustomGenre = Boolean(form.genre) && !genreOptions.some((opt) => opt.value === form.genre);

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!saving) formRef.current?.requestSubmit();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (form.id && onUpload) onUpload(form.id, file);
    else if (!form.id && onSelectPendingBookFile) onSelectPendingBookFile(file);
    event.target.value = "";
  };

  return (
    <div className={styles.bookForm}>
      <form ref={formRef} className={styles.bookForm__grid} onSubmit={onSubmit} onKeyDown={handleKeyDown}>
        <SectionHeading as="h2" className={styles.bookForm__title}>
          {form.id ? "Редактировать книгу" : "Добавить книгу"}
        </SectionHeading>

        <label className={styles.bookForm__field}>
          <span className={styles.bookForm__label}>Название</span>
          <input
            type="text"
            name="title"
            className={styles.bookForm__input}
            value={form.title}
            onChange={onChange}
            required
          />
        </label>

        <label className={styles.bookForm__field}>
          <span className={styles.bookForm__label}>Автор</span>
          <input
            type="text"
            name="author"
            className={styles.bookForm__input}
            value={form.author}
            onChange={onChange}
            required
          />
        </label>

        <label className={styles.bookForm__field}>
          <span className={styles.bookForm__label}>Жанр</span>
          <select
            name="genre"
            className={styles.bookForm__input}
            value={form.genre}
            onChange={onChange}
          >
            <option value="">Без жанра</option>
            {genreOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {hasCustomGenre && <option value={form.genre}>{form.genre}</option>}
          </select>
        </label>

        <label className={styles.bookForm__field}>
          <span className={styles.bookForm__label}>Год</span>
          <input
            type="number"
            name="year"
            className={styles.bookForm__input}
            value={form.year}
            onChange={onChange}
          />
        </label>

        <label className={styles.bookForm__field}>
          <span className={styles.bookForm__label}>Описание</span>
          <textarea
            name="description"
            className={`${styles.bookForm__input} ${styles["bookForm__input--textarea"]}`}
            value={form.description}
            onChange={onChange}
            rows={6}
          />
        </label>

        <div className={`${styles.bookForm__field} ${styles.bookForm__fieldWide}`}>
          <span className={styles.bookForm__label}>Файл книги</span>
          {!form.id && (
            <p className={styles.bookForm__fileHint}>
              Формат: PDF или TXT. Можно выбрать сейчас — загрузка на сервер сразу после сохранения карточки.
            </p>
          )}
          <div className={styles.bookForm__fileRow}>
            <label
              className={`${uploadStyles.uploadTrigger} ${saving ? uploadStyles.uploadTriggerDisabled : ""}`}
            >
              <span className={uploadStyles.uploadTriggerCaption}>
                {!form.id
                  ? pendingBookFileLabel
                    ? "Выбрать другой файл"
                    : "Выбрать файл"
                  : "Загрузить или заменить файл"}
              </span>
              <input
                type="file"
                accept=".pdf,.txt"
                className={uploadStyles.uploadTriggerInput}
                onChange={handleFileChange}
                disabled={saving}
              />
            </label>
          </div>
          {!form.id && pendingBookFileLabel && (
            <span className={styles.bookForm__pendingFile}>Выбрано: {pendingBookFileLabel}</span>
          )}
        </div>

        <div className={styles.bookForm__actions}>
          <button
            type="submit"
            className="button button--primary button--submit"
            disabled={saving}
          >
            {saving
              ? form.id
                ? "Сохранение..."
                : "Добавление..."
              : form.id
              ? "Сохранить изменения"
              : "Добавить книгу"}
          </button>
          {form.id && (
            <button
              type="button"
              className="button button--ghost"
              onClick={onCancel}
              disabled={saving}
            >
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AdminBookForm;
