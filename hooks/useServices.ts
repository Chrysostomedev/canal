// hooks/useServices.ts
import { useState, useEffect } from "react";
import { ServiceService, ServiceItem } from "../services/provider.service";

export const useServices = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    ServiceService.getServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { services, loading };
};