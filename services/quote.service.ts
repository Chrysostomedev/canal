// services/quote.service.ts
import axiosInstance from "../core/axios";

// ═══════════════════════════════════════════════
// INTERFACES — calquées sur les modèles Laravel
// ═══════════════════════════════════════════════

export interface QuoteItem {
  id?: number;
  designation: string;
  quantity: number;
  unit_price: number;
  total_price?: number;       // quantity * unit_price, calculé par le service Laravel
}

export interface QuoteTicket {
  id: number;
  reference?: string;
  title?: string;
  description?: string;
}

export interface QuoteProvider {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface QuoteSite {
  id: number;
  nom?: string;
  name?: string;
}

export interface Quote {
  id: number;
  reference: string;           // Q-2025-0001
  ticket_id: number;
  provider_id: number;
  site_id: number;
  description?: string | null;
  status: "pending" | "approved" | "rejected";
  approved_by?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;

  // Totaux calculés par QuoteService::calculateTotals()
  amount_ht?: number;
  tax_rate?: number;           // 18% fixe Canal+ CI
  tax_amount?: number;
  amount_ttc?: number;

  created_at?: string;
  updated_at?: string;

  // Relations eager-loaded (with())
  items?: QuoteItem[];
  ticket?: QuoteTicket | null;
  provider?: QuoteProvider | null;
  site?: QuoteSite | null;
}

export interface QuoteStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_approved_amount: number;
  total_pending_amount: number;
}

// Payload POST /admin/quote — QuoteRequest rules
export interface CreateQuotePayload {
  ticket_id: number;
  provider_id: number;
  site_id: number;
  description?: string;
  items: Array<{
    designation: string;
    quantity: number;
    unit_price: number;
  }>;
}

// ═══════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════

export const QuoteService = {

  /**
   * GET /admin/quote
   * Liste tous les devis avec relations (ticket, provider, site)
   */
  async getQuotes(): Promise<Quote[]> {
    const res = await axiosInstance.get("/admin/quote");
    return res.data.data;
  },

  /**
   * GET /admin/quote/:id
   * Détail d'un devis avec items, ticket, provider, site
   */
  async getQuote(id: number): Promise<Quote> {
    const res = await axiosInstance.get(`/admin/quote/${id}`);
    return res.data.data;
  },

  /**
   * GET /admin/quote/stats
   * KPIs : total, pending, approved, rejected + montants
   */
  async getStats(): Promise<QuoteStats> {
    const res = await axiosInstance.get("/admin/quote/stats");
    return res.data.data;
  },

  /**
   * POST /admin/quote
   * Crée un devis avec ses items (QuoteService::createQuote)
   * La référence et les totaux sont calculés côté Laravel
   */
  async createQuote(payload: CreateQuotePayload): Promise<Quote> {
    const res = await axiosInstance.post("/admin/quote", payload);
    return res.data.data;
  },

  /**
   * POST /admin/quote/:id/approve
   * Valide un devis (status → approved)
   */
  async approveQuote(id: number): Promise<Quote> {
    const res = await axiosInstance.post(`/admin/quote/${id}/approve`);
    return res.data.data;
  },

  /**
   * POST /admin/quote/:id/reject
   * Rejette un devis avec motif obligatoire
   */
  async rejectQuote(id: number, reason: string): Promise<Quote> {
    const res = await axiosInstance.post(`/admin/quote/${id}/reject`, { reason });
    return res.data.data;
  },
};