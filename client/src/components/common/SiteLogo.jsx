import styles from "./SiteLogo.module.css";

/**
 * Компактная марка: полка и корешки книг (геометрия без декора).
 */
function SiteLogo({ className = "" }) {
  const rootClass = `${styles.root} ${className}`.trim();

  return (
    <svg
      className={rootClass}
      viewBox="0 0 76 26"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      {/* полка */}
      <rect x="2" y="22" width="72" height="3" rx="1" fill="#45161C" />
      {/* корешки: разная высота и ширина */}
      <rect x="6" y="10" width="9" height="12" rx="1" fill="#45161C" />
      <rect x="16" y="6" width="7" height="16" rx="1" fill="#5c1f28" />
      <rect x="24" y="11" width="11" height="11" rx="1" fill="#c45c3e" />
      <rect x="36" y="7" width="8" height="15" rx="1" fill="#45161C" />
      <rect x="45" y="9" width="10" height="13" rx="1" fill="#DDBEC3" stroke="#45161C" strokeWidth="0.75" />
      <rect x="57" y="12" width="8" height="10" rx="1" fill="#5c1f28" />
      {/* тонкие блики на корешках */}
      <line x1="10.5" y1="12" x2="10.5" y2="19" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
      <line x1="19.5" y1="8" x2="19.5" y2="19" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />
      <line x1="29.5" y1="13" x2="29.5" y2="19" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
      <line x1="50" y1="11" x2="50" y2="19" stroke="rgba(69,22,28,0.2)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export default SiteLogo;
