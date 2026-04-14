"use client";
import React, { useRef, useState, useCallback } from "react";
import {
  Eye, EyeOff, Calendar,
  Bold, Italic, Underline, List, Strikethrough,
  Palette, Highlighter, AlignLeft, AlignCenter, AlignRight,
  CornerDownLeft, Plus, Minus, ImagePlus, X, Upload, FileText, ChevronDown
} from "lucide-react";

// Input Standard
export const FormField = ({ label, required, children }: any) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-bold text-slate-900 tracking-tight">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// Input Texte
export const Input = (props: any) => (
  <input
    {...props}
    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all outline-none"
  />
);

// Select (Style "Dropdown")
export const Select = ({ children, disabled, ...props }: any) => (
  <div className="relative">
    <select
      {...props}
      disabled={disabled}
      className={`w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-slate-900 transition-all ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
    >
      {children}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#64748B" strokeWidth="2" strokeLinecap="round" /></svg>
    </div>
  </div>
);

// Champ Password
export const PasswordInput = ({ disabled, ...props }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        disabled={disabled}
        type={show ? "text" : "password"}
        className={`w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 transition-all ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      />
      {!disabled && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

// Champ Date
export const DateInput = ({ disabled, ...props }: any) => (
  <div className="relative">
    <input
      {...props}
      disabled={disabled}
      type="date"
      className={`w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 transition-all appearance-none ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
    />
    <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

// ─── IMAGE UPLOAD ──────────────────────────────────────────────────────────────
interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export const ImageUpload = ({
  name,
  maxImages = 3,
  accept = "image/*",
}: {
  name?: string;
  maxImages?: number;
  accept?: string;
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const incoming = Array.from(files).slice(0, maxImages - images.length);
      const newImages: ImageFile[] = incoming.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages].slice(0, maxImages));
    },
    [images.length, maxImages]
  );

  const remove = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const canAdd = images.length < maxImages;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Drop zone - hidden when full */}
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 w-full
            min-h-[140px] rounded-3xl cursor-pointer select-none
            transition-all duration-200
            ${dragging
              ? "bg-slate-900 ring-2 ring-slate-900 ring-offset-2"
              : "bg-slate-50 hover:bg-slate-100"
            }
          `}
        >
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200
            ${dragging ? "bg-white/20" : "bg-white shadow-sm"}
          `}>
            <Upload
              size={22}
              className={dragging ? "text-white" : "text-slate-500"}
              strokeWidth={2}
            />
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold transition-colors duration-200 ${dragging ? "text-white" : "text-slate-700"}`}>
              {dragging ? "Déposez ici" : "Glissez vos images"}
            </p>
            <p className={`text-xs mt-0.5 transition-colors duration-200 ${dragging ? "text-white/70" : "text-slate-400"}`}>
              ou cliquez pour parcourir · {images.length}/{maxImages} image{maxImages > 1 ? "s" : ""}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={maxImages > 1}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
            name={name}
          />
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className={`grid gap-3 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {images.map((img, i) => (
            <div
              key={img.id}
              className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-square"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Image */}
              <img
                src={img.preview}
                alt={img.file.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-200 rounded-2xl" />

              {/* File name chip */}
              <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-[10px] font-semibold text-white truncate bg-slate-900/60 backdrop-blur-sm rounded-xl px-2 py-1">
                  {img.file.name}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="
                  absolute top-2 right-2 w-7 h-7 rounded-xl
                  flex items-center justify-center
                  bg-white/90 hover:bg-white shadow-sm
                  opacity-0 group-hover:opacity-100
                  transition-all duration-150 active:scale-90
                "
              >
                <X size={14} strokeWidth={2.5} className="text-slate-700" />
              </button>

              {/* Index badge */}
              <div className="absolute top-2 left-2 w-5 h-5 rounded-lg bg-slate-900/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[9px] font-bold text-white">{i + 1}</span>
              </div>
            </div>
          ))}

          {/* Inline "add more" slot when grid has space */}
          {canAdd && images.length > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                aspect-square rounded-2xl border-2 border-dashed border-slate-200
                flex flex-col items-center justify-center gap-1.5
                hover:border-slate-400 hover:bg-slate-50
                transition-all duration-200 active:scale-95
              "
            >
              <ImagePlus size={20} strokeWidth={2} className="text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-400">Ajouter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── PHONE INPUT ──────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "CI", flag: "🇨🇮", dial: "+225", name: "Côte d'Ivoire" },
  { code: "SN", flag: "🇸🇳", dial: "+221", name: "Sénégal" },
  { code: "ML", flag: "🇲🇱", dial: "+223", name: "Mali" },
  { code: "BF", flag: "🇧🇫", dial: "+226", name: "Burkina Faso" },
  { code: "GN", flag: "🇬🇳", dial: "+224", name: "Guinée" },
  { code: "TG", flag: "🇹🇬", dial: "+228", name: "Togo" },
  { code: "BJ", flag: "🇧🇯", dial: "+229", name: "Bénin" },
  { code: "NE", flag: "🇳🇪", dial: "+227", name: "Niger" },
  { code: "CM", flag: "🇨🇲", dial: "+237", name: "Cameroun" },
  { code: "GA", flag: "🇬🇦", dial: "+241", name: "Gabon" },
  { code: "CG", flag: "🇨🇬", dial: "+242", name: "Congo" },
  { code: "CD", flag: "🇨🇩", dial: "+243", name: "RD Congo" },
  { code: "MG", flag: "🇲🇬", dial: "+261", name: "Madagascar" },
  { code: "MA", flag: "🇲🇦", dial: "+212", name: "Maroc" },
  { code: "DZ", flag: "🇩🇿", dial: "+213", name: "Algérie" },
  { code: "TN", flag: "🇹🇳", dial: "+216", name: "Tunisie" },
  { code: "FR", flag: "🇫🇷", dial: "+33", name: "France" },
  { code: "BE", flag: "🇧🇪", dial: "+32", name: "Belgique" },
  { code: "CH", flag: "🇨🇭", dial: "+41", name: "Suisse" },
  { code: "US", flag: "🇺🇸", dial: "+1", name: "États-Unis" },
  { code: "GB", flag: "🇬🇧", dial: "+44", name: "Royaume-Uni" },
  { code: "DE", flag: "🇩🇪", dial: "+49", name: "Allemagne" },
  { code: "ES", flag: "🇪🇸", dial: "+34", name: "Espagne" },
  { code: "IT", flag: "🇮🇹", dial: "+39", name: "Italie" },
  { code: "PT", flag: "🇵🇹", dial: "+351", name: "Portugal" },
  { code: "CN", flag: "🇨🇳", dial: "+86", name: "Chine" },
  { code: "JP", flag: "🇯🇵", dial: "+81", name: "Japon" },
  { code: "IN", flag: "🇮🇳", dial: "+91", name: "Inde" },
];

export interface PhoneInputProps {
  name: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

// Seul la Côte d'Ivoire est active pour l'instant
const ACTIVE_COUNTRIES = new Set(["CI"]);

export const PhoneInput = ({
  name,
  required,
  disabled,
  defaultValue = "",
  onChange,
}: PhoneInputProps) => {
  const parseDefault = (val: string) => {
    if (!val) return { country: COUNTRIES[0], number: "" };
    const matched = COUNTRIES.find(c => val.startsWith(c.dial));
    if (matched) return { country: matched, number: val.slice(matched.dial.length).trim() };
    return { country: COUNTRIES[0], number: val };
  };

  const parsed = parseDefault(defaultValue);
  const [selected, setSelected] = useState(parsed.country);
  const [number, setNumber] = useState(parsed.number);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fullValue = `${selected.dial}${number}`;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d\s\-]/g, "");
    setNumber(val);
    onChange?.(`${selected.dial}${val}`);
  };

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    if (!ACTIVE_COUNTRIES.has(country.code)) return; // bloque les pays inactifs
    setSelected(country);
    setOpen(false);
    setSearch("");
    onChange?.(`${country.dial}${number}`);
  };

  const filtered = search
    ? COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    )
    : COUNTRIES;

  return (
    <div className="space-y-1">
      <input type="hidden" name={name} value={fullValue} />

      <div className="flex items-stretch bg-slate-50 rounded-2xl overflow-visible relative" ref={dropRef}>
        {/* Country selector */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-3.5 border-r border-slate-200 shrink-0 hover:bg-slate-100 transition rounded-l-2xl ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className="text-xl leading-none">{selected.flag}</span>
          <span className="text-xs font-bold text-slate-600 tabular-nums">{selected.dial}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Number input */}
        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          disabled={disabled}
          required={required}
          placeholder="07 00 00 00 00"
          className={`flex-1 bg-transparent p-4 pl-3 text-slate-700 placeholder:text-slate-400 outline-none focus:ring-0 text-sm font-medium ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 mt-1 z-[200] w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-4">Aucun résultat</p>
              ) : filtered.map(c => {
                const isActive = ACTIVE_COUNTRIES.has(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    disabled={!isActive}
                    title={!isActive ? "Pays non actif pour l'instant" : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${selected.code === c.code ? "bg-slate-100" : ""
                      } ${isActive ? "hover:bg-slate-50 cursor-pointer" : "opacity-40 cursor-not-allowed bg-slate-50/50"}`}
                  >
                    <span className="text-xl leading-none shrink-0">{c.flag}</span>
                    <span className={`flex-1 text-sm font-medium truncate ${isActive ? "text-slate-700" : "text-slate-400"}`}>
                      {c.name}
                      {!isActive && <span className="ml-2 text-[10px] text-slate-400 italic">Non actif</span>}
                    </span>
                    <span className={`text-xs font-bold tabular-nums shrink-0 ${isActive ? "text-slate-400" : "text-slate-300"}`}>
                      {c.dial}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 font-medium pl-1">
        Cliquez sur le drapeau pour changer l'indicatif · Seule la Côte d'Ivoire est disponible
      </p>
    </div>
  );
};

// ─── RICH TEXT EDITOR ─────────────────────────────────────────────────────────
export const RichTextEditor = ({ label, placeholder, name, defaultValue }: any) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Initialise le contenu à chaque changement de defaultValue (y compris vide)
  React.useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue ?? "";
      if (hiddenRef.current) hiddenRef.current.value = defaultValue ?? "";
    }
  }, [defaultValue]);

  const applyStyle = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const changeFontSize = (delta: number) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    applyStyle("fontSize", delta > 0 ? "5" : "2");
  };

  /** Nettoie le HTML vide (<div><br></div>, <br> seul, etc.) */
  const cleanHtml = (html: string): string => {
    return html
      .replace(/<div><br\s*\/?><\/div>/gi, "")
      .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "")
      .trim();
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const raw = e.currentTarget.innerHTML;
    const cleaned = cleanHtml(raw);
    if (hiddenRef.current) hiddenRef.current.value = cleaned;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="w-full bg-slate-50 rounded-3xl overflow-hidden border border-transparent focus-within:ring-2 focus-within:ring-slate-900 transition-all">
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-200/50 border-b border-slate-200">
          <ToolbarButton icon={Bold} onClick={() => applyStyle("bold")} />
          <ToolbarButton icon={Italic} onClick={() => applyStyle("italic")} />
          <ToolbarButton icon={Underline} onClick={() => applyStyle("underline")} />
          <ToolbarButton icon={Strikethrough} onClick={() => applyStyle("strikeThrough")} />

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          <ToolbarButton icon={Plus} onClick={() => changeFontSize(1)} title="Agrandir" />
          <ToolbarButton icon={Minus} onClick={() => changeFontSize(-1)} title="Réduire" />

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          <div className="relative">
            <ToolbarButton icon={Palette} onClick={() => colorInputRef.current?.click()} title="Couleur texte" />
            <input type="color" ref={colorInputRef} className="invisible absolute w-0 h-0" onChange={(e) => applyStyle("foreColor", e.target.value)} />
          </div>
          <div className="relative">
            <ToolbarButton icon={Highlighter} onClick={() => bgInputRef.current?.click()} title="Surligneur" />
            <input type="color" ref={bgInputRef} className="invisible absolute w-0 h-0" onChange={(e) => applyStyle("backColor", e.target.value)} />
          </div>

          <div className="w-[1px] h-4 bg-slate-300 mx-1" />

          <ToolbarButton icon={AlignLeft} onClick={() => applyStyle("justifyLeft")} />
          <ToolbarButton icon={AlignCenter} onClick={() => applyStyle("justifyCenter")} />
          <ToolbarButton icon={AlignRight} onClick={() => applyStyle("justifyRight")} />
          <ToolbarButton icon={List} onClick={() => applyStyle("insertUnorderedList")} />
          <ToolbarButton icon={CornerDownLeft} onClick={() => applyStyle("insertHorizontalRule")} title="Ligne de séparation" />
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full min-h-[180px] p-5 text-slate-700 outline-none bg-transparent prose prose-slate max-w-none leading-relaxed"
          onInput={handleInput}
        />
        <input type="hidden" name={name} id={`hidden-${name}`} ref={hiddenRef} />
      </div>
    </div>
  );
};


// ─── PDF UPLOAD ────────────────────────────────────────────────────────────────
interface PdfFile {
  id: string;
  file: File;
  name: string;
}

export const PdfUpload = ({
  name,
  maxPDFs = 1,
}: {
  name?: string;
  maxPDFs?: number;
}) => {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const incoming = Array.from(files)
        .filter(f => f.type === "application/pdf")
        .slice(0, maxPDFs - pdfs.length);

      const newPdfs: PdfFile[] = incoming.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        name: file.name
      }));
      setPdfs((prev) => [...prev, ...newPdfs].slice(0, maxPDFs));
    },
    [pdfs.length, maxPDFs]
  );

  const remove = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const canAdd = pdfs.length < maxPDFs;

  return (
    <div className="flex flex-col gap-3 w-full">
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 w-full
            min-h-[120px] rounded-3xl cursor-pointer select-none
            transition-all duration-200 border-2 border-dashed
            ${dragging
              ? "bg-slate-900 border-slate-900 ring-2 ring-slate-900 ring-offset-2"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
            }
          `}
        >
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200
            ${dragging ? "bg-white/20" : "bg-white shadow-sm"}
          `}>
            <Upload
              size={22}
              className={dragging ? "text-white" : "text-slate-500"}
              strokeWidth={2}
            />
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold transition-colors duration-200 ${dragging ? "text-white" : "text-slate-700"}`}>
              {dragging ? "Déposez ici" : "Cliquez pour uploader le PDF"}
            </p>
            <p className={`text-xs mt-0.5 transition-colors duration-200 ${dragging ? "text-white/70" : "text-slate-400"}`}>
              Format PDF uniquement · Max 10Mo
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple={maxPDFs > 1}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
            name={name}
          />
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="space-y-2">
          {pdfs.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-1"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black">Fichier PDF sélectionné</p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
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