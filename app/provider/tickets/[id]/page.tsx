"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ReusableForm from "@/components/ReusableForm";
import type { FieldConfig } from "@/components/ReusableForm";
import {
  ChevronLeft, MapPin, Wrench, Tag, Clock, CheckCircle2,
  FileText, Eye, Download, X, Star, User, Calendar,
  Shield, AlertCircle, RefreshCw,
} from "lucide-react";
import {
  providerTicketService, Ticket,
  canStartIntervention, canSubmitReport, canRequestDevis, isAlreadyReported,
  isPendingAdminAction,
  TICKET_STATUS,
} from "../../../../services/provider/providerTicketService";
import { providerReportService } from "../../../../services/provider/providerReportService";
import { providerQuoteService } from "../../../../services/provider/providerQuoteService";
import { useToast } from "../../../../contexts/ToastContext";

// ─── Champs formulaire rapport curatif ───────────────────────────────────────
const reportFields: FieldConfig[] = [
  {
    name: "result", label: "Résultat de l'intervention", type: "select", required: true,
    options: [
      { label: "Sélectionner…", value: "" },
      { label: "RAS - Rien à signaler", value: "RAS" },
      { label: "Anomalie détectée", value: "anomalie" },
    ], gridSpan: 2,
  },
  { name: "period", label: "Période de l'intervention (Début - Fin)", type: "date-range", required: true, gridSpan: 2, disablePastDates: true },
  { name: "findings", label: "Observations / Constatations *", type: "rich-text", required: true, gridSpan: 2 },
  { name: "action_taken", label: "Actions menées / Travaux effectués", type: "rich-text", required: false, gridSpan: 2 },
  { name: "attachments", label: "Photos & Documents justificatifs", type: "pdf-upload", maxPDFs: 10, gridSpan: 2 } as any,
];

const quoteFields: FieldConfig[] = [
  { name: "amount_ht", label: "Montant HT ", type: "number", placeholder: "Ex: 25000", required: true },
  { name: "tax_rate", label: "TVA (%)", type: "number", placeholder: "18", required: true },
  { name: "description", label: "Description détaillée / Justification", type: "rich-text", required: true, gridSpan: 2 },
  { name: "quote_pdf", label: "Devis PDF ", type: "pdf-upload", maxPDFs: 1, gridSpan: 2 } as any,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
import { resolveUrl } from "@/components/AttachmentViewer";
const getUrl = resolveUrl;

const STATUS_STYLE: Record<string, string> = {
  "SIGNALÉ": "bg-slate-100 border-slate-300 text-slate-700",
  "VALIDÉ": "bg-blue-50 border-blue-400 text-blue-700",
  "ASSIGNÉ": "bg-violet-50 border-violet-400 text-violet-700",
  "PLANIFIÉ": "bg-sky-50 border-sky-400 text-sky-700",
  "EN_COURS": "bg-orange-50 border-orange-400 text-orange-600",
  "EN_TRAITEMENT": "bg-orange-50 border-orange-400 text-orange-600",
  "DEVIS_EN_ATTENTE": "bg-yellow-50 border-yellow-400 text-yellow-700",
  "DEVIS_APPROUVÉ": "bg-teal-50 border-teal-400 text-teal-700",
  "RAPPORTÉ": "bg-amber-50 border-amber-400 text-amber-700",
  "ÉVALUÉ": "bg-emerald-50 border-emerald-400 text-emerald-700",
  "CLOS": "bg-black border-black text-white",
  "EN_RETARD": "bg-red-50 border-red-400 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  "SIGNALÉ": "Signalé", "VALIDÉ": "Validé", "ASSIGNÉ": "Assigné",
  "PLANIFIÉ": "Planifié", "EN_COURS": "En cours", "EN_TRAITEMENT": "En traitement",
  "DEVIS_EN_ATTENTE": "Devis en attente", "DEVIS_APPROUVÉ": "Devis approuvé",
  "RAPPORTÉ": "Rapporté", "ÉVALUÉ": "Évalué", "CLOS": "Clôturé", "EN_RETARD": "En retard",
};
const PRIORITY_LABEL: Record<string, string> = { faible: "Faible", moyenne: "Moyenne", haute: "Haute", critique: "Critique" };

function PdfModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center"><FileText size={14} className="text-white" /></div>
          <p className="text-white font-bold text-sm">{name}</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={url} download target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition"><Download size={14} /> Télécharger</a>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18} className="text-white" /></button>
        </div>
      </div>
      <div className="flex-1"><iframe src={`${url}#toolbar=0`} className="w-full h-full border-0" title={name} /></div>
    </div>
  );
}

export default function ProviderTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const ticketId = Number(params?.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; name: string } | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  const reload = async () => {
    if (!ticketId) return;
    setLoading(true); setError("");
    try {
      const t = await providerTicketService.getTicketById(ticketId);
      console.log("[ProviderTicketDetail] ticket:", t);
      console.log("[ProviderTicketDetail] attachments:", (t as any)?.attachments);
      console.log("[ProviderTicketDetail] reports:", (t as any)?.reports);
      setTicket(t);
    } catch (e: any) {
      console.error("[ProviderTicketDetail] erreur:", e?.response?.data ?? e);
      setError(e?.response?.data?.message ?? "Impossible de charger ce ticket.");
    } finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [ticketId]);

  const handleStart = async () => {
    if (!ticket) return;
    setActionLoading(true);
    try {
      await providerTicketService.startIntervention(ticket.id);
      toast.success("Intervention démarrée. Soumettez votre rapport.");
      // Ouvrir directement la modale rapport après démarrage réussi
      setIsReportOpen(true);
      reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Erreur lors du démarrage.");
    } finally { setActionLoading(false); }
  };

  const handleSubmitReport = async (formData: any) => {
    if (!ticket) return;
    setReportSubmitting(true);
    try {
      await providerReportService.createReport({
        ticket_id: ticket.id,
        intervention_type: "curatif",
        result: formData.result as "RAS" | "anomalie" | undefined,
        findings: formData.findings ?? "",
        action_taken: formData.action_taken,
        start_date: formData.start_date,
        end_date: formData.end_date,
        anomaly_detected: formData.result === "anomalie",
        attachments: formData.attachments as File[] | undefined,
      });
      setIsReportOpen(false);
      toast.success("Rapport soumis avec succès. Le gestionnaire a été notifié.");
      reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Erreur lors de la soumission du rapport.");
    } finally { setReportSubmitting(false); }
  };

  const handleCreateQuote = async (formData: any) => {
    if (!ticket) return;
    setQuoteSubmitting(true);
    try {
      await providerQuoteService.createQuote({
        ticket_id: ticket.id,
        amount_ht: parseFloat(formData.amount_ht),
        tax_rate: parseFloat(formData.tax_rate) || 18,
        description: formData.description,
        pdf_file: formData.quote_pdf?.[0],
        items: [{ designation: "Prestation", quantity: 1, unit_price: parseFloat(formData.amount_ht) }],
      });
      setIsQuoteOpen(false);
      toast.success("Demande de devis envoyée avec succès.");
      reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Erreur lors de la création du devis.");
    } finally { setQuoteSubmitting(false); }
  };

  // ─── Attachments aggregation ───────────────────────────────────────────────
  const ticketAttachments = ((ticket as any)?.attachments ?? []) as any[];
  const reportAttachments = ((ticket as any)?.reports ?? []).flatMap((r: any) => r.attachments ?? []);
  const allAttachments = [...ticketAttachments, ...reportAttachments];

  const photos = allAttachments.filter(a =>
    a?.file_type === "photo" ||
    a?.type === "image" ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(a?.path ?? a?.file_path ?? "")
  );

  const docs = allAttachments.filter(a =>
    a?.file_type === "document" ||
    a?.type === "pdf" ||
    /\.pdf$/i.test(a?.path ?? a?.file_path ?? "")
  );
  const reports = ((ticket as any)?.reports ?? []) as any[];

  // ── Calcul délai depuis planned_at ────────────────────────────────────────
  const computeDelay = (t: Ticket) => {
    if (!t.planned_at || !t.due_at) return null;
    const start = new Date(t.planned_at);
    const due = new Date(t.due_at);
    const now = new Date();
    const totalMs = due.getTime() - start.getTime();
    const elapsedMs = now.getTime() - start.getTime();
    const remainMs = due.getTime() - now.getTime();
    const totalH = Math.round(totalMs / 3_600_000);
    const remainH = Math.round(remainMs / 3_600_000);
    const remainD = Math.floor(remainMs / 86_400_000);
    const isLate = remainMs < 0;
    const isUrgent = !isLate && remainMs < 86_400_000; // < 24h
    const pct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
    return { totalH, remainH, remainD, isLate, isUrgent, pct };
  };
  const delay = ticket ? computeDelay(ticket) : null;

  const kpis = [
    { label: "Priorité", value: PRIORITY_LABEL[ticket?.priority ?? ""] ?? ticket?.priority ?? "—", delta: "", trend: "up" as const },
    { label: "Site", value: ticket?.site?.nom ?? "—", delta: "", trend: "up" as const },
    { label: "Pièces jointes", value: allAttachments.length, delta: "", trend: "up" as const },
    { label: "Rapports", value: reports.length, delta: "", trend: "up" as const },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="mt-4 p-8 space-y-8">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-black transition bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium">
            <ChevronLeft size={16} /> Retour
          </button>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
              <button onClick={reload} className="ml-auto text-xs font-bold underline">Réessayer</button>
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 w-80 bg-slate-100 rounded-2xl" />
              <div className="h-44 bg-slate-100 rounded-3xl" />
              <div className="grid grid-cols-4 gap-6">{[0, 1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-3xl" />)}</div>
            </div>
          )}

          {ticket && (
            <>
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-black text-slate-400 font-mono">{ticket.code_ticket}</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${STATUS_STYLE[ticket.status] ?? "bg-slate-100 border-slate-300 text-slate-600"}`}>
                        {STATUS_LABEL[ticket.status] ?? ticket.status}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black border ${ticket.type === "curatif" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                        {ticket.type === "curatif" ? "Curatif" : "Préventif"}
                      </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{ticket.subject ?? `Ticket #${ticket.id}`}</h1>
                    <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
                      {ticket.site && <span className="flex items-center gap-1.5"><MapPin size={13} /> {ticket.site.nom}</span>}
                      {ticket.asset && <span className="flex items-center gap-1.5"><Wrench size={13} /> {ticket.asset.designation}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setIsQuoteOpen(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 text-sm font-black hover:border-slate-900 transition-all active:scale-95 whitespace-nowrap"
                      >
                        <Tag size={18} /> Demander un devis
                      </button>

                      {canSubmitReport(ticket) && (
                        <button
                          onClick={() => setIsReportOpen(true)}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-95 whitespace-nowrap"
                        >
                          <FileText size={18} /> Soumettre un rapport
                        </button>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2.5 min-w-[240px]">
                      {[
                        { l: "Planifié le", v: fmtDateTime(ticket.planned_at) },
                        { l: "Échéance", v: fmtDateTime(ticket.due_at) },
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-400 font-medium">{r.l}</span>
                          <span className="font-bold text-slate-900">{r.v}</span>
                        </div>
                      ))}

                      {/* Barre de progression SLA */}
                      {delay && (
                        <div className="pt-1 space-y-1.5">
                          <div className="flex justify-between text-[10px] font-medium text-slate-400">
                            <span>SLA {delay.totalH}h</span>
                            <span className={delay.isLate ? "text-red-600 font-black" : delay.isUrgent ? "text-orange-500 font-black" : "text-slate-500"}>
                              {delay.isLate
                                ? `En retard de ${Math.abs(delay.remainH)}h`
                                : delay.remainD > 0
                                  ? `${delay.remainD}j ${Math.abs(delay.remainH % 24)}h restants`
                                  : `${delay.remainH}h restantes`}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${delay.isLate ? "bg-red-500" : delay.isUrgent ? "bg-orange-400" : "bg-emerald-500"}`}
                              style={{ width: `${delay.pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Alerte urgence */}
                      {delay?.isUrgent && !delay.isLate && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
                          <AlertCircle size={13} /> Intervention urgente — moins de 24h
                        </div>
                      )}
                      {delay?.isLate && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                          <AlertCircle size={13} /> SLA dépassé
                        </div>
                      )}
                    </div>

                    {/* Actions provider */}
                    <div className="flex flex-col gap-2">
                      {canStartIntervention(ticket) && (
                        <button
                          onClick={handleStart}
                          disabled={actionLoading}
                          className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition ${delay?.isLate || delay?.isUrgent
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-orange-500 hover:bg-orange-600"
                            }`}
                        >
                          {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Wrench size={14} />}
                          {delay?.isLate ? "Démarrer maintenant — SLA dépassé" : "Démarrer l'intervention"}
                        </button>
                      )}
                      {isAlreadyReported(ticket) && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold font-mono">
                          <Clock size={14} /> RAPPORT SOUMIS — EN ATTENTE
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map((k, i) => <StatsCard key={i} {...k} />)}
              </div>

              {/* Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                  {ticket.description && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Description</h3>
                      <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: ticket.description }} />
                    </div>
                  )}

                  {reports.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Mes rapports ({reports.length})</h3>
                      <div className="space-y-3">
                        {reports.map((r: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{r.reference ?? `Rapport #${r.id}`}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{fmtDate(r.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${r.status === "validated" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                {r.status === "validated" ? "Validé" : "En attente"}
                              </span>
                              <a
                                href={`/provider/rapports/${r.id}`}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                              >
                                <Eye size={12} /> Voir
                              </a>
                            </div>
                          </div>
                        ))}
                        <a href="/provider/rapports" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition mt-1">
                          Voir tous mes rapports
                        </a>
                      </div>
                    </div>
                  )}

                  {photos.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Photos ({photos.length})</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {photos.map((att: any, i: number) => {
                          const url = getUrl(att);
                          return (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-slate-100 hover:opacity-80 transition">
                              <img src={url} alt="photo" className="w-full h-full object-cover" onError={() => console.error("[Photo] erreur:", url)} />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Détails</h3>
                    <div className="divide-y divide-slate-50">
                      {[
                        { l: "Référence", v: ticket.code_ticket },
                        { l: "Type", v: ticket.type === "curatif" ? "Curatif" : "Préventif" },
                        { l: "Priorité", v: PRIORITY_LABEL[ticket.priority] ?? ticket.priority },
                        { l: "Statut", v: STATUS_LABEL[ticket.status] ?? ticket.status },
                        { l: "Site", v: ticket.site?.nom ?? "—" },
                        { l: "Patrimoine", v: ticket.asset ? `${ticket.asset.designation} (${ticket.asset.codification})` : "—" },
                        { l: "Service", v: ticket.service?.name ?? "—" },
                        { l: "Créé le", v: fmtDate(ticket.created_at) },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                          <p className="text-xs text-slate-400 font-medium">{r.l}</p>
                          <p className="text-sm font-bold text-slate-900 text-right max-w-[55%] truncate">{r.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Documents ({docs.length})</h3>
                    {docs.length > 0 ? (
                      <div className="space-y-3">
                        {docs.map((att: any, i: number) => {
                          const url = getUrl(att);
                          const name = (att.path ?? att.file_path ?? "").split("/").pop() ?? "document.pdf";
                          return (
                            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0"><FileText size={16} className="text-red-500" /></div>
                                <p className="text-xs font-bold text-slate-900 truncate flex-1">{name}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setPdfPreview({ url, name })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white transition"><Eye size={13} /> Aperçu</button>
                                <a href={url} download target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition"><Download size={13} /> Télécharger</a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-xl px-4 py-5 flex items-center gap-3 text-slate-400">
                        <FileText size={16} className="shrink-0" />
                        <p className="text-sm font-medium">Aucun document</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      {pdfPreview && <PdfModal url={pdfPreview.url} name={pdfPreview.name} onClose={() => setPdfPreview(null)} />}

      {/* MODALE CRÉATION RAPPORT */}
      {ticket && (
        <ReusableForm
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          title={`Soumettre un rapport #${ticket.id}`}
          subtitle="Renseignez les informations de votre intervention. Le gestionnaire de site sera notifié automatiquement."
          fields={reportFields}
          onSubmit={handleSubmitReport}
          submitLabel={reportSubmitting ? "Soumission en cours..." : "Soumettre le rapport"}
        />
      )}

      {/* MODALE CRÉATION DEVIS */}
      {ticket && (
        <ReusableForm
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          title={`Nouveau devis pour #${ticket.code_ticket || ticket.id}`}
          subtitle="Renseignez le montant estimé et joignez un document PDF si nécessaire."
          fields={quoteFields}
          onSubmit={handleCreateQuote}
          submitLabel={quoteSubmitting ? "Création..." : "Chiffrer et envoyer"}
          initialValues={{ tax_rate: "18" }}
        />
      )}
    </div>
  );
}
