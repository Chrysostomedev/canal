"use client";

import { useState } from "react";
import SearchInput from "./SearchInput";
import EventLegend from "./EventLegend";
import CalendarGrid from "./CalendarGrid";
import MiniCalendar from "./MiniCalendar";
import SideDetailsPanel from "./SideDetailsPanel"; // Ton nouveau composant réutilisable

export default function MainCard() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // États pour la modale
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fonction pour ouvrir la modale au clic sur un événement
  const handleEventClick = (event: any) => {
    // On formate les données de l'événement pour qu'elles correspondent aux "fields" du SideDetailsPanel
    const formattedEvent = {
      title: event.label || "Maintenance",
      reference: "#8139013", // Référence fictive ou event.id si tu l'as
      description: "Retrouvez les détails de cette planification de maintenance ci-dessous.",
      fields: [
        { label: "Type de planification", value: event.label },
        { label: "Heure prévue", value: event.time },
        { label: "Date", value: "29/01/2026" }, // À dynamiser selon ton besoin
        { label: "Prestataire", value: "Marvin TIC" },
        { 
          label: "Statut", 
          value: event.status, 
          isStatus: true, 
          statusColor: event.color 
        },
      ]
    };

    setSelectedEvent(formattedEvent);
    setIsPanelOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput 
            onSearch={(q) => setSearchQuery(q)} 
            placeholder="Rechercher un évènement" 
          />
        </div>
      </div>

      {/* 2. Main Layout Container */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Gauche */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
            <MiniCalendar />
          </div>
          
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-8">
            <EventLegend search={searchQuery} />
          </div>
        </div>

        {/* Grille Calendrier */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <CalendarGrid 
            search={searchQuery} 
            onEventClick={handleEventClick} 
          />
        </div>
      </div>

      {/* 3. Le SidePanel corrigé avec les nouvelles props */}
      <SideDetailsPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        title={selectedEvent?.title || ""}
        reference={selectedEvent?.reference}
        fields={selectedEvent?.fields || []} // Le tableau qui manquait
        descriptionContent={selectedEvent?.description}
      />
    </div>
  );
}