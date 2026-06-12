import styles from "./BrandTitle.module.css";

/**
 * Название бренда: Im. Library (header или footer).
 * @param {"header" | "footer"} variant
 */
function BrandTitle({ variant = "header", className = "" }) {
  const root = `${styles.root} ${styles[`root_${variant}`]} ${className}`.trim();

  return (
    <span className={root}>
      <span className={styles.prefix}>Im.</span>
      <span className={styles.word}>Library</span>
    </span>
  );
}

export default BrandTitle;
