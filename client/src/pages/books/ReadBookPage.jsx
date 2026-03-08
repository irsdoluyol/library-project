import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { fetchBookContent } from "../../api/booksApi.js";
import styles from "./ReadBookPage.module.css";

function ReadBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    if (!user || !id) return;

    let objectUrl = null;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchBookContent(id);
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
  }, [user, id]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className={`${styles.readPage} ${styles.loading}`}>
        <p className={styles.errorText}>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.readPage} ${styles.error}`}>
        <p className={styles.errorText}>{error}</p>
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
      className={`${styles.readPage} ${isDark ? styles.dark : ""}`}
      style={{ ["--read-bg"]: bgColor, ["--read-font-size"]: `${fontSize}px`, ["--read-font"]: fontFamily }}
    >
      <header className={styles.toolbar}>
        <button type="button" className={styles.back} onClick={() => navigate("/my-books")}>
          ← Назад к книгам
        </button>
        <div className={styles.settings}>
          <div className={styles.themes}>
            {themes.map((t) => (
              <button
                key={t.color}
                type="button"
                className={`${styles.theme} ${bgColor === t.color ? styles.themeActive : ""}`}
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
              className={styles.color}
            />
          </label>
          <label>
            <span>Размер</span>
            <input
              type="range"
              className={styles.range}
              min="14"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
            <span>{fontSize}</span>
          </label>
          <label>
            <span>Шрифт</span>
            <select className={styles.select} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="Arial, sans-serif">Arial</option>
            </select>
          </label>
        </div>
      </header>

      <main className={styles.content}>
        {content.type === "pdf" ? (
          <iframe src={content.url} title="Книга" className={styles.pdf} />
        ) : (
          <div className={styles.textWrap}>
            <pre className={styles.text}>{content.text}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default ReadBookPage;
