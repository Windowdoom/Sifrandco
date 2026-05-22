export function Wordmark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="font-serif text-[2.1rem] font-normal tracking-[-0.02em] text-tayba-900 dark:text-paper-50">
        Tasneem
      </div>
      <div className="arabic mt-0.5 text-[1.5rem] font-medium text-gold-600">تَسْنِيم</div>
      {subtitle && (
        <div className="mt-2 text-[10.5px] uppercase tracking-[0.28em] text-tayba-900/65 dark:text-paper-200/60">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        {kicker && <div className="text-[10px] uppercase tracking-[0.28em] text-gold-600">{kicker}</div>}
        <h2 className="mt-1 font-serif text-[1.85rem] font-normal tracking-[-0.018em] text-tayba-900 dark:text-paper-50">{title}</h2>
      </div>
    </div>
  );
}
