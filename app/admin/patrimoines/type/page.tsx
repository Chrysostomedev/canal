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

import { useTypes } from "../../../../hooks/useTypes";
import { TypeAssetService } from "../../../../services/type-asset.service";

export default function PatrimoinesPage() {
  // =========================
  // UI STATES
  // =========================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatrimoine, setSelectedPatrimoine] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingData, setEditingData] = useState<Record<string, any> | null>(null);

  // Flash message (succès / erreur) fixe
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // =========================
  // HOOK DATA
  // =========================
  const { types, isLoading, error, fetchTypes, meta, setPage } = useTypes();

  useEffect(() => {
    fetchTypes();
  }, []);

  // =========================
  // DETAILS PANEL
  // =========================
  const handleOpenDetails = (patrimoine: any) => {
    const fields = [
      { label: "Famille / Type", value: patrimoine.name },
      { label: "Codification", value: patrimoine.code },
      { label: "Description", value: patrimoine.description || "-" },
      {
        label: "Date d'ajout",
        value: patrimoine.created_at?.split("T")[0] || "-",
      },
    ];

    setSelectedPatrimoine({
      title: patrimoine.name,
      reference: patrimoine.id,
      fields,
      description: patrimoine.description,
      rawData: patrimoine, // pour préremplissage lors de l'édition
    });

    setIsDetailsOpen(true);
  };

  const handleEdit = () => {
    if (!selectedPatrimoine?.rawData) return;

    setEditingData({
      name: selectedPatrimoine.rawData.name,
      code: selectedPatrimoine.rawData.code,
      description: selectedPatrimoine.rawData.description,
    });

    setIsModalOpen(true); // ouvre le formulaire
    setIsDetailsOpen(false); // ferme le panel détail
  };

  // =========================
  // CREATE / UPDATE HANDLER
  // =========================
  const handleCreateOrUpdateType = async (formData: Record<string, any>) => {
    try {
      if (editingData && selectedPatrimoine?.reference) {
        // Update
        await TypeAssetService.updateType(selectedPatrimoine.reference, formData);
        setFlashMessage({ type: "success", message: "Type de patrimoine mis à jour avec succès." });
      } else {
        // Create
        await TypeAssetService.createType(formData);
        setFlashMessage({ type: "success", message: "Type de patrimoine créé avec succès." });
      }

      await fetchTypes();
      setIsModalOpen(false);
      setEditingData(null);
    } catch (err: any) {
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat().join(" | ");
        setFlashMessage({ type: "error", message: errors });
      } else {
        setFlashMessage({ type: "error", message: "Erreur serveur lors de l’enregistrement." });
      }
    }
  };
  // FLASH MESSAGE TIMER
useEffect(() => {
    if (!flashMessage) return;
  
    const timer = setTimeout(() => {
      setFlashMessage(null); // supprime le message après 5s
    }, 5000);
  
    return () => clearTimeout(timer); // cleanup si flashMessage change avant la fin du timer
  }, [flashMessage]);
  
// =========================
// TABLE DATA TRIÉE
// =========================
const sortedTypes = [...types].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // Plus récent en haut
  });
  
  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    { header: "Type", key: "name" },
    { header: "Codification", key: "code" },
    { header: "Description", key: "description" },
    {
      header: "Actions",
      key: "actions",
      render: (value: any, row: any) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
        >
          <Eye size={18} /> Aperçu
        </button>
      ),
    },
  ];

  // =========================
  // FORM FIELDS
  // =========================
  const typeFields: FieldConfig[] = [
    { name: "name", label: "Famille / Type", type: "text", required: true },
    {
      name: "code",
      label: "Codification",
      type: "text",
      placeholder: "ex: SD1245",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "rich-text",
      gridSpan: 2,
      placeholder: "Décrivez le patrimoine",
    },
  ];

  // =========================
  // ACTIONS
  // =========================
  const siteActions = [
    { label: "Filtrer par", icon: Filter, onClick: () => {}, variant: "secondary" as const },
    { label: "Importer", icon: Download, onClick: () => {}, variant: "secondary" as const },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    {
      label: "Ajouter un type",
      icon: Building2,
      onClick: () => {
        setEditingData(null);
        setIsModalOpen(true);
      },
      variant: "primary" as const,
    },
  ];

  // =========================
  // RENDER
  // =========================
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="ml-64 mt-20 p-6 space-y-8">
          <PageHeader
            title="Type de patrimoine"
            subtitle="Ce menu vous permet de voir les différents patrimoines disponibles"
          />

          {/* FLASH MESSAGE FIXE */}
         {/* FLASH MESSAGE FIXE */}
{flashMessage && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all pointer-events-auto"
    style={{
      color: flashMessage.type === "success" ? "#16a34a" : "#dc2626",
      backgroundColor: flashMessage.type === "success" ? "#d1fae5" : "#fee2e2",
      borderColor: flashMessage.type === "success" ? "#86efac" : "#fca5a5"
    }}
  >
    {flashMessage.message}
  </div>
)}


          <div className="shrink-0 flex justify-end">
            <ActionGroup actions={siteActions} />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <DataTable
  columns={columns}
  data={isLoading ? [] : sortedTypes}
  onViewAll={() => {}}
/>


            <div className="p-6 border-t border-slate-50 flex justify-end bg-slate-50/30">
              <Paginate
                currentPage={meta?.current_page || 1}
                totalPages={meta?.last_page || 1}
                onPageChange={(page) => setPage(page)}
              />
            </div>
          </div>

          {/* REUSABLE FORM */}
          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingData(null);
            }}
            title={editingData ? "Modifier un type de patrimoine" : "Ajouter un nouveau type"}
            subtitle="Remplissez les informations ci-dessous."
            fields={typeFields}
            onSubmit={handleCreateOrUpdateType}
            initialValues={editingData || {}}
          />

          {/* SIDE DETAILS PANEL */}
          <SideDetailsPanel
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            title={selectedPatrimoine?.title || ""}
            reference={selectedPatrimoine?.reference}
            fields={selectedPatrimoine?.fields || []}
            descriptionContent={selectedPatrimoine?.description}
            onEdit={handleEdit}
          />
        </main>
      </div>
    </div>
  );
}
