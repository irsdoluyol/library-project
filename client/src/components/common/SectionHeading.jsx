import styles from "./SectionHeading.module.css";

function SectionHeading({ children, align = "left", as = "h2", className = "" }) {
  const HeadingTag = as;
  const classes = [
    styles.sectionHeading,
    align === "center" ? styles["sectionHeading--center"] : "",
    className
  ].filter(Boolean).join(" ");
  return <HeadingTag className={classes}>{children}</HeadingTag>;
}

export default SectionHeading;
