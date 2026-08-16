import React from 'react';
import { X, Printer, Download, Building, ShieldCheck } from 'lucide-react';
import { PayrollItem } from '../types';

interface PayslipViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PayrollItem | null;
  periodName: string;
}

export const PayslipViewerModal: React.FC<PayslipViewerModalProps> = ({
  isOpen,
  onClose,
  item,
  periodName
}) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
        
        {/* Modal Controls */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Payslip Document • KRA Tax Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-white text-slate-900 dark:bg-slate-900 dark:text-white" id="printable-payslip">
          
          {/* Company & Period Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">SafariTech Solutions Kenya Ltd</h1>
              <p className="text-xs text-slate-500">Reg No: CPR/2023/889012 | KRA PIN: P051982736Z</p>
              <p className="text-xs text-slate-500">P.O. Box 45901-00100, Nairobi, Kenya</p>
            </div>
            <div className="text-left sm:text-right bg-teal-50 dark:bg-teal-950/40 p-3 rounded-2xl border border-teal-200 dark:border-teal-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">Payslip Period</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{periodName}</span>
            </div>
          </div>

          {/* Employee Profile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{item.employee_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee ID</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{item.employee_code}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Job Designation</span>
              <span className="font-bold text-slate-900 dark:text-white">{item.job_title}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">KRA Tax PIN</span>
              <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">A019827364Z</span>
            </div>
          </div>

          {/* Earnings & Deductions Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Earnings */}
            <div className="space-y-2">
              <h3 className="font-bold uppercase text-slate-500 tracking-wider pb-1 border-b border-slate-200 dark:border-slate-800">
                Gross Earnings
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-semibold">KES {item.basic_salary.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Allowances</span>
                  <span className="font-semibold">KES {item.allowances.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                {item.overtime_pay > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Overtime Pay</span>
                    <span className="font-semibold">KES {item.overtime_pay.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                  <span>Total Gross Earnings</span>
                  <span className="text-teal-600 dark:text-teal-400">KES {item.gross_pay.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-2">
              <h3 className="font-bold uppercase text-slate-500 tracking-wider pb-1 border-b border-slate-200 dark:border-slate-800">
                Statutory & Custom Deductions
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">KRA PAYE Tax (After Relief)</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">KES {item.paye_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">NSSF Contribution (Tier I & II)</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">KES {item.nssf_employee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">SHIF Contribution (2.75%)</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">KES {item.shif_employee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Housing Levy (1.5%)</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">KES {item.housing_levy_employee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                  <span>Total Deductions</span>
                  <span className="text-rose-600 dark:text-rose-400">KES {item.total_deductions.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Net Pay Callout */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Net Take-Home Pay</span>
              <span className="text-xs text-slate-500">Transferred to Bank Account **** 4455</span>
            </div>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              KES {item.net_pay.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Footnotes & Disclaimer */}
          <div className="text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 text-center space-y-1">
            <p>This is a system-generated payslip produced by SmartPay Global SaaS. Employer retains KRA statutory filing obligations.</p>
            <p>Personal Relief of KES 2,400.00 applied in accordance with KRA Income Tax Act rules.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
