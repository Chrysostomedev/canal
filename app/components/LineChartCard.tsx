"use client";

// Noms des mois pour l'axe X
const MOIS_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

interface LineChartCardProps {
  title: string;
  // Données réelles : [{annee, mois, total}] depuis l'API
  // ou [{label, value}] pour compatibilité statique
  data: { label?: string; value?: number; annee?: number; mois?: number; total?: number }[];
}

export default function LineChartCard({ title, data }: LineChartCardProps) {
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 200;
  const PADDING_TOP = 40; // espace pour le badge
  const PADDING_LEFT = 0;

  // Normalise les données : accepte les deux formats API et statique
  // Format API : {annee, mois, total} → on génère les 12 mois complets avec 0 si absent
  const isApiFormat = data.length > 0 && "mois" in data[0];

  let normalizedData: { label: string; value: number }[];

  if (isApiFormat) {
    // Construit un map mois → total
    const map: Record<number, number> = {};
    data.forEach(d => { if (d.mois && d.total !== undefined) map[d.mois] = d.total; });
    // Génère les 12 mois avec 0 si absent
    normalizedData = MOIS_LABELS.map((label, i) => ({
      label,
      value: map[i + 1] ?? 0,
    }));
  } else {
    // Format statique {label, value}
    normalizedData = data.map(d => ({ label: d.label ?? "", value: d.value ?? 0 }));
  }

  const values = normalizedData.map(d => d.value);
  const maxValue = Math.max(...values, 1); // Évite division par 0
  const minValue = Math.min(...values);

  // Calcule le point le plus haut pour le badge dynamique
  const peakIndex = values.indexOf(Math.max(...values));

  // Graduation Y dynamique basée sur le max réel
  const ySteps = 5;
  const stepValue = Math.ceil(maxValue / ySteps);
  const yAxisLabels = Array.from({ length: ySteps + 1 }, (_, i) => stepValue * (ySteps - i));

  // Calcule les coordonnées SVG de chaque point
  const points = normalizedData.map((d, i) => ({
    x: (i / (normalizedData.length - 1)) * SVG_WIDTH,
    // Mappe la valeur entre PADDING_TOP et SVG_HEIGHT
    y: SVG_HEIGHT - ((d.value - 0) / (maxValue - 0 || 1)) * (SVG_HEIGHT - PADDING_TOP),
    value: d.value,
    label: d.label,
  }));

  // Construit le path SVG en courbe de Bézier cubique
  const pathD = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const cp1x = arr[i - 1].x + (p.x - arr[i - 1].x) / 2;
    return `${acc} C ${cp1x},${arr[i - 1].y} ${cp1x},${p.y} ${p.x},${p.y}`;
  }, "");

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 h-full flex flex-col">
      <h3 className="text-[17px] font-semibold text-slate-500 mb-8 uppercase tracking-tight">
        {title}
      </h3>

      <div className="relative flex-1 flex">
        {/* Axe Y dynamique */}
        <div className="flex flex-col justify-between text-[11px] font-bold text-slate-300 pr-4 pb-8">
          {yAxisLabels.map((label) => (
            <span key={label}>
              {label >= 1000 ? `${Math.round(label / 1000)}K` : label}
            </span>
          ))}
        </div>

        <div className="relative flex-1 flex flex-col">
          {/* Zone graphique SVG */}
          <div className="relative w-full h-[220px]">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Lignes de grille horizontales */}
              {yAxisLabels.map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={(i / ySteps) * SVG_HEIGHT}
                  x2={SVG_WIDTH}
                  y2={(i / ySteps) * SVG_HEIGHT}
                  stroke="#F8FAFC"
                  strokeWidth="2"
                />
              ))}

              {/* Courbe principale */}
              <path
                d={pathD}
                fill="none"
                stroke="black"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Points + badge dynamique sur le pic */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="white"
                    stroke="#CBD5E1"
                    strokeWidth="2"
                  />

                  {/* Badge sur le point le plus haut */}
                  {i === peakIndex && p.value > 0 && (
                    <>
                      {/* Ligne pointillée violette */}
                      <line
                        x1={p.x} y1={p.y}
                        x2={p.x} y2={SVG_HEIGHT}
                        stroke="#6366F1"
                        strokeDasharray="4 4"
                        strokeWidth="2"
                      />
                      {/* Badge dynamique avec la vraie valeur */}
                      <foreignObject x={p.x - 45} y={p.y - 50} width="90" height="40">
                        <div className="bg-black text-white text-[13px] font-black rounded-xl py-2 shadow-2xl text-center">
                          {p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}K` : p.value}
                        </div>
                      </foreignObject>
                    </>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Axe X — labels mois — mt-8 pour descendre par rapport au SVG */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t-2 border-slate-100">
            {normalizedData.map(d => (
              <span key={d.label} className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}