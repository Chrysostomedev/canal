"use client";

import { authService } from "../../services/AuthService";
import React, { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard, Settings, LogOut, Building2, Users, Grid,
  ChevronDown, Ticket, Calendar, Shield,
  FileText, FileSignature, AlertTriangle,
  ChartNoAxesColumnIncreasing, MapPinHouse,
  Layers, FolderSync, Bell, User as UserIcon,
  ChevronLeft,
} from "lucide-react";

// ─── Context sidebar collapsed ────────────────────────────────────────────────
export const SidebarContext = createContext({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuItem {
  label: string;
  icon: ReactNode;
  href?: string;
  subItems?: MenuItem[];
}
interface BottomItem { label: string; href: string; icon: ReactNode; }

// ─── Menus ────────────────────────────────────────────────────────────────────
const MENU_ADMIN: MenuItem[] = [
  { label: "Tableau de bord", icon: <LayoutDashboard size={18} />, href: "/admin/dashboard" },
  {
    label: "Administration", icon: <MapPinHouse size={18} />, href: "/admin/administration",
    subItems: [
      { label: "Tickets", icon: <Ticket size={18} />, href: "/admin/tickets" },
      {
        label: "Patrimoines", icon: <Building2 size={18} />, href: "/admin/patrimoines",
        subItems: [
          { label: "Types", icon: <Building2 size={16} />, href: "/admin/patrimoines/type" },
          { label: "Sous-types", icon: <Building2 size={16} />, href: "/admin/patrimoines/sous_type" },
        ],
      },
      { label: "Sites", icon: <MapPinHouse size={18} />, href: "/admin/sites" },
      { label: "Planning", icon: <Calendar size={18} />, href: "/admin/planning" },
      { label: "Entretien", icon: <Calendar size={18} />, href: "/admin/entretien" },
      { label: "Prestataires", icon: <Users size={18} />, href: "/admin/prestataires" },
      { label: "Devis", icon: <FileSignature size={18} />, href: "/admin/devis" },
      { label: "Factures", icon: <FileText size={18} />, href: "/admin/factures" },
      { label: "Rapports", icon: <ChartNoAxesColumnIncreasing size={18} />, href: "/admin/rapports" },
      { label: "Services", icon: <Layers size={18} />, href: "/admin/services" },
      { label: "Transfert inter-sites", icon: <FolderSync size={18} />, href: "/admin/transfert" },
    ],
  },
  { label: "Gestionnaires", icon: <Grid size={18} />, href: "/admin/gestionnaires" },
];

const MENU_PROVIDER: MenuItem[] = [
  { label: "Tableau de bord", icon: <LayoutDashboard size={18} />, href: "/provider/dashboard" },
  { label: "Tickets", icon: <Ticket size={18} />, href: "/provider/tickets" },
  { label: "Planning", icon: <Calendar size={18} />, href: "/provider/planning" },
  { label: "Entretien", icon: <Calendar size={18} />, href: "/provider/entretien" },
  { label: "Devis", icon: <FileSignature size={18} />, href: "/provider/devis" },
  { label: "Factures", icon: <FileText size={18} />, href: "/provider/factures" },
  { label: "Rapports", icon: <ChartNoAxesColumnIncreasing size={18} />, href: "/provider/rapports" },
  { label: "Notifications", icon: <Bell size={18} />, href: "/provider/notifications" },
];

const MENU_MANAGER: MenuItem[] = [
  { label: "Tableau de bord", icon: <LayoutDashboard size={18} />, href: "/manager/dashboard" },
  { label: "Sites", icon: <MapPinHouse size={18} />, href: "/manager/site" },
  { label: "Tickets", icon: <Ticket size={18} />, href: "/manager/tickets" },
  { label: "Entretien", icon: <Calendar size={18} />, href: "/manager/entretien" },
  { label: "Planning", icon: <Calendar size={18} />, href: "/manager/planning" },
  { label: "Prestataires", icon: <Users size={18} />, href: "/manager/prestataires" },
  { label: "Devis", icon: <FileSignature size={18} />, href: "/manager/devis" },
  { label: "Factures", icon: <FileText size={18} />, href: "/manager/factures" },
  { label: "Rapports", icon: <ChartNoAxesColumnIncreasing size={18} />, href: "/manager/rapports" },
  { label: "Notifications", icon: <Bell size={18} />, href: "/manager/notifications" },
];

const BOTTOM_SUPER_ADMIN: BottomItem[] = [
  { label: "Gestion des rôles", href: "/admin/roles", icon: <Shield size={18} /> },
  { label: "Profil", href: "/admin/profile", icon: <UserIcon size={18} /> },
  { label: "Paramètres", href: "/admin/parametres", icon: <Settings size={18} /> },
];
const BOTTOM_ADMIN: BottomItem[] = [
  { label: "Profil", href: "/admin/profile", icon: <UserIcon size={18} /> },
  { label: "Paramètres", href: "/admin/parametres", icon: <Settings size={18} /> },
];
const BOTTOM_PROVIDER: BottomItem[] = [
  { label: "Profil", href: "/provider/profile", icon: <UserIcon size={18} /> },
  { label: "Paramètres", href: "/provider/parametre", icon: <Settings size={18} /> },
];
const BOTTOM_MANAGER: BottomItem[] = [
  { label: "Profil", href: "/manager/profile", icon: <UserIcon size={18} /> },
  { label: "Paramètres", href: "/manager/parametres", icon: <Settings size={18} /> },
];

const getMenuByRole = (role: string): MenuItem[] => {
  switch (role.toUpperCase()) {
    case "SUPER-ADMIN": case "ADMIN": return MENU_ADMIN;
    case "PROVIDER": case "USER":    return MENU_PROVIDER;
    case "MANAGER":                  return MENU_MANAGER;
    default:                         return [];
  }
};
const getBottomByRole = (role: string): BottomItem[] => {
  switch (role.toUpperCase()) {
    case "SUPER-ADMIN": return BOTTOM_SUPER_ADMIN;
    case "ADMIN":       return BOTTOM_ADMIN;
    case "PROVIDER": case "USER": return BOTTOM_PROVIDER;
    case "MANAGER":     return BOTTOM_MANAGER;
    default:            return [];
  }
};

// ─── Tooltip (mode collapsed) ─────────────────────────────────────────────────
function Tooltip({ label }: { label: string }) {
  return (
    <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[200]
      bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg
      whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
      transition-opacity duration-150 shadow-lg">
      {label}
    </span>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();

  const [menuItems]   = useState<MenuItem[]>(() => {
    if (typeof window === "undefined") return [];
    return getMenuByRole(localStorage.getItem("user_role") ?? "");
  });
  const [bottomItems] = useState<BottomItem[]>(() => {
    if (typeof window === "undefined") return [];
    return getBottomByRole(localStorage.getItem("user_role") ?? "");
  });

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [collapsed, setCollapsed]         = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Persister l'état collapsed
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem("sidebar_collapsed", String(!prev));
      return !prev;
    });
  };

  // Auto-expansion du menu actif
  useEffect(() => {
    if (!menuItems.length || collapsed) return;
    const findActiveParents = (items: MenuItem[], parents: string[] = []): string[] => {
      for (const item of items) {
        // Actif si pathname commence par le href (pour les sous-pages [id])
        if (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) return parents;
        if (item.subItems) {
          const result = findActiveParents(item.subItems, [...parents, item.label]);
          if (result.length) return result;
        }
      }
      return [];
    };
    setExpandedMenus(findActiveParents(menuItems));
  }, [pathname, menuItems, collapsed]);

  const toggleSubMenu = (label: string) =>
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );

  // Un item est actif si pathname === href OU commence par href + "/"
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    try { await authService.logout(); }
    catch { localStorage.clear(); window.location.href = "/login"; }
  };

  // ─── NavItem récursif ─────────────────────────────────────────────────────
  const NavItem = ({ item, depth = 0 }: { item: MenuItem; depth?: number }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;

    const checkActive = (it: MenuItem): boolean =>
      (!!it.href && isActive(it.href)) || (it.subItems?.some(checkActive) ?? false);

    const active     = checkActive(item);
    const isExpanded = expandedMenus.includes(item.label);

    // Mode collapsed : icône seule + tooltip
    if (collapsed && depth === 0) {
      return (
        <div className="relative group w-full flex justify-center">
          <Link
            href={item.href || "#"}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
              ${active ? "bg-theme-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {item.icon}
          </Link>
          <Tooltip label={item.label} />
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className={`flex items-center w-full rounded-xl transition-all duration-200
          ${active && !hasSubItems ? "bg-theme-primary text-white shadow-md"
          : active && hasSubItems  ? "text-theme-primary bg-theme-light"
          : "text-gray-600 hover:bg-gray-50"}`}
        >
          <Link
            href={item.href || "#"}
            className={`flex-1 flex items-center gap-3 px-3 py-2.5 font-medium text-sm ${depth > 0 ? "pl-4" : ""}`}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </Link>
          {hasSubItems && (
            <button
              onClick={e => { e.preventDefault(); toggleSubMenu(item.label); }}
              className={`px-3 py-2.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            >
              <ChevronDown size={14} />
            </button>
          )}
        </div>
        {hasSubItems && isExpanded && (
          <div className="ml-4 mt-1 border-l-2 border-gray-100 pl-2 space-y-1 animate-in slide-in-from-top-1">
            {item.subItems?.map(sub => <NavItem key={sub.label} item={sub} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  const sidebarW = collapsed ? "w-16" : "w-64";

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside className={`fixed top-0 left-0 ${sidebarW} h-screen bg-white shadow-lg border-r border-gray-200 flex flex-col z-40 transition-all duration-300`}>

        {/* Logo / icône */}
        <div className={`border-b border-gray-100 flex items-center transition-all duration-300 ${collapsed ? "justify-center py-5 px-2" : "justify-between px-4 py-5"}`}>
          {!collapsed && (
            <Image src="/images/logo_canal.png" alt="CANAL+" width={140} height={40} priority className="object-contain" />
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">C+</span>
            </div>
          )}
          {/* Bouton collapse */}
          <button
            onClick={toggleCollapsed}
            className={`p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700 shrink-0 ${collapsed ? "mt-0" : ""}`}
            title={collapsed ? "Déplier" : "Réduire"}
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Menu principal */}
        <nav className={`flex-1 overflow-y-auto py-3 space-y-1 custom-scrollbar ${collapsed ? "px-2 items-center flex flex-col" : "px-3"}`}>
          {menuItems.map(item => <NavItem key={item.label} item={item} />)}
        </nav>

        {/* Menu bas */}
        <div className={`border-t border-gray-100 space-y-1 ${collapsed ? "px-2 py-3 flex flex-col items-center" : "p-3"}`}>
          {bottomItems.map(item => {
            const active = isActive(item.href);
            if (collapsed) {
              return (
                <div key={item.label} className="relative group w-full flex justify-center">
                  <Link href={item.href}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all
                      ${active ? "bg-theme-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    {item.icon}
                  </Link>
                  <Tooltip label={item.label} />
                </div>
              );
            }
            return (
              <Link key={item.label} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm
                  ${active ? "bg-theme-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Déconnexion */}
          {collapsed ? (
            <div className="relative group w-full flex justify-center">
              <button onClick={() => setShowLogoutModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition">
                <LogOut size={18} />
              </button>
              <Tooltip label="Se déconnecter" />
            </div>
          ) : (
            <button onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm">
              <LogOut size={18} />
              <span>Se déconnecter</span>
            </button>
          )}
        </div>
      </aside>

      {/* Modale déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white w-[90%] max-w-md rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={28} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-gray-900">Déconnexion</h2>
              <p className="text-gray-500 text-sm leading-relaxed">Souhaitez-vous vous déconnecter ?</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-theme-primary text-white font-bold hover:opacity-90 transition text-sm">
                Rester
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition text-sm">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarContext.Provider>
  );
}
