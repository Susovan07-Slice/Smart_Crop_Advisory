import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Info, ArrowRight, Wallet, Percent, Wheat, Calculator } from 'lucide-react';

const CreditScoreGauge = ({ score = 0, category = "Very Low", hasLoan = false, onEditLoan }) => {
  const { t } = useLanguage();
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine category theme based on normalized distress score (0-100)
  const getScoreTheme = (s) => {
    if (s <= 35) {
      return {
        badgeText: `${t('very_low')} ${t('financial_distress')}`,
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
        barColor: "bg-emerald-500",
        message: t('good_position_msg'),
        loanBurdenPct: 25,
        loanBurdenLevel: t('level_low'),
        interestBurdenPct: 20,
        interestBurdenLevel: t('level_low'),
        incomeRiskPct: 30,
        incomeRiskLevel: t('level_low'),
        repaymentPct: 85,
        repaymentLevel: t('level_good')
      };
    } else if (s <= 65) {
      return {
        badgeText: `${t('moderate')} ${t('financial_distress')}`,
        badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
        barColor: "bg-amber-500",
        message: t('moderate_position_msg'),
        loanBurdenPct: 55,
        loanBurdenLevel: t('level_moderate'),
        interestBurdenPct: 50,
        interestBurdenLevel: t('level_moderate'),
        incomeRiskPct: 60,
        incomeRiskLevel: t('level_moderate'),
        repaymentPct: 55,
        repaymentLevel: t('level_fair')
      };
    } else {
      return {
        badgeText: `${t('high')} ${t('financial_distress')}`,
        badgeClass: "bg-red-100 text-red-800 border-red-300",
        barColor: "bg-red-500",
        message: t('high_position_msg'),
        loanBurdenPct: 85,
        loanBurdenLevel: t('level_high'),
        interestBurdenPct: 80,
        interestBurdenLevel: t('level_high'),
        incomeRiskPct: 85,
        incomeRiskLevel: t('level_high'),
        repaymentPct: 25,
        repaymentLevel: t('level_critical')
      };
    }
  };

  const theme = getScoreTheme(normalizedScore);

  return (
    <div className="bg-white/95 backdrop-blur-md border border-emerald-200/90 rounded-3xl p-5 sm:p-6 shadow-xs w-full flex flex-col md:flex-row items-stretch justify-between gap-6 transition-all">
      
      {/* Left Column: Score & Status Overview */}
      <div className="flex-1 flex flex-col justify-between space-y-3 pr-0 md:pr-4 md:border-r border-gray-100">
        
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-100/90 rounded-2xl border border-emerald-200 shadow-2xs">
            <Sprout className="h-6 w-6 text-emerald-700 shrink-0" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              {t('financial_health_title')}
              <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-gray-600" title={t('financial_distress_subtitle')} />
            </h3>
            <p className="text-xs text-gray-500 font-medium">{t('financial_distress_subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 my-1 flex-wrap gap-2">
          <span className="text-4xl font-black text-emerald-700 tracking-tight font-mono">
            {normalizedScore}
          </span>
          <span className="text-sm font-bold text-gray-400">/ 100</span>

          <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${theme.badgeClass}`}>
            {theme.badgeText}
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-600 italic">
          "{theme.message}"
        </p>
      </div>

      {/* Right Column: 4 Breakdown Metrics Bars */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5 pl-0 md:pl-2">
        
        {/* Metric 1: Loan Burden */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className="p-1 bg-emerald-50 rounded-lg text-emerald-700">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-gray-700 truncate">{t('loan_burden_label')}</span>
          </div>

          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/60 mx-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${theme.barColor}`} 
              style={{ width: `${theme.loanBurdenPct}%` }}
            />
          </div>

          <span className="text-[11px] font-extrabold text-gray-600 w-16 text-right shrink-0">
            {theme.loanBurdenLevel}
          </span>
        </div>

        {/* Metric 2: Interest Burden */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className="p-1 bg-emerald-50 rounded-lg text-emerald-700">
              <Percent className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-gray-700 truncate">{t('interest_burden_label')}</span>
          </div>

          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/60 mx-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${theme.barColor}`} 
              style={{ width: `${theme.interestBurdenPct}%` }}
            />
          </div>

          <span className="text-[11px] font-extrabold text-gray-600 w-16 text-right shrink-0">
            {theme.interestBurdenLevel}
          </span>
        </div>

        {/* Metric 3: Income Risk */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className="p-1 bg-amber-50 rounded-lg text-amber-700">
              <Wheat className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-gray-700 truncate">{t('income_risk_label')}</span>
          </div>

          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/60 mx-2">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500" 
              style={{ width: `${theme.incomeRiskPct}%` }}
            />
          </div>

          <span className="text-[11px] font-extrabold text-amber-700 w-16 text-right shrink-0">
            {theme.incomeRiskLevel}
          </span>
        </div>

        {/* Metric 4: Repayment Capacity */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className="p-1 bg-blue-50 rounded-lg text-blue-700">
              <Calculator className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-gray-700 truncate">{t('repayment_capacity_label')}</span>
          </div>

          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200/60 mx-2">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${theme.repaymentPct}%` }}
            />
          </div>

          <span className="text-[11px] font-extrabold text-emerald-700 w-16 text-right shrink-0">
            {theme.repaymentLevel}
          </span>
        </div>

        {/* Edit Financial & Loan Profile Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onEditLoan}
            className="flex items-center text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 px-4 py-2 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>💳 Edit Financial & Loan Profile</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default CreditScoreGauge;
