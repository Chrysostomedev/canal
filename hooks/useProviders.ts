// hooks/useProviders.ts
import { useState, useEffect } from "react";
import { ProviderService, Provider } from "../services/provider.service";

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    ProviderService.getProviders()
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { providers, loading };
};