// hooks/useReports.ts
import { useState, useCallback } from "react";
import {
  InterventionReport,
  ReportStats,
  ReportService,
  ValidateReportPayload,
} from "../services/report.service";

interface UseReportsReturn {
  reports:       InterventionReport[];
  stats:         ReportStats | null;
  isLoading:     boolean;
  statsLoading:  boolean;
  error:         string | null;
  fetchReports:  () => Promise<void>;
  fetchStats:    () => Promise<void>;
  validateReport:(id: number, payload: ValidateReportPayload) => Promise<void>;
  deleteReport:  (id: number) => Promise<void>;
}

export const useReports = (): UseReportsReturn => {
  const [reports,      setReports]      = useState<InterventionReport[]>([]);
  const [stats,        setStats]        = useState<ReportStats | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Liste des rapports ──
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReportService.getReports();
      // Tri par date décroissante
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()
      );
      setReports(sorted);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de la récupération des rapports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Statistiques ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await ReportService.getStats();
      setStats(data);
    } catch (err: any) {
      // Stats non bloquantes
      console.warn("Erreur stats rapports:", err?.response?.data?.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Valider un rapport — update optimiste ──
  const validateReport = useCallback(async (id: number, payload: ValidateReportPayload) => {
    await ReportService.validateReport(id, payload);
    setReports(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: "validated" as const,
              rating: payload.rating ?? r.rating,
              manager_comment: payload.comment ?? r.manager_comment,
              validated_at: new Date().toISOString(),
            }
          : r
      )
    );
    await fetchStats();
  }, [fetchStats]);

  // ── Supprimer ──
  const deleteReport = useCallback(async (id: number) => {
    await ReportService.deleteReport(id);
    setReports(prev => prev.filter(r => r.id !== id));
    await fetchStats();
  }, [fetchStats]);

  return {
    reports,
    stats,
    isLoading,
    statsLoading,
    error,
    fetchReports,
    fetchStats,
    validateReport,
    deleteReport,
  };
};