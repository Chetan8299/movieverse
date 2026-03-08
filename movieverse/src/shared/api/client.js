import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ensure response data is always parsed as JSON when it comes as a string
apiClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === "string") {
      try {
        response.data = JSON.parse(response.data);
      } catch (_) {
        // leave as string if not valid JSON
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.data && typeof error.response.data === "string") {
      try {
        error.response.data = JSON.parse(error.response.data);
      } catch (_) {
        error.response.data = { message: error.response.data };
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
