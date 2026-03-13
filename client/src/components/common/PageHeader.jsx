import styles from "./PageHeader.module.css";

/**
 * Общий заголовок страницы: заголовок и описание по центру.
 * Используется в PageWithHeader, AdminDashboardPage и т.д.
 */
function PageHeader({ title, description }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}

export default PageHeader;
