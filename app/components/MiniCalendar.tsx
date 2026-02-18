"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // États pour les menus personnalisés
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  
  const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // --- LOGIQUE CALENDRIER ---
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  for (let i = startingDay; i > 0; i--) calendarDays.push({ day: daysInPrevMonth - i + 1, currentMonth: false });
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push({ day: i, currentMonth: true });
  const remaining = calendarDays.length <= 35 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) calendarDays.push({ day: i, currentMonth: false });

  // Fermer les menus si on clique ailleurs
  useEffect(() => {
    const closeMenus = () => { setIsMonthOpen(false); setIsYearOpen(false); };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  return (
    <div className="bg-white p-4 w-full rounded-[24px] shadow-sm border border-slate-100 relative">
      
      {/* HEADER AVEC CUSTOM DROPDOWNS */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          
          {/* CUSTOM MONTH PICKER */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 px-3 py-1.5 rounded-xl transition-all font-bold text-[14px]"
            >
              {months[month]}
              <ChevronDown size={14} className={`transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMonthOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                  {months.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => { setCurrentDate(new Date(year, i, 1)); setIsMonthOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-[13px] hover:bg-slate-50 rounded-lg transition-colors group"
                    >
                      <span className={month === i ? "font-bold text-black" : "text-slate-600"}>{m}</span>
                      {month === i && <Check size={14} className="text-black" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CUSTOM YEAR PICKER */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 px-3 py-1.5 rounded-xl transition-all font-bold text-[14px]"
            >
              {year}
              <ChevronDown size={14} className={`transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
            </button>

            {isYearOpen && (
              <div className="absolute top-full left-0 mt-2 w-28 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                  {Array.from({ length: 10 }, (_, i) => 2022 + i).map((y) => (
                    <button
                      key={y}
                      onClick={() => { setCurrentDate(new Date(y, month, 1)); setIsYearOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-[13px] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <span className={year === y ? "font-bold text-black" : "text-slate-600"}>{y}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION ARROWS */}
        <div className="flex gap-1">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-black transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-black transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* GRID CALENDRIER (Ajusté pour remplir l'espace) */}
      <div className="grid grid-cols-7 w-full text-center">
        {days.map((d) => (
          <div key={d} className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest">{d}</div>
        ))}
        {calendarDays.map((dateObj, i) => {
          const selected = dateObj.currentMonth && isToday(dateObj.day, month, year);
          return (
            <div key={i} className="aspect-square flex items-center justify-center p-0.5">
              <button
                className={`w-full h-full max-w-[36px] max-h-[36px] text-[13px] flex items-center justify-center rounded-xl transition-all
                  ${!dateObj.currentMonth ? "text-slate-200" : "text-slate-600 font-semibold"}
                  ${selected ? "bg-black text-white shadow-lg" : "hover:bg-slate-50 hover:text-black"}
                `}
              >
                {dateObj.day}
              </button>
            </div>
          );
        })}
      </div>

      {/* CSS INTERNE POUR LE SCROLLBAR NOIR/GRIS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

function isToday(day: number, m: number, y: number) {
  const d = new Date();
  return day === d.getDate() && m === d.getMonth() && y === d.getFullYear();
}