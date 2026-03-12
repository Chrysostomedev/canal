"use client";

// ═══════════════════════════════════════════════════════════════
// hooks/manager/useDashboard.ts
// Charge les stats du dashboard manager au montage du composant
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { DashboardService } from "../../services/manager/dashboard.service";
import type { ManagerDashboardStats } from "../../types/manager.types";

interface UseDashboardReturn {
  stats: ManagerDashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Impossible de charger les statistiques du dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh: fetchStats };
}