"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SearchInput from "@/components/SearchInput";
import ActionGroup from "@/components/ActionGroup";
import ReusableForm from "@/components/ReusableForm";
import StatsCard from "@/components/StatsCard";
import ProfileModal from "@/components/ProfileModal";
import Paginate from "@/components/Paginate";
import PrestCard from "@/components/PrestCard";
import PageHeader from "@/components/PageHeader";
import { Filter, Upload, PlusCircle } from "lucide-react";

import { useProviders } from "../../../hooks/useProviders";
import { ProviderService, Provider } from "../../../services/provider.service";
import { useServices } from "../../../hooks/useServices";

export default function PrestatairesPage() {
  const router = useRouter();
  const {
    providers, stats, isLoading, meta,
    page, setPage, applySearch, applyFilters, fetchProviders,
  } = useProviders();

  const { services } = useServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Charge les vraies stats du prestataire pour le ProfileModal
  const handleOpenProfil = async (p: Provider) => {
    try {
      const detail = await ProviderService.getProvider(p.id);
      setSelectedProvider({
        ...p,
        loadedStats: detail.stats,
      });
    } catch {
      // Fallback sans stats si erreur
      setSelectedProvider({ ...p, loadedStats: null });
    }
  };

  const showFlash = (type: "success" | "error", message: string) => {
    setFlash({ type, message });
    setTimeout(() => setFlash(null), 5000);
  };

  // ── KPIs depuis getStats() ──
  const kpis = [
    { label: "Total prestataires", value: stats?.total_providers ?? 0, delta: "+5%", trend: "up" as const },
    { label: "Prestataires actifs", value: stats?.active_providers ?? 0, delta: "+8%", trend: "up" as const },
    { label: "Prestataires inactifs", value: stats?.inactive_providers ?? 0, delta: "-3%", trend: "down" as const },
    { label: "Délai moyen intervention", value: stats?.average_intervention_time ?? "-", delta: "-3%", trend: "down" as const },
  ];

  // ── Création prestataire ──
  // Le backend createProvider attend : company_name, city, service_id, users{}, identity_documents{}
  const prestFields = [
    { name: "company_name", label: "Nom du prestataire", type: "text", required: true },
    { name: "city", label: "Ville", type: "text", required: true },
    { name: "neighborhood", label: "Quartier", type: "text" },
    { name: "street", label: "Rue / Adresse", type: "text" },
    {
      name: "service_id", label: "Service", type: "select", required: true,
      options: services.map(s => ({ label: s.name, value: String(s.id) })),
    },
    { name: "date_entree", label: "Date d'entrée", type: "date", required: true },
    { name: "description", label: "Description", type: "rich-text", gridSpan: 2 },
    // Infos utilisateur associé
    
    { name: "users.last_name", label: "Nom du responsable", type: "text", required: true },
    { name: "users.email", label: "Email du responsable", type: "email", required: true },
    { name: "users.phone", label: "Téléphone", type: "text", required: true },
    { name: "users.password", label: "Mot de passe", type: "text", required: true },
  ];

  const handleCreate = async (formData: any) => {
    try {
      const payload = {
        company_name: formData.company_name,
        city: formData.city,
        neighborhood: formData.neighborhood || undefined,
        street: formData.street || undefined,
        service_id: Number(formData.service_id), // cast obligatoire pour Laravel exists:services,id
        date_entree: formData.date_entree || undefined,
        description: formData.description || undefined,
        users: {
          last_name: formData["users.last_name"],
          email: formData["users.email"],
          phone: formData["users.phone"],
          password: formData["users.password"],
        },
      };
      await ProviderService.createProvider(payload);
      showFlash("success", "Prestataire créé avec succès");
      setIsModalOpen(false);
      fetchProviders();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erreur lors de la création";
      showFlash("error", msg);
    }
  };

  // ── Toggle actif/inactif ──
  const handleToggleStatus = async (provider: Provider) => {
    try {
      if (provider.is_active) {
        await ProviderService.desactivateProvider(provider.id);
        showFlash("success", `${provider.company_name} désactivé`);
      } else {
        await ProviderService.activateProvider(provider.id);
        showFlash("success", `${provider.company_name} activé`);
      }
      fetchProviders();
    } catch {
      showFlash("error", "Erreur lors du changement de statut");
    }
  };

  const prestActions = [
    {
      label: "Filtrer par",
      icon: Filter,
      onClick: () => setFiltersOpen(!filtersOpen),
      variant: "secondary" as const,
    },
    { label: "Exporter", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    { label: "Importer", icon: Upload, onClick: () => {}, variant: "secondary" as const },
    {
      label: "Ajouter un prestataire",
      icon: PlusCircle,
      onClick: () => setIsModalOpen(true),
      variant: "primary" as const,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="ml-64 mt-20 p-6 space-y-8">
          <PageHeader
            title="Prestataires"
            subtitle="Ce menu vous permet de voir tous les différents prestataires"
          />

          {/* Flash */}
          {flash && (
            <div className={`px-6 py-4 rounded-2xl text-sm font-semibold ${
              flash.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {flash.message}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
          </div>

          {/* Actions + Filtre statut */}
          <div className="flex justify-end relative">
            <ActionGroup actions={prestActions} />
            {filtersOpen && (
              <div className="absolute right-0 top-12 z-50 p-4 bg-black text-white shadow-lg rounded-xl border space-y-3 w-52">
                <select
                  className="w-full bg-black text-white border border-white rounded p-1 text-sm"
                  onChange={e => applyFilters({ is_active: e.target.value === "" ? undefined : e.target.value === "true" })}
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs</option>
                  <option value="false">Inactifs</option>
                </select>
                <select
                  className="w-full bg-black text-white border border-white rounded p-1 text-sm"
                  onChange={e => applyFilters({ service_id: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">Tous les services</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Liste + Search */}
          <div className="space-y-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="w-80">
              <SearchInput onSearch={applySearch} placeholder="Rechercher un prestataire..." />
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400 text-sm italic">Chargement...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.length > 0 ? providers.map(p => (
                  <PrestCard
                    key={p.id}
                    id={p.id}
                    name={p.company_name ?? "Prestataire"}
                    location={p.city ?? "-"}
                    category={p.service?.name ?? "-"}
                    phone={p.user?.phone ?? "-"}
                    email={p.user?.email ?? "-"}
                    rating={p.rating ?? 0}
                    status={p.is_active ? "Actif" : "Inactif"}
                    logo={p.logoUrl}
                    // Profil → ouvre ProfileModal avec données réelles
                    onProfilClick={() => handleOpenProfil(p)}
                    // Tickets → navigue vers details/[id]
                    onTicketsClick={() => router.push(`/admin/prestataires/details/${p.id}`)}
                    detailUrl={`/admin/prestataires/details/${p.id}`}
                  />
                )) : (
                  <div className="col-span-full text-center py-20 text-slate-400">
                    Aucun prestataire trouvé.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-50">
              <Paginate currentPage={page} totalPages={meta.last_page} onPageChange={setPage} />
            </div>
          </div>

          {/* Modal création */}
          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Ajouter un nouveau prestataire"
            subtitle="Remplissez les informations ci-dessous pour enregistrer un nouveau prestataire."
            fields={prestFields}
            onSubmit={handleCreate}
            submitLabel="Créer le prestataire"
          />

          {/* ProfileModal — stats chargées dynamiquement via handleOpenProfil */}
          <ProfileModal
            isOpen={!!selectedProvider}
            onClose={() => setSelectedProvider(null)}
            provider={selectedProvider ? {
              name: selectedProvider.company_name ?? "Prestataire",
              location: selectedProvider.city ?? "-",
              phone: selectedProvider.user?.phone ?? "-",
              email: selectedProvider.user?.email ?? "-",
              category: selectedProvider.service?.name ?? "-",
              dateEntree: selectedProvider.date_entree ?? "-",
              status: selectedProvider.is_active ? "Actif" : "Inactif",
              logo: selectedProvider.logoUrl,
              stats: {
                totalBillets: { value: selectedProvider.loadedStats?.total_tickets ?? 0, delta: "+0%" },
                ticketsEnCours: { value: selectedProvider.loadedStats?.in_progress_tickets ?? 0, delta: "+0%" },
                ticketsTraites: { value: selectedProvider.loadedStats?.closed_tickets ?? 0, delta: "+0%" },
                noteObtenue: selectedProvider.loadedStats?.rating
                  ? `${selectedProvider.loadedStats.rating}/5`
                  : (selectedProvider.rating ? `${selectedProvider.rating}/5` : "N/A"),
              },
            } : null}
          />
        </main>
      </div>
    </div>
  );
}