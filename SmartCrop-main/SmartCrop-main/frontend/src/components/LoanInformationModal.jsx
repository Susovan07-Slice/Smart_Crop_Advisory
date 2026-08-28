import React, { useState, useEffect } from 'react';

const LoanInformationModal = ({ isOpen, onClose, onSave, initialData }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-emerald-700/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-emerald-400">Farmer Financial & Loan Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Does the farmer currently have any active loan?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasLoan(true)}
                className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                  hasLoan
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Yes, Active Loan
              </button>
              <button
                type="button"
                onClick={() => setHasLoan(false)}
                className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                  !hasLoan
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                No Loans
              </button>
            </div>
          </div>

          {hasLoan && (
            <div className="space-y-3 border-t border-slate-800 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Original Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={originalLoanAmount}
                    onChange={(e) => setOriginalLoanAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Outstanding Principal (₹)</label>
                  <input
                    type="number"
                    value={outstandingPrincipal}
                    onChange={(e) => setOutstandingPrincipal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Total Amount Repaid (₹)</label>
                  <input
                    type="number"
                    value={totalAmountRepaid}
                    onChange={(e) => setTotalAmountRepaid(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Recent New Loan Taken (₹)</label>
                  <input
                    type="number"
                    value={newLoanAmount}
                    onChange={(e) => setNewLoanAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Repayment Frequency</label>
                  <select
                    value={repaymentFrequency}
                    onChange={(e) => setRepaymentFrequency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-yearly">Half-yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Lender / Financial Source</label>
                <select
                  value={lenderSource}
                  onChange={(e) => setLenderSource(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bank">Bank (Public / Commercial)</option>
                  <option value="Cooperative">Cooperative Society</option>
                  <option value="Government scheme">Government Scheme / KCC</option>
                  <option value="Microfinance">Microfinance Institution</option>
                  <option value="Other">Other / Local Lender</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all"
            >
              Save Profile & Update Safety Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanInformationModal;
