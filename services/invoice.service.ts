// services/invoice.service.ts
import axiosInstance from "../core/axios";

// ═══════════════════════════════════════════════
// INTERFACES — calquées sur le modèle Invoice Laravel
// ═══════════════════════════════════════════════

export interface InvoiceProvider {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface InvoiceSite {
  id: number;
  nom?: string;
  name?: string;
}

export interface InvoiceReport {
  id: number;
  reference?: string;
  description?: string;
}

export interface InvoiceQuote {
  id: number;
  reference?: string;
  amount_ht?: number;
  amount_ttc?: number;
}

export interface Invoice {
  id: number;
  reference: string;                          // INV-2025-0001
  report_id: number;
  quote_id?: number | null;
  provider_id: number;
  site_id: number;
  invoice_date: string;                       // ISO date
  due_date: string;                           // ISO date
  amount_ht: number;
  tax_amount: number;
  amount_ttc: number;
  payment_status: "pending" | "paid" | "overdue" | "cancelled";
  payment_date?: string | null;
  pdf_path?: string | null;                   // chemin relatif storage/public
  imported_by?: number | null;
  created_at?: string;
  updated_at?: string;

  // Relations eager-loaded (with())
  interventionReport?: InvoiceReport | null;
  quote?: InvoiceQuote | null;
  provider?: InvoiceProvider | null;
  site?: InvoiceSite | null;
}

export interface InvoiceStats {
  total_invoices: number;
  total_paid: number;
  total_unpaid: number;
  total_amount: number;
  total_paid_amount: number;
  total_unpaid_amount: number;
}

export interface CreateInvoicePayload {
  report_id: number;
  invoice_date: string;
  due_date: string;
  amount_ht: number;
  tax_amount: number;
  amount_ttc: number;
  pdf?: File | null;
}

// ═══════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════

export const InvoiceService = {

  /**
   * GET /admin/invoice
   * Liste toutes les factures avec relations (provider, site, report, quote)
   */
  async getInvoices(): Promise<Invoice[]> {
    const res = await axiosInstance.get("/admin/invoice");
    return res.data.data;
  },

  /**
   * GET /admin/invoice/:id
   * Détail d'une facture
   */
  async getInvoice(id: number): Promise<Invoice> {
    const res = await axiosInstance.get(`/admin/invoice/${id}`);
    return res.data.data;
  },

  /**
   * GET /admin/invoice/stats
   * KPIs : total, payées, impayées, montants
   */
  async getStats(): Promise<InvoiceStats> {
    const res = await axiosInstance.get("/admin/invoice/stats");
    return res.data.data;
  },

  /**
   * POST /admin/invoice
   * Génère une facture depuis un rapport d'intervention
   * Supporte l'upload PDF en multipart/form-data
   */
  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    const formData = new FormData();
    formData.append("report_id",    String(payload.report_id));
    formData.append("invoice_date", payload.invoice_date);
    formData.append("due_date",     payload.due_date);
    formData.append("amount_ht",    String(payload.amount_ht));
    formData.append("tax_amount",   String(payload.tax_amount));
    formData.append("amount_ttc",   String(payload.amount_ttc));
    if (payload.pdf) {
      formData.append("pdf", payload.pdf);
    }
    const res = await axiosInstance.post("/admin/invoice", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  /**
   * PUT /admin/invoice/:id
   * Mise à jour d'une facture
   */
  async updateInvoice(id: number, payload: Partial<CreateInvoicePayload>): Promise<Invoice> {
    const res = await axiosInstance.put(`/admin/invoice/${id}`, payload);
    return res.data.data;
  },

  /**
   * DELETE /admin/invoice/:id
   */
  async deleteInvoice(id: number): Promise<void> {
    await axiosInstance.delete(`/admin/invoice/${id}`);
  },

  /**
   * POST /admin/invoice/:id/mark-paid
   * Marque une facture comme payée
   */
  async markAsPaid(id: number): Promise<Invoice> {
    const res = await axiosInstance.post(`/admin/invoice/${id}/mark-paid`);
    return res.data.data;
  },

  /**
   * Construit l'URL publique du PDF
   * pdf_path = "invoices/xxx.pdf" → APP_URL/storage/invoices/xxx.pdf
   */
  getPdfUrl(pdfPath: string): string {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "";
    return `${base}/storage/${pdfPath}`;
  },
};