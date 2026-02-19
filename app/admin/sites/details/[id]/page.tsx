"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Filter, Download, Upload, Building2, 
  Eye, ChevronLeft, MapPin, 
  Phone, Mail, CalendarClock
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Paginate from "@/components/Paginate";
import StatsCard from "@/components/StatsCard";
import ActionGroup from "@/components/ActionGroup";
import ReusableForm from "@/components/ReusableForm";
import DataTable from "@/components/DataTable";
import SideDetailsPanel from "@/components/SideDetailsPanel";

import { useSites } from "../../../../../hooks/useSites";
import { useTypes } from "../../../../../hooks/useTypes";
import { useSubTypeAssets } from "../../../../../hooks/useSubTypeAssets";
import { AssetService, CompanyAsset } from "../../../../../services/asset.service";
import { FieldConfig } from "@/components/ReusableForm";

export default function SiteDetailsPage() {
  const params = useParams();
  const siteId = Number(params?.id);  // ← d'abord

  const { sites, stats, fetchSites } = useSites();  // ← ensuite

  // Maintenant seulement
  const siteStats = stats?.tickets_par_site?.find((s: any) => s.site_id === siteId);
  const { types } = useTypes();
  const { subTypes } = useSubTypeAssets();

  const [site, setSite] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<CompanyAsset | null>(null);
  const [selectedPatrimoine, setSelectedPatrimoine] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [patrimoines, setPatrimoines] = useState<CompanyAsset[]>([]);
  const [loadingPatrimoines, setLoadingPatrimoines] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<{ type_id?: number; sub_type_id?: number; status?: string }>({});
  const [flashMessage, setFlashMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    if (sites.length === 0) fetchSites();
  }, []);

  useEffect(() => {
    const foundSite = sites.find((s: any) => s.id === siteId);
    setSite(foundSite || null);
  }, [sites, siteId]);

  const fetchPatrimoines = async () => {
    if (!siteId) return;
    setLoadingPatrimoines(true);
    try {
      const data = await AssetService.getAssets({ site_id: siteId, per_page: 100, ...filters });
      setPatrimoines(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPatrimoines(false);
    }
  };

  useEffect(() => {
    fetchPatrimoines();
  }, [siteId, filters]);

  // =========================
  // DETAILS PANEL
  // =========================
  const handleOpenDetails = (patrimoine: CompanyAsset) => {
    const statusColor =
      patrimoine.status === "actif" ? "#22c55e" :
      patrimoine.status === "inactif" ? "#ef4444" : "#94a3b8";

    const fields = [
      { label: "Famille / Type", value: patrimoine.type?.name ?? "-" },
      { label: "Sous-type", value: patrimoine.subType?.name ?? "-" },
      { label: "Codification", value: patrimoine.codification },
      { label: "Désignation", value: patrimoine.designation },
      { label: "Site d'affectation", value: patrimoine.site?.name ?? "-" },
      { label: "Date d'entrée", value: patrimoine.date_entree },
      { label: "Valeur d'entrée", value: `${patrimoine.valeur_entree} FCFA` },
      { label: "Statut", value: patrimoine.status, isStatus: true, statusColor },
    ];

    setSelectedPatrimoine({ ...patrimoine, fields, title: `${patrimoine.designation} | ${patrimoine.codification}` });
    setIsDetailsOpen(true);
  };

  // =========================
  // EDIT (depuis le panel details)
  // =========================
  const handleEdit = () => {
    if (!selectedPatrimoine) return;
    setEditingData(selectedPatrimoine);
    setIsDetailsOpen(false);
    setIsModalOpen(true);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (editingData) {
        await AssetService.updateAsset(editingData.id, formData);
        setFlashMessage({ type: "success", message: "Patrimoine mis à jour avec succès" });
      } else {
        await AssetService.createAsset({ ...formData, site_id: siteId });
        setFlashMessage({ type: "success", message: "Patrimoine créé avec succès" });
      }
      await fetchPatrimoines();
      setIsModalOpen(false);
      setEditingData(null);
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
    { header: "ID", key: "id" },
    { header: "Type", key: "type", render: (_: any, row: CompanyAsset) => row.type?.name ?? "-" },
    { header: "Sous-type", key: "subType", render: (_: any, row: CompanyAsset) => row.subType?.name ?? "-" },
    { header: "Codification", key: "codification" },
    { header: "Désignation", key: "designation" },
    { header: "Site", key: "site", render: (_: any, row: CompanyAsset) => row.site?.name ?? "-" },
    {
      header: "Statut",
      key: "status",
      render: (_: any, row: CompanyAsset) => {
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
      render: (_: any, row: CompanyAsset) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
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
    { name: "type_company_asset_id", label: "Famille / Type", type: "select", required: true, options: types.map((t: any) => ({ label: t.name, value: String(t.id) })) },
    { name: "sub_type_company_asset_id", label: "Sous-type", type: "select", required: true, options: subTypes.map((st: any) => ({ label: st.name, value: String(st.id) })) },
    { name: "designation", label: "Désignation", type: "text", required: true },
    { name: "codification", label: "Codification", type: "text", placeholder: "ex: SD1245", required: true },
    {
      name: "status", label: "Statut", type: "select", required: true,
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
  // FILTERS
  // =========================
  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFiltersOpen(false);
  };

  // =========================
  // ACTIONS
  // =========================
  const siteActions = [
    { label: "Filtrer par", icon: Filter, onClick: () => setFiltersOpen(!filtersOpen), variant: "secondary" as const },
    { label: "Importer", icon: Download, onClick: () => {}, variant: "secondary" as const },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    {
      label: "Ajouter un patrimoine",
      icon: Building2,
      onClick: () => { setEditingData(null); setIsModalOpen(true); },
      variant: "primary" as const,
    },
  ];

  // Infos site
  const siteName = site?.nom || "Nom du site";
  const location = site?.localisation || "Localisation";
  const responsible = site?.manager?.name || "Responsable";
  const phone = site?.manager?.phone || site?.phone_responsable || "N/A";
  const email = site?.manager?.email || site?.email || "N/A";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
        <Navbar />
        <main className="mt-20 p-8 space-y-8">

          {/* Flash message */}
          {flashMessage && (
            <div className={`px-6 py-4 rounded-2xl text-sm font-semibold ${flashMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {flashMessage.message}
            </div>
          )}

          {/* Header site */}
          <div className="bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <Link href="/admin/sites" className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium">
                <ChevronLeft size={18} /> Retour
              </Link>
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{siteName}</h1>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <MapPin size={18} />
                  <span className="font-medium text-lg">{location}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 border border-slate-50 shadow-sm flex items-center gap-4 min-w-[320px]">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{responsible}</h3>
                <div className="flex flex-col text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Phone size={14} /> {phone}</span>
                  <span className="flex items-center gap-1"><Mail size={14} /> {email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatsCard label="Coût moyen par site" value={stats?.cout_loyer_moyen_par_site ?? 0} />
  <StatsCard label="Tickets en cours" value={siteStats?.tickets_en_cours ?? 0} />
  <StatsCard label="Tickets clôturés" value={siteStats?.tickets_clos ?? 0} />
  <StatsCard label="Nombre total de patrimoines" value={patrimoines.length} />
</div>

          {/* Actions + Filtres */}
          <div className="shrink-0 flex justify-end relative">
            <ActionGroup actions={siteActions} />
            {filtersOpen && (
              <div className="absolute right-0 top-12 z-50 p-4 bg-black text-white shadow-lg rounded-lg border space-y-3 w-56">
                <select
                  className="w-full border border-white bg-black text-white rounded p-1"
                  value={filters.type_id || ""}
                  onChange={e => applyFilters({ ...filters, type_id: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">Tous les types</option>
                  {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select
                  className="w-full border border-white bg-black text-white rounded p-1"
                  value={filters.sub_type_id || ""}
                  onChange={e => applyFilters({ ...filters, sub_type_id: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">Tous les sous-types</option>
                  {subTypes.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
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
            )}
          </div>

          {/* Table patrimoines */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            {loadingPatrimoines ? (
              <div className="py-16 text-center text-slate-400 text-sm italic">Chargement...</div>
            ) : (
              <DataTable columns={columns} data={patrimoines} title="Patrimoines du site" />
            )}
            <div className="p-6 border-t border-slate-50 flex justify-end">
              <Paginate
                currentPage={1}
                totalPages={patrimoines.length ? Math.ceil(patrimoines.length / 10) : 1}
                onPageChange={() => {}}
              />
            </div>
          </div>

        </main>
      </div>

      {/* Details Panel */}
      <SideDetailsPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedPatrimoine?.title || ""}
        reference={selectedPatrimoine?.id}
        fields={selectedPatrimoine?.fields || []}
        descriptionContent={selectedPatrimoine?.description ?? ""}
        onEdit={handleEdit}
      />

      {/* Modal Ajouter / Modifier */}
      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingData(null); }}
        title={editingData ? "Modifier le patrimoine" : "Ajouter un patrimoine"}
        subtitle="Renseignez les informations du patrimoine"
        fields={assetFields}
        initialValues={editingData ? {
          type_company_asset_id: String(editingData.type_company_asset_id),
          sub_type_company_asset_id: String(editingData.sub_type_company_asset_id),
          designation: editingData.designation,
          codification: editingData.codification,
          status: editingData.status,
          date_entree: editingData.date_entree,
          valeur_entree: editingData.valeur_entree,
          description: editingData.description ?? "",
        } : {}}
        onSubmit={handleCreateOrUpdate}
        submitLabel={editingData ? "Mettre à jour" : "Enregistrer"}
      />
    </div>
  );
}