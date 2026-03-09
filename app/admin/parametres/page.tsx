"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Settings2, ShieldCheck, ChevronRight, X,
  Bell, Activity, Globe, Clock, Check, Pencil,
  Mail, Phone, Lock, Languages,
  Zap, Radio, Users, Palette, ArrowRight,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import ThemePicker from "@/components/ThemePicker";
import { authService } from "../../../services/AuthService";

const AVATAR_COLORS = [
  { id: "1",  bg: "bg-slate-900"  }, { id: "2",  bg: "bg-rose-600"    },
  { id: "3",  bg: "bg-blue-600"   }, { id: "4",  bg: "bg-emerald-600" },
  { id: "5",  bg: "bg-amber-500"  }, { id: "6",  bg: "bg-violet-600"  },
  { id: "7",  bg: "bg-cyan-600"   }, { id: "8",  bg: "bg-pink-600"    },
  { id: "9",  bg: "bg-orange-500" }, { id: "10", bg: "bg-teal-600"    },
  { id: "11", bg: "bg-indigo-600" }, { id: "12", bg: "bg-lime-600"    },
];

const LANGS = [
  { code: "fr", flag: "🇫🇷", label: "Français", dir: "ltr" },
  { code: "en", flag: "🇬🇧", label: "English",  dir: "ltr" },
  { code: "ar", flag: "🇸🇦", label: "العربية",  dir: "rtl" },
];

const NOTIFS = [
  { key: "tickets_new",  Icon: Zap,      fr: "Nouveaux tickets créés",    en: "New tickets created", defaultOn: true  },
  { key: "tickets_late", Icon: Clock,    fr: "Tickets en retard",         en: "Overdue tickets",     defaultOn: true  },
  { key: "planning",     Icon: Radio,    fr: "Modifications de planning", en: "Schedule changes",    defaultOn: false },
  { key: "providers",    Icon: Users,    fr: "Nouveaux prestataires",     en: "New providers",       defaultOn: false },
  { key: "reports",      Icon: Activity, fr: "Rapports hebdomadaires",    en: "Weekly reports",      defaultOn: true  },
];

const ROLE_MAP: Record<string, { label: string; style: string; dot: string }> = {
  "super-admin": { label: "Super Administrateur", style: "bg-theme-primary text-white",                               dot: "bg-white"       },
  "admin":       { label: "Administrateur",        style: "bg-slate-100 text-slate-700 border border-slate-200",      dot: "bg-slate-500"   },
  "manager":     { label: "Manager",               style: "bg-blue-50 text-blue-700 border border-blue-200",          dot: "bg-blue-500"    },
  "provider":    { label: "Prestataire",            style: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
};

const TRACK_LOGS = [
  { user: "super-admin@canal.com", action: "Connexion admin",         page: "Dashboard",   time: "17:12", today: true  },
  { user: "admin@canal.com",       action: "Modification ticket #42", page: "Tickets",     time: "15:48", today: true  },
  { user: "jean.dupont@canal.com", action: "Consultation planning",   page: "Planning",    time: "14:30", today: true  },
  { user: "marie.curie@canal.com", action: "Ajout patrimoine",        page: "Patrimoines", time: "09:15", today: false },
  { user: "paul.l@canal.com",      action: "Création devis #18",      page: "Devis",       time: "08:50", today: false },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${on ? "bg-theme-primary" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Side Panel ───────────────────────────────────────────────────────────────
type PanelType = "profile" | "advanced" | null;

function SettingsSidePanel({
  open, type, advTab, setAdvTab, onClose,
  firstName, lastName, email, phone,
  avatarId, setAvatarId, form, setForm, onSaveProfile,
  lang, setLang, applyLang, trackOn, setTrackOn,
  notifs, setNotifs, onSaveAdvanced,
}: {
  open: boolean; type: PanelType; advTab: string; setAdvTab: (t: string) => void; onClose: () => void;
  firstName: string; lastName: string; email: string; phone: string;
  avatarId: string; setAvatarId: (id: string) => void;
  form: any; setForm: (f: any) => void; onSaveProfile: () => void;
  lang: string; setLang: (l: string) => void; applyLang: (l: string) => void;
  trackOn: boolean; setTrackOn: (v: boolean) => void;
  notifs: Record<string, boolean>; setNotifs: (n: any) => void; onSaveAdvanced: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  useEffect(() => { if (!open) setShowPicker(false); }, [open]);

  const av = AVATAR_COLORS.find(a => a.id === avatarId) ?? AVATAR_COLORS[0];
  const getInitials = () => `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  if (!open) return null;

  const activeNotifCount = Object.values(notifs).filter(Boolean).length;
  const advTabs = [
    { key: "notifications", Icon: Bell,      label: "Notifs"      },
    { key: "tracking",      Icon: Activity,  label: "Traçabilité" },
    { key: "language",      Icon: Languages, label: "Langue"      },
    { key: "appearance",    Icon: Palette,   label: "Apparence"   },
  ] as const;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[500px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        <div className="h-1 bg-theme-primary shrink-0" />
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {type === "profile" ? "Modifier le profil" : "Paramètres avancés"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {type === "profile" ? "Vos informations personnelles" : "Personnalisez votre expérience"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <X size={17} className="text-slate-400" />
          </button>
        </div>

        {/* PROFILE */}
        {type === "profile" && (
          <>
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={`w-16 h-16 rounded-2xl ${av.bg} flex items-center justify-center shadow-md shrink-0`}>
                  <span className="text-white font-black text-xl">{getInitials()}</span>
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-sm">Avatar</p>
                  <p className="text-xs text-slate-400 mt-0.5">Choisissez une couleur</p>
                  <button onClick={() => setShowPicker(!showPicker)}
                    className="mt-1.5 text-xs font-bold text-theme-primary hover:opacity-70 flex items-center gap-1 transition">
                    {showPicker ? "Fermer" : "Changer"} <ArrowRight size={10} />
                  </button>
                </div>
              </div>

              {showPicker && (
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  {AVATAR_COLORS.map(a => (
                    <button key={a.id}
                      onClick={() => { setAvatarId(a.id); localStorage.setItem("avatarId", a.id); }}
                      className={`w-9 h-9 rounded-xl ${a.bg} transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${avatarId === a.id ? "ring-2 ring-offset-2 ring-theme-primary scale-110" : ""}`}>
                      {avatarId === a.id && <Check size={13} className="text-white" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "first_name", label: "Prénom",    Icon: User,  type: "text",  ph: "Votre prénom"     },
                  { key: "last_name",  label: "Nom",       Icon: User,  type: "text",  ph: "Votre nom"        },
                  { key: "email",      label: "Email",     Icon: Mail,  type: "email", ph: "email@canal.com"  },
                  { key: "phone",      label: "Téléphone", Icon: Phone, type: "tel",   ph: "+225 00 00 00 00" },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <f.Icon size={9} /> {f.label}
                    </label>
                    <input type={f.type} value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition" />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-7 py-5 border-t border-slate-100 flex gap-3 shrink-0">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Annuler</button>
              <button onClick={onSaveProfile} className="flex-1 py-3 rounded-xl bg-theme-primary text-white text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                <Check size={14} /> Enregistrer
              </button>
            </div>
          </>
        )}

        {/* ADVANCED */}
        {type === "advanced" && (
          <>
            <div className="px-7 pt-5 shrink-0">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
                {advTabs.map(tb => {
                  const { Icon } = tb;
                  const active = advTab === tb.key;
                  return (
                    <button key={tb.key} onClick={() => setAdvTab(tb.key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-black transition ${active ? "bg-white text-theme-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                      <Icon size={11} /> {tb.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-5">
              {advTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeNotifCount}/{NOTIFS.length} activées</p>
                    <button onClick={() => { const allOn = Object.values(notifs).every(Boolean); setNotifs(Object.fromEntries(NOTIFS.map(n => [n.key, !allOn]))); }}
                      className="text-xs font-bold text-theme-primary hover:opacity-70 transition">
                      {Object.values(notifs).every(Boolean) ? "Tout désactiver" : "Tout activer"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {NOTIFS.map(n => { const { Icon } = n; return (
                      <div key={n.key} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"><Icon size={13} className="text-slate-400" /></div>
                        <p className="font-semibold text-slate-800 text-sm flex-1">{lang === "en" ? n.en : n.fr}</p>
                        <Toggle on={notifs[n.key]} onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })} />
                      </div>
                    ); })}
                  </div>
                </div>
              )}

              {advTab === "tracking" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><Activity size={15} className="text-emerald-600" /></div>
                      <div><p className="font-black text-slate-900 text-sm">Traçabilité globale</p><p className="text-xs text-slate-400 mt-0.5">Enregistre toutes les actions</p></div>
                    </div>
                    <Toggle on={trackOn} onChange={() => setTrackOn(!trackOn)} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={10} /> Journal récent</p>
                  <div className="space-y-1.5">
                    {TRACK_LOGS.map((log, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                        <div className="w-7 h-7 rounded-full bg-theme-primary flex items-center justify-center shrink-0"><span className="text-[10px] font-black text-white">{log.user[0].toUpperCase()}</span></div>
                        <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-900 truncate">{log.user}</p><p className="text-[10px] text-slate-400 truncate">{log.action} · {log.page}</p></div>
                        <div className="flex items-center gap-1 shrink-0">{log.today && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}<span className="text-[10px] text-slate-400">{log.today ? "Auj. " : "Hier "}{log.time}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {advTab === "language" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Langue de l'interface</p>
                  {LANGS.map(l => { const active = lang === l.code; return (
                    <button key={l.code} onClick={() => { setLang(l.code); applyLang(l.code); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition ${active ? "border-theme-primary bg-theme-light" : "border-slate-100 hover:border-slate-200"}`}>
                      <span className="text-2xl shrink-0">{l.flag}</span>
                      <p className={`font-bold text-sm flex-1 text-left ${active ? "text-theme-primary" : "text-slate-600"}`}>{l.label}</p>
                      {active && <span className="flex items-center gap-1 bg-theme-primary text-white px-2.5 py-1 rounded-full text-[10px] font-black"><Check size={9} /> Actif</span>}
                    </button>
                  ); })}
                </div>
              )}

              {advTab === "appearance" && <ThemePicker />}
            </div>

            <div className="px-7 py-5 border-t border-slate-100 shrink-0">
              <button onClick={onSaveAdvanced} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-theme-primary text-white text-sm font-bold hover:opacity-90 transition">
                <Check size={14} /> Enregistrer les préférences
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ParametresPage() {
  const router = useRouter();

  const [panel,    setPanel]    = useState<PanelType>(null);
  const [advTab,   setAdvTab]   = useState("notifications");
  const [avatarId, setAvatarId] = useState("1");
  const [lang,     setLang]     = useState("fr");
  const [trackOn,  setTrackOn]  = useState(true);
  const [notifs,   setNotifs]   = useState<Record<string, boolean>>(Object.fromEntries(NOTIFS.map(n => [n.key, n.defaultOn])));
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [role,      setRole]      = useState("admin");
  const [form,      setForm]      = useState<any>({});

  useEffect(() => {
    const user = authService.getCurrentUser?.();
    if (user) {
      setFirstName(user.first_name ?? ""); setLastName(user.last_name ?? "");
      setEmail(user.email ?? ""); setPhone(user.phone ?? ""); setRole(user.role ?? "admin");
      setForm({ first_name: user.first_name ?? "", last_name: user.last_name ?? "", email: user.email ?? "", phone: user.phone ?? "" });
    }
    const savedAvatar = localStorage.getItem("avatarId"); if (savedAvatar) setAvatarId(savedAvatar);
    const savedLang   = localStorage.getItem("lang");     if (savedLang)   setLang(savedLang);
  }, []);

  const applyLang          = (code: string) => localStorage.setItem("lang", code);
  const handleSaveProfile  = () => { setFirstName(form.first_name ?? firstName); setLastName(form.last_name ?? lastName); setEmail(form.email ?? email); setPhone(form.phone ?? phone); setPanel(null); };
  const handleSaveAdvanced = () => setPanel(null);
  const openAdvanced       = (tab: string) => { setAdvTab(tab); setPanel("advanced"); };

  const av       = AVATAR_COLORS.find(a => a.id === avatarId) ?? AVATAR_COLORS[0];
  const roleInfo = ROLE_MAP[role] ?? ROLE_MAP["admin"];
  const activeNotifCount = Object.values(notifs).filter(Boolean).length;
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "—";

  const advTiles = [
    { key: "notifications", Icon: Bell,     label: "Notifications", sub: `${activeNotifCount}/${NOTIFS.length} activées`, accent: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-100"   },
    { key: "tracking",      Icon: Activity, label: "Traçabilité",   sub: trackOn ? "Active" : "Désactivée",               accent: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { key: "language",      Icon: Globe,    label: "Langue",        sub: LANGS.find(l => l.code === lang)?.label ?? "Français", accent: "text-sky-500", bg: "bg-sky-50",   border: "border-sky-100"     },
    { key: "appearance",    Icon: Palette,  label: "Apparence",     sub: "Thème de couleur",                               accent: "text-purple-500",  bg: "bg-purple-50",  border: "border-purple-100"  },
  ] as const;

  return (
    <div className="flex h-screen bg-[#f4f5f7] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto pt-[73px]">
          <div className="px-8 py-8 max-w-4xl mx-auto space-y-5">

            <PageHeader title="Paramètres" subtitle="Gérez votre compte et vos préférences" />

            {/* ── PROFIL ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-theme-primary w-full" />
              <div className="p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-2xl ${av.bg} flex items-center justify-center shadow-lg shrink-0`}>
                      <span className="text-white font-black text-2xl">{`${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?"}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <h2 className="text-xl font-black text-slate-900">{fullName}</h2>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black ${roleInfo.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dot}`} />
                          {roleInfo.label}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {email || "—"}</p>
                      {phone && <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5"><Phone size={11} className="text-slate-300" /> {phone}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => { setForm({ first_name: firstName, last_name: lastName, email, phone }); setPanel("profile"); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-primary text-white text-sm font-bold hover:opacity-90 transition shrink-0 shadow-sm"
                  >
                    <Pencil size={13} /> Modifier
                  </button>
                </div>
              </div>
            </div>

            {/* ── PARAMÈTRES AVANCÉS 2×2 ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Settings2 size={13} className="text-slate-500" />
                </div>
                <span className="text-sm font-black text-slate-700">Paramètres avancés</span>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                {advTiles.map(tile => {
                  const { Icon } = tile;
                  return (
                    <button key={tile.key} onClick={() => openAdvanced(tile.key)}
                      className="group relative flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:shadow-md transition-all duration-200 text-left overflow-hidden"
                    >
                      <div className={`absolute inset-0 ${tile.bg} opacity-0 group-hover:opacity-20 transition-opacity duration-200`} />
                      <div className={`relative w-11 h-11 rounded-xl ${tile.bg} border ${tile.border} flex items-center justify-center shrink-0`}>
                        <Icon size={18} className={tile.accent} />
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm">{tile.label}</p>
                        <p className={`text-xs mt-0.5 font-semibold truncate ${tile.accent}`}>{tile.sub}</p>
                      </div>
                      <ChevronRight size={14} className="relative text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── SÉCURITÉ ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ShieldCheck size={13} className="text-slate-500" />
                </div>
                <span className="text-sm font-black text-slate-700">Sécurité</span>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { Icon: Lock,        label: "Changer le mot de passe",           sub: "Dernière modification il y a 30 jours",         badge: null },
                  { Icon: ShieldCheck, label: "Authentification à deux facteurs",   sub: "Protégez votre compte avec un second facteur",  badge: { text: "Non configurée", color: "bg-red-50 text-red-500 border border-red-100" } },
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center gap-4 px-7 py-5 hover:bg-slate-50/80 transition group text-left">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-slate-200 transition">
                      <item.Icon size={15} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${item.badge.color}`}>{item.badge.text}</span>
                    )}
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>

      <SettingsSidePanel
        open={panel !== null} type={panel} advTab={advTab} setAdvTab={setAdvTab} onClose={() => setPanel(null)}
        firstName={firstName} lastName={lastName} email={email} phone={phone}
        avatarId={avatarId} setAvatarId={setAvatarId} form={form} setForm={setForm} onSaveProfile={handleSaveProfile}
        lang={lang} setLang={setLang} applyLang={applyLang} trackOn={trackOn} setTrackOn={setTrackOn}
        notifs={notifs} setNotifs={setNotifs} onSaveAdvanced={handleSaveAdvanced}
      />
    </div>
  );
}