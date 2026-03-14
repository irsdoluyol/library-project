import styles from "./PageHeader.module.css";

function PageHeader({ title, description }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}

export default PageHeader;
