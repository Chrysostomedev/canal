"use client";

import { X, MapPin, Phone, Mail, Briefcase, Calendar, Star, Check } from "lucide-react";
import Image from "next/image";
import StatsCard from "./StatsCard"; // Réutilise ton composant de stats existant
import FormButton from "./form/FormButton";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    name: string;
    location: string;
    phone: string;
    email: string;
    category: string;
    dateEntree: string;
    status: string;
    logo?: string;
    stats: {
      totalBillets: { value: number; delta: string };
      ticketsEnCours: { value: number; delta: string };
      ticketsTraites: { value: number; delta: string };
      noteObtenue: string;
    };
  };
}

const DEFAULT_STATS = {
    totalBillets: { value: 0, delta: "0%" },
    ticketsEnCours: { value: 0, delta: "0%" },
    ticketsTraites: { value: 0, delta: "0%" },
    noteObtenue: "0/5"
  };

export default function ProfileModal({ isOpen, onClose, provider }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={onClose} />

      {/* Modal Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white z-[9999] shadow-2xl flex flex-col animate-in slide-in-from-right">
        
        {/* Header Section */}
        <div className="p-8 pb-4 space-y-6">
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors">
            <X size={22} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
               {provider.logo ? (
                 <Image src={provider.logo} alt={provider.name} width={80} height={80} />
               ) : (
                 <div className="text-2xl font-bold text-slate-400">{provider.name.charAt(0)}</div>
               )}
            </div>
            <div>
              <h2 className="text-[26px] font-black text-slate-900 leading-tight uppercase tracking-tight">{provider.name}</h2>
              <div className="flex items-center gap-1 text-slate-500 font-medium mt-1">
                <MapPin size={16} />
                {provider.location}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 custom-scrollbar">
          
         {/* KPI Grid */}
<div className="grid grid-cols-2 gap-4">
  <StatsCard 
    label="Total des billets attribués" 
    // On utilise le optional chaining ?. et une valeur de repli ||
    value={provider?.stats?.totalBillets?.value || 0} 
    delta={provider?.stats?.totalBillets?.delta || "+0%"} 
    trend="up" 
    small 
  />
  <StatsCard 
    label="Total tickets en cours" 
    value={provider?.stats?.ticketsEnCours?.value || 0} 
    delta={provider?.stats?.ticketsEnCours?.delta || "+0%"} 
    trend="up" 
    small 
  />
  <StatsCard 
    label="Total tickets traités" 
    value={provider?.stats?.ticketsTraites?.value || 0} 
    delta={provider?.stats?.ticketsTraites?.delta || "+0%"} 
    trend="up" 
    small 
  />
  
  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
    <span className="text-[12px] font-bold text-slate-400 uppercase">Notes obtenue</span>
    <div className="flex items-center gap-2 mt-2">
      <span className="text-2xl font-black text-slate-900">
        {provider?.stats?.noteObtenue || "N/A"}
      </span>
      <div className="flex text-yellow-400">
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} fill="currentColor" />
        <Star size={16} className="text-slate-200" fill="currentColor" />
      </div>
    </div>
  </div>
</div>
          {/* Details List */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Autres informations sur le prestataire</h3>
            
            <div className="space-y-4">
              {[
                { label: "Nom du prestataire", value: provider.name },
                { label: "Numéro de téléphone", value: provider.phone },
                { label: "E-mail", value: provider.email },
                { label: "Service", value: provider.category },
                { label: "Date d'entrée", value: provider.dateEntree },
                { label: "Localisation", value: provider.location },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <span className="text-slate-900 font-bold">{item.value}</span>
                </div>
              ))}
              
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-medium">Statut</span>
                <div className="bg-green-50 text-green-600 px-4 py-1 rounded-lg border border-green-100 text-sm font-bold">
                  {provider.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
          <FormButton variant="secondary" onClick={onClose} className="flex-1">Annuler</FormButton>
          <FormButton variant="primary" onClick={() => console.log("Update")} className="flex-1">Mettre à jour</FormButton>
        </div>
      </div>
    </>
  );
}