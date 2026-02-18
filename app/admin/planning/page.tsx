"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ActionGroup from "@/components/ActionGroup";
import StatsCard from "@/components/StatsCard";
import ReusableForm from "@/components/ReusableForm";
import PageHeader from "@/components/PageHeader";
import MainCard from "@/components/MainCard";
import {Filter, Download, Upload, Building2, CalendarClock} from "lucide-react";




const cpis = [
  { label: "Nombre total de tickets ", value: 50, delta: "+15,03%", trend: "up" },
  { label: "Nombre de tickets traités", value: 35, delta: "+20.10%", trend: "up" },
  { label: "Nombre de tickets non traités", value: 15, delta: "+10%", trend: "up" },
];


export default function PlanningPage() {

  const [isModalOpen, setIsModalOpen] = useState(false);

const siteFields: FieldConfig[] = [
  { name: "type", label: "type de planification", type: "select", required: true, options: [
    { label: "immediat", value: "actif" },
    { label: "Alarmant", value: "inactif" }
  ]},
    { name: "code", label: "Codification", type: "text", required: true },
    
    {name: "startDate", 
      label: "Date de début", 
      type: "date", 
      required: true,
      icon: CalendarClock // Icône spécifique début
    },
    {name: "endDate", 
      label: "Date de fin", 
      type: "date", 
      required: true,
      icon: CalendarClock // Icône spécifique début
    },
    { name: "observations", placeholer:"décrivez les différentes observations sur le problème", type: "rich-text", gridSpan: 2 },
    { name: "provider", label: "Prestaire assigné", type: "text", required: true },
    { name: "email", label: "E-mail", type: "email", required: true },
    { name: "name", label: "Nom du responsable", type: "text", required: true },
    { name: "phone", label: "Téléphone du responsable", type: "text", required: true },
   
    { name: "location", label: "Situation géographique", type: "text", required: true, gridSpan: 2 },
    
  ];
  // Ton tableau siteActions déplacé ici pour avoir accès à setIsModalOpen
  const siteActions = [
    { label: "Filtrer par", icon: Filter, onClick: () => console.log("Filtre"), variant: "secondary" as const },
    { 
      label: "Nouveau planning", 
      icon: Building2, 
      onClick: () => setIsModalOpen(true), 
      variant: "primary" as const 
    },
  ];

  const handleFormSubmit = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    console.log("Données du formulaire :", data);
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="ml-64 mt-20 p-8 space-y-8">
          {/* Header & Stats */}
          <div className="flex justify-between items-start">
            <PageHeader 
              title="Planning" 
              subtitle="Ce menu vous permet de voir le calendrier des évènements planifiés" 
            />
            {/* Boutons d'actions en haut à droite */}
           
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cpis.map((cpi, i) => <StatsCard key={i} {...cpi} />)}
          </div>

           <div className="shrink-0 flex justify-end">
              <ActionGroup actions={siteActions} />
            </div>
          {/* Le cœur de l'interface : contient Recherche + MiniCal + Legend + Grid */}
          <MainCard /> 
        </main>
      </div>

      <ReusableForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un nouveau planning"
        subtitle="Remplissez les informations pour enregistrer un nouveau planning."
        fields={siteFields}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
