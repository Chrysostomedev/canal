"use client";

import SideModal from "@/components/form/SideModal";
import FormButton from "@/components/form/FormButton";
import { FormField, Input, Select, PasswordInput, DateInput, RichTextEditor, ImageUpload, PdfUpload } from "@/components/form/FormInput";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "password" | "date" | "select" | "email" | "number" | "rich-text" | "image-upload" | "pdf-upload" | "textarea" | "tel";
  placeholder?: string;
  required?: boolean;
  gridSpan?: 1 | 2;
  options?: { label: string; value: string | number }[];
  icon?: any;
  maxImages?: number;
  maxPDFs?: number;
  disabled?: boolean;
}

interface ReusableFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  fields: FieldConfig[];
  onSubmit: (formData: Record<string, any>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  initialValues?: Record<string, any>;
  onFieldChange?: (name: string, value: any) => void;
}

export default function ReusableForm({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  onSubmit,
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  initialValues = {},
  onFieldChange,
}: ReusableFormProps) {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const formDataObj = Object.fromEntries(data.entries());
    onSubmit(formDataObj);
  };

  return (
    <SideModal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-180px)]">

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-8">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.gridSpan === 2 ? "col-span-2" : "col-span-2 md:col-span-1"}
              >
                <FormField label={field.label} required={field.required}>

                  {field.type === "image-upload" ? (
                    <ImageUpload
                      name={field.name}
                      maxImages={field.maxImages ?? 3}
                    />

                  ) : field.type === "pdf-upload" ? (
                    <PdfUpload
                      name={field.name}
                      maxPDFs={field.maxPDFs ?? 1}
                    />

                  ) : field.type === "select" ? (
                    <Select
                      name={field.name}
                      required={field.required}
                      disabled={field.disabled}
                      icon={field.icon}
                      defaultValue={String(initialValues[field.name] ?? "")}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        onFieldChange?.(field.name, e.target.value)
                      }
                    >
                      <option value="">Cliquez pour sélectionner</option>
                      {field.options?.map((opt, index) => (
                        <option key={`${opt.value}-${index}`} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>

                  ) : field.type === "rich-text" ? (
                    <RichTextEditor
                      label={field.label}
                      name={field.name}
                      placeholder={field.placeholder}
                      defaultValue={initialValues[field.name] ?? ""}
                    />

                  ) : field.type === "password" ? (
                    <PasswordInput
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      defaultValue={initialValues[field.name] ?? ""}
                    />

                  ) : field.type === "date" ? (
                    <DateInput
                      name={field.name}
                      required={field.required}
                      disabled={field.disabled}
                      icon={field.icon}
                      defaultValue={initialValues[field.name] ?? ""}
                    />

                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={field.disabled}
                      defaultValue={initialValues[field.name] ?? ""}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all min-h-[120px] resize-y text-sm font-medium"
                      onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                    />

                  ) : field.type === "tel" ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-2xl overflow-hidden">
                        <span className="pl-4 text-slate-400 text-sm font-medium shrink-0 select-none">+</span>
                        <Input
                          name={field.name}
                          type="tel"
                          placeholder={field.placeholder ?? "225 07 00 00 00 00"}
                          required={field.required}
                          disabled={field.disabled}
                          defaultValue={initialValues[field.name] ?? ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onFieldChange?.(field.name, e.target.value)
                          }
                          className="flex-1 bg-transparent border-none rounded-none p-4 pl-0 text-slate-700 placeholder:text-slate-400 focus:ring-0 outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium pl-1">
                        Format : indicatif pays + numéro (ex: +225 07 00 00 00 00)
                      </p>
                    </div>

                  ) : (
                    <Input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={field.disabled}
                      defaultValue={initialValues[field.name] ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onFieldChange?.(field.name, e.target.value)
                      }
                    />
                  )}

                </FormField>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-slate-100 flex gap-4 mt-auto">
          <FormButton type="button" variant="secondary" onClick={onClose} className="flex-1">
            {cancelLabel}
          </FormButton>
          <FormButton type="submit" variant="primary" className="flex-1">
            {submitLabel}
          </FormButton>
        </div>
      </form>
    </SideModal>
  );
}