import React, { useState } from 'react';
import { Settings, Sliders, ShieldCheck, Globe, Save, Building } from 'lucide-react';

interface SettingsPageProps {
  currentUser?: any;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const [personalRelief, setPersonalRelief] = useState<number>(2400);
  const [nssfTier1, setNssfTier1] = useState<number>(8000);
  const [nssfTier2, setNssfTier2] = useState<number>(72000);
  const [shifRate, setShifRate] = useState<number>(2.75);
  const [housingLevyRate, setHousingLevyRate] = useState<number>(1.5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Country Rules & System Settings</h1>
          <p className="text-xs text-slate-500">Configure versioned statutory calculation parameters without changing core code</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
          <Globe className="w-4 h-4" />
          <span>Active Country: Kenya 🇰🇪</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 p-4 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>✓ Kenya Statutory Rule Parameters updated successfully for future payroll runs!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Statutory Config */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Kenya 2026 Legislation Configurator</h3>
              <p className="text-xs text-slate-500">Adjust active statutory rates, relief constants, & earnings ceilings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                KRA Monthly Personal Relief (KES)
              </label>
              <input
                type="number"
                value={personalRelief}
                onChange={(e) => setPersonalRelief(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                SHIF Rate (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={shifRate}
                onChange={(e) => setShifRate(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                NSSF Tier I Lower Limit (KES)
              </label>
              <input
                type="number"
                value={nssfTier1}
                onChange={(e) => setNssfTier1(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                NSSF Tier II Upper Limit (KES)
              </label>
              <input
                type="number"
                value={nssfTier2}
                onChange={(e) => setNssfTier2(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Affordable Housing Levy Employee Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={housingLevyRate}
                onChange={(e) => setHousingLevyRate(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-teal-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Statutory Ruleset</span>
            </button>
          </div>
        </div>

        {/* Right Col: Org Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Organization Details</h3>
              <p className="text-[11px] text-slate-400">Multi-tenant account parameters</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Legal Company Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser?.organization_name || 'Not Set'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Owner</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser?.user_name || 'Admin'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary Currency</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">KES (Kenyan Shilling)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Headquarters</span>
              <span className="text-slate-700 dark:text-slate-300">Nairobi, Kenya</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
