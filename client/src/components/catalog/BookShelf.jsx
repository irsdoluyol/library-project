import { useRef, useEffect } from "react";
import SectionHeading from "../common/SectionHeading.jsx";
import ChevronLeftIcon from "../../assets/icons/ChevronLeftIcon.jsx";
import ChevronRightIcon from "../../assets/icons/ChevronRightIcon.jsx";
import shelfStyles from "../../styles/pages/catalog/Shelf.module.css";

const SCROLL_STEP = 165;

function BookShelf({ title, loading = false, isEmpty = false, emptyText = "Книги не найдены.", error = "", placeholderCount = 4, children }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const blockWheel = (e) => e.preventDefault();
    el.addEventListener("wheel", blockWheel, { passive: false });
    return () => el.removeEventListener("wheel", blockWheel);
  }, [loading, isEmpty]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
  };

  return (
    <section className={shelfStyles.shelf}>
      {title && <SectionHeading align="center">{title}</SectionHeading>}
      {error && !isEmpty && <p className={shelfStyles.errorText}>{error}</p>}
      {loading ? (
        <div className={shelfStyles.shelfScroll}>
          <button type="button" className={shelfStyles.arrow} onClick={scrollLeft} aria-label="Листать влево">
            <ChevronLeftIcon width={20} height={20} />
          </button>
          <div className={shelfStyles.listWrap}>
            <div className={shelfStyles.listScroll}>
              {Array.from({ length: placeholderCount }).map((_, i) => (
                <div key={i} className={`${shelfStyles.book} ${shelfStyles.bookPlaceholder}`} />
              ))}
            </div>
          </div>
          <button type="button" className={`${shelfStyles.arrow} ${shelfStyles.arrowRight}`} onClick={scrollRight} aria-label="Листать вправо">
            <ChevronRightIcon width={20} height={20} />
          </button>
        </div>
      ) : isEmpty ? (
        <div className={shelfStyles.emptyState}>
          <p className={shelfStyles.emptyText}>{emptyText || "Книги не найдены."}</p>
        </div>
      ) : (
        <div className={shelfStyles.shelfScroll}>
          <button type="button" className={shelfStyles.arrow} onClick={scrollLeft} aria-label="Листать влево">
            <ChevronLeftIcon width={20} height={20} />
          </button>
          <div className={shelfStyles.listWrap}>
            <div className={shelfStyles.listScroll} ref={scrollRef}>
              {children}
            </div>
          </div>
          <button type="button" className={`${shelfStyles.arrow} ${shelfStyles.arrowRight}`} onClick={scrollRight} aria-label="Листать вправо">
            <ChevronRightIcon width={20} height={20} />
          </button>
        </div>
      )}
    </section>
  );
}

export default BookShelf;
