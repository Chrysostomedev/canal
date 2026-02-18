// services/site.service.ts
import axios from "../core/axios";

export interface Site {
  id: number;
  nom: string;
  localisation: string;
  status: string;
  email: string;
  phone_responsable: string;
  effectifs: number;
  manager?: { id: number; name: string; email: string };
}

export interface SiteStats {
  sites_actifs: number;
  sites_inactifs: number;
  cout_moyen_par_site: number;
  tickets_par_site: { site_id: number; en_cours: number; clos: number }[];
  delai_moyen_par_site: number;
  top_sites: string[];
}

const SiteService = {
  getSites: async (page = 1, search = "") => {
    const response = await axios.get("/site", { params: { page, search } });
    return response.data;
  },

  getSiteById: async (id: number) => {
    const response = await axios.get(`/site/${id}`);
    return response.data;
  },

  createSite: async (siteData: any) => {
    const response = await axios.post("/site-with-manager", siteData);
    return response.data;
  },

  updateSite: async (id: number, siteData: any) => {
    const response = await axios.put(`/site/${id}`, siteData);
    return response.data;
  },

  deleteSite: async (id: number) => {
    const response = await axios.delete(`/site/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get("/site/stats");
    return response.data;
  },
};

export default SiteService;
