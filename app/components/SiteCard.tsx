"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

interface SiteCardProps {
  name: string;
  location: string;
  status: "actif" | "inactif";
  responsibleName: string;
  phone: string;
  email: string;
  assetCount: number;
}

export default function SiteCard({ name, location, status, responsibleName, phone, email, assetCount }: SiteCardProps) {
  // On prépare l'URL avec les paramètres
  const detailUrl = `/admin/sites/details?name=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}&responsible=${encodeURIComponent(responsibleName)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&assets=${assetCount}`;
  
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-3 h-full flex flex-col gap-3">
      
      {/* 1. Header Section (Gris clair) */}
      <div className="bg-slate-50 rounded-[24px] p-6 relative">
        <h3 className="text-2xl font-bold text-slate-900 mb-4 pr-16 uppercase tracking-tight leading-tight">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <MapPin size={18} className="text-slate-900" />
          <span className="text-sm">{location}</span>
          
          <span className={`ml-2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            status === "actif" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* 2. Body Section (Infos Responsable) */}
      <div className="bg-white rounded-[20px] border border-slate-50 p-6 flex-grow">
        <h4 className="text-2xl font-bold text-slate-900 mb-4">
          {responsibleName}
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="p-1.5 bg-slate-50 rounded-lg">
                <Phone size={16} className="text-slate-900" />
            </div>
            <span className="text-sm font-medium">{phone}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600">
             <div className="p-1.5 bg-slate-30 rounded-lg">
                <Mail size={16} className="text-slate-900" />
            </div>
            <span className="text-sm font-medium">{email}</span>
          </div>
        </div>
      </div>

      {/* 3. Footer Section (Boutons Noirs) */}
      <div className="flex gap-2">
        <div className="bg-[#111] text-white rounded-2xl px-6 py-4 text-xl font-bold flex items-center justify-center min-w-[80px]">{assetCount}</div>
        
        <Link 
          href={detailUrl} 
          className="flex-grow bg-[#111] text-white rounded-2xl px-6 py-4 font-bold flex items-center justify-center gap-3 hover:bg-black transition-colors group text-sm"
        >
          voir les détails du site
          <div className="border border-white/30 rounded-full p-1 group-hover:bg-white group-hover:text-black transition-all">
            <ArrowUpRight size={12} />
          </div>
        </Link>
      </div>
    </div>
  );
}