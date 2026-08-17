import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  FileText, 
  BarChart3, 
  History, 
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser,
  isMobileOpen = false,
  onCloseMobile
}) => {
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

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 mb-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Main Navigation
          </p>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile} 
              className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
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
      <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3.5 text-xs mt-6">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>KRA Compliant</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          PAYE, NSSF Tier I/II, SHIF 2.75%, & Housing Levy 1.5% enabled.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet fixed sidebar */}
      <aside className="hidden md:flex w-60 lg:w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-slate-800 flex-col justify-between shrink-0">
        {navContent}
      </aside>

      {/* Mobile Off-canvas Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-slate-900 text-slate-300 border-r border-slate-800 shadow-2xl z-10 flex flex-col h-full">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
