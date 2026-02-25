import axiosInstance from "../core/axios";

const AUTH_TOKEN_KEY = "auth_token";
const USER_ROLE_KEY = "user_role";

export interface AuthResponse {
  user: {
    id: number;
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    role: "super-admin" | "admin" | "manager";
  };
  token: string;
}

export const authService = {
  loginAdmin: async (credentials: Record<string, string>) => {
    const response = await axiosInstance.post("/admin/login", credentials);
    const data = response.data.data;

    if (data?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_ROLE_KEY, data.user.role ?? "");

      // ── Gestion du nom — le backend peut retourner :
      //   - first_name + last_name séparés
      //   - OU un seul champ "name"
      const firstName = data.user.first_name || "";
      const lastName  = data.user.last_name  || "";

      if (firstName || lastName) {
        // Cas idéal — backend retourne first_name et last_name
        localStorage.setItem("first_name", firstName);
        localStorage.setItem("last_name", lastName);
      } else if (data.user.name) {
        // Fallback — backend retourne un seul champ "name"
        // On split sur le premier espace : "Jean Dupont" → "Jean" + "Dupont"
        const parts = (data.user.name as string).trim().split(/\s+/);
        localStorage.setItem("first_name", parts[0] ?? "");
        localStorage.setItem("last_name", parts.slice(1).join(" ") ?? "");
      } else {
        localStorage.setItem("first_name", "");
        localStorage.setItem("last_name", "");
      }

      // Stocker aussi l'email et l'id pour la page profil
      localStorage.setItem("user_email", data.user.email ?? "");
      localStorage.setItem("user_id", String(data.user.id ?? ""));
    }

    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/admin/logout");
    } catch (error) {
      console.warn("Erreur logout, on ignore:", error);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_ROLE_KEY);
      localStorage.removeItem("first_name");
      localStorage.removeItem("last_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_id");
      window.location.href = "/admin/login";
    }
  },

  getFirstName : () => typeof window !== "undefined" ? localStorage.getItem("first_name")  || "" : "",
  getLastName  : () => typeof window !== "undefined" ? localStorage.getItem("last_name")   || "" : "",
  getRole      : () => typeof window !== "undefined" ? localStorage.getItem(USER_ROLE_KEY)  || "" : "",
  getEmail     : () => typeof window !== "undefined" ? localStorage.getItem("user_email")  || "" : "",
  getUserId    : () => typeof window !== "undefined" ? localStorage.getItem("user_id")     || "" : "",

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const role  = localStorage.getItem(USER_ROLE_KEY);
    return !!token && (role === "admin" || role === "super-admin");
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
};