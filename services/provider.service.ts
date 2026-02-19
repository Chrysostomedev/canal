// services/provider.service.ts
import axios from "../core/axios";

export interface Provider {
  id: number;
  company_name: string;
  city?: string;
  description?: string;
  is_active?: boolean;
  service_id?: number;
}

export interface ServiceItem {
  id: number;
  name: string;
  description?: string;
}

export const ProviderService = {
    async getProviders(): Promise<Provider[]> {
      const response = await axios.get("/admin/providers");
      return response.data.data?.items ?? response.data.data ?? [];
    },
  };
  
  export const ServiceService = {
    async getServices(): Promise<ServiceItem[]> {
      const response = await axios.get("/admin/service");
      return response.data.data?.items ?? response.data.data ?? [];
    },
  };