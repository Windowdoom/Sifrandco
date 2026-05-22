export function Wordmark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="font-serif text-3xl tracking-tight text-tayba-700 dark:text-paper-50">
        Tasneem
      </div>
      <div className="arabic mt-0.5 text-2xl text-gold-500">تَسْنِيم</div>
      {subtitle && (
        <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-tayba-900/50 dark:text-paper-200/60">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        {kicker && <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">{kicker}</div>}
        <h2 className="font-serif text-2xl text-tayba-700 dark:text-paper-50">{title}</h2>
      </div>
    </div>
  );
}
