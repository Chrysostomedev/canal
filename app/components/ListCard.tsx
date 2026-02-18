"use client";
import { ChevronRight } from "lucide-react";
import ActionHeader from "@/components/ActionHeader";

interface ListItem {
  name: string;
  subText: string; // "26 courses", "45 courses", etc.
}

interface ListCardProps {
  title: string;
  items: ListItem[];
}

export default function ListCard({ title, items }: ListCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
      {/* Utilisation de notre nouveau Header */}
      <ActionHeader title={title} />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-base leading-none">
                {item.name}
              </p>
              <p className="text-sm font-medium text-slate-400">
                {item.subText}
              </p>
            </div>

            <div className="text-slate-900 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={22} strokeWidth={3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}