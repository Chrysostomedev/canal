"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export type ActionButton = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

interface ActionGroupProps {
  // On rend la prop optionnelle ou on initialise par défaut pour éviter le undefined.map()
  actions?: ActionButton[]; 
}

export default function ActionGroup({ actions = [] }: ActionGroupProps) {
  // Si le tableau est vide, on ne retourne rien (propre)
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        const isPrimary = action.variant === "primary";

        return (
          <button
            key={`${action.label}-${index}`}
            onClick={action.onClick}
            className={`
              flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all duration-200 active:scale-95
              ${isPrimary 
                ? "bg-[#111] text-white hover:bg-black shadow-md shadow-slate-200" 
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            {IconComponent && <IconComponent size={18} strokeWidth={2.5} />}
            <span className="tracking-tight">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}