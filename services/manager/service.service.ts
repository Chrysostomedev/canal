// ═══════════════════════════════════════════════════════════════
// services/manager/service.service.ts
// ═══════════════════════════════════════════════════════════════

import api from "../../core/axios";
import type { ApiResponse } from "../../types/manager.types";

export interface Service {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export const ServiceService = {
  /**
   * Liste tous les services métiers disponibles.
   * Route : GET /manager/service
   */
  async getServices(): Promise<Service[]> {
    const { data } = await api.get<ApiResponse<Service[]>>("/manager/service");
    return data.data ?? [];
  },
};
