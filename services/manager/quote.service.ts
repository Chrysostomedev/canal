// ═══════════════════════════════════════════════════════════════
// services/manager/quote.service.ts
// Appels API → /api/manager/quote
// CRUD complet + actions métier : approve/reject/validate/convert
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Quote,
  QuoteStats,
  QuoteFilters,
  CreateQuotePayload,
  UpdateQuotePayload,
} from "../../types/manager.types";

export const QuoteService = {
  /**
   * Liste paginée des devis du site du manager.
   */
  async getQuotes(
    filters: QuoteFilters = {}
  ): Promise<PaginatedResponse<Quote>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Quote>>>(
      "/manager/quote",
      { params: filters }
    );
    return data.data;
  },

  /**
   * Détail d'un devis avec ses items et son historique.
   */
  async getQuote(id: number): Promise<Quote> {
    const { data } = await api.get<ApiResponse<Quote>>(
      `/manager/quote/${id}`
    );
    return data.data;
  },

  /**
   * Statistiques des devis du site.
   */
  async getStats(): Promise<QuoteStats> {
    const { data } = await api.get<ApiResponse<QuoteStats>>(
      "/manager/quote/stats"
    );
    return data.data;
  },

  /**
   * Créer un nouveau devis.
   */
  async createQuote(payload: CreateQuotePayload): Promise<Quote> {
    const { data } = await api.post<ApiResponse<Quote>>(
      "/manager/quote",
      payload
    );
    return data.data;
  },

  /**
   * Mettre à jour un devis existant.
   * Interdit si status = 'validated'.
   */
  async updateQuote(
    id: number,
    payload: UpdateQuotePayload
  ): Promise<Quote> {
    const { data } = await api.put<ApiResponse<Quote>>(
      `/manager/quote/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Supprimer un devis.
   */
  async deleteQuote(id: number): Promise<void> {
    await api.delete(`/manager/quote/${id}`);
  },

  // ── Actions métier ─────────────────────────────────────────────

  /** Approuver un devis (manager / admin) */
  async approveQuote(id: number): Promise<Quote> {
    const { data } = await api.post<ApiResponse<Quote>>(
      `/manager/quote/${id}/approve`
    );
    return data.data;
  },

  /** Rejeter un devis */
  async rejectQuote(id: number, reason?: string): Promise<Quote> {
    const { data } = await api.post<ApiResponse<Quote>>(
      `/manager/quote/${id}/reject`,
      { reason }
    );
    return data.data;
  },

  /** Valider un devis (comptable / admin) */
  async validateQuote(id: number): Promise<Quote> {
    const { data } = await api.post<ApiResponse<Quote>>(
      `/manager/quote/${id}/validate`
    );
    return data.data;
  },

  /** Invalider un devis */
  async invalidateQuote(id: number): Promise<Quote> {
    const { data } = await api.post<ApiResponse<Quote>>(
      `/manager/quote/${id}/invalidate`
    );
    return data.data;
  },

  /** Convertir un devis validé en facture */
  async convertToInvoice(id: number): Promise<{ invoice_id: number }> {
    const { data } = await api.post<ApiResponse<{ invoice_id: number }>>(
      `/manager/quote/${id}/convert-to-invoice`
    );
    return data.data;
  },

  /**
   * Export Excel des devis.
   */
  async exportQuotes(filters: QuoteFilters = {}): Promise<Blob> {
    const response = await api.get("/manager/quote/export", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },
};