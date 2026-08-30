import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Info, ArrowRight, Wallet, Percent, Wheat, Calculator } from 'lucide-react';

const CreditScoreGauge = ({ score = 0, category = "Very Low", hasLoan = false, loanProfile = {}, onEditLoan, isDarkMode }) => {
  const { t } = useLanguage();
  
  // Distress Score ranges from 0 (very low distress) to 100 (high distress)
  const distressScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine category theme based on distress score
  const getScoreTheme = (dScore) => {
    if (dScore <= 35) {
      return {
        badgeText: `${t('very_low')} ${t('financial_distress')}`,
        badgeClass: isDarkMode ? "bg-emerald-900/70 text-emerald-300 border-emerald-700" : "bg-emerald-100 text-emerald-800 border-emerald-300",
        scoreColor: isDarkMode ? "text-emerald-400" : "text-emerald-600",
        barColor: "bg-emerald-500",
        message: t('good_position_msg'),
        loanBurdenPct: hasLoan ? Math.min(100, Math.round(((loanProfile.outstanding_principal || 50000) / (loanProfile.original_loan_amount || 100000)) * 100)) : 10,
        get loanBurdenLevel() {
          if (!hasLoan) return t('level_low');
          return this.loanBurdenPct >= 70 ? t('level_high') : (this.loanBurdenPct >= 40 ? t('level_moderate') : t('level_low'));
        },
        interestBurdenPct: hasLoan ? Math.min(100, Math.round(((loanProfile.annual_interest_rate || 7) / 18) * 100)) : 10,
        get interestBurdenLevel() {
          if (!hasLoan) return t('level_low');
          return this.interestBurdenPct >= 70 ? t('level_high') : (this.interestBurdenPct >= 40 ? t('level_moderate') : t('level_low'));
        },
        incomeRiskPct: 25,
        incomeRiskLevel: t('level_low'),
        repaymentPct: hasLoan ? Math.min(100, Math.round(((loanProfile.total_amount_repaid || 30000) / (loanProfile.original_loan_amount || 100000)) * 100)) : 90,
        get repaymentLevel() {
          if (!hasLoan) return t('level_good');
          return this.repaymentPct >= 50 ? t('level_good') : (this.repaymentPct >= 20 ? t('level_fair') : t('level_critical'));
        }
      };
    } else if (dScore <= 65) {
      return {
        badgeText: `${t('moderate')} ${t('financial_distress')}`,
        badgeClass: isDarkMode ? "bg-amber-900/70 text-amber-300 border-amber-700" : "bg-amber-100 text-amber-900 border-amber-300",
        scoreColor: isDarkMode ? "text-amber-400" : "text-amber-600",
        barColor: "bg-amber-500",
        message: t('moderate_position_msg'),
        loanBurdenPct: hasLoan ? Math.min(100, Math.round(((loanProfile.outstanding_principal || 50000) / (loanProfile.original_loan_amount || 100000)) * 100)) : 55,
        get loanBurdenLevel() {
          if (!hasLoan) return t('level_moderate');
          return this.loanBurdenPct >= 70 ? t('level_high') : (this.loanBurdenPct >= 40 ? t('level_moderate') : t('level_low'));
        },
        interestBurdenPct: hasLoan ? Math.min(100, Math.round(((loanProfile.annual_interest_rate || 7) / 18) * 100)) : 50,
        get interestBurdenLevel() {
          if (!hasLoan) return t('level_moderate');
          return this.interestBurdenPct >= 70 ? t('level_high') : (this.interestBurdenPct >= 40 ? t('level_moderate') : t('level_low'));
        },
        incomeRiskPct: 55,
        incomeRiskLevel: t('level_moderate'),
        repaymentPct: hasLoan ? Math.min(100, Math.round(((loanProfile.total_amount_repaid || 30000) / (loanProfile.original_loan_amount || 100000)) * 100)) : 50,
        get repaymentLevel() {
          if (!hasLoan) return t('level_fair');
          return this.repaymentPct >= 50 ? t('level_good') : (this.repaymentPct >= 20 ? t('level_fair') : t('level_critical'));
        }
      };
    } else {
      return {
        badgeText: `${t('high')} ${t('financial_distress')}`,
        badgeClass: isDarkMode ? "bg-rose-900/70 text-rose-300 border-rose-700" : "bg-red-100 text-red-800 border-red-300",
        scoreColor: isDarkMode ? "text-rose-400" : "text-red-600",
        barColor: "bg-red-500",
        message: t('high_position_msg'),
        loanBurdenPct: hasLoan ? Math.min(100, Math.round(((loanProfile.outstanding_principal || 50000) / (loanProfile.original_loan_amount || 100000)) * 100)) : 85,
        get loanBurdenLevel() {
          if (!hasLoan) return t('level_high');
          return this.loanBurdenPct >= 70 ? t('level_high') : (this.loanBurdenPct >= 40 ? t('level_moderate') : t('level_low'));
        },
        interestBurdenPct: hasLoan ? Math.min(100, Math.round(((loanProfile.annual_interest_rate || 7) / 18) * 100)) : 80,
        get interestBurdenLevel() {
          if (!hasLoan) return t('level_high');
          return this.interestBurdenPct >= 70 ? t('level_high') : (this.interestBurdenPct >= 40 ? t('level_moderate') : t('level_low'));
        },
        incomeRiskPct: 80,
        incomeRiskLevel: t('level_high'),
        repaymentPct: hasLoan ? Math.min(100, Math.round(((loanProfile.total_amount_repaid || 30000) / (loanProfile.original_loan_amount || 100000)) * 100)) : 25,
        get repaymentLevel() {
          if (!hasLoan) return t('level_critical');
          return this.repaymentPct >= 50 ? t('level_good') : (this.repaymentPct >= 20 ? t('level_fair') : t('level_critical'));
        }
      };
    }
  };

  const theme = getScoreTheme(distressScore);

  return (
    <div className={`rounded-3xl p-5 sm:p-6 border w-full flex flex-col md:flex-row items-stretch justify-between gap-6 transition-all ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-700 text-white shadow-xl' 
        : 'bg-white/95 backdrop-blur-md border-emerald-200/90 text-gray-900 shadow-xs'
    }`}>
      
      {/* Left Column: Score & Status Overview */}
      <div className={`flex-1 flex flex-col justify-between space-y-3 pr-0 md:pr-4 md:border-r ${
        isDarkMode ? 'border-slate-700' : 'border-gray-100'
      }`}>
        
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl border shadow-2xs ${
            isDarkMode ? 'bg-emerald-950 border-emerald-800 text-emerald-400' : 'bg-emerald-100/90 border-emerald-200 text-emerald-700'
          }`}>
            <Sprout className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <h3 className={`text-base font-black tracking-tight flex items-center gap-1.5 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              FINANCIAL DISTRESS SCORE
              <Info className={`h-3.5 w-3.5 cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`} title="Financial Distress Score (0-100) calculated from interest burden, loan principal ratio & net farm profit." />
            </h3>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Financial Distress Index (Lower is Better)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 my-1 flex-wrap gap-2">
          <span className={`text-4xl font-black tracking-tight font-mono ${theme.scoreColor}`}>
            {distressScore}
          </span>
          <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>/ 100</span>

          <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${theme.badgeClass}`}>
            {theme.badgeText}
          </span>
        </div>

        <p className={`text-xs font-semibold italic ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          "{theme.message}"
        </p>
      </div>

      {/* Right Column: 4 Breakdown Metrics Bars */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5 pl-0 md:pl-2">
        
        {/* Metric 1: Loan Burden */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className={`p-1 rounded-lg ${isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className={`font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{t('loan_burden_label')}</span>
          </div>

          <div className={`flex-1 h-2.5 rounded-full overflow-hidden border mx-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200/60'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${theme.loanBurdenPct >= 70 ? 'bg-red-500' : (theme.loanBurdenPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500')}`} 
              style={{ width: `${theme.loanBurdenPct}%` }}
            />
          </div>

          <span className={`text-[11px] font-extrabold w-16 text-right shrink-0 ${theme.loanBurdenPct >= 70 ? 'text-red-500' : (theme.loanBurdenPct >= 40 ? 'text-amber-500' : 'text-emerald-500')}`}>
            {theme.loanBurdenLevel}
          </span>
        </div>

        {/* Metric 2: Interest Burden */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className={`p-1 rounded-lg ${isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <Percent className="h-3.5 w-3.5" />
            </div>
            <span className={`font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{t('interest_burden_label')}</span>
          </div>

          <div className={`flex-1 h-2.5 rounded-full overflow-hidden border mx-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200/60'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${theme.interestBurdenPct >= 70 ? 'bg-red-500' : (theme.interestBurdenPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500')}`} 
              style={{ width: `${theme.interestBurdenPct}%` }}
            />
          </div>

          <span className={`text-[11px] font-extrabold w-16 text-right shrink-0 ${theme.interestBurdenPct >= 70 ? 'text-red-500' : (theme.interestBurdenPct >= 40 ? 'text-amber-500' : 'text-emerald-500')}`}>
            {theme.interestBurdenLevel}
          </span>
        </div>

        {/* Metric 3: Income Risk */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className={`p-1 rounded-lg ${isDarkMode ? 'bg-amber-950 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <Wheat className="h-3.5 w-3.5" />
            </div>
            <span className={`font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{t('income_risk_label')}</span>
          </div>

          <div className={`flex-1 h-2.5 rounded-full overflow-hidden border mx-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200/60'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${theme.incomeRiskPct >= 70 ? 'bg-red-500' : (theme.incomeRiskPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500')}`} 
              style={{ width: `${theme.incomeRiskPct}%` }}
            />
          </div>

          <span className={`text-[11px] font-extrabold w-16 text-right shrink-0 ${theme.incomeRiskPct >= 70 ? 'text-red-500' : (theme.incomeRiskPct >= 40 ? 'text-amber-500' : 'text-emerald-500')}`}>
            {theme.incomeRiskLevel}
          </span>
        </div>

        {/* Metric 4: Repayment Capacity */}
        <div className="flex items-center justify-between text-xs space-x-3">
          <div className="flex items-center space-x-2 w-36 shrink-0">
            <div className={`p-1 rounded-lg ${isDarkMode ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
              <Calculator className="h-3.5 w-3.5" />
            </div>
            <span className={`font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{t('repayment_capacity_label')}</span>
          </div>

          <div className={`flex-1 h-2.5 rounded-full overflow-hidden border mx-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200/60'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${theme.repaymentPct >= 50 ? 'bg-emerald-500' : (theme.repaymentPct >= 20 ? 'bg-amber-500' : 'bg-red-500')}`} 
              style={{ width: `${theme.repaymentPct}%` }}
            />
          </div>

          <span className={`text-[11px] font-extrabold w-16 text-right shrink-0 ${theme.repaymentPct >= 50 ? 'text-emerald-500' : (theme.repaymentPct >= 20 ? 'text-amber-500' : 'text-red-500')}`}>
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
