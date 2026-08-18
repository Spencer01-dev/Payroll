import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  PlaneTakeoff, 
  HeartHandshake, 
  Baby, 
  Sparkles,
  Send
} from 'lucide-react';
import { LeaveRequestItem } from '../types';
import { API_BASE_URL } from '../config';

interface EmployeeLeavePageProps {
  currentUser: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EmployeeLeavePage: React.FC<EmployeeLeavePageProps> = ({
  currentUser,
  onShowToast
}) => {
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({
    'Annual Leave': 21,
    'Sick Leave': 14,
    'Maternity Leave': 90,
    'Paternity Leave': 14,
    'Compassionate': 7
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Auto calculate business days between start and end
  const calculatedDays = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sat (6) & Sun (0)
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [startDate, endDate]);

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  const fetchLeaves = async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/leaves?employee_email=${encodeURIComponent(userEmail)}`,
        {
          headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.requests || []);
        if (data.balances) setBalances(data.balances);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [userEmail, currentUser]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedDays <= 0) {
      onShowToast('Please select valid start and end dates', 'error');
      return;
    }
    if (!userEmail) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/leaves?employee_email=${encodeURIComponent(userEmail)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-org-id': currentUser?.organization_id || 'default_org'
          },
          body: JSON.stringify({
            leave_type: leaveType,
            start_date: startDate,
            end_date: endDate,
            days: calculatedDays,
            reason
          })
        }
      );

      if (res.ok) {
        onShowToast(`Leave request for ${calculatedDays} days submitted!`, 'success');
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchLeaves();
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === 'string' ? err.detail : 'Failed to submit leave';
        throw new Error(msg);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error submitting leave request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Leave Management & Time Off</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit new time off requests and view balance allocations.
        </p>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Annual Leave</span>
            <PlaneTakeoff className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{balances['Annual Leave'] ?? 21} <span className="text-xs font-normal text-slate-400">days</span></div>
          <p className="text-[10px] text-teal-400 mt-1">Available out of 21 allocated</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Sick Leave</span>
            <HeartHandshake className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{balances['Sick Leave'] ?? 14} <span className="text-xs font-normal text-slate-400">days</span></div>
          <p className="text-[10px] text-blue-400 mt-1">Full-pay allowance</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Paternity/Maternity</span>
            <Baby className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{balances['Maternity Leave'] ?? 90} <span className="text-xs font-normal text-slate-400">days</span></div>
          <p className="text-[10px] text-purple-400 mt-1">Statutory parental leave</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Compassionate</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{balances['Compassionate'] ?? 7} <span className="text-xs font-normal text-slate-400">days</span></div>
          <p className="text-[10px] text-amber-400 mt-1">Special leave quota</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Apply for Time Off</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Submit request for supervisor review</p>
          </div>

          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Compassionate">Compassionate Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {calculatedDays > 0 && (
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 flex items-center justify-between">
                <span>Working Days Requested:</span>
                <span className="font-bold text-white text-sm">{calculatedDays} Day(s)</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Reason / Notes (Optional)</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide details if required..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || calculatedDays <= 0}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all text-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </form>
        </div>

        {/* Leave Requests History */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Leave History & Status</h2>
              <p className="text-xs text-slate-400">Track current and past time off applications</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Total Requests: {leaves.length}
            </span>
          </div>

          {leaves.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No leave requests found</p>
              <p className="text-xs text-slate-500 mt-1">Submit your first time-off request using the form.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Type</th>
                    <th className="pb-3">Period</th>
                    <th className="pb-3">Days</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-white">
                        {lv.leave_type}
                      </td>
                      <td className="py-3.5 text-slate-300 font-mono text-[11px]">
                        {lv.start_date} → {lv.end_date}
                      </td>
                      <td className="py-3.5 font-bold text-slate-200">
                        {lv.days} {lv.days === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          lv.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          lv.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {lv.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {lv.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {lv.status === 'Pending' && <Clock className="w-3 h-3" />}
                          <span>{lv.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {lv.approved_by || '—'}
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
