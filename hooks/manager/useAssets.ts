"use client";

// ═══════════════════════════════════════════════════════════════
// hooks/manager/useAssets.ts
// Liste paginée du patrimoine + stats + filtres + export
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { AssetService } from "../../services/manager/asset.service";
import type {
  Asset,
  AssetStats,
  AssetFilters,
  PaginatedResponse,
} from "../../types/manager.types";

interface UseAssetsReturn {
  assets: Asset[];
  stats: AssetStats | null;
  meta: PaginatedResponse<Asset>["meta"] | null;
  filters: AssetFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: (partial: Partial<AssetFilters>) => void;
  refresh: () => void;
  exportAssets: () => Promise<void>;
}

export function useAssets(
  initialFilters: AssetFilters = {}
): UseAssetsReturn {
  const [assets, setAssets]   = useState<Asset[]>([]);
  const [stats, setStats]     = useState<AssetStats | null>(null);
  const [meta, setMeta]       = useState<PaginatedResponse<Asset>["meta"] | null>(null);
  const [filters, setFiltersState] = useState<AssetFilters>({
    page:     1,
    per_page: 15,
    ...initialFilters,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Les deux appels en parallèle
      const [paginated, statsData] = await Promise.all([
        AssetService.getAssets(filters),
        AssetService.getStats(),
      ]);
      setAssets(paginated.items);
      setMeta(paginated.meta);
      setStats(statsData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Impossible de charger le patrimoine."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Merge partiel des filtres + reset page à 1
  const setFilters = (partial: Partial<AssetFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  // Déclenche le téléchargement du fichier Excel
  const exportAssets = async () => {
    try {
      const blob = await AssetService.exportAssets(filters);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `patrimoine_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export patrimoine", err);
    }
  };

  return {
    assets,
    stats,
    meta,
    filters,
    isLoading,
    error,
    setFilters,
    refresh: fetchAll,
    exportAssets,
  };
}