import api from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register/", payload),
  login: (payload) => api.post("/auth/login/", payload),
  me: () => api.get("/auth/me/"),
  updateMe: (formData) => api.patch("/auth/me/", formData),
  requestPasswordReset: (email) => api.post("/auth/password-reset/", { email }),
  confirmPasswordReset: (payload) => api.post("/auth/password-reset-confirm/", payload),
};
