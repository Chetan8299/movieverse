import styles from "./PlaceholderPoster.module.scss";

export default function PlaceholderPoster({ className }) {
  return (
    <div className={`${styles.placeholder} ${className ?? ""}`.trim()}>
      No poster
    </div>
  );
}
