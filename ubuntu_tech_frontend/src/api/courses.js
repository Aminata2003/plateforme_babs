import api from "./client";

// ===================== MODULES =====================
export const modulesApi = {
  list: () => api.get("/modules/"),
  detail: (id) => api.get(`/modules/${id}/`),
  create: (payload) => api.post("/modules/", payload),
  update: (id, payload) => api.patch(`/modules/${id}/`, payload),
  remove: (id) => api.delete(`/modules/${id}/`),
};

// ===================== LESSONS =====================
export const lessonsApi = {
  listByModule: (moduleId) => api.get(`/lessons/?module=${moduleId}`),
  markCompleted: (lessonId) => api.post(`/lessons/${lessonId}/mark_completed/`),
  create: (payload) => api.post("/lessons/", payload),
};

// ===================== QUIZZES =====================
export const quizzesApi = {
  list: () => api.get("/quizzes/"),
  create: (payload) => api.post("/quizzes/", payload),
  submitAttempt: (quizId, answers) =>
    api.post(`/quizzes/${quizId}/submit_attempt/`, { answers }),
  myAttempts: () => api.get("/quiz-attempts/me/"),
};

// ===================== QUESTIONS & CHOIX (construction d'un quiz) =====================
export const questionsApi = {
  listByQuiz: (quizId) => api.get(`/questions/?quiz=${quizId}`),
  create: (payload) => api.post("/questions/", payload),
};

export const choicesApi = {
  create: (payload) => api.post("/choices/", payload),
};

// ===================== DEVOIRS =====================
export const devoirsApi = {
  listByModule: (moduleId) => api.get(`/devoirs/?module=${moduleId}`),
  create: (payload) => api.post("/devoirs/", payload),
};

// ===================== SOUMISSIONS =====================
export const submissionsApi = {
  mine: () => api.get("/submissions/"),
  byDevoir: (devoirId) => api.get(`/submissions/?devoir=${devoirId}`),
  submit: (formData) => api.post("/submissions/", formData),
  grade: (id, payload) => api.post(`/submissions/${id}/grade/`, payload),
};

// ===================== LIVE SESSIONS =====================
export const liveSessionsApi = {
  list: (type = "") => api.get(`/live-sessions/${type ? `?type=${type}` : ""}`),
  create: (payload) => api.post("/live-sessions/", payload),
  register: (id) => api.post(`/live-sessions/${id}/register/`),
  participants: (id) => api.get(`/live-sessions/${id}/participants/`),
  notify: (id, userIds = [], emails = []) =>
    api.post(`/live-sessions/${id}/notify/`, {
      user_ids: userIds,
      emails,
    }),
};

// ===================== PAYMENTS =====================
// Le backend gère UN SEUL forfait pour toute la formation (Enrollment n'est pas
// lié à un module précis) : pas de paiement "par module".
export const paymentsApi = {
  initiate: () => api.post("/payments/initiate/"),
  mine: () => api.get("/payments/payments/"),
};

// ===================== CERTIFICATS =====================
export const certificatesApi = {
  mine: () => api.get("/certificates/me/"),
  generate: () => api.post("/certificates/me/"),
};

// ===================== DASHBOARD ADMIN =====================
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats/"),
  learners: () => api.get("/dashboard/learners/"),
  learnerDetail: (id) => api.get(`/dashboard/learners/${id}/`),
};