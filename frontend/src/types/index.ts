export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  department_name?: string;
  job_title: string;
  hire_date: string;
  basic_salary: number;
  pay_frequency: 'Monthly' | 'Weekly' | 'Biweekly';
  payment_method: 'Bank Transfer' | 'M-Pesa' | 'Cash';
  bank_name?: string;
  bank_account_number?: string;
  kra_pin?: string;
  nssf_number?: string;
  shif_number?: string;
  housing_allowance?: number;
  transport_allowance?: number;
  other_allowances?: number;
  custom_deductions?: number;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface PayrollItem {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  job_title: string;
  basic_salary: number;
  allowances: number;
  overtime_pay: number;
  bonuses: number;
  gross_pay: number;
  nssf_employee: number;
  nssf_employer: number;
  shif_employee: number;
  housing_levy_employee: number;
  housing_levy_employer: number;
  taxable_pay: number;
  paye_tax_before_relief: number;
  personal_relief: number;
  paye_tax: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  employer_cost: number;
}

export interface PayrollRun {
  id: string;
  organization_id: string;
  period_name: string;
  country: string;
  currency: string;
  total_employees: number;
  total_gross_pay: number;
  total_paye_tax: number;
  total_nssf: number;
  total_shif: number;
  total_housing_levy: number;
  total_other_deductions: number;
  total_net_pay: number;
  total_employer_cost: number;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'LOCKED' | 'PROCESSED';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  items: PayrollItem[];
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  resource: string;
  details?: string;
  timestamp: string;
}

export interface StatutoryRuleSet {
  country_name: string;
  currency: string;
  paye_personal_relief: number;
  nssf_tier1_limit: number;
  nssf_tier2_limit: number;
  shif_rate: number;
  housing_levy_rate: number;
}
