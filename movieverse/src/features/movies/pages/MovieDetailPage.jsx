import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RiCalendarLine, RiTimeLine, RiHeartFill, RiHeartLine } from "react-icons/ri";
import { useTmdbApi } from "../hooks/useTmdbApi";
import { apiClient } from "../../../shared/api";
import { addWatchHistory } from "../../watchHistory/state/watchHistorySlice";
import { addFavorite, removeFavorite, fetchFavorites } from "../../favorites/state/favoritesSlice";
import { TMDB_BASE_IMAGE, DEFAULT_DESCRIPTION } from "../../../shared/constants";
import PlaceholderPoster from "../../../shared/components/PlaceholderPoster";
import TrailerModal from "../../trailer/components/TrailerModal";
import Button from "../../../shared/components/Button/Button";
import Loader from "../../../shared/components/Loader/Loader";
import styles from "./MovieDetailPage.module.scss";

const isCustomId = (id) => typeof id === "string" && id.startsWith("custom-");
const DEFAULT_CAST_COUNT = 8;

export default function MovieDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isTv = location.pathname.startsWith("/tv/");
  const type = isTv ? "tv" : "movie";

  const { getMovie, getTv, getMovieVideos, getTvVideos, getMovieCredits, getTvCredits } = useTmdbApi();
  const { items: favorites } = useSelector((state) => state.favorites);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [detail, setDetail] = useState(null);
  const [videos, setVideos] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);

  const isFavorite = favorites?.some(
    (f) => String(f.tmdbId) === String(id) && f.type === type
  );

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        if (isCustomId(id)) {
          const { data } = await apiClient.get(`/movies/tmdb/${id}`);
          if (cancelled) return;
          const custom = data && typeof data === "object" ? data : null;
          const genresList = Array.isArray(custom.genres) && custom.genres.length > 0
            ? custom.genres.map((name) => ({ name }))
            : (custom.genre ? [{ name: custom.genre }] : []);
          setDetail(
            custom
              ? {
                  title: custom.title,
                  name: custom.title,
                  poster_path: custom.poster || null,
                  backdrop_path: custom.banner || null,
                  overview: custom.description || DEFAULT_DESCRIPTION,
                  release_date: custom.releaseDate || "",
                  first_air_date: custom.releaseDate || "",
                  vote_average: null,
                  runtime: custom.runtime != null ? Number(custom.runtime) : null,
                  genre: custom.genre || "",
                  genres: genresList,
                  category: custom.category || "movie",
                }
              : null
          );
          setVideos(
            custom?.trailer
              ? [{ key: (custom.trailer.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] || custom.trailer), site: "YouTube", type: "Trailer" }]
              : []
          );
          setCredits(null);
        } else {
          const [data, vidData, credData] = await Promise.all([
            isTv ? getTv(id) : getMovie(id),
            isTv ? getTvVideos(id) : getMovieVideos(id),
            isTv ? getTvCredits(id) : getMovieCredits(id),
          ]);
          if (!cancelled) {
            setDetail(data && typeof data === "object" ? data : null);
            setVideos(Array.isArray(vidData) ? vidData : []);
            setCredits(credData && typeof credData === "object" ? credData : null);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [id, isTv, getMovie, getTv, getMovieVideos, getTvVideos, getMovieCredits, getTvCredits]);

  useEffect(() => {
    if (!detail || !isAuthenticated) return;
    dispatch(
      addWatchHistory({
        tmdbId: String(id),
        type,
        title: detail.title ?? detail.name,
        poster: detail.poster_path ?? "",
        overview: detail.overview ?? "",
      })
    );
  }, [id, type, detail, isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFavorites());
  }, [isAuthenticated, dispatch]);

  const trailerKey = videos.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  )?.key;

  const posterPath = detail?.poster_path;
  const posterUrl = posterPath
    ? (posterPath.startsWith("http") ? posterPath : `${TMDB_BASE_IMAGE}/w342${posterPath}`)
    : null;
  const backdropPath = detail?.backdrop_path;
  const backdropUrl = backdropPath
    ? (backdropPath.startsWith("http") ? backdropPath : `${TMDB_BASE_IMAGE}/w1280${backdropPath}`)
    : null;

  const title = detail?.title ?? detail?.name ?? "Untitled";
  const overview = detail?.overview || DEFAULT_DESCRIPTION;
  const releaseDate = detail?.release_date ?? detail?.first_air_date ?? "";
  const rating = detail?.vote_average != null ? Number(detail.vote_average).toFixed(1) : null;
  const runtime = detail?.runtime ?? (Array.isArray(detail?.episode_run_time) && detail.episode_run_time[0] ? detail.episode_run_time[0] : null);

  const categoryLabel =
    detail?.category === "tv" ? "TV Show" : (detail?.category === "movie" ? "Movie" : (type === "tv" ? "TV Show" : "Movie"));
  const genreLabel =
    detail?.genre ||
    (Array.isArray(detail?.genres) && detail.genres.length > 0
      ? detail.genres.map((g) => g.name).join(", ")
      : "");
  const genreTags = Array.isArray(detail?.genres) && detail.genres.length > 0
    ? detail.genres
    : (detail?.genre ? [{ name: detail.genre }] : []);

  const cast = credits?.cast ?? [];
  const displayCast = showAllCast ? cast : cast.slice(0, DEFAULT_CAST_COUNT);
  const hasMoreCast = cast.length > DEFAULT_CAST_COUNT;

  const handleFav = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isFavorite) {
      dispatch(removeFavorite({ tmdbId: String(id), type }));
    } else {
      dispatch(
        addFavorite({
          tmdbId: String(id),
          type,
          title,
          poster: posterPath ?? "",
          overview: detail?.overview ?? "",
        })
      );
    }
  };

  if (loading && !detail) return <Loader />;
  if (error) {
    return (
      <div className={styles.page}>
        <p style={{ color: "var(--color-link)" }}>{error}</p>
        <button type="button" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }
  if (!detail) return null;

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <section className={styles.hero} style={backdropUrl ? { backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 100%), url(${backdropUrl})` } : undefined}>
        <div className={`${styles.heroContent} ${cast.length === 0 ? styles.noCast : ""}`}>
          <div className={styles.posterCol}>
            <div className={styles.posterWrap}>
              {posterUrl ? (
                <img src={posterUrl} alt={title} className={styles.poster} />
              ) : (
                <PlaceholderPoster className={styles.posterFill} />
              )}
              {rating != null && (
                <span className={styles.ratingBadge} title="Rating">
                  {rating}
                </span>
              )}
            </div>
            <span className={styles.badge}>Movieverse</span>
          </div>

          <div className={styles.detailCol}>
            <h1 className={styles.title}>{title.toUpperCase()}</h1>
            <div className={styles.metaRow}>
              {releaseDate && (
                <span className={styles.meta}>
                  <RiCalendarLine className={styles.metaIcon} size={16} aria-hidden />
                  {isTv ? "First air" : "Release"}: {releaseDate}
                </span>
              )}
              {runtime != null && (
                <span className={styles.meta}>
                  <RiTimeLine className={styles.metaIcon} size={16} aria-hidden />
                  {runtime} min
                </span>
              )}
            </div>
            {genreTags.length > 0 && (
              <div className={styles.genreTags}>
                {genreTags.map((g) => (
                  <span key={g.id ?? g.name} className={styles.genreTag}>{g.name}</span>
                ))}
              </div>
            )}
            {(categoryLabel || genreLabel) && !genreTags.length && (
              <p className={styles.metaLine}>
                {categoryLabel}
                {genreLabel && ` · ${genreLabel}`}
              </p>
            )}
            <p className={styles.overview}>{overview}</p>
            <div className={styles.actions}>
              <Button variant="primary" className={styles.actionBtn} onClick={() => setTrailerOpen(true)}>
                ▶ Play Trailer
              </Button>
              <Button variant="secondary" className={`${styles.actionBtn} ${styles.favoriteBtn}`} onClick={handleFav}>
                {isFavorite ? <><RiHeartFill size={18} /> In Favorites</> : <><RiHeartLine size={18} /> Favorite</>}
              </Button>
            </div>
          </div>

          {(cast.length > 0) && (
            <aside className={styles.castCol}>
              <h2 className={styles.castTitle}>Casts & Credits</h2>
              <ul className={styles.castList}>
                {displayCast.map((c) => (
                  <li key={c.id ?? c.name} className={styles.castItem}>
                    <div className={styles.castPhoto}>
                      {c.profile_path ? (
                        <img src={`${TMDB_BASE_IMAGE}/w185${c.profile_path}`} alt="" />
                      ) : (
                        <div className={styles.castPlaceholder} />
                      )}
                    </div>
                    <div className={styles.castInfo}>
                      <span className={styles.castName}>{c.name}</span>
                      {c.character && <span className={styles.castChar}>{c.character}</span>}
                    </div>
                  </li>
                ))}
              </ul>
              {hasMoreCast && !showAllCast && (
                <button type="button" className={styles.showAllCast} onClick={() => setShowAllCast(true)}>
                  Show all
                </button>
              )}
            </aside>
          )}
        </div>
      </section>

      {trailerKey && (
        <section className={styles.trailerSection}>
          <h2 className={styles.trailerHeading}>{title.toUpperCase()}</h2>
          <p className={styles.trailerLabel}>OFFICIAL TRAILER</p>
          <div className={styles.trailerEmbedWrap}>
            <iframe
              title="Trailer"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              className={styles.trailerIframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        youtubeKey={trailerKey}
      />
    </div>
  );
}
