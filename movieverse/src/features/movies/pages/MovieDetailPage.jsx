import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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

export default function MovieDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isTv = location.pathname.startsWith("/tv/");
  const type = isTv ? "tv" : "movie";

  const { getMovie, getTv, getMovieVideos, getTvVideos } = useTmdbApi();
  const { items: favorites } = useSelector((state) => state.favorites);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [detail, setDetail] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

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
          setDetail(
            custom
              ? {
                  title: custom.title,
                  name: custom.title,
                  poster_path: custom.poster || null,
                  overview: custom.description || DEFAULT_DESCRIPTION,
                  release_date: custom.releaseDate || "",
                  first_air_date: custom.releaseDate || "",
                  vote_average: null,
                  genre: custom.genre || "",
                  genres: custom.genre ? [{ name: custom.genre }] : [],
                  category: custom.category || "movie",
                }
              : null
          );
          setVideos(
            custom?.trailer
              ? [{ key: (custom.trailer.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] || custom.trailer), site: "YouTube", type: "Trailer" }]
              : []
          );
        } else {
          const [data, vidData] = isTv
            ? [await getTv(id), await getTvVideos(id)]
            : [await getMovie(id), await getMovieVideos(id)];
          if (!cancelled) {
            setDetail(data && typeof data === "object" ? data : null);
            setVideos(Array.isArray(vidData) ? vidData : []);
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
  }, [id, isTv, getMovie, getTv, getMovieVideos, getTvVideos]);

  useEffect(() => {
    if (!detail || !isAuthenticated) return;
    dispatch(
      addWatchHistory({
        tmdbId: String(id),
        type,
        title: detail.title ?? detail.name,
        poster: detail.poster_path ?? "",
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
  const title = detail?.title ?? detail?.name ?? "Untitled";
  const overview = detail?.overview || DEFAULT_DESCRIPTION;
  const releaseDate = detail?.release_date ?? detail?.first_air_date ?? "";
  const rating = detail?.vote_average != null ? Number(detail.vote_average).toFixed(1) : null;

  const categoryLabel =
    detail?.category === "tv" ? "TV Show" : (detail?.category === "movie" ? "Movie" : (type === "tv" ? "TV Show" : "Movie"));
  const genreLabel =
    detail?.genre ||
    (Array.isArray(detail?.genres) && detail.genres.length > 0
      ? detail.genres.map((g) => g.name).join(", ")
      : "");

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
      <div className={styles.top}>
        <div className={styles.posterWrap}>
          {posterUrl ? (
            <img src={posterUrl} alt={title} className={styles.poster} />
          ) : (
            <PlaceholderPoster className={styles.posterFill} />
          )}
        </div>
        <div className={styles.info}>
          <h1>{title}</h1>
          <div className={styles.metaRow}>
            {rating != null && (
              <span className={styles.rating} title="Rating">★ {rating}</span>
            )}
            {releaseDate && (
              <span className={styles.meta}>
                {isTv ? "First air" : "Release"}: {releaseDate}
              </span>
            )}
          </div>
          {(categoryLabel || genreLabel) && (
            <div className={styles.metaRow}>
              {categoryLabel && (
                <span className={styles.meta}>
                  <span className={styles.metaLabel}>Category:</span> {categoryLabel}
                </span>
              )}
              {genreLabel && (
                <span className={styles.meta}>
                  <span className={styles.metaLabel}>Genre:</span> {genreLabel}
                </span>
              )}
            </div>
          )}
          <p className={styles.overview}>{overview}</p>
          <div className={styles.actions}>
            <Button
              variant="primary"
              className={styles.favBtn}
              onClick={() => setTrailerOpen(true)}
            >
              Play Trailer
            </Button>
            <Button
              variant="secondary"
              className={styles.favBtn}
              onClick={handleFav}
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>
        </div>
      </div>
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        youtubeKey={trailerKey}
      />
    </div>
  );
}
