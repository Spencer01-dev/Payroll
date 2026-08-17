import React from 'react';
import { Building2, Calculator, Moon, Sun, LogOut } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenCalculator: () => void;
  onLogout: () => void;
  currentUser: any;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode, onOpenCalculator, onLogout, currentUser }) => {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand logo & country badge */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 font-bold text-white text-xl tracking-wider">
              S
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                SmartPay <span className="text-teal-400 font-medium">Global</span>
              </span>
              <span className="text-xs text-slate-400 block -mt-1 font-mono">Workforce & Payroll SaaS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Kenya 🇰🇪 (2026 Ruleset)</span>
          </div>
        </div>

        {/* Center/Right: Actions & Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Kenya Calculator Quick Tool */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>KRA Gross-to-Net Calc</span>
          </button>

          {/* Org Selector */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span className="font-medium">{currentUser?.organization_name || 'My Organization'}</span>
          </div>

          {/* Dark mode switch */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-teal-300" />}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-teal-300">
              {getInitials(currentUser?.user_name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200">{currentUser?.user_name || 'Faith Wanjiku'}</p>
              <p className="text-[10px] text-slate-400">{currentUser?.role || 'Company Owner'}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
