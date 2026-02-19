"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ListCard from "@/components/ListCard";
import DonutChartCard from "@/components/DonutChartCard";
import BarChartCard from "@/components/BarChartCard";
import DataTable from "@/components/DataTable"; 
import SideDetailsPanel from "@/components/SideDetailsPanel"; // Import du panel
import { Eye } from "lucide-react";

// Données statiques
const kpis = [
  { label: "Nombre total de sites actifs", value: "10", delta: "+3%", trend: "up" },
  { label: "Nombre total de sites inactifs", value: "01", delta: "+3%", trend: "up" },
  { label: "Coût moyen par site", value: "33K FCFA", delta: "+20,10%", trend: "up" },
  { label: "Coùt total de maintenance", value: "800,5K FCFA", delta: "+15,03%", trend: "up" },
];

const cpis = [
  { label: "Nombre total de tickets", value: "06", delta: "+15,03%", trend: "up" },
  { label: "Nombre total de tickets traités", value: "05", delta: "+20.10%", trend: "up" },
  { label: "Nombre total de tickets non traités", value: "01", delta: "+10%", trend: "up" },
];

const donutData = [
  { label: "Deux plateaux", value: 45, color: "#df1414" },
  { label: "Site 2", value: 30, color: "#07ad07" },
  { label: "Site 3", value: 15, color: "#606eee" },
  { label: "Site 4", value: 10, color: "#050f6b" },
];

const barData = [
  { label: "Jan", value: 220, color: "#01050e" },
  { label: "Fév", value: 300, color: "#041022" },
  { label: "Mar", value: 550, color: "#192535" },
  { label: "Avr", value: 700, color: "#373e46" },
  { label: "Mai", value: 130, color: "#969799" },  
  { label: "Juin", value: 220, color: "#01050e" },
    { label: "jui", value: 700, color: "#373e46" },
  { label: "Aou", value: 130, color: "#969799" },  
  { label: "Sept", value: 620, color: "#969799" },
];

const sites = [
  { name: "Deux plateaux", subText: "26 tickets" },
  { name: "Site 2", subText: "45 tickets" },
  { name: "Site 2", subText: "20 tickets" },
  { name: "Site 2", subText: "30 tickets" },
];

const ticketsData = [
  { id: "#81HHA613", name: "Developpement", date: "26/12/2025", category: "curative", status: "En cours", site: "Deux plateaux" },
  { id: "#AER1234", name: "Maintenance", date: "26/12/2025", category: "dev", status: "En attente", site: "Site 2" },
  { id: "#318993F", name: "Maintenance", date: "28/12/2025", category: "preventive", status: "En attente", site: "Site 3" },
  { id: "#8139013", name: "Maintenance", date: "31/01/2026", category: "preventive", status: "En attente", site: "Deux plateaux" },
  { id: "#AZUJN2435", name: "Maintenance", date: "26/12/2025", category: "preventive", status: "Terminé", site: "Site 4" },
];

export default function Dashboard() {
  // États pour le SidePanel
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fonction pour préparer les données du SidePanel
  const handleOpenDetails = (ticket: any) => {
    const fields = [
      { label: "Type de planification", value: ticket.category },
      { label: "Désignation", value: ticket.name },
      { label: "Date enregistrée", value: ticket.date },
      { label: "Site concerné", value: ticket.site || "N/A" },
      { 
        label: "Statut actuel", 
        value: ticket.status, 
        isStatus: true, 
        statusColor: ticket.status === "Terminé" ? "#000" : ticket.status === "En cours" ? "#f97316" : "#64748b" 
      },
    ];

    setSelectedTicket({
      title: ticket.name,
      reference: ticket.id,
      fields: fields,
      description: "Détails du ticket visualisés depuis le tableau de bord principal."
    });
    setIsDetailsOpen(true);
  };

  // Colonnes définies à l'intérieur pour accéder à handleOpenDetails
  const columns = [
    { header: "ID Ticket", key: "id" },
    { header: "Nom", key: "name" },
    { header: "Date", key: "date" },
    { header: "Site", key: "site" },
    { header: "Catégorie", key: "category" },
    { 
      header: "Status", 
      key: "status",
      render: (value: string) => {
        const styles = {
          "En attente": "border-slate-300 text-slate-700",
          "En cours": "border-orange-200 text-orange-500 bg-orange-50/30",
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
          onClick={() => handleOpenDetails(row)}
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
        >
          <Eye size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />

      <div className="flex-1 flex flex-col pl-64">
        <Navbar />

        <main className="flex-1 p-8 pt-24 space-y-8">
          
          {/* Section Stats Cards */}
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cpis.map((cpi, i) => <StatsCard key={i} {...cpi} />)}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
             </div>
          </div>

          {/* Section Graphiques */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pb-10">
             <BarChartCard title="Tendance de l'année" data={barData} />
             <DonutChartCard title="Les sites les plus fréquentés" data={donutData} />
             <ListCard title="Listes des sites" items={sites} />
          </section>

          {/* Table des tickets */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <DataTable columns={columns} data={ticketsData} onViewAll={() => {}} />
          </div>
        </main>
      </div>

      {/* Side Panel de Détails */}
      <SideDetailsPanel 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedTicket?.title || ""}
        reference={selectedTicket?.reference}
        fields={selectedTicket?.fields || []}
        descriptionContent={selectedTicket?.description}
      />
    </div>
  );
}