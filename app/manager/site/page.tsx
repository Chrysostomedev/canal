// "use client";

// // app/manager/site/page.tsx  (ou site/[id]/page.tsx selon le routing)
// // VERSION DYNAMIQUE — données réelles via useSite + useAssets

// import { useState } from "react";
// import Link from "next/link";
// import {
//   Building2, Download, Upload, Eye, ChevronLeft,
//   MapPin, Phone, Mail, CalendarClock, Copy, CheckCheck,
// } from "lucide-react";

// import Navbar from "@/components/Navbar";
// import Sidebar from "@/components/Sidebar";
// import Paginate from "@/components/Paginate";
// import StatsCard from "@/components/StatsCard";
// import ReusableForm from "@/components/ReusableForm";
// import DataTable from "@/components/DataTable";
// import { FieldConfig } from "@/components/ReusableForm";

// import { useSite } from "../"use client";

// // app/manager/site/page.tsx  (ou site/[id]/page.tsx selon le routing)
// // VERSION DYNAMIQUE — données réelles via useSite + useAssets

// import { useState } from "react";
// import Link from "next/link";
// import {
//   Building2, Download, Upload, Eye, ChevronLeft,
//   MapPin, Phone, Mail, CalendarClock, Copy, CheckCheck,
// } from "lucide-react";

// import Navbar from "@/components/Navbar";
// import Sidebar from "@/components/Sidebar";
// import Paginate from "@/components/Paginate";
// import StatsCard from "@/components/StatsCard";
// import ReusableForm from "@/components/ReusableForm";
// import DataTable from "@/components/DataTable";
// import { FieldConfig } from "@/components/ReusableForm";

// import { useSite } from "@/hooks/manager/useSite";
// import { useAssets } from "@/hooks/manager/useAssets";
// import type { Asset } from "@/types/manager.types";

// // ════════════════════════════════════════════════════════════════
// // HELPERS
// // ════════════════════════════════════════════════════════════════

// const formatMontant = (v?: number | null) => {
//   if (!v && v !== 0) return "—";
//   if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
//   if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K FCFA`;
//   return `${v} FCFA`;
// };

// const formatDate = (iso?: string | null) => {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   return isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR");
// };

// // ════════════════════════════════════════════════════════════════
// // COPY BUTTON
// // ════════════════════════════════════════════════════════════════

// function CopyButton({ text }: { text: string }) {
//   const [copied, setCopied] = useState(false);
//   return (
//     <button
//       onClick={async () => {
//         await navigator.clipboard.writeText(text);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//       }}
//       className="ml-2 p-1 rounded-lg hover:bg-slate-200 transition text-slate-400 hover:text-slate-700"
//     >
//       {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
//     </button>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// // STATUS
// // ════════════════════════════════════════════════════════════════

// const STATUS_STYLE: Record<string, string> = {
//   active:          "border-green-500 bg-green-50 text-green-700",
//   in_maintenance:  "border-amber-400 bg-amber-50 text-amber-700",
//   out_of_service:  "border-red-400 bg-red-50 text-red-600",
//   disposed:        "border-slate-400 bg-slate-100 text-slate-700",
//   // aliases statiques legacy
//   actif:           "border-green-500 bg-green-50 text-green-700",
//   inactif:         "border-red-400 bg-red-50 text-red-600",
//   hors_usage:      "border-slate-400 bg-slate-100 text-slate-700",
// };

// const STATUS_LABEL: Record<string, string> = {
//   active:         "Actif",
//   in_maintenance: "En maintenance",
//   out_of_service: "Hors service",
//   disposed:       "Réformé",
//   actif:          "Actif",
//   inactif:        "Inactif",
//   hors_usage:     "Hors usage",
// };

// // ════════════════════════════════════════════════════════════════
// // PAGE
// // ════════════════════════════════════════════════════════════════

// export default function SitePage() {
//   const { site, stats: siteStats, isLoading: loadingSite, error: siteError, exportSite } = useSite();
//   const {
//     assets,
//     stats: assetStats,
//     meta,
//     filters,
//     isLoading: loadingAssets,
//     error: assetError,
//     setFilters,
//     exportAssets,
//   } = useAssets();

//   const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
//   const [isModalOpen, setIsModalOpen]     = useState(false);

//   const isLoading = loadingSite || loadingAssets;
//   const error     = siteError ?? assetError;

//   // ── Champs formulaire ajout patrimoine (lecture seule pour manager) ──
//   const assetFields: FieldConfig[] = [
//     {
//       name: "type_asset_id",
//       label: "Famille / Type",
//       type: "select",
//       required: true,
//       options: [],
//     },
//     {
//       name: "sub_type_asset_id",
//       label: "Sous-type",
//       type: "select",
//       required: true,
//       options: [],
//     },
//     { name: "designation",        label: "Désignation",   type: "text",   required: true },
//     {
//       name: "status",
//       label: "Statut",
//       type: "select",
//       required: true,
//       options: [
//         { label: "Actif",           value: "active" },
//         { label: "En maintenance",  value: "in_maintenance" },
//         { label: "Hors service",    value: "out_of_service" },
//         { label: "Réformé",         value: "disposed" },
//       ],
//     },
//     { name: "acquisition_date",  label: "Date d'entrée",  type: "date",   required: true, icon: CalendarClock },
//     { name: "acquisition_value", label: "Valeur d'entrée",type: "number", required: true },
//     { name: "serial_number",     label: "N° de série",    type: "text" },
//     { name: "description",       label: "Description",    type: "rich-text", gridSpan: 2 },
//   ];

//   // ── Colonnes table ──
//   const columns = [
//     {
//       header: "ID",
//       key: "id",
//       render: (_: any, row: Asset) => (
//         <div className="flex items-center">
//           <span className="font-black text-sm">#{row.id}</span>
//           <CopyButton text={String(row.id)} />
//         </div>
//       ),
//     },
//     {
//       header: "Type",
//       key: "typeAsset",
//       render: (_: any, row: Asset) => row.typeAsset?.name ?? "—",
//     },
//     {
//       header: "Sous-type",
//       key: "subTypeAsset",
//       render: (_: any, row: Asset) => row.subTypeAsset?.name ?? "—",
//     },
//     {
//       header: "Codification",
//       key: "code",
//       render: (_: any, row: Asset) => (
//         <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
//           {row.code ?? row.serial_number ?? "—"}
//         </span>
//       ),
//     },
//     {
//       header: "Désignation",
//       key: "designation",
//       render: (_: any, row: Asset) => row.designation,
//     },
//     {
//       header: "Statut",
//       key: "status",
//       render: (_: any, row: Asset) => (
//         <span className={`px-3 py-1 rounded border text-xs font-bold ${STATUS_STYLE[row.status] ?? ""}`}>
//           {STATUS_LABEL[row.status] ?? row.status}
//         </span>
//       ),
//     },
//     {
//       header: "Date entrée",
//       key: "acquisition_date",
//       render: (_: any, row: Asset) => formatDate(row.acquisition_date),
//     },
//     {
//       header: "Valeur",
//       key: "valeur",
//       render: (_: any, row: Asset) => formatMontant(row.acquisition_value),
//     },
//     {
//       header: "Actions",
//       key: "actions",
//       render: (_: any, row: Asset) => (
//         <button
//           onClick={() => setSelectedAsset(row)}
//           className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
//         >
//           <Eye size={18} /> Aperçu
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="flex min-h-screen bg-gray-50 font-sans">
//       <Sidebar />

//       <div className="flex flex-col flex-1 overflow-hidden">
//         <Navbar />

//         <main className="ml-64 mt-20 p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">

//           {/* Erreur */}
//           {error && (
//             <div className="px-6 py-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm font-semibold">
//               {error}
//             </div>
//           )}

//           {/* ── HEADER SITE ── */}
//           <div className="bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-slate-100 shadow-sm">
//             <div className="space-y-4">
//               <Link
//                 href="/manager/dashboard"
//                 className="flex items-center gap-2 text-slate-500 hover:text-black transition bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium"
//               >
//                 <ChevronLeft size={18} /> Retour
//               </Link>

//               {isLoading ? (
//                 <div className="space-y-2">
//                   <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse" />
//                   <div className="h-5 w-40 bg-slate-100 rounded-xl animate-pulse" />
//                 </div>
//               ) : (
//                 <div>
//                   <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
//                     {site?.nom ?? site?.name ?? "Mon Site"}
//                   </h1>
//                   <div className="flex items-center gap-2 text-slate-400 mt-1">
//                     <MapPin size={18} />
//                     <span className="font-medium text-lg">{site?.adresse ?? site?.ville ?? "—"}</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Bloc contact manager */}
//             <div className="bg-slate-50 p-6 rounded-xl border min-w-[280px] space-y-2">
//               {isLoading ? (
//                 <div className="space-y-2">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
//                   ))}
//                 </div>
//               ) : (
//                 <>
//                   <h3 className="font-bold text-lg">Informations du site</h3>
//                   <div className="flex items-center gap-2 text-sm text-slate-600">
//                     <Building2 size={16} />
//                     <span>ID : {site?.id ?? "—"}</span>
//                   </div>
//                   {site?.adresse && (
//                     <div className="flex items-center gap-2 text-sm text-slate-600">
//                       <MapPin size={16} />
//                       <span>{site.adresse}</span>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>

//           {/* ── KPIs ── */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {isLoading ? (
//               [1, 2, 3, 4].map((i) => (
//                 <div key={i} className="h-24 bg-white rounded-2xl border animate-pulse" />
//               ))
//             ) : (
//               <>
//                 <StatsCard
//                   label="Total patrimoines"
//                   value={assetStats?.total ?? 0}
//                   delta=""
//                   trend="up"
//                 />
//                 <StatsCard
//                   label="Actifs"
//                   value={assetStats?.active ?? 0}
//                   delta=""
//                   trend="up"
//                 />
//                 <StatsCard
//                   label="En maintenance"
//                   value={assetStats?.in_maintenance ?? 0}
//                   delta=""
//                   trend="up"
//                 />
//                 <StatsCard
//                   label="Valeur totale"
//                   value={formatMontant(assetStats?.total_value)}
//                   delta=""
//                   trend="up"
//                 />
//               </>
//             )}
//           </div>

//           {/* ── ACTIONS ── */}
//           <div className="flex justify-end gap-3">
//             <button
//               onClick={exportSite}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
//             >
//               <Upload size={16} /> Exporter site
//             </button>
//             <button
//               onClick={exportAssets}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
//             >
//               <Download size={16} /> Exporter patrimoine
//             </button>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
//             >
//               <Building2 size={16} /> Ajouter un patrimoine
//             </button>
//           </div>

//           {/* ── TABLE PATRIMOINES ── */}
//           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//             {loadingAssets ? (
//               <div className="p-12 text-center text-slate-400 text-sm">
//                 Chargement du patrimoine...
//               </div>
//             ) : (
//               <>
//                 <DataTable
//                   columns={columns}
//                   data={assets}
//                   title="Patrimoines du site"
//                   onViewAll={() => {}}
//                 />
//                 <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
//                   <p className="text-xs text-slate-400">
//                     Page {filters.page ?? 1} sur {meta?.last_page ?? 1} · {meta?.total ?? 0} éléments
//                   </p>
//                   <Paginate
//                     currentPage={filters.page ?? 1}
//                     totalPages={meta?.last_page ?? 1}
//                     onPageChange={(page) => setFilters({ page })}
//                   />
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ── APERÇU ASSET (side panel léger) ── */}
//           {selectedAsset && (
//             <>
//               <div
//                 className="fixed inset-0 bg-black/20 z-40"
//                 onClick={() => setSelectedAsset(null)}
//               />
//               <div className="fixed right-0 top-0 h-full w-[420px] bg-white z-50 shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
//                 <div className="p-6 border-b space-y-1">
//                   <button
//                     onClick={() => setSelectedAsset(null)}
//                     className="text-xs text-slate-400 hover:text-black mb-2"
//                   >
//                     ✕ Fermer
//                   </button>
//                   <h2 className="text-2xl font-black">{selectedAsset.designation}</h2>
//                   <span
//                     className={`inline-block px-3 py-1 rounded border text-xs font-bold ${STATUS_STYLE[selectedAsset.status] ?? ""}`}
//                   >
//                     {STATUS_LABEL[selectedAsset.status] ?? selectedAsset.status}
//                   </span>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
//                   {[
//                     { label: "ID",            value: `#${selectedAsset.id}` },
//                     { label: "Codification",  value: selectedAsset.code ?? selectedAsset.serial_number ?? "—" },
//                     { label: "Type",          value: selectedAsset.typeAsset?.name ?? "—" },
//                     { label: "Sous-type",     value: selectedAsset.subTypeAsset?.name ?? "—" },
//                     { label: "Date d'entrée", value: formatDate(selectedAsset.acquisition_date) },
//                     { label: "Valeur",        value: formatMontant(selectedAsset.acquisition_value) },
//                     { label: "Site",          value: selectedAsset.site?.nom ?? "—" },
//                   ].map(({ label, value }) => (
//                     <div key={label} className="flex justify-between border-b border-slate-50 pb-2">
//                       <span className="text-slate-400 font-medium">{label}</span>
//                       <span className="font-bold text-slate-800">{value}</span>
//                     </div>
//                   ))}
//                   {selectedAsset.description && (
//                     <div className="bg-slate-50 rounded-xl p-4 text-slate-600 text-sm">
//                       {selectedAsset.description}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </main>
//       </div>

//       {/* Modal ajout patrimoine — réservé administration */}
//       <ReusableForm
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Ajouter un patrimoine"
//         subtitle="La gestion du patrimoine est réservée à l'administration"
//         fields={assetFields}
//         initialValues={{}}
//         onSubmit={() => {
//           setIsModalOpen(false);
//         }}
//         submitLabel="Enregistrer"
//       />
//     </div>
//   );
// }
// import { useAssets } from "@/hooks/manager/useAssets";
// import type { Asset } from "@/types/manager.types";

// // ════════════════════════════════════════════════════════════════
// // HELPERS
// // ════════════════════════════════════════════════════════════════

// const formatMontant = (v?: number | null) => {
//   if (!v && v !== 0) return "—";
//   if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
//   if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K FCFA`;
//   return `${v} FCFA`;
// };

// const formatDate = (iso?: string | null) => {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   return isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR");
// };

// // ════════════════════════════════════════════════════════════════
// // COPY BUTTON
// // ════════════════════════════════════════════════════════════════

// function CopyButton({ text }: { text: string }) {
//   const [copied, setCopied] = useState(false);
//   return (
//     <button
//       onClick={async () => {
//         await navigator.clipboard.writeText(text);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//       }}
//       className="ml-2 p-1 rounded-lg hover:bg-slate-200 transition text-slate-400 hover:text-slate-700"
//     >
//       {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
//     </button>
//   );
// }

// // ════════════════════════════════════════════════════════════════
// // STATUS
// // ════════════════════════════════════════════════════════════════

// const STATUS_STYLE: Record<string, string> = {
//   active:          "border-green-500 bg-green-50 text-green-700",
//   in_maintenance:  "border-amber-400 bg-amber-50 text-amber-700",
//   out_of_service:  "border-red-400 bg-red-50 text-red-600",
//   disposed:        "border-slate-400 bg-slate-100 text-slate-700",
//   // aliases statiques legacy
//   actif:           "border-green-500 bg-green-50 text-green-700",
//   inactif:         "border-red-400 bg-red-50 text-red-600",
//   hors_usage:      "border-slate-400 bg-slate-100 text-slate-700",
// };

// const STATUS_LABEL: Record<string, string> = {
//   active:         "Actif",
//   in_maintenance: "En maintenance",
//   out_of_service: "Hors service",
//   disposed:       "Réformé",
//   actif:          "Actif",
//   inactif:        "Inactif",
//   hors_usage:     "Hors usage",
// };

// // ════════════════════════════════════════════════════════════════
// // PAGE
// // ════════════════════════════════════════════════════════════════

// export default function SitePage() {
//   const { site, stats: siteStats, isLoading: loadingSite, error: siteError, exportSite } = useSite();
//   const {
//     assets,
//     stats: assetStats,
//     meta,
//     filters,
//     isLoading: loadingAssets,
//     error: assetError,
//     setFilters,
//     exportAssets,
//   } = useAssets();

//   const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
//   const [isModalOpen, setIsModalOpen]     = useState(false);

//   const isLoading = loadingSite || loadingAssets;
//   const error     = siteError ?? assetError;

//   // ── Champs formulaire ajout patrimoine (lecture seule pour manager) ──
//   const assetFields: FieldConfig[] = [
//     {
//       name: "type_asset_id",
//       label: "Famille / Type",
//       type: "select",
//       required: true,
//       options: [],
//     },
//     {
//       name: "sub_type_asset_id",
//       label: "Sous-type",
//       type: "select",
//       required: true,
//       options: [],
//     },
//     { name: "designation",        label: "Désignation",   type: "text",   required: true },
//     {
//       name: "status",
//       label: "Statut",
//       type: "select",
//       required: true,
//       options: [
//         { label: "Actif",           value: "active" },
//         { label: "En maintenance",  value: "in_maintenance" },
//         { label: "Hors service",    value: "out_of_service" },
//         { label: "Réformé",         value: "disposed" },
//       ],
//     },
//     { name: "acquisition_date",  label: "Date d'entrée",  type: "date",   required: true, icon: CalendarClock },
//     { name: "acquisition_value", label: "Valeur d'entrée",type: "number", required: true },
//     { name: "serial_number",     label: "N° de série",    type: "text" },
//     { name: "description",       label: "Description",    type: "rich-text", gridSpan: 2 },
//   ];

//   // ── Colonnes table ──
//   const columns = [
//     {
//       header: "ID",
//       key: "id",
//       render: (_: any, row: Asset) => (
//         <div className="flex items-center">
//           <span className="font-black text-sm">#{row.id}</span>
//           <CopyButton text={String(row.id)} />
//         </div>
//       ),
//     },
//     {
//       header: "Type",
//       key: "typeAsset",
//       render: (_: any, row: Asset) => row.typeAsset?.name ?? "—",
//     },
//     {
//       header: "Sous-type",
//       key: "subTypeAsset",
//       render: (_: any, row: Asset) => row.subTypeAsset?.name ?? "—",
//     },
//     {
//       header: "Codification",
//       key: "code",
//       render: (_: any, row: Asset) => (
//         <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
//           {row.code ?? row.serial_number ?? "—"}
//         </span>
//       ),
//     },
//     {
//       header: "Désignation",
//       key: "designation",
//       render: (_: any, row: Asset) => row.designation,
//     },
//     {
//       header: "Statut",
//       key: "status",
//       render: (_: any, row: Asset) => (
//         <span className={`px-3 py-1 rounded border text-xs font-bold ${STATUS_STYLE[row.status] ?? ""}`}>
//           {STATUS_LABEL[row.status] ?? row.status}
//         </span>
//       ),
//     },
//     {
//       header: "Date entrée",
//       key: "acquisition_date",
//       render: (_: any, row: Asset) => formatDate(row.acquisition_date),
//     },
//     {
//       header: "Valeur",
//       key: "valeur",
//       render: (_: any, row: Asset) => formatMontant(row.acquisition_value),
//     },
//     {
//       header: "Actions",
//       key: "actions",
//       render: (_: any, row: Asset) => (
//         <button
//           onClick={() => setSelectedAsset(row)}
//           className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition"
//         >
//           <Eye size={18} /> Aperçu
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="flex min-h-screen bg-gray-50 font-sans">
//       <Sidebar />

//       <div className="flex flex-col flex-1 overflow-hidden">
//         <Navbar />

//         <main className="ml-64 mt-20 p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">

//           {/* Erreur */}
//           {error && (
//             <div className="px-6 py-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm font-semibold">
//               {error}
//             </div>
//           )}

//           {/* ── HEADER SITE ── */}
//           <div className="bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-slate-100 shadow-sm">
//             <div className="space-y-4">
//               <Link
//                 href="/manager/dashboard"
//                 className="flex items-center gap-2 text-slate-500 hover:text-black transition bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit text-sm font-medium"
//               >
//                 <ChevronLeft size={18} /> Retour
//               </Link>

//               {isLoading ? (
//                 <div className="space-y-2">
//                   <div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse" />
//                   <div className="h-5 w-40 bg-slate-100 rounded-xl animate-pulse" />
//                 </div>
//               ) : (
//                 <div>
//                   <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
//                     {site?.nom ?? site?.name ?? "Mon Site"}
//                   </h1>
//                   <div className="flex items-center gap-2 text-slate-400 mt-1">
//                     <MapPin size={18} />
//                     <span className="font-medium text-lg">{site?.adresse ?? site?.ville ?? "—"}</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Bloc contact manager */}
//             <div className="bg-slate-50 p-6 rounded-xl border min-w-[280px] space-y-2">
//               {isLoading ? (
//                 <div className="space-y-2">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
//                   ))}
//                 </div>
//               ) : (
//                 <>
//                   <h3 className="font-bold text-lg">Informations du site</h3>
//                   <div className="flex items-center gap-2 text-sm text-slate-600">
//                     <Building2 size={16} />
//                     <span>ID : {site?.id ?? "—"}</span>
//                   </div>
//                   {site?.adresse && (
//                     <div className="flex items-center gap-2 text-sm text-slate-600">
//                       <MapPin size={16} />
//                       <span>{site.adresse}</span>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>

//           {/* ── KPIs ── */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {isLoading ? (
//               [1, 2, 3, 4].map((i) => (
//                 <div key={i} className="h-24 bg-white rounded-2xl border animate-pulse" />
//               ))
//             ) : (
//               <>
//                 <StatsCard
//                   label="Total patrimoines"
//                   value={assetStats?.total ?? 0}
//                   delta=""
//                   trend="up"
//                 />
//                 <StatsCard
//                   label="Actifs"
//                   value={assetStats?.active ?? 0}
//                   delta=""
//                   trend="up"
//                 />
//                 <StatsCard
//                   label="En maintenance"
//                   value={assetStats?.in_maintenance ?? 0}
//                   delta=""
//                   trend="up"
//                 />
//                 <StatsCard
//                   label="Valeur totale"
//                   value={formatMontant(assetStats?.total_value)}
//                   delta=""
//                   trend="up"
//                 />
//               </>
//             )}
//           </div>

//           {/* ── ACTIONS ── */}
//           <div className="flex justify-end gap-3">
//             <button
//               onClick={exportSite}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
//             >
//               <Upload size={16} /> Exporter site
//             </button>
//             <button
//               onClick={exportAssets}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
//             >
//               <Download size={16} /> Exporter patrimoine
//             </button>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
//             >
//               <Building2 size={16} /> Ajouter un patrimoine
//             </button>
//           </div>

//           {/* ── TABLE PATRIMOINES ── */}
//           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//             {loadingAssets ? (
//               <div className="p-12 text-center text-slate-400 text-sm">
//                 Chargement du patrimoine...
//               </div>
//             ) : (
//               <>
//                 <DataTable
//                   columns={columns}
//                   data={assets}
//                   title="Patrimoines du site"
//                   onViewAll={() => {}}
//                 />
//                 <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
//                   <p className="text-xs text-slate-400">
//                     Page {filters.page ?? 1} sur {meta?.last_page ?? 1} · {meta?.total ?? 0} éléments
//                   </p>
//                   <Paginate
//                     currentPage={filters.page ?? 1}
//                     totalPages={meta?.last_page ?? 1}
//                     onPageChange={(page) => setFilters({ page })}
//                   />
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ── APERÇU ASSET (side panel léger) ── */}
//           {selectedAsset && (
//             <>
//               <div
//                 className="fixed inset-0 bg-black/20 z-40"
//                 onClick={() => setSelectedAsset(null)}
//               />
//               <div className="fixed right-0 top-0 h-full w-[420px] bg-white z-50 shadow-2xl rounded-l-3xl flex flex-col overflow-hidden">
//                 <div className="p-6 border-b space-y-1">
//                   <button
//                     onClick={() => setSelectedAsset(null)}
//                     className="text-xs text-slate-400 hover:text-black mb-2"
//                   >
//                     ✕ Fermer
//                   </button>
//                   <h2 className="text-2xl font-black">{selectedAsset.designation}</h2>
//                   <span
//                     className={`inline-block px-3 py-1 rounded border text-xs font-bold ${STATUS_STYLE[selectedAsset.status] ?? ""}`}
//                   >
//                     {STATUS_LABEL[selectedAsset.status] ?? selectedAsset.status}
//                   </span>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
//                   {[
//                     { label: "ID",            value: `#${selectedAsset.id}` },
//                     { label: "Codification",  value: selectedAsset.code ?? selectedAsset.serial_number ?? "—" },
//                     { label: "Type",          value: selectedAsset.typeAsset?.name ?? "—" },
//                     { label: "Sous-type",     value: selectedAsset.subTypeAsset?.name ?? "—" },
//                     { label: "Date d'entrée", value: formatDate(selectedAsset.acquisition_date) },
//                     { label: "Valeur",        value: formatMontant(selectedAsset.acquisition_value) },
//                     { label: "Site",          value: selectedAsset.site?.nom ?? "—" },
//                   ].map(({ label, value }) => (
//                     <div key={label} className="flex justify-between border-b border-slate-50 pb-2">
//                       <span className="text-slate-400 font-medium">{label}</span>
//                       <span className="font-bold text-slate-800">{value}</span>
//                     </div>
//                   ))}
//                   {selectedAsset.description && (
//                     <div className="bg-slate-50 rounded-xl p-4 text-slate-600 text-sm">
//                       {selectedAsset.description}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </main>
//       </div>

//       {/* Modal ajout patrimoine — réservé administration */}
//       <ReusableForm
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Ajouter un patrimoine"
//         subtitle="La gestion du patrimoine est réservée à l'administration"
//         fields={assetFields}
//         initialValues={{}}
//         onSubmit={() => {
//           setIsModalOpen(false);
//         }}
//         submitLabel="Enregistrer"
//       />
//     </div>
//   );
// }