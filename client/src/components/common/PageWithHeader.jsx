import pageStyles from "../../styles/common/Page.module.css";
import PageHeader from "./PageHeader.jsx";

/**
 * Обёртка страницы с заголовком и описанием.
 * Используется на страницах: Мои книги, Мои обращения, Обращения пользователей и т.д.
 */
function PageWithHeader({ title, description, children, className = "" }) {
  return (
    <section className={`${pageStyles.page} ${className}`.trim()}>
      <PageHeader title={title} description={description} />
      {children}
    </section>
  );
}

export default PageWithHeader;
