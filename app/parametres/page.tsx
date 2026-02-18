"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import {
  User,
  Lock,
  Bell,
  Globe,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function ParametresPage() {
  const cpis = [
    { label: "Sites actifs", value: 10, delta: "+3", trend: "up" },
    { label: "Coût moyen", value: "33 K", delta: "+20.10%", trend: "up" },
    { label: "Coût total", value: "800.5 K", delta: "+15.03%", trend: "up" },
  ];
  return (

<div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
                  <Sidebar />
 <main className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-12">
              <Navbar/>
            <main className="ml-64 mt-20 p-6">

      {/* Header */}
      
                 <PageHeader 
  title="Paramètres" 
  subtitle=" Ce menu vous permet de voir le calendrier des évènements planifiés" 
/>

          {/* 2. STATS SECTION */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cpis.map((cpi, i) => <StatsCard key={i} {...cpi} />)}
            </div>
            
          </div>
     

      {/* Paramètres généraux */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Général</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParamItem
            label="Informations personnelles"
            sublabel="Nom, e-mail, téléphone"
            href="#"
            icon={<User size={20} className="text-gray-700" />}
          />

          <ParamItem
            label="Sécurité du compte"
            sublabel="Changer mot de passe, permissions"
            href="#"
            icon={<Lock size={20} className="text-gray-700" />}
          />

          <ParamItem
            label="Notifications"
            sublabel="Préférences d’alertes"
            href="#"
            icon={<Bell size={20} className="text-gray-700" />}
          />

          <ParamItem
            label="Préférences linguistiques"
            sublabel="Langue de l’interface"
            href="#"
            icon={<Globe size={20} className="text-gray-700" />}
          />
        </div>
      </section>

      {/* Confidentialité & sécurité */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Confidentialité & sécurité
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParamItem
            label="Authentification à deux facteurs"
            sublabel="Configurer 2FA"
            href="#"
            icon={<ShieldCheck size={20} className="text-gray-700" />}
          />

          <ParamItem
            label="Méthodes de paiement"
            sublabel="Cartes, facturation"
            href="#"
            icon={<CreditCard size={20} className="text-gray-700" />}
          />
        </div>
      </section>

      {/* Assistance */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Assistance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParamItem
            label="Centre d’aide"
            sublabel="FAQ et support"
            href="#"
            icon={<HelpCircle size={20} className="text-gray-700" />}
          />

          <ParamItem
            label="Déconnexion"
            sublabel="Se déconnecter de l’application"
            href="#"
            icon={<LogOut size={20} className="text-gray-700" />}
          />
        </div>
      </section>
      </main>
    </main>
    </div>
  );
}

type ParamItemProps = {
  label: string;
  sublabel: string;
  href: string;
  icon: React.ReactNode;
};

function ParamItem({ label, sublabel, href, icon }: ParamItemProps) {
  return (
    <Link href={href} className="block">
      <div className="flex items-center justify-between border border-gray-200 rounded-2xl bg-white p-4 hover:shadow-md transition">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
          <div>
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{sublabel}</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </Link>
  );
}
