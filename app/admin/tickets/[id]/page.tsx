"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import {
  ChevronLeft, MapPin, Wrench, Tag, Clock, CheckCircle2,
  AlertTriangle, FileText, Eye, Download, X, Star,
  User, Calendar, Shield, AlertCircle,
} from "lucide-react";
import { TicketService, Ticket } from "../../../../services/admin/ticket.service";

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
const getUrl = (att: any): string => {
  if (att?.url) { console.log("[Attachment] url from back:", att.url); return att.url; }
  const path = att?.path ?? att?.file_path ?? "";
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api/V1", "").replace("/api", "");
  const url = `${base}/storage/${path}`;
  console.log("[Attachment] url construit:", url, "path:", path);
  return url;
};


// ─── Statuts & Priorités ──────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  "SIGNALÉ":          "bg-slate-100  border-slate-300  text-slate-700",
  "VALIDÉ":           "bg-blue-50    border-blue-400   text-blue-700",
  "ASSIGNÉ":          "bg-violet-50  border-violet-400 text-violet-700",
  "PLANIFIÉ":         "bg-sky-50     border-sky-400    text-sky-700",
  "EN_COURS":         "bg-orange-50  border-orange-400 text-orange-600",
  "EN_TRAITEMENT":    "bg-orange-50  border-orange-400 text-orange-600",
  "DEVIS_EN_ATTENTE": "bg-yellow-50  border-yellow-400 text-yellow-700",
  "DEVIS_APPROUVÉ":   "bg-teal-50    border-teal-400   text-teal-700",
  "RAPPORTÉ":         "bg-amber-50   border-amber-400  text-amber-700",
  "ÉVALUÉ":           "bg-emerald-50 border-emerald-400 text-emerald-700",
  "CLOS":             "bg-black      border-black      text-white",
  "EN_RETARD":        "bg-red-50     border-red-400    text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  "SIGNALÉ": "Signalé", "VALIDÉ": "Validé", "ASSIGNÉ": "Assigné",
  "PLANIFIÉ": "Planifié", "EN_COURS": "En cours", "EN_TRAITEMENT": "En traitement",
  "DEVIS_EN_ATTENTE": "Devis en attente", "DEVIS_APPROUVÉ": "Devis approuvé",
  "RAPPORTÉ": "Rapporté", "ÉVALUÉ": "Évalué", "CLOS": "Clôturé", "EN_RETARD": "En retard",
};
const PRIORITY_STYLE: Record<string, string> = {
  faible: "bg-slate-100 text-slate-600 border-slate-200",
  moyenne: "bg-blue-50 text-blue-700 border-blue-200",
  haute: "bg-orange-50 text-orange-700 border-orange-200",
  critique: "bg-red-100 text-red-700 border-red-300",
};
const PRIORITY_LABEL: Record<string, string> = {
  faible: "Faible", moyenne: "Moyenne", haute: "Haute", critique: "Critique",
};

// ─── Timeline ─────────────────────────────────────────────────────────────────
interface TLEvent { label: string; sub?: string; date?: string; icon: React.ReactNode; color: string; bg: string; border: string; }

function buildTimeline(t: Ticket): TLEvent[] {
  const ev: TLEvent[] = [];
  ev.push({ label: "Ticket créé", sub: t.subject ?? undefined, date: t.created_at, icon: <Tag size={13}/>, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" });
  if (t.planned_at) ev.push({ label: "Planifié", date: t.planned_at, icon: <Calendar size={13}/>, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200" });
  if ((t as any).assigned_at) ev.push({ label: "Assigné au prestataire", sub: (t.provider as any)?.company_name ?? (t.provider as any)?.name, date: (t as any).assigned_at, icon: <User size={13}/>, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200" });
  if ((t as any).started_at) ev.push({ label: "Intervention démarrée", date: (t as any).started_at, icon: <Wrench size={13}/>, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" });
  if ((t as any).reported_at) ev.push({ label: "Rapport soumis", date: (t as any).reported_at, icon: <FileText size={13}/>, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" });
  if ((t as any).evaluated_at) ev.push({ label: "Rapport évalué", date: (t as any).evaluated_at, icon: <CheckCircle2 size={13}/>, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" });
  if (t.resolved_at) ev.push({ label: "Résolu", date: t.resolved_at, icon: <CheckCircle2 size={13}/>, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" });
  if (t.closed_at) ev.push({ label: "Clôturé", date: t.closed_at, icon: <Shield size={13}/>, color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-300" });
  return ev;
}

// ─── PDF Preview ──────────────────────────────────────────────────────────────
function PdfModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center"><FileText size={14} className="text-white"/></div>
          <p className="text-white font-bold text-sm">{name}</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={url} download target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition"><Download size={14}/> Télécharger</a>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"><X size={18} className="text-white"/></button>
        </div>
      </div>
      <div className="flex-1"><iframe src={`${url}#toolbar=0`} className="w-full h-full border-0" title={name}/></div>
    </div>
  );
}


// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminTicketDetailPage() {
const params = useParams<{ id: string }>();
const ticketId = Number(params.id);
  const router   = useRouter();

  const [ticket,     setTicket]     = useState<Ticket | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [pdfPreview, setPdfPreview] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true); setError("");
    TicketService.getTicket(ticketId)
      .then(t => {
        console.log("[AdminTicketDetail] ticket:", t);
        console.log("[AdminTicketDetail] attachments:", t?.attachments);
        console.log("[AdminTicketDetail] reports:", t?.reports);
        setTicket(t);
      })
      .catch(e => {
        console.error("[AdminTicketDetail] erreur:", e?.response?.data ?? e);
        setError(e?.response?.data?.message ?? "Impossible de charger ce ticket.");
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  const attachments = (ticket?.attachments ?? []) as any[];
  const photos = attachments.filter(a => a.file_type === "photo" || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.path ?? a.file_path ?? ""));
  const docs   = attachments.filter(a => a.file_type === "document" || /\.pdf$/i.test(a.path ?? a.file_path ?? ""));
  const reports = (ticket?.reports ?? []) as any[];
  const timeline = ticket ? buildTimeline(ticket) : [];

  const kpis = [
    { label: "Priorité",       value: PRIORITY_LABEL[ticket?.priority ?? ""] ?? ticket?.priority ?? "—", delta: "", trend: "up" as const },
    { label: "Prestataire",    value: (ticket?.provider as any)?.company_name ?? (ticket?.provider as any)?.name ?? "—", delta: "", trend: "up" as const },
    { label: "Pièces jointes", value: attachments.length, delta: "", trend: "up" as const },
    { label: "Rapports",       value: reports.length, delta: "", trend: "up" as const },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="mt-20 p-8 space-y-8">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-black transition bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium">
            <ChevronLeft size={16}/> Retour
          </button>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
              <AlertCircle size={15} className="shrink-0"/> {error}
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 w-80 bg-slate-100 rounded-2xl"/>
              <div className="h-44 bg-slate-100 rounded-3xl"/>
              <div className="grid grid-cols-4 gap-6">{[0,1,2,3].map(i=><div key={i} className="h-28 bg-slate-100 rounded-3xl"/>)}</div>
            </div>
          )}

          {ticket && (
            <>
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">{ticket.code_ticket}</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${STATUS_STYLE[ticket.status] ?? "bg-slate-100 border-slate-300 text-slate-600"}`}>
                        {STATUS_LABEL[ticket.status] ?? ticket.status}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black border ${PRIORITY_STYLE[ticket.priority] ?? ""}`}>
                        {PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black border ${ticket.type === "curatif" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                        {ticket.type === "curatif" ? "Curatif" : "Préventif"}
                      </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{ticket.subject ?? `Ticket #${ticket.id}`}</h1>
                    <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
                      {ticket.site && <span className="flex items-center gap-1.5"><MapPin size={13}/> {ticket.site.nom}</span>}
                      {ticket.asset && <span className="flex items-center gap-1.5"><Wrench size={13}/> {ticket.asset.designation} ({ticket.asset.codification})</span>}
                      {ticket.service && <span className="flex items-center gap-1.5"><Tag size={13}/> {ticket.service.name}</span>}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-2.5 min-w-[240px]">
                    {[
                      { l: "Planifié le", v: fmtDateTime(ticket.planned_at) },
                      { l: "Échéance",    v: fmtDateTime(ticket.due_at) },
                      { l: "Résolu le",   v: fmtDate(ticket.resolved_at), show: !!ticket.resolved_at },
                      { l: "Clôturé le",  v: fmtDate(ticket.closed_at),  show: !!ticket.closed_at },
                    ].filter(r => r.show !== false).map((r, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">{r.l}</span>
                        <span className="font-bold text-slate-900">{r.v}</span>
                      </div>
                    ))}
                    {(ticket as any).delai_restant && (
                      <div className={`mt-2 px-3 py-2 rounded-xl text-xs font-bold border ${(ticket as any).delai_restant.est_en_retard ? "bg-red-50 border-red-200 text-red-700" : (ticket as any).delai_restant.est_urgent ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                        {(ticket as any).delai_restant.libelle}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map((k, i) => <StatsCard key={i} {...k} />)}
              </div>

              {/* Layout 3 colonnes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                  {/* Description */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Description</h3>
                    {ticket.description
                      ? <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: ticket.description }}/>
                      : <p className="text-slate-400 text-sm italic">Aucune description.</p>}
                  </div>

                  {/* Rapports liés */}
                  {reports.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Rapports d'intervention ({reports.length})</h3>
                      <div className="space-y-3">
                        {reports.map((r: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{r.reference ?? `Rapport #${r.id}`}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{r.intervention_type === "preventif" ? "Préventif" : "Curatif"} · {fmtDate(r.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${r.status === "validated" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                {r.status === "validated" ? "Validé" : r.status === "rejected" ? "Rejeté" : "En attente"}
                              </span>
                              <Link href={`/admin/rapports/details/${r.id}`} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-black hover:border-black hover:text-white transition">
                                <Eye size={14}/>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {photos.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Photos ({photos.length})</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {photos.map((att: any, i: number) => {
                          const url = getUrl(att);
                          return (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-slate-100 hover:opacity-80 transition">
                              <img src={url} alt="photo" className="w-full h-full object-cover" onError={() => console.error("[Photo] erreur:", url)}/>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Historique des statuts</h3>
                    <div className="space-y-0">
                      {timeline.map((ev, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${ev.bg} ${ev.border}`}>
                              <span className={ev.color}>{ev.icon}</span>
                            </div>
                            {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-2"/>}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between gap-3 mb-0.5">
                              <h4 className="text-sm font-bold text-slate-900">{ev.label}</h4>
                              <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{fmtDateTime(ev.date)}</span>
                            </div>
                            {ev.sub && <p className="text-xs text-slate-500 mt-1">{ev.sub}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fiche technique</h3>
                    <div className="divide-y divide-slate-50">
                      {[
                        { l: "Référence",   v: ticket.code_ticket },
                        { l: "Type",        v: ticket.type === "curatif" ? "Curatif" : "Préventif" },
                        { l: "Priorité",    v: PRIORITY_LABEL[ticket.priority] ?? ticket.priority },
                        { l: "Statut",      v: STATUS_LABEL[ticket.status] ?? ticket.status },
                        { l: "Site",        v: ticket.site?.nom ?? "—" },
                        { l: "Patrimoine",  v: ticket.asset ? `${ticket.asset.designation} (${ticket.asset.codification})` : "—" },
                        { l: "Service",     v: ticket.service?.name ?? "—" },
                        { l: "Prestataire", v: (ticket.provider as any)?.company_name ?? (ticket.provider as any)?.name ?? "—" },
                        { l: "Coût",        v: ticket.cout ? `${ticket.cout.toLocaleString("fr-FR")} FCFA` : "—" },
                        { l: "Créé le",     v: fmtDate(ticket.created_at) },
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
                          const url  = getUrl(att);
                          const name = (att.path ?? att.file_path ?? "").split("/").pop() ?? "document.pdf";
                          return (
                            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0"><FileText size={16} className="text-red-500"/></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                                  <p className="text-[10px] text-slate-400">PDF</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setPdfPreview({ url, name })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white transition"><Eye size={13}/> Aperçu</button>
                                <a href={url} download target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition"><Download size={13}/> Télécharger</a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-xl px-4 py-5 flex items-center gap-3 text-slate-400">
                        <FileText size={16} className="shrink-0"/>
                        <p className="text-sm font-medium">Aucun document</p>
                      </div>
                    )}
                  </div>

                  {ticket.rating && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Évaluation</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={18} className={i < (ticket.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}/>
                          ))}
                        </div>
                        <span className="text-sm font-black text-slate-700">{ticket.rating}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      {pdfPreview && <PdfModal url={pdfPreview.url} name={pdfPreview.name} onClose={() => setPdfPreview(null)}/>}
    </div>
  );
}
