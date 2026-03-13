"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Filter, Download, Upload, PlusCircle } from "lucide-react";

import Navbar       from "@/components/Navbar";
import Sidebar      from "@/components/Sidebar";
import SearchInput  from "@/components/SearchInput";
import ReusableForm from "@/components/ReusableForm";
import StatsCard    from "@/components/StatsCard";
import ProfileModal from "@/components/ProfileModal";
import Paginate     from "@/components/Paginate";
import PrestCard    from "@/components/PrestCard";
import PageHeader   from "@/components/PageHeader";

// ─── Mock data ────────────────────────────────────────────────────────────────

const services = [
  { id: 1, name: "Maintenance Réseau" },
  { id: 2, name: "Sécurité" },
  { id: 3, name: "Infrastructure IT" },
];

const mockProviders = [
  {
    id: 1,
    company_name: "SOUDOTEC",
    city: "Abidjan",
    is_active: true,
    rating: 4.5,
    date_entree: "2024-03-10",
    service: { id: 1, name: "Maintenance Réseau" },
    user: { phone: "0700000000", email: "contact@soudotec.ci" },
  },
  {
    id: 2,
    company_name: "Tech Services CI",
    city: "Abidjan",
    is_active: false,
    rating: 3.8,
    date_entree: "2023-09-02",
    service: { id: 2, name: "Sécurité" },
    user: { phone: "0500000000", email: "contact@techservices.ci" },
  },
];

const stats = {
  total_providers: 2,
  active_providers: 1,
  inactive_providers: 1,
  average_intervention_time: "2h 10m",
};

// ─── Initiales avatar ─────────────────────────────────────────────────────────
// Palette de couleurs déterministe selon le nom
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ProviderAvatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const initials = getInitials(name);
  const color    = getAvatarColor(name);
  const dim      = size === "lg" ? "w-14 h-14 text-xl" : "w-9 h-9 text-sm";
  return (
    <div className={`${dim} ${color} rounded-2xl flex items-center justify-center font-black shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PrestatairesPage() {
  const router = useRouter();

  const [providers]          = useState(mockProviders);
  const [filteredProviders,  setFilteredProviders]  = useState(mockProviders);
  const [selectedProvider,   setSelectedProvider]   = useState<any | null>(null);
  const [filters,            setFilters]            = useState<any>({});
  const [filtersOpen,        setFiltersOpen]        = useState(false);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [flash,              setFlash]              = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFlash = (type: "success" | "error", message: string) => {
    setFlash({ type, message });
    setTimeout(() => setFlash(null), 4000);
  };

  const applySearch = (value: string) => {
    const v = value.toLowerCase();
    setFilteredProviders(providers.filter(p => p.company_name.toLowerCase().includes(v)));
  };

  const applyFilters = (f: any) => {
    let result = [...providers];
    if (f.is_active !== undefined) result = result.filter(p => p.is_active === f.is_active);
    if (f.service_id)              result = result.filter(p => p.service?.id === f.service_id);
    setFilters(f);
    setFilteredProviders(result);
  };

  const kpis = [
    { label: "Total prestataires",       value: stats.total_providers,           delta: "+0%", trend: "up"   as const },
    { label: "Prestataires actifs",      value: stats.active_providers,          delta: "+0%", trend: "up"   as const },
    { label: "Prestataires inactifs",    value: stats.inactive_providers,        delta: "+0%", trend: "down" as const },
    { label: "Délai moyen intervention", value: stats.average_intervention_time, delta: "+0%", trend: "up"   as const },
  ];

  const prestFields = [
    { name: "company_name",    label: "Nom du prestataire",  type: "text",         required: true },
    { name: "service_id",      label: "Service",             type: "select",       required: true,
      options: services.map(s => ({ label: s.name, value: String(s.id) })) },
    { name: "city",            label: "Ville",               type: "text",         required: true },
    { name: "street",          label: "Rue / Adresse",       type: "text" },
    { name: "date_entree",     label: "Date d'entrée",       type: "date",         required: true },
    { name: "users.password",  label: "Mot de passe",        type: "password",     required: true },
    { name: "users.last_name", label: "Nom du responsable",  type: "text",         required: true },
    { name: "users.first_name",label: "Prénom",              type: "text",         required: true },
    { name: "users.email",     label: "Email du responsable",type: "email",        required: true },
    { name: "users.phone",     label: "Téléphone",           type: "text",         required: true },
    { name: "description",     label: "Description",         type: "rich-text",    gridSpan: 2 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="ml-64 mt-20 p-6 space-y-8">

          <PageHeader title="Prestataires" subtitle="Gérez tous vos prestataires de services" />

          {/* Flash */}
          {flash && (
            <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold border ${
              flash.type === "success"
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-red-600 bg-red-100 border-red-300"
            }`}>
              {flash.message}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((k, i) => <StatsCard key={i} {...k} />)}
          </div>

          {/* Barre actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => showFlash("error", "Import désactivé (mode statique)")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
              >
                <Download size={16} /> Importer
              </button>
              <button
                onClick={() => showFlash("error", "Export désactivé (mode statique)")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
              >
                <Upload size={16} /> Exporter
              </button>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
              >
                <Filter size={16} /> Filtrer
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
            >
              <PlusCircle size={16} /> Ajouter un prestataire
            </button>
          </div>

          {/* Liste */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="w-80">
              <SearchInput onSearch={applySearch} placeholder="Rechercher un prestataire..." />
            </div>

            {filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map(p => (
                  <PrestCard
                    key={p.id}
                    id={p.id}
                    name={p.company_name}
                    location={p.city}
                    category={p.service?.name}
                    phone={p.user?.phone}
                    email={p.user?.email}
                    rating={p.rating}
                    status={p.is_active ? "Actif" : "Inactif"}
                    // ← logo retiré → PrestCard affichera ses propres initiales
                    // Si PrestCard accepte un renderAvatar ou avatarFallback :
                    avatarFallback={<ProviderAvatar name={p.company_name} />}
                    onProfilClick={() => setSelectedProvider(p)}
                    onTicketsClick={() => router.push(`/admin/prestataires/details/${p.id}`)}
                    detailUrl={`/admin/prestataires/details/${p.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 italic">
                Aucun prestataire trouvé.
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-50">
              <Paginate currentPage={1} totalPages={1} onPageChange={() => {}} />
            </div>
          </div>

        </main>
      </div>

      {/* Formulaire création */}
      <ReusableForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un nouveau prestataire"
        subtitle="Mode statique — aucune sauvegarde backend"
        fields={prestFields as any}
        onSubmit={() => { showFlash("success", "Création simulée (mode statique)"); setIsModalOpen(false); }}
        submitLabel="Créer le prestataire"
      />

      {/* Profile modal */}
      <ProfileModal
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        provider={
          selectedProvider ? {
            name:       selectedProvider.company_name,
            location:   selectedProvider.city,
            phone:      selectedProvider.user?.phone,
            email:      selectedProvider.user?.email,
            category:   selectedProvider.service?.name,
            dateEntree: selectedProvider.date_entree,
            status:     selectedProvider.is_active ? "Actif" : "Inactif",
            // ← pas de logo → le ProfileModal devra afficher les initiales
            avatar: <ProviderAvatar name={selectedProvider.company_name} size="lg" />,
            stats: {
              totalBillets:   { value: 12, delta: "+0%" },
              ticketsEnCours: { value: 3,  delta: "+0%" },
              ticketsTraites: { value: 9,  delta: "+0%" },
              noteObtenue:    `${selectedProvider.rating}/5`,
            },
          } : null
        }
      />
    </div>
  );
}