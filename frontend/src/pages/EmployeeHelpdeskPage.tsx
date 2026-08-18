import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';
import { HRTicketItem } from '../types';
import { API_BASE_URL } from '../config';

interface EmployeeHelpdeskPageProps {
  currentUser: any;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const EmployeeHelpdeskPage: React.FC<EmployeeHelpdeskPageProps> = ({
  currentUser,
  onShowToast
}) => {
  const [tickets, setTickets] = useState<HRTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HRTicketItem | null>(null);

  // Form State
  const [category, setCategory] = useState('Salary Query');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  const fetchTickets = async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/tickets?employee_email=${encodeURIComponent(userEmail)}`,
        {
          headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (data.length > 0 && !selectedTicket) {
          setSelectedTicket(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [userEmail, currentUser]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      onShowToast('Please complete the subject and message fields', 'error');
      return;
    }
    if (!userEmail) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/portal/tickets?employee_email=${encodeURIComponent(userEmail)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-org-id': currentUser?.organization_id || 'default_org'
          },
          body: JSON.stringify({
            category,
            subject,
            message,
            priority
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        onShowToast(`Ticket ${data.ticket_number} created successfully!`, 'success');
        setSubject('');
        setMessage('');
        fetchTickets();
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === 'string' ? err.detail : 'Failed to submit ticket';
        throw new Error(msg);
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error submitting ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">HR Helpdesk & Query Tickets</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit queries regarding salary calculations, payslip discrepancies, or request official documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Ticket Form (1 col) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-teal-400" />
              <span>Raise Support Ticket</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Direct line to HR and Payroll admins</p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Salary Query">Salary & Remuneration Query</option>
                <option value="Payslip Correction">Payslip Correction</option>
                <option value="Leave Issue">Leave Balance Adjustment</option>
                <option value="Tax Info">KRA Tax / P9 Information</option>
                <option value="Employment Letter">Employment Verification Letter</option>
                <option value="General">General HR Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Question regarding July SHIF deduction"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your inquiry in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition-all text-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </form>
        </div>

        {/* Tickets List & Detail View (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Threads */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Your Tickets ({tickets.length})</h2>
              <span className="text-xs text-slate-400">Click a ticket to view resolution thread</span>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">No support tickets raised</p>
                <p className="text-xs text-slate-500 mt-1">If you have any questions for HR, submit a ticket using the form.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tickets.map(t => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-teal-600/15 border-teal-500/40 shadow-lg' 
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold text-teal-400">{t.ticket_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{t.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ticket Detail / Resolution View */}
          {selectedTicket && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-400">{selectedTicket.ticket_number}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedTicket.subject}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                  <p className="text-xs font-semibold text-slate-200">{selectedTicket.category}</p>
                </div>
              </div>

              {/* Employee Message */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    <span>You ({currentUser.user_name})</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedTicket.message}</p>
              </div>

              {/* Admin Resolution */}
              {selectedTicket.response ? (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>HR Resolution by {selectedTicket.responded_by || 'HR Administrator'}</span>
                    </span>
                    <span className="text-emerald-400/80 text-[11px]">
                      {selectedTicket.resolved_at ? new Date(selectedTicket.resolved_at).toLocaleString() : 'Resolved'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{selectedTicket.response}</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Your query is currently under review by the HR team. You will be notified once resolved.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
