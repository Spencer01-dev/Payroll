import React from 'react';
import { FileText, Eye, Download, ShieldCheck } from 'lucide-react';
import { PayrollRun, PayrollItem } from '../types';

interface PayslipsPageProps {
  payrollRuns: PayrollRun[];
  onViewPayslip: (item: PayrollItem) => void;
}

export const PayslipsPage: React.FC<PayslipsPageProps> = ({ payrollRuns, onViewPayslip }) => {
  const allItems: PayrollItem[] = payrollRuns.flatMap(r => r.items);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payslip Repository</h1>
          <p className="text-xs text-slate-500">KRA-compliant itemized employee payslips for download & distribution</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>KRA P9/P10 Standard Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-soft hover:shadow-soft-lg transition-all space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">July 2026 Period</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.employee_name}</h3>
                <p className="text-xs text-slate-400 font-mono">{item.employee_code} • {item.job_title}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <FileText className="w-5 h-5 text-teal-500" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Salary</span>
                <span className="font-semibold text-slate-900 dark:text-white">KES {item.gross_pay.toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Deductions</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">- KES {item.total_deductions.toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span className="text-emerald-700 dark:text-emerald-400">Net Payable</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">KES {item.net_pay.toLocaleString('en-KE')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => onViewPayslip(item)}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View & Print Payslip</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
