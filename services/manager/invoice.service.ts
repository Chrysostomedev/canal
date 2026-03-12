// ═══════════════════════════════════════════════════════════════
// services/manager/invoice.service.ts
// Appels API → /api/manager/invoice
// Lecture seule pour le manager — filtrage site géré côté backend
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Invoice,
  InvoiceStats,
  InvoiceFilters,
} from "../../types/manager.types";

export const InvoiceService = {
  /**
   * Liste paginée des factures du site du manager.
   */
  async getInvoices(
    filters: InvoiceFilters = {}
  ): Promise<PaginatedResponse<Invoice>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Invoice>>>(
      "/manager/invoice",
      { params: filters }
    );
    return data.data;
  },

  /**
   * Détail complet d'une facture (avec rapport, devis, prestataire).
   */
  async getInvoice(id: number): Promise<Invoice> {
    const { data } = await api.get<ApiResponse<Invoice>>(
      `/manager/invoice/${id}`
    );
    return data.data;
  },

  /**
   * Statistiques des factures du site.
   */
  async getStats(): Promise<InvoiceStats> {
    const { data } = await api.get<ApiResponse<InvoiceStats>>(
      "/manager/invoice/stats"
    );
    return data.data;
  },

  /**
   * Récupère les factures liées au même rapport d'intervention.
   * Utile pour afficher les "factures liées" dans le détail.
   */
  async getInvoicesByReport(reportId: number): Promise<Invoice[]> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Invoice>>>(
      "/manager/invoice",
      { params: { report_id: reportId, per_page: 100 } }
    );
    // Le backend retourne PaginatedResponse — on extrait les items
    return data.data.items ?? [];
  },

  /**
   * Export Excel des factures.
   */
  async exportInvoices(filters: InvoiceFilters = {}): Promise<Blob> {
    const response = await api.get("/manager/invoice/export", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Construit l'URL publique d'un fichier PDF stocké sur le serveur.
   * Exemple : "invoices_attachments/xxx.pdf" → baseURL/storage/invoices_attachments/xxx.pdf
   */
  getPdfUrl(pdfPath: string): string {
    const base =
      process.env.NEXT_PUBLIC_STORAGE_URL ??
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
      "";
    return `${base}/storage/${pdfPath}`;
  },
};