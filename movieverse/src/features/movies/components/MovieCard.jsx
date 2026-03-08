import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { TMDB_BASE_IMAGE } from "../../../shared/constants";
import PlaceholderPoster from "../../../shared/components/PlaceholderPoster";
import styles from "./MovieCard.module.scss";

function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function MovieCard({ item, type = "movie" }) {
  const id = item?.id ?? item?.tmdbId;
  const title = item?.title ?? item?.name ?? "Untitled";
  const posterPath = item?.poster_path ?? item?.poster;
  const posterUrl = posterPath
    ? (String(posterPath).startsWith("http") ? posterPath : `${TMDB_BASE_IMAGE}/w342${posterPath}`)
    : null;
  const path = type === "tv" ? `/tv/${id}` : `/movie/${id}`;

  const { items: favorites } = useSelector((state) => state.favorites);
  const isFavorite = favorites?.some(
    (f) => String(f.tmdbId) === String(id) && f.type === type
  );

  const rating = item?.vote_average != null ? Number(item.vote_average).toFixed(1) : null;

  return (
    <Link to={path} className={styles.card} state={{ type }}>
      <div className={styles.posterWrap}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className={styles.poster}
            loading="lazy"
          />
        ) : (
          <PlaceholderPoster className={styles.posterFill} />
        )}
        {isFavorite && (
          <span className={styles.favoriteBadge} title="In your favorites">
            <HeartIcon className={styles.favoriteIcon} />
          </span>
        )}
        {rating != null && (
          <span className={styles.rating} title="Rating">
            ★ {rating}
          </span>
        )}
      </div>
      <p className={styles.title}>{title}</p>
    </Link>
  );
}
