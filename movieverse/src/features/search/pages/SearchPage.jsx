import { useState, useEffect } from "react";
import { useTmdbApi } from "../../movies/hooks/useTmdbApi";
import { useDebounce } from "../hooks/useDebounce";
import { apiClient } from "../../../shared/api";
import { customMovieToCard } from "../../../shared/utils/customMovies";
import MovieCard from "../../movies/components/MovieCard";
import PersonCard from "../../movies/components/PersonCard";
import Loader from "../../../shared/components/Loader/Loader";
import styles from "./SearchPage.module.scss";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { searchMulti } = useTmdbApi();
  const [results, setResults] = useState({ movies: [], tv: [], people: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ movies: [], tv: [], people: [] });
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      searchMulti(debouncedQuery, 1),
      apiClient.get("/movies", { params: { q: debouncedQuery.trim(), limit: 50 } }),
    ])
      .then(([tmdbPayload, customRes]) => {
        if (cancelled) return;
        const list = Array.isArray(tmdbPayload?.results) ? tmdbPayload.results : [];
        const customList = Array.isArray(customRes?.data?.movies) ? customRes.data.movies : [];
        const customCards = customList.map(customMovieToCard).filter(Boolean);
        const customMovies = customCards.filter((c) => c.media_type === "movie");
        const customTv = customCards.filter((c) => c.media_type === "tv");
        setResults({
          movies: [...customMovies, ...list.filter((r) => r && r.media_type === "movie")],
          tv: [...customTv, ...list.filter((r) => r && r.media_type === "tv")],
          people: list.filter((r) => r && r.media_type === "person"),
        });
      })
      .catch(() => {
        if (!cancelled) setResults({ movies: [], tv: [], people: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery, searchMulti]);

  const hasResults =
    results.movies.length > 0 ||
    results.tv.length > 0 ||
    results.people.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.searchBox}>
        <input
          type="search"
          placeholder="Search movies, TV shows, people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
          autoFocus
        />
      </div>
      {loading && <Loader />}
      {!loading && debouncedQuery && !hasResults && (
        <p className={styles.empty}>No results for &quot;{debouncedQuery}&quot;</p>
      )}
      {!loading && hasResults && (
        <>
          {results.movies.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Movies</h2>
              <div className={styles.grid}>
                {results.movies.map((item) => (
                  <MovieCard key={`m-${item.id}`} item={item} type="movie" />
                ))}
              </div>
            </>
          )}
          {results.tv.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>TV Shows</h2>
              <div className={styles.grid}>
                {results.tv.map((item) => (
                  <MovieCard key={`t-${item.id}`} item={item} type="tv" />
                ))}
              </div>
            </>
          )}
          {results.people.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>People</h2>
              <div className={styles.peopleGrid}>
                {results.people.map((person) => (
                  <PersonCard key={`p-${person.id}`} person={person} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
