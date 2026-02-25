// services/site.service.ts
import axios from "../core/axios";

export interface Site {
  id: number;
  nom: string;
  responsable_name?: string | null;
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
    phone?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
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

export interface SiteFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

// ── Liste paginée
export const getSites = async (
  search?: string,
  page: number = 1,
  per_page: number = 9
): Promise<SitesResponse> => {
  const response = await axios.get("/admin/site", {
    params: { search, page, per_page },
  });
  return {
    items: response.data.data.items,
    meta:  response.data.data.meta,
  };
};

// ── Liste filtrée (objet complet)
export const getSitesFiltered = async (
  filters: SiteFilters
): Promise<SitesResponse> => {
  const response = await axios.get("/admin/site", { params: filters });
  return {
    items: response.data.data.items,
    meta:  response.data.data.meta,
  };
};

// ── Créer un site
export const createSite = async (data: any): Promise<Site> => {
  const response = await axios.post("/admin/site", data);
  return response.data.data;
};

// ── Mettre à jour un site
export const updateSite = async (id: number, data: any): Promise<Site> => {
  const response = await axios.put(`/admin/site/${id}`, data);
  return response.data.data;
};

// ── Supprimer un site
export const deleteSite = async (id: number): Promise<boolean> => {
  const response = await axios.delete(`/admin/site/${id}`);
  return response.data.success;
};

// ── Stats
export const getSiteStats = async () => {
  const response = await axios.get("/admin/site/stats");
  return response.data.data;
};

// ── Managers (rôle manager)
export const getManagers = async () => {
  const response = await axios.get("/admin/users?role=manager");
  return response.data.data;
};

// ── Détail d'un site
export const getSiteById = async (id: number): Promise<Site> => {
  const response = await axios.get(`/admin/site/${id}`);
  return response.data.data;
};

// ── Export Excel — GET /admin/site/export (blob)
export const exportSites = async (filters?: { status?: string }) => {
  const response = await axios.get("/admin/site/export", {
    params: filters ?? {},
    responseType: "blob",
  });
  return response;
};

// ── Import Excel — POST /admin/site/import (multipart)
export const importSites = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  const response = await axios.post("/admin/site/import", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};