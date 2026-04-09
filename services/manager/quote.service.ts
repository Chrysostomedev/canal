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
   * Route /manager/quote/export n'existe pas — on génère côté client.
   */
  async exportQuotes(filters: QuoteFilters = {}): Promise<Blob> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Quote>>>(
      "/manager/quote",
      { params: { ...filters, per_page: 1000, page: 1 } }
    );
    const items: Quote[] = data?.data?.items ?? [];
    const headers = ["Référence", "Prestataire", "Site", "Montant TTC", "Statut"];
    const rows = items.map(q => [
      q.reference,
      q.provider?.company_name ?? q.provider?.name ?? "-",
      q.site?.nom ?? q.site?.name ?? "-",
      q.amount_ttc ?? q.total_amount_ttc ?? 0,
      q.status ?? "-",
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },
};