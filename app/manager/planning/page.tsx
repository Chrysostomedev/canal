"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ReusableForm from "@/components/ReusableForm";
import PageHeader from "@/components/PageHeader";
import MainCard from "@/components/MainCard";
import { Filter, CalendarClock, Plus, CheckCircle2, XCircle } from "lucide-react";
import type { FieldConfig } from "@/components/ReusableForm";

import { usePlannings } from "../../../hooks/manager/usePlannings";
import { PlanningService } from "../../../services/manager/planning.service";
import type { Planning } from "../../../types/manager.types";

/* -------------------------------------------------------------------------- */
/*                                  TOAST                                     */
/* -------------------------------------------------------------------------- */

type ToastType = { message: string; type: "success" | "error" } | null;

function Toast({ toast }: { toast: ToastType }) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3
      px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold
      ${toast.type === "success"
        ? "bg-white border-green-100 text-green-700"
        : "bg-white border-red-100 text-red-700"}`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 size={20} className="text-green-500 shrink-0" />
      ) : (
        <XCircle size={20} className="text-red-500 shrink-0" />
      )}
      {toast.message}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function PlanningPage() {
  const {
    plannings,
    stats: apiStats,
    isLoading,
    error: apiError,
    setFilters,
    refresh
  } = usePlannings();

  const [selectedPlanning, setSelectedPlanning] = useState<Planning | null>(null);
  const [isPanelOpen, setIsPanelOpen]             = useState(false);
  const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
  const [toast, setToast]                         = useState<ToastType>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ------------------------------ ACTION GROUP ----------------------------- */

  const [activeStatus, setActiveStatus] = useState<string>("");

  const STATUS_FILTERS = [
    { key: "",          label: "Tous"      },
    { key: "planifie",  label: "Planifié"  },
    { key: "en_cours",  label: "En cours"  },
    { key: "realise",   label: "Réalisé"   },
    { key: "en_retard", label: "En retard" },
  ];

  const handleStatusFilter = (key: string) => {
    setActiveStatus(key);
    setFilters({ status: key || undefined });
  };

  /* ------------------------------ PANEL FORMAT ----------------------------- */

  const formattedSelectedEvent = selectedPlanning
    ? {
        title: selectedPlanning.codification || `Planning #${selectedPlanning.id}`,
        reference: `#${String(selectedPlanning.id).padStart(7, "0")}`,
        description: selectedPlanning.description,
        fields: [
          { label: "Site", value: selectedPlanning.site?.nom ?? "-" },
          { label: "Prestataire", value: selectedPlanning.provider?.company_name ?? selectedPlanning.provider?.name ?? "-" },
          { label: "Responsable", value: selectedPlanning.responsable_name ?? "-" },
          { label: "Téléphone", value: selectedPlanning.responsable_phone ?? "-" },
          { label: "Date début", value: new Date(selectedPlanning.date_debut).toLocaleString("fr-FR") },
          { label: "Date fin", value: new Date(selectedPlanning.date_fin).toLocaleString("fr-FR") },
          {
            label: "Statut",
            value: selectedPlanning.status,
            isStatus: true,
            statusColor: "blue", // Simplifié pour le moment
          },
        ],
      }
    : null;

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        <main className="mt-20 p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
          <PageHeader
            title="Planning"
            subtitle="Consultez le calendrier des interventions planifiées sur vos sites."
          />

          {apiError && (
             <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-sm font-semibold mb-4">
                {apiError}
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              label="Total plannings"
              value={apiStats?.total ?? 0}
              delta={`${apiStats?.realise ?? 0} réalisé(s)`}
              trend="up"
            />
            <StatsCard
              label="En cours / Planifiés"
              value={(apiStats?.en_cours ?? 0) + (apiStats?.planifie ?? 0)}
              delta={`${apiStats?.planifie ?? 0} à venir`}
              trend="up"
            />
            <StatsCard
              label="En retard / Non réalisés"
              value={(apiStats?.en_retard ?? 0) + (apiStats?.non_realise ?? 0)}
              delta={`${apiStats?.non_realise ?? 0} manquants`}
              trend="down"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => handleStatusFilter(f.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition border ${
                  activeStatus === f.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Filter size={14} />
                {f.label}
              </button>
            ))}
          </div>

          <MainCard
            plannings={plannings}
            isLoading={isLoading}
            selectedEvent={formattedSelectedEvent}
            isPanelOpen={isPanelOpen}
            onEventClick={(event: any) => {
              setSelectedPlanning(event);
              setIsPanelOpen(true);
            }}
            onPanelClose={() => setIsPanelOpen(false)}
            onEditClick={() => {}}
            onDeleteClick={() => {}}
          />
        </main>
      </div>

      <Toast toast={toast} />
    </>
  );
}