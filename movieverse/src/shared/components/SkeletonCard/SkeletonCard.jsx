import styles from "./SkeletonCard.module.scss";

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.poster} />
      <div className={styles.title} />
    </div>
  );
}
