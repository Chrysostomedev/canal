"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, MapPin, User, ShieldCheck,
  Clock, FileText, CheckCircle2, AlertTriangle, Star,
  Download, Eye, Wrench, ArrowUpRight, CheckSquare,
  FileSearch, Activity, PenSquare, ThumbsUp, ThumbsDown
} from "lucide-react";

import { useToast } from "@/contexts/ToastContext";

import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import AttachmentViewer from "@/components/AttachmentViewer";
import { ReportService, InterventionReport } from "../../../../services/admin/report.service";

const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Soumis",
  validated: "Validé",
  pending: "En attente",
  rejected: "Rejeté",
  draft: "Brouillon",
};

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700 border-blue-100",
  validated: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

// ─────────────────────────────────────────
// VALIDATION MODAL
// ─────────────────────────────────────────

function ValidationModal({
  isOpen,
  onClose,
  onConfirm,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { result: "RAS" | "ANOMALIE"; rating: number; comment: string }) => void;
  loading: boolean;
}) {
  const [result, setResult] = useState<"RAS" | "ANOMALIE">("RAS");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-10 space-y-8">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Validation de l'entretien</h3>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Évaluation de la prestation fournie</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setResult("RAS")}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${result === "RAS" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-400"
                }`}
            >
              <CheckCircle2 size={24} />
              <span className="text-xs font-black uppercase tracking-widest">RAS / Conforme</span>
            </button>
            <button
              onClick={() => setResult("ANOMALIE")}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${result === "ANOMALIE" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-100 bg-slate-50 text-slate-400"
                }`}
            >
              <AlertTriangle size={24} />
              <span className="text-xs font-black uppercase tracking-widest">Anomalies</span>
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Note de satisfaction</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`p-2 transition-transform hover:scale-125 ${s <= rating ? "text-amber-400" : "text-slate-100"}`}
                >
                  <Star size={32} fill={s <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Commentaires / Observations finales</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Prestation impeccable, site libéré propre..."
              rows={3}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm focus:ring-4 focus:ring-slate-900/5 focus:outline-none focus:border-slate-900/20 transition resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-5 rounded-[2rem] bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm({ result, rating, comment })}
              disabled={loading}
              className="flex-[2] py-5 rounded-[2rem] bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Confirmer la Validation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<InterventionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ReportService.getReport(Number(id));
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors du chargement du rapport");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleValidation = async (payload: { result: "RAS" | "ANOMALIE"; rating: number; comment: string }) => {
    setActionLoading(true);
    try {
      await ReportService.validateReport(Number(id), payload);
      toast.success("Rapport validé avec succès");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertTriangle size={48} className="text-red-400" />
          <p className="text-slate-600 font-bold">{error || "Rapport introuvable"}</p>
          <button onClick={() => router.back()} className="text-sm font-bold text-slate-900 underline underline-offset-4">
            Retourner à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="mt-20 p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-4">


          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col gap-6">
              <Link
                href="/admin/entretien"
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-fit text-xs font-black uppercase tracking-widest"
              >
                <ChevronLeft size={16} /> Retour
              </Link>
              <PageHeader
                title={`Maintenance #${report.reference || report.id}`}
                subtitle={`Effectuée le ${formatDate(report.start_date)}`}
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className={`px-5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest ${STATUS_STYLES[report.status || "pending"] || "bg-slate-50 text-slate-600"}`}>
                {STATUS_LABELS[report.status || "pending"] || report.status}
              </span>

              {report.status === "submitted" && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <ThumbsUp size={16} /> Valider l'entretien
                </button>
              )}

              <button className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Type</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-900 uppercase">Préventif</p>
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Fichiers</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-900">{(report.attachments || []).length} pj</p>
                  <FileSearch size={16} className="text-blue-500" />
                </div>
              </div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Résultat</p>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-black uppercase ${report.result === 'ras' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {report.result || 'EN ATTENTE'}
                  </p>
                  <CheckCircle2 size={16} className={report.result === 'ras' ? 'text-emerald-500' : 'text-slate-300'} />
                </div>
              </div>
            </div>

            {/* Observations Section */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Contenu du Rapport</h3>
                    <p className="text-xs text-slate-400 font-medium">Analyses et conclusions techniques</p>
                  </div>
                </div>
                <PenSquare size={18} className="text-slate-300 hover:text-slate-900 cursor-pointer transition" />
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium">
                <div dangerouslySetInnerHTML={{ __html: report.findings || report.description || "Aucune observation rédigée." }} />
              </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Documentation Visuelle</h3>
                  <p className="text-xs text-slate-400 font-medium whitespace-nowrap">GALERIE INTERVENTIONS</p>
                </div>
              </div>
              <div className="text-black">
                <AttachmentViewer attachments={report.attachments || []} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contextualisation</h3>

              <div className="space-y-8">
                {/* Site */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Localisation</p>
                    <p className="text-sm font-bold text-slate-900">{report.site?.nom || report.site?.name || "N/A"}</p>
                    <p className="text-xs text-slate-500 font-medium">{report.site?.city || "Ville non précisée"}</p>
                  </div>
                </div>

                {/* Provider */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Intervenant</p>
                    <p className="text-sm font-bold text-slate-900">{report.provider?.company_name || report.provider?.name || "N/A"}</p>
                    <p className="text-xs text-emerald-600 font-black uppercase tracking-widest text-[9px] mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">PRESTATAIRE CERTIFIÉ</p>
                  </div>
                </div>

                {/* History */}
                <div className="pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Traçabilité</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Soumis le {formatDate(report.created_at)}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Par le prestataire</p>
                      </div>
                    </div>
                    {report.validated_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Validé le {formatDate(report.validated_at)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Par le Gestionnaire {report.validator?.first_name || ""}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation block */}
            {report.rating && (
              <div className="bg-amber-400/10 rounded-[32px] p-8 border border-amber-400/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-xs font-black text-amber-700 uppercase tracking-widest">Avis Client</h3>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} className={s <= (report.rating || 0) ? "text-amber-500 fill-amber-500" : "text-amber-200"} />
                  ))}
                </div>
                <p className="text-sm text-amber-900 font-medium leading-relaxed italic">"{report.comment || report.manager_comment || "Pas de commentaire."}"</p>
              </div>
            )}

            {/*            
            <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Pilotage Admin</p>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => router.push(`/admin/tickets/${report.ticket_id}`)}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 hover:bg-white text-white/70 hover:text-slate-900 transition font-bold text-sm"
                >
                  <span className="flex items-center gap-3"><Activity size={16} /> Historique du ticket</span>
                  <ArrowUpRight size={14} />
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition">
                    Extraire PDF
                  </button>
                  <button className="px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition">
                    <CheckSquare size={16} />
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </main>

      <ValidationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loading={actionLoading}
        onConfirm={handleValidation}
      />
    </div>
  );
}
