function BrandMark({ compact = false, inverse = false }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="Borrow My Stuff">
      <svg className="h-10 w-10 shrink-0" viewBox="0 0 48 48" role="img" aria-label="Borrow My Stuff exchange mark">
        <rect x="1" y="1" width="46" height="46" rx="12" fill={inverse ? "#fffdf9" : "#175c58"} />
        <path d="M10 22c1.7-6.5 8.6-10.1 14.7-7.1l3.1 1.6" fill="none" stroke={inverse ? "#175c58" : "#d88968"} strokeLinecap="round" strokeWidth="3" />
        <path d="m25.4 12.8 3.2 3.7-4.9.4" fill="none" stroke={inverse ? "#175c58" : "#d88968"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
        <path d="M38 26c-1.7 6.5-8.6 10.1-14.7 7.1l-3.1-1.6" fill="none" stroke={inverse ? "#d88968" : "#b8d5a9"} strokeLinecap="round" strokeWidth="3" />
        <path d="m22.6 35.2-3.2-3.7 4.9-.4" fill="none" stroke={inverse ? "#d88968" : "#b8d5a9"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
        <path d="M16 20h16v12H16z" fill={inverse ? "#175c58" : "#fffdf9"} />
        <path d="M16 20h16M20 24h8M20 28h5" fill="none" stroke={inverse ? "#fffdf9" : "#175c58"} strokeLinecap="round" strokeWidth="1.7" />
      </svg>
      {!compact && <span className={`font-display text-xl font-bold tracking-tight ${inverse ? "text-[#fffdf9]" : "text-[#17213d]"}`}>Borrow My Stuff</span>}
    </span>
  )
}

export default BrandMark
