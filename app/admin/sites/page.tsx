"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SiteCard from "@/components/SiteCard";
import ActionGroup from "@/components/ActionGroup";
import SearchInput from "@/components/SearchInput";
import StatsCard from "@/components/StatsCard";
import Paginate from "@/components/Paginate";
import ReusableForm from "@/components/ReusableForm";
import PageHeader from "@/components/PageHeader";
import { Filter, Download, Upload, Globe } from "lucide-react";
import { useSites } from "../../../hooks/useSites";

type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "number" | "date";
  required?: boolean;
  options?: { label: string; value: string }[];
  gridSpan?: number;
};

export default function SitesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    sites,
    stats,
    managers,
    loading,
    page,
    totalPages,
    setPage,
    fetchSites,
    fetchStats,
    fetchManagers,
    addSite,
  } = useSites();

  useEffect(() => {
    fetchSites(search);
  }, [search, page]);

  useEffect(() => {
    fetchStats();
    fetchManagers();
  }, []);

  const handleFormSubmit = async (formData: any) => {
    await addSite({
      ...formData,
      manager_id: Number(formData.manager_id),
    });

    setIsModalOpen(false);
    fetchSites(search);
  };

  const siteFields: FieldConfig[] = [
    { name: "nom", label: "Nom du site", type: "text", required: true },
    { name: "ref_contrat", label: "Référence contrat", type: "text", required: true },
    { name: "email", label: "Email du site", type: "email" },
    { name: "phone_responsable", label: "Téléphone responsable", type: "text" },

    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { label: "Actif", value: "active" },
        { label: "Inactif", value: "inactive" },
      ],
    },

    {
      name: "manager_id",
      label: "Gestionnaire",
      type: "select",
      required: true,
      options: [{ label: "Gestrionnaire temporaire", value: 1 }],
    },

    { name: "effectifs", label: "Effectifs", type: "number" },
    { name: "loyer", label: "Loyer", type: "number" },
    { name: "localisation", label: "Localisation", type: "text", gridSpan: 2 },
    { name: "superficie", label: "Superficie", type: "number" },
    { name: "date_deb_contrat", label: "Date début", type: "date" },
    { name: "date_fin_contrat", label: "Date fin", type: "date" },
  ];

  const siteActions = [
    { label: "Filtrer", icon: Filter, onClick: () => {}, variant: "secondary" as const },
    { label: "Importer", icon: Download, onClick: () => {}, variant: "secondary" as const },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    { label: "Ajouter un site", icon: Globe, onClick: () => setIsModalOpen(true), variant: "primary" as const },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="ml-64 mt-20 p-6 space-y-10 overflow-y-auto h-[calc(100vh-80px)]">

          <PageHeader
            title="Sites"
            subtitle="Suivi et gestion de tous les sites"
          />

          {/* 🔹 STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard label="Sites actifs" value={stats?.sites_actifs ?? 0} />
            <StatsCard label="Sites inactifs" value={stats?.sites_inactifs ?? 0} />
            <StatsCard label="Coût moyen" value={stats?.cout_moyen_par_site ?? 0} />
            {/* <StatsCard label="Tickets/site" value={stats?.tickets_par_site ?? 0} /> */}
          </div>

          <div className="flex justify-end">
            <ActionGroup actions={siteActions} />
          </div>

          <div className="space-y-8 bg-white rounded-xl p-6">

            <div className="w-80">
              <SearchInput
                onSearch={(value) => {
                  setPage(1);
                  setSearch(value);
                }}
                placeholder="Rechercher par nom, responsable, téléphone..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-10">Chargement...</div>
              ) : sites.length > 0 ? (
                sites.map((site) => (
                  <SiteCard
                    key={site.id}
                    name={site.nom}
                    location={site.localisation || ""}
                    status={site.status === "active" ? "actif" : "inactif"}
                    responsibleName={site.manager?.name || "N/A"}
                    phone={site.manager?.phone || site.phone_responsable || ""}
                    email={site.manager?.email || site.email || ""}
                    assetCount={site.effectifs || 0}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-slate-400 italic py-10">
                  Aucun site trouvé
                </div>
              )}
            </div>

            <div className="pt-8 flex justify-center md:justify-end">
              <Paginate
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>

          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Ajouter un site"
            subtitle="Créer un nouveau site"
            fields={siteFields}
            onSubmit={handleFormSubmit}
          />
        </main>
      </div>
    </div>
  );
}
