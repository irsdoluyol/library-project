import styles from "./AdminBookForm.module.css";

function AdminBookForm({ form, saving, onChange, onSubmit, onCancel, headingClassName }) {
  return (
    <div className={styles.bookForm}>
      <form className={styles.bookForm__grid} onSubmit={onSubmit}>
        <h2 className={`${styles.bookForm__title} ${headingClassName || ""}`}>
          {form.id ? "Редактировать книгу" : "Добавить книгу"}
        </h2>

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
          <input
            type="text"
            name="genre"
            className={styles.bookForm__input}
            value={form.genre}
            onChange={onChange}
          />
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

        <div className={styles.bookForm__actions}>
          <button
            type="submit"
            className={`button button--primary ${styles.bookForm__submit}`}
            disabled={saving}
          >
            {saving
              ? form.id
                ? "Сохранение..."
                : "Добавление..."
              : form.id
              ? "Сохранить"
              : "Добавить"}
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
