import axiosInstance from "../../core/axios";

// ─── Types — miroir exact du backend Laravel ──────────────────────────────────

export interface TicketSite     { nom: string; }
export interface TicketProvider { company_name: string; }
export interface TicketAsset    { designation: string; codification: string; }
export interface TicketService  { name: string; }
export interface TicketCategory { name: string; }

export interface Ticket {
  id: number;
  subject?: string;
  status: string;
  type: string;
  priority: string;
  site?: TicketSite;
  provider?: TicketProvider;
  asset?: TicketAsset;
  service?: TicketService;
  category?: TicketCategory;
  description?: string;
  planned_at?: string;
  due_at?: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  created_at?: string;
  cout?: number;
  images?: string[];
}

export interface TicketMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface TicketListResponse {
  items: Ticket[];
  meta: TicketMeta;
}

export interface TicketStats {
  cout_moyen_par_ticket: number;
  total: number;
  en_cours: number;
  clotures: number;
  nombre_tickets_par_mois: number;
  delais_moyen_traitement_heures: number | null;
  delais_minimal_traitement_heures: number | null;
  delais_maximal_traitement_heures: number | null;
}

// Statuts que le PROVIDER peut appliquer (lecture du controller)
// update autorisé : status in [en_cours, rapporté]
export type ProviderUpdatableStatus = "en_cours" | "rapporté";

// ─── Endpoints ────────────────────────────────────────────────────────────────
const BASE = "/provider/ticket";

// ─── Service ──────────────────────────────────────────────────────────────────
export const providerTicketService = {

  /**
   * GET /provider/ticket
   * Le controller applique automatiquement provider_id = auth provider
   * Supporte : page, per_page, status, type, priority, site_id
   */
  getTickets: async (params?: Record<string, any>): Promise<TicketListResponse> => {
    const res = await axiosInstance.get(BASE, { params });
    // Le back retourne { success, data: { items: [...], meta: {...} } }
    const payload = res.data?.data ?? res.data;
    const items: Ticket[] = payload?.items ?? payload?.data ?? (Array.isArray(payload) ? payload : []);
    const meta = payload?.meta ?? {
      current_page: payload?.current_page ?? 1,
      last_page:    payload?.last_page    ?? 1,
      per_page:     payload?.per_page     ?? 15,
      total:        payload?.total        ?? items.length,
    };
    return { items, meta };
  },

  /**
   * GET /provider/ticket/:id
   * Le controller vérifie que ticket.provider_id === auth provider → 403 sinon
   */
  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await axiosInstance.get(`${BASE}/${id}`);
    return response.data?.data ?? response.data;
  },

  /**
   * GET /provider/ticket/stats
   * Stats filtrées automatiquement par provider_id côté Laravel
   * Fallback sur le dashboard si la route stats n'est pas disponible
   */
  getStats: async (): Promise<TicketStats> => {
    try {
      const response = await axiosInstance.get(`${BASE}/stats`);
      const data = response.data?.data ?? response.data;
      return {
        total: data.nombre_total_tickets ?? data.total ?? 0,
        en_cours: data.nombre_total_tickets_en_cours ?? data.en_cours ?? 0,
        clotures: data.nombre_total_tickets_clotures ?? data.clotures ?? 0,
        cout_moyen_par_ticket: data.cout_moyen_par_ticket ?? 0,
        nombre_tickets_par_mois: data.nombre_tickets_par_mois ?? 0,
        delais_moyen_traitement_heures: data.delais_moyen_traitement_heures ?? null,
        delais_minimal_traitement_heures: data.delais_minimal_traitement_heures ?? null,
        delais_maximal_traitement_heures: data.delais_maximal_traitement_heures ?? null,
      };
    } catch {
      // Fallback : récupérer les stats depuis le dashboard provider
      try {
        const dashRes = await axiosInstance.get("/provider/dashboard");
        const dash = dashRes.data?.data ?? dashRes.data;
        const t = dash?.stats?.tickets ?? {};
        return {
          total: t.total ?? 0,
          en_cours: t.en_cours ?? 0,
          clotures: t.clotures ?? 0,
          cout_moyen_par_ticket: 0,
          nombre_tickets_par_mois: 0,
          delais_moyen_traitement_heures: null,
          delais_minimal_traitement_heures: null,
          delais_maximal_traitement_heures: null,
        };
      } catch {
        return {
          total: 0, en_cours: 0, clotures: 0,
          cout_moyen_par_ticket: 0, nombre_tickets_par_mois: 0,
          delais_moyen_traitement_heures: null,
          delais_minimal_traitement_heures: null,
          delais_maximal_traitement_heures: null,
        };
      }
    }
  },

  /**
   * PUT /provider/ticket/:id
   * PROVIDER peut uniquement mettre à jour le statut : en_cours | rapporté
   */
  updateTicketStatus: async (id: number, status: ProviderUpdatableStatus): Promise<Ticket> => {
    const response = await axiosInstance.put(`${BASE}/${id}`, { status });
    return response.data?.data ?? response.data;
  },

  /**
   * POST /provider/ticket/:id/start
   * Démarre l'intervention : ASSIGNÉ → EN_COURS ou EN_TRAITEMENT
   * Requis avant de pouvoir soumettre un rapport
   */
  startIntervention: async (id: number): Promise<Ticket> => {
    const response = await axiosInstance.post(`${BASE}/${id}/start`);
    return response.data?.data ?? response.data;
  },
};