"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";


import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";

import { AssetService } from "../../../../services/manager/asset.service";
import { TicketService } from "../../../../services/manager/ticket.service";
import type { Asset, Ticket } from "../../../../types/manager.types";
import ReusableForm, { FieldConfig } from "@/components/ReusableForm";
import { useTicketActions } from "../../../../hooks/manager/useTicketActions";
import {
  Tag as TagIcon, ChevronLeft, Building2, MapPin, Calendar,
  DollarSign, Wrench, AlertTriangle, Download, CheckCircle2, CalendarDays, Clock,
  Tag
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v?: number | null) => {
  if (!v && v !== 0) return "-";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K FCFA`;
  return `${v.toLocaleString("fr-FR")} FCFA`;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR");
};

const STATUS_STYLE: Record<string, string> = {
  active: "border-green-500 bg-green-50 text-green-700",
  in_maintenance: "border-amber-400 bg-amber-50 text-amber-700",
  out_of_service: "border-red-400 bg-red-50 text-red-600",
  disposed: "border-slate-400 bg-slate-100 text-slate-700",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  in_maintenance: "En maintenance",
  out_of_service: "Hors service",
  disposed: "Réformé",
};

const TICKET_STATUS_STYLE: Record<string, string> = {
  SIGNALÉ: "border-slate-300 bg-slate-100 text-slate-700",
  ASSIGNÉ: "border-violet-400 bg-violet-50 text-violet-700",
  EN_COURS: "border-orange-400 bg-orange-50 text-orange-600",
  EN_TRAITEMENT: "border-orange-400 bg-orange-50 text-orange-600",
  RAPPORTÉ: "border-amber-400 bg-amber-50 text-amber-700",
  ÉVALUÉ: "border-green-500 bg-green-50 text-green-700",
  CLOS: "border-black bg-black text-white",
};

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const assetId = parseInt(id);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [assetError, setAssetError] = useState<string | null>(null);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Hook pour les actions de tickets
  const { createTicket, isSubmitting, error, success } = useTicketActions({
    onSuccess: () => {
      setIsTicketModalOpen(false);
    }
  });

  const ticketFields: FieldConfig[] = [
    {
      name: "subject",
      label: "Sujet du ticket",
      type: "text",
      placeholder: "Ex: Panne constatée sur l'équipement",
      required: true,
      icon: <TagIcon size={18} />
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: [
        { label: "Curatif", value: "curatif" },
        { label: "Préventif", value: "preventif" },
      ],
      required: true,
      icon: <Wrench size={18} />
    },
    {
      name: "priority",
      label: "Priorité",
      type: "select",
      options: [
        { label: "Faible", value: "faible" },
        { label: "Moyenne", value: "moyenne" },
        { label: "Haute", value: "haute" },
        { label: "Critique", value: "critique" },
      ],
      required: true,
      icon: <AlertTriangle size={18} />
    },
    {
      name: "planned_at",
      label: "Début souhaité",
      type: "date",
      disablePastDates: true,
      required: true,
      icon: <CalendarDays size={18} />
    },
    {
      name: "due_at",
      label: "Échéance",
      type: "date",
      required: true,
      disablePastDates: true,
      icon: <Clock size={18} />,
    },
    {
      name: "description",
      label: "Détails supplémentaires",
      type: "rich-text",
      placeholder: "Décrivez précisément le problème constaté...",
      required: true,
      gridSpan: 2,
    },
    {
      name: "image",
      label: "Photo justificative",
      type: "image-upload",
      required: false,
      gridSpan: 2,
    },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [a, t] = await Promise.all([
          AssetService.getAsset(assetId),
          TicketService.getTickets({ per_page: 50 }),
        ]);
        setAsset(a);
        // Filtrer les tickets liés à cet asset
        setTickets(t.items.filter(tk => tk.asset_id === assetId || (tk.asset as any)?.id === assetId));
      } catch (e: any) {
        setAssetError(e?.response?.data?.message ?? "Impossible de charger l'actif.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assetId]);

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col flex-1"><Navbar />
        <div className="mt-20 flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );

  if (assetError || !asset) return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col flex-1"><Navbar />
        <div className="mt-20 flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <AlertTriangle size={40} className="text-red-400 mx-auto" />
            <p className="text-red-600 font-bold">{assetError ?? "Actif introuvable"}</p>
            <Link href="/manager/site" className="text-sm text-slate-500 underline">Retour aux sites</Link>
          </div>
        </div>
      </div>
    </div>
  );

  const kpis = [
    { label: "Valeur d'acquisition", value: fmt(asset.acquisition_value), trend: "up" as const },
    { label: "Date d'entrée", value: fmtDate(asset.acquisition_date), trend: "up" as const },
    { label: "Tickets liés", value: tickets.length, trend: "up" as const },
    { label: "Statut", value: STATUS_LABEL[asset.status] ?? asset.status, trend: "up" as const },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans tracking-tight">
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="mt-20 p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">

          {/* Breadcrumb */}
          <Link href="/manager/site"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition text-sm font-bold bg-white px-4 py-2 rounded-xl border border-slate-100">
            <ChevronLeft size={16} /> Retour aux sites
          </Link>

          {/* Header */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
              <Building2 size={28} className="text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  {asset.designation}
                </h1>
                <span className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase ${STATUS_STYLE[asset.status] ?? "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {STATUS_LABEL[asset.status] ?? asset.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                {asset.code && (
                  <span className="flex items-center gap-1.5">
                    <Tag size={14} />
                    <span className="font-mono font-bold text-slate-700">{asset.code}</span>
                  </span>
                )}
                {asset.site?.nom && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {asset.site.nom}
                  </span>
                )}
                {asset.typeAsset?.name && (
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} />
                    {asset.typeAsset.name}
                    {asset.subTypeAsset?.name && ` / ${asset.subTypeAsset.name}`}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-black transition"
            >
              <Wrench size={16} /> Signaler une anomalie
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((k, i) => <StatsCard key={i} {...k} />)}
          </div>

          {/* Détails techniques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-5">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Spécifications</h3>
              <div className="space-y-0">
                {[
                  { label: "Type", value: asset.typeAsset?.name },
                  { label: "Sous-type", value: asset.subTypeAsset?.name },
                  { label: "N° Série", value: asset.serial_number },
                  { label: "Codification", value: asset.code },
                  { label: "Date d'acquisition", value: fmtDate(asset.acquisition_date) },
                  { label: "Valeur d'entrée", value: fmt(asset.acquisition_value) },
                  { label: "Site", value: asset.site?.nom },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="text-sm font-bold text-slate-900">{value || "-"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tickets liés */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-5">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                Tickets liés ({tickets.length})
              </h3>
              {tickets.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Wrench size={32} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-medium">Aucun ticket pour cet actif</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.slice(0, 8).map(tk => (
                    <div key={tk.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{tk.subject || `Ticket #${tk.id}`}</p>
                        <p className="text-xs text-slate-400 font-medium">{fmtDate(tk.created_at)}</p>
                      </div>
                      <span className={`ml-3 shrink-0 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase ${TICKET_STATUS_STYLE[tk.status?.toUpperCase()] ?? "border-slate-200 bg-slate-50 text-slate-500"}`}>
                        {tk.status}
                      </span>
                    </div>
                  ))}
                  {tickets.length > 8 && (
                    <Link href={`/manager/tickets?asset_id=${asset.id}`}
                      className="block text-center text-xs font-bold text-slate-500 hover:text-slate-900 transition py-2">
                      Voir tous les tickets →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                "{asset.description}"
              </p>
            </div>
          )}

        </main>
      </div>

      {/* Modale de création de ticket */}
      {asset && (
        <ReusableForm
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          title="Signaler un Problème"
          subtitle={`Équipement : ${asset.designation}`}
          fields={ticketFields}
          initialValues={{
            type: 'curatif',
            priority: 'moyenne',
            company_asset_id: asset.id
          }}
          isSubmitting={isSubmitting}
          error={error}
          success={success}
          onSubmit={(values) => {
            createTicket({
              ...values,
              company_asset_id: asset.id,
              site_id: asset.site_id
            } as any);
          }}
          submitLabel="Envoyer le ticket"
        />
      )}
    </div>
  );
}
