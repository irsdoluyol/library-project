import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchBooks,
  createBook,
  updateBook,
  deleteBook,
  uploadBookFile,
  uploadBookCover,
} from "../api/booksApi.js";

const emptyForm = {
  id: null,
  title: "",
  author: "",
  genre: "",
  year: "",
  description: "",
};

export function useAdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchBooks({ page: 1, limit: 100 });
        if (!cancelled) setBooks(data.books || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const resetForm = () => setForm(emptyForm);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (book) => {
    setForm({
      id: book._id,
      title: book.title || "",
      author: book.author || "",
      genre: book.genre || "",
      year: book.year ? String(book.year) : "",
      description: book.description || "",
    });
  };

  const handleUploadCover = async (id, file) => {
    if (!file) return;
    const ext = (file.name || "").toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].some((e) => ext.endsWith(e))) {
      toast.error("Допустимы только JPG, PNG, WebP");
      return;
    }
    try {
      setError("");
      setSaving(true);
      const { book } = await uploadBookCover(id, file);
      setBooks((prev) => prev.map((b) => (b._id === book._id ? book : b)));
      toast.success("Обложка загружена");
    } catch (err) {
      toast.error(err.message || "Ошибка загрузки обложки");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    const ext = (file.name || "").toLowerCase();
    if (!ext.endsWith(".pdf") && !ext.endsWith(".txt")) {
      toast.error("Допустимы только PDF и TXT файлы");
      return;
    }
    try {
      setError("");
      setSaving(true);
      const { book } = await uploadBookFile(id, file);
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? book : b))
      );
      toast.success("Файл загружен");
    } catch (err) {
      toast.error(err.message || "Ошибка загрузки файла");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить эту книгу?")) return;
    try {
      setSaving(true);
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      if (form.id === id) resetForm();
      toast.success("Книга удалена");
    } catch (err) {
      toast.error(err.message || "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim() || undefined,
      description: form.description.trim() || undefined,
    };
    const year = Number(form.year);
    if (form.year && !Number.isNaN(year)) payload.year = year;

    try {
      if (form.id) {
        const updated = await updateBook(form.id, payload);
        setBooks((prev) =>
          prev.map((b) => (b._id === updated._id ? updated : b))
        );
        toast.success("Книга обновлена");
      } else {
        const created = await createBook(payload);
        setBooks((prev) => [created, ...prev]);
        toast.success("Книга добавлена");
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
