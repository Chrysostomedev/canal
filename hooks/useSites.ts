// hooks/useSites.ts
import { useState, useEffect, useRef } from "react";
import {
  getSites,
  getSitesFiltered,
  createSite,
  getSiteStats,
  getManagers,
  Site,
} from "../services/site.service";

const PER_PAGE = 9;

export const useSites = () => {
  const [sites,      setSites]      = useState<Site[]>([]);
  const [stats,      setStats]      = useState<any>(null);
  const [managers,   setManagers]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Références internes pour éviter les closures périmées dans useEffect
  const pageRef    = useRef(page);
  const searchRef  = useRef<string>("");
  const statusRef  = useRef<string | undefined>(undefined);

  useEffect(() => { pageRef.current = page; }, [page]);

  // ─────────────────────────────────────────────
  // FETCH PRINCIPAL — respecte page, search, status
  // Appelé depuis la page avec les params courants
  // ─────────────────────────────────────────────
  const fetchSites = async (
    search?: string,
    status?: string,
    overridePage?: number,
  ) => {
    // Mémorise les derniers params pour que useEffect(page) puisse relancer
    searchRef.current = search ?? "";
    statusRef.current = status;

    const currentPage = overridePage ?? pageRef.current;

    setLoading(true);
    try {
      const { items, meta } = await getSitesFiltered({
        search:   search   || undefined,
        status:   status   || undefined,
        page:     currentPage,
        per_page: PER_PAGE,
      });
      setSites(items);
      setTotalPages(meta.last_page);
      setTotalItems(meta.total);
    } catch {
      setSites([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // FETCH SIMPLE — pour les selects (per_page élevé)
  // Utilisé par la page détails site pour alimenter
  // les listes déroulantes
  // ─────────────────────────────────────────────
  const fetchSitesAll = async () => {
    try {
      const { items } = await getSites(undefined, 1, 1000);
      setSites(items);
    } catch {
      setSites([]);
    }
  };

  // ─────────────────────────────────────────────
  // Auto-fetch au montage (page liste)
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchSites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // Réaction au changement de page
  // Relance avec les derniers search/status mémorisés
  // ─────────────────────────────────────────────
  useEffect(() => {
    // Évite le double-fetch au montage (page vaut déjà 1)
    fetchSites(searchRef.current, statusRef.current, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const data = await getSiteStats();
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  // ─────────────────────────────────────────────
  // Managers
  // ─────────────────────────────────────────────
  const fetchManagers = async () => {
    try {
      const data = await getManagers();
      setManagers(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setManagers([]);
    }
  };

  // ─────────────────────────────────────────────
  // Créer un site
  // ─────────────────────────────────────────────
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
    totalItems,
    setPage,
    fetchSites,       // fetch paginé + filtré (page liste)
    fetchSitesAll,    // fetch tous pour selects (page détails)
    fetchStats,
    fetchManagers,
    addSite,
  };
};