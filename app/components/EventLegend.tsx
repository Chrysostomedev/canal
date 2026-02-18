"use client";

const LEGEND_ITEMS = [
  { label: "Planifier", color: "#000000", bg: "#f1f5f9" },
  { label: "En cours", color: "#0ea5e9", bg: "#e0f2fe" },
  { label: "En retard", color: "#ef4444", bg: "#fef2f2" },
  { label: "Réalisé", color: "#22c55e", bg: "#f0fdf4" },
];

export default function EventLegend({ search = "" }: { search?: string }) {
  const UPCOMING_DATA = [
    { label: "Maintenance curative", color: "#000000", time: "10:00" },
    { label: "Maintenance préventive", color: "#000000", time: "13:00" },
    { label: "Maintenance curative", color: "#000000", time: "15:00" },
  ];

  const filteredItems = UPCOMING_DATA.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Légende en Badges comme sur l'image */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-400">Légende</h3>
        <div className="grid grid-cols-2 gap-2">
          {LEGEND_ITEMS.map((item) => (
            <div 
              key={item.label} 
              style={{ backgroundColor: item.bg }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Évènements à venir */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-400">Évènement à venir</h3>
        <div className="space-y-4">
          {filteredItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-black" />
                <span className="font-semibold text-slate-800">{item.label}</span>
              </div>
              <span className="text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}