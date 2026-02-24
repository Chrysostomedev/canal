"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Settings2, ShieldCheck, ChevronRight, X,
  Sun, Moon, Monitor, Bell, Activity, Globe,
  Clock, Check, Pencil, Mail, Phone, Camera,
  Lock, Shield, Languages, Palette,
  Zap, Radio, Users, Key,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { authService } from "../../../services/AuthService";

// ═══════════════════════════════════════
// DONNÉES STATIQUES
// ═══════════════════════════════════════

const AVATAR_COLORS = [
  { id: "1",  bg: "bg-slate-900"   }, { id: "2",  bg: "bg-rose-600"    },
  { id: "3",  bg: "bg-blue-600"    }, { id: "4",  bg: "bg-emerald-600" },
  { id: "5",  bg: "bg-amber-500"   }, { id: "6",  bg: "bg-violet-600"  },
  { id: "7",  bg: "bg-cyan-600"    }, { id: "8",  bg: "bg-pink-600"    },
  { id: "9",  bg: "bg-orange-600"  }, { id: "10", bg: "bg-teal-600"    },
  { id: "11", bg: "bg-indigo-600"  }, { id: "12", bg: "bg-lime-600"    },
];

const LANGS = [
  { code: "fr", flag: "FR", label: "Français", dir: "ltr" },
  { code: "en", flag: "EN", label: "English",  dir: "ltr" },
  { code: "ar", flag: "AR", label: "العربية",  dir: "rtl" },
];

const NOTIFS = [
  { key: "tickets_new",  Icon: Zap,      fr: "Nouveaux tickets créés",    en: "New tickets created",  defaultOn: true  },
  { key: "tickets_late", Icon: Clock,    fr: "Tickets en retard",         en: "Overdue tickets",      defaultOn: true  },
  { key: "planning",     Icon: Radio,    fr: "Modifications de planning", en: "Schedule changes",     defaultOn: false },
  { key: "providers",    Icon: Users,    fr: "Nouveaux prestataires",     en: "New providers",        defaultOn: false },
  { key: "reports",      Icon: Activity, fr: "Rapports hebdomadaires",    en: "Weekly reports",       defaultOn: true  },
];

const ROLE_MAP: Record<string, { label: string; style: string; dot: string }> = {
  "super-admin": { label: "Super Administrateur", style: "bg-slate-900 text-white",                                   dot: "bg-white"       },
  "admin":       { label: "Administrateur",        style: "bg-slate-100 text-slate-800 border border-slate-200",      dot: "bg-slate-700"   },
  "manager":     { label: "Manager",               style: "bg-blue-50 text-blue-800 border border-blue-200",          dot: "bg-blue-600"    },
  "provider":    { label: "Prestataire",           style: "bg-emerald-50 text-emerald-800 border border-emerald-200", dot: "bg-emerald-600" },
};

const TRACK_LOGS = [
  { user: "super-admin@canal.com", action: "Connexion admin",         page: "Dashboard",   time: "17:12", today: true  },
  { user: "admin@canal.com",       action: "Modification ticket #42", page: "Tickets",     time: "15:48", today: true  },
  { user: "jean.dupont@canal.com", action: "Consultation planning",   page: "Planning",    time: "14:30", today: true  },
  { user: "marie.curie@canal.com", action: "Ajout patrimoine",        page: "Patrimoines", time: "09:15", today: false },
  { user: "paul.l@canal.com",      action: "Création devis #18",      page: "Devis",       time: "08:50", today: false },
];

// ═══════════════════════════════════════
// TOGGLE
// ═══════════════════════════════════════

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${on ? "bg-slate-900" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

// ═══════════════════════════════════════
// SIDE PANEL — glisse de droite à gauche
// Remplace toutes les modales centrées
// ═══════════════════════════════════════

type PanelType = "profile" | "advanced" | null;

function SettingsSidePanel({
  open, type, advTab, setAdvTab, onClose,
  // profil
  firstName, lastName, email, phone,
  avatarId, setAvatarId,
  form, setForm, onSaveProfile,
  // avancé
  theme, setTheme, applyTheme,
  lang, setLang, applyLang,
  trackOn, setTrackOn,
  notifs, setNotifs,
  onSaveAdvanced,
}: {
  open: boolean; type: PanelType;
  advTab: string; setAdvTab: (t: any) => void;
  onClose: () => void;
  firstName: string; lastName: string; email: string; phone: string;
  avatarId: string; setAvatarId: (id: string) => void;
  form: any; setForm: (f: any) => void; onSaveProfile: () => void;
  theme: string; setTheme: (t: any) => void; applyTheme: (t: string) => void;
  lang: string; setLang: (l: any) => void; applyLang: (l: string) => void;
  trackOn: boolean; setTrackOn: (v: boolean) => void;
  notifs: Record<string, boolean>; setNotifs: (n: any) => void;
  onSaveAdvanced: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { if (!open) setShowPicker(false); }, [open]);

  const av = AVATAR_COLORS.find(a => a.id === avatarId) ?? AVATAR_COLORS[0];
  const getInitials = () =>
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

  if (!open) return null;

  const activeNotifCount = Object.values(notifs).filter(Boolean).length;

  const advTabs = [
    { key: "appearance",    Icon: Palette,   label: "Apparence"    },
    { key: "notifications", Icon: Bell,      label: "Notifs"       },
    { key: "tracking",      Icon: Activity,  label: "Traçabilité"  },
    { key: "language",      Icon: Languages, label: "Langue"       },
  ] as const;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel — glisse depuis la droite */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white z-50 shadow-2xl flex flex-col rounded-l-3xl overflow-hidden">

        {/* ── Croix haut gauche ── */}
        <div className="flex items-start px-6 pt-6 pb-0 shrink-0">
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition -ml-1">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* ══════════════════════════════════
            PROFIL
        ══════════════════════════════════ */}
        {type === "profile" && (
          <>
            <div className="px-7 pt-4 pb-5 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">Modifier le profil</h2>
              <p className="text-slate-400 text-xs mt-0.5">Personnalisez vos informations et votre avatar</p>
            </div>

            <div className="flex-1 overflow-y-auto px-7 pb-7 space-y-6">

              {/* Avatar + color picker */}
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-16 h-16 rounded-2xl ${av.bg} flex items-center justify-center shadow-lg shrink-0`}>
                    <span className="text-white font-black text-xl">{getInitials()}</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">Avatar</p>
                    <button
                      onClick={() => setShowPicker(!showPicker)}
                      className="text-xs text-slate-400 hover:text-slate-900 underline underline-offset-2 mt-0.5 font-medium flex items-center gap-1 transition"
                    >
                      <Palette size={11} />
                      {showPicker ? "Fermer le sélecteur" : "Changer la couleur"}
                    </button>
                  </div>
                </div>

                {showPicker && (
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {AVATAR_COLORS.map(a => (
                      <button
                        key={a.id}
                        onClick={() => { setAvatarId(a.id); localStorage.setItem("avatarId", a.id); }}
                        className={`w-10 h-10 rounded-xl ${a.bg} transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${avatarId === a.id ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : ""}`}
                      >
                        {avatarId === a.id && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Champs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "first_name", label: "Prénom",    Icon: User,  type: "text",  ph: "Votre prénom" },
                  { key: "last_name",  label: "Nom",       Icon: User,  type: "text",  ph: "Votre nom" },
                  { key: "email",      label: "Email",     Icon: Mail,  type: "email", ph: "email@canal.com" },
                  { key: "phone",      label: "Téléphone", Icon: Phone, type: "tel",   ph: "+225 00 00 00 00" },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <f.Icon size={10} /> {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={form[f.key] ?? ""}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.ph}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-slate-100 flex gap-3 shrink-0">
              <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition">
                Annuler
              </button>
              <button onClick={onSaveProfile} className="flex-1 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition flex items-center justify-center gap-2">
                <Check size={15} /> Enregistrer
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════
            PARAMÈTRES AVANCÉS
        ══════════════════════════════════ */}
        {type === "advanced" && (
          <>
            <div className="px-7 pt-4 pb-5 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">Paramètres avancés</h2>
              <p className="text-slate-400 text-xs mt-0.5">Personnalisez votre expérience</p>
            </div>

            {/* Tabs horizontaux */}
            <div className="px-7 shrink-0">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
                {advTabs.map(tb => {
                  const { Icon } = tb;
                  const active = advTab === tb.key;
                  return (
                    <button
                      key={tb.key}
                      onClick={() => setAdvTab(tb.key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-black transition ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <Icon size={12} /> {tb.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenu tabs */}
            <div className="flex-1 overflow-y-auto px-7 py-5">

              {/* ─── Apparence ─── */}
              {advTab === "appearance" && (
                <div className="space-y-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Thème d'affichage</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { val: "light",  Icon: Sun,     label: "Mode clair",  cls: "bg-white border-slate-200" },
                      { val: "dark",   Icon: Moon,    label: "Sombre",      cls: "bg-slate-900 border-slate-700" },
                      { val: "system", Icon: Monitor, label: "Système",     cls: "bg-gradient-to-br from-white to-slate-800 border-slate-300" },
                    ] as const).map(opt => {
                      const { Icon } = opt;
                      const active = theme === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => { setTheme(opt.val); applyTheme(opt.val); }}
                          className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition ${active ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-100 hover:border-slate-300"}`}
                        >
                          <div className={`w-full h-12 rounded-xl border ${opt.cls}`} />
                          <div className="flex items-center gap-1">
                            <Icon size={12} className={active ? "text-slate-900" : "text-slate-400"} />
                            <span className={`text-[11px] font-black ${active ? "text-slate-900" : "text-slate-500"}`}>{opt.label}</span>
                            {active && <Check size={11} className="text-slate-900" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400">Le thème s'applique instantanément.</p>
                </div>
              )}

              {/* ─── Notifications ─── */}
              {advTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Alertes — {activeNotifCount}/{NOTIFS.length} activées
                    </p>
                    <button
                      onClick={() => {
                        const allOn = Object.values(notifs).every(Boolean);
                        setNotifs(Object.fromEntries(NOTIFS.map(n => [n.key, !allOn])));
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-2 transition"
                    >
                      {Object.values(notifs).every(Boolean) ? "Tout désactiver" : "Tout activer"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {NOTIFS.map(n => {
                      const { Icon } = n;
                      return (
                        <div key={n.key} className="flex items-center gap-3 py-3.5 border-b border-slate-50 last:border-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Icon size={15} className="text-slate-500" />
                          </div>
                          <p className="font-bold text-slate-900 text-sm flex-1">{lang === "en" ? n.en : n.fr}</p>
                          <Toggle on={notifs[n.key]} onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── Traçabilité ─── */}
              {advTab === "tracking" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Activity size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">Traçabilité globale</p>
                        <p className="text-xs text-slate-400 mt-0.5">Enregistre toutes les actions</p>
                      </div>
                    </div>
                    <Toggle on={trackOn} onChange={() => setTrackOn(!trackOn)} />
                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Clock size={11} /> Journal d'activité récente
                    </p>
                    <div className="space-y-2">
                      {TRACK_LOGS.map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                            <span className="text-xs font-black text-white">{log.user[0].toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{log.user}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {log.action}
                              <span className="mx-1 text-slate-300">·</span>
                              <span className="text-slate-400">{log.page}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {log.today && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            <span className="text-[10px] text-slate-400 font-medium">
                              {log.today ? "Auj. " : "Hier "}{log.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Langue ─── */}
              {advTab === "language" && (
                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Langue de l'interface</p>
                  {LANGS.map(l => {
                    const active = lang === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code as any); applyLang(l.code); }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition ${active ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-300"}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                          {l.flag}
                        </div>
                        <p className={`font-bold text-sm flex-1 text-left ${active ? "text-slate-900" : "text-slate-500"}`}>{l.label}</p>
                        {active && (
                          <span className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black">
                            <Check size={10} /> Actif
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Zap size={11} className="text-slate-400" />
                    Changement immédiat et persistant.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-slate-100 shrink-0">
              <button
                onClick={onSaveAdvanced}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
              >
                <Check size={15} /> Enregistrer les préférences
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// PAGE
// ═══════════════════════════════════════

export default function ParametresPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("SuperAdmin");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("super-admin@canal.com");
  const [phone,     setPhone]     = useState("");
  const [role,      setRole]      = useState("super-admin");

  const [avatarId, setAvatarId] = useState("1");
  const av = AVATAR_COLORS.find(a => a.id === avatarId) ?? AVATAR_COLORS[0];
  const getInitials = () => `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState<"profile"|"advanced"|null>(null);
  const [advTab,    setAdvTab]    = useState<"appearance"|"notifications"|"tracking"|"language">("appearance");

  const [form,    setForm]    = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [theme,   setTheme]   = useState<"light"|"dark"|"system">("light");
  const [lang,    setLang]    = useState<"fr"|"en"|"ar">("fr");
  const [trackOn, setTrackOn] = useState(true);
  const [notifs,  setNotifs]  = useState(Object.fromEntries(NOTIFS.map(n => [n.key, n.defaultOn])));
  const [flash,   setFlash]   = useState<{ type: "success"|"error"; msg: string } | null>(null);

  const showFlash = (type: "success"|"error", msg: string) => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 4000);
  };

  const openPanel = (type: "profile"|"advanced", tab?: any) => {
    setPanelType(type);
    if (tab) setAdvTab(tab);
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setPanelType(null); };

  useEffect(() => {
    const fn = authService.getFirstName();
    const ln = authService.getLastName();
    const em = authService.getEmail();
    const rl = authService.getRole();
    if (fn) setFirstName(fn);
    if (ln) setLastName(ln);
    if (em) setEmail(em);
    if (rl) setRole(rl);
    setForm({ first_name: fn || "", last_name: ln || "", email: em || "", phone: "" });

    const st = (localStorage.getItem("theme")    ?? "light") as any;
    const sl = (localStorage.getItem("lang")     ?? "fr")    as any;
    const sa = localStorage.getItem("avatarId")  ?? "1";
    setTheme(st); setLang(sl); setAvatarId(sa);
    applyTheme(st); applyLang(sl);
  }, []);

  const applyTheme = (v: string) => {
    const dark = v === "dark" || (v === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", v);
  };

  const applyLang = (v: string) => {
    const l = LANGS.find(x => x.code === v);
    document.documentElement.lang = v;
    document.documentElement.dir  = l?.dir ?? "ltr";
    localStorage.setItem("lang", v);
  };

  const handleSaveProfile = () => {
    if (form.first_name) { setFirstName(form.first_name); localStorage.setItem("first_name", form.first_name); }
    if (form.last_name)  { setLastName(form.last_name);   localStorage.setItem("last_name",  form.last_name); }
    if (form.email)      { setEmail(form.email);           localStorage.setItem("user_email", form.email); }
    if (form.phone)        setPhone(form.phone);
    closePanel();
    showFlash("success", "Profil mis à jour avec succès.");
  };

  const handleSaveAdvanced = () => {
    closePanel();
    showFlash("success", "Préférences enregistrées.");
  };

  const roleInfo         = ROLE_MAP[role] ?? ROLE_MAP["admin"];
  const activeNotifCount = Object.values(notifs).filter(Boolean).length;

  const advTiles = [
    { key: "appearance",    Icon: Palette,  label: "Apparence",     sub: theme === "dark" ? "Mode sombre" : theme === "system" ? "Automatique" : "Mode clair", accent: "text-violet-600", bg: "bg-violet-50" },
    { key: "notifications", Icon: Bell,     label: "Notifications", sub: `${activeNotifCount}/${NOTIFS.length} activées`,                                        accent: "text-amber-600",  bg: "bg-amber-50"  },
    { key: "tracking",      Icon: Activity, label: "Traçabilité",   sub: trackOn ? "Active" : "Désactivée",                                                       accent: "text-emerald-600",bg: "bg-emerald-50"},
    { key: "language",      Icon: Globe,    label: "Langue",        sub: LANGS.find(l => l.code === lang)?.label ?? "Français",                                  accent: "text-sky-600",    bg: "bg-sky-50"    },
  ] as const;

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="ml-64 mt-20 p-8">
          {/* ── Titre ── */}
          <PageHeader title="Paramètres" subtitle="Gérez votre profil, vos préférences et les accès administrateurs" />

          {/* ════════════════════════════════════════════════════════
              GRID 3 COLS — pleine largeur, sans max-w centering
          ════════════════════════════════════════════════════════ */}
          <div className={`mt-8 grid gap-6 ${role === "super-admin" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}>

            {/* ══ CARTE 1 — PROFIL ══ */}
            <div className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm">Profil</p>
                  <p className="text-slate-400 text-xs">Identité & contact</p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-2xl ${av.bg} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-black text-2xl">{getInitials()}</span>
                    </div>
                    <button
                      onClick={() => { setForm({ first_name: firstName, last_name: lastName, email, phone }); openPanel("profile"); }}
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-slate-900 hover:bg-black rounded-full flex items-center justify-center shadow-lg transition"
                    >
                      <Camera size={12} className="text-white" />
                    </button>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roleInfo.style}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dot}`} />
                    {roleInfo.label}
                  </span>
                </div>

                {/* Infos */}
                <div className="space-y-2.5">
                  {[
                    { Icon: User,  label: "Prénom",     value: firstName || "—" },
                    { Icon: User,  label: "Nom",        value: lastName  || "—" },
                    { Icon: Mail,  label: "Email",      value: email     || "—" },
                    { Icon: Phone, label: "Téléphone",  value: phone     || "Non renseigné" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <f.Icon size={13} className="text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{f.label}</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setForm({ first_name: firstName, last_name: lastName, email, phone }); openPanel("profile"); }}
                  className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition"
                >
                  <Pencil size={14} /> Modifier le profil
                </button>
              </div>
            </div>

            {/* ══ CARTE 2 — PARAMÈTRES AVANCÉS ══ */}
            <div className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50">
                <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                  <Settings2 size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm">Paramètres avancés</p>
                  <p className="text-slate-400 text-xs">Apparence, notifications, traçabilité, langue</p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-3">
                {advTiles.map(tile => {
                  const { Icon } = tile;
                  return (
                    <button
                      key={tile.key}
                      onClick={() => openPanel("advanced", tile.key)}
                      className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl ${tile.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={18} className={tile.accent} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm">{tile.label}</p>
                        <p className="text-slate-400 text-xs truncate">{tile.sub}</p>
                      </div>
                      <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══ CARTE 3 — SUPER-ADMIN uniquement ══ */}
            {role === "super-admin" && (
              <div className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm">Zone Super-Admin</p>
                    <p className="text-slate-400 text-xs">Rôles & permissions</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest shrink-0">
                    <Lock size={8} /> Restreint
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black p-5 flex-1 flex flex-col">
                    <div className="relative z-10 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-4">
                        <ShieldCheck size={13} className="text-white/50" />
                        <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Administration</span>
                      </div>
                      <h3 className="text-lg font-black text-white mb-2">Rôles & Permissions</h3>
                      <p className="text-white/60 text-xs leading-relaxed mb-4 flex-1">
                        Gérez les rôles, permissions et niveaux d'accès des utilisateurs.
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                          { Icon: Key,        val: "5",  lbl: "Rôles" },
                          { Icon: User,       val: "2",  lbl: "Admins" },
                          { Icon: Users,      val: "12", lbl: "Utilisateurs" },
                          { Icon: ShieldCheck,val: "24+",lbl: "Permissions" },
                        ].map((s, i) => (
                          <div key={i} className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
                            <s.Icon size={14} className="text-white/50 shrink-0" />
                            <div>
                              <p className="text-base font-black text-white leading-none">{s.val}</p>
                              <p className="text-white/50 text-[10px]">{s.lbl}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => router.push("/admin/roles")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-black hover:bg-slate-100 transition"
                      >
                        <ShieldCheck size={15} /> Gérer les rôles <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Side Panel ── */}
      <SettingsSidePanel
        open={panelOpen}
        type={panelType}
        advTab={advTab}
        setAdvTab={setAdvTab}
        onClose={closePanel}
        firstName={firstName} lastName={lastName} email={email} phone={phone}
        avatarId={avatarId} setAvatarId={setAvatarId}
        form={form} setForm={setForm} onSaveProfile={handleSaveProfile}
        theme={theme} setTheme={setTheme} applyTheme={applyTheme}
        lang={lang} setLang={setLang} applyLang={applyLang}
        trackOn={trackOn} setTrackOn={setTrackOn}
        notifs={notifs} setNotifs={setNotifs}
        onSaveAdvanced={handleSaveAdvanced}
      />

      {/* Flash */}
      {flash && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-3.5 rounded-2xl shadow-xl text-sm font-bold border ${
          flash.type === "success" ? "text-green-800 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"
        }`}>
          {flash.msg}
        </div>
      )}
    </div>
  );
}