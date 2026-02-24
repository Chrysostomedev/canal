"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, Filter, Download, Upload, Building2, CalendarClock, X } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ActionGroup from "@/components/ActionGroup";
import DataTable from "@/components/DataTable";
import ReusableForm, { FieldConfig } from "@/components/ReusableForm";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SideDetailsPanel from "@/components/SideDetailsPanel";

import { useAssets } from "../../../hooks/useAssets";
import { AssetService, CompanyAsset, AssetStats } from "../../../services/asset.service";
import { useTypes } from "../../../hooks/useTypes";
import { useSubTypeAssets } from "../../../hooks/useSubTypeAssets";
import { useSites } from "../../../hooks/useSites";

// ── Helpers formatage ──
const formatMontant = (v: number): string => {
  if (!v) return "0 FCFA";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K FCFA`;
  return `${v} FCFA`;
};

const formatDelai = (h: number | null): string => {
  if (h === null || h === undefined) return "N/A";
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}j`;
};

// ── Prévisualise la codification (logique miroir de generateCodification Laravel) ──
// Format réel : {TYPE_CODE}-{SUBTYPE_CODE}-{PRODUCT_CODE}XXX (généré par le backend)
// Côté frontend on affiche juste le préfixe en preview — le vrai code vient du backend
const previewCodification = (
  typeCode?: string,
  subTypeCode?: string,
  productCode?: string
): string => {
  if (!typeCode || !subTypeCode) return "";
  const prod = productCode?.slice(0, 2).toUpperCase() || "??";
  return `${typeCode.toUpperCase()}-${subTypeCode.toUpperCase()}-${prod}***`;
};

// ── Composant Filtre dropdown style CANAL+ ──
interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement>;
  types: any[];
  subTypes: any[];
  filters: any;
  onApply: (f: any) => void;
}

function FilterDropdown({ isOpen, onClose, anchorRef, types, subTypes, filters, onApply }: FilterDropdownProps) {
  const [local, setLocal] = useState(filters);

  useEffect(() => { setLocal(filters); }, [filters]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Filtres</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</label>
          <div className="relative">
            <select
              value={local.type_id || ""}
              onChange={e => setLocal({ ...local, type_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition cursor-pointer"
            >
              <option value="">Tous les types</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>

        {/* Sous-type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sous-type</label>
          <div className="relative">
            <select
              value={local.sub_type_id || ""}
              onChange={e => setLocal({ ...local, sub_type_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition cursor-pointer"
            >
              <option value="">Tous les sous-types</option>
              {subTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>

        {/* Statut */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut</label>
          <div className="flex flex-col gap-2">
            {["", "actif", "inactif", "hors_usage"].map((val) => {
              const labels: Record<string, string> = { "": "Tous", actif: "Actif", inactif: "Inactif", hors_usage: "Hors usage" };
              const isSelected = (local.status || "") === val;
              return (
                <button
                  key={val}
                  onClick={() => setLocal({ ...local, status: val || undefined })}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {labels[val]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
        <button
          onClick={() => { setLocal({}); onApply({}); onClose(); }}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
        >
          Réinitialiser
        </button>
        <button
          onClick={() => { onApply(local); onClose(); }}
          className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}

// ── Page principale ──
export default function PatrimoinesPage() {
  const filterRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatrimoine, setSelectedPatrimoine] = useState<CompanyAsset | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingData, setEditingData] = useState<Partial<CompanyAsset> | null>(null);
  const [flashMessage, setFlashMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // ── Codification preview state ──
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>("");
  const [selectedSubTypeCode, setSelectedSubTypeCode] = useState<string>("");
  const [productCode, setProductCode] = useState<string>("");
  const codificationPreview = previewCodification(selectedTypeCode, selectedSubTypeCode, productCode);

  const { assets, isLoading, meta, page, setPage, filters, applyFilters, fetchAssets } = useAssets();
  const { types, fetchTypes } = useTypes();
  const { subTypes, fetchSubTypes } = useSubTypeAssets();
  const { sites } = useSites();

  const showFlash = (type: "success" | "error", message: string) => {
    setFlashMessage({ type, message });
    setTimeout(() => setFlashMessage(null), 5000);
  };

  const loadStats = () => {
    AssetService.getStats().then(setAssetStats).catch(console.error);
  };

  useEffect(() => {
    fetchTypes();
    fetchSubTypes();
    loadStats();
  }, []);

  // Ferme le filtre si on clique ailleurs
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── KPIs ──
  const cpis = [
    {
      label: "Total actifs",
      value: assetStats?.total_actifs ?? 0,
      delta: `${assetStats?.actifs_actifs ?? 0} actifs / ${assetStats?.actifs_inactifs ?? 0} inactifs`,
      trend: "up" as const,
    },
    {
      label: "Valeur moyenne actif",
      value: assetStats ? formatMontant(assetStats.valeur_moyenne_actif) : "-",
      delta: `Entretien moy. : ${assetStats ? formatMontant(assetStats.cout_moyen_entretien) : "-"}`,
      trend: "up" as const,
      isCurrency: true,
    },
    {
      label: "Valeur totale patrimoine",
      value: assetStats ? formatMontant(assetStats.valeur_totale_patrimoine) : "-",
      delta: `Critiques : ${assetStats ? formatMontant(assetStats.cout_actifs_critiques) : "-"}`,
      trend: "up" as const,
      isCurrency: true,
    },
  ];

  const kpis = [
    {
      label: "Actifs critiques",
      value: assetStats?.total_actifs_critiques ?? 0,
      delta: `${assetStats?.total_actifs_non_critiques ?? 0} non critiques`,
      trend: "up" as const,
    },
    {
      label: "Tickets en cours",
      value: assetStats?.total_tickets_en_cours ?? 0,
      delta: "+0%",
      trend: "up" as const,
    },
    {
      label: "Délai moyen global",
      value: formatDelai(assetStats?.delai_moyen_global_heures ?? null),
      delta: "Intervention",
      trend: "down" as const,
    },
    {
      label: "Délai actifs critiques",
      value: formatDelai(assetStats?.delai_intervention_critique_heures ?? null),
      delta: "Critique",
      trend: "down" as const,
    },
  ];

  // ── Handlers ──
  const handleOpenDetails = (patrimoine: CompanyAsset) => {
    setSelectedPatrimoine(patrimoine);
    setIsDetailsOpen(true);
    setEditingData({
      type_company_asset_id: patrimoine.type?.id,
      sub_type_company_asset_id: patrimoine.sub_type?.id ?? patrimoine.subType?.id,
      designation: patrimoine.designation,
      codification: patrimoine.codification,
      site_id: patrimoine.site?.id,
      status: patrimoine.status,
      criticite: patrimoine.criticite,
      date_entree: patrimoine.date_entree,
      valeur_entree: patrimoine.valeur_entree,
      description: patrimoine.description,
    });
  };

  const handleEdit = () => { setIsModalOpen(true); setIsDetailsOpen(false); };

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      const base = {
        type_company_asset_id: Number(formData.type_company_asset_id),
        sub_type_company_asset_id: Number(formData.sub_type_company_asset_id),
        site_id: Number(formData.site_id),
        designation: formData.designation,
        status: formData.status,
        criticite: formData.criticite || undefined,
        date_entree: formData.date_entree,
        valeur_entree: Number(formData.valeur_entree),
        description: formData.description || undefined,
      };

      if (editingData && selectedPatrimoine) {
        await AssetService.updateAsset(selectedPatrimoine.id, base);
        showFlash("success", "Patrimoine mis à jour avec succès");
      } else {
        await AssetService.createAsset({
          ...base,
          product_type_code: formData.product_type_code || "01",
        });
        showFlash("success", "Patrimoine créé avec succès");
      }

      await fetchAssets();
      loadStats();
      setIsModalOpen(false);
      setEditingData(null);
      setSelectedTypeCode("");
      setSelectedSubTypeCode("");
      setProductCode("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erreur serveur";
      showFlash("error", msg);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await AssetService.exportAssets(filters);
      showFlash("success", "Export téléchargé avec succès");
    } catch {
      showFlash("error", "Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      await AssetService.importAssets(file);
      showFlash("success", "Import réussi");
      await fetchAssets();
      loadStats();
    } catch {
      showFlash("error", "Erreur lors de l'import");
    } finally {
      setImportLoading(false);
      e.target.value = "";
    }
  };

  // ── Colonnes DataTable ──
  const columns = [
    { header: "ID", key: "id" },
    { header: "Type", key: "type", render: (_: any, row: CompanyAsset) => row.type?.name ?? "-" },
    {
      header: "Sous-type", key: "sub_type",
      render: (_: any, row: CompanyAsset) => row.sub_type?.name ?? row.subType?.name ?? "-",
    },
    { header: "Codification", key: "codification" },
    { header: "Désignation", key: "designation" },
    {
      header: "Site", key: "site",
      render: (_: any, row: CompanyAsset) => row.site?.nom ?? row.site?.name ?? "Site indisponible",
    },
    {
      header: "Statut", key: "status",
      render: (_: any, row: CompanyAsset) => {
        const styles: Record<string, string> = {
          actif: "border-green-600 bg-green-50 text-green-700",
          inactif: "bg-red-100 border-red-500 text-red-600",
          hors_usage: "border-black text-black bg-slate-100",
        };
        return (
          <span className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-xl border text-xs font-bold ${styles[row.status] || ""}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Actions", key: "actions",
      render: (_: any, row: CompanyAsset) => (
        <button onClick={() => handleOpenDetails(row)} className="flex items-center gap-2 font-bold text-slate-800 hover:text-gray-500 transition">
          <Eye size={18} /> Aperçu
        </button>
      ),
    },
  ];

  // ── Champs formulaire ──
  // La codification se remplit automatiquement (read-only preview) — le vrai code est généré par le backend
  const assetFields: FieldConfig[] = [
    {
      name: "type_company_asset_id", label: "Famille / Type", type: "select", required: true,
      options: types.map(t => ({ label: t.name, value: t.id })),
      // onChange intercepté dans le form pour mettre à jour le preview
    },
    {
      name: "sub_type_company_asset_id", label: "Sous-type", type: "select", required: true,
      options: subTypes.map(st => ({ label: st.name, value: st.id })),
    },
    { name: "designation", label: "Désignation", type: "text", required: true },
    {
      name: "product_type_code",
      label: "Code produit (2 car.)",
      type: "text",
      required: !editingData, // requis uniquement à la création
      placeholder: "ex: 01",
    },
    // Codification : read-only, valeur = preview
    {
      name: "codification_preview",
      label: "Codification (générée automatiquement)",
      type: "text",
      placeholder: codificationPreview || "Sélectionnez type, sous-type et code produit",
      disabled: true, // read-only
    },
    {
      name: "site_id", label: "Site", type: "select", required: true,
      options: sites.map((s: any) => ({ label: s.nom ?? s.name ?? `Site ${s.id}`, value: s.id })),
    },
    {
      name: "status", label: "Statut", type: "select", required: true,
      options: [
        { label: "Actif", value: "actif" },
        { label: "Inactif", value: "inactif" },
        { label: "Hors usage", value: "hors_usage" },
      ],
    },
    {
      name: "criticite", label: "Criticité", type: "select",
      options: [
        { label: "Critique", value: "critique" },
        { label: "Non critique", value: "non_critique" },
      ],
    },
    { name: "date_entree", label: "Date d'entrée", type: "date", required: true, icon: CalendarClock },
    { name: "valeur_entree", label: "Valeur entrée (FCFA)", type: "number", required: true },
    { name: "description", label: "Description", type: "rich-text", gridSpan: 2 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="ml-64 mt-20 p-6 space-y-8">
          <PageHeader title="Patrimoines" subtitle="Gestion complète des patrimoines" />

          {/* KPIs valeurs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cpis.map((cpi, i) => <StatsCard key={i} {...cpi} />)}
          </div>

          {/* KPIs tickets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
          </div>

          {/* Barre d'actions */}
          <div className="flex justify-end items-center gap-3">

            {/* Import — input file caché déclenché par le bouton */}
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold cursor-pointer hover:bg-slate-50 transition ${importLoading ? "opacity-50 pointer-events-none" : ""}`}>
              <Download size={16} />
              {importLoading ? "Import..." : "Importer"}
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
            </label>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition disabled:opacity-50"
            >
              <Upload size={16} />
              {exportLoading ? "Export..." : "Exporter"}
            </button>

            {/* Filtre — dropdown positionné sous l'icône */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition ${
                  filtersOpen || Object.values(filters).some(Boolean)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter size={16} />
                Filtrer
                {Object.values(filters).filter(Boolean).length > 0 && (
                  <span className="ml-1 bg-white text-slate-900 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </button>

              <FilterDropdown
                isOpen={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                anchorRef={filterRef}
                types={types}
                subTypes={subTypes}
                filters={filters}
                onApply={applyFilters}
              />
            </div>

            {/* Ajouter */}
            <button
              onClick={() => { setEditingData(null); setSelectedTypeCode(""); setSelectedSubTypeCode(""); setProductCode(""); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
            >
              <Building2 size={16} />
              Ajouter un patrimoine
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <DataTable columns={columns} data={isLoading ? [] : assets} onViewAll={() => {}} />
            <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
              <Paginate currentPage={meta?.current_page || 1} totalPages={meta?.last_page || 1} onPageChange={setPage} />
            </div>
          </div>

          {/* Formulaire */}
          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingData(null); }}
            title={editingData ? "Modifier un patrimoine" : "Ajouter un patrimoine"}
            subtitle="Remplissez les informations ci-dessous."
            fields={assetFields}
            initialValues={editingData ? {
              ...editingData,
              codification_preview: editingData.codification ?? "",
            } : {
              codification_preview: codificationPreview,
            }}
            onSubmit={handleCreateOrUpdate}
            // Callback onChange pour mettre à jour le preview de codification
            onFieldChange={(name: string, value: any) => {
              if (name === "type_company_asset_id") {
                const t = types.find((t: any) => String(t.id) === String(value));
                setSelectedTypeCode(t?.code ?? "");
              }
              if (name === "sub_type_company_asset_id") {
                const st = subTypes.find((st: any) => String(st.id) === String(value));
                setSelectedSubTypeCode(st?.code ?? "");
              }
              if (name === "product_type_code") {
                setProductCode(value ?? "");
              }
            }}
          />

          {/* Détail panel */}
          <SideDetailsPanel
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            title={`${selectedPatrimoine?.designation ?? ""} | ${selectedPatrimoine?.codification ?? ""}`}
            reference={selectedPatrimoine?.id}
            fields={selectedPatrimoine ? [
              { label: "Type", value: selectedPatrimoine.type?.name ?? "-" },
              { label: "Sous-type", value: selectedPatrimoine.sub_type?.name ?? selectedPatrimoine.subType?.name ?? "-" },
              { label: "Codification", value: selectedPatrimoine.codification ?? "-" },
              { label: "Désignation", value: selectedPatrimoine.designation ?? "-" },
              { label: "Site", value: selectedPatrimoine.site?.nom ?? selectedPatrimoine.site?.name ?? "-" },
              { label: "Statut", value: selectedPatrimoine.status ?? "-" },
              { label: "Criticité", value: selectedPatrimoine.criticite ?? "-" },
              { label: "Date d'entrée", value: selectedPatrimoine.date_entree ?? "-" },
              { label: "Valeur d'entrée", value: selectedPatrimoine.valeur_entree ? formatMontant(selectedPatrimoine.valeur_entree) : "-" },
            ] : []}
            onEdit={handleEdit}
          />

          {/* Flash */}
          {flashMessage && (
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold border ${
              flashMessage.type === "success"
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-red-600 bg-red-100 border-red-300"
            }`}>
              {flashMessage.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}