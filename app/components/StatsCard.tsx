import { ArrowUpRight, ArrowDownRight } from "lucide-react"; // Optionnel : installe lucide-react
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down";
}

export default function StatsCard({ label, value, delta, trend = "up" }: StatsCardProps) {
  const isUp = trend === "up";

  return (
    <div className="bg-white px-4 py-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-sm transition-shadow duration-200"> 
      {/* Label en haut - aligné à gauche avec une petite marge */}
      <p className="text-slate-600 text-[11px] font-semibold  mb-4 px-1">
        {label}
      </p>

   
<div className="flex items-center justify-between px-1">
  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tighter">
    {value}
  </h3>

  {delta && (
    <div 
      className={`flex items-center gap-1 text-[10px] font-medium ${
        isUp ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      <span>{delta}</span>
      {isUp ? (
        <TrendingUp size={18} strokeWidth={2.5} className="mb-0.5" />
      ) : (
        <TrendingDown size={18} strokeWidth={2.5} className="mt-0.5" />
      )}
    </div>
  )}
</div>
</div>

  );
}