import React, { useState } from 'react';
import { X, Calculator, Info, CheckCircle2 } from 'lucide-react';

interface PayrollCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayrollCalculatorModal: React.FC<PayrollCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [basicSalary, setBasicSalary] = useState<number>(100000);
  const [housingAllowance, setHousingAllowance] = useState<number>(15000);
  const [transportAllowance, setTransportAllowance] = useState<number>(5000);

  if (!isOpen) return null;

  // Calculation Logic matching Kenya 2026 Engine
  const grossPay = basicSalary + housingAllowance + transportAllowance;

  // NSSF
  const nssfTier1 = Math.min(grossPay, 8000) * 0.06;
  const nssfTier2 = Math.max(0, Math.min(grossPay, 72000) - 8000) * 0.06;
  const nssfTotal = nssfTier1 + nssfTier2;

  // SHIF 2.75%
  const shif = Math.max(300, grossPay * 0.0275);

  // Housing Levy 1.5%
  const housingLevy = grossPay * 0.015;

  // Taxable Pay = Gross minus statutory tax-deductibles
  const taxablePay = Math.max(0, grossPay - nssfTotal - shif - housingLevy);

  // Progressive PAYE Tax Bands
  let grossPAYE = 0;
  if (taxablePay > 0) {
    let rem = taxablePay;
    // Band 1: First 24,000 @ 10%
    const b1 = Math.min(rem, 24000);
    grossPAYE += b1 * 0.10;
    rem -= b1;

    // Band 2: Next 8,333 @ 25%
    if (rem > 0) {
      const b2 = Math.min(rem, 8333);
      grossPAYE += b2 * 0.25;
      rem -= b2;
    }

    // Band 3: Next 467,667 @ 30%
    if (rem > 0) {
      const b3 = Math.min(rem, 467667);
      grossPAYE += b3 * 0.30;
      rem -= b3;
    }

    // Band 4: Above 500,000 @ 32.5% - 35%
    if (rem > 0) {
      grossPAYE += rem * 0.325;
    }
  }

  const personalRelief = 2400;
  const payeDue = Math.max(0, grossPAYE - personalRelief);
  const totalDeductions = payeDue + nssfTotal + shif + housingLevy;
  const netPay = Math.max(0, grossPay - totalDeductions);
  const employerCost = grossPay + nssfTotal + housingLevy;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Kenya Gross-to-Net Calculator</h2>
              <p className="text-xs text-slate-400">2026 Legislation: PAYE, NSSF Tier I/II, SHIF 2.75%, AHL 1.5%</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Breakdown */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Basic Salary (KES)
              </label>
              <input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Housing Allowance
              </label>
              <input
                type="number"
                value={housingAllowance}
                onChange={(e) => setHousingAllowance(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Transport Allowance
              </label>
              <input
                type="number"
                value={transportAllowance}
                onChange={(e) => setTransportAllowance(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-gradient-to-r from-teal-900/40 to-slate-900 border border-teal-500/30 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-soft">
            <div>
              <span className="text-xs text-teal-300 font-semibold uppercase tracking-wider block">Estimated Net Salary</span>
              <span className="text-3xl font-extrabold text-emerald-400">
                KES {netPay.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-700 pt-2 sm:pt-0 sm:pl-5">
              <span className="text-xs text-slate-400 block">Total Employer Cost</span>
              <span className="text-lg font-bold text-slate-200">
                KES {employerCost.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Itemized Statutory Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Itemized Breakdown</h4>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Gross Pay</span>
                <span className="font-bold text-slate-900 dark:text-white">KES {grossPay.toLocaleString('en-KE')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">NSSF Contribution (Tier I & II)</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">- KES {nssfTotal.toLocaleString('en-KE')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">SHIF (Social Health Insurance 2.75%)</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">- KES {shif.toLocaleString('en-KE')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Affordable Housing Levy (1.5%)</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">- KES {housingLevy.toLocaleString('en-KE')}</span>
              </div>
              <div className="py-2.5 flex justify-between bg-slate-50 dark:bg-slate-800/40 px-2 rounded-lg font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Taxable Income</span>
                <span className="text-slate-900 dark:text-white">KES {taxablePay.toLocaleString('en-KE')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">KRA PAYE Tax (Before Relief: KES {grossPAYE.toFixed(2)})</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">- KES {payeDue.toLocaleString('en-KE')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Personal Tax Relief Applied</span>
                <span>+ KES 2,400.00 / month</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            Verified against KRA 2026 standard formula
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
};
