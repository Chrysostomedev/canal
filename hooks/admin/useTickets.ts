// hooks/useTickets.ts
import { useState, useEffect } from "react";
import { TicketService, Ticket, TicketStats } from "../../services/admin/ticket.service";

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    site_id?: number;
  }>({});

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await TicketService.getTickets({ page, per_page: 15, ...filters });
      setTickets(data.items);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await TicketService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Erreur stats tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const changePage = (newPage: number) => setPage(newPage);

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const assignTicket = async (id: number, providerId: number) => {
    setIsLoading(true);
    try {
      await TicketService.assignTicket(id, providerId);
      await Promise.all([fetchTickets(), fetchStats()]);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'assignation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const closeTicket = async (id: number) => {
    setIsLoading(true);
    try {
      await TicketService.closeTicket(id);
      await Promise.all([fetchTickets(), fetchStats()]);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la clôture");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validateReport = async (id: number, payload: { result: string; rating?: number; comment?: string }) => {
    setIsLoading(true);
    try {
      await TicketService.validateReport(id, payload);
      await Promise.all([fetchTickets(), fetchStats()]);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la validation");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tickets,
    stats,
    isLoading,
    error,
    meta,
    page,
    filters,
    fetchTickets,
    fetchStats,
    setPage: changePage,
    applyFilters,
    assignTicket,
    closeTicket,
    validateReport,
  };
};