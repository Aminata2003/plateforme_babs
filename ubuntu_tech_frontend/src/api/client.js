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

export default api;
