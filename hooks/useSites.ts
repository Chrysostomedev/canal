// hooks/useSites.ts
import { useState } from "react";
import {
  getSites,
  createSite,
  getSiteStats,
  getManagers,
  Site,
} from "../services/site.service";

export const useSites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSites = async (search?: string) => {
    try {
      setLoading(true);
      const { items, meta } = await getSites(search, page);
      setSites(items);
      setTotalPages(meta.last_page);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getSiteStats();
      setStats(data);
    } catch {
      // fallback sécurisé
      setStats({
        totalPages: 0,
        sites_actifs: 0,
        sites_inactifs: 0,
        cout_moyen_par_site: 0,
        tickets_par_site: 0,
      });
    }
  };

  const fetchManagers = async () => {
    try {
      const data = await getManagers();
      setManagers(data);
    } catch {
      setManagers([]);
    }
  };

  const addSite = async (data: any) => {
    await createSite(data);
  };

  return {
    sites,
    stats,
    managers,
    loading,
    page,
    totalPages,
    setPage,
    fetchSites,
    fetchStats,
    fetchManagers,
    addSite,
  };
};
