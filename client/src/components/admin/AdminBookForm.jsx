import "../../styles/components/admin/AdminBookForm.css";

function AdminBookForm({ form, saving, onChange, onSubmit, onCancel }) {
  return (
    <form className="auth__form" onSubmit={onSubmit}>
      <h2 className="page__subtitle">
        {form.id ? "Редактировать книгу" : "Добавить книгу"}
      </h2>
      <label className="auth__field">
        <span>Название</span>
        <input
          type="text"
          name="title"
          className="form-input"
          value={form.title}
          onChange={onChange}
          required
        />
      </label>
      <label className="auth__field">
        <span>Автор</span>
        <input
          type="text"
          name="author"
          className="form-input"
          value={form.author}
          onChange={onChange}
          required
        />
      </label>
      <label className="auth__field">
        <span>Жанр</span>
        <input
          type="text"
          name="genre"
          className="form-input"
          value={form.genre}
          onChange={onChange}
        />
      </label>
      <label className="auth__field">
        <span>Год</span>
        <input
          type="number"
          name="year"
          className="form-input"
          value={form.year}
          onChange={onChange}
        />
      </label>
      <label className="auth__field">
        <span>Описание</span>
        <textarea
          name="description"
          className="form-input"
          value={form.description}
          onChange={onChange}
          rows={3}
        />
      </label>
      <div className="auth__actions">
        <button
          type="submit"
          className="button button--primary auth__submit"
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
  );
}

export default AdminBookForm;

