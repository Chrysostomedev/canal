// hooks/useProviders.ts
import { useState, useEffect } from "react";
import { ProviderService, Provider, ProviderStats } from "../services/provider.service";

export const useProviders = () => {
  // ── Usage original conservé — tableau simple pour les selects ──
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Nouveaux états pour la page liste paginée ──
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ is_active?: boolean; service_id?: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  // ── Chargement initial simple (rétrocompatible) ──
  // Utilisé par les selects dans les formulaires (tickets, etc.)
  useEffect(() => {
    setLoading(true);
    ProviderService.getProviders()
      .then(data => setProviders(data as Provider[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Chargement paginé pour la page liste ──
  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const result = await ProviderService.getProviders({
        page,
        per_page: 12,
        search: search || undefined,
        ...filters,
      }) as { items: Provider[]; meta: any };
      setProviders(result.items);
      setMeta(result.meta);
    } catch (err: any) {
      console.error("Erreur chargement prestataires", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stats globales ──
  const fetchStats = async () => {
    try {
      const data = await ProviderService.getStats();
      setStats(data);
    } catch {}
  };

  // Refetch quand page/search/filters changent — seulement si utilisé en mode liste
  useEffect(() => {
    if (page > 1 || search || Object.keys(filters).length > 0) {
      fetchProviders();
    }
  }, [page, search, filters]);

  const applySearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return {
    // Rétrocompatible avec l'usage select/formulaire
    providers,
    loading,
    // Nouveaux pour la page liste
    stats,
    meta,
    page, setPage,
    search, applySearch,
    filters, applyFilters,
    isLoading,
    fetchProviders,
    fetchStats,
  };
};