import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, CreditCard } from 'lucide-react';

const LoanInformationModal = ({ isOpen, onClose, onSave, initialData }) => {
  const { t } = useLanguage();
  const [hasLoan, setHasLoan] = useState(false);
  const [originalLoanAmount, setOriginalLoanAmount] = useState(100000);
  const [outstandingPrincipal, setOutstandingPrincipal] = useState(80000);
  const [annualInterestRate, setAnnualInterestRate] = useState(8.5);
  const [totalAmountRepaid, setTotalAmountRepaid] = useState(30000);
  const [newLoanAmount, setNewLoanAmount] = useState(0);
  const [loanTenureMonths, setLoanTenureMonths] = useState(12);
  const [repaymentFrequency, setRepaymentFrequency] = useState('Yearly');
  const [lenderSource, setLenderSource] = useState('Bank');

  useEffect(() => {
    if (initialData) {
      setHasLoan(!!initialData.has_loan);
      setOriginalLoanAmount(initialData.original_loan_amount || 100000);
      setOutstandingPrincipal(initialData.outstanding_principal || 80000);
      setAnnualInterestRate(initialData.annual_interest_rate || 8.5);
      setTotalAmountRepaid(initialData.total_amount_repaid || 30000);
      setNewLoanAmount(initialData.new_loan_amount || 0);
      setLoanTenureMonths(initialData.loan_tenure_months || 12);
      setRepaymentFrequency(initialData.repayment_frequency || 'Yearly');
      setLenderSource(initialData.lender_source || 'Bank');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      has_loan: hasLoan,
      original_loan_amount: hasLoan ? parseFloat(originalLoanAmount) : 0,
      outstanding_principal: hasLoan ? parseFloat(outstandingPrincipal) : 0,
      annual_interest_rate: hasLoan ? parseFloat(annualInterestRate) : 0,
      total_amount_repaid: hasLoan ? parseFloat(totalAmountRepaid) : 0,
      new_loan_amount: hasLoan ? parseFloat(newLoanAmount) : 0,
      loan_tenure_months: hasLoan ? parseInt(loanTenureMonths) : 12,
      repayment_frequency: hasLoan ? repaymentFrequency : 'Yearly',
      lender_source: hasLoan ? lenderSource : 'Bank'
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Light Mode Crystal Frosted Glassy Modal Card */}
      <div className="bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl text-gray-900 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3.5 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight">
              {t('farmer_financial_loan_profile')}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              {t('loan_active_question')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasLoan(true)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-extrabold transition-all ${
                  hasLoan
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('yes_active_loan')}
              </button>
              <button
                type="button"
                onClick={() => setHasLoan(false)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-extrabold transition-all ${
                  !hasLoan
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('no_loans')}
              </button>
            </div>
          </div>

          {hasLoan && (
            <div className="space-y-3.5 border-t border-emerald-100 pt-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">{t('original_loan_amount')}</label>
                  <input
                    type="number"
                    value={originalLoanAmount}
                    onChange={(e) => setOriginalLoanAmount(e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">{t('outstanding_principal')}</label>
                  <input
                    type="number"
                    value={outstandingPrincipal}
                    onChange={(e) => setOutstandingPrincipal(e.target.value)}
                    className="w-full bg-white/90 border border-red-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-red-600 focus:ring-2 focus:ring-red-500 outline-none shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">{t('annual_interest_rate')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">{t('total_amount_repaid')}</label>
                  <input
                    type="number"
                    value={totalAmountRepaid}
                    onChange={(e) => setTotalAmountRepaid(e.target.value)}
                    className="w-full bg-white/90 border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">{t('recent_new_loan')}</label>
                  <input
                    type="number"
                    value={newLoanAmount}
                    onChange={(e) => setNewLoanAmount(e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">{t('repayment_frequency')}</label>
                  <select
                    value={repaymentFrequency}
                    onChange={(e) => setRepaymentFrequency(e.target.value)}
                    className="w-full bg-white/90 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                  >
                    <option value="Yearly">{t('yearly')}</option>
                    <option value="Half-yearly">{t('half_yearly')}</option>
                    <option value="Quarterly">{t('quarterly')}</option>
                    <option value="Monthly">{t('monthly')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">{t('lender_source')}</label>
                <select
                  value={lenderSource}
                  onChange={(e) => setLenderSource(e.target.value)}
                  className="w-full bg-white/90 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none shadow-2xs"
                >
                  <option value="Bank">{t('bank')}</option>
                  <option value="Cooperative">{t('cooperative')}</option>
                  <option value="Government scheme">{t('govt_scheme')}</option>
                  <option value="Microfinance">{t('microfinance')}</option>
                  <option value="Other">{t('other_lender')}</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-emerald-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md active:scale-95 transition-all"
            >
              {t('save_profile_update_score')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanInformationModal;
