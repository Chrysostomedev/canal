"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, Shield, Calendar, 
  Camera, Lock, CheckCircle2, AlertCircle, 
  Loader2, Save, KeyRound 
} from "lucide-react";
import Image from "next/image";
import axiosInstance from "../../../core/axios";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

export default function ProviderProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });

  const showFlash = (type: "success" | "error", msg: string) => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/provider/profile");
      const data = res.data?.data ?? res.data;
      setProfile(data);
      setFormData({ name: data.name || "", phone: data.phone || "" });
    } catch (e) {
      console.error("Profile fetch error", e);
      showFlash("error", "Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put("/provider/profile", formData);
      showFlash("success", "Profil mis à jour.");
      fetchProfile();
    } catch (e: any) {
      showFlash("error", e.response?.data?.message || "Erreur.");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      showFlash("error", "Les mots de passe ne correspondent pas.");
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.put("/provider/profile/password", passwordData);
      showFlash("success", "Mot de passe modifié.");
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (e: any) {
      showFlash("error", e.response?.data?.message || "Erreur.");
    } finally { setSaving(false); }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("avatar", file);
    setSaving(true);
    try {
      await axiosInstance.post("/provider/profile/avatar", formDataObj, { headers: { "Content-Type": "multipart/form-data" } });
      showFlash("success", "Photo mise à jour.");
      fetchProfile();
    } catch (e) { showFlash("error", "Erreur upload."); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="mt-20 p-8 max-w-5xl mx-auto w-full space-y-8">
          <PageHeader title="Mon Profil" subtitle="Gérez vos informations de Prestataire" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                    {profile?.profile_picture ? (
                      <Image src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${process.env.NEXT_PUBLIC_API_URL || ''}/storage/${profile.profile_picture}`} alt={profile.name} width={128} height={128} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-4xl font-black text-slate-300">{profile?.name?.split(' ').map((n:any)=>n[0]).join('').toUpperCase()}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white w-8 h-8" /></div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-black text-slate-900">{profile?.name}</h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">PRESTATAIRE</div>
                </div>
                <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4 text-left">
                  <div className="flex items-center gap-3 text-sm"><Mail size={16} className="text-slate-400" /><span className="text-slate-600 font-medium">{profile?.email}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Phone size={16} className="text-slate-400" /><span className="text-slate-600 font-medium">{profile?.phone || "-"}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Calendar size={16} className="text-slate-400" /><span className="text-slate-600 font-medium">Membre depuis {new Date(profile?.created_at).toLocaleDateString()}</span></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg"><User className="text-white" size={20} /></div>
                  <div><h3 className="font-black text-slate-900">Infos Personnelles</h3></div>
                </div>
                <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom</label>
                       <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</label>
                       <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900" />
                    </div>
                  </div>
                  <div className="flex justify-end"><button type="submit" disabled={saving} className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition-all disabled:opacity-50">Sauvegarder</button></div>
                </form>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 shadow-lg shadow-orange-100 flex items-center justify-center"><KeyRound className="text-white" size={20} /></div>
                  <div><h3 className="font-black text-slate-900">Mot de passe</h3></div>
                </div>
                <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <input type="password" value={passwordData.current_password} onChange={e => setPasswordData({...passwordData, current_password: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold" placeholder="Actuel" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="password" value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold" placeholder="Nouveau" />
                      <input type="password" value={passwordData.new_password_confirmation} onChange={e => setPasswordData({...passwordData, new_password_confirmation: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold" placeholder="Confirmer" />
                    </div>
                  </div>
                  <div className="flex justify-end"><button type="submit" disabled={saving} className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition-all disabled:opacity-50">Mettre à jour</button></div>
                </form>
              </div>
            </div>
          </div>
        </main>
        {flash && <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-4 rounded-2xl shadow-2xl text-sm font-black flex items-center gap-3 border ${flash.type === "success" ? "text-emerald-800 bg-emerald-50 border-emerald-100" : "text-red-800 bg-red-50 border-red-100"}`}>{flash.msg}</div>}
      </div>
    
  );
}
