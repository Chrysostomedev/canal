// ═══════════════════════════════════════════════════════════════
// services/manager/site.service.ts
// Appels API → /api/manager/site
// Le backend retourne uniquement le site du manager connecté.
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type { ApiResponse, PaginatedResponse, ManagerSite, SiteStats } from "../../types/manager.types";

export const SiteService = {
  /**
   * Récupère la liste des sites accessibles au manager.
   * (En pratique, un seul site est retourné côté backend.)
   */
  async getSites(): Promise<PaginatedResponse<ManagerSite>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<ManagerSite>>>("/manager/site");
    return data.data;
  },

  /**
   * Récupère les détails d'un site par ID.
   */
  async getSite(id: number): Promise<ManagerSite> {
    const { data } = await api.get<ApiResponse<ManagerSite>>(
      `/manager/site/${id}`
    );
    return data.data;
  },

  /**
   * Statistiques du site du manager.
   */
  async getStats(): Promise<SiteStats> {
    const { data } = await api.get<ApiResponse<SiteStats>>(
      "/manager/site/stats"
    );
    return data.data;
  },

  /**
   * Export Excel des données du site.
   * Retourne un blob pour déclenchement du téléchargement côté client.
   */
  async exportSite(): Promise<Blob> {
    const response = await api.get("/manager/site/export", {
      responseType: "blob",
    });
    return response.data;
  },
};