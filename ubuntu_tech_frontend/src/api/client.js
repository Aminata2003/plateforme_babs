import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attache le token JWT stocké à chaque requête, si présent.
// Détecte automatiquement les FormData pour laisser axios poser le bon Content-Type.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ubuntu_tech_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("ubuntu_tech_refresh_token");
    const isAuthRequest = originalRequest?.url?.includes("/auth/");

    if (error.response?.status !== 401 || originalRequest?._retry || !refreshToken || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const { data } = await api.post("/auth/refresh/", { refresh: refreshToken });
      localStorage.setItem("ubuntu_tech_access_token", data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("ubuntu_tech_access_token");
      localStorage.removeItem("ubuntu_tech_refresh_token");
      return Promise.reject(refreshError);
    }
  }
);

export default api;
