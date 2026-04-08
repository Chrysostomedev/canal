"use client";

import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import FormButton from "./form/FormButton";
import { useLanguage } from "../../contexts/LanguageContext";

interface DetailField {
  label: string;
  value: string;
  isStatus?: boolean;
  statusColor?: string;
}

interface SideDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  reference?: string;
  fields: DetailField[];
  descriptionContent?: string;
  onEdit?: () => void;
}

export default function SideDetailsPanel({
  isOpen, onClose, title, subtitle, reference, fields, descriptionContent, onEdit,
}: SideDetailsPanelProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!reference) return;
    await navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultSubtitle = subtitle ?? t("common.back");

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[550px] bg-white z-[9999] shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="p-8 pb-4 space-y-4">
          <div className="flex justify-start">
            <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors">
              <X size={22} className="text-slate-600" />
            </button>
          </div>
          <div className="text-left">
            <h2 className="text-[28px] font-black text-slate-900 leading-tight tracking-tight uppercase">{title}</h2>
            <p className="text-slate-500 text-[14px] mt-1 font-medium">{defaultSubtitle}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 custom-scrollbar">
          {reference && (
            <div className="flex items-center justify-between p-5 bg-slate-50/80 border border-slate-100 rounded-2xl">
              <span className="text-slate-400 font-medium">{t("common.reference")}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-wider">{reference}</span>
                <button onClick={handleCopy} className="p-1.5 hover:bg-white rounded-md transition-all border border-transparent hover:border-slate-200">
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-slate-400" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                <span className="text-slate-400 text-[15px] font-medium">{field.label}</span>
                {field.isStatus ? (
                  <div
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full border"
                    style={{ backgroundColor: `${field.statusColor}15`, borderColor: `${field.statusColor}30` }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: field.statusColor || "#000" }} />
                    <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color: field.statusColor || "#334155" }}>
                      {field.value}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-900 text-[15px] font-bold text-right ml-4">{field.value}</span>
                )}
              </div>
            ))}
          </div>

          {descriptionContent && (
            <div className="space-y-3 pb-10">
              <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
                <p className="text-slate-600 text-[15px] leading-relaxed font-medium">{descriptionContent}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
          <FormButton variant="secondary" onClick={onClose} className="flex-1">{t("common.cancel")}</FormButton>
          <FormButton variant="primary" onClick={onEdit} className="flex-1">{t("common.edit")}</FormButton>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );
}
