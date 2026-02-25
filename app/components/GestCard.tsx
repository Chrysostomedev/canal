"use client";

/**
 * GestCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Carte gestionnaire (Manager) — UI soft, créatif et moderne.
 * Inspiré de PrestCard mais avec une identité visuelle propre :
 *  - Palette douce avec accent coloré selon le statut
 *  - Avatar avec initiales colorées dynamiquement
 *  - Badge de rôle avec icône
 *  - Micro-animations au hover
 *  - Zone contact épurée
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { MapPin, Phone, Mail, ShieldCheck, UserCircle2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ── Palette d'avatars — attribuée par index pour varier les couleurs ──────────
const AVATAR_PALETTES = [
  { bg: "bg-violet-100", text: "text-violet-600", ring: "ring-violet-200" },
  { bg: "bg-sky-100",    text: "text-sky-600",    ring: "ring-sky-200"    },
  { bg: "bg-emerald-100",text: "text-emerald-600",ring: "ring-emerald-200"},
  { bg: "bg-rose-100",   text: "text-rose-600",   ring: "ring-rose-200"   },
  { bg: "bg-amber-100",  text: "text-amber-600",  ring: "ring-amber-200"  },
  { bg: "bg-teal-100",   text: "text-teal-600",   ring: "ring-teal-200"   },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface GestCardProps {
  id: number;                        // id réel du gestionnaire
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;                     // ex: "MANAGER", "Chef de site", etc.
  site?: string;                     // Nom du site géré (optionnel — préparé pour future API)
  status: "Actif" | "Inactif";
  avatar?: string;                   // URL photo profil optionnelle
  paletteIndex?: number;             // Pour choisir la couleur d'avatar (défaut: basé sur id)
  onProfilClick?: () => void;        // Ouvre le modal profil
  onDetailsClick?: () => void;       // Navigation vers la page détails
}

export default function GestCard({
  id,
  firstName,
  lastName,
  email,
  phone,
  role = "Manager",
  site,
  status,
  avatar,
  paletteIndex,
  onProfilClick,
  onDetailsClick,
}: GestCardProps) {

  // ── URL page détails ───────────────────────────────────────────────────────
  const detailUrl = `/admin/gestionnaires/details/${id}`;

  // ── Palette couleur avatar (basée sur id si paletteIndex non fourni) ────────
  const palette = AVATAR_PALETTES[(paletteIndex ?? id) % AVATAR_PALETTES.length];

  // ── Initiales sécurisées ───────────────────────────────────────────────────
  const initials = [
    firstName?.charAt(0)?.toUpperCase(),
    lastName?.charAt(0)?.toUpperCase(),
  ]
    .filter(Boolean)
    .join("") || "?";

  // ── Nom complet ────────────────────────────────────────────────────────────
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Gestionnaire";

  return (
    <div
      className={`
        relative bg-white rounded-[28px] p-5 border shadow-sm
        hover:shadow-lg hover:-translate-y-1
        transition-all duration-300 ease-out
        flex flex-col gap-5 overflow-hidden
        ${status === "Actif"
          ? "border-slate-100"
          : "border-slate-100 opacity-80"
        }
      `}
    >
      {/* ── Accent décoratif en arrière-plan ──────────────────────────────── */}
      <div
        className={`
          absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.06] pointer-events-none
          ${palette.bg.replace("bg-", "bg-")}
        `}
        aria-hidden="true"
      />

      {/* ── Header : Avatar + Nom + Statut ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div
            className={`
              w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center
              ring-2 ${palette.ring} ${palette.bg} flex-shrink-0
            `}
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={fullName}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className={`text-lg font-black ${palette.text}`}>
                {initials}
              </span>
            )}
          </div>

          {/* Nom + Rôle */}
          <div>
            <h3 className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">
              {fullName}
            </h3>

            {/* Badge rôle */}
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck size={12} className={palette.text} />
              <span className={`text-[11px] font-bold ${palette.text} uppercase tracking-wider`}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Badge statut */}
        <span
          className={`
            px-3 py-1 rounded-full text-[10px] font-bold tracking-widest flex-shrink-0
            ${status === "Actif"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-400 border border-slate-200"
            }
          `}
        >
          {status}
        </span>
      </div>

      {/* ── Divider décoratif ─────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

      {/* ── Bloc contact ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">

        {/* Email */}
        <div className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
            <Mail size={13} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <span className="text-[13px] text-slate-600 font-medium truncate">
            {email || "—"}
          </span>
        </div>

        {/* Téléphone */}
        <div className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
            <Phone size={13} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <span className="text-[13px] text-slate-600 font-medium">
            {phone || "—"}
          </span>
        </div>

        {/*
         * ── Site géré — commenté car pas encore géré côté Backend ──────────
         * TODO: Décommenter quand l'API retournera le site associé au manager
         * (ex: manager.site?.name ou manager.managed_site)
         *
         * {site && (
         *   <div className="flex items-center gap-2.5 group">
         *     <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
         *       <MapPin size={13} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
         *     </div>
         *     <span className="text-[13px] text-slate-600 font-medium truncate">
         *       {site}
         *     </span>
         *   </div>
         * )}
         *
         * ── Fallback visuel si site défini (commenté) ──
         */}

        {/* Site — affiché si disponible (préparé pour l'API future) */}
        {site && (
          <div className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
              <MapPin size={13} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
            </div>
            <span className="text-[13px] text-slate-600 font-medium truncate">
              {site}
            </span>
          </div>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex gap-2.5 pt-1">

        {/* Profil → ouvre le modal profil */}
        <button
          onClick={onProfilClick}
          className={`
            flex-1 flex items-center justify-center gap-2
            py-3 rounded-2xl text-[13px] font-bold
            border-2 border-slate-100 text-slate-700
            hover:border-slate-300 hover:bg-slate-50
            transition-all duration-200
          `}
        >
          <UserCircle2 size={15} />
          Profil
        </button>

        {/* Détails → navigue vers details/[id] */}
        <Link
          href={detailUrl}
          onClick={onDetailsClick}
          className={`
            flex-1 flex items-center justify-center gap-2
            py-3 rounded-2xl text-[13px] font-bold
            text-white
            transition-all duration-200
            ${palette.bg.replace("bg-", "bg-").replace("-100", "-600")}
            hover:opacity-90 hover:shadow-md
          `}
          style={{
            // Tailwind ne peut pas générer dynamiquement les classes de couleur,
            // on surcharge avec un style inline sur la variante active
          }}
        >
          <ExternalLink size={15} />
          Détails
        </Link>
      </div>
    </div>
  );
}