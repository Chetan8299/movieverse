import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchUsers,
  banUser,
  unbanUser,
  deleteUser,
} from "../state/adminSlice";
import {
  fetchCustomMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../../movies/state/moviesSlice";
import Button from "../../../shared/components/Button/Button";
import Loader from "../../../shared/components/Loader/Loader";
import Modal from "../../../shared/components/Modal/Modal";
import { useTmdbApi } from "../../movies/hooks/useTmdbApi";
import styles from "./AdminDashboardPage.module.scss";

const CATEGORY_OPTIONS = [
  { value: "movie", label: "Movie" },
  { value: "tv", label: "TV Show" },
];

const initialMovieForm = {
  title: "",
  poster: "",
  description: "",
  tmdbId: "",
  releaseDate: "",
  trailer: "",
  genre: "",
  genres: [],
  banner: "",
  runtime: "",
  category: "movie",
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("users");
  const [movieForm, setMovieForm] = useState(initialMovieForm);
  const [editingId, setEditingId] = useState(null);
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [genreOptions, setGenreOptions] = useState([]);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef(null);

  const dispatch = useDispatch();
  const { getGenres } = useTmdbApi();
  const { users, loading: usersLoading } = useSelector((state) => state.admin);
  const { customMovies, loading: moviesLoading } = useSelector(
    (state) => state.movies,
  );

  useEffect(() => {
    if (tab === "users") dispatch(fetchUsers({}));
    else dispatch(fetchCustomMovies({}));
  }, [tab, dispatch]);

  useEffect(() => {
    if (!movieModalOpen) return;
    const category = movieForm.category || "movie";
    getGenres(category)
      .then((list) => setGenreOptions(Array.isArray(list) ? list : []))
      .catch(() => setGenreOptions([]));
  }, [movieModalOpen, movieForm.category, getGenres]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target)) {
        setGenreDropdownOpen(false);
      }
    }
    if (genreDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [genreDropdownOpen]);

  const handleBan = (id) =>
    dispatch(banUser(id))
      .then(() => toast.success("User banned."))
      .catch((err) => toast.error(err?.payload ?? err?.message ?? "Failed to ban user"));
  const handleUnban = (id) =>
    dispatch(unbanUser(id))
      .then(() => toast.success("User unbanned."))
      .catch((err) => toast.error(err?.payload ?? err?.message ?? "Failed to unban user"));
  const handleDeleteUser = (id) =>
    dispatch(deleteUser(id))
      .then(() => toast.success("User deleted."))
      .catch((err) => toast.error(err?.payload ?? err?.message ?? "Failed to delete user"));

  const openAddMovieModal = () => {
    setEditingId(null);
    setMovieForm(initialMovieForm);
    setMovieModalOpen(true);
  };

  const closeMovieModal = () => {
    setMovieModalOpen(false);
    setGenreDropdownOpen(false);
    setEditingId(null);
    setMovieForm(initialMovieForm);
  };

  const handleMovieSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateMovie({ id: editingId, ...movieForm }))
        .then(() => {
          closeMovieModal();
          dispatch(fetchCustomMovies({}));
          toast.success("Movie updated.");
        })
        .catch((err) => toast.error(err?.payload ?? err?.message ?? "Failed to update movie"));
    } else {
      dispatch(createMovie(movieForm))
        .then(() => {
          closeMovieModal();
          dispatch(fetchCustomMovies({}));
          toast.success("Movie added.");
        })
        .catch((err) => toast.error(err?.payload ?? err?.message ?? "Failed to add movie"));
    }
  };

  const handleEditMovie = (m) => {
    setEditingId(m._id);
    const genresList = Array.isArray(m.genres) && m.genres.length > 0 ? m.genres : (m.genre ? [m.genre] : []);
    setMovieForm({
      title: m.title,
      poster: m.poster || "",
      description: m.description || "",
      tmdbId: m.tmdbId,
      releaseDate: m.releaseDate || "",
      trailer: m.trailer || "",
      genre: m.genre || "",
      genres: genresList,
      banner: m.banner || "",
      runtime: m.runtime != null && m.runtime !== "" ? String(m.runtime) : "",
      category: m.category || "movie",
    });
    setMovieModalOpen(true);
  };

  const handleDeleteMovie = (id) => {
    dispatch(deleteMovie(id))
      .then(() => {
        if (editingId === id) closeMovieModal();
        toast.success("Movie deleted.");
      })
      .catch((err) => toast.error(err?.payload ?? err?.message ?? "Failed to delete movie"));
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "users" ? styles.active : ""}`}
          onClick={() => setTab("users")}
        >
          Users
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "movies" ? styles.active : ""}`}
          onClick={() => setTab("movies")}
        >
          Movies
        </button>
      </div>

      {tab === "users" && (
        <div className={styles.section}>
          {usersLoading && users.length === 0 ? (
            <Loader />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.isBanned && (
                          <span className={`${styles.badge} ${styles.banned}`}>
                            Banned
                          </span>
                        )}
                        {u.isAdmin && (
                          <span className={`${styles.badge} ${styles.admin}`}>
                            Admin
                          </span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {u.isBanned ? (
                            <Button
                              variant="secondary"
                              className={styles.btnSm}
                              onClick={() => handleUnban(u._id)}
                            >
                              Unban
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              className={styles.btnSm}
                              onClick={() => handleBan(u._id)}
                            >
                              Ban
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            className={styles.btnSm}
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "movies" && (
        <div className={styles.section}>
          <div className={styles.moviesToolbar}>
            <Button type="button" variant="primary" onClick={openAddMovieModal}>
              Add Movie
            </Button>
          </div>

          <Modal
            isOpen={movieModalOpen}
            onClose={closeMovieModal}
            title={editingId ? "Edit Movie" : "Add Movie"}
          >
            <form className={styles.form} onSubmit={handleMovieSubmit}>
              <div className={styles.formRow}>
                <label>Title</label>
                <input
                  value={movieForm.title}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label>Poster URL</label>
                <input
                  value={movieForm.poster}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, poster: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formRow}>
                <label>Description</label>
                <input
                  value={movieForm.description}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formRow}>
                <label>Release Date</label>
                <input
                  type="date"
                  value={movieForm.releaseDate || ""}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, releaseDate: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formRow}>
                <label>Trailer (YouTube key or URL)</label>
                <input
                  value={movieForm.trailer}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, trailer: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formRow}>
                <label>Category</label>
                <select
                  value={movieForm.category}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={styles.select}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Banner / Backdrop URL</label>
                <input
                  value={movieForm.banner}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, banner: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className={styles.formRow}>
                <label>Runtime (minutes)</label>
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={movieForm.runtime}
                  onChange={(e) =>
                    setMovieForm((f) => ({ ...f, runtime: e.target.value }))
                  }
                  placeholder="e.g. 120"
                />
              </div>
              <div className={styles.formRow} ref={genreDropdownRef}>
                <label>Genres</label>
                <div className={styles.genreDropdown}>
                  <button
                    type="button"
                    className={styles.genreDropdownTrigger}
                    onClick={() => setGenreDropdownOpen((o) => !o)}
                    aria-expanded={genreDropdownOpen}
                    aria-haspopup="listbox"
                  >
                    {movieForm.genres.length > 0
                      ? `${movieForm.genres.length} selected: ${movieForm.genres.slice(0, 3).join(", ")}${movieForm.genres.length > 3 ? "…" : ""}`
                      : "Select genres"}
                    <span className={styles.genreDropdownChevron} aria-hidden>▾</span>
                  </button>
                  {genreDropdownOpen && (
                    <div
                      className={styles.genreDropdownPanel}
                      role="listbox"
                      aria-multiselectable="true"
                    >
                      {genreOptions.map((g) => (
                        <label key={g.id} className={styles.genreCheckItem}>
                          <input
                            type="checkbox"
                            checked={movieForm.genres.includes(g.name)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setMovieForm((f) => ({
                                ...f,
                                genres: checked
                                  ? [...f.genres, g.name]
                                  : f.genres.filter((n) => n !== g.name),
                              }));
                            }}
                          />
                          <span>{g.name}</span>
                        </label>
                      ))}
                      {movieForm.genres.filter(
                        (name) => !genreOptions.some((g) => g.name === name)
                      ).map((name) => (
                        <label key={name} className={styles.genreCheckItem}>
                          <input
                            type="checkbox"
                            checked
                            onChange={() => {
                              setMovieForm((f) => ({
                                ...f,
                                genres: f.genres.filter((n) => n !== name),
                              }));
                            }}
                          />
                          <span>{name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formActions}>
                <Button type="submit" variant="primary">
                  {editingId ? "Update" : "Add"} Movie
                </Button>
                <Button type="button" variant="ghost" onClick={closeMovieModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>

          {moviesLoading && customMovies.length === 0 ? (
            <Loader />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>TMDB ID</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customMovies.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <Link to={`/${m.category || "movie"}/${m.tmdbId}`} className={styles.movieTitleLink}>
                          {m.title}
                        </Link>
                      </td>
                      <td>{m.tmdbId}</td>
                      <td>{m.category}</td>
                      <td>
                        <div className={styles.actions}>
                          <Button
                            variant="secondary"
                            className={styles.btnSm}
                            onClick={() => handleEditMovie(m)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className={styles.btnSm}
                            onClick={() => handleDeleteMovie(m._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
