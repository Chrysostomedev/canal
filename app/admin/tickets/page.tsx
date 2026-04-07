"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Copy, Eye, Filter, Download, Upload, TicketPlus, X,
  CalendarCheck, CalendarDays, Clock, MapPin,
  Wrench, User, Tag, AlertTriangle, CheckCircle2, Plus,
} from "lucide-react";

import ReusableForm from "@/components/ReusableForm";
import Navbar from "@/components/Navbar";
import DataTable from "@/components/DataTable";
import StatsCard from "@/components/StatsCard";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { FieldConfig } from "@/components/ReusableForm";

import { useTickets } from "../../../hooks/admin/useTickets";
import { useProviders } from "../../../hooks/admin/useProviders";
import { useServices } from "../../../hooks/admin/useServices";
import { useSites } from "../../../hooks/admin/useSites";
import { useAssets } from "../../../hooks/admin/useAssets";
import { TicketService, Ticket } from "../../../services/admin/ticket.service";
import { resolveManagerName, resolveManagerPhone } from "../../../services/admin/site.service";
import * as PlanningService from "../../../services/admin/planningService";
import axiosInstance from "../../../core/axios";

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

const formatHeures = (h: number | null | undefined) =>
  h !== null && h !== undefined ? `${h}h` : "";

const formatDate = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return time === "00:00" ? date : `${date} à ${time}`;
};

// ══════════════════════════════════════════════
// STATUTS
// ══════════════════════════════════════════════

const STATUS_LABELS: Record<string, string> = {
  SIGNALÉ: "Signalé",
  VALIDÉ: "Validé",
  ASSIGNÉ: "Assigné",
  EN_COURS: "En cours",
  RAPPORTÉ: "Rapporté",
  ÉVALUÉ: "Évalué",
  CLOS: "Clôturé",
};

const STATUS_STYLES: Record<string, string> = {
  SIGNALÉ: "border-slate-300 bg-slate-100 text-slate-700",
  VALIDÉ: "border-blue-400 bg-blue-50 text-blue-700",
  ASSIGNÉ: "border-violet-400 bg-violet-50 text-violet-700",
  EN_COURS: "border-orange-400 bg-orange-50 text-orange-600",
  RAPPORTÉ: "border-amber-400 bg-amber-50 text-amber-700",
  ÉVALUÉ: "border-green-500 bg-green-50 text-green-700",
  CLOS: "border-black bg-black text-white",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  SIGNALÉ: "#94a3b8",
  VALIDÉ: "#3b82f6",
  ASSIGNÉ: "#8b5cf6",
  EN_COURS: "#f97316",
  RAPPORTÉ: "#f59e0b",
  ÉVALUÉ: "#22c55e",
  CLOS: "#000000",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-xl border text-xs font-bold ${STATUS_STYLES[status] ?? ""}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ══════════════════════════════════════════════
// PRIORITÉ
// ══════════════════════════════════════════════

const PRIORITY_STYLES: Record<string, string> = {
  faible: "bg-slate-100 text-slate-600",
  moyenne: "bg-blue-50 text-blue-700",
  haute: "bg-orange-50 text-orange-700",
  critique: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  faible: "Faible", moyenne: "Moyenne", haute: "Haute", critique: "Critique",
};

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${PRIORITY_STYLES[priority] ?? ""}`}>
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}

// ══════════════════════════════════════════════
// FILTER DROPDOWN
// ══════════════════════════════════════════════

interface TicketFilters { status?: string; type?: string; priority?: string; }

function FilterDropdown({
  isOpen, onClose, filters, onApply,
}: {
  isOpen: boolean; onClose: () => void;
  filters: TicketFilters; onApply: (f: TicketFilters) => void;
}) {
  const [local, setLocal] = useState<TicketFilters>(filters);
  useEffect(() => { setLocal(filters); }, [filters]);
  if (!isOpen) return null;

  const Pill = ({ val, current, onClick, label }: { val: string; current?: string; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition ${
        (current ?? "") === val ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Filtres</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Statut */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut</p>
          <div className="flex flex-col gap-1.5">
            {[
              { val: "",         label: "Tous les statuts" },
              { val: "SIGNALÉ",  label: "Signalé"  },
              { val: "VALIDÉ",   label: "Validé"   },
              { val: "ASSIGNÉ",  label: "Assigné"  },
              { val: "EN_COURS", label: "En cours" },
              { val: "RAPPORTÉ", label: "Rapporté" },
              { val: "ÉVALUÉ",   label: "Évalué"   },
              { val: "CLOS",     label: "Clôturé"  },
            ].map(o => (
              <Pill key={o.val} val={o.val} current={local.status ?? ""} label={o.label}
                onClick={() => setLocal({ ...local, status: o.val || undefined })} />
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</p>
          <div className="flex flex-col gap-1.5">
            {[
              { val: "",          label: "Tous les types" },
              { val: "curatif",   label: "Curatif"       },
              { val: "preventif", label: "Préventif"     },
            ].map(o => (
              <Pill key={o.val} val={o.val} current={local.type ?? ""} label={o.label}
                onClick={() => setLocal({ ...local, type: o.val || undefined })} />
            ))}
          </div>
        </div>

        {/* Priorité */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Priorité</p>
          <div className="flex flex-col gap-1.5">
            {[
              { val: "",         label: "Toutes"   },
              { val: "faible",   label: "Faible"   },
              { val: "moyenne",  label: "Moyenne"  },
              { val: "haute",    label: "Haute"    },
              { val: "critique", label: "Critique" },
            ].map(o => (
              <Pill key={o.val} val={o.val} current={local.priority ?? ""} label={o.label}
                onClick={() => setLocal({ ...local, priority: o.val || undefined })} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
        <button
          onClick={() => { setLocal({}); onApply({}); onClose(); }}
          className="flex-1 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
        >
          Réinitialiser
        </button>
        <button
          onClick={() => { onApply(local); onClose(); }}
          className="flex-1 py-1.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// TICKET SIDE PANEL
// ══════════════════════════════════════════════

function TicketSidePanel({
  ticket, onClose, onEdit, onWorkflowAction,
}: {
  ticket: Ticket | null; onClose: () => void; onEdit: () => void;
  onWorkflowAction?: (action: string, ticket: Ticket) => void;
}) {
  if (!ticket) return null;

  const statusColor = STATUS_DOT_COLORS[ticket.status] ?? "#94a3b8";
  const statusLabel = STATUS_LABELS[ticket.status] ?? ticket.status;
  
  const [copied, setCopied] = useState(false);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const providerName =
    (ticket as any).provider?.company_name ??
    (ticket as any).provider?.user?.name   ??
    (ticket as any).provider?.name         ??
    (ticket.provider_id ? `Prestataire #${ticket.provider_id}` : "");

  const siteName    = ticket.site?.nom ?? "";
  const assetLabel  = ticket.asset
    ? `${ticket.asset.designation}${ticket.asset.codification ? ` · ${ticket.asset.codification}` : ""}`
    : "";
  const serviceName = ticket.service?.name ?? "";

  const infoRows: Array<{ Icon: any; label: string; value?: string | null; custom?: React.ReactNode }> = [
    { 
      Icon: Tag, 
      label: "Référence", 
      custom: (
        <div className="flex items-center gap-2 group/id">
          <span className="text-sm font-black text-slate-900">#{ticket.id}</span>
          <button 
            onClick={() => handleCopyId(ticket.id.toString())}
            className={`p-1.5 rounded-lg border transition-all ${
              copied 
                ? "bg-green-50 border-green-200 text-green-600" 
                : "bg-slate-50 border-slate-100 text-slate-400 opacity-0 group-hover/id:opacity-100 hover:text-slate-600 hover:border-slate-300"
            }`}
            title="Copier l'identifiant"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      )
    },
    { Icon: MapPin,        label: "Site",            value: siteName },
    { Icon: Wrench,        label: "Patrimoine",      value: assetLabel },
    { Icon: CheckCircle2,  label: "Service",         value: serviceName },
    { Icon: User,          label: "Prestataire",     value: providerName },
    { Icon: AlertTriangle, label: "Priorité",        custom: <PriorityBadge priority={ticket.priority} /> },
    { Icon: CalendarDays,  label: "Date planifiée",  value: formatDate(ticket.planned_at) },
    { Icon: CalendarCheck, label: "Date limite",     value: formatDate(ticket.due_at) },
    ...(ticket.resolved_at ? [{ Icon: CheckCircle2, label: "Résolu le",   value: formatDate(ticket.resolved_at) }] : []),
    ...(ticket.closed_at   ? [{ Icon: Clock,        label: "Clôturé le",  value: formatDate(ticket.closed_at)   }] : []),
    ...(ticket.created_at  ? [{ Icon: Clock,        label: "Créé le",     value: formatDate(ticket.created_at)  }] : []),
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[460px] bg-white z-50 shadow-2xl flex flex-col rounded-l-3xl overflow-hidden">

        <div className="flex items-start px-6 pt-6 pb-0 shrink-0">
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition -ml-1">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="px-7 pt-4 pb-5 shrink-0">
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            {ticket.subject ?? `Ticket #${ticket.id}`}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              ticket.type === "curatif"
                ? "bg-orange-50 text-orange-700 border-orange-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              {ticket.type === "curatif" ? "Curatif" : "Préventif"}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${STATUS_STYLES[ticket.status] ?? ""}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-7 pb-7 space-y-6">
          <div className="space-y-0">
            {infoRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 gap-4">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <row.Icon size={13} />
                  <p className="text-xs font-medium whitespace-nowrap">{row.label}</p>
                </div>
                {row.custom
                  ? row.custom
                  : <p className="text-sm font-bold text-slate-900 text-right truncate max-w-[60%]">{row.value ?? ""}</p>
                }
              </div>
            ))}
            {ticket.cout !== undefined && ticket.cout !== null && (
              <div className="flex items-center justify-between py-3">
                <p className="text-xs text-slate-400 font-medium">Coût</p>
                <p className="text-sm font-bold text-slate-900">
                  {ticket.cout.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            )}
          </div>

          {ticket.description && (
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
              <div
                className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: ticket.description }}
              />
            </div>
          )}
        </div>

        <div className="px-7 py-5 border-t border-slate-100 shrink-0 space-y-3">
          {ticket.status === "SIGNALÉ" && (
            <button
              onClick={() => onWorkflowAction?.("assign", ticket)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition"
            >
              Assigner un prestataire
            </button>
          )}

          {ticket.status === "RAPPORTÉ" && (
            <button
              onClick={() => onWorkflowAction?.("validate", ticket)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition"
            >
              Valider le rapport
            </button>
          )}

          {ticket.status === "ÉVALUÉ" && (
            <button
              onClick={() => onWorkflowAction?.("close", ticket)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-900 transition"
            >
              Clôturer le ticket
            </button>
          )}

          {ticket.type === "curatif" && (
            <button
              onClick={() => onWorkflowAction?.("create_planning", ticket)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
            >
              <CalendarCheck size={16} /> Créer un planning
            </button>
          )}

          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition"
          >
            Modifier les infos
          </button>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════

export default function TicketsPage() {
  const {
    tickets, stats, isLoading, meta, page,
    filters, fetchTickets, setPage, applyFilters,
    assignTicket, closeTicket, validateReport,
  } = useTickets();

  const { providers } = useProviders();
  const { services }  = useServices();
  const { assets }    = useAssets();
  const { sites, fetchSites } = useSites();

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (sites.length === 0) fetchSites(); }, []);

  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editingTicket,  setEditingTicket]  = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailsOpen,  setIsDetailsOpen]  = useState(false);
  const [filtersOpen,    setFiltersOpen]    = useState(false);
  const [flashMessage,   setFlashMessage]   = useState<{ type: "success"|"error"; message: string } | null>(null);
  const [importLoading,  setImportLoading]  = useState(false);
  const [exportLoading,  setExportLoading]  = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [isAssignModalOpen,   setIsAssignModalOpen]   = useState(false);
  const [isValidModalOpen,    setIsValidModalOpen]    = useState(false);
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFiltersOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(() => setFlashMessage(null), 5000);
    return () => clearTimeout(t);
  }, [flashMessage]);

  const showFlash = (type: "success" | "error", message: string) =>
    setFlashMessage({ type, message });

  const activeCount = [filters.status, filters.type, filters.priority].filter(Boolean).length;

  const handleOpenDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailsOpen(true);
  };

  const handleEdit = () => {
    if (!selectedTicket) return;
    setEditingTicket(selectedTicket);
    setIsDetailsOpen(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingTicket) {
        await TicketService.updateTicket(editingTicket.id, formData);
        showFlash("success", "Ticket mis à jour avec succès.");
      } else {
        const payload = { ...formData };
        if (payload.type === "curatif" && payload.planned_at && !payload.due_at) {
          const planned = new Date(payload.planned_at);
          planned.setHours(planned.getHours() + 72);
          payload.due_at = planned.toISOString().slice(0, 10);
        }
        await TicketService.createTicket(payload);
        showFlash("success", "Ticket créé avec succès.");
      }
      await fetchTickets();
      setIsModalOpen(false);
      setEditingTicket(null);
    } catch (err: any) {
      showFlash("error", err?.response?.data?.message ?? err?.message ?? "Erreur serveur.");
    }
  };

  const handleWorkflowAction = async (action: string, ticket: Ticket) => {
    setSelectedTicket(ticket);
    if (action === "assign") {
      setIsAssignModalOpen(true);
    } else if (action === "close") {
      if (confirm("Êtes-vous sûr de vouloir clôturer ce ticket ?")) {
        setWorkflowActionLoading(true);
        const ok = await closeTicket(ticket.id);
        if (ok) {
          showFlash("success", "Ticket clôturé avec succès.");
          setIsDetailsOpen(false);
        }
        setWorkflowActionLoading(false);
      }
    } else if (action === "validate") {
      setIsValidModalOpen(true);
    } else if (action === "create_planning") {
      setIsPlanningModalOpen(true);
    }
  };

  const handleAssignSubmit = async (formData: any) => {
    if (!selectedTicket) return;
    setWorkflowActionLoading(true);
    const ok = await assignTicket(selectedTicket.id, Number(formData.provider_id));
    if (ok) {
      showFlash("success", "Prestataire assigné avec succès.");
      setIsAssignModalOpen(false);
      setIsDetailsOpen(false);
    }
    setWorkflowActionLoading(false);
  };

  const handleValidateSubmit = async (formData: any) => {
    if (!selectedTicket) return;
    setWorkflowActionLoading(true);
    const ok = await validateReport(selectedTicket.id, {
      result: formData.result,
      rating: Number(formData.rating),
      comment: formData.comment,
    });
    if (ok) {
      showFlash("success", "Rapport validé avec succès.");
      setIsValidModalOpen(false);
      setIsDetailsOpen(false);
    }
    setWorkflowActionLoading(false);
  };

  const handlePlanningSubmit = async (formData: any) => {
    if (!selectedTicket) return;
    setWorkflowActionLoading(true);
    try {
      const payload: PlanningService.CreatePlanningPayload = {
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        description: formData.description,
        site_id: Number(formData.site_id),
        provider_id: Number(formData.provider_id),
        company_asset_id: selectedTicket.company_asset_id,
      };
      await PlanningService.createPlanning(payload);
      showFlash("success", "Planning créé avec succès.");
      setIsPlanningModalOpen(false);
      setIsDetailsOpen(false);
      await fetchTickets();
    } catch (err: any) {
      showFlash("error", err?.response?.data?.message ?? "Erreur lors de la création du planning.");
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  const handleExport = async () => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const response = await axiosInstance.get("/admin/ticket/export", {
        params: {
          ...(filters.status   ? { status:   filters.status   } : {}),
          ...(filters.type     ? { type:     filters.type     } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cd = (response.headers["content-disposition"] as string) ?? "";
      const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      link.download = match?.[1]?.replace(/['"]/g, "") ?? `tickets_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showFlash("success", "Export téléchargé avec succès.");
    } catch {
      showFlash("error", "Erreur lors de l'exportation.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await axiosInstance.post("/admin/ticket/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchTickets();
      showFlash("success", `"${file.name}" importé avec succès.`);
    } catch (err: any) {
      showFlash("error", err?.response?.data?.message ?? "Erreur lors de l'import.");
    } finally {
      setImportLoading(false);
    }
  };

  const columns: any[] = [
    /* {
      header: "Photos",
      key: "images",
      ...
    }, */
    {
      header: "Codification", key: "codification",
      render: (_: any, row: Ticket) =>
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
          {(row as any).asset?.codification ?? `#${row.id}`}
        </span>,
    },
    {
      header: "Sujet", key: "subject",
      render: (_: any, row: Ticket) =>
        <span className="font-medium text-slate-900 text-sm max-w-[200px] truncate block">{row.subject ?? ""}</span>,
    },
    {
      header: "Site", key: "site",
      render: (_: any, row: Ticket) => row.site?.nom ?? "",
    },
    {
      header: "Prestataire", key: "provider",
      render: (_: any, row: Ticket) => {
        const name = (row as any).provider?.company_name ?? (row as any).provider?.user?.name ?? (row as any).provider?.name ?? (row.provider_id ? `Prestataire #${row.provider_id}` : "-");
        return <span className="text-sm text-slate-700">{name}</span>;
      },
    },
    {
      header: "Type", key: "type",
      render: (_: any, row: Ticket) => (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
          row.type === "curatif" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"
        }`}>
          {row.type === "curatif" ? "Curatif" : "Préventif"}
        </span>
      ),
    },
    {
      header: "Priorité", key: "priority",
      render: (_: any, row: Ticket) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: "Statut", key: "status",
      render: (_: any, row: Ticket) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions", key: "actions",
      render: (_: any, row: Ticket) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-gray-500 transition"
        >
          <Eye size={18} /> Aperçu
        </button>
      ),
    },
  ];

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
      options: providers.map((p: any) => ({
        label: p.company_name ?? p.user?.name ?? p.name ?? `Prestataire #${p.id}`,
        value: String(p.id),
      })),
    },
    {
      name: "type", label: "Type de maintenance", type: "select", required: true,
      options: [{ label: "Curatif", value: "curatif" }, { label: "Préventif", value: "preventif" }],
    },
    {
      name: "priority", label: "Priorité", type: "select", required: true,
      options: [
        { label: "Faible", value: "faible" }, { label: "Moyenne", value: "moyenne" },
        { label: "Haute", value: "haute" },   { label: "Critique", value: "critique" },
      ],
    },
    { name: "subject",    label: "Sujet",          type: "text" },
    { name: "planned_at", label: "Date planifiée", type: "date", required: true, icon: CalendarDays },
    {
      name: "due_at",
      label: "Date limite",
      type: "date",
      required: false,
      icon: CalendarCheck,
    },
    {
      name: "description", label: "Description", type: "rich-text", gridSpan: 2,
    },
    {
      name: "images", label: "Photos", type: "image-upload", gridSpan: 2, maxImages: 3,
    },
  ];

  const editFields: FieldConfig[] = [
    {
      name: "status", label: "Statut", type: "select", required: true,
      options: Object.entries(STATUS_LABELS).map(([v, l]) => ({ label: l, value: v })),
    },
    {
      name: "priority", label: "Priorité", type: "select",
      options: [
        { label: "Faible", value: "faible" }, { label: "Moyenne", value: "moyenne" },
        { label: "Haute",  value: "haute"  }, { label: "Critique", value: "critique" },
      ],
    },
    { name: "description", label: "Commentaire", type: "rich-text", gridSpan: 2 },
    { name: "images",      label: "Photos",      type: "image-upload", gridSpan: 2, maxImages: 3 },
  ];

  const planningFields: FieldConfig[] = [
    {
      name: "site_id", label: "Site", type: "select", required: true,
      disabled: !!selectedTicket,
      options: sites.map((s: any) => ({ label: s.nom, value: String(s.id) })),
    },
    {
      name: "provider_id", label: "Prestataire", type: "select", required: true,
      options: providers.map((p: any) => ({
        label: p.company_name ?? p.user?.name ?? p.name ?? `Prestataire #${p.id}`,
        value: String(p.id),
      })),
    },
    { name: "date_debut", label: "Date de début", type: "date", required: true },
    { name: "date_fin",   label: "Date de fin",   type: "date", required: true },
    { name: "description", label: "Description", type: "rich-text", gridSpan: 2 },
  ];

  const assignFields: FieldConfig[] = [
    {
      name: "provider_id", label: "Sélectionner un prestataire", type: "select", required: true,
      options: providers.map((p: any) => ({
        label: p.company_name ?? p.user?.name ?? p.name ?? `Prestataire #${p.id}`,
        value: String(p.id),
      })),
    },
  ];

  const validateFields: FieldConfig[] = [
    {
      name: "result", label: "Résultat", type: "select", required: true,
      options: [
        { label: "Réalisé avec succès", value: "SUCCESS" },
        { label: "Partiellement réalisé", value: "PARTIAL" },
        { label: "Échec", value: "FAILURE" },
      ],
    },
    { name: "rating", label: "Note (1-5)", type: "number", required: true },
    { name: "comment", label: "Commentaire", type: "rich-text", gridSpan: 2 },
  ];

  const kpis1 = [
    { label: "Coût moyen / ticket", value: stats?.cout_moyen_par_ticket ?? 0,         isCurrency: true, delta: "+0%", trend: "up" as const },
    { label: "Total tickets",       value: stats?.nombre_total_tickets ?? 0,           delta: "+0%",     trend: "up" as const },
    { label: "Tickets en cours",    value: stats?.nombre_total_tickets_en_cours ?? 0,  delta: "+0%",     trend: "up" as const },
    { label: "Tickets clôturés",    value: stats?.nombre_total_tickets_clotures ?? 0,  delta: "+0%",     trend: "up" as const },
  ];
  const kpis2 = [
    { label: "Tickets ce mois", value: stats?.nombre_tickets_par_mois ?? 0,                  delta: "+0%", trend: "up" as const },
    { label: "Délai moyen",     value: formatHeures(stats?.delais_moyen_traitement_heures),   delta: "+0%", trend: "up" as const },
    { label: "Délai minimal",   value: formatHeures(stats?.delais_minimal_traitement_heures), delta: "+0%", trend: "up" as const },
    { label: "Délai maximal",   value: formatHeures(stats?.delais_maximal_traitement_heures), delta: "+0%", trend: "up" as const },
  ];

  return (
    <>
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />

        <main className="mt-20 p-6 space-y-8">
          <PageHeader title="Tickets" subtitle="Suivez et gérez tous vos tickets d'intervention" />

          {flashMessage && (
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold border ${
              flashMessage.type === "success"
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-red-600 bg-red-100 border-red-300"
            }`}>
              {flashMessage.message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis1.map((k, i) => <StatsCard key={i} {...k} />)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis2.map((k, i) => <StatsCard key={i} {...k} />)}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap min-h-[36px]">
              {activeCount === 0 && (
                <p className="text-xs text-slate-400 font-medium">Aucun filtre actif</p>
              )}
              {filters.status && (
                <span className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {STATUS_LABELS[filters.status]}
                  <button onClick={() => applyFilters({ ...filters, status: undefined })} className="hover:opacity-70 transition"><X size={11} /></button>
                </span>
              )}
              {filters.type && (
                <span className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {filters.type === "curatif" ? "Curatif" : "Préventif"}
                  <button onClick={() => applyFilters({ ...filters, type: undefined })} className="hover:opacity-70 transition"><X size={11} /></button>
                </span>
              )}
              {filters.priority && (
                <span className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {PRIORITY_LABELS[filters.priority]}
                  <button onClick={() => applyFilters({ ...filters, priority: undefined })} className="hover:opacity-70 transition"><X size={11} /></button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold cursor-pointer hover:bg-slate-50 transition ${importLoading ? "opacity-60 cursor-wait" : ""}`}>
                {importLoading
                  ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  : <Download size={16} />
                }
                Importer
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" disabled={importLoading} onChange={handleImport} />
              </label>

              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-wait"
              >
                {exportLoading
                  ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  : <Upload size={16} />
                }
                Exporter
              </button>

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition ${
                    filtersOpen || activeCount > 0
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={16} />
                  Filtrer
                  {activeCount > 0 && (
                    <span className="ml-1 bg-white text-slate-900 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </button>
                <FilterDropdown
                  isOpen={filtersOpen}
                  onClose={() => setFiltersOpen(false)}
                  filters={filters}
                  onApply={(f) => { applyFilters(f); setFiltersOpen(false); }}
                />
              </div>

              <button
                onClick={() => { setEditingTicket(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition shadow-sm"
              >
                <TicketPlus size={16} /> Nouveau Ticket
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <span className="inline-block w-6 h-6 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin mb-3" />
                <p>Chargement des tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Aucun ticket{activeCount > 0 ? " correspondant aux filtres" : ""}.
              </div>
            ) : (
              <DataTable title="Liste des tickets" columns={columns} data={tickets} onViewAll={() => {}} />
            )}
            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs text-slate-400">
                Page {page} sur {meta?.last_page ?? 1} · {meta?.total ?? 0} tickets
              </p>
              <Paginate currentPage={page} totalPages={meta?.last_page ?? 1} onPageChange={setPage} />
            </div>
          </div>
        </main>
      </div>

      <TicketSidePanel
        ticket={isDetailsOpen ? selectedTicket : null}
        onClose={() => { setIsDetailsOpen(false); setSelectedTicket(null); }}
        onEdit={handleEdit}
        onWorkflowAction={handleWorkflowAction}
      />

      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTicket(null); }}
        title={editingTicket ? "Modifier le ticket" : "Nouveau ticket"}
        subtitle={
          editingTicket
            ? "Modifiez le statut ou les informations du ticket"
            : "Remplissez les informations pour créer un ticket"
        }
        fields={editingTicket ? editFields : ticketFields}
        initialValues={editingTicket ? {
          status:      editingTicket.status,
          priority:    editingTicket.priority,
          description: editingTicket.description ?? "",
        } : {}}
        onSubmit={handleSubmit}
        submitLabel={editingTicket ? "Mettre à jour" : "Créer le ticket"}
      />

      <ReusableForm
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assigner un prestataire"
        subtitle="Sélectionnez un prestataire pour ce ticket"
        fields={assignFields}
        onSubmit={handleAssignSubmit}
        submitLabel="Assigner"
      />

      <ReusableForm
        isOpen={isValidModalOpen}
        onClose={() => setIsValidModalOpen(false)}
        title="Valider l'intervention"
        subtitle="Vérifiez le travail effectué et évaluez la prestation"
        fields={validateFields}
        onSubmit={handleValidateSubmit}
        submitLabel="Valider"
      />

      <ReusableForm
        isOpen={isPlanningModalOpen}
        onClose={() => setIsPlanningModalOpen(false)}
        title="Créer un Planning (Maintenance Préventive)"
        subtitle="Un planning créera automatiquement un ticket préventif récurent"
        fields={planningFields}
        initialValues={selectedTicket ? (() => {
          const site = sites.find(s => s.id === selectedTicket.site_id);
          return {
            site_id: String(selectedTicket.site_id),
            provider_id: String(selectedTicket.provider_id),
            description: `Maintenance préventive issue du ticket #${selectedTicket.id}`,
          };
        })() : {}}
        onSubmit={handlePlanningSubmit}
        submitLabel="Créer le planning"
      />
    </>
  );
}