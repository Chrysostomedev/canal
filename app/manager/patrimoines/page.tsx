"use client";

import Link from "next/link";
import {
  ChevronLeft, MapPin, Zap,
  Shield, Calendar, TrendingDown, AlertTriangle,
  Clock, CheckCircle, ArrowRightLeft, Eye,
} from "lucide-react";

import Navbar     from "@/components/Navbar";
import Sidebar    from "@/components/Sidebar";
import StatsCard  from "@/components/StatsCard";

// ─────────────────────────────────────────
// DATA STATIQUE (remplace API)
// ─────────────────────────────────────────

const asset = {
  id: 1024,
  designation: "Groupe électrogène industriel",
  codification: "GEN-0024",
  status: "actif",
  criticite: "critique",
  date_entree: "2022-03-10",
  created_at: "2022-02-25",
  valeur_entree: 8500000,
  description: "<p>Groupe électrogène principal utilisé pour alimenter le site en cas de coupure.</p>",
  type: { name: "Énergie" },
  subType: { name: "Générateur" },
  site: { id: 1, nom: "Site Abidjan Nord" },
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const fmtMontant = (v?: number | null) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M FCFA`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K FCFA`;
  return `${v} FCFA`;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR");
};

const fmtDateLong = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// ─────────────────────────────────────────
// CALCUL AMORTISSEMENT
// ─────────────────────────────────────────

const computeAmort = (asset: any) => {

  const dureeVieMois = 60;

  const dateEntree = new Date(asset.date_entree);

  const dateFin = new Date(dateEntree);

  dateFin.setMonth(dateFin.getMonth() + dureeVieMois);

  const today = new Date();

  const totalDays = Math.ceil((dateFin.getTime() - dateEntree.getTime()) / 86400000);

  const elapsed = Math.ceil((today.getTime() - dateEntree.getTime()) / 86400000);

  const remaining = Math.ceil((dateFin.getTime() - today.getTime()) / 86400000);

  const pct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

  const residual = asset.valeur_entree * (1 - pct / 100);

  const alerte =
    remaining <= 0
      ? "expire"
      : remaining <= 90
      ? "warning_3m"
      : remaining <= 180
      ? "warning_6m"
      : "ok";

  return { dateEntree, dateFin, elapsed, remaining, pct, residual, alerte };
};

const amort = computeAmort(asset);

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

export default function PatrimoineDetailsPage() {

  const siteId = asset.site?.id;

  const kpis = [
    { label: "Valeur d'entrée", value: fmtMontant(asset.valeur_entree), trend: "up" as const },
    { label: "Valeur résiduelle", value: fmtMontant(amort.residual), trend: "down" as const },
    { label: "Jours restants", value: amort.remaining, trend: "up" as const },
    { label: "Consommé", value: `${Math.round(amort.pct)}%`, trend: "up" as const },
  ];

  return (

    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex flex-col flex-1 pl-64">

        <Navbar />

        <main className="mt-20 p-8 space-y-8">

        
          {/* HEADER */}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">

              <div className="space-y-3 flex-1">

                <div className="flex items-center gap-3 flex-wrap">

                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                    #{asset.id}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border border-green-400 bg-green-50 text-green-700">
                    Actif
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border border-orange-300 bg-orange-50 text-orange-700">
                    <Shield size={9} /> Critique
                  </span>

                </div>

                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {asset.designation}
                </h1>

                <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">

                  <span className="font-mono bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-700">
                    {asset.codification}
                  </span>

                  <Link
                    href={`/admin/sites/${siteId}`}
                    className="flex items-center gap-1.5"
                  >
                    <MapPin size={13} /> {asset.site.nom}
                  </Link>

                  <span className="flex items-center gap-1.5">
                    <Zap size={13} /> {asset.type.name} · {asset.subType.name}
                  </span>

                </div>

              </div>

             

            </div>

          </div>

          {/* KPI */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

            {kpis.map((k, i) => (
              <StatsCard key={i} {...k} />
            ))}

          </div>

          {/* FICHE TECHNIQUE */}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-1">

            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
              Fiche technique
            </h2>

            <div className="divide-y divide-slate-50">

              <div className="flex justify-between py-3">
                <p className="text-xs text-slate-400">Site</p>
                <p className="text-sm font-bold">{asset.site.nom}</p>
              </div>

              <div className="flex justify-between py-3">
                <p className="text-xs text-slate-400">Date d'entrée</p>
                <p className="text-sm font-bold">{fmtDateLong(asset.date_entree)}</p>
              </div>

              <div className="flex justify-between py-3">
                <p className="text-xs text-slate-400">Valeur</p>
                <p className="text-sm font-bold">{fmtMontant(asset.valeur_entree)}</p>
              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}