"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { 
  Filter, Download, Upload, Building2, 
  CalendarDays, Eye, ChevronLeft, MapPin, 
  Phone, Mail 
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Paginate from "@/components/Paginate";
import StatsCard from "@/components/StatsCard";
import ActionGroup from "@/components/ActionGroup";
import ReusableForm from "@/components/ReusableForm";
import DataTable from "@/components/DataTable";
import SideDetailsPanel from "@/components/SideDetailsPanel";
import SearchInput from "@/components/SearchInput";

const kpis = [
  { label: "Coût moyen du site", value: "500 K FCFA", delta: "+55", trend: "up" },
  { label: "Tickets en cours", value: "10", delta: "+3", trend: "up" },
  { label: "Tickets clôturés", value: "30", delta: "+3", trend: "up" },
  { label: "Total patrimoine", value: "59", delta: "+9", trend: "up" },
];

const ticketsData = [
  { id: "#8139013", type: "Appareillage", stype: "Split", designation: "Midea 1,5-3 CV", site: "Store Plateau", code: "CLI-SP-0001", status: "actif", description: "Équipement critique salle serveur." },
  { id: "#148647", type: "Appareillage", stype: "Broyeur à papier", designation: "IDEAL", site: "Store Plateau", code: "APP-BP-00001", status: "hors d'usage", description: "En attente de réparation." },
  { id: "#523133", type: "Climatisation", stype: "Split", designation: "Midea 1,5-3 CV", site: "Store Plateau", code: "CLI-SP-00001", status: "inactif", description: "Unité de secours." },
];

export default function DetailsPage() {

    const searchParams = useSearchParams();

  // On récupère les data de l'URL (avec des valeurs de secours si vide)
  const siteName = searchParams.get("name") || "Nom du site";
  const location = searchParams.get("location") || "Localisation";
  const responsible = searchParams.get("responsible") || "Responsable";
  const phone = searchParams.get("phone") || "N/A";
  const email = searchParams.get("email") || "N/A";
  const assets = searchParams.get("assets") || "0";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatrimoine, setSelectedPatrimoine] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (patrimoine: any) => {
    const fields = [
      { label: "Famille / Type", value: patrimoine.type },
      { label: "Sous-type", value: patrimoine.stype },
      { label: "Codification", value: patrimoine.code },
      { label: "Désignation", value: patrimoine.designation },
      { label: "Site d'affectation", value: patrimoine.site },
      { label: "Statut", value: patrimoine.status, isStatus: true, statusColor: patrimoine.status === "actif" ? "#22c55e" : "#ef4444" },
    ];

    setSelectedPatrimoine({
      title: `${patrimoine.designation} | ${patrimoine.code}`,
      reference: patrimoine.id,
      fields: fields,
      description: patrimoine.description
    });
    setIsDetailsOpen(true);
  };

  const columns = [
    { header: "ID Ticket", key: "id" },
    { header: "Type", key: "type" },
    { header: "Sous-type", key: "stype" },
    { header: "Codification", key: "code" },
    { header: "Désignation", key: "designation" },
    { 
      header: "Status", 
      key: "status",
      render: (value: string) => {
        const styles = {
          "actif": "border-green-600 bg-green-50 text-green-700",
          "hors d'usage": "border-slate-300 text-slate-700 bg-slate-100",
          "inactif": "bg-red-50 border-red-500 text-red-600",
        };
        return (
          <span className={`px-4 py-1 rounded-xl border text-[11px] font-bold tracking-wider ${styles[value as keyof typeof styles] || ""}`}>
            {value}
          </span>
        );
      }
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, row: any) => (
        <button onClick={() => handleOpenDetails(row)} className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition">
          <Eye size={18} /> <span className="text-sm">Aperçu</span>
        </button>
      )
    }
  ];

  const siteActions = [
    { label: "Filtrer par", icon: Filter, onClick: () => {}, variant: "secondary" as const },
    { label: "Importer", icon: Download, onClick: () => {}, variant: "secondary" as const },
    { label: "Export", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    { label: "Nouveau patrimoine", icon: Building2, onClick: () => setIsModalOpen(true), variant: "primary" as const },
  ];

  const siteFields: FieldConfig[] = [
    { name: "type", label: "Famile/Type", type: "select", required: true, options: [
          { label: "Actif", value: "actif" },
          { label: "Inactif", value: "inactif" }
        ]},
        { name: "stype", label: "Sous-type", type: "select", required: true, options: [
          { label: "Actif", value: "actif" },
          { label: "Inactif", value: "inactif" }
        ]},
        { name: "status", label: "Statut", type: "select", required: true, options: [
          { label: "Actif", value: "actif" },
          { label: "Inactif", value: "inactif" }
        ]},
    
        { name: "designation", label: "Designation", type: "select", required: true, options: [
          { label: "Actif", value: "actif" },
          { label: "Inactif", value: "inactif" }
        ]},    
         { name: "code", label: "Codification", type: "text", placeholder:"ex: SD1245",  required: true },
    
        { name: "site", label: "Site d'affection", type: "select", required: true, options: [
          { label: "Actif", value: "actif" },
          { label: "Inactif", value: "inactif" }
        ]},
       
      {
        name: "observations",
        label: "",
        type: "rich-text", // Ton nouvel éditeur moderne
        gridSpan: 2,
        placeholder: "Decrivez plus en details le patrimoine"
      },
      { name: "dimension", label: "Dimensions", type: "text", required: true },
      { name: "accessoires", label: "Accessoires", type: "text", required: true },
     {name: "startDate", 
      label: "Date de début", 
      type: "date", 
      required: true,
      icon: CalendarDays // Icône spécifique début
    },
      { name: "valeur", label: "Valeur entrée", type: "number", placeholder:"ex: 1245000",  required: true },
      ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        
        <main className="mt-20 p-8 space-y-8">
          
          {/* 1. Header dynamique Profil Site  */}
        
         <div className="bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <Link href="/admin/sites" className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium">
                <ChevronLeft size={18} /> Retour
              </Link>
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{siteName}</h1>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <MapPin size={18} />
                  <span className="font-medium text-lg">{location}</span>
                </div>
              </div>
            </div>

            {/* RESPONSABLE DYNAMIQUE */}
            <div className="bg-white p-6  border border-slate-50 shadow-sm flex items-center gap-4 min-w-[320px]">
              
              <div>
                <h3 className="text-xl font-bold text-slate-900">{responsible}</h3>
                <div className="flex flex-col text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Phone size={14} /> {phone}</span>
                  <span className="flex items-center gap-1"><Mail size={14} /> {email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
          </div>

          {/* 3. Table Toolbar */}
          <div className="shrink-0 flex justify-end">
              <ActionGroup actions={siteActions} />
            </div>

          {/* 4. Data Table Section */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <DataTable columns={columns} data={ticketsData} />
            <div className="p-6 border-t border-slate-50 flex justify-end">
              <Paginate currentPage={1} totalPages={4} onPageChange={() => {}} />
            </div>
          </div>

        </main>
      </div>

      {/* Side Panels & Modals */}
      <SideDetailsPanel 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedPatrimoine?.title || ""}
        reference={selectedPatrimoine?.reference}
        fields={selectedPatrimoine?.fields || []}
        descriptionContent={selectedPatrimoine?.description}
      />

      <ReusableForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un patrimoine"
        fields={siteFields} // À remplir avec tes siteFields
        onSubmit={() => setIsModalOpen(false)}
      />
    </div>
  );
}