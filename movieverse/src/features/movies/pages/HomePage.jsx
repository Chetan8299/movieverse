import { useState, useEffect, useCallback } from "react";
import { useTmdbApi } from "../hooks/useTmdbApi";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import MovieCard from "../components/MovieCard";
import PersonCard from "../components/PersonCard";
import SkeletonCard from "../../../shared/components/SkeletonCard/SkeletonCard";
import Loader from "../../../shared/components/Loader/Loader";
import styles from "./HomePage.module.scss";

const SKELETON_COUNT = 10;

export default function HomePage() {
  const { getTrending, getPopular, getTrendingPeople } = useTmdbApi();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [trendingPeople, setTrendingPeople] = useState([]);
  const [infiniteList, setInfiniteList] = useState([]);
  const [infinitePage, setInfinitePage] = useState(1);
  const [infiniteHasMore, setInfiniteHasMore] = useState(true);
  const [infiniteLoading, setInfiniteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (infiniteLoading || !infiniteHasMore) return;
    setInfiniteLoading(true);
    try {
      const payload = await getPopular("movie", infinitePage);
      const results = Array.isArray(payload?.results) ? payload.results : [];
      setInfiniteList((prev) => [...prev, ...results]);
      setInfiniteHasMore((payload?.page ?? 1) < (payload?.total_pages ?? 0));
      setInfinitePage((p) => p + 1);
    } catch (_) {
      setInfiniteHasMore(false);
    } finally {
      setInfiniteLoading(false);
    }
  }, [getPopular, infinitePage, infiniteLoading, infiniteHasMore]);

  const sentinelRef = useInfiniteScroll(loadMore, infiniteHasMore, infiniteLoading);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      setError(null);
      const [trendM, trendTv, popM, popTv, people] = await Promise.allSettled([
        getTrending("movie", "day"),
        getTrending("tv", "day"),
        getPopular("movie", 1),
        getPopular("tv", 1),
        getTrendingPeople("day"),
      ]);
      if (cancelled) return;
      const getResults = (p) => (p.status === "fulfilled" && p.value?.results) ? p.value.results : [];
      setTrendingMovies(Array.isArray(getResults(trendM)) ? getResults(trendM) : []);
      setTrendingTv(Array.isArray(getResults(trendTv)) ? getResults(trendTv) : []);
      const popMResults = getResults(popM);
      setPopularMovies(Array.isArray(popMResults) ? popMResults : []);
      setPopularTv(Array.isArray(getResults(popTv)) ? getResults(popTv) : []);
      setTrendingPeople(Array.isArray(getResults(people)) ? getResults(people) : []);
      setInfiniteList(Array.isArray(popMResults) ? popMResults : []);
      setInfinitePage(2);
      setInfiniteHasMore(true);
      const failed = [trendM, trendTv, popM, popTv].filter((p) => p.status === "rejected");
      if (failed.length === 4) {
        const msg = failed[0]?.reason?.response?.data?.message ?? failed[0]?.reason?.message;
        setError(msg || "Failed to load. Please try again.");
      }
      setLoading(false);
    }
    fetch();
    return () => { cancelled = true; };
  }, [getTrending, getPopular, getTrendingPeople]);

  const showSkeleton = loading && trendingMovies.length === 0 && !trendingTv.length && !popularMovies.length && !popularTv.length;

  if (showSkeleton) {
    return (
      <div className={styles.page}>
        <h1 className={styles.sectionTitle}>Trending Movies</h1>
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.errorMsg}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.sectionTitle}>Trending Movies</h1>
        <div className={styles.grid}>
          {trendingMovies.slice(0, 10).map((item) => (
            <MovieCard key={`m-${item.id}`} item={item} type="movie" />
          ))}
        </div>
      </section>
      <section>
        <h2 className={styles.sectionTitle}>Trending TV Shows</h2>
        <div className={styles.grid}>
          {trendingTv.slice(0, 10).map((item) => (
            <MovieCard key={`t-${item.id}`} item={item} type="tv" />
          ))}
        </div>
      </section>
      <section>
        <h2 className={styles.sectionTitle}>Popular Movies</h2>
        <div className={styles.grid}>
          {popularMovies.slice(0, 10).map((item) => (
            <MovieCard key={`pm-${item.id}`} item={item} type="movie" />
          ))}
        </div>
      </section>
      <section>
        <h2 className={styles.sectionTitle}>Popular TV Shows</h2>
        <div className={styles.grid}>
          {popularTv.slice(0, 10).map((item) => (
            <MovieCard key={`pt-${item.id}`} item={item} type="tv" />
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Trending People</h2>
        <div className={styles.peopleGrid}>
          {trendingPeople.slice(0, 12).map((person) => (
            <PersonCard key={`person-${person.id}`} person={person} />
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>More Movies (infinite scroll)</h2>
        <div className={styles.grid}>
          {infiniteList.map((item) => (
            <MovieCard key={`inf-${item.id}`} item={item} type="movie" />
          ))}
        </div>
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
        {infiniteLoading && <Loader />}
      </section>
    </div>
  );
}
