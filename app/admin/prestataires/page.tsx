"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SearchInput from "@/components/SearchInput";
import ActionGroup from "@/components/ActionGroup";
import ReusableForm from "@/components/ReusableForm";
import StatsCard from "@/components/StatsCard";
import ProfileModal from "@/components/ProfileModal";
import Paginate from "@/components/Paginate";
import PrestCard from "@/components/PrestCard"; // Assure-toi que le nom du fichier est exact
import PageHeader from "@/components/PageHeader";
import { Filter, Download, Upload, CalendarClock, PlusCircle, Eye } from "lucide-react";

// 1. AJOUT DU TYPE (ou import)
type FieldConfig = {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  gridSpan?: number;
  icon?: any;
  placeholer?: string;
};

export default function PrestatairesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [search, setSearch] = useState("");

  // 2. DÉPLACER LES DONNÉES EN HAUT (Source de vérité)
  const providers = [
    {
      name: "BAT TECH",
      location: "Abidjan",
      category: "Maintenance",
      phone: "+225 00 00 00 00",
      email: "battech@gmail.com",
      rating: 4.5,
      status: "Actif" as const,
    },
    {
      name: "DIGI TECH",
      location: "Abidjan",
      category: "Informatique",
      phone: "+225 00 20 00 11",
      email: "digitech@gmail.com",
      rating: 3,
      status: "Actif" as const,
    },
    {
      name: "NUTO TIC",
      location: "Abidjan",
      category: "Maintenance",
      phone: "+225 00 00 00 00",
      email: "nuitotic@gmail.com",
      rating: 5,
      status: "Actif" as const,
    },
  ];

  const kpis = [
    { label: "Tickets totaux", value: 1234, delta: "+5%", trend: "up" },
    { label: "Tickets traités", value: 1020, delta: "+8%", trend: "up" },
    { label: "Tickets non traités", value: 214, delta: "-3%", trend: "down" },
    { label: "Temps moyen", value: "24h", delta: "-3%", trend: "down" },
  ];

  // 3. FILTRAGE APRÈS LA DÉFINITION
  const visiblePrest = providers.filter(provider =>
    provider.name.toLowerCase().includes(search.toLowerCase()) ||
    provider.location.toLowerCase().includes(search.toLowerCase()) ||
    provider.email.toLowerCase().includes(search.toLowerCase())
  );

  const prestActions = [
    { label: "Filtrer par", icon: Filter, onClick: () => {}, variant: "secondary" as const },
    { label: "Importer", icon: Download, onClick: () => {}, variant: "secondary" as const },
    { label: "Export", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    { label: "Ajouter un prestataire", icon: PlusCircle, onClick: () => setIsModalOpen(true), variant: "primary" as const },
  ];

  const prestFields: FieldConfig[] = [
    { name: "name", label: "Nom du prestataire", type: "text", required: true },
    { name: "location", label: "Situation géographique", type: "text", required: true },
    { name: "email", label: "E-mail", type: "email", required: true },
    { name: "phone", label: "Téléphone", type: "text", required: true },
    {
      name: "service", label: "Service", type: "select", required: true,
      options: [
        { label: "Maintenance", value: "maintenance" },
        { label: "Réseaux", value: "reseaux" }
      ]
    },
    { name: "endDate", label: "Fin de contrat", type: "date", required: true, icon: CalendarClock },
    { name: "observations", type: "rich-text", gridSpan: 2, placeholer: "Observations..." },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="ml-64 mt-20 p-6 space-y-8">
          <PageHeader 
            title="Prestataires" 
            subtitle="Ce menu vous permet de voir tous les différents prestataires " 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
          </div>

          <div className="flex justify-end">
            <ActionGroup actions={prestActions} />
          </div>

          <div className="space-y-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="w-80">
              <SearchInput onSearch={setSearch} placeholder="Rechercher un prestataire.." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visiblePrest.length > 0 ? (
                visiblePrest.map((p) => (
                  <PrestCard 
                    key={p.name} 
                    {...p} 
                    onProfilClick={() => setSelectedProvider(p)}
                    onTicketsClick={() => console.log("Tickets", p.name)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-slate-400">
                  Aucun prestataire trouvé.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-50">
              <Paginate currentPage={1} totalPages={4} onPageChange={() => {}} />
            </div>
          </div>

          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Ajouter un nouveau prestataire"
            subtitle="Remplissez les informations ci-dessous pour enregistrer un nouveau prestataire sur la plateforme."
            fields={prestFields}
            onSubmit={(data) => { console.log(data); setIsModalOpen(false); }}
          />

<ProfileModal 
  isOpen={!!selectedProvider} 
  onClose={() => setSelectedProvider(null)} 
  provider={selectedProvider}
/>
        </main>
      </div>
    </div>
  );
}