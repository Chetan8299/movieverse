import { useRef, Children } from "react";
import styles from "./Carousel.module.scss";

export default function Carousel({ title, children, className = "" }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section className={`${styles.carouselSection} ${className}`}>
      {title && <h2 className={styles.carouselTitle}>{title}</h2>}
      <div className={styles.carouselWrap}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          ‹
        </button>
        <div ref={scrollRef} className={styles.track}>
          {Children.map(children, (child, i) => (
            <div key={i} className={styles.item}>
              {child}
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
}
