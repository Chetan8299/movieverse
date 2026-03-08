import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../state/favoritesSlice";
import MovieCard from "../../movies/components/MovieCard";
import Loader from "../../../shared/components/Loader/Loader";
import styles from "./FavoritesPage.module.scss";

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  if (loading && items.length === 0) return <Loader />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Favorites</h1>
      {items.length === 0 ? (
        <p className={styles.empty}>You have no favorites yet. Add some from the home or detail page.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((fav) => (
            <MovieCard
              key={`${fav.type}-${fav.tmdbId}`}
              item={{
                id: fav.tmdbId,
                title: fav.title,
                poster: fav.poster,
              }}
              type={fav.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
