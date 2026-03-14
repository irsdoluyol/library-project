import pageStyles from "../../styles/common/Page.module.css";
import PageHeader from "./PageHeader.jsx";

function PageWithHeader({ title, description, children, className = "" }) {
  return (
    <section className={`${pageStyles.page} ${className}`.trim()}>
      <PageHeader title={title} description={description} />
      {children}
    </section>
  );
}

export default PageWithHeader;
