import { Link } from "react-router-dom";
import { TMDB_BASE_IMAGE } from "../../../shared/constants";
import styles from "./PersonCard.module.scss";

export default function PersonCard({ person }) {
  const id = person?.id;
  const name = person?.name ?? "Unknown";
  const profilePath = person?.profile_path;
  const profileUrl = profilePath
    ? `${TMDB_BASE_IMAGE}/w185${profilePath}`
    : null;

  return (
    <Link to={`/person/${id}`} className={styles.card}>
      <div className={styles.avatarWrap}>
        {profileUrl ? (
          <img src={profileUrl} alt={name} className={styles.avatar} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>?</div>
        )}
      </div>
      <p className={styles.name}>{name}</p>
      {person?.known_for_department && (
        <p className={styles.dept}>{person.known_for_department}</p>
      )}
    </Link>
  );
}
