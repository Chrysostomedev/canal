import axiosInstance from "../../core/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportTicket {
  id: number;
  subject?: string;
  type?: string;
  status?: string;
  reference?: string;
}

export interface ReportProvider {
  id: number;
  company_name?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface ReportSite {
  id: number;
  nom?: string;
  name?: string;
}

export interface ReportAttachment {
  id: number;
  file_path: string;
  // "document" si PDF, "photo" si image — logique du service Laravel
  file_type: "document" | "photo" | string;
}

export interface ReportValidator {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface InterventionReport {
  id: number;
  // Statuts BD : pending | validated | submitted
  status: "pending" | "validated" | "submitted" | string;
  // Types BD : curatif | preventif
  intervention_type?: "curatif" | "preventif" | string;
  // Résultat : RAS | anomalie
  result?: "RAS" | "anomalie" | string;
  description?: string;
  findings?: string;
  action_taken?: string;
  start_date?: string;
  end_date?: string;
  ticket_id?: number;
  planning_id?: number;
  provider_id?: number;
  site_id?: number;
  validated_by?: number;
  validated_at?: string;
  rating?: number | null;
  manager_comment?: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  ticket?: ReportTicket;
  planning?: { id: number; codification?: string; date_debut?: string };
  provider?: ReportProvider;
  site?: ReportSite;
  attachments?: ReportAttachment[];
  validator?: ReportValidator;
}

export interface ReportStats {
  total_reports: number;
  validated_reports: number;
  pending_reports: number;
  average_rating: number | string;
  reports_by_type?: { intervention_type: string; count: number }[];
}

// Payload création — conforme à InterventionReportRequest + store()
export interface CreateReportPayload {
  ticket_id?: number;          // optionnel si rapport préventif depuis planning
  planning_id?: number;        // pour les rapports préventifs liés à un planning
  intervention_type?: "curatif" | "preventif"; // auto-résolu par le back selon ticket_id/planning_id
  result?: "RAS" | "anomalie"; // valeurs exactes attendues par le back (nullable)
  findings: string;            // requis par le back
  action_taken?: string;       // nullable côté back
  description?: string;
  start_date?: string;
  end_date?: string;
  anomaly_detected?: boolean;
  anomaly_description?: string;
  attachments?: File[];
}

export interface UpdateReportPayload extends Partial<Omit<CreateReportPayload, "ticket_id" | "planning_id">> {}

// ─── Constantes UI ────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  pending:   "En attente",
  validated: "Validé",
};

export const STATUS_STYLES: Record<string, string> = {
  validated: "border-emerald-200 bg-emerald-50 text-emerald-600",
  pending:   "border-amber-200 bg-amber-50 text-amber-600",
};

export const STATUS_DOT: Record<string, string> = {
  pending:   "#f59e0b",
  validated: "#22c55e",
};

export const TYPE_LABELS: Record<string, string> = {
  curatif:   "Curatif",
  preventif: "Préventif",
};

export const TYPE_STYLES: Record<string, string> = {
  curatif:   "bg-orange-50 text-orange-600 border border-orange-200",
  preventif: "bg-blue-50   text-blue-600   border border-blue-200",
};

export const RESULT_LABELS: Record<string, string> = {
  RAS:      "RAS",
  anomalie: "Anomalie détectée",
};

export const RESULT_STYLES: Record<string, string> = {
  RAS:      "bg-green-50   text-green-600   border border-green-200",
  anomalie: "bg-red-50     text-red-600     border border-red-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const getAttachmentUrl = (path: string): string => {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "")
    .replace("/api/V1", "").replace("/api", "");
  return `${base}/storage/${path}`;
};

export const getProviderName = (p?: ReportProvider | null) =>
  p?.company_name ?? p?.name ?? "—";

export const getSiteName = (s?: ReportSite | null) =>
  s?.nom ?? s?.name ?? "—";

/** Un rapport non-validé peut être modifié par le prestataire */
export const isEditable = (r: InterventionReport) => r.status !== "validated";

// ─── Service ──────────────────────────────────────────────────────────────────

const BASE = "/provider/intervention-report";

export const providerReportService = {

  /**
   * GET /provider/intervention-report
   * Filtres supportés par le back : intervention_type, status, site_id,
   * planning_id, ticket_id, result, date_debut, date_fin, per_page
   */
  getReports: async (params?: {
    intervention_type?: string;
    status?: string;
    site_id?: number;
    planning_id?: number;
    ticket_id?: number;
    result?: string;
    date_debut?: string;
    date_fin?: string;
    per_page?: number;
    page?: number;
  }): Promise<InterventionReport[]> => {
    const res = await axiosInstance.get(BASE, { params });
    const d   = res.data?.data ?? res.data;
    if (Array.isArray(d?.items))     return d.items;
    if (Array.isArray(d?.data))      return d.data;
    if (Array.isArray(d))            return d;
    return [];
  },

  /**
   * GET /provider/intervention-report/stats
   * Stats filtrées sur provider_id authentifié
   */
  getStats: async (): Promise<ReportStats> => {
    const res = await axiosInstance.get(`${BASE}/stats`);
    const d = res.data?.data ?? res.data;
    return {
      total_reports:     d?.total_reports     ?? d?.total     ?? 0,
      validated_reports: d?.validated_reports ?? d?.validated ?? 0,
      pending_reports:   d?.pending_reports   ?? d?.pending   ?? 0,
      average_rating:    d?.average_rating    ?? d?.rating    ?? 0,
      reports_by_type:   d?.reports_by_type   ?? [],
    };
  },

  /**
   * GET /provider/intervention-report/{id}
   * Relations chargées : ticket, provider, site, attachments, validator
   * 403 si le rapport n'appartient pas au provider auth
   */
  getReportById: async (id: number): Promise<InterventionReport> => {
    const res = await axiosInstance.get(`${BASE}/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * POST /provider/intervention-report
   * Logique métier section 6.1 :
   * - ticket_id obligatoire (ticket EN_COURS / IN_TREATMENT)
   * - provider_id auto-rempli par le backend depuis auth()->provider->id
   * - attachments[] → stockés dans reports/attachments/
   *   file_type = "document" si PDF, "photo" si image
   * - Après création : notif gestionnaire + admins
   */
  createReport: async (payload: CreateReportPayload): Promise<InterventionReport> => {
    // Flux curatif : ticket_id obligatoire, on démarre l'intervention si besoin
    if (payload.ticket_id) {
      try {
        const ticketRes = await axiosInstance.get(`/provider/ticket/${payload.ticket_id}`);
        const ticket = ticketRes.data?.data ?? ticketRes.data;
        const status = (ticket?.status ?? "").toUpperCase();
        if (status === "ASSIGNÉ" || status === "ASSIGNE") {
          await axiosInstance.post(`/provider/ticket/${payload.ticket_id}/start`);
        }
      } catch { /* non bloquant */ }
    }
    // Flux préventif depuis planning : pas de .start(), planning_id envoyé à la place

    const form = new FormData();
    if (payload.ticket_id)        form.append("ticket_id",         String(payload.ticket_id));
    if (payload.planning_id)      form.append("planning_id",        String(payload.planning_id));
    if (payload.intervention_type) form.append("intervention_type", payload.intervention_type);
    if (payload.result)           form.append("result",             payload.result);
    if (payload.start_date)       form.append("start_date",         payload.start_date);
    form.append("findings",       payload.findings ?? "");
    if (payload.action_taken)     form.append("action_taken",       payload.action_taken);
    form.append("anomaly_detected", String(payload.anomaly_detected ?? false));
    if (payload.end_date)             form.append("end_date",             payload.end_date);
    if (payload.description)          form.append("description",          payload.description);
    if (payload.anomaly_description)  form.append("anomaly_description",  payload.anomaly_description);

    if (payload.attachments?.length) {
      payload.attachments.forEach(f => form.append("attachments[]", f));
    }

    const res = await axiosInstance.post(BASE, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data ?? res.data;
  },

  /**
   * PUT /provider/intervention-report/{id}
   * 422 si rapport déjà validé
   * 403 si provider_id ≠ auth
   * Nouveaux attachments ajoutés (sans supprimer les anciens — comportement service Laravel)
   */
  updateReport: async (id: number, payload: UpdateReportPayload): Promise<InterventionReport> => {
    const form = new FormData();
    if (payload.intervention_type !== undefined)
      form.append("intervention_type", payload.intervention_type);
    if (payload.result !== undefined)
      form.append("result", payload.result);
    if (payload.start_date)  form.append("start_date",  payload.start_date);
    if (payload.end_date)    form.append("end_date",    payload.end_date);
    if (payload.description) form.append("description", payload.description);
    if (payload.findings)    form.append("findings",    payload.findings);

    if (payload.attachments?.length) {
      payload.attachments.forEach(f => form.append("attachments[]", f));
    }

    const res = await axiosInstance.put(`${BASE}/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data ?? res.data;
  },

  /** Export XLSX (scoping provider_id côté backend) */
  exportXlsx: async (): Promise<void> => {
    const res = await axiosInstance.get(`${BASE}/export`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a   = document.createElement("a");
    a.href     = url;
    a.download = `rapports_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },
};