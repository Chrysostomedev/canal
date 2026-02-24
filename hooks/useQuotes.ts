// hooks/useQuotes.ts
import { useState, useCallback } from "react";
import { Quote, QuoteStats, QuoteService, CreateQuotePayload } from "../services/quote.service";

interface UseQuotesReturn {
  quotes:       Quote[];
  stats:        QuoteStats | null;
  isLoading:    boolean;
  statsLoading: boolean;
  error:        string | null;
  fetchQuotes:  () => Promise<void>;
  fetchStats:   () => Promise<void>;
  approveQuote: (id: number) => Promise<void>;
  rejectQuote:  (id: number, reason: string) => Promise<void>;
  createQuote:  (payload: CreateQuotePayload) => Promise<Quote>;
}

export const useQuotes = (): UseQuotesReturn => {
  const [quotes,       setQuotes]       = useState<Quote[]>([]);
  const [stats,        setStats]        = useState<QuoteStats | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Liste des devis ──
  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await QuoteService.getQuotes();
      // Tri par date décroissante (plus récent en haut) — index() retourne latest()
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      );
      setQuotes(sorted);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de la récupération des devis.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Statistiques ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await QuoteService.getStats();
      setStats(data);
    } catch (err: any) {
      console.warn("Erreur stats devis:", err?.response?.data?.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Approuver — mise à jour optimiste locale ──
  const approveQuote = useCallback(async (id: number) => {
    await QuoteService.approveQuote(id);
    setQuotes(prev =>
      prev.map(q => q.id === id
        ? { ...q, status: "approved", approved_at: new Date().toISOString() }
        : q
      )
    );
    await fetchStats();
  }, [fetchStats]);

  // ── Rejeter — mise à jour optimiste locale ──
  const rejectQuote = useCallback(async (id: number, reason: string) => {
    await QuoteService.rejectQuote(id, reason);
    setQuotes(prev =>
      prev.map(q => q.id === id
        ? { ...q, status: "rejected", rejection_reason: reason }
        : q
      )
    );
    await fetchStats();
  }, [fetchStats]);

  // ── Créer un devis ──
  const createQuote = useCallback(async (payload: CreateQuotePayload): Promise<Quote> => {
    const newQuote = await QuoteService.createQuote(payload);
    await fetchQuotes();
    await fetchStats();
    return newQuote;
  }, [fetchQuotes, fetchStats]);

  return {
    quotes,
    stats,
    isLoading,
    statsLoading,
    error,
    fetchQuotes,
    fetchStats,
    approveQuote,
    rejectQuote,
    createQuote,
  };
};