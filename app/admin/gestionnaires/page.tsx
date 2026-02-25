"use client";

/**
 * app/admin/gestionnaires/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Page liste des gestionnaires (Managers).
 *
 * Fonctionnalités :
 *  - KPIs calculés localement (total, actifs, inactifs)
 *  - Recherche full-text front-end (nom, prénom, email)
 *  - Filtre par statut (actif/inactif)
 *  - Filtre par site — COMMENTÉ, préparé pour future API
 *  - Pagination front-end (PER_PAGE = 12 dans useManagers)
 *  - Modal création gestionnaire (POST /admin/managers)
 *  - Toggle actif/inactif via updateManager (simulation, pas de route dédiée)
 *  - Flash message succès/erreur
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { Filter, Upload, PlusCircle } from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SearchInput from "@/components/SearchInput";
import ActionGroup from "@/components/ActionGroup";
import ReusableForm from "@/components/ReusableForm";
import StatsCard from "@/components/StatsCard";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import GestCard from "@/components/GestCard";

import { useManagers } from "../../../hooks/useManagers";
import { ManagerService, Manager } from "../../../services/manager.service";

export default function GestionnairesPage() {

  // ── Hook managers ──────────────────────────────────────────────────────────
  const {
    managers,
    stats,
    isLoading,
    meta,
    page, setPage,
    applySearch,
    applyFilters,
    fetchManagers,
  } = useManagers();

  // ── État UI ────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]   = useState(false);    // Modal création
  const [filtersOpen, setFiltersOpen]   = useState(false);    // Dropdown filtres
  const [flash, setFlash]               = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Flash message ──────────────────────────────────────────────────────────
  const showFlash = (type: "success" | "error", message: string) => {
    setFlash({ type, message });
    setTimeout(() => setFlash(null), 5000);
  };

  // ── KPIs — calculés localement par useManagers ────────────────────────────
  const kpis = [
    {
      label: "Total gestionnaires",
      value: stats?.total_managers ?? 0,
      delta: "+0%",
      trend: "up" as const,
    },
    {
      label: "Gestionnaires actifs",
      value: stats?.active_managers ?? 0,
      delta: "+0%",
      trend: "up" as const,
    },
    {
      label: "Gestionnaires inactifs",
      value: stats?.inactive_managers ?? 0,
      delta: "+0%",
      trend: "down" as const,
    },
    /**
     * ── KPI site — COMMENTÉ, préparé pour future API ────────────────────────
     * TODO: Ajouter quand le backend retournera le nombre de sites gérés
     * {
     *   label: "Sites gérés",
     *   value: stats?.managed_sites ?? 0,
     *   delta: "+0%",
     *   trend: "up" as const,
     * },
     */
  ];

  // ── Champs formulaire création manager ────────────────────────────────────
  // Correspond à la validation du store() Laravel :
  //   first_name : required|string|max:255
  //   last_name  : required|string|max:255
  //   email      : required|email|unique:users,email
  //   phone      : nullable|string
  //   password   : non validé mais utilisé dans ManagerService::createManager()
  const gestFields = [
    { name: "first_name", label: "Prénom",           type: "text",  required: true  },
    { name: "last_name",  label: "Nom de famille",   type: "text",  required: true  },
    { name: "email",      label: "Email",             type: "email", required: true  },
    { name: "phone",      label: "Téléphone",         type: "text"                   },
    { name: "password",   label: "Mot de passe",      type: "text"                   },
    /**
     * ── Champ site — COMMENTÉ, préparé pour future API ──────────────────────
     * TODO: Décommenter quand l'API supportera l'assignation d'un site au manager
     *
     * {
     *   name: "site_id",
     *   label: "Site assigné",
     *   type: "select",
     *   options: sites.map(s => ({ label: s.name, value: String(s.id) })),
     * },
     */
  ];

  // ── Création manager ───────────────────────────────────────────────────────
  const handleCreate = async (formData: any) => {
    try {
      const payload = {
        first_name: formData.first_name,
        last_name:  formData.last_name,
        email:      formData.email,
        phone:      formData.phone      || undefined,
        password:   formData.password   || undefined,
      };
      await ManagerService.createManager(payload);
      showFlash("success", "Gestionnaire créé avec succès");
      setIsModalOpen(false);
      fetchManagers(); // Refresh liste
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erreur lors de la création";
      showFlash("error", msg);
    }
  };

  // ── Toggle statut actif/inactif ────────────────────────────────────────────
  // Simulation via updateManager (is_active) en attendant les vraies routes
  // PUT /admin/managers/activate/{id} et /admin/managers/desactivate/{id}
  const handleToggleStatus = async (manager: Manager) => {
    try {
      if (manager.is_active !== false) {
        await ManagerService.desactivateManager(manager.id);
        showFlash("success", `${manager.first_name} ${manager.last_name} désactivé`);
      } else {
        await ManagerService.activateManager(manager.id);
        showFlash("success", `${manager.first_name} ${manager.last_name} activé`);
      }
      fetchManagers();
    } catch {
      showFlash("error", "Erreur lors du changement de statut");
    }
  };

  // ── Actions barre d'actions ────────────────────────────────────────────────
  const gestActions = [
    {
      label:   "Filtrer par",
      icon:    Filter,
      onClick: () => setFiltersOpen(!filtersOpen),
      variant: "secondary" as const,
    },
    {
      label:   "Exporter",
      icon:    Upload,
      onClick: () => {},
      variant: "secondary" as const,
    },
    {
      label:   "Ajouter un gestionnaire",
      icon:    PlusCircle,
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

          {/* ── En-tête de page ─────────────────────────────────────────── */}
          <PageHeader
            title="Gestionnaires"
            subtitle="Ce menu vous permet de gérer tous les gestionnaires (managers) de la plateforme"
          />

          {/* ── Flash message succès/erreur ──────────────────────────────── */}
          {flash && (
            <div className={`px-6 py-4 rounded-2xl text-sm font-semibold ${
              flash.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {flash.message}
            </div>
          )}

          {/* ── KPIs ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi, i) => (
              <StatsCard key={i} {...kpi} />
            ))}
          </div>

          {/* ── Barre d'actions + dropdown filtres ───────────────────────── */}
          <div className="flex justify-end relative">
            <ActionGroup actions={gestActions} />

            {/* Dropdown filtres */}
            {filtersOpen && (
              <div className="absolute right-0 top-12 z-50 p-4 bg-black text-white shadow-xl rounded-xl border border-slate-700 space-y-3 w-52">

                {/* Filtre statut */}
                <select
                  className="w-full bg-black text-white border border-white rounded p-1 text-sm"
                  onChange={e =>
                    applyFilters({
                      is_active:
                        e.target.value === "" ? undefined :
                        e.target.value === "true",
                    })
                  }
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs</option>
                  <option value="false">Inactifs</option>
                </select>

                {/*
                 * ── Filtre site — COMMENTÉ, préparé pour future API ────────
                 * TODO: Décommenter quand le backend supportera ce filtre
                 *
                 * <select
                 *   className="w-full bg-black text-white border border-white rounded p-1 text-sm"
                 *   onChange={e =>
                 *     applyFilters({
                 *       site_id: e.target.value ? Number(e.target.value) : undefined
                 *     })
                 *   }
                 * >
                 *   <option value="">Tous les sites</option>
                 *   {sites.map(s => (
                 *     <option key={s.id} value={s.id}>{s.name}</option>
                 *   ))}
                 * </select>
                 */}

              </div>
            )}
          </div>

          {/* ── Liste + Recherche ─────────────────────────────────────────── */}
          <div className="space-y-6 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">

            {/* Barre de recherche */}
            <div className="w-80">
              <SearchInput
                onSearch={applySearch}
                placeholder="Rechercher un gestionnaire..."
              />
            </div>

            {/* Grille de cartes */}
            {isLoading ? (
              <div className="text-center py-20 text-slate-400 text-sm italic">
                Chargement...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managers.length > 0 ? (
                  managers.map((m, index) => (
                    <GestCard
                      key={m.id}
                      id={m.id}
                      firstName={m.first_name}
                      lastName={m.last_name}
                      email={m.email}
                      phone={m.phone}
                      role={m.role?.name ?? "Manager"}
                      status={m.is_active !== false ? "Actif" : "Inactif"}
                      paletteIndex={index} // Pour varier les couleurs d'avatars
                      /**
                       * ── Prop site — COMMENTÉE, préparée pour future API ──
                       * TODO: Décommenter quand l'API retournera managed_site
                       * site={m.managed_site?.nom}
                       */
                      onProfilClick={() => {
                        // TODO: ouvrir un ProfileModal adapté aux managers
                        // Pour l'instant identique au comportement prestataires
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 text-slate-400">
                    Aucun gestionnaire trouvé.
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-end pt-6 border-t border-slate-50">
              <Paginate
                currentPage={page}
                totalPages={meta.last_page}
                onPageChange={setPage}
              />
            </div>
          </div>

          {/* ── Modal création gestionnaire ──────────────────────────────── */}
          <ReusableForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Ajouter un gestionnaire"
            subtitle="Remplissez les informations pour créer un nouveau gestionnaire."
            fields={gestFields}
            onSubmit={handleCreate}
            submitLabel="Créer le gestionnaire"
          />

        </main>
      </div>
    </div>
  );
}