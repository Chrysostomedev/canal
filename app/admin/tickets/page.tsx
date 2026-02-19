"use client";
import { useState } from "react";
import ReusableForm from "@/components/ReusableForm";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import ActionGroup from "@/components/ActionGroup";
import StatsCard from "@/components/StatsCard";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SideDetailsPanel from "@/components/SideDetailsPanel"; // Import du nouveau panel
import { Filter, TicketPlus, Upload, Eye, CalendarCheck, CalendarDays } from "lucide-react";

// --- KPIS & DATA ---
const kpis = [
  { label: "Coût moyen par ticket", value: "100K FCFA", delta: "+3%", trend: "up" },
  { label: "Nombre total de tickets ", value: 55, delta: "+3%", trend: "up" },
  { label: "Nombre total de tickets en cours ", value: "05", delta: "3%", trend: "up" },
  { label: "Nombre total de tickets clôturés", value: 50, delta: "20,10%", trend: "up" },
  { label: "Nombre de tickets par mois", value: 100, delta: "+3%", trend: "up" },
  { label: "Délais moyen de traitement ", value: "3 Jours", delta: "+3%", trend: "up" },
  { label: "Délais minimal de traitement", value: "3 Jours ", delta: "+20.10%", trend: "up" },
  { label: "Délais maximal de traitement", value:"7 Jours", delta:"+3%", trend:"up" }
];

const ticketsData = [
  { id: "#8139013", name: "Test urgent", date: "26/12/2025", site: "Deux plateaux" , categorie:"maintenance" , status: "En cours", description: "Odeur de chaud constatée lors de la mise sous tension." },
  { id: "#81GFGHH013", name: "Maintenance", date: "26/10/2026", site: "Plateau" , categorie:"maintenance" , status: "En attente", description: "Révision annuelle des climatiseurs." },
  { id: "#8EFF5513", name: "Visite préventive", date: "28/12/2025", site: "Deux plateaux" , categorie:"maintenance" , status: "Terminé", description: "Contrôle de routine effectué avec succès." },
];

export default function TicketsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // États pour le SideDetailsPanel
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fonction pour transformer les données du ticket pour le SidePanel
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
          <span className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-xl border text-xs font-bold ${styles[value as keyof typeof styles] || ""}`}>
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
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="ml-64 mt-20 p-6 space-y-8">
          <PageHeader title="Tickets" subtitle="Ce menu vous permet de suivre et gérer tous vos tickets" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
          </div>

          <div className="flex justify-end">
            <ActionGroup actions={ticketActions} />
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <DataTable columns={columns} data={ticketsData} onViewAll={() => {}} />

            <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
              <Paginate currentPage={1} totalPages={8} onPageChange={() => {}} />
            </div>
          </div>

          {/* FORMULAIRE D'AJOUT */}
          <ReusableForm 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Ajouter un nouveau ticket"
             subtitle="Remplissez les informations ci-dessous pour enregistrer un nouveau tcket sur la plateforme."
            fields={siteFields}
            onSubmit={() => setIsModalOpen(false)}
          />

          {/* SIDE PANEL DE DÉTAILS (Celui qu'on a créé) */}
          <SideDetailsPanel 
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            title={selectedTicket?.title || ""}
            reference={selectedTicket?.reference}
            fields={selectedTicket?.fields || []}
            descriptionContent={selectedTicket?.description}
          />
        </main>
      </div>
    </div>
  );
}