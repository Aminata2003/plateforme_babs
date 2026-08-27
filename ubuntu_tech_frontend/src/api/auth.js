import api from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register/", payload),
  login: (payload) => api.post("/auth/login/", payload),
  me: () => api.get("/auth/me/"),
  updateMe: (formData) => api.patch("/auth/me/", formData),
  requestPasswordReset: (email) => api.post("/auth/password-reset/", { email }),
  confirmPasswordReset: (payload) => api.post("/auth/password-reset-confirm/", payload),
};

export const usersApi = {
  list: () => api.get("/users/"),
  listLearners: () => api.get("/users/?role=apprenant&is_active=true"),
  create: (payload) => api.post("/users/", payload),
  remove: (id) => api.delete(`/users/${id}/`),
};
