"use client";
import { useState, useEffect } from "react";
import ReusableForm from "@/components/ReusableForm";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import ActionGroup from "@/components/ActionGroup";
import StatsCard from "@/components/StatsCard";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SideDetailsPanel from "@/components/SideDetailsPanel";
import { Filter, TicketPlus, Upload, Eye, CalendarCheck, CalendarDays } from "lucide-react";

import { useTickets } from "../../../hooks/useTickets";
import { useProviders } from "../../../hooks/useProviders";
import { useServices } from "../../../hooks/useServices";
import { useSites } from "../../../hooks/useSites";
import { useAssets } from "../../../hooks/useAssets";
import { TicketService, Ticket } from "../../../services/ticket.service";
import { FieldConfig } from "@/components/ReusableForm";

const formatHeures = (h: number | null) => h !== null ? `${h}h` : "-";

const STATUS_LABELS: Record<string, string> = {
  signalez: "Signalé",
  validé: "Validé",
  assigné: "Assigné",
  en_cours: "En cours",
  rapporté: "Rapporté",
  évalué: "Évalué",
  clos: "Clôturé",
};

const STATUS_STYLES: Record<string, string> = {
  signalez: "border-slate-300 text-slate-700 bg-gray-100",
  validé: "border-blue-400 text-blue-600 bg-blue-50",
  assigné: "border-purple-400 text-purple-600 bg-purple-50",
  en_cours: "border-orange-400 text-orange-500 bg-orange-50",
  rapporté: "border-yellow-400 text-yellow-600 bg-yellow-50",
  évalué: "border-green-400 text-green-600 bg-green-50",
  clos: "bg-black text-white border-black",
};

export default function TicketsPage() {
  const { tickets, stats, isLoading, meta, page, filters, fetchTickets, setPage, applyFilters } = useTickets();
  const { providers } = useProviders();
  const { services } = useServices();
  const { assets } = useAssets();
  const { sites, fetchSites } = useSites();

  useEffect(() => {
    if (sites.length === 0) fetchSites();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // =========================
  // DETAILS PANEL
  // =========================
  const handleOpenDetails = (ticket: Ticket) => {
    const statusColor =
      ticket.status === "clos" ? "#000" :
      ticket.status === "en_cours" ? "#f97316" :
      ticket.status === "évalué" ? "#22c55e" : "#64748b";

    const fields = [
      { label: "Type", value: ticket.type === "curatif" ? "Curatif" : "Préventif" },
      { label: "Priorité", value: ticket.priority },
      { label: "Sujet", value: ticket.subject ?? "-" },
      { label: "Site", value: ticket.site?.nom ?? "-" },
      { label: "Patrimoine", value: ticket.asset?.designation ?? "-" },
      { label: "Prestataire", value: ticket.provider?.name ?? "-" },
      { label: "Date planifiée", value: ticket.planned_at },
      { label: "Date limite", value: ticket.due_at },
      { label: "Statut", value: STATUS_LABELS[ticket.status] ?? ticket.status, isStatus: true, statusColor },
    ];

    setSelectedTicket({ ...ticket, fields, title: ticket.subject ?? `Ticket #${ticket.id}` });
    setIsDetailsOpen(true);
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = () => {
    if (!selectedTicket) return;
    setEditingTicket(selectedTicket);
    setIsDetailsOpen(false);
    setIsModalOpen(true);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (formData: any) => {
    try {
      if (editingTicket) {
        await TicketService.updateTicket(editingTicket.id, formData);
        setFlashMessage({ type: "success", message: "Ticket mis à jour avec succès" });
      } else {
        await TicketService.createTicket(formData);
        setFlashMessage({ type: "success", message: "Ticket créé avec succès" });
      }
      await fetchTickets();
      setIsModalOpen(false);
      setEditingTicket(null);
    } catch (err: any) {
      setFlashMessage({ type: "error", message: err?.message || "Erreur serveur" });
    } finally {
      setTimeout(() => setFlashMessage(null), 5000);
    }
  };

  // =========================
  // COLUMNS
  // =========================
  const columns = [
    { header: "ID", key: "id", render: (_: any, row: Ticket) => `#${row.id}` },
    { header: "Sujet", key: "subject", render: (_: any, row: Ticket) => row.subject ?? "-" },
    { header: "Site", key: "site", render: (_: any, row: Ticket) => row.site?.nom ?? "-" },
    { header: "Patrimoine", key: "asset", render: (_: any, row: Ticket) => row.asset?.designation ?? "-" },
    { header: "Type", key: "type", render: (_: any, row: Ticket) => row.type === "curatif" ? "Curatif" : "Préventif" },
    { header: "Priorité", key: "priority" },
    {
      header: "Statut",
      key: "status",
      render: (_: any, row: Ticket) => (
        <span className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-xl border text-xs font-bold ${STATUS_STYLES[row.status] || ""}`}>
          {STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (_: any, row: Ticket) => (
        <button onClick={() => handleOpenDetails(row)} className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition">
          <Eye size={18} />
        </button>
      ),
    },
  ];

  // =========================
  // FORM FIELDS
  // =========================
  const ticketFields: FieldConfig[] = [
    {
      name: "site_id", label: "Site", type: "select", required: true,
      options: sites.map((s: any) => ({ label: s.nom, value: String(s.id) })),
    },
    {
      name: "company_asset_id", label: "Patrimoine", type: "select", required: true,
      options: assets.map((a: any) => ({ label: `${a.designation} (${a.codification})`, value: String(a.id) })),
    },
    {
      name: "service_id", label: "Service", type: "select", required: true,
      options: services.map((s: any) => ({ label: s.name, value: String(s.id) })),
    },
    {
      name: "provider_id", label: "Prestataire", type: "select", required: true,
      options: providers.map((p: any) => ({ label: p.company_name ?? `Prestataire #${p.id}`, value: String(p.id) })),
    },
    {
      name: "type", label: "Type de maintenance", type: "select", required: true,
      options: [{ label: "Curatif", value: "curatif" }, { label: "Préventif", value: "preventif" }],
    },
    {
      name: "priority", label: "Priorité", type: "select", required: true,
      options: [
        { label: "Faible", value: "faible" },
        { label: "Moyenne", value: "moyenne" },
        { label: "Haute", value: "haute" },
        { label: "Critique", value: "critique" },
      ],
    },
    { name: "subject", label: "Sujet", type: "text" },
    { name: "planned_at", label: "Date planifiée", type: "date", required: true, icon: CalendarDays },
    { name: "due_at", label: "Date limite", type: "date", required: true, icon: CalendarCheck },
    { name: "description", label: "Description", type: "rich-text", gridSpan: 2, placeholder: "Décrivez le problème ou l'intervention" },
  ];

  const editFields: FieldConfig[] = [
    {
      name: "status", label: "Statut", type: "select", required: true,
      options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value })),
    },
    {
      name: "priority", label: "Priorité", type: "select",
      options: [
        { label: "Faible", value: "faible" },
        { label: "Moyenne", value: "moyenne" },
        { label: "Haute", value: "haute" },
        { label: "Critique", value: "critique" },
      ],
    },
    { name: "description", label: "Commentaire", type: "rich-text", gridSpan: 2 },
  ];

  // =========================
  // ACTIONS
  // =========================
  const ticketActions = [
    { label: "Filtrer", icon: Filter, onClick: () => setFiltersOpen(!filtersOpen), variant: "secondary" as const },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    {
      label: "Nouveau Ticket", icon: TicketPlus,
      onClick: () => { setEditingTicket(null); setIsModalOpen(true); },
      variant: "primary" as const,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="ml-64 mt-20 p-6 space-y-8">

          <PageHeader title="Tickets" subtitle="Suivez et gérez tous vos tickets d'intervention" />

          {flashMessage && (
            <div className={`px-6 py-4 rounded-2xl text-sm font-semibold ${flashMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {flashMessage.message}
            </div>
          )}

          {/* Stats row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard label="Coût moyen par ticket" value={stats?.cout_moyen_par_ticket ? `${stats.cout_moyen_par_ticket.toLocaleString()} FCFA` : "-"} />
            <StatsCard label="Total tickets" value={stats?.nombre_total_tickets ?? 0} />
            <StatsCard label="Tickets en cours" value={stats?.nombre_total_tickets_en_cours ?? 0} />
            <StatsCard label="Tickets clôturés" value={stats?.nombre_total_tickets_clotures ?? 0} />
          </div>

          {/* Stats row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard label="Tickets ce mois" value={stats?.nombre_tickets_par_mois ?? 0} />
            <StatsCard label="Délai moyen" value={formatHeures(stats?.delais_moyen_traitement_heures ?? null)} />
            <StatsCard label="Délai minimal" value={formatHeures(stats?.delais_minimal_traitement_heures ?? null)} />
            <StatsCard label="Délai maximal" value={formatHeures(stats?.delais_maximal_traitement_heures ?? null)} />
          </div>

          {/* Actions + Filtres */}
          <div className="flex justify-end relative">
            <ActionGroup actions={ticketActions} />
            {filtersOpen && (
              <div className="absolute right-0 top-12 z-50 p-4 bg-black text-white shadow-lg rounded-lg border space-y-3 w-56">
                <select
                  className="w-full border border-white bg-black text-white rounded p-1"
                  value={filters.status || ""}
                  onChange={e => applyFilters({ ...filters, status: e.target.value || undefined })}
                >
                  <option value="">Tous les statuts</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  className="w-full border border-white bg-black text-white rounded p-1"
                  value={filters.type || ""}
                  onChange={e => applyFilters({ ...filters, type: e.target.value || undefined })}
                >
                  <option value="">Tous les types</option>
                  <option value="curatif">Curatif</option>
                  <option value="preventif">Préventif</option>
                </select>
                <select
                  className="w-full border border-white bg-black text-white rounded p-1"
                  value={filters.priority || ""}
                  onChange={e => applyFilters({ ...filters, priority: e.target.value || undefined })}
                >
                  <option value="">Toutes les priorités</option>
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm italic">Chargement...</div>
            ) : (
              <DataTable columns={columns} data={tickets} title="Liste des tickets" />
            )}
            <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
              <Paginate currentPage={page} totalPages={meta?.last_page ?? 1} onPageChange={setPage} />
            </div>
          </div>

        </main>
      </div>

      {/* Details Panel */}
      <SideDetailsPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedTicket?.title || ""}
        reference={selectedTicket?.id ? `#${selectedTicket.id}` : ""}
        fields={selectedTicket?.fields || []}
        descriptionContent={selectedTicket?.description ?? ""}
        onEdit={handleEdit}
      />

      {/* Modal */}
      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTicket(null); }}
        title={editingTicket ? "Modifier le ticket" : "Nouveau ticket"}
        subtitle={editingTicket ? "Modifiez le statut ou les informations du ticket" : "Remplissez les informations pour créer un ticket"}
        fields={editingTicket ? editFields : ticketFields}
        initialValues={editingTicket ? {
          status: editingTicket.status,
          priority: editingTicket.priority,
          description: editingTicket.description ?? "",
        } : {}}
        onSubmit={handleSubmit}
        submitLabel={editingTicket ? "Mettre à jour" : "Créer le ticket"}
      />
    </div>
  );
}