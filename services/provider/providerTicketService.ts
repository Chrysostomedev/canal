import axiosInstance from "../../core/axios";

// ─── Types — miroir exact du backend Laravel ──────────────────────────────────

export interface TicketSite     { id?: number; nom: string; }
export interface TicketProvider { id?: number; company_name: string; }
export interface TicketAsset    { id?: number; designation: string; codification: string; }
export interface TicketService  { id?: number; name: string; }
export interface TicketCategory { id?: number; name: string; }

export interface Ticket {
  id: number;
  code_ticket?: string;
  subject?: string;
  // Statuts exacts du modèle Ticket (avec accents, casse exacte)
  status: string;
  type: "curatif" | "preventif" | string;
  priority: "faible" | "moyenne" | "haute" | "critique" | string;
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
  started_at?: string | null;
  reported_at?: string | null;
  created_at?: string;
  cout?: number;
  images?: string[];
  planning_id?: number | null;
  parent_ticket_id?: number | null;
  delai_restant?: {
    jours: number;
    heures: number;
    est_en_retard: boolean;
    est_urgent: boolean;
    libelle: string;
    due_at: string;
  } | null;
}

// ─── Statuts exacts (constantes du modèle Ticket) ────────────────────────────
export const TICKET_STATUS = {
  // Préventif
  PLANIFIE:       "PLANIFIÉ",
  EN_COURS:       "EN_COURS",
  // Curatif
  SIGNALE:        "SIGNALÉ",
  VALIDE:         "VALIDÉ",
  ASSIGNE:        "ASSIGNÉ",
  EN_TRAITEMENT:  "EN_TRAITEMENT",
  DEVIS_ATTENTE:  "DEVIS_EN_ATTENTE",
  DEVIS_APPROUVE: "DEVIS_APPROUVÉ",
  // Communs
  RAPPORTE:       "RAPPORTÉ",
  EVALUE:         "ÉVALUÉ",
  CLOS:           "CLOS",
  EN_RETARD:      "EN_RETARD",
  RESOLU:         "RÉSOLU",
} as const;

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

// ─── Logique UX : quels boutons afficher selon le statut ─────────────────────
export function canStartIntervention(ticket: Ticket): boolean {
  // Préventif : PLANIFIÉ → EN_COURS
  // Curatif   : ASSIGNÉ ou DEVIS_APPROUVÉ → EN_TRAITEMENT
  return [
    TICKET_STATUS.PLANIFIE,
    TICKET_STATUS.ASSIGNE,
    TICKET_STATUS.DEVIS_APPROUVE,
    TICKET_STATUS.EN_RETARD,
  ].includes(ticket.status as TicketStatus);
}

export function canSubmitReport(ticket: Ticket): boolean {
  // Préventif : EN_COURS → RAPPORTÉ
  // Curatif   : EN_TRAITEMENT → RAPPORTÉ
  // Bloqué si déjà RAPPORTÉ (un rapport a déjà été soumis)
  return [
    TICKET_STATUS.EN_COURS,
    TICKET_STATUS.EN_TRAITEMENT,
  ].includes(ticket.status as TicketStatus);
}

export function canRequestDevis(ticket: Ticket): boolean {
  // Uniquement curatif ASSIGNÉ
  return ticket.type === "curatif" && ticket.status === TICKET_STATUS.ASSIGNE;
}

export function isAlreadyReported(ticket: Ticket): boolean {
  return ticket.status === TICKET_STATUS.RAPPORTE;
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

// Statuts que le PROVIDER peut appliquer via PUT (legacy — préférer les endpoints dédiés)
export type ProviderUpdatableStatus = "EN_COURS" | "EN_TRAITEMENT" | "RAPPORTÉ";

// ─── Endpoints ────────────────────────────────────────────────────────────────
const BASE = "/provider/ticket";

export const providerTicketService = {

  /**
   * GET /provider/ticket
   * Filtres supportés : page, per_page, status, type, priority, site_id
   */
  getTickets: async (params?: Record<string, any>): Promise<TicketListResponse> => {
    const res = await axiosInstance.get(BASE, { params });
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

  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await axiosInstance.get(`${BASE}/${id}`);
    return response.data?.data ?? response.data;
  },

  getStats: async (): Promise<TicketStats> => {
    try {
      const response = await axiosInstance.get(`${BASE}/stats`);
      const data = response.data?.data ?? response.data;
      return {
        total:                           data.nombre_total_tickets              ?? data.total    ?? 0,
        en_cours:                        data.nombre_total_tickets_en_cours     ?? data.en_cours ?? 0,
        clotures:                        data.nombre_total_tickets_clotures     ?? data.clotures ?? 0,
        cout_moyen_par_ticket:           data.cout_moyen_par_ticket             ?? 0,
        nombre_tickets_par_mois:         data.nombre_tickets_par_mois           ?? 0,
        delais_moyen_traitement_heures:  data.delais_moyen_traitement_heures    ?? null,
        delais_minimal_traitement_heures:data.delais_minimal_traitement_heures  ?? null,
        delais_maximal_traitement_heures:data.delais_maximal_traitement_heures  ?? null,
      };
    } catch {
      try {
        const dashRes = await axiosInstance.get("/provider/dashboard");
        const t = (dashRes.data?.data ?? dashRes.data)?.stats?.tickets ?? {};
        return { total: t.total ?? 0, en_cours: t.en_cours ?? 0, clotures: t.clotures ?? 0,
          cout_moyen_par_ticket: 0, nombre_tickets_par_mois: 0,
          delais_moyen_traitement_heures: null, delais_minimal_traitement_heures: null, delais_maximal_traitement_heures: null };
      } catch {
        return { total: 0, en_cours: 0, clotures: 0, cout_moyen_par_ticket: 0,
          nombre_tickets_par_mois: 0, delais_moyen_traitement_heures: null,
          delais_minimal_traitement_heures: null, delais_maximal_traitement_heures: null };
      }
    }
  },

  /**
   * POST /provider/ticket/:id/start
   * PLANIFIÉ → EN_COURS (préventif) | ASSIGNÉ/DEVIS_APPROUVÉ → EN_TRAITEMENT (curatif)
   */
  startIntervention: async (id: number): Promise<Ticket> => {
    const response = await axiosInstance.post(`${BASE}/${id}/start`);
    return response.data?.data ?? response.data;
  },

  /**
   * POST /provider/ticket/:id/request-devis
   * ASSIGNÉ → DEVIS_EN_ATTENTE (curatif uniquement)
   */
  requestDevis: async (id: number): Promise<Ticket> => {
    const response = await axiosInstance.post(`${BASE}/${id}/request-devis`);
    return response.data?.data ?? response.data;
  },

  /**
   * PUT /provider/ticket/:id
   * Mise à jour statut legacy (préférer les endpoints dédiés)
   */
  updateTicketStatus: async (id: number, status: ProviderUpdatableStatus): Promise<Ticket> => {
    const response = await axiosInstance.put(`${BASE}/${id}`, { status });
    return response.data?.data ?? response.data;
  },
};
