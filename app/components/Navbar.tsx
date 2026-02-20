"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell, LogOut, AlertTriangle, User } from "lucide-react";
import { authService } from "../../services/AuthService";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Récupération dynamique du nom de l'utilisateur
  useEffect(() => {
  setFirstName(authService.getFirstName());
  setLastName(authService.getLastName());
}, []);

  const handleLogout = async () => {
    try {
      await authService.logout(); // AuthService gère correctement la route /admin/logout
      router.push("/admin/login");
    } catch (error) {
      console.error("Erreur de déconnexion", error);
      localStorage.clear();
      window.location.href = "/admin/login";
    }
  };

  // Génère les initiales pour l'icône
  const getInitials = () => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    }
    return null;
  };

  return (
    <>
      <header className="fixed top-0 left-64 w-[calc(100%-16rem)] flex justify-between items-center px-6 py-4 bg-white shadow border-b border-gray-200 z-50">
        <div className="flex items-center gap-4">
          {getInitials() ? (
            <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-800 font-bold flex items-center justify-center text-sm">
              {getInitials()}
            </div>
          ) : (
            <User size={40} className="text-gray-500" />
          )}
          <div>
            <p className="text-gray-800 font-semibold text-sm font-[var(--family-primary)]">
              Bonjour, {firstName} {lastName}
            </p>
            <p className="text-gray-700 font-[var(--family-primary)]">
              Bienvenue sur votre espace d'administration de Facility Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all group">
            <div className="relative">
              <Bell size={24} className="text-black" strokeWidth={2.5} />
              <span className="absolute top-0 right-0.5 w-2 h-2 bg-black border-2 border-white rounded-full"></span>
            </div>
            <span className="text-black text-lg tracking-tight">Notification</span>
            <span className="bg-black text-white text-base font-bold w-10 h-7 flex items-center justify-center rounded-full ml-1">0</span>
          </button>

          <button onClick={() => setShowLogoutModal(true)} className="p-2 rounded-full hover:bg-gray-100">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white w-[90%] max-w-lg rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={38} strokeWidth={2.5} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Déconnexion de votre compte</h2>
              <p className="text-gray-500 text-lg leading-relaxed font-medium px-4">
                Souhaitez-vous vous déconnecter ? Cette action vous déconnectera de votre compte. Vous pourrez vous reconnecter facilement à tout moment en saisissant vos identifiants
              </p>
            </div>
            <div className="flex gap-4 w-full pt-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 px-6 rounded-2xl bg-[#1A1A1A] text-white font-bold hover:bg-black transition-all">
                Rester connecté
              </button>
              <button onClick={handleLogout} className="flex-1 py-3 px-6 rounded-2xl bg-[#FF0000] text-white font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-200">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
