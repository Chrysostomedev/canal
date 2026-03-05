'use client';

import { Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_COLORS, type ThemeColor } from '../../lib/theme-config';

export default function ThemePicker() {
  const { theme, setThemeColor } = useTheme();

  return (
    <div className="space-y-4">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
        Couleur du thème
      </p>
      <div className="grid grid-cols-2 gap-3">
        {THEME_COLORS.map((color) => {
          const isActive = theme.color === color.id;
          return (
            <button
              key={color.id}
              onClick={() => setThemeColor(color.id)}
              className={`
                flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all
                ${isActive 
                  ? 'border-slate-900 bg-slate-50 shadow-md' 
                  : 'border-slate-100 hover:border-slate-300'
                }
              `}
            >
              {/* Preview couleur */}
              <div 
                className="w-full h-12 rounded-xl border-2 flex items-center justify-center"
                style={{
                  backgroundColor: color.preview.bg,
                  borderColor: color.preview.primary,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: color.preview.primary }}
                />
              </div>

              {/* Label */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-lg">{color.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black truncate ${
                    isActive ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {color.label}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {color.description}
                  </p>
                </div>
                {isActive && (
                  <Check size={14} className="text-slate-900 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-4">
        Les changements s'appliquent instantanément à toute l'application.
      </p>
    </div>
  );
}