// services/asset.service.ts
import axios from "../core/axios";

export interface CompanyAsset {
  id: number;
  type_company_asset_id: number;
  sub_type_company_asset_id: number;
  type: { id: number; code: string; name: string } | null;
  sub_type: { id: number; code: string; name: string } | null;
  subType?: { id: number; code: string; name: string } | null;
  site: { id: number; name: string; nom?: string } | null;
  designation: string;
  codification: string;
  status: "actif" | "inactif" | "hors_usage";
  criticite?: "critique" | "non_critique";
  date_entree: string;
  valeur_entree: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssetStats {
  total_actifs: number;
  actifs_actifs: number;
  actifs_inactifs: number;
  actifs_hors_usage: number;
  valeur_totale_patrimoine: number;
  valeur_moyenne_actif: number;
  cout_moyen_entretien: number;
  total_actifs_critiques: number;
  total_actifs_non_critiques: number;
  actif_le_plus_critique: string | null;
  total_tickets_en_cours: number;
  cout_actifs_critiques: number;
  actifs_critiques_top3: {
    asset_id: number;
    designation: string;
    codification: string;
    status: string;
    tickets_ouverts: number;
  }[];
  delai_intervention_critique_heures: number | null;
  delai_moyen_global_heures: number | null;
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

  async getStats(): Promise<AssetStats> {
    const response = await axios.get("/admin/asset/stats");
    return response.data.data;
  },

  async createAsset(payload: {
    type_company_asset_id: number;
    sub_type_company_asset_id: number;
    site_id: number;
    designation: string;
    product_type_code: string;
    status: "actif" | "inactif" | "hors_usage";
    criticite?: "critique" | "non_critique";
    date_entree: string;
    valeur_entree: number;
    description?: string;
  }) {
    const response = await axios.post("/admin/asset", payload);
    return response.data.data as CompanyAsset;
  },

  async updateAsset(id: number, payload: Partial<{
    type_company_asset_id: number;
    sub_type_company_asset_id: number;
    site_id: number;
    designation: string;
    codification: string;
    status: "actif" | "inactif" | "hors_usage";
    criticite: "critique" | "non_critique";
    date_entree: string;
    valeur_entree: number;
    description: string;
  }>) {
    const response = await axios.put(`/admin/asset/${id}`, payload);
    return response.data.data as CompanyAsset;
  },

  async deleteAsset(id: number) {
    const response = await axios.delete(`/admin/asset/${id}`);
    return response.data.success as boolean;
  },

  // GET /admin/asset/export — télécharge le fichier Excel
  async exportAssets(params?: { site_id?: number; type_id?: number; status?: string }) {
    const response = await axios.get("/admin/asset/export", {
      params,
      responseType: "blob", // important pour les fichiers binaires
    });
    // Déclenche le téléchargement dans le navigateur
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `actifs_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // POST /admin/asset/import — importe depuis un fichier Excel/CSV
  async importAssets(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post("/admin/asset/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};