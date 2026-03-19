import { useState, useEffect, useCallback } from "react";
import { SiteService } from "../../services/manager/site.service";
import { AssetService } from "../../services/manager/asset.service";
import type { ManagerSite, AssetStats } from "../../types/manager.types";

export function useSite() {
  const [site, setSite] = useState<ManagerSite | null>(null);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sitesData, statsData] = await Promise.all([
        SiteService.getSites(),
        AssetService.getStats(),
      ]);
      
      // Le manager est généralement assigné à un seul site
      setSite(sitesData[0] || null);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des données du site");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { site, stats, isLoading, error, refresh: fetchData };
}