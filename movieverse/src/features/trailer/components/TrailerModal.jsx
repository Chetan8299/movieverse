import { useEffect } from "react";
import { DEFAULT_TRAILER_MSG } from "../../../shared/constants";
import styles from "./TrailerModal.module.scss";

export default function TrailerModal({ isOpen, onClose, youtubeKey }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = youtubeKey
    ? `https://www.youtube.com/embed/${youtubeKey}?autoplay=1`
    : null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        {embedUrl ? (
          <iframe
            title="Trailer"
            src={embedUrl}
            className={styles.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p className={styles.unavailable}>{DEFAULT_TRAILER_MSG}</p>
        )}
      </div>
    </div>
  );
}
