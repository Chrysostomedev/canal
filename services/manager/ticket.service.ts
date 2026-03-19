// services/manager/ticket.service.ts
import axios from "../../core/axios";
import { Ticket, TicketStats, TicketFilters, PaginatedResponse, ApiResponse, UpdateTicketPayload } from "../../types/manager.types";

export const TicketService = {
  /**
   * Récupère la liste paginée des tickets pour le site du manager.
   */
  async getTickets(params?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
    const response = await axios.get("/manager/ticket", { params });
    return response.data.data;
  },

  /**
   * Récupère les détails d'un ticket spécifique.
   */
  async getTicket(id: number): Promise<Ticket> {
    const response = await axios.get(`/manager/ticket/${id}`);
    return response.data.data;
  },

  /**
   * Crée (signale) un nouveau ticket d'intervention.
   */
  async createTicket(payload: {
    company_asset_id: number;
    service_id: number;
    priority: string;
    description: string;
    subject?: string;
  }): Promise<Ticket> {
    const response = await axios.post("/manager/ticket", payload);
    return response.data.data;
  },

  /**
   * Met à jour un ticket existant.
   */
  async updateTicket(id: number, payload: UpdateTicketPayload): Promise<Ticket> {
    const response = await axios.put(`/manager/ticket/update/${id}`, payload);
    return response.data.data;
  },

  /**
   * Récupère les statistiques des tickets pour le manager.
   */
  async getStats(): Promise<TicketStats> {
    const response = await axios.get("/manager/ticket/stats");
    return response.data.data;
  },

  /**
   * Exporte les tickets au format Excel.
   */
  async exportTickets(params?: TicketFilters): Promise<Blob> {
    const response = await axios.get("/manager/ticket/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Valide un rapport d'intervention lié à un ticket.
   */
  async validateReport(id: number, payload: { result: string; rating?: number; comment?: string }): Promise<any> {
    const response = await axios.post(`/manager/ticket/${id}/validate-report`, payload);
    return response.data;
  },

  /**
   * Rejette un rapport d'intervention.
   */
  async rejectReport(id: number, reason: string): Promise<any> {
    const response = await axios.post(`/manager/ticket/${id}/reject-report`, { reason });
    return response.data;
  },

  /**
   * Note une intervention terminée.
   */
  async rateTicket(id: number, payload: { rating: number; comment?: string }): Promise<any> {
    const response = await axios.post(`/manager/ticket/${id}/rate`, payload);
    return response.data;
  }
};
