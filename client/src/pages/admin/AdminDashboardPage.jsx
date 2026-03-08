import { useAuth } from "../../context/useAuth.js";
import { useAdminBooks } from "../../hooks/useAdminBooks.js";
import AdminBookForm from "../../components/admin/AdminBookForm.jsx";
import AdminBookList from "../../components/admin/AdminBookList.jsx";
import pageStyles from "../../styles/common/Page.module.css";

function AdminDashboardPage() {
  const { user } = useAuth();
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
  } = useAdminBooks();

  return (
    <section className={pageStyles.page}>
      <h1 className={pageStyles.title}>Панель администратора</h1>
      <p className={pageStyles.text}>
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

      <h2 className={pageStyles.subtitle}>Каталог</h2>
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
