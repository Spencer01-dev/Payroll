import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  PlaneTakeoff, 
  User, 
  Users, 
  Banknote, 
  CheckSquare 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser
}) => {
  const isEmployee = currentUser?.role === 'Employee';

  const employeeNav = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'payslips', label: 'Payslips', icon: FileText },
    { id: 'emp_attendance', label: 'Clock In', icon: Clock },
    { id: 'emp_leave', label: 'Leave', icon: PlaneTakeoff },
    { id: 'emp_profile', label: 'Profile', icon: User }
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Staff', icon: Users },
    { id: 'payroll', label: 'Payroll', icon: Banknote },
    { id: 'admin_approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'payslips', label: 'Payslips', icon: FileText }
  ];

  const navItems = isEmployee ? employeeNav : adminNav;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
