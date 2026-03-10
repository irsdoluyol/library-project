import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import styles from "./Footer.module.css";

const QUOTES = [
  { text: "Книга — мечта, которую держишь в руках.", author: "Нил Гейман" },
  { text: "Чтение — это беседа с мудрейшими людьми.", author: "Рене Декарт" },
  { text: "Дом без книг — как тело без души.", author: "Цицерон" },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function Footer() {
  const [giftRevealed, setGiftRevealed] = useState(false);
  const quote = useMemo(() => randomItem(QUOTES), []);

  const handleGift = () => {
    const scalar = 2.8;
    const unicorn = confetti.shapeFromText({ text: "🦄", scalar });
    const confettiOpts = {
      shapes: [unicorn],
      scalar,
      particleCount: 70,
      spread: 70,
      origin: { y: 0.8 },
    };
    confetti(confettiOpts);
    setTimeout(() => {
      confetti({
        ...confettiOpts,
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      });
    }, 150);
    setTimeout(() => {
      confetti({
        ...confettiOpts,
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      });
    }, 300);
    setGiftRevealed(true);
  };

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={`${styles.block} ${styles.blockQuote}`}>
            <h4 className={styles.blockTitle}>Цитата</h4>
            <blockquote className={styles.quote}>
              «{quote.text}» — {quote.author}
            </blockquote>
          </div>
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Поймай подарок</h4>
            {giftRevealed ? (
              <p className={styles.giftReveal}>
                🎁 Ты прочитаешь на 10% быстрее в этом месяце!
              </p>
            ) : (
              <button
                type="button"
                className={styles.giftBtn}
                onClick={handleGift}
              >
                🎁 Открыть
              </button>
            )}
          </div>
        </div>

        <div className={styles.contacts}>
          <h4 className={styles.blockTitle}>Контакты</h4>
          <div className={styles.contactsRow}>
            <a
              href="https://instagram.com/library"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a
              href="https://t.me/library"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
              aria-label="Telegram"
            >
              Telegram
            </a>
            <a href="tel:+79001234567" className={styles.contactLink}>
              +7 (900) 123-45-67
            </a>
            <a href="mailto:library@example.ru" className={styles.contactLink}>
              library@example.ru
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <Link to="/" className={styles.brand}>
            Онлайн-библиотека
          </Link>
          <span className={styles.copyright}>© {year}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
