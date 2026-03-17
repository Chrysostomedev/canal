"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import ActionGroup from "@/components/ActionGroup";
import {
  Eye, ArrowUpRight, Download, Filter, X,
  FileText, CheckCircle2, XCircle, AlertCircle,
  Copy, Check, CalendarDays, ClipboardList,
  ShieldCheck, PlayCircle, CheckSquare,
  AlertTriangle, Star, Send, ThumbsUp, ThumbsDown,
  Wrench,
} from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MaintenanceStatus =
  | "planifié" | "en_cours" | "rapporté" | "validé"
  | "clos" | "rejeté" | "anomalie";

type AnomalyAction = "ras" | "immediate" | "devis";

interface MaintenanceTicket {
  id: number;
  reference: string;
  provider_name?: string;
  site: { nom?: string; name?: string } | null;
  site_id: number;
  scheduled_date: string;
  completed_date?: string;
  status: MaintenanceStatus;
  report?: {
    observations: string;
    anomaly_action: AnomalyAction;
    rejection_reason?: string;
    submitted_at?: string;
    validated_at?: string;
    rating?: number;
    rating_comment?: string;
  };
  curative_ticket_id?: number;
  created_at: string;
}

// ─── Static helpers ───────────────────────────────────────────────────────────

const ALL_STATUSES: MaintenanceStatus[] = [
  "planifié", "en_cours", "rapporté", "validé", "clos", "rejeté", "anomalie",
];

const STATUS_LABELS: Record<string, string> = {
  planifié: "Planifié", en_cours: "En cours", rapporté: "Rapporté",
  validé: "Validé", clos: "Clôturé", rejeté: "Rejeté", anomalie: "Anomalie",
};

const STATUS_STYLES: Record<string, string> = {
  planifié:  "border-blue-200   bg-blue-50   text-blue-700",
  en_cours:  "border-amber-200  bg-amber-50  text-amber-700",
  rapporté:  "border-violet-200 bg-violet-50 text-violet-700",
  validé:    "border-emerald-200 bg-emerald-50 text-emerald-700",
  clos:      "border-slate-200  bg-slate-50  text-slate-500",
  rejeté:    "border-red-200    bg-red-50    text-red-700",
  anomalie:  "border-orange-200 bg-orange-50 text-orange-700",
};

const STATUS_DOT: Record<string, string> = {
  planifié: "#3b82f6", en_cours: "#f59e0b", rapporté: "#8b5cf6",
  validé: "#10b981", clos: "#94a3b8", rejeté: "#ef4444", anomalie: "#f97316",
};

const WORKFLOW_STEPS = [
  { key: "planifié",  icon: CalendarDays,  label: "Planifié"  },
  { key: "en_cours",  icon: PlayCircle,    label: "En cours"  },
  { key: "rapporté",  icon: ClipboardList, label: "Rapporté"  },
  { key: "validé",    icon: ShieldCheck,   label: "Validé"    },
  { key: "clos",      icon: CheckSquare,   label: "Clôturé"   },
];

const MOCK_TICKETS: MaintenanceTicket[] = [
  {
    id: 1, reference: "ENT-2025-001",
    provider_name: "Techni-Services SARL",
    site: { nom: "Siège Social Abidjan" }, site_id: 1,
    scheduled_date: "2025-07-15T08:00:00Z", status: "planifié",
    created_at: "2025-07-01T10:00:00Z",
  },
  {
    id: 2, reference: "ENT-2025-002",
    provider_name: "ProMaintenance CI",
    site: { nom: "Antenne Bouaké" }, site_id: 2,
    scheduled_date: "2025-07-10T09:00:00Z",
    completed_date: "2025-07-10T14:30:00Z", status: "rapporté",
    report: {
      observations: "Climatisation salle serveur défectueuse, filtre encrassé. Nettoyage effectué, remplacement filtre recommandé.",
      anomaly_action: "devis",
      submitted_at: "2025-07-10T15:00:00Z",
    },
    created_at: "2025-06-28T10:00:00Z",
  },
  {
    id: 3, reference: "ENT-2025-003",
    provider_name: "Techni-Services SARL",
    site: { nom: "Agence Plateau" }, site_id: 3,
    scheduled_date: "2025-07-05T08:00:00Z", status: "clos",
    report: {
      observations: "RAS. Tous les équipements sont en bon état de fonctionnement. Vérification complète effectuée.",
      anomaly_action: "ras",
      validated_at: "2025-07-06T09:00:00Z",
      submitted_at: "2025-07-05T16:00:00Z",
      rating: 5, rating_comment: "Rapport très complet et détaillé.",
    },
    created_at: "2025-06-20T10:00:00Z",
  },
  {
    id: 4, reference: "ENT-2025-004",
    provider_name: "Facili-Tech Abidjan",
    site: { nom: "Datacenter Yopougon" }, site_id: 4,
    scheduled_date: "2025-07-12T08:00:00Z", status: "rejeté",
    report: {
      observations: "Rapport incomplet.",
      anomaly_action: "ras",
      rejection_reason: "Photos des équipements vérifiés absentes.",
      submitted_at: "2025-07-12T13:00:00Z",
    },
    created_at: "2025-06-25T10:00:00Z",
  },
  {
    id: 5, reference: "ENT-2025-005",
    provider_name: "ProMaintenance CI",
    site: { nom: "Siège Social Abidjan" }, site_id: 1,
    scheduled_date: "2025-07-18T08:00:00Z", status: "en_cours",
    created_at: "2025-07-02T10:00:00Z",
  },
];

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-5 py-4
      rounded-2xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300
      ${type === "success" ? "bg-white border-green-100 text-green-700" : "bg-white border-red-100 text-red-700"}`}>
      {type === "success"
        ? <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        : <XCircle size={18} className="text-red-500 shrink-0" />}
      {msg}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold
      ${STATUS_STYLES[status] ?? "border-slate-200 bg-slate-50 text-slate-500"}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: STATUS_DOT[status] ?? "#94a3b8" }} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── WorkflowProgress ─────────────────────────────────────────────────────────

function WorkflowProgress({ status }: { status: MaintenanceStatus }) {
  const effectiveIdx = status === "rejeté" || status === "anomalie"
    ? WORKFLOW_STEPS.findIndex(s => s.key === "rapporté")
    : WORKFLOW_STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-start gap-0 w-full">
      {WORKFLOW_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done    = i < effectiveIdx;
        const current = i === effectiveIdx;
        const future  = i > effectiveIdx;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5 relative">
            {i < WORKFLOW_STEPS.length - 1 && (
              <div className="absolute top-3.5 left-1/2 w-full h-0.5 z-0"
                style={{ backgroundColor: done ? "#0f172a" : "#e2e8f0" }} />
            )}
            <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition
              ${done ? "bg-slate-900 border-slate-900" : ""}
              ${current ? "bg-slate-900 border-slate-900 ring-4 ring-slate-200" : ""}
              ${future ? "bg-white border-slate-200" : ""}`}>
              <Icon size={12} className={done || current ? "text-white" : "text-slate-300"} />
            </div>
            <p className={`text-[9px] font-bold text-center leading-tight
              ${done || current ? "text-slate-800" : "text-slate-300"}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({
  value, onChange, readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const display = readonly ? value : (hovered || value);

  const labels = ["", "Insuffisant", "Passable", "Correct", "Bien", "Excellent"];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(i)}
            onMouseEnter={() => !readonly && setHovered(i)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-all duration-100 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"}`}
          >
            <Star
              size={readonly ? 16 : 28}
              className={`transition-colors duration-100
                ${i <= display ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
            />
          </button>
        ))}
        {!readonly && display > 0 && (
          <span className="text-sm font-bold text-amber-600 ml-1">{labels[display]}</span>
        )}
        {readonly && value > 0 && (
          <span className="text-xs font-bold text-amber-600 ml-1">{labels[value]}</span>
        )}
      </div>
    </div>
  );
}

// ─── Modale Validation Rapport (centre) ──────────────────────────────────────

function ValidationModal({
  ticket, onClose, onValidate, onReject, submitting,
}: {
  ticket: MaintenanceTicket;
  onClose: () => void;
  onValidate: (data: { rating: number; comment: string }) => void;
  onReject: (reason: string) => void;
  submitting: boolean;
}) {
  const [mode, setMode]       = useState<"review" | "reject">("review");
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const canValidate = rating > 0;
  const canReject   = rejectReason.trim().length > 10;

  const anomalyLabels: Record<AnomalyAction, { label: string; icon: any; color: string }> = {
    ras:       { label: "RAS — Rien à signaler",   icon: CheckCircle2, color: "text-emerald-600" },
    immediate: { label: "Résolue sur place",        icon: Wrench,       color: "text-amber-600"   },
    devis:     { label: "Nécessite un devis",       icon: FileText,     color: "text-orange-600"  },
  };

  const anomaly = ticket.report?.anomaly_action
    ? anomalyLabels[ticket.report.anomaly_action]
    : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={onClose} />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-5 shrink-0 border-b border-slate-50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
                  <ShieldCheck size={14} className="text-violet-600" />
                </div>
                <span className="text-xs font-black text-violet-600 uppercase tracking-widest">
                  Validation du rapport
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900">{ticket.reference}</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {ticket.provider_name} · {ticket.site?.nom ?? "—"} · {formatDate(ticket.scheduled_date)}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition mt-1">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Rapport à relire */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Rapport soumis par le prestataire
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {ticket.report?.observations ?? "Aucune observation."}
              </p>
              {anomaly && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <anomaly.icon size={13} className={anomaly.color} />
                  <span className={`text-xs font-bold ${anomaly.color}`}>{anomaly.label}</span>
                </div>
              )}
            </div>

            {/* Toggle Valider / Rejeter */}
            <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setMode("review")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition
                  ${mode === "review" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
              >
                <ThumbsUp size={15} /> Valider
              </button>
              <button
                type="button"
                onClick={() => setMode("reject")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition
                  ${mode === "reject" ? "bg-white shadow-sm text-red-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                <ThumbsDown size={15} /> Rejeter
              </button>
            </div>

            {/* Mode VALIDER */}
            {mode === "review" && (
              <div className="space-y-4">
                {/* Notation étoiles */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-slate-900">
                    Notation du rapport <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center gap-2">
                    <StarRating value={rating} onChange={setRating} />
                    {rating === 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        Cliquez sur une étoile pour noter le rapport
                      </p>
                    )}
                  </div>
                </div>

                {/* Commentaire */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-900">
                    Commentaire <span className="text-slate-400 font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Observations sur la qualité du rapport, points à améliorer…"
                    className="w-full bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 placeholder:text-slate-400
                      outline-none focus:ring-2 focus:ring-slate-900 transition resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={!canValidate || submitting}
                  onClick={() => onValidate({ rating, comment })}
                  className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-sm font-black
                    hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <CheckCircle2 size={16} />}
                  {submitting ? "Validation en cours…" : "Valider et envoyer à l'Admin"}
                </button>

                {!canValidate && (
                  <p className="text-center text-xs text-slate-400 -mt-2">
                    Une note est requise pour valider
                  </p>
                )}
              </div>
            )}

            {/* Mode REJETER */}
            {mode === "reject" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-900">
                    Motif de rejet <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Expliquez précisément pourquoi ce rapport est incomplet ou inexact…"
                    className="w-full bg-red-50 rounded-2xl p-4 text-sm text-slate-700 placeholder:text-red-300
                      outline-none focus:ring-2 focus:ring-red-400 transition resize-none border border-red-100"
                  />
                  <p className="text-[10px] text-slate-400">
                    Minimum 10 caractères · {rejectReason.length} / 500
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canReject || submitting}
                  onClick={() => onReject(rejectReason)}
                  className="w-full py-4 rounded-2xl bg-red-600 text-white text-sm font-black
                    hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <XCircle size={16} />}
                  {submitting ? "Rejet en cours…" : "Rejeter le rapport"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Side Panel aperçu (lecture seule) ───────────────────────────────────────

function MaintenancePreviewPanel({
  ticket, onClose, onOpenValidation,
}: {
  ticket: MaintenanceTicket;
  onClose: () => void;
  onOpenValidation: (t: MaintenanceTicket) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyRef = () => {
    navigator.clipboard.writeText(ticket.reference);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const anomalyLabels: Record<AnomalyAction, { label: string; icon: any; color: string }> = {
    ras:       { label: "RAS — Rien à signaler", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    immediate: { label: "Résolue sur place",      icon: Wrench,       color: "text-amber-600 bg-amber-50 border-amber-100"     },
    devis:     { label: "Nécessite un devis",     icon: FileText,     color: "text-orange-600 bg-orange-50 border-orange-100"  },
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[440px] bg-white z-50 shadow-2xl flex flex-col rounded-l-3xl overflow-hidden">

        <div className="flex items-start px-6 pt-6 pb-0 shrink-0">
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition -ml-1">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="px-6 pt-4 pb-5 shrink-0">
          <h2 className="text-2xl font-black text-slate-900">Entretien #{ticket.id}</h2>
          <p className="text-slate-400 text-xs mt-0.5">Détails de la visite · lecture seule</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">

          {/* Workflow */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Progression</p>
            <WorkflowProgress status={ticket.status} />
            {(ticket.status === "rejeté" || ticket.status === "anomalie") && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600">
                <AlertTriangle size={12} />
                {ticket.status === "rejeté" ? "Rapport rejeté par le gestionnaire" : "Anomalie détectée"}
              </div>
            )}
          </div>

          {/* Champs */}
          <div className="space-y-0">
            {[
              { label: "Référence", render: () => (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{ticket.reference}</span>
                  <button onClick={copyRef} className="p-1 hover:bg-slate-100 rounded-md transition">
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-slate-400" />}
                  </button>
                </div>
              )},
              { label: "Prestataire", value: ticket.provider_name ?? "—" },
              { label: "Site", value: ticket.site?.nom ?? ticket.site?.name ?? "—" },
              { label: "Date planifiée", value: formatDate(ticket.scheduled_date) },
              ...(ticket.completed_date ? [{ label: "Date réalisée", value: formatDate(ticket.completed_date) }] : []),
              ...(ticket.curative_ticket_id ? [{ label: "Ticket curatif lié", value: `#${ticket.curative_ticket_id}` }] : []),
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                {(f as any).render ? (f as any).render()
                  : <p className="text-sm font-bold text-slate-900">{(f as any).value}</p>}
              </div>
            ))}
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-slate-400 font-medium">Statut</p>
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          {/* Rapport */}
          {ticket.report && (
            <>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-2">Observations du rapport</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {ticket.report.observations}
                </p>
              </div>

              {/* Constat */}
              {ticket.report.anomaly_action && (() => {
                const a = anomalyLabels[ticket.report.anomaly_action!];
                if (!a) return null;
                const Icon = a.icon;
                return (
                  <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-bold ${a.color}`}>
                    <Icon size={15} />
                    {a.label}
                  </div>
                );
              })()}

              {/* Note si déjà évaluée */}
              {ticket.report.rating && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Évaluation</p>
                  <StarRating value={ticket.report.rating} readonly />
                  {ticket.report.rating_comment && (
                    <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                      "{ticket.report.rating_comment}"
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Motif rejet */}
          {ticket.status === "rejeté" && ticket.report?.rejection_reason && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Motif de rejet</p>
              <p className="text-sm text-red-700 leading-relaxed">{ticket.report.rejection_reason}</p>
            </div>
          )}

          {/* CTA Valider si rapporté */}
          {ticket.status === "rapporté" && (
            <button
              onClick={() => onOpenValidation(ticket)}
              className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-black
                hover:bg-black transition flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              Valider / Rejeter le rapport
            </button>
          )}

          {ticket.status === "clos" && (
            <div className="flex items-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
              <CheckCircle2 size={16} />
              Clôturé le {formatDate(ticket.report?.validated_at ?? "")}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Page principale Manager ──────────────────────────────────────────────────

export default function ManagerEntretienPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<MaintenanceTicket[]>(MOCK_TICKETS);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTicket, setSelectedTicket]       = useState<MaintenanceTicket | null>(null);
  const [isPanelOpen, setIsPanelOpen]             = useState(false);
  const [isValidationOpen, setIsValidationOpen]   = useState(false);
  const [validationTarget, setValidationTarget]   = useState<MaintenanceTicket | null>(null);
  const [submitSuccess, setSubmitSuccess]         = useState<string | null>(null);
  const [submitError, setSubmitError]             = useState<string | null>(null);
  const [submitting, setSubmitting]               = useState(false);

  const openPanel      = (t: MaintenanceTicket) => { setSelectedTicket(t); setIsPanelOpen(true); };
  const closePanel     = () => setIsPanelOpen(false);
  const openValidation = (t: MaintenanceTicket) => {
    setValidationTarget(t); setIsPanelOpen(false); setIsValidationOpen(true);
  };
  const closeValidation = () => { setIsValidationOpen(false); setValidationTarget(null); };

  const filtered = statusFilter ? tickets.filter(t => t.status === statusFilter) : tickets;

  const kpis = [
    { label: "Total entretiens",   value: tickets.length,                                          delta: "", trend: "up" as const },
    { label: "À valider",          value: tickets.filter(t => t.status === "rapporté").length,     delta: "", trend: "up" as const },
    { label: "Validés",            value: tickets.filter(t => t.status === "validé").length,       delta: "", trend: "up" as const },
    { label: "Clôturés",           value: tickets.filter(t => t.status === "clos").length,         delta: "", trend: "up" as const },
  ];

  const actions = [
    { label: "Exporter", icon: Download, onClick: () => alert("Export XLSX"), variant: "secondary" as const },
  ];

  const handleValidate = async (data: { rating: number; comment: string }) => {
    if (!validationTarget) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setTickets(prev => prev.map(t =>
      t.id === validationTarget.id
        ? { ...t, status: "validé", report: { ...t.report!, rating: data.rating, rating_comment: data.comment, validated_at: new Date().toISOString() } }
        : t
    ));
    setSubmitting(false);
    closeValidation();
    setSubmitSuccess("Rapport validé et transmis à l'administrateur !");
    setTimeout(() => setSubmitSuccess(null), 4000);
  };

  const handleReject = async (reason: string) => {
    if (!validationTarget) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setTickets(prev => prev.map(t =>
      t.id === validationTarget.id
        ? { ...t, status: "rejeté", report: { ...t.report!, rejection_reason: reason } }
        : t
    ));
    setSubmitting(false);
    closeValidation();
    setSubmitSuccess("Rapport rejeté. Le prestataire sera notifié.");
    setTimeout(() => setSubmitSuccess(null), 4000);
  };

  const columns = [
    {
      header: "Référence", key: "reference",
      render: (_: any, row: MaintenanceTicket) => (
        <span className="font-black text-slate-900 text-sm">{row.reference}</span>
      ),
    },
    {
      header: "Prestataire", key: "provider",
      render: (_: any, row: MaintenanceTicket) => (
        <span className="text-xs text-slate-600 font-medium">{row.provider_name ?? "—"}</span>
      ),
    },
    {
      header: "Site", key: "site",
      render: (_: any, row: MaintenanceTicket) => (
        <span className="text-xs text-slate-600 font-medium">{row.site?.nom ?? row.site?.name ?? "—"}</span>
      ),
    },
    {
      header: "Date planifiée", key: "scheduled_date",
      render: (_: any, row: MaintenanceTicket) => (
        <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
          <CalendarDays size={12} className="text-slate-400" />
          {formatDate(row.scheduled_date)}
        </span>
      ),
    },
    {
      header: "Statut", key: "status",
      render: (_: any, row: MaintenanceTicket) => <StatusBadge status={row.status} />,
    },
    {
      header: "Note", key: "rating",
      render: (_: any, row: MaintenanceTicket) => (
        row.report?.rating
          ? <StarRating value={row.report.rating} readonly />
          : <span className="text-xs text-slate-300 font-medium">—</span>
      ),
    },
    {
      header: "Actions", key: "actions",
      render: (_: any, row: MaintenanceTicket) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openPanel(row)}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 hover:text-slate-900">
            <Eye size={16} />
          </button>
          {/* Bouton validation rapide si rapporté */}
          {row.status === "rapporté" && (
            <button
              onClick={() => openValidation(row)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600
                text-white text-xs font-bold hover:bg-violet-700 transition"
            >
              <ShieldCheck size={13} /> Valider
            </button>
          )}
          <button
            onClick={() => router.push(`/manager/entretiens/${row.id}`)}
            className="group p-2 rounded-xl bg-white hover:bg-black border border-slate-200 hover:border-black transition">
            <ArrowUpRight size={15} className="text-slate-600 group-hover:text-white group-hover:rotate-45 transition-all" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="ml-64 mt-20 p-6 space-y-8">

          <PageHeader
            title="Entretiens"
            subtitle="Consultez et validez les rapports d'entretien préventif soumis par les prestataires"
          />

          {submitError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-medium">
              <AlertCircle size={15} className="shrink-0" /> {submitError}
            </div>
          )}

          {/* Bandeau "À valider" si rapports en attente */}
          {tickets.filter(t => t.status === "rapporté").length > 0 && (
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 text-violet-800
              px-5 py-4 rounded-2xl text-sm font-semibold">
              <ClipboardList size={16} className="shrink-0 text-violet-600" />
              <span>
                <strong>{tickets.filter(t => t.status === "rapporté").length} rapport{tickets.filter(t => t.status === "rapporté").length > 1 ? "s" : ""}</strong>
                {" "}en attente de validation
              </span>
              <button
                onClick={() => setStatusFilter("rapporté")}
                className="ml-auto text-xs font-black text-violet-600 hover:text-violet-800 underline underline-offset-2"
              >
                Voir →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {kpis.map((k, i) => <StatsCard key={i} {...k} />)}
          </div>

          <div className="shrink-0 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400 shrink-0" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="border border-slate-200 bg-white text-slate-700 text-sm font-semibold
                  rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition cursor-pointer">
                <option value="">Tous les statuts</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              {statusFilter && (
                <button onClick={() => setStatusFilter("")}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400">
                  <X size={14} />
                </button>
              )}
            </div>
            <ActionGroup actions={actions} />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Entretiens préventifs</h3>
              <span className="text-xs text-slate-400">{filtered.length} entretien{filtered.length > 1 ? "s" : ""}</span>
            </div>
            <div className="px-6 py-4">
              <DataTable columns={columns} data={filtered} onViewAll={() => {}} />
            </div>
          </div>

        </main>
      </div>

      {submitSuccess && <Toast msg={submitSuccess} type="success" />}
      {submitError   && <Toast msg={submitError}   type="error" />}

      {isPanelOpen && selectedTicket && (
        <MaintenancePreviewPanel
          ticket={selectedTicket}
          onClose={closePanel}
          onOpenValidation={openValidation}
        />
      )}

      {isValidationOpen && validationTarget && (
        <ValidationModal
          ticket={validationTarget}
          onClose={closeValidation}
          onValidate={handleValidate}
          onReject={handleReject}
          submitting={submitting}
        />
      )}
    </div>
  );
}