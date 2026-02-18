"use client";

import { useState, useEffect } from "react";
import { Eye, Filter, Download, Upload, Building2 } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ActionGroup from "@/components/ActionGroup";
import DataTable from "@/components/DataTable";
import ReusableForm, { FieldConfig } from "@/components/ReusableForm";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SideDetailsPanel from "@/components/SideDetailsPanel";

import { useSubTypeAssets } from "../../../../hooks/useSubTypeAssets"; // ← CORRIGÉ
import { useTypes } from "../../../../hooks/useTypes";
import { SubTypeAssetService } from "../../../../services/sub-type-asset.service";

export default function SousTypePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubType, setSelectedSubType] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingData, setEditingData] = useState<Record<string, any> | null>(null);
  const [flashMessage, setFlashMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // HOOKS
  const { subTypes, isLoading, fetchSubTypes } = useSubTypeAssets(); // ← CORRIGÉ
  const { types, fetchTypes } = useTypes();

  useEffect(() => {
    fetchTypes();
    fetchSubTypes();
  }, []);

  // DÉTAILS PANEL
  const handleOpenDetails = (subType: any) => {
    const fields = [
      { label: "Famille / Type", value: subType.type?.name || "-" },
      { label: "Codification", value: subType.code },
      { label: "Sous-type", value: subType.name },
      { label: "Description", value: subType.description || "-" },
      { label: "Date d'ajout", value: subType.created_at?.split("T")[0] || "-" },
    ];

    setSelectedSubType({
      title: subType.name,
      reference: subType.id,
      fields,
      description: subType.description,
      rawData: subType,
    });

    setIsDetailsOpen(true);
  };

  const handleEdit = () => {
    if (!selectedSubType?.rawData) return;

    setEditingData({
      type_company_asset_id: selectedSubType.rawData.type?.id || "",
      name: selectedSubType.rawData.name,
      code: selectedSubType.rawData.code,
      description: selectedSubType.rawData.description,
    });

    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  const handleCreateOrUpdateSubType = async (formData: Record<string, any>) => {
    try {
      if (editingData && selectedSubType?.reference) {
        await SubTypeAssetService.updateSubType(selectedSubType.reference, formData);
        setFlashMessage({ type: "success", message: "Sous-type mis à jour avec succès." });
      } else {
        await SubTypeAssetService.createSubType(formData);
        setFlashMessage({ type: "success", message: "Sous-type créé avec succès." });
      }

      await fetchSubTypes();
      setIsModalOpen(false);
      setEditingData(null);
    } catch (err: any) {
      setFlashMessage({ type: "error", message: "Erreur serveur lors de l’enregistrement." });
    }
  };

  useEffect(() => {
    if (!flashMessage) return;
    const timer = setTimeout(() => setFlashMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [flashMessage]);

  const columns = [
    { header: "Type", key: "type", render: (_v: any, row: any) => row.type?.name || "-" },
    { header: "Codification", key: "code" },
    { header: "Sous-type", key: "name" },
    { header: "Description", key: "description" },
    {
      header: "Actions",
      key: "actions",
      render: (_v: any, row: any) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
        >
          <Eye size={18} /> Aperçu
        </button>
      ),
    },
  ];

  const subTypeFields: FieldConfig[] = [
    {
      name: "type_company_asset_id",
      label: "Famille / Type",
      type: "select",
      required: true,
      options: types.map((t) => ({ label: t.code, value: String(t.id) })),
    },
    { name: "name", label: "Sous-type", type: "text", required: true },
    { name: "code", label: "Codification", type: "text", required: true },
    { name: "description", label: "Description", type: "rich-text", gridSpan: 2 },
  ];

  const siteActions = [
    { label: "Filtrer par", icon: Filter, onClick: () => {}, variant: "secondary" as const },
    { label: "Importer", icon: Download, onClick: () => {}, variant: "secondary" as const },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    {
      label: "Ajouter un sous-type",
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
          <PageHeader title="Sous-type de patrimoine" subtitle="Ce menu vous permet de voir les sous-types disponibles" />

          {flashMessage && (
            <div
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all"
              style={{
                color: flashMessage.type === "success" ? "#16a34a" : "#dc2626",
                backgroundColor: flashMessage.type === "success" ? "#d1fae5" : "#fee2e2",
                borderColor: flashMessage.type === "success" ? "#86efac" : "#fca5a5",
              }}
            >
              {flashMessage.message}
            </div>
          )}

          <div className="shrink-0 flex justify-end">
            <ActionGroup actions={siteActions} />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <DataTable columns={columns} data={isLoading ? [] : subTypes} onViewAll={() => {}} />

            <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
              <Paginate currentPage={1} totalPages={1} onPageChange={() => {}} />
            </div>
          </div>

          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingData(null);
            }}
            title={editingData ? "Modifier un sous-type" : "Ajouter un nouveau sous-type"}
            subtitle="Remplissez les informations ci-dessous."
            fields={subTypeFields}
            onSubmit={handleCreateOrUpdateSubType}
            initialValues={editingData || {}}
          />

          <SideDetailsPanel
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            title={selectedSubType?.title || ""}
            reference={selectedSubType?.reference}
            fields={selectedSubType?.fields || []}
            descriptionContent={selectedSubType?.description}
            onEdit={handleEdit}
          />
        </main>
      </div>
    </div>
  );
}
