// services/site.service.ts
import axios from "../core/axios";

export interface Site {
  id: number;
  nom: string;
  email?: string | null;
  status: "active" | "inactive";
  effectifs?: number | null;
  loyer?: number | null;
  ref_contrat: string;
  phone_responsable?: string | null;
  localisation?: string | null;
  superficie?: string | null;
  date_deb_contrat?: string | null;
  date_fin_contrat?: string | null;
  manager_id?: number | null;
  manager?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  } | null;
}

export interface SitesResponse {
  items: Site[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ← per_page ajouté en 3ème param optionnel — rétrocompatible (défaut: 6)
export const getSites = async (
  search?: string,
  page: number = 1,
  per_page: number = 6
): Promise<SitesResponse> => {
  const response = await axios.get("/admin/site", {
    params: { search, page, per_page },
  });
  return {
    items: response.data.data.items,
    meta: response.data.data.meta,
  };
};

export const createSite = async (data: any): Promise<Site> => {
  const response = await axios.post("/admin/site", data);
  return response.data.data;
};

export const getSiteStats = async () => {
  const response = await axios.get("/admin/site/stats");
  return response.data.data;
};

export const getManagers = async () => {
  const response = await axios.get("/admin/users?role=manager");
  return response.data.data;
};

export const getSiteById = async (id: number): Promise<Site> => {
  const response = await axios.get(`/admin/site/${id}`);
  return response.data.data;
};