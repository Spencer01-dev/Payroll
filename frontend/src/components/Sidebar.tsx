import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  FileText, 
  BarChart3, 
  History, 
  Settings,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const isEmployee = currentUser?.role === 'Employee';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, showForEmployee: true },
    { id: 'employees', label: 'Employees', icon: Users, showForEmployee: false },
    { id: 'payroll', label: 'Payroll Console', icon: Banknote, showForEmployee: false },
    { id: 'payslips', label: 'Payslips', icon: FileText, showForEmployee: true },
    { id: 'reports', label: 'Statutory Reports', icon: BarChart3, showForEmployee: false },
    { id: 'audit', label: 'Audit Logs', icon: History, showForEmployee: false },
    { id: 'settings', label: 'Country & Settings', icon: Settings, showForEmployee: false },
  ].filter(item => !isEmployee || item.showForEmployee);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Main Navigation
        </p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600/15 text-teal-400 font-semibold border border-teal-500/20 shadow-sm'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Statutory Banner Footer */}
      <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3.5 text-xs">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>KRA Compliant</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          PAYE, NSSF Tier I/II, SHIF 2.75%, & Housing Levy 1.5% enabled.
        </p>
      </div>
    </aside>
  );
};
