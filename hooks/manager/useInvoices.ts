"use client";

// ═══════════════════════════════════════════════════════════════
// hooks/manager/useInvoices.ts
// Liste paginée des factures + stats + export
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { InvoiceService } from "../../services/manager/invoice.service";
import type {
  Invoice,
  InvoiceStats,
  InvoiceFilters,
  PaginatedResponse,
} from "../../types/manager.types";

interface UseInvoicesReturn {
  invoices: Invoice[];
  stats: InvoiceStats | null;
  meta: PaginatedResponse<Invoice>["meta"] | null;
  filters: InvoiceFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: (f: Partial<InvoiceFilters>) => void;
  refresh: () => void;
  exportInvoices: () => Promise<void>;
}

export function useInvoices(
  initialFilters: InvoiceFilters = {}
): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [meta, setMeta] =
    useState<PaginatedResponse<Invoice>["meta"] | null>(null);
  const [filters, setFiltersState] = useState<InvoiceFilters>({
    page: 1,
    per_page: 15,
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [paginatedData, statsData] = await Promise.all([
        InvoiceService.getInvoices(filters),
        InvoiceService.getStats(),
      ]);
      setInvoices(paginatedData.items);
      setMeta(paginatedData.meta);
      setStats(statsData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Impossible de charger les factures."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const setFilters = (partial: Partial<InvoiceFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const exportInvoices = async () => {
    try {
      const blob = await InvoiceService.exportInvoices(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factures_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export factures", err);
    }
  };

  return {
    invoices,
    stats,
    meta,
    filters,
    isLoading,
    error,
    setFilters,
    refresh: fetchAll,
    exportInvoices,
  };
}