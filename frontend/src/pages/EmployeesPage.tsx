import React, { useState } from 'react';
import { Users, Search, Plus, ShieldCheck, FileSpreadsheet, Pencil, Trash2, Building } from 'lucide-react';
import { Employee } from '../types';
import { AddDepartmentModal } from '../components/AddDepartmentModal';

interface EmployeesPageProps {
  employees: Employee[];
  onOpenAddModal: () => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ employees, onOpenAddModal, onEditEmployee, onDeleteEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'ALL' || emp.department_id === deptFilter || emp.job_title.includes(deptFilter);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Employee Directory</h1>
          <p className="text-xs text-slate-500">Manage workforce contracts, basic salaries, & KRA statutory IDs</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => alert("CSV Employee Bulk Template exported successfully!")}
            className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => setIsDeptModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Building className="w-4 h-4" />
            <span>Add Department</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by employee name, code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="dept_eng">Engineering</option>
            <option value="dept_hr">Human Resources</option>
            <option value="dept_fin">Finance & Ops</option>
          </select>
        </div>

      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Basic Salary</th>
                <th className="py-3.5 px-4">KRA Tax PIN</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-xs">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {emp.first_name} {emp.last_name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {emp.employee_code} • {emp.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Job Title & Department */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">{emp.job_title}</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{emp.department_name || 'Engineering'}</span>
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    KES {emp.basic_salary.toLocaleString('en-KE')}
                  </td>

                  {/* KRA PIN */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>{emp.kra_pin || 'A019827364Z'}</span>
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-4">
                    <span className="text-slate-600 dark:text-slate-400">{emp.payment_method}</span>
                    <span className="block text-[10px] text-slate-400">{emp.bank_name || 'KCB Bank'}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      emp.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : emp.status === 'Terminated'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEditEmployee(emp)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-600 hover:text-teal-500 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 transition-all"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${emp.first_name} ${emp.last_name}? This action cannot be undone.`)) {
                            onDeleteEmployee(emp.id);
                          }
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddDepartmentModal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
        onAddDepartment={(name) => {
          // Additional logic to save department if needed
          setIsDeptModalOpen(false);
        }} 
      />
    </div>
  );
};

