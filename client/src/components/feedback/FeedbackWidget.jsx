import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth.js";
import { createRequest } from "../../api/requestsApi.js";
import { IconMessageCircle } from "../common/Icons.jsx";
import styles from "./FeedbackWidget.module.css";

function FeedbackWidget() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const s = subject.trim();
    const m = message.trim();
    if (!s || s.length < 2) {
      toast.error("Тема — не менее 2 символов");
      return;
    }
    if (!m || m.length < 5) {
      toast.error("Сообщение — не менее 5 символов");
      return;
    }
    setSubmitting(true);
    try {
      await createRequest({ subject: s, message: m });
      setSubject("");
      setMessage("");
      toast.success("Обращение отправлено");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.widget} ref={panelRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setExpanded((v) => !v)}
        title="Обратная связь"
        aria-expanded={expanded}
        aria-label={expanded ? "Свернуть форму обратной связи" : "Написать обращение"}
      >
        <IconMessageCircle />
      </button>

      {expanded && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Написать обращение</span>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              className={styles.input}
              placeholder="Тема"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
            <textarea
              className={styles.textarea}
              placeholder="Сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <button
              type="submit"
              className={styles.submit}
              disabled={submitting}
            >
              {submitting ? "Отправка..." : "Отправить"}
            </button>
          </form>
          <Link to="/my-requests" className={styles.link} onClick={() => setExpanded(false)}>
            Все обращения →
          </Link>
        </div>
      )}
    </div>
  );
}

export default FeedbackWidget;
