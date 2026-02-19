// hooks/useAssets.ts
import { useState, useEffect } from "react";
import { CompanyAsset, AssetService } from "../services/asset.service";

export const useAssets = () => {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ search?: string; type_id?: number; sub_type_id?: number; status?: string }>({});

  const fetchAssets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 15, ...filters };
      const data = await AssetService.getAssets(params);
      
      console.log("🔍 RAW API RESPONSE:", JSON.stringify(data, null, 2)); // ← ICI
  
      setAssets(data.items);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des actifs");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Refetch à chaque changement de page ou de filtre
  useEffect(() => {
    fetchAssets();
  }, [page, filters]);

  const changePage = (newPage: number) => setPage(newPage);

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // reset pagination sur filtrage
  };

  return {
    assets,
    isLoading,
    error,
    fetchAssets,
    meta,
    page,
    setPage: changePage,
    filters,
    applyFilters,
  };
};
