import React from 'react';
import { BarChart3, Download, ShieldCheck, FileSpreadsheet, Building } from 'lucide-react';
import { PayrollRun } from '../types';

interface ReportsPageProps {
  payrollRuns: PayrollRun[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ payrollRuns }) => {
  const currentRun = payrollRuns.length > 0 ? payrollRuns[payrollRuns.length - 1] : null;

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadP10 = () => {
    if (!currentRun) return;
    let csvContent = "Employee Name,Employee Code,Gross Pay,PAYE Tax\n";
    currentRun.items.forEach(item => {
      csvContent += `"${item.employee_name}","${item.employee_code}",${item.gross_pay},${item.paye_tax}\n`;
    });
    csvContent += `\nTOTAL,,${currentRun.total_gross_pay},${currentRun.total_paye_tax}\n`;
    downloadCSV(`KRA_P10_Return_${currentRun.period_name}.csv`, csvContent);
  };

  const downloadNSSF = () => {
    if (!currentRun) return;
    let csvContent = "Employee Name,Employee Code,Gross Pay,NSSF Employee,NSSF Employer\n";
    currentRun.items.forEach(item => {
      csvContent += `"${item.employee_name}","${item.employee_code}",${item.gross_pay},${item.nssf_employee},${item.nssf_employer}\n`;
    });
    csvContent += `\nTOTAL,,${currentRun.total_gross_pay},${currentRun.total_nssf},${currentRun.total_nssf}\n`;
    downloadCSV(`NSSF_Return_${currentRun.period_name}.csv`, csvContent);
  };

  const downloadSHIF = () => {
    if (!currentRun) return;
    let csvContent = "Employee Name,Employee Code,Gross Pay,SHIF Employee\n";
    currentRun.items.forEach(item => {
      csvContent += `"${item.employee_name}","${item.employee_code}",${item.gross_pay},${item.shif_employee}\n`;
    });
    csvContent += `\nTOTAL,,${currentRun.total_gross_pay},${currentRun.total_shif}\n`;
    downloadCSV(`SHIF_Return_${currentRun.period_name}.csv`, csvContent);
  };

  const downloadHousingLevy = () => {
    if (!currentRun) return;
    let csvContent = "Employee Name,Employee Code,Gross Pay,Levy Employee,Levy Employer\n";
    currentRun.items.forEach(item => {
      csvContent += `"${item.employee_name}","${item.employee_code}",${item.gross_pay},${item.housing_levy_employee},${item.housing_levy_employer}\n`;
    });
    csvContent += `\nTOTAL,,${currentRun.total_gross_pay},${currentRun.total_housing_levy},${currentRun.total_housing_levy}\n`;
    downloadCSV(`AHL_Return_${currentRun.period_name}.csv`, csvContent);
  };

  const downloadAll = () => {
    downloadP10();
    downloadNSSF();
    downloadSHIF();
    downloadHousingLevy();
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Statutory & Tax Reporting</h1>
          <p className="text-xs text-slate-500">Official KRA P9/P10 PAYE returns, NSSF, SHIF, & Affordable Housing Levy exports</p>
        </div>
        <button
          onClick={downloadAll}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export All Statutory Reports</span>
        </button>
      </div>

      {/* Statutory Return Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KRA PAYE Return P10 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/20">
                P10
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">KRA PAYE Tax Return (P10)</h3>
                <p className="text-xs text-slate-400">Monthly Tax Deduction Summary</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
              KES {currentRun ? currentRun.total_paye_tax.toLocaleString('en-KE') : '0'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Form P10 detailing total PAYE tax withheld {currentRun ? `across ${currentRun.total_employees} staff members` : 'for the active payroll period'}.
          </p>

          <button
            onClick={downloadP10}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
            <span>Download KRA iTax CSV Template</span>
          </button>
        </div>

        {/* NSSF Return */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/20">
                NSSF
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">NSSF Pension Return (Tier I & II)</h3>
                <p className="text-xs text-slate-400">Employee & Employer Matching</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full">
              KES {currentRun ? (currentRun.total_nssf * 2).toLocaleString('en-KE') : '0'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Combined employee 6% and employer 6% pension schedule according to lower (KES 8k) and upper (KES 72k) limits.
          </p>

          <button
            onClick={downloadNSSF}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span>Download NSSF Portal Schedule</span>
          </button>
        </div>

        {/* SHIF 2.75% Return */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-sm border border-teal-500/20">
                SHIF
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">SHIF Return (2.75%)</h3>
                <p className="text-xs text-slate-400">Social Health Insurance Fund</p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-full">
              KES {currentRun ? currentRun.total_shif.toLocaleString('en-KE') : '0'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            2.75% Social Health Insurance Fund schedule replacing NHIF for active Kenya workforce.
          </p>

          <button
            onClick={downloadSHIF}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-500" />
            <span>Download SHIF Portal File</span>
          </button>
        </div>

        {/* Affordable Housing Levy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/20">
                AHL
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Affordable Housing Levy</h3>
                <p className="text-xs text-slate-400">1.5% Employee + 1.5% Employer</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
              KES {currentRun ? (currentRun.total_housing_levy * 2).toLocaleString('en-KE') : '0'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Affordable Housing Levy return matching 1.5% employee contribution with 1.5% employer contribution.
          </p>

          <button
            onClick={downloadHousingLevy}
            className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Download Housing Levy Return</span>
          </button>
        </div>

      </div>

    </div>
  );
};
