// ═══════════════════════════════════════════════════════════════
// services/manager/invoice.service.ts
// Factures du manager — pas de route directe accessible.
// Stratégie :
//   - Stats : calculées depuis les tickets (champ cout)
//   - Liste : depuis les rapports d'intervention (relation invoice si chargée)
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Invoice,
  InvoiceStats,
  InvoiceFilters,
} from "../../types/manager.types";

// ── Récupère les tickets avec leur cout pour les stats ────────────────────────
async function fetchTicketsForStats(): Promise<any[]> {
  try {
    const { data } = await api.get("/manager/ticket", {
      params: { per_page: 500, page: 1 },
    });
    return data?.data?.items ?? [];
  } catch {
    return [];
  }
}

// ── Récupère les rapports (peuvent avoir invoice chargée) ─────────────────────
async function fetchReportsWithInvoice(filters: InvoiceFilters = {}): Promise<Invoice[]> {
  try {
    const { data } = await api.get("/manager/intervention-report", {
      params: { per_page: 500, page: 1 },
    });
    const reports: any[] = data?.data?.items ?? [];

    const invoices: Invoice[] = [];
    for (const r of reports) {
      // Si le rapport a une facture chargée (dépend du back)
      if (r.invoice) {
        invoices.push({ ...r.invoice, provider: r.provider, site: r.site });
      }
    }

    return filters.payment_status
      ? invoices.filter(i => (i.payment_status ?? i.status) === filters.payment_status)
      : invoices;
  } catch {
    return [];
  }
}

export const InvoiceService = {
  /**
   * Liste paginée des factures.
   * Si les rapports ne chargent pas invoice, retourne liste vide (pas d'erreur).
   */
  async getInvoices(
    filters: InvoiceFilters = {}
  ): Promise<PaginatedResponse<Invoice>> {
    const all      = await fetchReportsWithInvoice(filters);
    const page     = filters.page     ?? 1;
    const per_page = filters.per_page ?? 15;
    const start    = (page - 1) * per_page;
    const items    = all.slice(start, start + per_page);
    const last_page = Math.max(1, Math.ceil(all.length / per_page));
    return {
      items,
      meta: { current_page: page, last_page, per_page, total: all.length },
    };
  },

  /**
   * Détail d'une facture.
   */
  async getInvoice(id: number): Promise<Invoice> {
    const all = await fetchReportsWithInvoice();
    const inv = all.find(i => i.id === id);
    if (!inv) throw new Error("Facture introuvable");
    return inv;
  },

  /**
   * Statistiques financières calculées depuis les tickets (champ cout).
   * C'est la seule source fiable accessible au manager.
   */
  async getStats(): Promise<InvoiceStats> {
    const tickets = await fetchTicketsForStats();

    // Tickets clos avec un coût = facturés
    const withCost  = tickets.filter(t => t.cout && Number(t.cout) > 0);
    const closed    = withCost.filter(t => ["CLOS", "clos", "ÉVALUÉ", "évalué"].includes(t.status));
    const ongoing   = withCost.filter(t => !["CLOS", "clos", "ÉVALUÉ", "évalué"].includes(t.status));

    const totalAmount  = withCost.reduce((s, t) => s + Number(t.cout ?? 0), 0);
    const paidAmount   = closed.reduce((s, t)   => s + Number(t.cout ?? 0), 0);
    const unpaidAmount = ongoing.reduce((s, t)  => s + Number(t.cout ?? 0), 0);

    return {
      total:               withCost.length,
      paid:                closed.length,
      unpaid:              ongoing.length,
      total_invoices:      withCost.length,
      total_paid:          closed.length,
      total_unpaid:        ongoing.length,
      total_amount:        totalAmount,
      paid_amount:         paidAmount,
      total_paid_amount:   paidAmount,
      unpaid_amount:       unpaidAmount,
      total_unpaid_amount: unpaidAmount,
    };
  },

  async getInvoicesByReport(reportId: number): Promise<Invoice[]> {
    const all = await fetchReportsWithInvoice();
    return all.filter(i => (i as any).report_id === reportId);
  },

  async exportInvoices(filters: InvoiceFilters = {}): Promise<Blob> {
    const items = await fetchReportsWithInvoice(filters);
    const headers = ["Référence", "Prestataire", "Site", "Date", "Montant TTC", "Statut"];
    const rows = items.map(i => [
      i.reference,
      i.provider?.company_name ?? "-",
      i.site?.nom ?? i.site?.name ?? "-",
      i.invoice_date ?? "-",
      i.amount_ttc ?? i.total_amount_ttc ?? 0,
      i.payment_status ?? i.status ?? "-",
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    return new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  },

  getPdfUrl(pdfPath: string): string {
    const base =
      process.env.NEXT_PUBLIC_STORAGE_URL ??
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
      "";
    return `${base}/storage/${pdfPath}`;
  },
};
