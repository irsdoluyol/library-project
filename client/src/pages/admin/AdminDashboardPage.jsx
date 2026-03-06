import { useAuth } from "../../context/useAuth.js";
import { useAdminBooks } from "../../hooks/useAdminBooks.js";
import AdminBookForm from "../../components/admin/AdminBookForm.jsx";
import AdminBookList from "../../components/admin/AdminBookList.jsx";

function AdminDashboardPage() {
  const { token } = useAuth();
  const {
    books,
    loading,
    error,
    form,
    saving,
    resetForm,
    handleFormChange,
    handleEdit,
    handleDelete,
    handleUpload,
    handleSubmit,
  } = useAdminBooks(token);

  return (
    <section className="page">
      <h1 className="page__title">Панель администратора</h1>
      <p className="page__text">
        Управление каталогом: добавление, редактирование и удаление книг.
      </p>

      {error && <p className="auth__error">{error}</p>}

      <AdminBookForm
        form={form}
        saving={saving}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      <h2 className="page__subtitle">Каталог</h2>
      <AdminBookList
        books={books}
        loading={loading}
        saving={saving}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpload={handleUpload}
      />
    </section>
  );
}

export default AdminDashboardPage;
