// app/components/CalendarGrid.tsx
import { DayCell } from "./DayCell";

type CalendarGridProps = {
  search?: string;
  onEventClick: (event: any) => void; // Nouvelle prop pour ouvrir la modale
};

export default function CalendarGrid({ search, onEventClick }: CalendarGridProps) {
  const days = Array.from({ length: 31 });

  // Simulation de données avec les 4 couleurs officielles
  const getMockEvents = (day: number) => {
    if (day === 2) return [{ label: "Maintenance curative", time: "09:00", color: "#0ea5e9", status: "En cours" }];
    if (day === 3) return [{ label: "Maintenance", time: "15:00", color: "#000000", status: "Planifié" }];
    if (day === 4) return [{ label: "Maintenance", time: "10:00", color: "#ef4444", status: "En retard" }];
    if (day === 11 || day === 19 || day === 24) return [{ label: "Maintenance", time: "15:00", color: "#000000", status: "Planifié" }];
    if (day === 31) return [{ label: "Maintenance preventive", time: "15:00", color: "#22c55e", status: "Réalisé" }];
    return [];
  };

  const filteredDays = days.map((_, i) => {
    const day = i + 1;
    const events = getMockEvents(day);

    const filteredEvents = events.filter(e =>
      e.label.toLowerCase().includes((search || "").toLowerCase()) ||
      e.status.toLowerCase().includes((search || "").toLowerCase())
    );

    return { day, events: filteredEvents };
  });

  return (
    <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-xl overflow-hidden">
      {filteredDays.map(({ day, events }) => (
        <DayCell 
          key={day} 
          day={day} 
          events={events} 
          onClick={onEventClick} // On passe la fonction de clic
        />
      ))}
    </div>
  );
}