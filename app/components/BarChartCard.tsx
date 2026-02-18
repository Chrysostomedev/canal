"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

type BarChartData = {
  label: string;
  value: number;
  color?: string;
};

type BarChartCardProps = {
  title?: string;
  data?: BarChartData[];
  onYearChange?: (year: string) => void;
};

export default function BarChartCard({
  title = "Tendance de l'année",
  data = [],
  onYearChange,
}: BarChartCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2025");
  const years = ["2023", "2024", "2025", "2026"];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white  p-8 text-slate-400 text-sm">
        Aucune donnée disponible
      </div>
    );
  }

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setIsOpen(false);
    if (onYearChange) onYearChange(year);
  };

  const realMax = Math.max(...data.map((d) => d.value));
  const maxValue = realMax > 1000 ? Math.ceil(realMax / 1000) * 1000 : Math.ceil(realMax / 100) * 100;
  const yAxisMarkers = [maxValue, Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];

  return (
    // On baisse le z-index global de la carte pour qu'elle passe SOUS la navbar au scroll
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 relative z-10">
      
      {/* Header : z-20 suffit ici */}
      <div className="flex items-center justify-between mb-10 relative z-20">
        <h3 className="font-bold text-slate-800 text-lg tracking-tight">{title}</h3>
        
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 hover:bg-white hover:shadow-md transition-all active:scale-95"
          >
            {selectedYear}
            <ChevronDown 
              size={16} 
              className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <>
                {/* Overlay pour fermer au clic extérieur - z-30 */}
                <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
                
                {/* Menu déroulant - z-40 */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 5, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  // Le menu est absolute par rapport au bouton
                  className="absolute right-0 top-full w-32 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 overflow-hidden z-40"
                >
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        selectedYear === year ? "bg-black text-white" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Zone Graphique - z-0 */}
      <div className="relative flex h-64 w-full z-0">
        <div className="absolute inset-0 flex flex-col justify-between text-slate-300 text-[11px] font-black pr-4">
          {yAxisMarkers.map((marker) => (
            <div key={marker} className="flex items-center gap-4 w-full">
              <span className="w-10 text-right">
                {marker >= 1000 ? `${(marker / 1000).toFixed(1)}K` : marker}
              </span>
              <div className="h-[1px] flex-1 bg-slate-50" />
            </div>
          ))}
        </div>

        <div className="flex items-end justify-around flex-1 ml-14 h-full z-10 gap-2">
          {data.map((item) => (
            <div key={item.label} className="flex flex-col items-center h-full w-full max-w-[40px] group">
              <div className="relative flex-1 w-full flex items-end">
                <motion.div
                  layout
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxValue) * 100}%` }}
                  transition={{ type: "spring", damping: 15, stiffness: 100 }}
                  style={{ backgroundColor: item.color || "#0F172A" }}
                  className="w-full rounded-t-xl rounded-b-md hover:brightness-125 transition-all cursor-pointer shadow-sm relative"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold">
                    {item.value}
                  </div>
                </motion.div>
              </div>
              <p className="text-slate-400 text-[10px] mt-5 font-black tracking-tighter">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}