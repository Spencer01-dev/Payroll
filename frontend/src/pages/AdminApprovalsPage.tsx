import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlaneTakeoff, 
  PiggyBank, 
  HelpCircle, 
  User, 
  MessageSquare, 
  Send,
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface AdminApprovalsPageProps {
  currentUser: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminApprovalsPage: React.FC<AdminApprovalsPageProps> = ({
  currentUser,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'leaves' | 'loans' | 'tickets'>('leaves');
  const [data, setData] = useState<{ leaves: any[]; loans: any[]; tickets: any[]; summary: any }>({
    leaves: [],
    loans: [],
    tickets: [],
    summary: { pending_leaves: 0, pending_loans: 0, open_tickets: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Ticket Response Modal State
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/portal/admin/pending-approvals`, {
        headers: { 'x-org-id': currentUser.organization_id }
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Error fetching admin approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [currentUser]);

  // Leave Actions
  const handleLeaveAction = async (leaveId: string, action: 'approve' | 'reject') => {
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/portal/leaves/${leaveId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': currentUser.organization_id
        },
        body: JSON.stringify({
          approved_by: currentUser.user_name || 'HR Admin'
        })
      });

      if (res.ok) {
        onShowToast(`✓ Leave request ${action}d successfully`, 'success');
        fetchApprovals();
      } else {
        throw new Error(`Failed to ${action} leave request`);
      }
    } catch (err: any) {
      onShowToast(err.message || `Error ${action}ing leave`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loan Actions
  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject') => {
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/portal/loans/${loanId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': currentUser.organization_id
        },
        body: JSON.stringify({
          approved_by: currentUser.user_name || 'Finance Admin'
        })
      });

      if (res.ok) {
        onShowToast(`✓ Loan request ${action}d successfully`, 'success');
        fetchApprovals();
      } else {
        throw new Error(`Failed to ${action} loan`);
      }
    } catch (err: any) {
      onShowToast(err.message || `Error ${action}ing loan`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Ticket Response Action
  const handleRespondTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketResponse.trim() || !activeTicket) return;

    try {
      setIsProcessing(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/portal/tickets/${activeTicket.id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': currentUser.organization_id
        },
        body: JSON.stringify({
          response: ticketResponse.trim(),
          responded_by: currentUser.user_name || 'HR Admin'
        })
      });

      if (res.ok) {
        onShowToast(`✓ Ticket ${activeTicket.ticket_number} resolved & response sent!`, 'success');
        setActiveTicket(null);
        setTicketResponse('');
        fetchApprovals();
      } else {
        throw new Error('Failed to resolve ticket');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error resolving ticket', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin & HR Approvals Desk</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized queue for reviewing employee leaves, salary advances, and support tickets.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-xl text-xs text-teal-300 font-semibold self-start">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Admin Console Linkage</span>
        </div>
      </div>

      {/* Tabs with Count Badges */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'leaves'
              ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>Leave Requests</span>
          {data.summary.pending_leaves > 0 && (
            <span className="bg-teal-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
              {data.summary.pending_leaves}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'loans'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Salary Advances & Loans</span>
          {data.summary.pending_loans > 0 && (
            <span className="bg-emerald-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
              {data.summary.pending_loans}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'tickets'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>HR Support Tickets</span>
          {data.summary.open_tickets > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {data.summary.open_tickets}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Leave Requests Queue */}
      {activeTab === 'leaves' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Pending Leave Applications ({data.leaves.length})</h2>

          {data.leaves.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">There are no pending employee leave requests requiring approval.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Employee</th>
                    <th className="pb-3">Leave Type</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Days</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-white">
                        {lv.employee_name}
                      </td>
                      <td className="py-3.5 text-teal-300 font-semibold">
                        {lv.leave_type}
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-slate-300">
                        {lv.start_date} → {lv.end_date}
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        {lv.days} {lv.days === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-3.5 text-slate-400 max-w-xs truncate">
                        {lv.reason || '—'}
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-2">
                        <button
                          onClick={() => handleLeaveAction(lv.id, 'approve')}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleLeaveAction(lv.id, 'reject')}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Loans & Advance Applications */}
      {activeTab === 'loans' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Pending Advance & Loan Applications ({data.loans.length})</h2>

          {data.loans.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">There are no pending salary advance requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Employee</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Monthly Deduction</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.loans.map((ln) => (
                    <tr key={ln.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-white">
                        {ln.employee_name}
                      </td>
                      <td className="py-3.5 text-emerald-400 font-semibold">
                        {ln.request_type}
                      </td>
                      <td className="py-3.5 font-bold text-white text-sm">
                        KES {ln.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 font-semibold text-teal-300">
                        KES {ln.monthly_deduction.toLocaleString()} / mo
                      </td>
                      <td className="py-3.5 text-slate-400 max-w-xs truncate">
                        {ln.reason || '—'}
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-2">
                        <button
                          onClick={() => handleLoanAction(ln.id, 'approve')}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleLoanAction(ln.id, 'reject')}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: HR Support Tickets Queue */}
      {activeTab === 'tickets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Open HR Support Queries ({data.tickets.length})</h2>

          {data.tickets.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">All queries resolved!</p>
              <p className="text-xs text-slate-500 mt-1">No open employee tickets require attention.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.tickets.map((t) => (
                <div key={t.id} className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-400">{t.ticket_number}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {t.priority} Priority
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{t.subject}</h4>
                    <p className="text-xs text-teal-400 mt-0.5">From: {t.employee_name} ({t.category})</p>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                    {t.message}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setActiveTicket(t);
                        setTicketResponse('');
                      }}
                      className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Respond & Resolve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Response Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-teal-400">{activeTicket.ticket_number}</span>
                <h3 className="text-base font-bold text-white mt-0.5">Respond to Ticket</h3>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-2xl space-y-1.5 text-xs">
              <div className="font-bold text-white">{activeTicket.subject}</div>
              <div className="text-slate-400 text-[11px]">Submitted by {activeTicket.employee_name}</div>
              <p className="text-slate-300 pt-1 leading-relaxed">{activeTicket.message}</p>
            </div>

            <form onSubmit={handleRespondTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Resolution / Official HR Response
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter response that will be displayed in the employee's portal..."
                  value={ticketResponse}
                  onChange={(e) => setTicketResponse(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 text-xs transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Sending...' : 'Send & Mark Resolved'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
