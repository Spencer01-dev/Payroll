import React from 'react';
import { Building2, Calculator, Moon, Sun, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenCalculator: () => void;
  onLogout: () => void;
  currentUser: any;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  darkMode, 
  setDarkMode, 
  onOpenCalculator, 
  onLogout, 
  currentUser,
  isMobileMenuOpen = false,
  onToggleMobileMenu
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle & Brand logo */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 font-bold text-white text-lg sm:text-xl tracking-wider shrink-0">
              S
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                SmartPay <span className="text-teal-400 font-medium">Global</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 -mt-1 font-mono">Workforce & Payroll SaaS</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Kenya 🇰🇪 (2026 Ruleset)</span>
          </div>
        </div>

        {/* Center/Right: Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Kenya Calculator Quick Tool */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            title="Open KRA Gross-to-Net Calculator"
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">KRA Calculator</span>
            <span className="sm:hidden">Calc</span>
          </button>

          {/* Org Selector (Tablet/Desktop) */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-medium truncate max-w-[120px]">{currentUser?.organization_name || 'My Organization'}</span>
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
          <div className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-teal-300 shrink-0">
              {getInitials(currentUser?.user_name)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{currentUser?.user_name || 'Faith Wanjiku'}</p>
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
