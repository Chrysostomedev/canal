"use client";
import Link from "next/link";
import { MapPin, Phone, ArrowUpRight, Ticket } from "lucide-react";
import { Site, resolveManagerName, resolveManagerPhone } from "../../services/admin/site.service";
import { useLanguage } from "../../contexts/LanguageContext";

interface SiteCardProps {
  site?: Site | null;
}

export default function SiteCard({ site }: SiteCardProps) {
  const { t } = useLanguage();

  if (!site) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 flex items-center justify-center text-slate-400 italic">
        {t("common.unavailable")}
      </div>
    );
  }

  const detailUrl = `/admin/sites/details/${site.id}`;
  const managerName = resolveManagerName(site);
  const managerPhone = resolveManagerPhone(site);

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-3 h-full flex flex-col gap-3">
      <div className="bg-slate-50 rounded-[24px] p-6 relative">
        <h3 className="text-2xl font-bold text-slate-900 mb-4 pr-16 uppercase tracking-tight leading-tight">
          {site.nom || "N/A"}
        </h3>
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <MapPin size={18} className="text-slate-900" />
          <span className="text-sm">{site.localisation || "N/A"}</span>
          <span className={`ml-2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            site.status === "active" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}>
            {site.status === "active" ? t("cards.activeStatus") : t("cards.inactiveStatus")}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[20px] border border-slate-50 p-6 flex-grow">
        <h4 className="text-2xl font-bold text-slate-900 mb-4">
          {managerName !== "—" ? managerName : "N/A"}
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <Phone size={16} className="text-slate-900" />
            </div>
            <span className="text-sm font-medium">
              {managerPhone !== "—" ? managerPhone : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="bg-theme-primary text-white rounded-2xl px-6 py-4 text-xl font-bold flex items-center justify-center gap-2 min-w-[80px]" title={t("cards.tickets")}>
          <Ticket size={24} />
          {site.tickets_count ?? 0}
        </div>
        <Link
          href={detailUrl}
          className="flex-grow bg-theme-primary text-white rounded-2xl px-6 py-4 font-bold flex items-center justify-center gap-3 hover:bg-black transition-colors group text-sm"
        >
          {t("cards.siteDetails")}
          <div className="border border-white/30 rounded-full p-1 group-hover:bg-white group-hover:text-black transition-all">
            <ArrowUpRight size={12} />
          </div>
        </Link>
      </div>
    </div>
  );
}
