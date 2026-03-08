// TMDB data is fetched directly from api.themoviedb.org (no backend proxy).
// Requires VITE_TMDB_API_KEY in .env. Key is visible in the browser.
import { useCallback } from "react";
import { tmdbClient } from "../../../shared/api/tmdbClient";
import {
  parseListResponse,
  parseDetailResponse,
  parseVideosResponse,
} from "../../../shared/api/tmdbResponse";

export function useTmdbApi() {
  const getTrending = useCallback(async (type = "movie", time = "day") => {
    const response = await tmdbClient.get(`/trending/${type}/${time}`);
    return parseListResponse(response);
  }, []);

  const getPopular = useCallback(async (type = "movie", page = 1) => {
    const response = await tmdbClient.get(`/${type}/popular`, { params: { page } });
    return parseListResponse(response);
  }, []);

  const getMovie = useCallback(async (id) => {
    const response = await tmdbClient.get(`/movie/${id}`);
    return parseDetailResponse(response);
  }, []);

  const getMovieVideos = useCallback(async (id) => {
    const response = await tmdbClient.get(`/movie/${id}/videos`);
    return parseVideosResponse(response);
  }, []);

  const getTv = useCallback(async (id) => {
    const response = await tmdbClient.get(`/tv/${id}`);
    return parseDetailResponse(response);
  }, []);

  const getTvVideos = useCallback(async (id) => {
    const response = await tmdbClient.get(`/tv/${id}/videos`);
    return parseVideosResponse(response);
  }, []);

  const searchMulti = useCallback(async (query, page = 1) => {
    const response = await tmdbClient.get("/search/multi", { params: { query, page } });
    return parseListResponse(response);
  }, []);

  const getPerson = useCallback(async (id) => {
    const response = await tmdbClient.get(`/person/${id}`);
    return parseDetailResponse(response);
  }, []);

  const getTrendingPeople = useCallback(async (time = "day") => {
    const response = await tmdbClient.get(`/trending/person/${time}`);
    return parseListResponse(response);
  }, []);

  const getGenres = useCallback(async (type = "movie") => {
    const response = await tmdbClient.get(`/genre/${type}/list`);
    const data = parseDetailResponse(response);
    return data?.genres ?? [];
  }, []);

  const getDiscover = useCallback(async (type = "movie", page = 1, withGenres = "") => {
    const params = { page };
    if (withGenres) params.with_genres = withGenres;
    const response = await tmdbClient.get(`/discover/${type}`, { params });
    return parseListResponse(response);
  }, []);

  const getMovieImages = useCallback(async (id) => {
    const response = await tmdbClient.get(`/movie/${id}/images`);
    return parseDetailResponse(response);
  }, []);

  const getTvImages = useCallback(async (id) => {
    const response = await tmdbClient.get(`/tv/${id}/images`);
    return parseDetailResponse(response);
  }, []);

  return {
    getTrending,
    getPopular,
    getMovie,
    getMovieVideos,
    getTv,
    getTvVideos,
    searchMulti,
    getPerson,
    getTrendingPeople,
    getGenres,
    getDiscover,
    getMovieImages,
    getTvImages,
  };
}
