// hooks/useSite.ts
import { useState, useEffect, useCallback } from "react";
import SiteService, { Site, SiteStats } from "../services/site.service";

export function useSite(initialPage = 1) {
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchSites = useCallback(async () => {
    try {
      setLoadingSites(true);
      const data = await SiteService.getSites(page, search);
      setSites(data.items);
      setTotalPages(data.meta.last_page);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des sites");
    } finally {
      setLoadingSites(false);
    }
  }, [page, search]);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await SiteService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const createSite = async (siteData: any) => {
    try {
      const newSite = await SiteService.createSite(siteData);
      // Refresh sites + stats
      fetchSites();
      fetchStats();
      return newSite;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteSite = async (id: number) => {
    try {
      await SiteService.deleteSite(id);
      fetchSites();
      fetchStats();
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    sites,
    stats,
    loadingSites,
    loadingStats,
    error,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    fetchSites,
    fetchStats,
    createSite,
    deleteSite,
  };
}
