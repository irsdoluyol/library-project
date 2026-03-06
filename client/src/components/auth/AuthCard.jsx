import "../../styles/components/auth/AuthCard.css";

/**
 * Обёртка-карточка для страниц Login и Register.
 */
function AuthCard({ title, description, children }) {
  return (
    <section className="auth">
      <div className="auth__card">
        <h1 className="page__title">{title}</h1>
        {description && <p className="page__text">{description}</p>}
        {children}
      </div>
    </section>
  );
}

export default AuthCard;
