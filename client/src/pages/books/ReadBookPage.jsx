import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { fetchBookContent } from "../../api/booksApi.js";
import "../../styles/pages/books/ReadBookPage.css";

function ReadBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bgColor, setBgColor] = useState("#f5f0e8");
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Georgia, serif");

  const themes = [
    { name: "Сепия", color: "#f5f0e8" },
    { name: "Белый", color: "#ffffff" },
    { name: "Крем", color: "#fff8f0" },
    { name: "Тёмный", color: "#2d2a32" },
  ];

  useEffect(() => {
    if (!token || !id) return;

    let objectUrl = null;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchBookContent(token, id);
        if (result.type === "pdf") {
          objectUrl = URL.createObjectURL(result.blob);
          setContent({ type: "pdf", url: objectUrl });
        } else {
          setContent({ type: "txt", text: result.content });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, id]);

  if (!token) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="read-page read-page--loading">
        <p className="page__text">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="read-page read-page--error">
        <p className="auth__error">{error}</p>
        <button type="button" className="button button--primary" onClick={() => navigate("/my-books")}>
          Назад к моим книгам
        </button>
      </div>
    );
  }

  if (!content) return null;

  const isDark = bgColor === "#2d2a32";

  return (
    <div
      className={`read-page ${isDark ? "read-page--dark" : ""}`}
      style={{ ["--read-bg"]: bgColor, ["--read-font-size"]: `${fontSize}px`, ["--read-font"]: fontFamily }}
    >
      <header className="read-page__toolbar">
        <button type="button" className="read-page__back" onClick={() => navigate("/my-books")}>
          ← Назад к книгам
        </button>
        <div className="read-page__settings">
          <div className="read-page__themes">
            {themes.map((t) => (
              <button
                key={t.color}
                type="button"
                className={`read-page__theme ${bgColor === t.color ? "read-page__theme--active" : ""}`}
                style={{ background: t.color }}
                onClick={() => setBgColor(t.color)}
                title={t.name}
              />
            ))}
          </div>
          <label>
            <span>Свой</span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="read-page__color"
            />
          </label>
          <label>
            <span>Размер</span>
            <input
              type="range"
              className="read-page__range"
              min="14"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
            <span>{fontSize}</span>
          </label>
          <label>
            <span>Шрифт</span>
            <select className="read-page__select" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="Arial, sans-serif">Arial</option>
            </select>
          </label>
        </div>
      </header>

      <main className="read-page__content">
        {content.type === "pdf" ? (
          <iframe src={content.url} title="Книга" className="read-page__pdf" />
        ) : (
          <div className="read-page__text-wrap">
            <pre className="read-page__text">{content.text}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default ReadBookPage;
