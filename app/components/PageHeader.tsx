export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <>
      {/* Spacer invisible qui réserve la hauteur */}
      <div className="h-[130px]" />

      {/* Header fixe */}
      <div className="fixed top-20 left-64 right-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="p-8 flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            {title}
          </h1>
          <p className="text-slate-500 max-w-2xl  text-sm">
            {subtitle}
          </p>
        </div>
      </div>
    </>
  );
}
