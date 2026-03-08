/**
 * Normalize TMDB API responses from our backend proxy.
 * Backend sends res.json(tmdbData), so axios gives us response.data = tmdbData.
 * Handle both direct payload and any nested { data } wrapper.
 */

/**
 * Get the actual body from axios response or raw payload.
 * @param {import('axios').AxiosResponse|object} response - axios response or direct payload
 * @returns {object} Parsed body
 */
export function getResponseData(response) {
  if (!response) return null;
  const body = response.data !== undefined ? response.data : response;
  if (body && typeof body === "object" && "data" in body && Object.keys(body).length === 1) {
    return body.data;
  }
  return body;
}

/**
 * Extract list results from TMDB list responses (trending, popular, search).
 * TMDB shape: { page, results: [], total_pages, total_results }
 * @param {import('axios').AxiosResponse|object} response
 * @returns {{ results: array, page?: number, total_pages?: number, total_results?: number }}
 */
export function parseListResponse(response) {
  const data = getResponseData(response);
  if (!data || typeof data !== "object") {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
  const results = Array.isArray(data.results) ? data.results : [];
  return {
    results,
    page: data.page ?? 1,
    total_pages: data.total_pages ?? 0,
    total_results: data.total_results ?? 0,
  };
}

/**
 * Extract single entity (movie, tv, person) or videos response.
 * @param {import('axios').AxiosResponse|object} response
 * @returns {object|null}
 */
export function parseDetailResponse(response) {
  const data = getResponseData(response);
  if (!data || typeof data !== "object") return null;
  return data;
}

/**
 * Extract videos list from TMDB videos endpoint. Shape: { id, results: [] }
 * @param {import('axios').AxiosResponse|object} response
 * @returns {array}
 */
export function parseVideosResponse(response) {
  const data = getResponseData(response);
  if (!data || typeof data !== "object") return [];
  return Array.isArray(data.results) ? data.results : [];
}
