// DayCell.tsx
"use client";

interface Event {
  label: string;
  time: string;
  color: string;
  status: string;
}

export function DayCell({ day, isOtherMonth, events, onClick }: any) {
  return (
    <div className={`min-h-[140px] border-r border-b border-slate-100 p-2 flex flex-col gap-2 transition-colors ${isOtherMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30'}`}>
      
      {/* Numéro du jour */}
      <span className={`text-[14px] font-semibold mb-1 ${isOtherMonth ? 'text-slate-300' : 'text-slate-500'}`}>
        {day < 10 ? `0${day}` : day}
      </span>
      
      <div className="space-y-2">
        {events.map((event: Event, idx: number) => (
          <div 
            key={idx}
            onClick={() => onClick(event)} // Déclenche l'ouverture de la modale
            className="rounded-md p-2 flex flex-col gap-1 cursor-pointer hover:shadow-sm transition-all active:scale-95"
            style={{ 
              backgroundColor: `${event.color}10`, // Fond très clair (10% opacité)
              borderLeft: `4px solid ${event.color}` 
            }}
          >
            {/* Titre et Pastille */}
            <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
               <span className="text-[11px] font-bold truncate tracking-tight" style={{ color: event.color }}>
                 {event.label}...
               </span>
            </div>

            {/* Sous-titre Statut (optionnel, comme sur la capture) */}
            <p className="text-[9px] font-bold  opacity-60 px-1" style={{ color: event.color }}>
              {event.status}
            </p>

            {/* Heure */}
            <span className="text-[11px] text-slate-400 font-medium px-1 mt-0.5">
              {event.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}