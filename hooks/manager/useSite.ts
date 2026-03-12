"use client";

// ═══════════════════════════════════════════════════════════════
// hooks/manager/useSite.ts
// Charge le(s) site(s) du manager + stats associées
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { SiteService } from ".../../../services/manager/site.service";
import type { ManagerSite, SiteStats } from "../../types/manager.types";

interface UseSiteReturn {
  sites: ManagerSite[];
  /** Premier site (le manager n'en a généralement qu'un) */
  site: ManagerSite | null;
  stats: SiteStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  exportSite: () => Promise<void>;
}

export function useSite(): UseSiteReturn {
  const [sites, setSites] = useState<ManagerSite[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sitesData, statsData] = await Promise.all([
        SiteService.getSites(),
        SiteService.getStats(),
      ]);
      setSites(sitesData);
      setStats(statsData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Impossible de charger les données du site."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** Déclenche le téléchargement du fichier Excel du site */
  const exportSite = async () => {
    try {
      const blob = await SiteService.exportSite();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "site_export.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export site", err);
    }
  };

  return {
    sites,
    site: sites[0] ?? null,
    stats,
    isLoading,
    error,
    refresh: fetchAll,
    exportSite,
  };
}