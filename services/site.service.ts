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

// 🔹 GET Sites (6 par page)
export const getSites = async (
  search?: string,
  page: number = 1
): Promise<SitesResponse> => {
  const response = await axios.get("/admin/site", {
    params: {
      search,
      page,
      per_page: 6,
    },
  });

  return {
    items: response.data.data.items,
    meta: response.data.data.meta,
  };
};

// 🔹 CREATE Site (conforme store())
export const createSite = async (data: any): Promise<Site> => {
  const response = await axios.post("/admin/site", data);
  return response.data.data;
};

// 🔹 GET Stats
export const getSiteStats = async () => {
  const response = await axios.get("/admin/site/stats");
  return response.data.data;
};

// 🔹 GET Managers (adapter si besoin)
export const getManagers = async () => {
  const response = await axios.get("/admin/users?role=manager");
  return response.data.data;
};
