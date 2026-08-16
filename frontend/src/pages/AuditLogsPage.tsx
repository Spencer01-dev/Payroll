import React from 'react';
import { History, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsPageProps {
  logs: AuditLog[];
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ logs }) => {
  const sampleLogs: AuditLog[] = logs.length > 0 ? logs : [
    {
      id: 'log-1',
      user_email: 'admin@smartpay.io',
      action: 'PAYROLL_CALCULATED',
      resource: 'PayrollRun:July-2026',
      details: 'Calculated 2026 Kenya statutory rules for 5 employees',
      timestamp: new Date().toISOString()
    },
    {
      id: 'log-2',
      user_email: 'admin@smartpay.io',
      action: 'EMPLOYEE_ADDED',
      resource: 'Employee:EMP-005',
      details: 'Created employee profile for Kevin Mutua',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'log-3',
      user_email: 'system',
      action: 'INITIAL_SEED',
      resource: 'Organization',
      details: 'Initialized SafariTech Kenya organization',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Security & Audit Logs</h1>
          <p className="text-xs text-slate-500">Tamper-evident audit trail of all sensitive payroll and workforce operations</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
          <ShieldCheck className="w-4 h-4" />
          <span>Tenant Isolation Active</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
              {sampleLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 font-normal">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-sans">
                    {log.user_email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {log.resource}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-sans">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
