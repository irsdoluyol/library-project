import pageStyles from "../../styles/common/Page.module.css";

/**
 * Состояние контента: ошибка, загрузка, пусто или дети.
 * Меняешь текст — меняется везде.
 */
function ContentState({
  loading,
  error,
  isEmpty,
  loadingText = "Загрузка...",
  emptyText = "Нет данных.",
  emptyClassName,
  children,
}) {
  if (error) return <p className={pageStyles.text}>{error}</p>;
  if (loading) return <p className={pageStyles.text}>{loadingText}</p>;
  if (isEmpty) {
    return (
      <p className={`${pageStyles.text} ${emptyClassName || ""}`.trim()}>
        {emptyText}
      </p>
    );
  }
  return children;
}

export default ContentState;
