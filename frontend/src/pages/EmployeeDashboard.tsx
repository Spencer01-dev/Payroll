import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight, 
  AlertCircle,
  HelpCircle,
  PiggyBank,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  PlaneTakeoff,
  Eye,
  Download
} from 'lucide-react';
import { PortalDashboardSummary, PayrollRun, PayrollItem } from '../types';
import { API_BASE_URL } from '../config';

interface EmployeeDashboardProps {
  currentUser: any;
  onNavigate: (tab: string) => void;
  onViewPayslip: (item: PayrollItem) => void;
  payrollRuns: PayrollRun[];
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  onNavigate,
  onViewPayslip,
  payrollRuns
}) => {
  const [summary, setSummary] = useState<PortalDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  useEffect(() => {
    const fetchSummary = async () => {
      if (!userEmail) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/v1/portal/dashboard-summary?employee_email=${encodeURIComponent(userEmail)}`,
          {
            headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userEmail, currentUser]);

  // Extract this employee's recent payslips from payroll runs
  const employeePayslips = React.useMemo(() => {
    const list: { run: PayrollRun; item: PayrollItem }[] = [];
    payrollRuns.forEach(run => {
      if (run.items) {
        const myItem = run.items.find(
          i => i.employee_name?.toLowerCase().includes(currentUser.user_name?.toLowerCase()) ||
               (summary && i.employee_id === summary.employee_id)
        );
        if (myItem) {
          list.push({ run, item: myItem });
        }
      }
    });
    return list;
  }, [payrollRuns, currentUser, summary]);

  const today = new Date().toLocaleDateString('en-KE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 border border-teal-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>SmartPay Employee Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser?.user_name || 'Joy'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>{today}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 2026 KRA Verified
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('emp_attendance')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Clock className="w-4 h-4" />
              <span>Clock In / Out</span>
            </button>
            <button
              onClick={() => onNavigate('emp_leave')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <PlaneTakeoff className="w-4 h-4" />
              <span>Request Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Net Salary / Payday */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-teal-500/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Estimated Net Pay</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            KES {summary?.latest_net_pay ? summary.latest_net_pay.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> Basic: KES {summary?.basic_salary?.toLocaleString() || '85,000'}
          </p>
        </div>

        {/* Leave Balance */}
        <div 
          onClick={() => onNavigate('emp_leave')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-teal-500/30 transition-all shadow-lg group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Leave Balance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-1.5">
            <span>{summary?.leave_balance ?? 21}</span>
            <span className="text-xs font-normal text-slate-400">days remaining</span>
          </div>
          <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-medium">
            <span>Annual allowance: 21 days</span>
          </p>
        </div>

        {/* Attendance Today */}
        <div 
          onClick={() => onNavigate('emp_attendance')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-teal-500/30 transition-all shadow-lg group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attendance Today</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-white truncate">
            {summary?.attendance_today?.clocked_in ? `In at ${summary.attendance_today.clocked_in}` : 'Not Clocked In'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            Status: <span className={summary?.attendance_today?.clocked_in ? 'text-emerald-400' : 'text-amber-400'}>{summary?.attendance_today?.status || 'Pending'}</span>
          </p>
        </div>

        {/* YTD Gross */}
        <div 
          onClick={() => onNavigate('emp_salary')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-teal-500/30 transition-all shadow-lg group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">YTD Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            KES {summary?.ytd_gross ? summary.ytd_gross.toLocaleString('en-KE', { maximumFractionDigits: 0 }) : '—'}
          </div>
          <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
            <span>YTD Tax: KES {summary?.ytd_tax ? summary.ytd_tax.toLocaleString('en-KE', { maximumFractionDigits: 0 }) : '0'}</span>
          </p>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigate('emp_salary')}
          className="flex flex-col items-start p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800/80 hover:border-teal-500/40 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">Salary & Tax</div>
          <p className="text-[11px] text-slate-400 mt-0.5">PAYE, NSSF, SHIF calculation</p>
        </button>

        <button
          onClick={() => onNavigate('emp_loans')}
          className="flex flex-col items-start p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800/80 hover:border-teal-500/40 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Salary Advances</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Emergency loans & tracker</p>
        </button>

        <button
          onClick={() => onNavigate('emp_documents')}
          className="flex flex-col items-start p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800/80 hover:border-teal-500/40 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Document Vault</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Contracts, P9, policies</p>
        </button>

        <button
          onClick={() => onNavigate('emp_helpdesk')}
          className="flex flex-col items-start p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800/80 hover:border-teal-500/40 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">HR Helpdesk</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Raise query & track tickets</p>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Payslips (2 spans) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Payslips</h2>
              <p className="text-xs text-slate-400">View and download your monthly remuneration slips</p>
            </div>
            <button
              onClick={() => onNavigate('payslips')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {employeePayslips.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">No locked payslips available yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Your payslips will appear here once monthly payroll is processed and approved by HR.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Period</th>
                    <th className="pb-3">Gross Pay</th>
                    <th className="pb-3">Deductions</th>
                    <th className="pb-3">Net Pay</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {employeePayslips.slice(0, 5).map(({ run, item }) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3.5 pl-2 font-semibold text-white">
                        {run.period_name}
                      </td>
                      <td className="py-3.5 text-slate-300">
                        KES {item.gross_pay.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-rose-400">
                        -KES {item.total_deductions.toLocaleString()}
                      </td>
                      <td className="py-3.5 font-bold text-emerald-400">
                        KES {item.net_pay.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => onViewPayslip(item)}
                          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
          )}
        </div>

        {/* Right Column: Statutory & Organization Snapshot */}
        <div className="space-y-6">
          {/* Statutory Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Statutory Snapshot</span>
              </h2>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Active 2026
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/50">
                <span className="text-slate-400">Personal Relief</span>
                <span className="font-semibold text-white">KES 2,400 / mo</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/50">
                <span className="text-slate-400">SHIF Contribution</span>
                <span className="font-semibold text-teal-400">2.75% of Gross</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/50">
                <span className="text-slate-400">Affordable Housing Levy</span>
                <span className="font-semibold text-teal-400">1.5% of Gross</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/50">
                <span className="text-slate-400">NSSF Rate</span>
                <span className="font-semibold text-teal-400">6% (Tier I & II)</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('emp_salary')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 rounded-xl text-xs font-semibold transition-colors text-center"
            >
              View Full Statutory Breakdown →
            </button>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-500/20 rounded-3xl p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">Need support or corrections?</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Have a question about your payslip, KRA deductions, or need an employment verification letter? Raise a ticket via the HR Helpdesk.
                </p>
                <button
                  onClick={() => onNavigate('emp_helpdesk')}
                  className="mt-3 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Open HR Ticket →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
