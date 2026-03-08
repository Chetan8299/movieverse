import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTmdbApi } from "../hooks/useTmdbApi";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { apiClient } from "../../../shared/api";
import { customMovieToCard } from "../../../shared/utils/customMovies";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../../../shared/components/SkeletonCard/SkeletonCard";
import Loader from "../../../shared/components/Loader/Loader";
import styles from "./BrowsePage.module.scss";

const SKELETON_COUNT = 12;

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type") || "movie";
  const genreFromUrl = searchParams.get("genre") || "";

  const { getDiscover, getGenres } = useTmdbApi();
  const [type, setType] = useState(typeFromUrl);
  const [genreId, setGenreId] = useState(genreFromUrl);

  const setTypeAndResetGenre = (newType) => {
    setType(newType);
    setGenreId("");
  };
  const [genres, setGenres] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setType(typeFromUrl);
    setGenreId(genreFromUrl);
  }, [typeFromUrl, genreFromUrl]);

  useEffect(() => {
    getGenres(type).then(setGenres).catch(() => setGenres([]));
  }, [type, getGenres]);

  const selectedGenreName =
    genreId && genres.length > 0
      ? genres.find((g) => String(g.id) === String(genreId))?.name ?? ""
      : "";

  useEffect(() => {
    setLoading(true);
    setItems([]);
    setPage(1);
    setHasMore(true);
    Promise.all([
      getDiscover(type, 1, genreId),
      apiClient.get("/movies", { params: { category: type, limit: 50 } }),
    ])
      .then(([discoverPayload, customRes]) => {
        const discoverList = Array.isArray(discoverPayload?.results) ? discoverPayload.results : [];
        let customList = Array.isArray(customRes?.data?.movies) ? customRes.data.movies : [];
        if (selectedGenreName) {
          const nameLower = selectedGenreName.trim().toLowerCase();
          customList = customList.filter(
            (m) => m.genre && String(m.genre).trim().toLowerCase() === nameLower
          );
        }
        const customCards = customList.map(customMovieToCard).filter(Boolean);
        setItems([...customCards, ...discoverList]);
        setHasMore((discoverPayload?.page ?? 1) < (discoverPayload?.total_pages ?? 0));
        setPage(2);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, [type, genreId, selectedGenreName, getDiscover]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    getDiscover(type, page, genreId)
      .then((payload) => {
        const results = Array.isArray(payload?.results) ? payload.results : [];
        setItems((prev) => [...prev, ...results]);
        setHasMore((payload?.page ?? 1) < (payload?.total_pages ?? 0));
        setPage((p) => p + 1);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [type, genreId, page, hasMore, loadingMore, getDiscover]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  if (loading && items.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Browse {type === "tv" ? "TV Shows" : "Movies"}</h1>
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Browse {type === "tv" ? "TV Shows" : "Movies"}</h1>

      <div className={styles.tabs}>
        <button
          type="button"
          className={type === "movie" ? styles.tabActive : styles.tab}
          onClick={() => setTypeAndResetGenre("movie")}
        >
          Movies
        </button>
        <button
          type="button"
          className={type === "tv" ? styles.tabActive : styles.tab}
          onClick={() => setTypeAndResetGenre("tv")}
        >
          TV Shows
        </button>
      </div>

      {genres.length > 0 && (
        <div className={styles.genres}>
          <span className={styles.genreLabel}>Genre:</span>
          <button
            type="button"
            className={!genreId ? styles.genreActive : styles.genreBtn}
            onClick={() => setGenreId("")}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              type="button"
              className={genreId === String(g.id) ? styles.genreActive : styles.genreBtn}
              onClick={() => setGenreId(String(g.id))}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {items.map((item) => (
          <MovieCard key={item.id} item={item} type={type} />
        ))}
      </div>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      {loadingMore && <Loader />}
    </div>
  );
}
