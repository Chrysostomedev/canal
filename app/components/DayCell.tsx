"use client";

// ============================================================
// components/DayCell.tsx
// Cellule d'un jour dans le CalendarGrid
// Reçoit les events réels depuis CalendarGrid
// ============================================================

interface CalendarEvent {
  id: number;
  label: string;
  time: string;
  color: string;
  status: string;
  planning: any; // Planning complet pour le panel
}

interface DayCellProps {
  day: number;
  currentMonth?: boolean;
  events: CalendarEvent[];
  date?: Date;
  onClick: (event: CalendarEvent) => void;
  onDrop?: (planningId: number) => void;
}

export function DayCell({ day, currentMonth = true, events, onClick, onDrop, date }: DayCellProps) {
  const isToday = (() => {
    const d = new Date();
    // On ne peut pas vérifier l'année/mois ici sans les props, 
    // donc on laisse CalendarGrid gérer la surbrillance si besoin
    return false;
  })();

  return (
    <div
      onDragOver={(e) => {
        if (currentMonth) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(e) => {
        if (currentMonth) {
          e.preventDefault();
          const planningId = e.dataTransfer.getData("planningId");
          if (planningId && onDrop) onDrop(Number(planningId));
        }
      }}
      className={`
        min-h-[110px] border-b border-r border-slate-100 p-2 flex flex-col gap-1
        ${!currentMonth ? "bg-slate-50/50" : "bg-white"}
        ${currentMonth ? "hover:bg-slate-50/30 transition-colors" : ""}
      `}
    >
      {/* Numéro du jour */}
      <div className="flex items-center justify-end mb-1">
        <span
          className={`
            text-[13px] w-7 h-7 flex items-center justify-center rounded-full font-semibold
            ${!currentMonth ? "text-slate-300" : "text-slate-700"}
          `}
        >
          {day}
        </span>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-1 overflow-hidden">
        {events.slice(0, 2).map((event, i) => (
          <button
            key={i}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("planningId", String(event.id));
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => onClick(event)}
            className="w-full text-left group cursor-grab active:cursor-grabbing"
          >
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-white/50 ring-1 ring-transparent hover:ring-slate-200"
              style={{ backgroundColor: `${event.color}15`, borderLeft: `3px solid ${event.color}` }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-bold truncate leading-tight"
                  style={{ color: event.color }}
                >
                  {event.label}
                </p>
                {event.time && event.time !== "-" && (
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {event.time}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Indicateur "+N" si plus de 2 events */}
        {events.length > 2 && (
          <button
            onClick={() => onClick(events[2])}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-700 text-left px-2 transition-colors"
          >
            +{events.length - 2} autre{events.length - 2 > 1 ? "s" : ""}
          </button>
        )}
      </div>
    </div>
  );
}