import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Eye, 
  FileText, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { PayrollRun, PayrollItem } from '../types';

interface PayrollPageProps {
  payrollRuns: PayrollRun[];
  onCalculatePayroll: (period: string) => void;
  onApprovePayroll: (runId: string) => void;
  onLockPayroll: (runId: string) => void;
  onViewPayslip: (item: PayrollItem) => void;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({
  payrollRuns,
  onCalculatePayroll,
  onApprovePayroll,
  onLockPayroll,
  onViewPayslip
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('July 2026');
  const currentRun = payrollRuns.length > 0 ? payrollRuns[payrollRuns.length - 1] : null;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Processing Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Kenya Statutory Calculation Pipeline (KRA 2026)</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Monthly Payroll Console</h1>
            <p className="text-xs text-slate-500">
              Automated PAYE bands, NSSF Tier I/II, SHIF 2.75%, & Housing Levy 1.5% deduction ordering.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="July 2026">July 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
            </select>

            {/* Run Calculation CTA */}
            <button
              onClick={() => onCalculatePayroll(selectedPeriod)}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Calculate Kenya Payroll</span>
            </button>
          </div>
        </div>

        {/* Status Lifecycle Stepper */}
        {currentRun && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-500">Run Status:</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                currentRun.status === 'LOCKED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                currentRun.status === 'APPROVED' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' :
                'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                {currentRun.status}
              </span>
            </div>

            {/* Lifecycle Action Buttons */}
            <div className="flex items-center space-x-3">
              {currentRun.status === 'CALCULATED' && (
                <button
                  onClick={() => onApprovePayroll(currentRun.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Payroll Run</span>
                </button>
              )}

              {currentRun.status === 'APPROVED' && (
                <button
                  onClick={() => onLockPayroll(currentRun.id)}
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock Run & Issue Payslips</span>
                </button>
              )}

              {currentRun.status === 'LOCKED' && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Locked & Immutable • Payslips Issued
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Itemized Calculation Breakdown Table */}
      {currentRun ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft">
          
          {/* Summary Strip */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Gross Pay</span>
              <span className="font-extrabold text-slate-900 dark:text-white">KES {currentRun.total_gross_pay.toLocaleString('en-KE')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">KRA PAYE Tax</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">KES {currentRun.total_paye_tax.toLocaleString('en-KE')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">NSSF (Tier I & II)</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">KES {currentRun.total_nssf.toLocaleString('en-KE')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">SHIF (2.75%)</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">KES {currentRun.total_shif.toLocaleString('en-KE')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Net Take-Home Pay</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">KES {currentRun.total_net_pay.toLocaleString('en-KE')}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Basic Salary</th>
                  <th className="py-3.5 px-4">Allowances</th>
                  <th className="py-3.5 px-4">Gross Pay</th>
                  <th className="py-3.5 px-4 text-amber-600 dark:text-amber-400">NSSF</th>
                  <th className="py-3.5 px-4 text-amber-600 dark:text-amber-400">SHIF</th>
                  <th className="py-3.5 px-4 text-amber-600 dark:text-amber-400">Housing Levy</th>
                  <th className="py-3.5 px-4 text-rose-600 dark:text-rose-400">KRA PAYE</th>
                  <th className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400">Net Pay</th>
                  <th className="py-3.5 px-4 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {currentRun.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors font-mono">
                    
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                      <div>{item.employee_name}</div>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">{item.employee_code}</span>
                    </td>

                    <td className="py-3.5 px-4">KES {item.basic_salary.toLocaleString('en-KE')}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">KES {item.allowances.toLocaleString('en-KE')}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">KES {item.gross_pay.toLocaleString('en-KE')}</td>
                    
                    <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400">KES {item.nssf_employee.toLocaleString('en-KE')}</td>
                    <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400">KES {item.shif_employee.toLocaleString('en-KE')}</td>
                    <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400">KES {item.housing_levy_employee.toLocaleString('en-KE')}</td>
                    
                    <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400">KES {item.paye_tax.toLocaleString('en-KE')}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      KES {item.net_pay.toLocaleString('en-KE')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => onViewPayslip(item)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-600 hover:text-teal-500 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Payroll Run for {selectedPeriod}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the "Calculate Kenya Payroll" button above to run the 2026 statutory gross-to-net engine.
          </p>
        </div>
      )}

    </div>
  );
};
