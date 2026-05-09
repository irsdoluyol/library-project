import styles from "./UserMonogram.module.css";

function UserMonogram({ value, title, className = "" }) {
  const letter = String(value || "?").trim().charAt(0).toUpperCase() || "?";
  const cls = className ? `${styles.monogram} ${className}` : styles.monogram;
  return (
    <div className={cls} title={title}>
      {letter}
    </div>
  );
}

export default UserMonogram;
