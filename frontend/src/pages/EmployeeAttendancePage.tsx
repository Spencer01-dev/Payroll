import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Square, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { AttendanceRecordItem } from '../types';
import { API_BASE_URL } from '../config';

interface EmployeeAttendancePageProps {
  currentUser: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EmployeeAttendancePage: React.FC<EmployeeAttendancePageProps> = ({
  currentUser,
  onShowToast
}) => {
  const [history, setHistory] = useState<AttendanceRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Digital clock interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  const fetchHistory = async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/attendance/history?employee_email=${encodeURIComponent(userEmail)}`,
        {
          headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
        }
      );
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userEmail, currentUser]);

  // Today's record
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = history.find(h => h.date === todayStr);

  const handleClock = async (action: 'clock_in' | 'clock_out') => {
    if (!userEmail) {
      onShowToast('User email not found. Please log in again.', 'error');
      return;
    }
    try {
      setIsClocking(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/portal/attendance/clock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': currentUser?.organization_id || 'default_org'
        },
        body: JSON.stringify({
          employee_email: userEmail,
          action
        })
      });

      if (res.ok) {
        const data = await res.json();
        onShowToast(action === 'clock_in' ? '✓ Clocked in successfully!' : '✓ Clocked out successfully!', 'success');
        fetchHistory();
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === 'string' ? err.detail : 'Clock action failed';
        throw new Error(msg);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error clocking in/out', 'error');
    } finally {
      setIsClocking(false);
    }
  };

  // Aggregated monthly hours
  const totalRegularHours = history.reduce((acc, cur) => acc + (cur.working_hours || 0), 0);
  const totalOvertimeHours = history.reduce((acc, cur) => acc + (cur.overtime_hours || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Attendance & Clock In/Out</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Record your daily work shifts and track regular & overtime hours.
        </p>
      </div>

      {/* Hero Clock-In Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Digital Clock */}
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Timer className="w-4 h-4" />
              <span>Real-Time Timestamp (EAT UTC+3)</span>
            </div>
            
            <div className="text-4xl sm:text-6xl font-mono font-black text-white tracking-tight">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>

            <p className="text-xs sm:text-sm text-slate-400">
              {currentTime.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                todayRecord?.clock_in && !todayRecord?.clock_out ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                todayRecord?.clock_out ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${todayRecord?.clock_in && !todayRecord?.clock_out ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {todayRecord?.clock_in && !todayRecord?.clock_out ? 'Currently On Shift' :
                 todayRecord?.clock_out ? 'Shift Completed' : 'Not Clocked In Today'}
              </span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
            {!todayRecord?.clock_in ? (
              <button
                onClick={() => handleClock('clock_in')}
                disabled={isClocking}
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-base shadow-xl shadow-teal-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white" />
                <span>{isClocking ? 'Recording...' : 'Clock In Now'}</span>
              </button>
            ) : !todayRecord?.clock_out ? (
              <button
                onClick={() => handleClock('clock_out')}
                disabled={isClocking}
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-base shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Square className="w-6 h-6 fill-white" />
                <span>{isClocking ? 'Recording...' : 'Clock Out Now'}</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-white">Shift Logged for Today</div>
                <p className="text-xs text-slate-400">
                  {todayRecord.clock_in} → {todayRecord.clock_out} ({todayRecord.working_hours} hrs)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Days Recorded</span>
          <div className="text-2xl font-black text-white mt-1">{history.length} Days</div>
          <p className="text-[11px] text-teal-400 mt-1">This billing cycle</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Regular Hours</span>
          <div className="text-2xl font-black text-white mt-1">{totalRegularHours.toFixed(1)} hrs</div>
          <p className="text-[11px] text-emerald-400 mt-1">Standard shift time</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Overtime Accrued</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalOvertimeHours.toFixed(1)} hrs</div>
          <p className="text-[11px] text-amber-400 mt-1">Eligible for bonus rate</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Attendance Log (Last 30 Days)</h2>
            <p className="text-xs text-slate-400">Timestamp records with duration and overtime audit</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No attendance records yet</p>
            <p className="text-xs text-slate-500 mt-1">Click the "Clock In" button above to start tracking your time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Clock In</th>
                  <th className="pb-3">Clock Out</th>
                  <th className="pb-3">Working Hours</th>
                  <th className="pb-3">Overtime</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-white">
                      {rec.date}
                    </td>
                    <td className="py-3.5 font-mono text-teal-300">
                      {rec.clock_in || '—'}
                    </td>
                    <td className="py-3.5 font-mono text-slate-300">
                      {rec.clock_out || '—'}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-200">
                      {rec.working_hours ? `${rec.working_hours} hrs` : '—'}
                    </td>
                    <td className="py-3.5 text-amber-400 font-semibold">
                      {rec.overtime_hours > 0 ? `+${rec.overtime_hours} hrs` : '0.0 hrs'}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {rec.status}
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
  );
};
