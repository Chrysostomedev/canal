// services/provider.service.ts
import axios from "../core/axios";

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface Provider {
  id: number;
  company_name: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  description?: string;
  is_active?: boolean;
  service_id?: number;
  rating?: number;
  date_entree?: string;
  logoUrl?: string;
  pictureUrl?: string;
  country_id?: number;
  user_id?: number;
  // Relations eager-loaded
  user?: { id: number; first_name?: string; last_name?: string; email?: string; phone?: string };
  service?: { id: number; name: string };
  country?: { id: number; name: string };
}

export interface ProviderStats {
  total_providers: number;
  active_providers: number;
  inactive_providers: number;
  average_intervention_time: string;
}

export interface ProviderDetail {
  provider: Provider;
  // Retourné par ProvidersServices.getProvider()
  stats: {
    total_tickets: number;
    in_progress_tickets: number;
    closed_tickets: number;
    rating: number | null;
  };
}

export interface ServiceItem {
  id: number;
  name: string;
  description?: string;
}

// ── ProviderService ──────────────────────────────────────────────────────────

export const ProviderService = {
  async getProviders(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    service_id?: number;
    is_active?: boolean;
  }): Promise<any> {
    const response = await axios.get("/admin/providers", { params });

    // Si appelé sans params (usage select) → retourne tableau simple comme avant
    if (!params || Object.keys(params).length === 0) {
      return response.data.data?.items ?? response.data.data ?? [];
    }

    // Si appelé avec params (usage liste paginée) → retourne { items, meta }
    return {
      items: (response.data.data ?? []) as Provider[],
      meta: response.data.meta ?? { current_page: 1, last_page: 1, per_page: 12, total: 0 },
    };
  },

  // GET /admin/providers/stats
  async getStats(): Promise<ProviderStats> {
    const response = await axios.get("/admin/providers/stats");
    return response.data.data;
  },

  // GET /admin/providers/{id} — retourne { data: provider, stats: {...} }
  async getProvider(id: number): Promise<ProviderDetail> {
    const response = await axios.get(`/admin/providers/${id}`);
    return {
      provider: response.data.data,
      stats: response.data.stats,
    };
  },

  // GET /admin/providers/{id}/tickets
  async getProviderTickets(id: number, params?: { page?: number; status?: string }) {
    const response = await axios.get(`/admin/providers/${id}/tickets`, { params });
    return {
      items: response.data.data ?? [],
      stats: response.data.stats ?? {},
      meta: response.data.meta ?? { current_page: 1, last_page: 1, total: 0 },
    };
  },

  // POST /admin/providers
  async createProvider(payload: any): Promise<Provider> {
    const response = await axios.post("/admin/providers", payload);
    return response.data.data;
  },

  // PUT /admin/providers/{id}
  async updateProvider(id: number, payload: any): Promise<Provider> {
    const response = await axios.put(`/admin/providers/${id}`, payload);
    return response.data.data;
  },

  // PUT /admin/providers/activate/{id}
  async activateProvider(id: number): Promise<Provider> {
    const response = await axios.put(`/admin/providers/activate/${id}`);
    return response.data.data;
  },

  // PUT /admin/providers/desactivate/{id}
  async desactivateProvider(id: number): Promise<Provider> {
    const response = await axios.put(`/admin/providers/desactivate/${id}`);
    return response.data.data;
  },

  // DELETE /admin/providers/{id}
  async deleteProvider(id: number): Promise<boolean> {
    const response = await axios.delete(`/admin/providers/${id}`);
    return response.data.success;
  },
};

// ── ServiceService — inchangé ────────────────────────────────────────────────

export const ServiceService = {
  async getServices(): Promise<ServiceItem[]> {
    const response = await axios.get("/admin/service");
    return response.data.data?.items ?? response.data.data ?? [];
  },
};