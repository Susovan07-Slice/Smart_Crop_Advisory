import React from 'react';

const CreditScoreGauge = ({ score = 0, category = "Very Low", hasLoan = false, onEditLoan }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const needleAngle = -90 + (normalizedScore / 100) * 180;

  const getCategoryTheme = (cat) => {
    switch (cat.toLowerCase()) {
      case 'very low':
        return { text: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300' };
      case 'low':
        return { text: 'text-teal-700', bg: 'bg-teal-100', border: 'border-teal-300' };
      case 'moderate':
        return { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300' };
      case 'high':
        return { text: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' };
      case 'very high':
        return { text: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' };
      default:
        return { text: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300' };
    }
  };

  const theme = getCategoryTheme(category);

  return (
    <div className="flex items-center bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3.5 py-2 shadow-xs gap-3">
      {/* Semi-Circular Arc Gauge SVG */}
      <div className="relative w-24 h-12 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          {/* Colored Gauge Arcs */}
          <path d="M 10 50 A 40 40 0 0 1 22.36 21.72" fill="none" stroke="#10b981" strokeWidth="9" strokeLinecap="round" />
          <path d="M 22.36 21.72 A 40 40 0 0 1 43.05 10.49" fill="none" stroke="#14b8a6" strokeWidth="9" />
          <path d="M 43.05 10.49 A 40 40 0 0 1 63.82 11.23" fill="none" stroke="#f59e0b" strokeWidth="9" />
          <path d="M 63.82 11.23 A 40 40 0 0 1 83.18 24.34" fill="none" stroke="#f97316" strokeWidth="9" />
          <path d="M 83.18 24.34 A 40 40 0 0 1 90 50" fill="none" stroke="#ef4444" strokeWidth="9" strokeLinecap="round" />

          {/* Pivot Dot */}
          <circle cx="50" cy="50" r="4" fill="#334155" />

          {/* Needle */}
          <g transform={`rotate(${needleAngle}, 50, 50)`}>
            <line x1="50" y1="50" x2="50" y2="16" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="2.5" fill="#f8fafc" />
          </g>
        </svg>
      </div>

      {/* Info Column */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">FINANCIAL DISTRESS</span>
          <button
            onClick={onEditLoan}
            className="text-[9px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 py-0.5 rounded transition-colors shadow-2xs"
          >
            {hasLoan ? "Edit Loan" : "+ Add Loan"}
          </button>
        </div>

        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-lg font-black text-slate-800 tracking-tight">{normalizedScore.toFixed(0)}</span>
          <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}>
            {category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreGauge;
