import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RiHeartFill, RiStarFill } from "react-icons/ri";
import { TMDB_BASE_IMAGE } from "../../../shared/constants";
import PlaceholderPoster from "../../../shared/components/PlaceholderPoster";
import styles from "./MovieCard.module.scss";

const truncate = (str, max = 100) => {
  if (!str || typeof str !== "string") return "";
  return str.length <= max ? str : str.slice(0, max).trim() + "…";
};

export default function MovieCard({ item, type = "movie" }) {
  const id = item?.id ?? item?.tmdbId;
  const title = item?.title ?? item?.name ?? "Untitled";
  const posterPath = item?.poster_path ?? item?.poster;
  const posterUrl = posterPath
    ? (String(posterPath).startsWith("http") ? posterPath : `${TMDB_BASE_IMAGE}/w342${posterPath}`)
    : null;
  const path = type === "tv" ? `/tv/${id}` : `/movie/${id}`;
  const overview = item?.overview ? truncate(item.overview, 120) : "";

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
            <RiHeartFill className={styles.favoriteIcon} />
          </span>
        )}
        {rating != null && (
          <span className={styles.rating} title="Rating">
            <RiStarFill size={12} /> {rating}
          </span>
        )}
        <div className={styles.hoverDetail}>
          <span className={styles.hoverTitle}>{title}</span>
          {rating != null && (
            <span className={styles.hoverMeta}><RiStarFill size={12} /> {rating}</span>
          )}
          {overview && (
            <p className={styles.hoverOverview}>{overview}</p>
          )}
          <span className={styles.hoverCta}>Details →</span>
        </div>
      </div>
      {/* <p className={styles.title}>{title}</p> */}
    </Link>
  );
}
