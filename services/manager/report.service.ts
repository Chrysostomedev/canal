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
   */
  async getReports(
    filters: ReportFilters = {}
  ): Promise<PaginatedResponse<InterventionReport>> {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<InterventionReport>>
    >("/manager/intervention-report", { params: filters });
    return data.data;
  },

  /**
   * Détail d'un rapport avec pièces jointes, validateur, ticket.
   */
  async getReport(id: number): Promise<InterventionReport> {
    const { data } = await api.get<ApiResponse<InterventionReport>>(
      `/manager/intervention-report/${id}`
    );
    return data.data;
  },

  /**
   * Statistiques des rapports du site.
   */
  async getStats(): Promise<ReportStats> {
    const { data } = await api.get<ApiResponse<ReportStats>>(
      "/manager/intervention-report/stats"
    );
    return data.data;
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
   * Export Excel des rapports.
   * Route /manager/intervention-report/export n'existe pas — on génère côté client.
   */
  async exportReports(filters: ReportFilters = {}): Promise<Blob> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<InterventionReport>>>(
      "/manager/intervention-report",
      { params: { ...filters, per_page: 1000, page: 1 } }
    );
    const items: InterventionReport[] = data?.data?.items ?? [];
    const headers = ["Référence", "Prestataire", "Site", "Date", "Type", "Statut", "Note"];
    const rows = items.map(r => [
      r.reference ?? "-",
      r.provider?.company_name ?? r.provider?.name ?? "-",
      r.site?.nom ?? r.site?.name ?? "-",
      r.start_date ?? r.created_at ?? "-",
      r.intervention_type ?? "-",
      r.status ?? "-",
      r.rating ?? "-",
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
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