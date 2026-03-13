// services/site.service.ts
import axios from "../../core/axios";

// ─────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────

export interface Site {
  id:                number;
  nom:               string;
  email?:            string | null;
  status:            "active" | "inactive";
  effectifs?:        number | null;
  loyer?:            number | null;
  ref_contrat:       string;
  localisation?:     string | null;
  superficie?:       string | null;
  date_deb_contrat?: string | null;
  date_fin_contrat?: string | null;
  manager_id?:       number | null;
  manager?: {
    id:            number;
    first_name?:   string;
    name?:         string; // FIX: ajout fallback — certains backends renvoient "name"
    email:         string;
    phone_number?: string;
    phone?:        string; // FIX: ajout fallback
  } | null;
  // FIX: champs à plat parfois renvoyés directement par l'API
  responsable_name?:  string | null;
  phone_responsable?: string | null;
  created_at?:        string;
  updated_at?:        string;
}

export interface Manager {
  id:            number;
  first_name?:   string;
  name?:         string;
  email:         string;
  phone_number?: string;
  phone?:        string;
}

export interface SitesResponse {
  items: Site[];
  meta: {
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
  };
}

export interface SiteFilters {
  search?:   string;
  status?:   string;
  page?:     number;
  per_page?: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS — résolution robuste des champs manager
// ─────────────────────────────────────────────────────────────

/** Retourne le nom du manager quelle que soit la structure du back */
export const resolveManagerName = (item: Site | Manager | null): string => {
  if (!item) return "—";
  // Champ à plat (Site uniquement)
  if ("responsable_name" in item && item.responsable_name) return item.responsable_name;
  // Objet manager imbriqué (Site)
  if ("manager" in item && item.manager) {
    return item.manager.first_name ?? item.manager.name ?? item.manager.email ?? "—";
  }
  // Manager directement (liste managers)
  if ("first_name" in item && item.first_name) return item.first_name;
  if ("name" in item && (item as any).name)     return (item as any).name;
  if ("email" in item && item.email)            return item.email;
  return "—";
};

/** Retourne le téléphone quelle que soit la structure du back */
export const resolveManagerPhone = (site: Site | null): string => {
  if (!site) return "—";
  return (
    site.phone_responsable          ??
    site.manager?.phone_number      ??
    site.manager?.phone             ??
    "—"
  );
};

/** Retourne l'email quelle que soit la structure du back */
export const resolveManagerEmail = (site: Site | null): string => {
  if (!site) return "—";
  return site.email ?? site.manager?.email ?? "—";
};

// ─────────────────────────────────────────────────────────────
// HELPERS — parsing sécurisé de la réponse API
// ─────────────────────────────────────────────────────────────

/**
 * FIX (Bug 1) : parse robustement la réponse de n'importe quel endpoint paginé.
 * Gère les shapes : { items, meta }, { data: { items, meta } }, tableau brut.
 */
const parsePaginatedResponse = (responseData: any): SitesResponse => {
  // Shape : { items: [], meta: {} }
  if (responseData?.items && responseData?.meta) {
    return { items: responseData.items, meta: responseData.meta };
  }
  // Shape : { data: { items: [], meta: {} } }
  if (responseData?.data?.items && responseData?.data?.meta) {
    return { items: responseData.data.items, meta: responseData.data.meta };
  }
  // Shape : tableau brut
  if (Array.isArray(responseData)) {
    return {
      items: responseData,
      meta: { current_page: 1, last_page: 1, per_page: responseData.length, total: responseData.length },
    };
  }
  // Shape : { data: [] } (tableau dans data)
  if (Array.isArray(responseData?.data)) {
    return {
      items: responseData.data,
      meta: { current_page: 1, last_page: 1, per_page: responseData.data.length, total: responseData.data.length },
    };
  }
  // Fallback sécurisé
  console.warn("[site.service] parsePaginatedResponse: shape inconnue", responseData);
  return { items: [], meta: { current_page: 1, last_page: 1, per_page: 9, total: 0 } };
};

/**
 * FIX (Bug 1) : parse robustement la réponse de /admin/users?role=manager.
 * Retourne toujours un Manager[].
 */
const parseManagersResponse = (responseData: any): Manager[] => {
  // Shape : { data: { items: [] } }
  if (Array.isArray(responseData?.data?.items))  return responseData.data.items;
  // Shape : { data: [] }
  if (Array.isArray(responseData?.data))         return responseData.data;
  // Shape : { items: [] }
  if (Array.isArray(responseData?.items))        return responseData.items;
  // Shape : tableau brut
  if (Array.isArray(responseData))               return responseData;

  console.warn("[site.service] parseManagersResponse: shape inconnue", responseData);
  return [];
};

// ─────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────

// ── Liste paginée
export const getSites = async (
  search?: string,
  page:     number = 1,
  per_page: number = 9,
): Promise<SitesResponse> => {
  const response = await axios.get("/admin/site", {
    params: { search, page, per_page },
  });
  return parsePaginatedResponse(response.data);
};

// ── Liste filtrée (objet complet)
export const getSitesFiltered = async (
  filters: SiteFilters,
): Promise<SitesResponse> => {
  const response = await axios.get("/admin/site", { params: filters });
  return parsePaginatedResponse(response.data);
};

// ── Créer un site
export const createSite = async (data: any): Promise<Site> => {
  const response = await axios.post("/admin/site", data);
  return response.data?.data ?? response.data;
};

// ── Mettre à jour un site
export const updateSite = async (id: number, data: any): Promise<Site> => {
  const response = await axios.put(`/admin/site/${id}`, data);
  return response.data?.data ?? response.data;
};

// ── Supprimer un site
export const deleteSite = async (id: number): Promise<boolean> => {
  const response = await axios.delete(`/admin/site/${id}`);
  return response.data?.success ?? true;
};

// ── Stats
export const getSiteStats = async () => {
  const response = await axios.get("/admin/site/stats");
  return response.data?.data ?? response.data;
};

// ── Managers (rôle manager) — FIX (Bug 1) : parsing robuste
export const getManagers = async (): Promise<Manager[]> => {
  const response = await axios.get("/admin/admins", { params: { role: "MANAGER" } });
  return parseManagersResponse(response.data);
};

// ── Détail d'un site
export const getSiteById = async (id: number): Promise<Site> => {
  const response = await axios.get(`/admin/site/${id}`);
  return response.data?.data ?? response.data;
};

// ── Export Excel
export const exportSites = async (filters?: { status?: string }) => {
  const response = await axios.get("/admin/site/export", {
    params:       filters ?? {},
    responseType: "blob",
  });
  return response;
};

// ── Import Excel
export const importSites = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  const response = await axios.post("/admin/site/import", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ── Télécharger le template d'import sites
export const downloadSiteImportTemplate = () => {
  const headers = [
    "nom",
    "ref_contrat",
    "localisation",
    "responsable",
    "email",
    "telephone",
    "statut",
    "effectifs",
    "loyer",
    "superficie",
    "date_debut_contrat",
    "date_fin_contrat",
    "manager_email",
  ];
  const csv  = headers.join(";") + "\n";
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href  = url;
  link.download = "template_import_sites.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};