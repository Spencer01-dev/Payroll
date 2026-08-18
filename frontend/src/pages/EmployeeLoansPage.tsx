import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calculator, 
  Coins, 
  Calendar,
  Send,
  ShieldAlert
} from 'lucide-react';
import { LoanRequestItem } from '../types';
import { API_BASE_URL } from '../config';

interface EmployeeLoansPageProps {
  currentUser: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EmployeeLoansPage: React.FC<EmployeeLoansPageProps> = ({
  currentUser,
  onShowToast
}) => {
  const [loans, setLoans] = useState<LoanRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [requestType, setRequestType] = useState('Salary Advance');
  const [amount, setAmount] = useState<number>(15000);
  const [months, setMonths] = useState<number>(1);
  const [reason, setReason] = useState('');

  // Simulator calculation
  const monthlyDeduction = months > 0 ? Math.round(amount / months) : amount;

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  const fetchLoans = async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/loans?employee_email=${encodeURIComponent(userEmail)}`,
        {
          headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
        }
      );
      if (res.ok) {
        setLoans(await res.json());
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [userEmail, currentUser]);

  const handleSubmitLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      onShowToast('Please enter a valid loan amount', 'error');
      return;
    }
    if (!userEmail) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/loans?employee_email=${encodeURIComponent(userEmail)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-org-id': currentUser?.organization_id || 'default_org'
          },
          body: JSON.stringify({
            request_type: requestType,
            amount: Number(amount),
            monthly_deduction: Number(monthlyDeduction),
            reason
          })
        }
      );

      if (res.ok) {
        onShowToast(`Salary advance request for KES ${amount.toLocaleString()} submitted!`, 'success');
        setReason('');
        fetchLoans();
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === 'string' ? err.detail : 'Failed to submit loan request';
        throw new Error(msg);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error submitting loan request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOutstanding = loans
    .filter(l => l.status === 'Approved' || l.status === 'Active')
    .reduce((acc, cur) => acc + (cur.remaining_balance || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Salary Advances & Staff Loans</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Request short-term salary advances with automatic monthly payroll deduction schedules.
        </p>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Outstanding Balance</span>
            <PiggyBank className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white">
            KES {totalOutstanding.toLocaleString()}
          </div>
          <p className="text-xs text-teal-400 mt-1">Deducted from future payroll runs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Max Eligible Advance</span>
            <Coins className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            KES 42,500
          </div>
          <p className="text-xs text-slate-400 mt-1">50% of monthly net salary policy</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Interest Rate</span>
            <Calculator className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            0.0% APR
          </div>
          <p className="text-xs text-blue-400 mt-1">Company benefit (Zero interest)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Request Form & Simulator */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Apply for Advance / Loan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Simulate deduction & submit to HR</p>
          </div>

          <form onSubmit={handleSubmitLoan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Request Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Salary Advance">Salary Advance (1 Month)</option>
                <option value="Emergency Loan">Emergency Loan (1-3 Months)</option>
                <option value="Personal Loan">Staff Personal Loan (Up to 6 Months)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Requested Amount (KES)</label>
              <input
                type="number"
                required
                min={1000}
                max={50000}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Repayment Term (Months)</label>
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value={1}>1 Month (Immediate next payroll)</option>
                <option value={2}>2 Months</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
              </select>
            </div>

            {/* Live Simulator Preview */}
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
              <div className="text-[11px] font-bold uppercase text-teal-400 tracking-wider">Repayment Preview</div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Monthly Deduction:</span>
                <span className="font-bold text-white text-sm">KES {monthlyDeduction.toLocaleString()} / mo</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Repayment:</span>
                <span className="font-bold text-emerald-400">KES {amount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Reason / Purpose</label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. School fees, emergency medical expense..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all text-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Loan Request'}</span>
            </button>
          </form>
        </div>

        {/* Loan History Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Loan & Advance History</h2>
              <p className="text-xs text-slate-400">Track application statuses and remaining repayment balances</p>
            </div>
          </div>

          {loans.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <PiggyBank className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No loan requests on file</p>
              <p className="text-xs text-slate-500 mt-1">Submit your request using the simulator on the left.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Type</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Monthly</th>
                    <th className="pb-3">Remaining</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loans.map((ln) => (
                    <tr key={ln.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-white">
                        {ln.request_type}
                      </td>
                      <td className="py-3.5 font-bold text-slate-200">
                        KES {ln.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-slate-300">
                        KES {ln.monthly_deduction.toLocaleString()}
                      </td>
                      <td className="py-3.5 font-bold text-teal-400">
                        KES {ln.remaining_balance.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ln.status === 'Approved' || ln.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          ln.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {ln.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {ln.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {ln.status === 'Pending' && <Clock className="w-3 h-3" />}
                          <span>{ln.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
