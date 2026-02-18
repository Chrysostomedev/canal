"use client";

import { Bell, LogOut } from "lucide-react";
import { authService } from "../../services/AuthService";

export default function Navbar() {
  const handleDirectLogout = async () => {
    // On peut demander une confirmation rapide du navigateur
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await authService.logout();
    }}
  return (
    <header
      className="fixed top-0 left-64 w-[calc(100%-16rem)] flex justify-between items-center px-6 py-4 bg-white shadow border-b border-gray-200 z-50"
    >
      {/* bienvenue */}
      <div className="flex items-center gap-4">
        <img
          src="/assets/avatar.jpg"
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-gray-800 font-semibold text-sm font-[var(--family-primary)]">
            Bonjour, koffi Boris
          </p>
          <p className="text-gray-700 font-[var(--family-primary)]">
            Bienvenue sur votre espace d'administration de  Facility Management         
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all group">
  {/* Icône de la cloche avec le petit point de notification intégré */}
  <div className="relative">
    <Bell size={24} className="text-black" strokeWidth={2.5} />
    {/* Le petit point noir sur la cloche */}
    <span className="absolute top-0 right-0.5 w-2 h-2 bg-black border-2 border-white rounded-full"></span>
  </div>

  {/* Texte "Notification" */}
  <span className="text-black  text-lg tracking-tight">
    Notification
  </span>

  {/* Badge de compteur noir */}
  <span className="bg-black text-white text-base font-bold w-10 h-7 flex items-center justify-center rounded-full ml-1">
    0
  </span>
</button>
<button 
      onClick={handleDirectLogout}
      className="p-2 rounded-full hover:bg-gray-100"
    >
      <LogOut size={20} className="text-gray-700" />
    </button>
      </div>
    </header>
  );
}
