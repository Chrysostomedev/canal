"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Download, Upload, Eye, ChevronLeft,
  MapPin, Copy, CheckCheck, CalendarClock,
} from "lucide-react";

import Navbar      from "@/components/Navbar";
import Sidebar     from "@/components/Sidebar";
import Paginate    from "@/components/Paginate";
import StatsCard   from "@/components/StatsCard";
import ReusableForm from "@/components/ReusableForm";
import DataTable   from "@/components/DataTable";
import { FieldConfig } from "@/components/ReusableForm";

// ─── Types locaux ─────────────────────────────────────────────────────────────
interface Asset {
  id: number;
  designation: string;
  code?: string;
  serial_number?: string;
  status: string;
  acquisition_date?: string;
  acquisition_value?: number;
  description?: string;
  typeAsset?: { name: string };
  subTypeAsset?: { name: string };
  site?: { nom: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMontant = (v?: number | null) => {
  if (!v && v !== 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K FCFA`;
  return `${v} FCFA`;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR");
};

// ─── Statuts ──────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  active:         "border-green-500 bg-green-50 text-green-700",
  in_maintenance: "border-amber-400 bg-amber-50 text-amber-700",
  out_of_service: "border-red-400 bg-red-50 text-red-600",
  disposed:       "border-slate-400 bg-slate-100 text-slate-700",
  actif:          "border-green-500 bg-green-50 text-green-700",
  inactif:        "border-red-400 bg-red-50 text-red-600",
  hors_usage:     "border-slate-400 bg-slate-100 text-slate-700",
};
const STATUS_LABEL: Record<string, string> = {
  active:         "Actif",
  in_maintenance: "En maintenance",
  out_of_service: "Hors service",
  disposed:       "Réformé",
  actif:          "Actif",
  inactif:        "Inactif",
  hors_usage:     "Hors usage",
};

// ─── Données statiques ────────────────────────────────────────────────────────
const MOCK_SITE = {
  id: 1,
  nom: "Site Principal",
  adresse: "Abidjan, Plateau",
};

const MOCK_ASSETS: Asset[] = [
  {
    id: 1,
    designation: "Groupe électrogène 500 KVA",
    code: "GE-2024-001",
    status: "active",
    acquisition_date: "2024-01-15",
    acquisition_value: 12500000,
    typeAsset: { name: "Énergie" },
    subTypeAsset: { name: "Groupe électrogène" },
    site: { nom: "Site Principal" },
  },
  {
    id: 2,
    designation: "Climatiseur Split 24000 BTU",
    code: "CL-2023-042",
    status: "in_maintenance",
    acquisition_date: "2023-06-10",
    acquisition_value: 850000,
    typeAsset: { name: "Climatisation" },
    subTypeAsset: { name: "Split" },
    site: { nom: "Site Principal" },
  },
  {
    id: 3,
    designation: "Onduleur 10 KVA",
    code: "ON-2022-018",
    status: "active",
    acquisition_date: "2022-03-22",
    acquisition_value: 3200000,
    typeAsset: { name: "Énergie" },
    subTypeAsset: { name: "Onduleur" },
    site: { nom: "Site Principal" },
  },
  {
    id: 4,
    designation: "Véhicule utilitaire Toyota",
    code: "VH-2021-007",
    status: "hors_usage",
    acquisition_date: "2021-11-05",
    acquisition_value: 18000000,
    typeAsset: { name: "Transport" },
    subTypeAsset: { name: "Véhicule léger" },
    site: { nom: "Site Principal" },
  },
  {
    id: 5,
    designation: "Compresseur d'air 200L",
    code: "CP-2024-003",
    status: "active",
    acquisition_date: "2024-02-28",
    acquisition_value: 2100000,
    typeAsset: { name: "Outillage" },
    subTypeAsset: { name: "Compresseur" },
    site: { nom: "Site Principal" },
  },
];

const MOCK_STATS = {
  total:          MOCK_ASSETS.length,
  active:         MOCK_ASSETS.filter(a => a.status === "active" || a.status === "actif").length,
  in_maintenance: MOCK_ASSETS.filter(a => a.status === "in_maintenance").length,
  total_value:    MOCK_ASSETS.reduce((s, a) => s + (a.acquisition_value ?? 0), 0),
};

// ─── CopyButton ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 p-1 rounded-lg hover:bg-slate-200 transition text-slate-400 hover:text-slate-700"
    >
      {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SitePage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const PER_PAGE = 5;

  const paginated  = MOCK_ASSETS.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const totalPages = Math.ceil(MOCK_ASSETS.length / PER_PAGE);

  // ── Champs formulaire ──
  const assetFields: FieldConfig[] = [
    { name: "type_asset_id",     label: "Famille / Type",    type: "select", required: true, options: [] },
    { name: "sub_type_asset_id", label: "Sous-type",         type: "select", required: true, options: [] },
    { name: "designation",       label: "Désignation",       type: "text",   required: true },
    {
      name: "status", label: "Statut", type: "select", required: true,
      options: [
        { label: "Actif",          value: "active" },
        { label: "En maintenance", value: "in_maintenance" },
        { label: "Hors service",   value: "out_of_service" },
        { label: "Réformé",        value: "disposed" },
      ],
    },
    { name: "acquisition_date",  label: "Date d'entrée",     type: "date",   required: true, icon: CalendarClock },
    { name: "acquisition_value", label: "Valeur d'entrée",   type: "number", required: true },
    { name: "serial_number",     label: "N° de série",       type: "text" },
    { name: "description",       label: "Description",       type: "rich-text", gridSpan: 2 },
  ];

  // ── Colonnes table ──
  const columns = [
    {
      header: "ID", key: "id",
      render: (_: any, row: Asset) => (
        <div className="flex items-center">
          <span className="font-black text-sm">#{row.id}</span>
          <CopyButton text={String(row.id)} />
        </div>
      ),
    },
    {
      header: "Type", key: "typeAsset",
      render: (_: any, row: Asset) => row.typeAsset?.name ?? "—",
    },
    {
      header: "Sous-type", key: "subTypeAsset",
      render: (_: any, row: Asset) => row.subTypeAsset?.name ?? "—",
    },
    {
      header: "Codification", key: "code",
      render: (_: any, row: Asset) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
          {row.code ?? row.serial_number ?? "—"}
        </span>
      ),
    },
    {
      header: "Désignation", key: "designation",
      render: (_: any, row: Asset) => row.designation,
    },
    {
      header: "Statut", key: "status",
      render: (_: any, row: Asset) => (
        <span className={`px-3 py-1 rounded border text-xs font-bold ${STATUS_STYLE[row.status] ?? ""}`}>
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      ),
    },
    {
      header: "Date entrée", key: "acquisition_date",
      render: (_: any, row: Asset) => formatDate(row.acquisition_date),
    },
    {
      header: "Valeur", key: "valeur",
      render: (_: any, row: Asset) => formatMontant(row.acquisition_value),
    },
    {
      header: "Actions", key: "actions",
      render: (_: any, row: Asset) => (
        <button
          onClick={() => setSelectedAsset(row)}
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
        >
          <Eye size={18} /> Aperçu
        </button>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        <main className="ml-64 mt-20 p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">

          {/* ── HEADER SITE ── */}
          <div className="bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="space-y-4">
              <Link
                href="/manager/dashboard"
                className="flex items-center gap-2 text-slate-500 hover:text-black transition bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium"
              >
                <ChevronLeft size={18} /> Retour
              </Link>
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
                  {MOCK_SITE.nom}
                </h1>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <MapPin size={18} />
                  <span className="font-medium text-lg">{MOCK_SITE.adresse}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border min-w-[280px] space-y-2">
              <h3 className="font-bold text-lg">Informations du site</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={16} />
                <span>ID : {MOCK_SITE.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} />
                <span>{MOCK_SITE.adresse}</span>
              </div>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard label="Total patrimoines" value={MOCK_STATS.total}       delta="" trend="up" />
            <StatsCard label="Actifs"            value={MOCK_STATS.active}      delta="" trend="up" />
            <StatsCard label="En maintenance"    value={MOCK_STATS.in_maintenance} delta="" trend="up" />
            <StatsCard label="Valeur totale"     value={formatMontant(MOCK_STATS.total_value)} delta="" trend="up" />
          </div>

          {/* ── ACTIONS ── */}
          <div className="flex justify-end gap-3">
            {/* <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition">
              <Upload size={16} /> Exporter site
            </button> */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition">
              <Download size={16} /> Exporter 
            </button>
            {/* <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
            >
              <Building2 size={16} /> Ajouter un patrimoine
            </button> */}
          </div>

          {/* ── TABLE PATRIMOINES ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={paginated}
              title="Patrimoines du site"
              onViewAll={() => {}}
            />
            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs text-slate-400">
                Page {currentPage} sur {totalPages} · {MOCK_ASSETS.length} éléments
              </p>
              <Paginate
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>

          {/* ── SIDE PANEL aperçu actif ── */}
          {selectedAsset && (
            <>
              <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setSelectedAsset(null)}
              />
              <div className="fixed right-0 top-0 h-full w-[420px] bg-white z-50 shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
                <div className="p-6 border-b space-y-1">
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="text-xs text-slate-400 hover:text-black mb-2"
                  >
                    ✕ Fermer
                  </button>
                  <h2 className="text-2xl font-black">{selectedAsset.designation}</h2>
                  <span className={`inline-block px-3 py-1 rounded-xl border text-xs font-bold ${STATUS_STYLE[selectedAsset.status] ?? ""}`}>
                    {STATUS_LABEL[selectedAsset.status] ?? selectedAsset.status}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
                  {[
                    { label: "ID",            value: `#${selectedAsset.id}` },
                    { label: "Codification",  value: selectedAsset.code ?? selectedAsset.serial_number ?? "—" },
                    { label: "Type",          value: selectedAsset.typeAsset?.name ?? "—" },
                    { label: "Sous-type",     value: selectedAsset.subTypeAsset?.name ?? "—" },
                    { label: "Date d'entrée", value: formatDate(selectedAsset.acquisition_date) },
                    { label: "Valeur",        value: formatMontant(selectedAsset.acquisition_value) },
                    { label: "Site",          value: selectedAsset.site?.nom ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-400 font-medium">{label}</span>
                      <span className="font-bold text-slate-800">{value}</span>
                    </div>
                  ))}
                  {selectedAsset.description && (
                    <div className="bg-slate-50 rounded-xl p-4 text-slate-600 text-sm">
                      {selectedAsset.description}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Modal ajout patrimoine */}
      {/* <ReusableForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un patrimoine"
        subtitle="La gestion du patrimoine est réservée à l'administration"
        fields={assetFields}
        initialValues={{}}
        onSubmit={() => setIsModalOpen(false)}
        submitLabel="Enregistrer"
      /> */}
    </div>
  );
}