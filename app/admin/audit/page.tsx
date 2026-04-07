"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Activity, Clock, Users, 
  Search, Filter, Calendar as CalendarIcon,
  ChevronRight, ArrowUpRight, User, Loader2
} from "lucide-react";
import axiosInstance from "../../../core/axios";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import Paginate from "@/components/Paginate";

export default function AuditTrailPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    user_id: "",
    model: "",
  });

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/activity-log/stats");
      setStats(res.data?.data ?? res.data);
    } catch (e) {
      console.error("Stats error", e);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/activity-log", {
        params: { 
          page: currentPage, 
          per_page: 15,
          ...filters
        }
      });
      const d = res.data?.data ?? res.data;
      setLogs(d.data || []);
      setTotalPages(d.last_page || 1);
      setTotalItems(d.total || 0);
    } catch (e) {
      console.error("Logs error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const kpis = [
    { label: "Total actions", value: stats?.total_actions || 0, delta: "", trend: "up" as const, icon: <Activity size={20} /> },
    { label: "Dernières 24h", value: stats?.last_24h || 0, delta: "", trend: "up" as const, icon: <Clock size={20} /> },
    { label: "Top Utilisateur", value: stats?.top_users?.[0]?.user?.name || "N/A", delta: `${stats?.top_users?.[0]?.total || 0} acts`, trend: "up" as const, icon: <User size={20} /> },
    { label: "Modèles impactés", value: "8 types", delta: "", trend: "up" as const, icon: <FileText size={20} /> },
  ];

  const columns = [
    {
      header: "Utilisateur",
      key: "user_id",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-white">
              {row.user?.name?.split(' ').map((n:any)=>n[0]).join('').toUpperCase() || "SY"}
            </span>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{row.user?.name || "Système"}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{row.user_type?.split('\\').pop()}</p>
          </div>
        </div>
      )
    },
    {
      header: "Action",
      key: "action",
      render: (val: string) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
          val === 'created' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
          val === 'updated' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
          val === 'deleted' ? 'bg-red-50 text-red-700 border border-red-100' :
          'bg-slate-50 text-slate-700 border border-slate-100'
        }`}>
          {val}
        </span>
      )
    },
    {
      header: "Entité",
      key: "model_type",
      render: (_: any, row: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{row.model_type?.split('\\').pop()}</span>
          <span className="text-[10px] text-slate-400">ID: {row.model_id}</span>
        </div>
      )
    },
    {
      header: "Description",
      key: "description",
      render: (val: string) => <p className="text-xs text-slate-500 max-w-xs truncate font-medium">{val}</p>
    },
    {
       header: "Date",
       key: "created_at",
       render: (val: string) => (
         <div className="flex flex-col">
           <span className="text-sm font-bold text-slate-700">{new Date(val).toLocaleDateString()}</span>
           <span className="text-[10px] text-slate-400">{new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
         </div>
       )
    }
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

        <main className="mt-20 p-8 space-y-8">
          <PageHeader 
            title="Audit Trail" 
            subtitle="Traçabilité complète des actions effectuées sur la plateforme" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((k, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {k.icon}
                    </div>
                    {k.delta && (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{k.delta}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{k.label}</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{k.value}</h4>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                   <Activity size={20} className="text-white" />
                 </div>
                 <h3 className="font-black text-slate-900">Journal d'activité</h3>
               </div>

               <div className="flex items-center gap-3">
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Filtrer par modèle..."
                     value={filters.model}
                     onChange={(e) => setFilters({...filters, model: e.target.value})}
                     className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all w-48"
                   />
                 </div>
                 {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-900" />}
               </div>
            </div>

            <DataTable 
              title="Journal des événements" 
              columns={columns} 
              data={logs} 
              onViewAll={() => {}} 
            />

            {logs.length === 0 && !loading && (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FileText size={40} className="text-slate-100 mb-2" />
                <p className="text-sm font-medium italic">Aucun log d'activité trouvé.</p>
              </div>
            )}

            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-white">
              <p className="text-xs text-slate-400 font-medium">
                Affichage de {logs.length} sur {totalItems} événements
              </p>
              <Paginate currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </main>
      </div>
  );
}
