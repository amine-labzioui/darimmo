/**
 * Configuration Axios — DarImmo
 * Client HTTP centralisé avec injection automatique du token JWT
 * et rafraîchissement automatique en cas d'expiration (401).
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Intercepteur de requête : injecte le token d'accès =====
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("darimmo_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Intercepteur de réponse : rafraîchit le token si 401 =====
let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/users/login/") &&
      !originalRequest.url.includes("/auth/token/refresh/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("darimmo_refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        clearAuthStorage();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem("darimmo_access_token", data.access);
        api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        window.location.href = "/connexion";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearAuthStorage() {
  localStorage.removeItem("darimmo_access_token");
  localStorage.removeItem("darimmo_refresh_token");
  localStorage.removeItem("darimmo_user");
}

export { clearAuthStorage };
export default api;
