"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import ListCard from "@/components/ListCard";
import DonutChartCard from "@/components/DonutChartCard";
import BarChartCard from "@/components/BarChartCard";
import DataTable, { ColumnConfig } from "@/components/DataTable";
import SideDetailsPanel from "@/components/SideDetailsPanel";
import { Eye } from "lucide-react";
import { useDashboard } from "../../../hooks/admin/useDashboard";
import { useLanguage } from "../../../contexts/LanguageContext";
import { formatDate } from "../../../core/dateUtils";

// ─────────────────────────────────────────────
// Constantes & mappings statiques
// ─────────────────────────────────────────────

/** Labels des 12 mois (utilisés pour l'axe X du BarChart) */
const MOIS_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

/** Palette de couleurs pour le DonutChart (cyclique) */
const DONUT_COLORS = ["#df1414", "#07ad07", "#606eee", "#050f6b", "#f97316"];

/** Palette de couleurs pour le BarChart (une couleur par mois) */
const BAR_COLORS = [
  "#01050e", "#041022", "#192535", "#2d3748",
  "#373e46", "#4a5568", "#718096", "#969799",
  "#a0aec0", "#cbd5e0", "#e2e8f0", "#94a3b8",
];

/** Libellés lisibles des statuts de tickets */
const STATUS_LABELS: Record<string, string> = {
  signalez: "Signalé",
  validé:   "Validé",
  assigné:  "Assigné",
  en_cours: "En cours",
  rapporté: "Rapporté",
  évalué:   "Évalué",
  clos:     "Clôturé",
};

/** Classes Tailwind par statut (badge coloré dans le tableau) */
const STATUS_STYLES: Record<string, string> = {
  signalez: "border-slate-300 text-slate-700 bg-gray-100",
  validé:   "border-blue-400 text-blue-600 bg-blue-50",
  assigné:  "border-purple-400 text-purple-600 bg-purple-50",
  en_cours: "border-orange-400 text-orange-500 bg-orange-50",
  rapporté: "border-yellow-400 text-yellow-600 bg-yellow-50",
  évalué:   "border-green-400 text-green-600 bg-green-50",
  clos:     "bg-black text-white border-black",
};

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────

export default function Dashboard() {
  const { dashboard, isLoading } = useDashboard();
  const { t } = useLanguage();

  // État du panneau latéral de détail ticket
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen]   = useState(false);

  // Année sélectionnée pour filtrer le BarChart (défaut = année courante)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ── Builders de données ──────────────────────

  /**
   * Construit les 12 barres du BarChart en filtrant
   * `tendance_annuelle_maintenance` sur l'année choisie.
   * Les mois sans données valent 0.
   */
  const buildBarData = () => {
    if (!dashboard?.tendance_annuelle_maintenance) return [];

    const filtered = dashboard.tendance_annuelle_maintenance.filter(
      (i) => i.annee === selectedYear,
    );

    // Map mois → total pour accès O(1)
    const map: Record<number, number> = {};
    filtered.forEach((i) => { map[i.mois] = i.total; });

    return MOIS_LABELS.map((label, i) => ({
      label,
      value: map[i + 1] ?? 0,
      color: BAR_COLORS[i] ?? "#0F172A",
    }));
  };

  /**
   * Construit les segments du DonutChart
   * à partir des sites les plus fréquentés.
   */
  const buildDonutData = () =>
    (dashboard?.sites_les_plus_frequentes ?? []).map((site, i) => ({
      label: site.nom,
      value: site.total_tickets,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));

  /**
   * Construit les items de la ListCard (nom + sous-texte ticket count).
   * L'`id` est transmis pour construire le lien /admin/sites/details/[id].
   */
  const buildListItems = () =>
    (dashboard?.sites_les_plus_frequentes ?? []).map((site) => ({
      id:      site.site_id,
      name:    site.nom,
      subText: `${site.total_tickets} ticket${site.total_tickets > 1 ? "s" : ""}`,
    }));

  // ── Gestion du panneau de détail ──────────────

  /**
   * Ouvre le SideDetailsPanel avec les infos du ticket sélectionné.
   * Calcule la couleur de statut à la volée.
   */
  const handleOpenDetails = (ticket: any) => {
    const statusColor =
      ticket.status === "clos"     ? "#000"     :
      ticket.status === "en_cours" ? "#f97316"  :
      ticket.status === "évalué"   ? "#22c55e"  : "#64748b";

    setSelectedTicket({
      title:       ticket.subject ?? `Ticket #${ticket.id}`,
      reference:   `#${ticket.id}`,
      description: "Ticket récent visualisé depuis le tableau de bord.",
      fields: [
        { label: "Type",           value: ticket.type === "curatif" ? "Curatif" : "Préventif" },
        { label: "Sujet",          value: ticket.subject ?? "-" },
        { label: "Site concerné",  value: ticket.site?.nom ?? "-" },
        { label: "Service",        value: ticket.service?.name ?? "-" },
        { label: "Date planifiée", value: ticket.planned_at ?? "-" },
        {
          label:       "Statut",
          value:       STATUS_LABELS[ticket.status] ?? ticket.status,
          isStatus:    true,
          statusColor,
        },
      ],
    });

    setIsDetailsOpen(true);
  };

  // ── Colonnes du DataTable ──────────────────────
  type DashboardTicket = {
    id: number;
    subject?: string;
    site?: { nom: string };
    service?: { name: string };
    type: string;
    status: string;
    planned_at?: string;
  };

  const columns: ColumnConfig<DashboardTicket>[] = [
    {
      header: "ID ticket",
      key: "id",
      render: (_: any, row: any) => `#${row.id}`,
    },
    {
      header: "Nom",
      key: "subject",
      render: (_: any, row: any) => row.subject ?? "-",
    },
    {
      header: "Site",
      key: "site",
      render: (_: any, row: any) => row.site?.nom ?? "-",
    },
    {
      header: "Service",
      key: "service",
      // Ajout d'un fallback "-" si l'ID du service est nul (Image 3 du feedback utilisateur)
      render: (_: any, row: any) => row.service?.name ?? "-",
    },
    {
      header: "Type",
      key: "type",
      render: (_: any, row: any) =>
        row.type === "curatif" ? "Curatif" : "Préventif",
    },
    {
      header: "Statut",
      key: "status",
      render: (_: any, row: any) => (
        <span
          className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-xl border text-xs font-bold ${
            STATUS_STYLES[row.status] ?? ""
          }`}
        >
          {STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (_: any, row: any) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="font-bold text-slate-800 hover:text-blue-600 transition"
          aria-label={`Voir détail ticket #${row.id}`}
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  // ─────────────────────────────────────────────
  // Rendu
  // ─────────────────────────────────────────────

  return (
    // ← BUG CORRIGÉ : className fermé avec " et non laissé ouvert
    <div className="min-h-screen flex bg-slate-50">

      {/* Colonne principale */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-8 pt-24 space-y-8">

          {isLoading && (
            <div className="text-center text-slate-400 text-sm italic py-8">
              {t("common.loading")}
            </div>
          )}

          {/* ── KPIs Tickets (3 cartes) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard label={t("dashboard.totalTickets")} value={dashboard?.nombre_total_tickets ?? 0} delta="+3%" trend="up" href="/admin/tickets" />
            <StatsCard label={t("dashboard.treatedTickets")} value={dashboard?.nombre_tickets_traites ?? 0} delta="+20,10%" trend="up" href="/admin/tickets" />
            <StatsCard label={t("dashboard.untreatedTickets")} value={dashboard?.nombre_tickets_non_traites ?? 0} delta="+10%" trend="up" href="/admin/tickets" />
          </div>

          {/* ── KPIs Sites & Coûts (4 cartes) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard label={t("dashboard.activeSites")} value={dashboard?.nombre_sites_actifs ?? 0} delta="+3%" trend="up" href="/admin/sites" />
            <StatsCard label={t("dashboard.inactiveSites")} value={dashboard?.nombre_sites_inactifs ?? 0} delta="+3%" trend="up" href="/admin/sites" />
            <StatsCard label={t("dashboard.avgCostPerSite")} value={dashboard?.cout_moyen_par_site ?? 0} isCurrency delta="+20,10%" trend="up" href="/admin/sites" />
            <StatsCard label={t("dashboard.totalMaintenanceCost")} value={dashboard?.cout_total_maintenance ?? 0} isCurrency delta="+1%" trend="up" href="/admin/factures" />
          </div>

          {/* ── Graphiques (BarChart + Donut + ListCard) ── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-4">

            {/* BarChart : tendance mensuelle filtrée par année */}
            <div className="lg:col-span-5 flex">
              <div className="w-full h-full">
            <BarChartCard title={t("dashboard.yearTrend")} data={buildBarData()} onYearChange={(year) => setSelectedYear(Number(year))} />
              </div>
            </div>

            {/* DonutChart : répartition par site */}
            <div className="lg:col-span-4 flex">
              <div className="w-full h-full">
                <DonutChartCard title={t("dashboard.mostVisitedSites")} data={buildDonutData()} />
              </div>
            </div>

            {/* ListCard : liste des sites avec lien vers détail */}
            <div className="lg:col-span-3 flex">
              <div className="w-full h-full">
                <ListCard title={t("dashboard.sitesList")} items={buildListItems()} viewAllHref="/admin/sites" viewAllText={t("dashboard.seeAll")} />
              </div>
            </div>
          </section>

          {/* ── Tableau des tickets récents ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

            {/* En-tête du tableau */}
            <div className="px-6 py-4">
              <h3 className="text-base font-bold text-slate-800">{t("dashboard.recentTickets")}</h3>
            </div>

            {/* DataTable avec navigation "Voir tous" */}
            <div className="px-6 py-4">
              <DataTable
                title="Tickets Récents"
                columns={columns}
                data={dashboard?.tickets_recents ?? []}
                onViewAll={() => (window.location.href = "/admin/tickets")}
              />
            </div>
          </div>

        </main>
      </div>

      {/* ── Panneau latéral de détail ticket ── */}
      <SideDetailsPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedTicket?.title ?? ""}
        reference={selectedTicket?.reference}
        fields={selectedTicket?.fields ?? []}
        descriptionContent={selectedTicket?.description}
      />
    </div>
  );
}