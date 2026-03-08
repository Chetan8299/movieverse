/**
 * Maps a custom movie document (from GET /api/movies) to the shape expected by MovieCard and list UIs.
 */
export function customMovieToCard(m) {
  if (!m || !m.tmdbId) return null;
  return {
    id: m.tmdbId,
    tmdbId: m.tmdbId,
    title: m.title || "Untitled",
    poster: m.poster || "",
    poster_path: m.poster || null,
    media_type: m.category === "tv" ? "tv" : "movie",
    vote_average: null,
  };
}
