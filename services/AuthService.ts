import axiosInstance from "../core/axios";

const AUTH_TOKEN_KEY = "auth_token";
const USER_ROLE_KEY = "user_role";

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: "super-admin" | "admin" | "user";
  };
  token: string;
}

// export const authService = {
//   loginAdmin: async (
//     credentials: Record<string, string>
//   ): Promise<AuthResponse> => {
//     const response = await axiosInstance.post("/admin/login", credentials);

//     const data = response.data.data;

//     if (data?.token) {
//       localStorage.setItem(AUTH_TOKEN_KEY, data.token);
//       localStorage.setItem(USER_ROLE_KEY, data.user.role);
//     }

//     return data;
//   },

//   logout: async (): Promise<void> => {
//     try {
//       await axiosInstance.post("/admin/logout");
//     } catch (error) {
//       // On ignore volontairement l'erreur réseau
//     } finally {
//       localStorage.removeItem(AUTH_TOKEN_KEY);
//       localStorage.removeItem(USER_ROLE_KEY);
//       window.location.href = "/login";
//     }
//   },

//   isAuthenticated: (): boolean => {
//     if (typeof window === "undefined") return false;

//     const token = localStorage.getItem(AUTH_TOKEN_KEY);
//     const role = localStorage.getItem(USER_ROLE_KEY);

//     return !!token && (role === "admin" || role === "super-admin");
//   },

//   getToken: (): string | null => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem(AUTH_TOKEN_KEY);
//   },

//   getRole: (): string | null => {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem(USER_ROLE_KEY);
//   },
// };


export const authService = {
  loginAdmin: async (credentials: Record<string, string>) => {
    const response = await axiosInstance.post("/admin/login", credentials);
    const data = response.data.data;

    if (data?.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_role", data.user.role);

      // Stocker séparément first_name et last_name
      localStorage.setItem("first_name", data.user.first_name || "");
      localStorage.setItem("last_name", data.user.last_name || "");
    }

    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/admin/logout"); // route correcte
    } catch (error) {
      console.warn("Erreur logout, on ignore:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("first_name");
      localStorage.removeItem("last_name");
      window.location.href = "/login";
    }
  },

  getFirstName: () => typeof window !== "undefined" ? localStorage.getItem("first_name") || "" : "",
  getLastName: () => typeof window !== "undefined" ? localStorage.getItem("last_name") || "" : "",
  getRole: () => typeof window !== "undefined" ? localStorage.getItem("user_role") || "" : "",
};
