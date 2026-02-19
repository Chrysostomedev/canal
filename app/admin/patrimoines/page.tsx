"use client";

import { useState, useEffect } from "react";
import { Eye, Filter, Download, Upload, Building2, CalendarClock } from "lucide-react";

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
import { AssetService, CompanyAsset } from "../../../services/asset.service";
import { useTypes } from "../../../hooks/useTypes";
import { useSubTypeAssets } from "../../../hooks/useSubTypeAssets";


export default function PatrimoinesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatrimoine, setSelectedPatrimoine] = useState<CompanyAsset | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingData, setEditingData] = useState<Partial<CompanyAsset> | null>(null);
  const [flashMessage, setFlashMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);


  const cpis = [
      { label: "Sites actifs", value: 10, delta: "+3", trend: "up" },
      { label: "Coût moyen", value: "33 K", delta: "+20.10%", trend: "up" },
      { label: "Coût total", value: "800.5 K", delta: "+15.03%", trend: "up" },
    ];
    
    const kpis = [
      { label: "Tickets totaux", value: 1234, delta: "+5%", trend: "up" },
      { label: "Tickets traités", value: 1020, delta: "+8%", trend: "up" },
      { label: "Tickets non traités", value: 214, delta: "13%", trend: "up" },
      { label: "Temps moyen", value: 214, delta: "33%", trend: "up" },
    ];
  // ⚡ Hooks
  const { assets, isLoading, meta, page, setPage, filters, applyFilters, fetchAssets } = useAssets();
  const { types, fetchTypes } = useTypes();
  const { subTypes, fetchSubTypes } = useSubTypeAssets();

  // 🔄 Fetch types, subTypes et assets initialement
  useEffect(() => {
    fetchTypes();
    fetchSubTypes();
  }, []);

  // 🔄 Refetch assets quand types/subTypes changent pour mapping
  useEffect(() => {
    fetchAssets();
  }, [types, subTypes]);

  // =========================
  // DETAILS PANEL
  // =========================
  const handleOpenDetails = (patrimoine: CompanyAsset) => {
    setSelectedPatrimoine(patrimoine);
    setIsDetailsOpen(true);
    setEditingData({
      type_company_asset_id: patrimoine.type?.id,
      sub_type_company_asset_id: patrimoine.subType?.id,
      designation: patrimoine.designation,
      codification: patrimoine.codification,
      site_id: patrimoine.site?.id || 1,
      status: patrimoine.status,
      date_entree: patrimoine.date_entree,
      valeur_entree: patrimoine.valeur_entree,
      description: patrimoine.description,
    });
  };

  const handleEdit = () => {
    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (editingData && selectedPatrimoine) {
        await AssetService.updateAsset(selectedPatrimoine.id, formData);
        setFlashMessage({ type: "success", message: "Patrimoine mis à jour avec succès" });
      } else {
        await AssetService.createAsset(formData);
        setFlashMessage({ type: "success", message: "Patrimoine créé avec succès" });
      }

      await fetchAssets();
      setIsModalOpen(false);
      setEditingData(null);

      setTimeout(() => setFlashMessage(null), 5000);
    } catch (err: any) {
      setFlashMessage({ type: "error", message: err?.message || "Erreur serveur" });
      setTimeout(() => setFlashMessage(null), 5000);
    }
  };

  // =========================
  // DATATABLE COLUMNS
  // =========================
  const columns = [
    { header: "ID", key: "id" },
    { header: "Type", key: "type", render: (_, row: CompanyAsset) => row.type?.name || "-" },
    { header: "Sous-type", key: "subType", render: (_, row: CompanyAsset) => row.subType?.name || "-" },
    { header: "Codification", key: "codification" },
    { header: "Désignation", key: "designation" },
    { header: "Site", key: "site", render: (_, row: CompanyAsset) => row.site?.name || "Site temporaire" },
    {
      header: "Statut",
      key: "status",
      render: (_, row: CompanyAsset) => {
        const styles = {
          actif: "border-green-600 bg-green-50 text-green-700",
          inactif: "bg-red-100 border-red-500 text-red-600",
          hors_usage: "border-black text-black bg-slate-100",
        };
        return (
          <span className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-xl border text-xs font-bold ${styles[row.status as keyof typeof styles] || ""}`}>
      {row.status}
    </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, row: CompanyAsset) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-gray-500 transition"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  // =========================
  // FORM FIELDS
  // =========================
  const assetFields: FieldConfig[] = [
    { name: "type_company_asset_id", label: "Famille / Type", type: "select", required: true, options: types.map(t => ({ label: t.name, value: t.id })) },
    { name: "sub_type_company_asset_id", label: "Sous-type", type: "select", required: true, options: subTypes.map(st => ({ label: st.name, value: st.id })) },
    { name: "designation", label: "Désignation", type: "text", required: true },
    { name: "codification", label: "Codification", type: "text", placeholder: "ex: SD1245", required: true },
    { name: "site_id", label: "Site", type: "select", required: true, options: [{ label: "Site temporaire", value: 1 }] },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { label: "Actif", value: "actif" },
        { label: "Inactif", value: "inactif" },
        { label: "Hors usage", value: "hors_usage" },
      ],
    },
    { name: "date_entree", label: "Date d'entrée", type: "date", required: true, icon: CalendarClock },
    { name: "valeur_entree", label: "Valeur entrée", type: "number", required: true },
    { name: "description", label: "Description", type: "rich-text", gridSpan: 2, placeholder: "Décrivez plus en détail le patrimoine" },
  ];

  // =========================
  // ACTIONS + FILTERS
  // =========================
  const siteActions = [
    {
      label: "Filtrer par",
      icon: Filter,
      onClick: () => setFiltersOpen(!filtersOpen),
      variant: "secondary" as const,
      dropdown: (
        <div className="p-4 bg-black text-white shadow-lg rounded-lg border space-y-3 w-56">
          <select
            className="w-full border border-white bg-black text-white rounded p-1"
            value={filters.type_id || ""}
            onChange={e => applyFilters({ ...filters, type_id: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Tous les types</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select
            className="w-full border border-white bg-black text-white rounded p-1"
            value={filters.sub_type_id || ""}
            onChange={e => applyFilters({ ...filters, sub_type_id: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Tous les sous-types</option>
            {subTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
          </select>

          <select
            className="w-full border border-white bg-black text-white rounded p-1"
            value={filters.status || ""}
            onChange={e => applyFilters({ ...filters, status: e.target.value || undefined })}
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="hors_usage">Hors usage</option>
          </select>
        </div>
      ),
    },
    { label: "Importer", icon: Download, onClick: () => {}, variant: "secondary" as const },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    {
      label: "Ajouter un patrimoine",
      icon: Building2,
      onClick: () => {
        setEditingData(null);
        setIsModalOpen(true);
      },
      variant: "primary" as const,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="ml-64 mt-20 p-6 space-y-8">
          <PageHeader title="Patrimoines" subtitle="Gestion complète des patrimoines" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cpis.map((cpi, i) => <StatsCard key={i} {...cpi} />)}
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
          </div>

          <div className="shrink-0 flex justify-end relative">
            <ActionGroup actions={siteActions} />
            {filtersOpen && <div className="absolute right-0 top-12 z-50">{siteActions[0].dropdown}</div>}
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <DataTable columns={columns} data={isLoading ? [] : assets} onViewAll={() => {}} />
            <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
              <Paginate currentPage={meta?.current_page || 1} totalPages={meta?.last_page || 1} onPageChange={setPage} />
            </div>
          </div>

          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingData(null); }}
            title={editingData ? "Modifier un patrimoine" : "Ajouter un patrimoine"}
            subtitle="Remplissez les informations ci-dessous."
            fields={assetFields}
            initialValues={editingData || {}}
            onSubmit={handleCreateOrUpdate}
          />

          <SideDetailsPanel
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            title={`${selectedPatrimoine?.designation} | ${selectedPatrimoine?.codification}` || ""}
            reference={selectedPatrimoine?.id}
            fields={selectedPatrimoine ? columns.map(col => {
              const raw = (selectedPatrimoine as any)[col.key];
              const value = typeof raw === 'object' && raw !== null
                ? raw.name ?? raw.code ?? ''
                : String(raw ?? '');
              return { label: col.header, value };
            }) : []}
            onEdit={handleEdit}
          />

          {flashMessage && (
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${flashMessage.type === "success" ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-100 border-red-300"}`}>
              {flashMessage.message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
