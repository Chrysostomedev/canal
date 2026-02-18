"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SiteCard from "@/components/SiteCard";
import ActionGroup from "@/components/ActionGroup";
import SearchInput from "@/components/SearchInput";
import StatsCard from "@/components/StatsCard";
import Paginate from "@/components/Paginate";
import ReusableForm from "@/components/ReusableForm";
import PageHeader from "@/components/PageHeader";
import { Filter, Download, Upload, Globe, CalendarDays, CalendarCheck } from "lucide-react";

// --- AJOUT DU TYPE MANQUANT ---
type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "select" | "number";
  required?: boolean;
  options?: { label: string; value: string }[];
  gridSpan?: number;
};

const kpis = [
  { label: "Sites actifs", value: 100, delta: "+3%", trend: "up" },
  { label: "Sites inactifs", value: "03", delta: "+3%", trend: "up" },
  { label: "Delai Moyen d'interventions non traités", value: "1 semaine", delta: "3%", trend: "up" },
  { label: "Nombre total de sites", value: 214, delta: "+20,10%", trend: "up" },
  { label: "Coût Moyen par site ", value: "2500K", delta: "+3%", trend: "up" },
  { label: "Nombre de tickets en cours par site", value: "10", delta: "+3%", trend: "up" },
  { label: "Nombre de tickets clôturés par site", value: "30", delta: "+3%", trend: "up" },
  { label: "Site le plus visité", value: "Canal+Plateau" },
];

const sites = [
  {
    name: "CANAL+ STORE Plateau",
    location: "Abidjan, Côte d’Ivoire",
    status: "actif",
    email: "anais@gmail.com",
    phone: "05123456890",
    assetCount: "104",
    responsibleName: "M. Anais Kouakou ",
  },
  {
    name: "CANAL+ STORE COSMOS",
    location: "Yopougon, Côte d’Ivoire",
    status: "actif",
    email: "hans@gmail.com",
    phone: "05123456890",
    assetCount: "3",
    responsibleName: "M. Koffi David",
  },
  {
    name: "Site San-Pédro",
    location: "San-Pédro, Côte d’Ivoire",
    status: "actif",
    email: "hans@gmail.com",
    phone: "05123456890",
    assetCount: "34",
    responsibleName: "M. Johan David",
  },
];

export default function SitesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const siteFields: FieldConfig[] = [
    { name: "name", label: "Nom du site", type: "text", required: true },
    { name: "manager", label: "Nom du gestionnaire", type: "text", required: true },
    { name: "email", label: "E-mail", type: "email", required: true },
    { name: "password", label: "Mot de passe", type: "password" },
    { name: "phone", label: "Téléphone du responsable", type: "text", required: true },
    {
      name: "status", label: "Statut", type: "select", required: true, options: [
        { label: "Actif", value: "actif" },
        { label: "Inactif", value: "inactif" }
      ]
    },
    { name: "location", label: "Situation géographique", type: "text", required: true, gridSpan: 2 },
    { name: "staff", label: "Effectifs", type: "number", required: true },
    { name: "area", label: "Superficie", type: "text", required: true },
    {name: "startDate", 
      label: "Date de début de contrat", 
      type: "date", 
      required: true,
      icon: CalendarDays // Icône spécifique début
    },
    { 
      name: "endDate", 
      label: "Date de fin de contrat", 
      type: "date", 
      required: true,
      icon: CalendarCheck // Icône spécifique fin
    },
  ];

  const siteActions = [
    { label: "Filtrer par", icon: Filter, onClick: () => console.log("Filtre"), variant: "secondary" as const },
    { label: "Importer", icon: Download, onClick: () => console.log("Import"), variant: "secondary" as const },
    { label: "Export", icon: Upload, onClick: () => console.log("Export"), variant: "secondary" as const },
    {
      label: "Ajouter un site",
      icon: Globe,
      onClick: () => setIsModalOpen(true),
      variant: "primary" as const
    },
  ];

  const handleFormSubmit = (formData: any) => {
    console.log("Données du formulaire :", formData);
    setIsModalOpen(false);
  };
// filtrage dynamique des sites selon search
const visibleSites = sites.filter(site =>
  site.name.toLowerCase().includes(search.toLowerCase()) ||
  site.location.toLowerCase().includes(search.toLowerCase()) ||
  site.responsibleName.toLowerCase().includes(search.toLowerCase())
);


  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        {/* CORRECTION : ml-64 pour laisser la place au Sidebar fixe et h-screen pour le scroll interne */}
        <main className="ml-64 mt-20 p-6 space-y-10 overflow-y-auto h-[calc(100vh-80px)]">
          
          {/* Header */} 
          <PageHeader 
  title="Sites" 
  subtitle=" Ce menu vous permet de l'evolution des activités dans tous les sites" 
/>

          {/* Section Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
          </div>

          <div className="flex justify-end">
              <ActionGroup actions={siteActions} />
            </div>
         
         
<div className="space-y-8 bg-white border-b border-slate-50 rounded-xl"> 
  
  {/* 1. Barre de Recherche - Isolée pour avoir de l'espace */}
 
  <div className="w-80">
    <SearchInput 
      onSearch={setSearch} 
      placeholder="Rechercher un site..."
    />
  </div>

  {/* 2. Grid des Sites - Pas de bg-white global ici pour éviter l'effet "bloc collé" */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
  {visibleSites.length > 0 ? (
    visibleSites.map(site => <SiteCard key={site.name} {...site} />)
  ) : (
    <div className="col-span-full text-center text-slate-400 italic py-10">
      Aucun site trouvé
    </div>
  )}
</div>


  {/* 3. Pagination - Détachée de la grille avec une bordure discrète ou juste de l'espace */}
  <div className="pt-8 flex justify-center md:justify-end">
    <Paginate
      currentPage={1}
      totalPages={5}
      onPageChange={(page) => console.log("Aller à la page", page)}
    />
  </div>
</div>

          {/* Modale */}
          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Ajouter un nouveau site"
            subtitle="Remplissez les informations ci-dessous pour enregistrer un nouveau site."
            fields={siteFields}
            onSubmit={handleFormSubmit}
          />
        </main>
      </div>
    </div>
  );
}