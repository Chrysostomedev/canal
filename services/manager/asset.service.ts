// ═══════════════════════════════════════════════════════════════
// services/manager/asset.service.ts
//
// Routes Laravel disponibles pour le MANAGER :
//   GET  /manager/asset/stats        → statistiques du patrimoine
//   GET  /manager/asset/export       → export Excel (blob)
//   GET  /manager/asset              → liste paginée (filtré par site)
//   GET  /manager/asset/{asset}      → détail d'un actif
//
// Le backend applique automatiquement le filtre site_id du manager.
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Asset,
  AssetStats,
  AssetFilters,
} from "../../types/manager.types";

export const AssetService = {
  // ─────────────────────────────────────────────────────────────
  // LISTE PAGINÉE
  // GET /manager/asset?page=1&per_page=15&status=active&...
  // ─────────────────────────────────────────────────────────────
  async getAssets(
    filters: AssetFilters = {}
  ): Promise<PaginatedResponse<Asset>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Asset>>>(
      "/manager/asset",
      { params: filters }
    );
    // Le backend retourne { items, meta } dans data.data
    return data.data;
  },

  // ─────────────────────────────────────────────────────────────
  // DÉTAIL
  // GET /manager/asset/{asset}
  // ─────────────────────────────────────────────────────────────
  async getAsset(id: number): Promise<Asset> {
    const { data } = await api.get<ApiResponse<Asset>>(
      `/manager/asset/${id}`
    );
    return data.data;
  },

  // ─────────────────────────────────────────────────────────────
  // STATISTIQUES
  // GET /manager/asset/stats
  // ─────────────────────────────────────────────────────────────
  async getStats(): Promise<AssetStats> {
    const { data } = await api.get<ApiResponse<AssetStats>>(
      "/manager/asset/stats"
    );
    return data.data;
  },

  // ─────────────────────────────────────────────────────────────
  // EXPORT EXCEL
  // GET /manager/asset/export → Blob
  // ─────────────────────────────────────────────────────────────
  async exportAssets(filters: AssetFilters = {}): Promise<Blob> {
    const response = await api.get("/manager/asset/export", {
      params:       filters,
      responseType: "blob",
    });
    return response.data;
  },
};