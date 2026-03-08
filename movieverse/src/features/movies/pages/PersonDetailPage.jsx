import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTmdbApi } from "../hooks/useTmdbApi";
import { TMDB_BASE_IMAGE } from "../../../shared/constants";
import MovieCard from "../components/MovieCard";
import Loader from "../../../shared/components/Loader/Loader";
import styles from "./PersonDetailPage.module.scss";

export default function PersonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPerson } = useTmdbApi();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPerson(id)
      .then((data) => {
        if (!cancelled) setPerson(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, getPerson]);

  if (loading && !person) return <Loader />;
  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error}</p>
        <button type="button" className={styles.back} onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }
  if (!person) return null;

  const profileUrl = person.profile_path
    ? `${TMDB_BASE_IMAGE}/h632${person.profile_path}`
    : null;
  const knownFor = person.known_for ?? [];

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className={styles.top}>
        <div className={styles.profileWrap}>
          {profileUrl ? (
            <img src={profileUrl} alt={person.name} className={styles.profile} />
          ) : (
            <div className={styles.placeholder}>?</div>
          )}
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{person.name}</h1>
          {person.biography && (
            <p className={styles.bio}>{person.biography}</p>
          )}
        </div>
      </div>
      {knownFor.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Known For</h2>
          <div className={styles.grid}>
            {knownFor.map((item) => (
              <MovieCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                type={item.media_type === "tv" ? "tv" : "movie"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
