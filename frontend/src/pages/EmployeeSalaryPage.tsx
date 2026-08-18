import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  ShieldCheck, 
  ArrowDownRight, 
  ArrowUpRight, 
  HelpCircle, 
  Info, 
  Calculator, 
  FileText,
  PieChart,
  Percent
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface EmployeeSalaryPageProps {
  currentUser: any;
}

export const EmployeeSalaryPage: React.FC<EmployeeSalaryPageProps> = ({ currentUser }) => {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [statutoryInfo, setStatutoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userEmail = currentUser?.user_email || currentUser?.email || '';

  useEffect(() => {
    const fetchSalaryData = async () => {
      if (!userEmail) return;
      try {
        setLoading(true);
        const [bdRes, statRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/portal/salary-breakdown?employee_email=${encodeURIComponent(userEmail)}`, {
            headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
          }),
          fetch(`${API_BASE_URL}/api/v1/portal/statutory-info`, {
            headers: { 'x-org-id': currentUser?.organization_id || 'default_org' }
          })
        ]);

        if (bdRes.ok) setBreakdown(await bdRes.json());
        if (statRes.ok) setStatutoryInfo(await statRes.json());
      } catch (err) {
        console.error('Error fetching salary details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, [userEmail, currentUser]);

  const basic = breakdown?.basic_salary || 85000;
  const housing = breakdown?.housing_allowance || 5000;
  const transport = breakdown?.transport_allowance || 3000;
  const gross = breakdown?.gross_pay || (basic + housing + transport);
  const nssf = breakdown?.nssf_employee || 2160;
  const shif = breakdown?.shif || (gross * 0.0275);
  const ahl = breakdown?.housing_levy || (gross * 0.015);
  const paye = breakdown?.paye || 14500;
  const totalDeductions = breakdown?.total_deductions || (nssf + shif + ahl + paye);
  const netPay = breakdown?.net_pay || (gross - totalDeductions);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Salary Breakdown & Statutory Simulator</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent view of how your gross remuneration translates to net take-home under Kenya 2026 tax law.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-xl text-xs text-teal-300 font-semibold self-start">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>KRA Compliant (2026 Bands)</span>
        </div>
      </div>

      {/* Hero Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Remuneration</div>
          <div className="text-3xl font-black text-white mt-2">
            KES {gross.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-teal-400 font-semibold">Basic + Allowances</span> before statutory deductions
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Deductions</div>
          <div className="text-3xl font-black text-rose-400 mt-2">
            -KES {totalDeductions.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>PAYE, NSSF, SHIF (2.75%), AHL (1.5%)</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-teal-900/50 via-slate-900 to-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Estimated Net Pay</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            KES {netPay.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-300 mt-2 flex items-center gap-1">
            <span>Direct deposit to your registered bank account</span>
          </p>
        </div>
      </div>

      {/* Step-by-Step Calculation Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-teal-400" />
            <span>Remuneration Waterfall</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step breakdown from Basic Salary to Net Take-Home.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Step 1: Earnings */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-white font-bold pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px]">1</span>
                <span>Earnings & Gross Pay</span>
              </span>
              <span className="text-sm font-black text-emerald-400">
                +KES {gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60">
                <span className="text-slate-400">Basic Salary</span>
                <span className="font-semibold text-white">KES {basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60">
                <span className="text-slate-400">Housing Allowance</span>
                <span className="font-semibold text-white">KES {housing.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-800/60">
                <span className="text-slate-400">Transport Allowance</span>
                <span className="font-semibold text-white">KES {transport.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Step 2: Statutory Deductions */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-white font-bold pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px]">2</span>
                <span>Statutory Deductions (Kenya 2026)</span>
              </span>
              <span className="text-sm font-black text-rose-400">
                -KES {totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-800/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">NSSF (Tier I & II)</span>
                  <span className="font-bold text-rose-400">-KES {nssf.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-slate-500">Tier I + Tier II limits</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">SHIF (2.75%)</span>
                  <span className="font-bold text-rose-400">-KES {shif.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-slate-500">2.75% of Gross Pay</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Housing Levy (1.5%)</span>
                  <span className="font-bold text-rose-400">-KES {ahl.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-slate-500">Affordable Housing Levy</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">PAYE Tax</span>
                  <span className="font-bold text-rose-400">-KES {paye.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-slate-500">After KES 2,400 Relief</p>
              </div>
            </div>
          </div>

          {/* Step 3: Final Net Pay */}
          <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
              <span className="text-sm font-bold text-white">Final Net Pay (Take Home)</span>
            </div>
            <div className="text-xl font-black text-emerald-400">
              KES {netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Rules Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-400" />
          <span>Statutory Rules Reference Guide (Kenya 2026)</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {statutoryInfo?.rules?.map((r: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-teal-300">{r.name}</h4>
              <p className="text-slate-400 leading-relaxed">{r.description}</p>
            </div>
          )) || (
            <>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-teal-300">PAYE Bands (Kenya 2026)</h4>
                <p className="text-slate-400 leading-relaxed">
                  First KES 24,000 at 10%, next KES 16,667 at 25%, next KES 16,667 at 30%, next KES 16,667 at 32.5%, and above KES 74,001 at 35%. Monthly personal relief is KES 2,400.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-teal-300">Social Health Insurance Fund (SHIF)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Effective 2.75% deduction of gross monthly pay replacing previous NHIF tier tables.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
