import React from 'react';
import { 
  Users, 
  Banknote, 
  ShieldAlert, 
  TrendingUp, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle,
  Play,
  FileText
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Employee, PayrollRun } from '../types';

interface DashboardPageProps {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  onNavigate: (tab: string) => void;
  onOpenCalculator: () => void;
  currentUser?: any;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  employees,
  payrollRuns,
  onNavigate,
  onOpenCalculator,
  currentUser
}) => {
  const isEmployee = currentUser?.role === 'Employee';
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const latestRun = payrollRuns.length > 0 ? payrollRuns[payrollRuns.length - 1] : null;

  const totalYtdCost = payrollRuns.reduce((sum, r) => sum + r.total_employer_cost, 0);
  const totalYtdNet = payrollRuns.reduce((sum, r) => sum + r.total_net_pay, 0);
  const totalYtdPAYE = payrollRuns.reduce((sum, r) => sum + r.total_paye_tax, 0);

  // --- EMPLOYEE VIEW ---
  if (isEmployee) {
    // Find the logged-in employee's record
    const myEmpRecord = employees.find(e => e.email === currentUser?.user_email);
    // Find the latest payslip item for this employee
    const myLatestItem = latestRun?.items.find(i => i.employee_id === myEmpRecord?.id);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Welcome back, {currentUser?.user_name.split(' ')[0]} 👋</h1>
            <p className="text-xs text-teal-100/70 mt-1">
              Your Employee Portal for {currentUser?.organization_name || 'SmartPay Global'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Profile Quick Look */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              My Profile Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Designation</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">{myEmpRecord?.job_title || 'Employee'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Base Salary</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  KES {myEmpRecord?.basic_salary ? myEmpRecord.basic_salary.toLocaleString('en-KE') : '0'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">KRA PIN</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">{myEmpRecord?.kra_pin || 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Latest Payslip Highlight */}
          <div className="md:col-span-1 lg:col-span-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-6 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Latest Payslip ({latestRun?.period_name || 'N/A'})</span>
                </h3>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                  latestRun?.status === 'APPROVED' || latestRun?.status === 'LOCKED' 
                    ? 'bg-emerald-200 text-emerald-900' 
                    : 'bg-amber-200 text-amber-900'
                }`}>
                  {latestRun?.status || 'NO RUNS'}
                </span>
              </div>
              
              {myLatestItem ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Your net take-home pay for the period {latestRun?.period_name} was:
                  </p>
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                    KES {myLatestItem.net_pay.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No payslips available for this period yet.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => onNavigate('payslips')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>View All Payslips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW (Default) ---
  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-teal-400 font-semibold mb-1">
            <Building2 className="w-4 h-4" />
            <span>{currentUser?.organization_name || 'Organization Overview'} • Active Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Workforce & Payroll Overview</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Kenya Statutory Ruleset (2026) active: KRA PAYE bands, NSSF Tier I/II, SHIF 2.75%, & Affordable Housing Levy 1.5%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={onOpenCalculator}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all text-center cursor-pointer"
          >
            Open KRA Calculator
          </button>
          <button
            onClick={() => onNavigate('payroll')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white shrink-0" />
            <span>{latestRun ? `Process ${latestRun.period_name}` : 'Process Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          title="Active Workforce"
          value={`${activeCount} Staff`}
          subtext="100% Onboarded & KRA Verified"
          icon={Users}
          trend={activeCount > 0 ? `${activeCount} Active` : undefined}
          trendPositive={true}
          color="teal"
        />
        <StatCard
          title="Total Net Payroll (YTD)"
          value={`KES ${totalYtdNet.toLocaleString('en-KE')}`}
          subtext="Direct Employee Bank Payouts"
          icon={Banknote}
          color="emerald"
        />
        <StatCard
          title="KRA PAYE Liability (YTD)"
          value={`KES ${totalYtdPAYE.toLocaleString('en-KE')}`}
          subtext="Personal Relief KES 2,400/mo applied"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Pending Approvals"
          value={latestRun?.status === 'CALCULATED' ? '1 Draft Run' : '0 Pending'}
          subtext={latestRun?.status === 'CALCULATED' ? `${latestRun.period_name} Needs Sign-off` : 'All Runs Finalized'}
          icon={ShieldAlert}
          color={latestRun?.status === 'CALCULATED' ? 'amber' : 'emerald'}
        />
      </div>

      {/* Grid: Anomaly Alerts & Recent Payroll Run */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Anomaly & Compliance Center */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-teal-500" />
              <span>Compliance & Verification</span>
            </h3>
            <span className="text-[10px] bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full">
              {activeCount > 0 ? `${activeCount} Active Staff` : 'Setup Ready'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-teal-900 dark:text-teal-300">Kenya 2026 Statutory Engine Active</p>
                <p className="text-teal-700 dark:text-teal-400 text-[11px] mt-0.5">
                  Automated calculations for PAYE, NSSF Tier I/II, SHIF (2.75%), & Housing Levy (1.5%).
                </p>
              </div>
            </div>

            {latestRun ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">Payroll Cycle Synchronized</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                    Latest run for {latestRun.period_name} with status: {latestRun.status}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">No Pending Discrepancies</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Add employees and run your first payroll to view live compliance insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payroll Lifecycle Status */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Current Payroll Run (July 2026)
              </h3>
              <p className="text-xs text-slate-500">Live Kenya statutory calculation pipeline</p>
            </div>
            <button
              onClick={() => onNavigate('payroll')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-500 flex items-center gap-1"
            >
              <span>View Payroll Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestRun ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gross Payroll</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">KES {latestRun.total_gross_pay.toLocaleString('en-KE')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">KRA PAYE Tax</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">KES {latestRun.total_paye_tax.toLocaleString('en-KE')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">NSSF + SHIF + AHL</span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">
                    KES {(latestRun.total_nssf + latestRun.total_shif + latestRun.total_housing_levy).toLocaleString('en-KE')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Net Salary Payable</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">KES {latestRun.total_net_pay.toLocaleString('en-KE')}</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Payroll Status:</span>
                <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  latestRun.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  latestRun.status === 'CALCULATED' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-200 text-slate-800'
                }`}>
                  {latestRun.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No payroll runs created yet. Click "Process July Payroll" to launch the Kenya Statutory Engine.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
