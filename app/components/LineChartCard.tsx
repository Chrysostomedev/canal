"use client";

import { ChevronRight } from "lucide-react";

interface LineChartCardProps {
  title: string;
  // On s'attend à recevoir 12 mois de données
  data: { label: string; value: number }[];
}

export default function LineChartCard({ title, data }: LineChartCardProps) {
  const height = 200; 
  const width = 800;
  const scaleMax = 100; // Graduation forcée à 100
  
  // Calcul des points basé sur une échelle de 0 à 100
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    // On garde 40px de padding en haut pour le badge
    y: height - (d.value / scaleMax) * (height - 40) 
  }));

  const d = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const cp1x = a[i - 1].x + (p.x - a[i - 1].x) / 2;
    return `${acc} C ${cp1x},${a[i - 1].y} ${cp1x},${p.y} ${p.x},${p.y}`;
  }, "");

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 h-full flex flex-col">
      <h3 className="text-[17px] font-semibold text-slate-500 mb-8 uppercase tracking-tight">
        {title}
      </h3>
      
      <div className="relative flex-1 flex">
        {/* AXE DES ORDONNÉES (Y) - Gradué de 0 à 100 */}
        <div className="flex flex-col justify-between text-[11px] font-bold text-slate-300 pr-4 pb-8 mb-4">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span className="text-slate-400">0</span>
        </div>

        <div className="relative flex-1 flex flex-col justify-end">
          {/* ZONE GRAPHIQUE */}
          <div className="relative w-full h-[220px]">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grille de fond alignée sur les paliers de 20% */}
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => (
                <line 
                  key={p} 
                  x1="0" 
                  y1={p * height} 
                  x2={width} 
                  y2={p * height} 
                  stroke="#F8FAFC" 
                  strokeWidth="2" 
                />
              ))}
              
              <path 
                d={d} 
                fill="none" 
                stroke="black" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />
              
            
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
    
    {/* MODIFICATION ICI : On cible l'index 5 (JUIN) au lieu du dernier mois */}
    {i === 5 && ( 
      <>
        {/* Ligne en pointillés bleue qui descend du point */}
        <line 
          x1={p.x} y1={p.y} 
          x2={p.x} y2={height} 
          stroke="#6366F1" 
          strokeDasharray="4 4" 
          strokeWidth="2"
        />
        {/* Badge Noir avec la valeur 2,678 */}
        <foreignObject x={p.x - 45} y={p.y - 50} width="90" height="40">
          <div className="bg-black text-white text-[13px] font-black rounded-xl py-2 shadow-2xl text-center">
            2,678
          </div>
        </foreignObject>
      </>
    )}
  </g>
))}
            </svg>
          </div>
          
          {/* AXE DES ABSCISSES (X) - 12 Mois */}
          <div className="flex justify-between items-center pt-6 border-t-2 border-slate-100">
            {data.map(d => (
              <span 
                key={d.label} 
                className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter"
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}