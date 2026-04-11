// ═══════════════════════════════════════════════════════════════
// services/manager/report.service.ts
// Appels API → /api/manager/intervention-report
// Lecture + validation + notation — filtrage site géré backend
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  InterventionReport,
  ReportStats,
  ReportFilters,
  ValidateReportPayload,
} from "../../types/manager.types";

export const ReportService = {
  /**
   * Liste paginée des rapports d'intervention du site du manager.
   * Utilise /manager/intervention-report — filtré automatiquement par site_id du manager.
   */
  async getReports(
    filters: ReportFilters = {}
  ): Promise<PaginatedResponse<InterventionReport>> {
    try {
      const { data } = await api.get("/manager/intervention-report", { params: filters });
      const d = data?.data;
      const items: InterventionReport[] = Array.isArray(d?.items) ? d.items
        : Array.isArray(d?.data) ? d.data
        : Array.isArray(d) ? d : [];
      return {
        items,
        meta: d?.meta ?? { current_page: 1, last_page: 1, per_page: 15, total: items.length },
      };
    } catch (err: any) {
      // Ne pas propager les 401/403 — retourner liste vide
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        return { items: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } };
      }
      throw err;
    }
  },

  /**
   * Détail d'un rapport.
   */
  async getReport(id: number): Promise<InterventionReport> {
    const { data } = await api.get(`/manager/intervention-report/${id}`);
    return data.data;
  },

  /**
   * Statistiques des rapports du site.
   */
  async getStats(): Promise<ReportStats> {
    try {
      const { data } = await api.get("/manager/intervention-report/stats");
      const d = data?.data;
      return {
        total:          d?.total          ?? d?.total_reports    ?? 0,
        validated:      d?.validated      ?? d?.validated_reports ?? 0,
        pending:        d?.pending        ?? d?.pending_reports   ?? 0,
        rejected:       d?.rejected       ?? 0,
        average_rating: d?.average_rating ?? 0,
      };
    } catch {
      return { total: 0, validated: 0, pending: 0, rejected: 0, average_rating: 0 };
    }
  },

  /**
   * Valider un rapport d'intervention avec une note optionnelle.
   * Route : POST /manager/intervention-report/{id}/validate
   */
  async validateReport(
    id: number,
    payload: ValidateReportPayload = {}
  ): Promise<InterventionReport> {
    const { data } = await api.post<ApiResponse<InterventionReport>>(
      `/manager/intervention-report/${id}/validate`,
      payload
    );
    return data.data;
  },

  /**
   * Export Excel des rapports — utilise le vrai endpoint backend.
   * Route : GET /manager/intervention-report/export
   */
  async exportReports(filters: ReportFilters = {}): Promise<Blob> {
    const response = await api.get("/manager/intervention-report/export", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Construit l'URL publique d'une pièce jointe de rapport.
   */
  getAttachmentUrl(filePath: string): string {
    const base =
      process.env.NEXT_PUBLIC_STORAGE_URL ??
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
      "";
    return `${base}/storage/${filePath}`;
  },
};