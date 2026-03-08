/**
 * Direct TMDB API client (frontend). Uses VITE_TMDB_API_KEY from env.
 * Note: The API key will be visible in the browser. For production at scale,
 * consider keeping the proxy to protect the key.
 */
import axios from "axios";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE,
  timeout: 12000,
  params: { api_key: API_KEY || "" },
});

export function hasTmdbKey() {
  return Boolean(API_KEY);
}
