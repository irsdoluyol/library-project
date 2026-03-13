import { useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth.js";
import { useAdminBooks } from "../../hooks/useAdminBooks.js";
import AdminBookForm from "../../components/admin/AdminBookForm.jsx";
import AdminBookList from "../../components/admin/AdminBookList.jsx";
import pageStyles from "../../styles/common/Page.module.css";
import styles from "./AdminDashboardPage.module.css";

const BOOKS_PER_PAGE = 6;

function AdminDashboardPage() {
  useAuth(); // для проверки авторизации
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
    handleUploadCover,
    handleSubmit,
  } = useAdminBooks();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return books;
    const q = search.trim().toLowerCase();
    return books.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.genre || "").toLowerCase().includes(q)
    );
  }, [books, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * BOOKS_PER_PAGE;
    return filteredBooks.slice(start, start + BOOKS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  return (
    <section className={`${pageStyles.page} ${styles.adminPage}`}>
      <div className={styles.formSection}>
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
          headingClassName={styles.adminSectionHeading}
        />
      </div>

      <div className={styles.catalogSection}>
        <div className={styles.catalogInner}>
          <h2 className={`${styles.adminSectionHeading} ${styles.catalogHeading}`}>Каталог</h2>
          <AdminBookList
            books={paginatedBooks}
            totalCount={filteredBooks.length}
            loading={loading}
            saving={saving}
            search={search}
            onSearchChange={setSearch}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpload={handleUpload}
            onUploadCover={handleUploadCover}
          />
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
