// services/report.service.ts
import axiosInstance from "../core/axios";

// ═══════════════════════════════════════════════
// INTERFACES — calquées sur le modèle InterventionReport Laravel
// ═══════════════════════════════════════════════

export interface ReportAttachment {
  id: number;
  file_path: string;
  file_type: "document" | "photo";
  created_at?: string;
}

export interface ReportTicket {
  id: number;
  subject?: string;
  type?: string;
  status?: string;
  priority?: string;
}

export interface ReportProvider {
  id: number;
  company_name?: string;
  name?: string;
}

export interface ReportSite {
  id: number;
  nom?: string;
  name?: string;
}

export interface ReportValidator {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface InterventionReport {
  id: number;
  ticket_id: number;
  provider_id: number;
  site_id: number;
  description?: string;
  intervention_type?: "curatif" | "preventif";
  status?: "pending" | "validated";
  rating?: number | null;
  manager_comment?: string | null;
  validated_by?: number | null;
  validated_at?: string | null;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;

  // Relations eager-loaded
  ticket?: ReportTicket | null;
  provider?: ReportProvider | null;
  site?: ReportSite | null;
  attachments?: ReportAttachment[];
  validator?: ReportValidator | null;
}

export interface ReportStats {
  total_reports: number;
  validated_reports: number;
  pending_reports: number;
  average_rating: number;
  reports_by_type: { intervention_type: string; count: number }[];
}

export interface ValidateReportPayload {
  rating?: number | null;
  comment?: string | null;
}

export interface CreateReportPayload {
  ticket_id: number;
  description?: string;
  intervention_type?: "curatif" | "preventif";
  start_date?: string;
  end_date?: string;
  attachments?: File[];
}

// ═══════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════

export const ReportService = {

  /**
   * GET /admin/intervention-reports
   * Liste tous les rapports avec relations
   */
  async getReports(): Promise<InterventionReport[]> {
    const res = await axiosInstance.get("/admin/intervention-report");
    return res.data.data;
  },

  /**
   * GET /admin/intervention-reports/:id
   * Détail d'un rapport avec toutes les relations
   */
  async getReport(id: number): Promise<InterventionReport> {
    const res = await axiosInstance.get(`/admin/intervention-report/${id}`);
    return res.data.data;
  },

  /**
   * GET /admin/intervention-reports/stats
   * KPIs : total, validés, en attente, note moyenne, par type
   */
  async getStats(): Promise<ReportStats> {
    const res = await axiosInstance.get("/admin/intervention-report/stats");
    return res.data.data;
  },

  /**
   * POST /admin/intervention-reports
   * Créer un rapport avec pièces jointes multipart
   */
  async createReport(payload: CreateReportPayload): Promise<InterventionReport> {
    const formData = new FormData();
    formData.append("ticket_id", String(payload.ticket_id));
    if (payload.description) formData.append("description", payload.description);
    if (payload.intervention_type) formData.append("intervention_type", payload.intervention_type);
    if (payload.start_date) formData.append("start_date", payload.start_date);
    if (payload.end_date) formData.append("end_date", payload.end_date);
    if (payload.attachments?.length) {
      payload.attachments.forEach(file => formData.append("attachments[]", file));
    }
    const res = await axiosInstance.post("/admin/intervention-report", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  /**
   * PUT /admin/intervention-reports/:id
   * Mettre à jour un rapport (interdit si validé)
   */
  async updateReport(id: number, payload: Partial<CreateReportPayload>): Promise<InterventionReport> {
    const formData = new FormData();
    if (payload.description) formData.append("description", payload.description);
    if (payload.intervention_type) formData.append("intervention_type", payload.intervention_type);
    if (payload.start_date) formData.append("start_date", payload.start_date);
    if (payload.end_date) formData.append("end_date", payload.end_date);
    if (payload.attachments?.length) {
      payload.attachments.forEach(file => formData.append("attachments[]", file));
    }
    const res = await axiosInstance.put(`/admin/intervention-report/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  /**
   * DELETE /admin/intervention-reports/:id
   */
  async deleteReport(id: number): Promise<void> {
    await axiosInstance.delete(`/admin/intervention-report/${id}`);
  },

  /**
   * POST /admin/intervention-reports/:id/validate
   * Valider un rapport avec note et commentaire
   */
  async validateReport(id: number, payload: ValidateReportPayload): Promise<InterventionReport> {
    const res = await axiosInstance.post(`/admin/intervention-report/${id}/validate`, {
      rating: payload.rating ?? null,
      comment: payload.comment ?? null,
    });
    return res.data.data;
  },

  /**
   * Construit l'URL publique d'une pièce jointe
   * file_path = "reports/attachments/xxx.pdf" → APP_URL/storage/reports/attachments/xxx.pdf
   */
  getAttachmentUrl(filePath: string): string {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "";
    return `${base}/storage/${filePath}`;
  },
};