"use client";

// ═══════════════════════════════════════════════════════════════
// hooks/manager/useQuotes.ts
// Liste paginée des devis + stats + export
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { QuoteService } from ".../../../services/manager/quote.service";
import type {
  Quote,
  QuoteStats,
  QuoteFilters,
  PaginatedResponse,
} from "../../types/manager.types";

interface UseQuotesReturn {
  quotes: Quote[];
  stats: QuoteStats | null;
  meta: PaginatedResponse<Quote>["meta"] | null;
  filters: QuoteFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: (f: Partial<QuoteFilters>) => void;
  refresh: () => void;
  exportQuotes: () => Promise<void>;
}

export function useQuotes(initialFilters: QuoteFilters = {}): UseQuotesReturn {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [meta, setMeta] = useState<PaginatedResponse<Quote>["meta"] | null>(null);
  const [filters, setFiltersState] = useState<QuoteFilters>({
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
        QuoteService.getQuotes(filters),
        QuoteService.getStats(),
      ]);
      setQuotes(paginatedData.items);
      setMeta(paginatedData.meta);
      setStats(statsData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Impossible de charger les devis."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const setFilters = (partial: Partial<QuoteFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const exportQuotes = async () => {
    try {
      const blob = await QuoteService.exportQuotes(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devis_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export devis", err);
    }
  };

  return {
    quotes,
    stats,
    meta,
    filters,
    isLoading,
    error,
    setFilters,
    refresh: fetchAll,
    exportQuotes,
  };
}