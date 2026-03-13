import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ChevronLeftIcon from "../../assets/icons/ChevronLeftIcon.jsx";
import ChevronRightIcon from "../../assets/icons/ChevronRightIcon.jsx";
import styles from "./HeroCarousel.module.css";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=450&fit=crop",
    title: "Тысячи книг",
    text: "Изучайте каталог и находите любимые произведения",
    to: "/",
  },
  {
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop",
    title: "Новые поступления",
    text: "Следите за обновлениями каталога",
    to: "/",
  },
  {
    image: "https://images.unsplash.com/photo-1768081377923-ea0c5756ff51?w=800&h=450&fit=crop",
    title: "Все жанры",
    text: "От классики до современной прозы",
    to: "/",
  },
  {
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=450&fit=crop",
    title: "Книжные полки",
    text: "Огромный выбор для каждого читателя",
    to: "/",
  },
  {
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=450&fit=crop",
    title: "Классика и современность",
    text: "От древних манускриптов до новинок",
    to: "/",
  },
];

function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.plugins()?.autoplay?.play();
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className={styles.carousel}>
      <div className={styles.viewportWrap}>
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.container}>
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={styles.slide}
              onClick={() => scrollTo(i)}
            >
              <div className={styles.slideImage} style={{ backgroundImage: `url(${slide.image})` }} />
              <div className={styles.slideContent}>
                <h2 className={styles.slideTitle}>{slide.title}</h2>
                <p className={styles.slideText}>{slide.text}</p>
                <Link to={slide.to} className={`button ${styles.slideBtn}`} onClick={(e) => e.stopPropagation()}>
                  Читать <span className={styles.btnArrow} aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        </div>
        <div className={styles.nav}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={scrollPrev}
          aria-label="Предыдущий слайд"
        >
          <ChevronLeftIcon width={12} height={12} />
        </button>

        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === selectedIndex ? styles.dotActive : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`Слайд ${i + 1}`}
              aria-current={i === selectedIndex ? "true" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.navBtn}
          onClick={scrollNext}
          aria-label="Следующий слайд"
        >
          <ChevronRightIcon width={12} height={12} />
        </button>
        </div>
      </div>
    </div>
  );
}

export default HeroCarousel;
