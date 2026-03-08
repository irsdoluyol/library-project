import pageStyles from "../../styles/common/Page.module.css";
import styles from "./AuthCard.module.css";

/**
 * Обёртка-карточка для страниц Login и Register.
 */
function AuthCard({ title, description, children }) {
  return (
    <section className={styles.auth}>
      <div className={styles.card}>
        <h1 className={pageStyles.title}>{title}</h1>
        {description && <p className={pageStyles.text}>{description}</p>}
        {children}
      </div>
    </section>
  );
}

export default AuthCard;
