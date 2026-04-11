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
    const { data } = await api.get("/manager/asset/stats");
    const d = data?.data ?? data;
    // Normalise les champs back → front
    return {
      total:          d?.total_actifs          ?? d?.total          ?? 0,
      active:         d?.actifs_actifs         ?? d?.active         ?? 0,
      in_maintenance: d?.actifs_inactifs       ?? d?.in_maintenance ?? 0,
      out_of_service: d?.actifs_hors_usage     ?? d?.out_of_service ?? 0,
      disposed:       0,
      total_value:    d?.valeur_totale_patrimoine ?? d?.total_value ?? null,
    };
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