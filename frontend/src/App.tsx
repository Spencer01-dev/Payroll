import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { PayrollPage } from './pages/PayrollPage';
import { PayslipsPage } from './pages/PayslipsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

// Employee Portal Pages
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { EmployeeSalaryPage } from './pages/EmployeeSalaryPage';
import { EmployeeLeavePage } from './pages/EmployeeLeavePage';
import { EmployeeAttendancePage } from './pages/EmployeeAttendancePage';
import { EmployeeLoansPage } from './pages/EmployeeLoansPage';
import { EmployeeDocumentsPage } from './pages/EmployeeDocumentsPage';
import { EmployeeHelpdeskPage } from './pages/EmployeeHelpdeskPage';
import { AdminApprovalsPage } from './pages/AdminApprovalsPage';

import { PayrollCalculatorModal } from './components/PayrollCalculatorModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { EditEmployeeModal } from './components/EditEmployeeModal';
import { PayslipViewerModal } from './components/PayslipViewerModal';
import { AuthScreen } from './components/AuthScreen';
import { Employee, PayrollRun, PayrollItem, AuditLog } from './types';
import { API_BASE_URL } from './config';

const INITIAL_EMPLOYEES: Employee[] = [];


export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('smartpay_token'));
  const [currentUser, setCurrentUser] = useState<any>(
    localStorage.getItem('smartpay_user') ? JSON.parse(localStorage.getItem('smartpay_user')!) : null
  );
  
  const isLoggedIn = !!token;
  const isEmployee = currentUser?.role === 'Employee';
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Modals state
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedPayslipItem, setSelectedPayslipItem] = useState<PayrollItem | null>(null);

  // App State with LocalStorage persistence for standalone usage
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!isLoggedIn || !currentUser) return;
      try {
        const headers = { 'x-org-id': currentUser.organization_id };
        
        // Fetch employees
        const empRes = await fetch(`${API_BASE_URL}/api/v1/employees`, { headers });
        if (empRes.ok) setEmployees(await empRes.json());

        // Fetch payroll runs
        const runRes = await fetch(`${API_BASE_URL}/api/v1/payroll/runs`, { headers });
        if (runRes.ok) setPayrollRuns(await runRes.json());

        // Fetch audit logs
        const auditRes = await fetch(`${API_BASE_URL}/api/v1/reports/audit-logs`, { headers });
        if (auditRes.ok) setAuditLogs(await auditRes.json());
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchAllData();
  }, [isLoggedIn, currentUser]);


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
  const executeKenyaPayrollRun = useCallback(async (periodName: string, empList?: Employee[]) => {
    const activeEmps = (empList || employees).filter(e => e.status === 'Active');
    if (activeEmps.length === 0) {
      showToast('No active employees to process.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/payroll/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': currentUser.organization_id
        },
        body: JSON.stringify({ period_name: periodName, country: 'Kenya', currency: 'KES' })
      });

      if (!response.ok) throw new Error('Failed to calculate payroll');
      
      const newRun = await response.json();
      setPayrollRuns(prev => [...prev, newRun]);

      // Refetch audit logs
      const auditRes = await fetch(`${API_BASE_URL}/api/v1/reports/audit-logs`, { headers: { 'x-org-id': currentUser.organization_id } });
      if (auditRes.ok) setAuditLogs(await auditRes.json());

      showToast(`✓ Kenya payroll for ${periodName} calculated for ${activeEmps.length} employees`, 'success');
    } catch (err) {
      showToast('Error calculating payroll', 'error');
    }
  }, [employees, currentUser]);



  const handleApprovePayroll = async (runId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/payroll/runs/${runId}/approve`, {
        method: 'POST',
        headers: { 'x-org-id': currentUser.organization_id }
      });
      if (!response.ok) throw new Error('Failed to approve');
      
      setPayrollRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'APPROVED', approved_by: currentUser.user_name, approved_at: new Date().toISOString() } : r));
      
      // Refetch audit logs
      const auditRes = await fetch(`${API_BASE_URL}/api/v1/reports/audit-logs`, { headers: { 'x-org-id': currentUser.organization_id } });
      if (auditRes.ok) setAuditLogs(await auditRes.json());

      showToast('✓ Payroll run approved successfully', 'success');
    } catch (err) {
      showToast('Error approving payroll', 'error');
    }
  };

  const handleLockPayroll = async (runId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/payroll/runs/${runId}/lock`, {
        method: 'POST',
        headers: { 'x-org-id': currentUser.organization_id }
      });
      if (!response.ok) throw new Error('Failed to lock');
      
      setPayrollRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'LOCKED' } : r));
      
      // Refetch audit logs
      const auditRes = await fetch(`${API_BASE_URL}/api/v1/reports/audit-logs`, { headers: { 'x-org-id': currentUser.organization_id } });
      if (auditRes.ok) setAuditLogs(await auditRes.json());

      showToast('✓ Payroll locked & payslips issued', 'success');
    } catch (err) {
      showToast('Error locking payroll', 'error');
    }
  };


  const handleAddEmployee = async (newEmpData: Partial<Employee>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': currentUser.organization_id
        },
        body: JSON.stringify(newEmpData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create employee');
      }

      const data = await response.json();
      const newEmp = data.employee;
      const creds = data.login_credentials;

      const updatedEmps = [...employees, newEmp];
      setEmployees(updatedEmps);

      setAuditLogs(prev => [{
        id: `log-${Date.now()}`,
        user_email: currentUser?.email || 'admin@smartpay.io',
        action: 'EMPLOYEE_CREATED',
        resource: `Employee:${newEmp.employee_code}`,
        details: `Onboarded new staff member ${newEmp.first_name} ${newEmp.last_name}`,
        timestamp: new Date().toISOString()
      }, ...prev]);
      
      alert(`Employee Registered Successfully!\n\nPlease save these credentials for the employee to access their dashboard:\n\nUsername: ${creds.email}\nPassword: ${creds.temporary_password}`);
      showToast(`✓ ${newEmp.first_name} ${newEmp.last_name} added successfully`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error creating employee', 'error');
    }
  };

  const handleEditEmployee = async (updatedEmp: Employee) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/employees/${updatedEmp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': currentUser.organization_id
        },
        body: JSON.stringify(updatedEmp)
      });
      
      if (!response.ok) throw new Error('Failed to update employee');
      
      const updated = await response.json();
      const updatedEmps = employees.map(e => e.id === updated.id ? updated : e);
      setEmployees(updatedEmps);
      executeKenyaPayrollRun('July 2026', updatedEmps);

      setAuditLogs(prev => [{
        id: `log-${Date.now()}`,
        user_email: currentUser?.email || 'admin@smartpay.io',
        action: 'EMPLOYEE_UPDATED',
        resource: `Employee:${updated.employee_code}`,
        details: `Updated profile for ${updated.first_name} ${updated.last_name}`,
        timestamp: new Date().toISOString()
      }, ...prev]);
      showToast(`✓ ${updated.first_name} ${updated.last_name} updated successfully`, 'success');
    } catch (err) {
      showToast('Error updating employee', 'error');
    }
  };


  const handleDeleteEmployee = async (empId: string) => {
    try {
      const emp = employees.find(e => e.id === empId);
      const response = await fetch(`${API_BASE_URL}/api/v1/employees/${empId}`, {
        method: 'DELETE',
        headers: {
          'x-org-id': currentUser.organization_id
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete employee');
      
      const updatedEmps = employees.filter(e => e.id !== empId);
      setEmployees(updatedEmps);
      executeKenyaPayrollRun('July 2026', updatedEmps);

      setAuditLogs(prev => [{
        id: `log-${Date.now()}`,
        user_email: currentUser?.email || 'admin@smartpay.io',
        action: 'EMPLOYEE_DELETED',
        resource: `Employee:${emp?.employee_code || empId}`,
        details: `Removed employee ${emp?.first_name} ${emp?.last_name} from roster`,
        timestamp: new Date().toISOString()
      }, ...prev]);
      showToast(`✓ ${emp?.first_name} ${emp?.last_name} removed from roster`, 'info');
    } catch (err) {
      showToast('Error deleting employee', 'error');
    }
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
    setActiveTab('dashboard');
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <>
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold border animate-in slide-in-from-right fade-in duration-300 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
            toast.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
            'bg-slate-800 text-slate-100 border-slate-700'
          }`}>
            {toast.message}
          </div>
        )}
        <AuthScreen onLoginSuccess={handleLoginSuccess} onShowToast={showToast} />
      </>
    );
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
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Body: Sidebar + Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Desktop fixed + Mobile slide-out drawer) */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area with smooth touch scroll and mobile responsive padding */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {/* Dashboard Route - Dynamic based on role */}
          {activeTab === 'dashboard' && (
            isEmployee ? (
              <EmployeeDashboard
                currentUser={currentUser}
                onNavigate={setActiveTab}
                onViewPayslip={(item) => setSelectedPayslipItem(item)}
                payrollRuns={payrollRuns}
              />
            ) : (
              <DashboardPage
                employees={employees}
                payrollRuns={payrollRuns}
                onNavigate={setActiveTab}
                onOpenCalculator={() => setIsCalcOpen(true)}
                currentUser={currentUser}
              />
            )
          )}

          {/* Admin Routes */}
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

          {activeTab === 'admin_approvals' && (
            <AdminApprovalsPage
              currentUser={currentUser}
              onShowToast={showToast}
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
            <SettingsPage currentUser={currentUser} />
          )}

          {/* Employee Portal Specific Routes */}
          {activeTab === 'emp_profile' && (
            <EmployeeProfilePage
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'emp_salary' && (
            <EmployeeSalaryPage
              currentUser={currentUser}
            />
          )}

          {activeTab === 'emp_leave' && (
            <EmployeeLeavePage
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'emp_attendance' && (
            <EmployeeAttendancePage
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'emp_loans' && (
            <EmployeeLoansPage
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'emp_documents' && (
            <EmployeeDocumentsPage
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'emp_helpdesk' && (
            <EmployeeHelpdeskPage
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
      />

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
        currentUser={currentUser}
      />

    </div>
  );
};

