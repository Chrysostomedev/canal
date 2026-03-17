// services/ticket.service.ts
import axios from "../../core/axios";

export interface Ticket {
  id: number;
  code_ticket: string; // Ajouté pour correspondre au backend
  site_id: number;
  company_asset_id: number;
  service_id: number;
  provider_id: number;
  user_id: number;
  type: "curatif" | "preventif";
  priority: "faible" | "moyenne" | "haute" | "critique";
  status: "SIGNALÉ" | "PLANIFIÉ" | "EN_COURS" | "RAPPORTÉ" | "ÉVALUÉ" | "CLOS" | string;
  subject?: string;
  description?: string;
  planned_at: string;
  due_at: string;
  resolved_at?: string;
  closed_at?: string;
  cout?: number;
  rating?: number;
  images?: string[];
  site?: { id: number; nom: string };
  asset?: { id: number; designation: string; codification: string };
  service?: { id: number; name: string };
  provider?: { id: number; name: string; user?: { first_name: string; last_name: string } };
  user?: { id: number; name: string };
  reports?: any[];
  attachments?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface TicketStats {
  nombre_total_tickets: number;
  nombre_total_tickets_en_cours: number;
  nombre_total_tickets_clotures: number;
  nombre_total_tickets_resolus: number;
  nombre_tickets_par_mois: number;
  cout_moyen_par_ticket: number;
  cout_global_tickets: number;
  delais_moyen_traitement_heures: number | null;
  delais_minimal_traitement_heures: number | null;
  delais_maximal_traitement_heures: number | null;
  repartition_par_statut: Record<string, number>;
  tickets_en_cours_par_patrimoine: { asset_id: number; designation: string; codification: string; tickets_en_cours: number }[];
  volumes_mensuels_tickets: { annee: number; mois: number; total: number }[];
}

export const TicketService = {
  async getTickets(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    site_id?: number;
    company_asset_id?: number;
  }): Promise<{ items: Ticket[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> {
    const response = await axios.get("/admin/ticket", { params });
    return response.data.data;
  },

  async getTicket(id: number): Promise<Ticket> {
    const response = await axios.get(`/admin/ticket/${id}`);
    return response.data.data;
  },

  async createTicket(payload: {
    site_id: number;
    company_asset_id: number;
    service_id: number;
    provider_id: number;
    type: "curatif" | "preventif";
    priority: "faible" | "moyenne" | "haute" | "critique";
    planned_at: string;
    due_at: string;
    subject?: string;
    description?: string;
  }): Promise<Ticket> {
    const response = await axios.post("/admin/ticket", payload);
    return response.data.data;
  },

  async updateTicket(id: number, payload: Partial<{
    status: string;
    priority: string;
    provider_id: number;
    planned_at: string;
    subject: string;
    description: string;
    type: string;
  }>): Promise<Ticket> {
    const response = await axios.put(`/admin/ticket/${id}`, payload);
    return response.data.data;
  },

  async deleteTicket(id: number): Promise<boolean> {
    const response = await axios.delete(`/admin/ticket/${id}`);
    return response.data.success;
  },

  async getStats(): Promise<TicketStats> {
    const response = await axios.get("/admin/ticket/stats");
    return response.data.data;
  },

  // Workflow Actions
  async assignTicket(id: number, provider_id: number): Promise<Ticket> {
    const response = await axios.post(`/admin/ticket/${id}/assign`, { provider_id });
    return response.data.data;
  },

  async startIntervention(id: number): Promise<Ticket> {
    const response = await axios.post(`/admin/ticket/${id}/start`);
    return response.data.data;
  },

  async submitReport(id: number, payload: {
    findings: string;
    action_taken: string;
    anomaly_detected: boolean;
    anomaly_description?: string;
    attachments?: File[];
  }): Promise<Ticket> {
    const formData = new FormData();
    formData.append("findings", payload.findings);
    formData.append("action_taken", payload.action_taken);
    formData.append("anomaly_detected", payload.anomaly_detected ? "1" : "0");
    if (payload.anomaly_description) formData.append("anomaly_description", payload.anomaly_description);
    if (payload.attachments) {
      payload.attachments.forEach((file) => formData.append("attachments[]", file));
    }
    const response = await axios.post(`/admin/ticket/${id}/submit-report`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  async validateReport(id: number, payload: { result: string; rating?: number; comment?: string }): Promise<Ticket> {
    const response = await axios.post(`/admin/ticket/${id}/validate-report`, payload);
    return response.data.data;
  },

  async rejectReport(id: number, reason: string): Promise<Ticket> {
    const response = await axios.post(`/admin/ticket/${id}/reject-report`, { reason });
    return response.data.data;
  },

  async closeTicket(id: number): Promise<Ticket> {
    const response = await axios.post(`/admin/ticket/${id}/close`);
    return response.data.data;
  },

  async rateTicket(id: number, payload: { rating: number; comment?: string }): Promise<Ticket> {
    const response = await axios.post(`/admin/ticket/${id}/rate`, payload);
    return response.data.data;
  },
};