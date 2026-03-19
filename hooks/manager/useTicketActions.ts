// hooks/manager/useTicketActions.ts
"use client";

import { useState } from "react";
import { TicketService } from "../../services/manager/ticket.service";
import { Ticket, UpdateTicketPayload } from "../../types/manager.types";

export interface UseTicketActionsOptions {
  onSuccess?: () => void;
}

export function useTicketActions(options?: UseTicketActionsOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createTicket = async (payload: {
    company_asset_id: number;
    service_id: number;
    priority: string;
    description: string;
    subject?: string;
  }) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const newTicket = await TicketService.createTicket(payload);
      setSuccess("Le ticket a été créé avec succès.");
      options?.onSuccess?.();
      return newTicket;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Une erreur est survenue lors de la création du ticket.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTicket = async (id: number, payload: UpdateTicketPayload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updatedTicket = await TicketService.updateTicket(id, payload);
      setSuccess("Le ticket a été mis à jour.");
      options?.onSuccess?.();
      return updatedTicket;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Une erreur est survenue lors de la mise à jour du ticket.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rateTicket = async (id: number, payload: { rating: number; comment?: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await TicketService.rateTicket(id, payload);
      setSuccess("L'intervention a été notée.");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Une erreur est survenue lors de la notation.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    success,
    createTicket,
    updateTicket,
    rateTicket,
    clearStatus: () => { setError(null); setSuccess(null); }
  };
}
