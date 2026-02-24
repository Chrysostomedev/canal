// hooks/useInvoices.ts
import { useState, useCallback } from "react";
import { Invoice, InvoiceStats, InvoiceService } from "../services/invoice.service";

interface UseInvoicesReturn {
  invoices:      Invoice[];
  stats:         InvoiceStats | null;
  isLoading:     boolean;
  statsLoading:  boolean;
  error:         string | null;
  fetchInvoices: () => Promise<void>;
  fetchStats:    () => Promise<void>;
  markAsPaid:    (id: number) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
}

export const useInvoices = (): UseInvoicesReturn => {
  const [invoices,     setInvoices]     = useState<Invoice[]>([]);
  const [stats,        setStats]        = useState<InvoiceStats | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Liste des factures ──
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await InvoiceService.getInvoices();
      // Tri par date décroissante (plus récente en haut)
      const sorted = [...data].sort(
        (a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
      );
      setInvoices(sorted);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de la récupération des factures.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Statistiques ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await InvoiceService.getStats();
      setStats(data);
    } catch (err: any) {
      // Stats non bloquantes — on n'affiche pas d'erreur critique
      console.warn("Erreur stats factures:", err?.response?.data?.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Marquer comme payée ──
  const markAsPaid = useCallback(async (id: number) => {
    await InvoiceService.markAsPaid(id);
    // Mise à jour locale optimiste pour éviter un refetch complet
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === id
          ? { ...inv, payment_status: "paid", payment_date: new Date().toISOString() }
          : inv
      )
    );
    // Refresh stats après paiement
    await fetchStats();
  }, [fetchStats]);

  // ── Supprimer ──
  const deleteInvoice = useCallback(async (id: number) => {
    await InvoiceService.deleteInvoice(id);
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    await fetchStats();
  }, [fetchStats]);

  return {
    invoices,
    stats,
    isLoading,
    statsLoading,
    error,
    fetchInvoices,
    fetchStats,
    markAsPaid,
    deleteInvoice,
  };
};