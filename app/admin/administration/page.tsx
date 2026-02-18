"use client";
import { User, Lock, Bell, Globe } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DetailsCard from "@/components/DetailsCard";
import LineChartCard from "@/components/LineChartCard";
import StatsCard from "@/components/StatsCard";
import DetailsStats from "@/components/DetailsStats";
import PageHeader from "@/components/PageHeader";

 export default function AdministrationPage() {
   const kpis = [
  { label: "Nombres total de sites actifs", value: 10, delta: "+3%", trend: "up" },
  { label: "Nombre total de sites inactifs ", value: "01", delta: "+3%", trend: "up" },
  { label: "Coût moyen par sites ", value: "33K FCFA", delta: "+20,10%", trend: "up" },
  { label: "Coût total de maintenance", value: "800.5K FCFA", delta: "+15,03%", trend: "up" },
];

const tpis = [
  { label: "Nombre total d'équpements du patrimoine ", value: 50, delta: "+15,03%", trend: "up" },
  { label: "Nombre total de prestataires ", value: 15, delta: "+20.10%", trend: "up" },
  { label: "Nombre total de factures", value: 200, delta: "+10%", trend: "up" },
];

 const chartData = [
    { label: "Jan", value: 50 }, { label: "Fev", value: 30 },
    { label: "Mars", value: 60 }, { label: "Avril", value: 40 },
    { label: "Mai", value: 35 }, { label: "Juin", value: 55 },
    { label: "Juil", value: 30 }, { label: "Août", value: 40 },
    { label: "Sep", value: 70 }, { label: "Oct", value: 60 }
  ];
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        <main className="ml-64 mt-20 p-6 space-y-10">
        <PageHeader 
  title="Administration" 
  subtitle="Ce menu vous permettra de gérer tout l'ensemble de votre espace" 
/>
{/* Section Stats Cards */}
          <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => <StatsCard key={i} {...kpi} />)}
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tpis.map((tpi, i) => <DetailsStats key={i} {...tpi} />)}
             </div>
          </div>
          {/* 1. Rangée du haut (Horizontal) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          </div>

          {/* 2. SECTION MIXTE : Cartes Verticales + Graphique (C'est ici que ça se joue) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Colonne de gauche : Cartes Verticales (Prend 3 colonnes sur 12) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
            <DetailsCard title="Nombre de tickets en attente " value={"05"} href="#" />
            <DetailsCard title="Nombre de tickets en cours" value={"05"} href="#" />
            <DetailsCard title="Nombre de tickets clôturés" value={25} href="#" />
            </div>

            {/* Colonne de droite : Le Graphique (Prend 9 colonnes sur 12) */}
            <div className="lg:col-span-9 h-full">
              <LineChartCard 
                title="Evolution des équipements du patrimoine" 
                data={chartData} 
              />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}