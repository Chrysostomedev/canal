"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Settings, Key, Shield, Globe, Palette, ChevronRight, Clock, Plus, Trash2, Check, Activity, Loader2,
  User, Settings2, ShieldCheck, Pencil, Mail, Phone, Lock, Languages, Zap, Radio, Users, Building2, Truck, FolderSync, FileText
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import ThemePicker from "@/components/ThemePicker";
import { authService } from "../../../services/AuthService";
import { useNotifications } from "../../../hooks/admin/useNotifications";
import { useActivityLogs, ActivityLog } from "../../../hooks/common/useActivityLogs";
import ActivityDetailsModal from "../../components/ActivityDetailsModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { id: "1",  bg: "bg-slate-900"   }, { id: "2",  bg: "bg-rose-600"    },
  { id: "3",  bg: "bg-blue-600"    }, { id: "4",  bg: "bg-emerald-600" },
  { id: "5",  bg: "bg-amber-500"   }, { id: "6",  bg: "bg-violet-600"  },
  { id: "7",  bg: "bg-cyan-600"    }, { id: "8",  bg: "bg-pink-600"    },
];

const LANGS = [
  { code: "fr", flag: "FR", label: "Français" },
  { code: "en", flag: "EN", label: "English" },
];

const NOTIFS_LIST = [
  { key: "tickets_new",  Icon: Zap,      fr: "Nouveaux tickets créés",    en: "New tickets created"  },
  { key: "tickets_late", Icon: Clock,    fr: "Tickets en retard",         en: "Overdue tickets"      },
  { key: "planning",     Icon: Radio,    fr: "Modifications de planning", en: "Schedule changes"     },
  { key: "providers",    Icon: Users,    fr: "Nouveaux prestataires",     en: "New providers"        },
  { key: "reports",      Icon: Activity, fr: "Rapports hebdomadaires",    en: "Weekly reports"       },
];

const ROLE_MAP: Record<string, { label: string; style: string; dot: string }> = {
  "super-admin": { label: "Super Administrateur", style: "bg-slate-900 text-white",                              dot: "bg-white"        },
  "admin":       { label: "Administrateur",        style: "bg-slate-100 text-slate-800 border border-slate-200", dot: "bg-slate-700"    },
  "manager":     { label: "Manager",               style: "bg-blue-50 text-blue-800 border border-blue-200",     dot: "bg-blue-600"     },
  "provider":    { label: "Prestataire",            style: "bg-emerald-50 text-emerald-800 border border-emerald-200", dot: "bg-emerald-600" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParametresPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"compte" | "notifs" | "admin" | "security">("compte");

  // User States
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [role,      setRole]      = useState("admin");
  const [avatarId,  setAvatarId]  = useState("1");
  const [lang,      setLang]      = useState("fr");
  const [notifs,    setNotifs]    = useState<Record<string, boolean>>({});

  const { logs: activityLogs, loading: isLoadingLogs, error: logsError } = useActivityLogs();
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    setFirstName(authService.getFirstName() || "");
    setLastName(authService.getLastName() || "");
    setEmail(authService.getEmail() || "");
    setRole(authService.getRole() || "admin");
    
    const savedAvatar = localStorage.getItem("avatarId") || "1";
    setAvatarId(savedAvatar);
    const savedLang = localStorage.getItem("lang") || "fr";
    setLang(savedLang);
    
    // Initial notifs (mock)
    setNotifs({ tickets_new: true, tickets_late: true, planning: false, providers: false, reports: true });
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for update (UI focus for now)
    toast("Profil mis à jour avec succès");
  };

  const dashboardTabs = [
    { id: "compte",   label: "Mon Compte",    icon: User },
    { id: "notifs",   label: "Notifications", icon: Bell },
    { id: "admin",    label: "Administration", icon: Shield },
    { id: "security", label: "Sécurité",      icon: Lock },
  ];

  const adminTiles = [
    { label: "Gestion des Rôles",  sub: "Permissions & Accès",    icon: <ShieldCheck size={18} />, href: "/admin/roles",       accent: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Prestataires",       sub: "Gestion des contrats",   icon: <Users size={18} />,       href: "/admin/prestataires", accent: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Fournisseurs",       sub: "Base de données tiers",  icon: <Truck size={18} />,       href: "/admin/fournisseurs", accent: "text-amber-600",   bg: "bg-amber-50" },
    { label: "Pays & Services",    sub: "Référentiels globaux",   icon: <Globe size={18} />,       href: "/admin/services",     accent: "text-sky-600",     bg: "bg-sky-50" },
    { label: "Types de Patrimoine", sub: "Structure des actifs",   icon: <Building2 size={18} />,   href: "/admin/patrimoines",  accent: "text-rose-600",    bg: "bg-rose-50" },
    { label: "Transferts",         sub: "Mouvements inter-sites", icon: <FolderSync size={18} />,  href: "/admin/transfert",    accent: "text-violet-600",  bg: "bg-violet-50" },
    { label: "Audit Trail",        sub: "Journal de sécurité",    icon: <FileText size={18} />,    href: "/admin/audit",        accent: "text-slate-600",   bg: "bg-slate-50" },
  ];

  const av = AVATAR_COLORS.find(a => a.id === avatarId) ?? AVATAR_COLORS[0];
  const roleInfo = ROLE_MAP[role] ?? ROLE_MAP["admin"];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {/* Header section with Tabs */}
          <div className="bg-white border-b border-slate-200 px-8 pt-8 pb-0 shrink-0 sticky top-0 z-10">
            <PageHeader title="Paramètres" subtitle="Configuration de votre espace et de votre compte" />
            
            <div className="flex gap-8 mt-6">
              {dashboardTabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 pb-4 text-sm font-black transition relative ${
                      active ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {tab.id === 'notifs' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8 max-w-6xl mx-auto">
            {/* ── COMPTE ── */}
            {activeTab === "compte" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-2 space-y-8">
                  {/* Card Profile */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                       <User size={18} /> Informations Personnelles
                    </h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdateProfile}>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Prénom</label>
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-1 focus:ring-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Nom</label>
                        <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-1 focus:ring-slate-900" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Adresse Email</label>
                        <input value={email} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed" />
                      </div>
                      <div className="md:col-span-2 flex justify-end pt-4">
                        <button type="submit" className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center gap-2 shadow-lg hover:shadow-black/20">
                          <Check size={18} /> Mettre à jour mon profil
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Card Appearance */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                       <Palette size={18} /> Personnalisation visuelle
                    </h3>
                    <ThemePicker />
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Status Sidebar */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
                    <div className={`w-24 h-24 rounded-3xl ${av.bg} mx-auto flex items-center justify-center shadow-2xl mb-6 ring-4 ring-slate-50`}>
                      <span className="text-white font-black text-3xl">{firstName?.[0] || "?"}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900">{firstName} {lastName}</h4>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black mt-3 ${roleInfo.style}`}>
                      {roleInfo.label}
                    </span>
                    
                    <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight">Langue</p>
                        <p className="text-slate-900 font-bold text-sm mt-1">{lang === 'fr' ? 'FR' : 'EN'}</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight">Avatar</p>
                        <div className="flex justify-center mt-1">
                          <span className={`w-4 h-4 rounded-full ${av.bg}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Mini-Widget */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Clock size={12} /> Dernières activités
                     </p>
                     <div className="space-y-4">
                        {isLoadingLogs ? (
                          <div className="py-4 text-center text-slate-400 text-xs font-medium">Chargement...</div>
                        ) : activityLogs?.slice(0, 3).map((log, i) => (
                           <div key={i} className="flex gap-3 group items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                              <div className="min-w-0">
                                 <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">{log.action}</p>
                                 <p className="text-[9px] text-slate-400 mt-0.5">{new Date(log.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === "notifs" && (
              <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-50">
                    <h3 className="text-lg font-black text-slate-900">Abonnements aux notifications</h3>
                    <p className="text-slate-400 text-sm mt-1">Choisissez les événements pour lesquels vous souhaitez être informé</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {NOTIFS_LIST.map((n) => (
                      <div key={n.key} className="flex items-center gap-6 px-8 py-5 hover:bg-slate-50 transition group">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                           <n.Icon size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-sm">{n.fr}</h4>
                          <p className="text-xs text-slate-400 mt-1">Envoi d'une alerte en temps réel via l'interface et email</p>
                        </div>
                        <button
                          onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                          className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-300 ${notifs[n.key] ? 'bg-slate-900' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${notifs[n.key] ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-8 py-6 bg-slate-50 flex justify-end">
                    <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg">
                      Enregistrer les préférences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── ADMINISTRATION ── */}
            {activeTab === "admin" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {adminTiles.map((tile, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(tile.href)}
                      className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 text-left"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${tile.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <span className={tile.accent}>{tile.icon}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-lg mb-1">{tile.label}</h4>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{tile.sub}</p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest pt-4 border-t border-slate-50 group-hover:gap-3 transition-all duration-300">
                        Accéder <ChevronRight size={14} className="opacity-50 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === "security" && (
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                       <Lock size={18} /> Changement de mot de passe
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Ancien mot de passe</label>
                         <input type="password" className="w-full px-4 py-3 border-b-2 border-slate-100 bg-transparent focus:border-slate-900 focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Nouveau mot de passe</label>
                         <input type="password" className="w-full px-4 py-3 border-b-2 border-slate-100 bg-transparent focus:border-slate-900 focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Confirmer le nouveau mot de passe</label>
                         <input type="password" className="w-full px-4 py-3 border-b-2 border-slate-100 bg-transparent focus:border-slate-900 focus:outline-none transition-colors" />
                      </div>
                      <div className="pt-4">
                        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg">
                          Mettre à jour la sécurité
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-rose-50 rounded-3xl border border-rose-100 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0">
                      <ShieldCheck size={28} className="text-rose-600" />
                    </div>
                    <div>
                       <h4 className="font-black text-rose-900">Authentification à deux facteurs</h4>
                       <p className="text-rose-700/70 text-xs mt-1">Ajoutez une couche de sécurité supplémentaire à votre compte en activant la 2FA (Bientôt disponible).</p>
                    </div>
                    <button disabled className="px-6 py-2 bg-rose-200 text-rose-800 rounded-lg text-xs font-black cursor-not-allowed uppercase shrink-0">Activer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ActivityDetailsModal 
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        log={selectedLog}
      />
      
      {/* Toast Mock (should use a library like sonner) */}
      <style jsx global>{`
        .animate-in {
          animation: enter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function toast(msg: string) {
  console.log(msg); // Placeholder for actual toast
}
