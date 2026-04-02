// src/core/axios.ts
import axios from "axios";

const AUTH_TOKEN_KEY = "auth_token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// === REQUEST INTERCEPTOR ===
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === RESPONSE INTERCEPTOR ===
// Liste des endpoints d'auth qui peuvent légitimement retourner 401
// sans que ça signifie "session expirée → rediriger vers /login"
const AUTH_ENDPOINTS = [
  "/admin/verify-otp",
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/provider/verify-otp",
  "/provider/login",
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        // Ne pas rediriger si on est sur un endpoint d'auth —
        // c'est une erreur métier (mauvais code OTP, mauvais mdp),
        // pas une session expirée. Laisser le composant gérer l'erreur.
        const requestUrl: string = error.config?.url ?? "";
        const isAuthEndpoint = AUTH_ENDPOINTS.some(ep => requestUrl.includes(ep));

        if (!isAuthEndpoint) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem("user_role");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Remplace "export default api;" par ces 3 lignes
export default api;
export { api as axiosInstance };
export { api as axios };