"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ListCard from "@/components/ListCard";
import DataTable, { DataRow } from "@/components/DataTable";
import { Activity, Eye } from "lucide-react";
import ActionGroup from "@/components/ActionGroup";
import StatsCard from "@/components/StatsCard";
import PageHeader from "@/components/PageHeader";

const topManagers = [
  { name: "Boris Yao", interventions: 18 },
  { name: "Aïcha Koné", interventions: 14 },
  { name: "Jean Kouassi", interventions: 11 },
];

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

const tableData: DataRow[] = [
  {
    id: "GM-001",
    name: "Boris Yao",
    status: "actif",
    date: "05 Fév 2026 • 09:12",
  },
  {
    id: "GM-002",
    name: "Aïcha Koné",
    status: "actif",
    date: "03 Fév 2026 • 14:30",
  },
  {
    id: "GM-003",
    name: "Jean Kouassi",
    status: "inactif",
    date: "28 Jan 2026 • 11:05",
  },
];

const columns = [
  { header: "ID manager", key: "id" },
  { header: "Nom", key: "name" },
  { header: "Date", key: "date" },
  {
    header: "Statut",
    key: "status",
    render: (value: string) => {
      const isActive = value === "actif";

      return (
        <span
          className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-xl border text-xs font-bold ${
            isActive
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {value}
        </span>
      );
    },
  },
  {
    header: "Actions",
    key: "actions",
    render: (_: any, row: any) => (
      <button className="font-bold text-slate-800 hover:text-blue-600 transition">
        <Eye size={18} />
      </button>
    ),
  },
];

export default function GestionnairesPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="ml-64 mt-20 p-6 space-y-8">
          <PageHeader
            title="Gestionnaires"
            subtitle="Ce menu vous permet de voir le calendrier des évènements planifiés"
          />

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cpis.map((cpi, i) => (
                <StatsCard key={i} {...cpi} />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, i) => (
                <StatsCard key={i} {...kpi} />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <ActionGroup />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="relative bg-white rounded-2xl border border-gray-200 p-6 xl:col-span-3">
              <Activity className="absolute right-4 top-4 w-16 h-16 text-gray-100" />
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Lecture stratégique
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                La charge globale reste stable avec une légère variation
                opérationnelle. Les indicateurs suggèrent une répartition
                équilibrée des interventions entre gestionnaires actifs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <ListCard
              items={topManagers}
              title="Listes des gestionnaires en vedette"
            />

            <div className="xl:col-span-2">
              <DataTable
                columns={columns}
                data={tableData}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}