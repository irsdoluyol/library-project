import styles from "./SectionHeading.module.css";

function SectionHeading({ children, align = "left", as: Tag = "h2", className = "" }) {
  const classes = [
    styles.sectionHeading,
    align === "center" ? styles["sectionHeading--center"] : "",
    className
  ].filter(Boolean).join(" ");
  return <Tag className={classes}>{children}</Tag>;
}

export default SectionHeading;
