"use client";
import React, { useRef } from "react";
import { Eye, EyeOff, Calendar,
  Bold, Italic, Underline, List, Quote, Type, Strikethrough, 
  Palette, Highlighter, AlignLeft, AlignCenter, AlignRight, 
  CornerDownLeft, Plus, Minus 
} from "lucide-react";

import { useState } from "react";

// Input Standard
export const FormField = ({ label, required, children }: any) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-bold text-slate-900  tracking-tight">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// Input Texte
export const Input = (props: any) => (
  <input 
    {...props} 
    className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all outline-none"
  />
);

// Select (Style "Dropdown")
export const Select = ({ children, ...props }: any) => (
  <div className="relative">
    <select 
      {...props} 
      className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-slate-900"
    >
      {children}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
       <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
  </div>
);

// Champ Password avec bascule de visibilité
export const PasswordInput = (props: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input 
        {...props} 
        type={show ? "text" : "password"}
        className="w-full bg-slate-100 border-none rounded-2xl p-4 pr-12 text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
      />
      <button 
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

// Champ Date avec icône
export const DateInput = (props: any) => (
  <div className="relative">
    <input 
      {...props} 
      type="date"
      className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 transition-all appearance-none"
    />
    <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);




// sous-composant pour le texterea

export const RichTextEditor = ({ label, placeholder, name }: any) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const applyStyle = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  // Gestion dynamique de la taille (ex: "3" pour normal, "5" pour grand)
  const changeFontSize = (delta: number) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    applyStyle("fontSize", delta > 0 ? "5" : "2");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-bold text-slate-900 uppercase tracking-tight">
          {label}
        </label>
      )}
      
      <div className="w-full bg-slate-100 rounded-3xl overflow-hidden border border-transparent focus-within:ring-2 focus-within:ring-slate-900 transition-all">
        {/* TOOLBAR RICHE */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-200/50 border-b border-slate-200">
          {/* Style de base */}
          <ToolbarButton icon={Bold} onClick={() => applyStyle("bold")} />
          <ToolbarButton icon={Italic} onClick={() => applyStyle("italic")} />
          <ToolbarButton icon={Underline} onClick={() => applyStyle("underline")} />
          <ToolbarButton icon={Strikethrough} onClick={() => applyStyle("strikeThrough")} />
          
          <div className="w-[1px] h-4 bg-slate-300 mx-1" />
          
          {/* Taille du texte */}
          <ToolbarButton icon={Plus} onClick={() => changeFontSize(1)} title="Agrandir" />
          <ToolbarButton icon={Minus} onClick={() => changeFontSize(-1)} title="Réduire" />

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Couleurs (Texte & Arrière-plan) */}
          <div className="relative">
            <ToolbarButton icon={Palette} onClick={() => colorInputRef.current?.click()} title="Couleur texte" />
            <input 
                type="color" ref={colorInputRef} className="invisible absolute w-0 h-0" 
                onChange={(e) => applyStyle("foreColor", e.target.value)} 
            />
          </div>
          <div className="relative">
            <ToolbarButton icon={Highlighter} onClick={() => bgInputRef.current?.click()} title="Surligneur" />
            <input 
                type="color" ref={bgInputRef} className="invisible absolute w-0 h-0" 
                onChange={(e) => applyStyle("backColor", e.target.value)} 
            />
          </div>

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          {/* Alignement & Structure */}
          <ToolbarButton icon={AlignLeft} onClick={() => applyStyle("justifyLeft")} />
          <ToolbarButton icon={AlignCenter} onClick={() => applyStyle("justifyCenter")} />
          <ToolbarButton icon={AlignRight} onClick={() => applyStyle("justifyRight")} />
          <ToolbarButton icon={List} onClick={() => applyStyle("insertUnorderedList")} />
          <ToolbarButton icon={CornerDownLeft} onClick={() => applyStyle("insertHorizontalRule")} title="Ligne de séparation" />
        </div>

        {/* ZONE D'ÉDITION */}
        <div 
          ref={editorRef}
          contentEditable 
          className="w-full min-h-[180px] p-5 text-slate-700 outline-none bg-transparent prose prose-slate max-w-none leading-relaxed"
          onInput={(e) => {
            const hiddenInput = document.getElementById(`hidden-${name}`) as HTMLInputElement;
            if (hiddenInput) hiddenInput.value = e.currentTarget.innerHTML;
          }}
        />
        <input type="hidden" name={name} id={`hidden-${name}`} />
      </div>
    </div>
  );
};

const ToolbarButton = ({ icon: Icon, onClick, title }: any) => (
  <button 
    type="button"
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-slate-900 transition-all active:scale-90"
  >
    <Icon size={18} strokeWidth={2.5} />
  </button>
);