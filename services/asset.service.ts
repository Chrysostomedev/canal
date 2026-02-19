// services/asset.service.ts
import axios from "../core/axios";

export interface CompanyAsset {
  id: number;
  type_company_asset_id: number;
  sub_type_company_asset_id: number;
  type: { id: number; code: string; name: string } | null;
  subType: { id: number; code: string; name: string } | null;
  site: { id: number; name: string } | null;
  designation: string;
  codification: string;
  status: "actif" | "inactif" | "hors_usage";
  date_entree: string;
  valeur_entree: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const AssetService = {
  async getAssets(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    type_id?: number;
    sub_type_id?: number;
    status?: string;
    site_id?: number;
  }): Promise<{ items: CompanyAsset[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> {
    const response = await axios.get("/admin/asset", { params });
    return response.data.data;
  },

  // async getAsset(id: number) {
  //   const response = await axios.get(`/admin/asset/${id}`); // <-- corrigé ici
  //   return response.data.data as CompanyAsset;
  // },

  async createAsset(payload: {
    type_company_asset_id: number;
    sub_type_company_asset_id: number;
    site_id: number;
    designation: string;
    codification: string;
    status: "actif" | "inactif" | "hors_usage";
    date_entree: string;
    valeur_entree: number;
    description?: string;
  }) {
    const response = await axios.post("/admin/asset", payload); // <-- corrigé ici
    return response.data.data as CompanyAsset;
  },

  async updateAsset(
    id: number,
    payload: Partial<{
      type_company_asset_id: number;
      sub_type_company_asset_id: number;
      site_id: number;
      designation: string;
      codification: string;
      status: "actif" | "inactif" | "hors_usage";
      date_entree: string;
      valeur_entree: number;
      description?: string;
    }>
  ) {
    const response = await axios.put(`/admin/asset/${id}`, payload); // <-- corrigé ici
    return response.data.data as CompanyAsset;
  },

  async deleteAsset(id: number) {
    const response = await axios.delete(`/admin/asset/${id}`); // <-- corrigé ici
    return response.data.success as boolean;
  },

  async getStats() {
    const response = await axios.get("/admin/asset/stats"); // <-- corrigé ici
    return response.data.data;
  },
};
