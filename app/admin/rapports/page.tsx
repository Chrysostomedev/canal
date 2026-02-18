"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ReportCard from "@/components/ReportCard";
import DonutChartCard from "@/components/DonutChartCard";
import ActionGroup from "@/components/ActionGroup";
import SearchInput from "@/components/SearchInput";
import StatsCard from "@/components/StatsCard";

const kpis = [
  { label: "Tickets totaux", value: 1234, delta: "+5%", trend: "up" },
  { label: "Tickets traités", value: 1020, delta: "+8%", trend: "up" },
  { label: "Tickets non traités", value: 214, delta: "-3%", trend: "down" },
  { label: "Temps moyen", value: 214, delta: "-3%", trend: "down" },
];

const cpis = [
  { label: "Sites actifs", value: 10, delta: "+3", trend: "up" },
  { label: "Coût moyen", value: "33 K", delta: "+20.10%", trend: "up" },
  { label: "Coût total", value: "800.5 K", delta: "+15.03%", trend: "up" },
];
const reports = [
  {
    title: "Tickets par statut",
    value: 324,
    trend: "+12%",
    description: "Tickets ouverts, en cours et clos sur le dernier trimestre",
    status: "healthy",
  },
  {
    title: "Interventions réalisées",
    value: 218,
    trend: "+8%",
    description: "Nombre total d’interventions effectuées sur le parc sites",
    status: "healthy",
  },
  {
    title: "Alertes critiques",
    value: 12,
    trend: "-5%",
    description: "Alertes nécessitant une intervention immédiate",
    status: "critical",
  },
];

const donutData = [
  { label: "Site A", value: 45, color: "#111" },
  { label: "Site B", value: 30, color: "#555" },
  { label: "Site C", value: 15, color: "#888" },
  { label: "Site D", value: 10, color: "#ccc" },
];

export default function RapportPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
           <Sidebar />
              <Navbar />
      <main className="ml-64 mt-20 p-6">

        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Rapports CANAL+</h1>
          <p className="text-gray-600 max-w-2xl">
            Analyse détaillée des performances et activités. Suivi des tickets, interventions et alertes critiques pour une meilleure supervision.
          </p>
        </header>
        {/* Section Stats Cards */}
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cpis.map((cpi, i) => <StatsCard key={i} {...cpi} />)}
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
             </div>
          </div>

 <div className="flex justify-between items-center mb-6">
        <SearchInput />
        <ActionGroup />
      </div>
        {/* Reporting Insights Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((report) => (
            <ReportCard
              key={report.title}
              title={report.title}
              value={report.value}
              trend={report.trend}
              description={report.description}
              status={report.status as "healthy" | "warning" | "critical"}
            />
          ))}
        </section>

        {/* Donut Chart Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DonutChartCard
            title="Répartition des tickets par site"
            data={donutData}
          />
          <DonutChartCard
            title="Répartition des interventions par site"
            data={[
              { label: "Site A", value: 50, color: "#111" },
              { label: "Site B", value: 20, color: "#555" },
              { label: "Site C", value: 18, color: "#888" },
              { label: "Site D", value: 12, color: "#ccc" },
            ]}
          />
        </section>


        {/* Synthèse textuelle */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Analyse détaillée</h2>
          <p className="text-gray-700 leading-relaxed">
            Les rapports montrent une performance globalement stable avec une légère amélioration des interventions et des tickets traités. Le suivi par site met en évidence les zones nécessitant davantage de vigilance.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Les alertes critiques ont diminué de 5%, ce qui démontre l’efficacité des mesures mises en place. Les responsables métiers peuvent utiliser ces informations pour prioriser les actions et optimiser la maintenance.
          </p>
          <p className="text-gray-700 leading-relaxed">
            La répartition visuelle par site permet une compréhension rapide et intuitive des zones les plus chargées, facilitant ainsi la prise de décision stratégique.
          </p>
        </section>
      </main>
    </div>
  );
}
