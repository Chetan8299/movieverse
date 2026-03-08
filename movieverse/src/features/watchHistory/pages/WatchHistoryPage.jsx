import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWatchHistory } from "../state/watchHistorySlice";
import MovieCard from "../../movies/components/MovieCard";
import Loader from "../../../shared/components/Loader/Loader";
import styles from "./WatchHistoryPage.module.scss";

export default function WatchHistoryPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.watchHistory);

  useEffect(() => {
    dispatch(fetchWatchHistory());
  }, [dispatch]);

  if (loading && items.length === 0) return <Loader />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Watch History</h1>
      {items.length === 0 ? (
        <p className={styles.empty}>No recently watched items.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((entry) => (
            <MovieCard
              key={`${entry.type}-${entry.tmdbId}-${entry.watchedAt}`}
              item={{
                id: entry.tmdbId,
                title: entry.title,
                poster: entry.poster,
              }}
              type={entry.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
