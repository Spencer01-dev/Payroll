import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { PayrollPage } from './pages/PayrollPage';
import { PayslipsPage } from './pages/PayslipsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PayrollCalculatorModal } from './components/PayrollCalculatorModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { EditEmployeeModal } from './components/EditEmployeeModal';
import { PayslipViewerModal } from './components/PayslipViewerModal';
import { AuthScreen } from './components/AuthScreen';
import { Employee, PayrollRun, PayrollItem, AuditLog } from './types';

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employee_code: 'EMP-001',
    first_name: 'David',
    last_name: 'Ochieng',
    email: 'david.ochieng@safaritech.co.ke',
    phone: '+254 722 100200',
    department_id: 'dept_eng',
    department_name: 'Engineering',
    job_title: 'Lead Software Engineer',
    hire_date: '2023-01-15',
    basic_salary: 185000,
    housing_allowance: 25000,
    transport_allowance: 10000,
    pay_frequency: 'Monthly',
    payment_method: 'Bank Transfer',
    bank_name: 'KCB Bank Kenya',
    bank_account_number: '1289004455',
    kra_pin: 'A019827364Z',
    nssf_number: 'NSSF-987123',
    shif_number: 'SHIF-443322',
    status: 'Active'
  },
  {
    id: 'emp-2',
    employee_code: 'EMP-002',
    first_name: 'Amina',
    last_name: 'Hassan',
    email: 'amina.hassan@safaritech.co.ke',
    phone: '+254 733 400500',
    department_id: 'dept_fin',
    department_name: 'Finance & Ops',
    job_title: 'Senior Financial Analyst',
    hire_date: '2023-06-01',
    basic_salary: 120000,
    housing_allowance: 15000,
    pay_frequency: 'Monthly',
    payment_method: 'Bank Transfer',
    bank_name: 'Equity Bank Kenya',
    bank_account_number: '01102993881',
    kra_pin: 'A014556677Y',
    nssf_number: 'NSSF-654321',
    shif_number: 'SHIF-887766',
    status: 'Active'
  },
  {
    id: 'emp-3',
    employee_code: 'EMP-003',
    first_name: 'Samuel',
    last_name: 'Mwangi',
    email: 'samuel.mwangi@safaritech.co.ke',
    phone: '+254 711 889900',
    department_id: 'dept_hr',
    department_name: 'Human Resources',
    job_title: 'HR & Talent Specialist',
    hire_date: '2024-02-10',
    basic_salary: 75000,
    housing_allowance: 10000,
    pay_frequency: 'Monthly',
    payment_method: 'Bank Transfer',
    bank_name: 'Co-operative Bank',
    bank_account_number: '01129883774',
    kra_pin: 'A011223344X',
    nssf_number: 'NSSF-112233',
    shif_number: 'SHIF-998877',
    status: 'Active'
  },
  {
    id: 'emp-4',
    employee_code: 'EMP-004',
    first_name: 'Grace',
    last_name: 'Kiprono',
    email: 'grace.kiprono@safaritech.co.ke',
    phone: '+254 701 554433',
    department_id: 'dept_eng',
    department_name: 'Engineering',
    job_title: 'UI/UX Product Designer',
    hire_date: '2024-05-15',
    basic_salary: 95000,
    transport_allowance: 8000,
    pay_frequency: 'Monthly',
    payment_method: 'Bank Transfer',
    bank_name: 'Standard Chartered',
    bank_account_number: '01080998877',
    kra_pin: 'A017788990W',
    nssf_number: 'NSSF-445566',
    shif_number: 'SHIF-332211',
    status: 'Active'
  },
  {
    id: 'emp-5',
    employee_code: 'EMP-005',
    first_name: 'Kevin',
    last_name: 'Mutua',
    email: 'kevin.mutua@safaritech.co.ke',
    phone: '+254 799 112233',
    department_id: 'dept_fin',
    department_name: 'Finance & Ops',
    job_title: 'Operations Assistant',
    hire_date: '2024-09-01',
    basic_salary: 45000,
    pay_frequency: 'Monthly',
    payment_method: 'Bank Transfer',
    bank_name: 'NCBA Bank',
    bank_account_number: '6655443322',
    kra_pin: 'A015544332V',
    nssf_number: 'NSSF-778899',
    shif_number: 'SHIF-554433',
    status: 'Active'
  }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  
  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('smartpay_token'));
  const [currentUser, setCurrentUser] = useState<any>(
    localStorage.getItem('smartpay_user') ? JSON.parse(localStorage.getItem('smartpay_user')!) : null
  );
  
  const isLoggedIn = !!token;
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Modals state
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedPayslipItem, setSelectedPayslipItem] = useState<PayrollItem | null>(null);

  // App State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Show a toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // Calculation Function executing Kenya Statutory Logic
  const executeKenyaPayrollRun = useCallback((periodName: string, empList?: Employee[]) => {
    const activeEmps = (empList || employees).filter(e => e.status === 'Active');

    let totGross = 0;
    let totPAYE = 0;
    let totNSSF = 0;
    let totSHIF = 0;
    let totHousing = 0;
    let totOther = 0;
    let totNet = 0;
    let totCost = 0;

    const items: PayrollItem[] = activeEmps.map(emp => {
      const gross = emp.basic_salary + (emp.housing_allowance || 0) + (emp.transport_allowance || 0) + (emp.other_allowances || 0);
      
      // NSSF
      const nssfTier1 = Math.min(gross, 8000) * 0.06;
      const nssfTier2 = Math.max(0, Math.min(gross, 72000) - 8000) * 0.06;
      const nssfEmp = nssfTier1 + nssfTier2;

      // SHIF 2.75%
      const shifEmp = Math.max(300, gross * 0.0275);

      // Housing Levy 1.5%
      const housingEmp = gross * 0.015;

      // Taxable Pay
      const taxable = Math.max(0, gross - nssfEmp - shifEmp - housingEmp);

      // Progressive PAYE
      let grossPAYE = 0;
      let rem = taxable;
      const b1 = Math.min(rem, 24000); grossPAYE += b1 * 0.10; rem -= b1;
      if (rem > 0) { const b2 = Math.min(rem, 8333); grossPAYE += b2 * 0.25; rem -= b2; }
      if (rem > 0) { const b3 = Math.min(rem, 467667); grossPAYE += b3 * 0.30; rem -= b3; }
      if (rem > 0) { grossPAYE += rem * 0.325; }

      const personalRelief = 2400;
      const payeDue = Math.max(0, grossPAYE - personalRelief);

      const otherDeductions = emp.custom_deductions || 0;
      const totalDeductions = payeDue + nssfEmp + shifEmp + housingEmp + otherDeductions;
      const netPay = Math.max(0, gross - totalDeductions);
      const employerCost = gross + nssfEmp + housingEmp;

      totGross += gross;
      totPAYE += payeDue;
      totNSSF += nssfEmp;
      totSHIF += shifEmp;
      totHousing += housingEmp;
      totOther += otherDeductions;
      totNet += netPay;
      totCost += employerCost;

      return {
        id: `item-${emp.id}`,
        employee_id: emp.id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        employee_code: emp.employee_code,
        job_title: emp.job_title,
        basic_salary: emp.basic_salary,
        allowances: (emp.housing_allowance || 0) + (emp.transport_allowance || 0),
        overtime_pay: 0,
        bonuses: 0,
        gross_pay: gross,
        nssf_employee: Math.round(nssfEmp * 100) / 100,
        nssf_employer: Math.round(nssfEmp * 100) / 100,
        shif_employee: Math.round(shifEmp * 100) / 100,
        housing_levy_employee: Math.round(housingEmp * 100) / 100,
        housing_levy_employer: Math.round(housingEmp * 100) / 100,
        taxable_pay: Math.round(taxable * 100) / 100,
        paye_tax_before_relief: Math.round(grossPAYE * 100) / 100,
        personal_relief: personalRelief,
        paye_tax: Math.round(payeDue * 100) / 100,
        other_deductions: otherDeductions,
        total_deductions: Math.round(totalDeductions * 100) / 100,
        net_pay: Math.round(netPay * 100) / 100,
        employer_cost: Math.round(employerCost * 100) / 100
      };
    });

    const run: PayrollRun = {
      id: `run-${Date.now()}`,
      organization_id: 'default_org_id',
      period_name: periodName,
      country: 'Kenya',
      currency: 'KES',
      total_employees: activeEmps.length,
      total_gross_pay: Math.round(totGross * 100) / 100,
      total_paye_tax: Math.round(totPAYE * 100) / 100,
      total_nssf: Math.round(totNSSF * 100) / 100,
      total_shif: Math.round(totSHIF * 100) / 100,
      total_housing_levy: Math.round(totHousing * 100) / 100,
      total_other_deductions: Math.round(totOther * 100) / 100,
      total_net_pay: Math.round(totNet * 100) / 100,
      total_employer_cost: Math.round(totCost * 100) / 100,
      status: 'CALCULATED',
      created_at: new Date().toISOString(),
      items: items
    };

    setPayrollRuns([run]);

    // Append Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      user_email: 'admin@smartpay.io',
      action: 'PAYROLL_CALCULATED',
      resource: `PayrollRun:${periodName}`,
      details: `Calculated Kenya statutory gross-to-net pipeline for ${activeEmps.length} active employees`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
    showToast(`✓ Kenya payroll for ${periodName} calculated for ${activeEmps.length} employees`, 'success');
  }, [employees]);

  // Initial Calculation of July 2026 Payroll
  useEffect(() => {
    executeKenyaPayrollRun('July 2026');
  }, []);

  const handleApprovePayroll = (runId: string) => {
    setPayrollRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'APPROVED', approved_by: 'Faith Wanjiku (Owner)', approved_at: new Date().toISOString() } : r));
    setAuditLogs(prev => [{
      id: `log-${Date.now()}`,
      user_email: 'admin@smartpay.io',
      action: 'PAYROLL_APPROVED',
      resource: `PayrollRun:${runId}`,
      details: 'Approved Kenya payroll run for execution',
      timestamp: new Date().toISOString()
    }, ...prev]);
    showToast('✓ Payroll run approved successfully', 'success');
  };

  const handleLockPayroll = (runId: string) => {
    setPayrollRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'LOCKED' } : r));
    setAuditLogs(prev => [{
      id: `log-${Date.now()}`,
      user_email: 'admin@smartpay.io',
      action: 'PAYROLL_LOCKED',
      resource: `PayrollRun:${runId}`,
      details: 'Locked payroll run and issued printable payslips',
      timestamp: new Date().toISOString()
    }, ...prev]);
    showToast('✓ Payroll locked & payslips issued', 'success');
  };

  const handleAddEmployee = (newEmpData: Partial<Employee>) => {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employee_code: newEmpData.employee_code || `EMP-00${employees.length + 1}`,
      first_name: newEmpData.first_name || 'New',
      last_name: newEmpData.last_name || 'Employee',
      email: newEmpData.email || 'employee@safaritech.co.ke',
      job_title: newEmpData.job_title || 'Staff',
      basic_salary: newEmpData.basic_salary || 60000,
      housing_allowance: newEmpData.housing_allowance || 0,
      hire_date: newEmpData.hire_date || '2026-08-01',
      pay_frequency: 'Monthly',
      payment_method: 'Bank Transfer',
      bank_name: newEmpData.bank_name || 'KCB Bank',
      bank_account_number: newEmpData.bank_account_number || '1234567890',
      kra_pin: newEmpData.kra_pin || 'A019827364Z',
      nssf_number: newEmpData.nssf_number || 'NSSF-998877',
      shif_number: newEmpData.shif_number || 'SHIF-443322',
      status: 'Active'
    };

    const updatedEmps = [...employees, newEmp];
    setEmployees(updatedEmps);
    executeKenyaPayrollRun('July 2026', updatedEmps);

    setAuditLogs(prev => [{
      id: `log-${Date.now()}`,
      user_email: 'admin@smartpay.io',
      action: 'EMPLOYEE_CREATED',
      resource: `Employee:${newEmp.employee_code}`,
      details: `Onboarded new staff member ${newEmp.first_name} ${newEmp.last_name}`,
      timestamp: new Date().toISOString()
    }, ...prev]);
    showToast(`✓ ${newEmp.first_name} ${newEmp.last_name} added successfully`, 'success');
  };

  const handleEditEmployee = (updatedEmp: Employee) => {
    const updatedEmps = employees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    setEmployees(updatedEmps);
    executeKenyaPayrollRun('July 2026', updatedEmps);

    setAuditLogs(prev => [{
      id: `log-${Date.now()}`,
      user_email: 'admin@smartpay.io',
      action: 'EMPLOYEE_UPDATED',
      resource: `Employee:${updatedEmp.employee_code}`,
      details: `Updated profile for ${updatedEmp.first_name} ${updatedEmp.last_name}`,
      timestamp: new Date().toISOString()
    }, ...prev]);
    showToast(`✓ ${updatedEmp.first_name} ${updatedEmp.last_name} updated successfully`, 'success');
  };

  const handleDeleteEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    const updatedEmps = employees.filter(e => e.id !== empId);
    setEmployees(updatedEmps);
    executeKenyaPayrollRun('July 2026', updatedEmps);

    setAuditLogs(prev => [{
      id: `log-${Date.now()}`,
      user_email: 'admin@smartpay.io',
      action: 'EMPLOYEE_DELETED',
      resource: `Employee:${emp?.employee_code || empId}`,
      details: `Removed employee ${emp?.first_name} ${emp?.last_name} from roster`,
      timestamp: new Date().toISOString()
    }, ...prev]);
    showToast(`✓ ${emp?.first_name} ${emp?.last_name} removed from roster`, 'info');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of SmartPay?')) {
      localStorage.removeItem('smartpay_token');
      localStorage.removeItem('smartpay_user');
      setToken(null);
      setCurrentUser(null);
    }
  };

  const handleLoginSuccess = (newToken: string, user: any) => {
    localStorage.setItem('smartpay_token', newToken);
    localStorage.setItem('smartpay_user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  // Login Screen
  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} onShowToast={showToast} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold border animate-in slide-in-from-right fade-in duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
          toast.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
          'bg-slate-800 text-slate-100 border-slate-700'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Top Header */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCalculator={() => setIsCalcOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Body: Sidebar + Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardPage
              employees={employees}
              payrollRuns={payrollRuns}
              onNavigate={setActiveTab}
              onOpenCalculator={() => setIsCalcOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesPage
              employees={employees}
              onOpenAddModal={() => setIsAddEmpOpen(true)}
              onEditEmployee={(emp) => setEditingEmployee(emp)}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollPage
              payrollRuns={payrollRuns}
              onCalculatePayroll={executeKenyaPayrollRun}
              onApprovePayroll={handleApprovePayroll}
              onLockPayroll={handleLockPayroll}
              onViewPayslip={(item) => setSelectedPayslipItem(item)}
            />
          )}

          {activeTab === 'payslips' && (
            <PayslipsPage
              payrollRuns={payrollRuns}
              onViewPayslip={(item) => setSelectedPayslipItem(item)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage payrollRuns={payrollRuns} />
          )}

          {activeTab === 'audit' && (
            <AuditLogsPage logs={auditLogs} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>

      </div>

      {/* Global Modals */}
      <PayrollCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

      <AddEmployeeModal
        isOpen={isAddEmpOpen}
        onClose={() => setIsAddEmpOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <EditEmployeeModal
        isOpen={editingEmployee !== null}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSaveEmployee={handleEditEmployee}
      />

      <PayslipViewerModal
        isOpen={selectedPayslipItem !== null}
        onClose={() => setSelectedPayslipItem(null)}
        item={selectedPayslipItem}
        periodName="July 2026"
      />

    </div>
  );
};
