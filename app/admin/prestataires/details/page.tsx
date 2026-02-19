"use client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { 
  Filter, Download, Upload, Building2, 
  CalendarDays, Eye, ChevronLeft, MapPin, 
  Phone, Mail, 
  TicketPlus,
  CalendarCheck,
  Star
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
  { id: "#8139013", name: "Test urgent", date: "26/12/2025", site: "Deux plateaux" , categorie:"maintenance" , status: "En cours", description: "Odeur de chaud constatée lors de la mise sous tension." },
  { id: "#81GFGHH013", name: "Maintenance", date: "26/10/2026", site: "Plateau" , categorie:"maintenance" , status: "En attente", description: "Révision annuelle des climatiseurs." },
  { id: "#8EFF5513", name: "Visite préventive", date: "28/12/2025", site: "Deux plateaux" , categorie:"maintenance" , status: "Terminé", description: "Contrôle de routine effectué avec succès." },
];

function DetailsContent() {
    const searchParams = useSearchParams();
    

  // On récupère les data de l'URL (avec des valeurs de secours si vide)
  const siteName = searchParams.get("name") || "Nom du site";
  const location = searchParams.get("location") || "Localisation";
  const ratingStr = searchParams.get("rating") || "0";
  const rating = parseFloat(ratingStr) || 0;
  const phone = searchParams.get("phone") || "N/A";
  const email = searchParams.get("email") || "N/A";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (ticket: any) => {
    const fields = [
      { label: "Type de planification", value: ticket.categorie },
      { label: "Désignation", value: ticket.name },
      { label: "Date de création", value: ticket.date },
      { label: "Situation géographique", value: ticket.site },
      { 
        label: "Statut", 
        value: ticket.status, 
        isStatus: true, 
        statusColor: ticket.status === "Terminé" ? "#000" : ticket.status === "En cours" ? "#f97316" : "#64748b" 
      },
    ];

    setSelectedTicket({
      title: ticket.name,
      reference: ticket.id,
      fields: fields,
      description: ticket.description
    });
    setIsDetailsOpen(true);
  };

  // Colonnes déplacées ici pour utiliser handleOpenDetails
  const columns = [
    { header: "ID Ticket", key: "id" },
    { header: "Nom", key: "name" },
    { header: "Date", key: "date" },
    { header: "Site", key: "site" },
    { header: "Catégorie", key: "categorie" },
    { 
      header: "Status", 
      key: "status",
      render: (value: string) => {
        const styles = {
          "En attente": "border-slate-300 text-slate-700 bg-gray-100",
          "En cours": "border-orange-400 text-orange-500 bg-orange-50",
          "Terminé": "bg-black text-white",
        };
        return (
          <span className={`px-4 py-1.5 rounded-xl border text-xs font-bold ${styles[value as keyof typeof styles] || ""}`}>
            {value}
          </span>
        );
      }
    },
    {
      header: "Actions",
      key: "actions",
      render: (value: any, row: any) => (
        <button 
          onClick={() => handleOpenDetails(row)} // Ouvre le SidePanel avec les données de la ligne
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
        >
          <Eye size={18} /> 
        </button>
      )
    }
  ];

  const ticketActions = [
    { label: "Filtrer", icon: Filter, onClick: () => {}, variant: "secondary" as const },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    { label: "Nouveau Ticket", icon: TicketPlus, onClick: () => setIsModalOpen(true), variant: "primary" as const },
  ];

  const siteFields = [
    { name: "code_patrimoine", label: "Code du patrimoine", type: "select", required: true, options: [{ label: "12344", value: "1" }] },
    { name: "name", label: "nom du ticket (facultatif)", type: "text", required: true },
    { name: "observations", placeholer:"décrivez les différentes observations sur le problème", type: "rich-text", gridSpan: 2 },

    { name: "provider", label: "Prestataire", type: "select", required: true, options: [
      { label: "immediat", value: "actif" },
      { label: "Alarmant", value: "inactif" }
    ]},
    { name: "site", label: "Site d'affectation", type: "select", required: true, options: [
      { label: "immediat", value: "actif" },
      { label: "Alarmant", value: "inactif" }
    ]},
    { name: "categorie", label: "catégorie ", type: "select", required: true, options: [
      { label: "immediat", value: "actif" },
      { label: "Alarmant", value: "inactif" }
    ]},
    { name: "type", label: "type de mainetenance", type: "select", required: true, options: [
      { label: "immediat", value: "actif" },
      { label: "Alarmant", value: "inactif" }
    ]},

    { name: "startDate", label: "Date début", type: "date", required: true, icon: CalendarDays },
    { name: "endDate", label: "Date limite", type: "date", required: true, icon: CalendarCheck },
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
              <Link href="/admin/prestataires" className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium">
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

          {/* Bloc Contact et Note - Style Image 15a33e */}
<div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 flex flex-col gap-4 min-w-[320px]">
  
  {/* Infos de contact */}
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-3 text-slate-600 font-semibold text-[15px]">
      <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
        <Phone size={16} className="text-slate-900" />
      </div>
      {phone}
    </div>
    <div className="flex items-center gap-3 text-slate-600 font-semibold text-[15px]">
      <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
        <Mail size={16} className="text-slate-900" />
      </div>
      {email}
    </div>
  </div>

  {/* Section Note Grosse Taille */}
  <div className="flex items-center gap-4 mt-2">
    <span className="text-2xl font-black text-slate-900 leading-none">
      {rating > 0 ? rating + "/5" : rating}
    </span>
    
    <div className="flex gap-1">
      {/* Génération des étoiles */}
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={24}
          className={`${
            i < Math.floor(rating) 
              ? "fill-yellow-400 text-yellow-400" 
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
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
              <ActionGroup actions={ticketActions} />
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
            title={selectedTicket?.title || ""}
            reference={selectedTicket?.reference}
            fields={(siteFields as any)?.fields || []}
            descriptionContent={selectedTicket?.description}
      />

      <ReusableForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un ticket"
        subtitle="Remplissez les informations ci-dessous pour enregistrer un nouveau tcket sur la plateforme."
        fields={siteFields} // À remplir avec tes siteFields
        onSubmit={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <DetailsContent />
    </Suspense>
  );
}