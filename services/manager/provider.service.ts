// ═══════════════════════════════════════════════════════════════
// services/manager/provider.service.ts
//
// ⚠️  Pas de route /manager/provider côté backend.
//     On passe par les routes existantes :
//
//   • GET /manager/ticket              → tous les tickets du site
//     ↳ on extrait les providers uniques (dédupliqués par provider.id)
//
//   • GET /manager/ticket?provider_id=X → tickets d'un prestataire
//     ↳ on en déduit son profil + ses stats
//
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type { ApiResponse, PaginatedResponse, BaseFilters } from "../../types/manager.types";

// ── Types ────────────────────────────────────────────────────────

export interface Provider {
  id: number;
  company_name: string;
  city?: string;
  street?: string;
  neighborhood?: string;
  service_id?: number;
  /** Calculée côté client depuis les tickets */
  rating?: number;
  is_active?: boolean;
  date_entree?: string;
  description?: string;
  service?: { id: number; name: string };
  user?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    name?: string;
  };
  logoUrl?: string;
}

export interface ProviderStats {
  total_providers: number;
  active_providers: number;
  inactive_providers: number;
  average_intervention_time?: string;
  total_tickets?: number;
  in_progress_tickets?: number;
  closed_tickets?: number;
  rating?: number;
}

export interface ProviderFilters extends BaseFilters {
  is_active?: boolean;
  service_id?: number;
  search?: string;
}

/** Ticket tel que retourné par GET /manager/ticket */
export interface ProviderTicket {
  id: number;
  subject: string;
  type: string;
  status: string;
  planned_at?: string;
  due_at?: string;
  description?: string;
  provider_id?: number;
  provider?: Provider;
  site: { nom: string; name?: string };
  asset?: { designation: string };
  service?: { name: string };
}

// ── Helpers internes ─────────────────────────────────────────────

/**
 * Extrait les prestataires uniques depuis une liste de tickets.
 * Déduplique par provider.id.
 */
function extractUniqueProviders(tickets: ProviderTicket[]): Provider[] {
  const map = new Map<number, Provider>();
  for (const ticket of tickets) {
    if (ticket.provider?.id && !map.has(ticket.provider.id)) {
      map.set(ticket.provider.id, ticket.provider);
    }
  }
  return Array.from(map.values());
}

/**
 * Calcule les stats d'un prestataire depuis ses tickets.
 */
function computeProviderStats(tickets: ProviderTicket[]): ProviderStats {
  const total  = tickets.length;
  const inProg = tickets.filter((t) =>
    ["en_cours", "in_progress", "assigné"].includes(t.status)
  ).length;
  const closed = tickets.filter((t) =>
    ["clos", "closed", "évalué"].includes(t.status)
  ).length;

  return {
    total_providers: 1,
    active_providers: 1,
    inactive_providers: 0,
    total_tickets: total,
    in_progress_tickets: inProg,
    closed_tickets: closed,
  };
}

// ── Service ──────────────────────────────────────────────────────

export const ProviderService = {
  /**
   * Charge tous les tickets du site (per_page=500),
   * puis déduplique par provider → liste prestataires.
   * Route réelle : GET /manager/ticket
   */
  async getProviders(
    filters: ProviderFilters = {}
  ): Promise<{ providers: Provider[]; rawTickets: ProviderTicket[] }> {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<ProviderTicket>>
    >("/manager/ticket", {
      params: { per_page: 500, page: 1 },
    });

    const tickets = data.data?.items ?? [];
    let providers = extractUniqueProviders(tickets);

    // Filtrage client-side sur search
    if (filters.search?.trim()) {
      const v = filters.search.toLowerCase();
      providers = providers.filter((p) =>
        p.company_name?.toLowerCase().includes(v)
      );
    }

    return { providers, rawTickets: tickets };
  },

  /**
   * Stats globales calculées depuis providers + tickets.
   */
  computeGlobalStats(
    providers: Provider[],
    tickets: ProviderTicket[]
  ): ProviderStats {
    const active   = providers.filter((p) => p.is_active !== false).length;
    const inactive = providers.length - active;

    return {
      total_providers:    providers.length,
      active_providers:   active,
      inactive_providers: inactive,
      total_tickets:      tickets.length,
    };
  },

  /**
   * Tickets paginés d'un prestataire.
   * Route réelle : GET /manager/ticket?provider_id={id}
   */
  async getProviderTickets(
    providerId: number,
    filters: BaseFilters = {}
  ): Promise<PaginatedResponse<ProviderTicket>> {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<ProviderTicket>>
    >("/manager/ticket", {
      params: {
        provider_id: providerId,
        page:        filters.page     ?? 1,
        per_page:    filters.per_page ?? 10,
      },
    });
    return data.data;
  },

  /**
   * Profil d'un prestataire + ses stats, via ses tickets.
   * Route réelle : GET /manager/ticket?provider_id={id}&per_page=500
   */
  async getProvider(
    providerId: number
  ): Promise<{ provider: Provider | null; stats: ProviderStats }> {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<ProviderTicket>>
    >("/manager/ticket", {
      params: { provider_id: providerId, per_page: 500 },
    });

    const tickets  = data.data?.items ?? [];
    // On extrait le provider depuis le premier ticket qui le contient
    const provider =
      tickets.find((t) => t.provider?.id === providerId)?.provider ?? null;
    const stats    = computeProviderStats(tickets);

    return { provider, stats };
  },

  /**
   * Export des tickets du site (filtrables par prestataire).
   * Route réelle : GET /manager/ticket/export
   */
  async exportProviderTickets(providerId?: number): Promise<Blob> {
    const response = await api.get("/manager/ticket/export", {
      params: providerId ? { provider_id: providerId } : {},
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Construit l'URL publique du logo stocké sur le serveur Laravel.
   */
  getLogoUrl(logoPath: string): string {
    const base =
      process.env.NEXT_PUBLIC_STORAGE_URL ??
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
      "";
    return `${base}/storage/${logoPath}`;
  },

  // Exposé pour les hooks
  computeProviderStats,
};