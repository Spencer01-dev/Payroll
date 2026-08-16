-- ==============================================================================
-- SmartPay Global - Production Supabase PostgreSQL Schema
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizations Table (Multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Kenya',
    currency VARCHAR(10) DEFAULT 'KES',
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Company Owner', -- 'Company Owner', 'HR Administrator', 'Payroll Administrator', 'Employee'
    is_active BOOLEAN DEFAULT TRUE,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_departments_org ON departments(organization_id);

-- 4. Employees Table (Workforce & Kenya Statutory Registry)
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
    job_title VARCHAR(150) NOT NULL,
    hire_date VARCHAR(50) NOT NULL,
    
    -- Financial Details
    basic_salary DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    pay_frequency VARCHAR(50) DEFAULT 'Monthly', -- 'Monthly', 'Weekly', 'Biweekly'
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer', -- 'Bank Transfer', 'M-Pesa', 'Cash'
    bank_name VARCHAR(150),
    bank_account_number VARCHAR(100),
    kra_pin VARCHAR(50),      -- KRA PIN (e.g. A019827364Z)
    nssf_number VARCHAR(50),  -- NSSF Member ID
    shif_number VARCHAR(50),  -- SHIF ID (Replacing NHIF)
    
    -- Allowances & Deductions
    housing_allowance DOUBLE PRECISION DEFAULT 0.0,
    transport_allowance DOUBLE PRECISION DEFAULT 0.0,
    other_allowances DOUBLE PRECISION DEFAULT 0.0,
    custom_deductions DOUBLE PRECISION DEFAULT 0.0,
    
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'On Leave', 'Terminated'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(organization_id, employee_code);

-- 5. Payroll Periods Table
CREATE TABLE IF NOT EXISTS payroll_periods (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "August 2026"
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50) NOT NULL,
    pay_date VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) DEFAULT 'Monthly'
);

-- 6. Payroll Runs Table (Execution, Totals & Lifecycle)
CREATE TABLE IF NOT EXISTS payroll_runs (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Kenya',
    currency VARCHAR(10) DEFAULT 'KES',
    
    -- Totals
    total_employees INTEGER DEFAULT 0,
    total_gross_pay DOUBLE PRECISION DEFAULT 0.0,
    total_paye_tax DOUBLE PRECISION DEFAULT 0.0,
    total_nssf DOUBLE PRECISION DEFAULT 0.0,
    total_shif DOUBLE PRECISION DEFAULT 0.0,
    total_housing_levy DOUBLE PRECISION DEFAULT 0.0,
    total_other_deductions DOUBLE PRECISION DEFAULT 0.0,
    total_net_pay DOUBLE PRECISION DEFAULT 0.0,
    total_employer_cost DOUBLE PRECISION DEFAULT 0.0,
    
    -- Status Lifecycle: DRAFT -> CALCULATED -> APPROVED -> LOCKED -> PROCESSED
    status VARCHAR(50) DEFAULT 'DRAFT',
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON payroll_runs(organization_id);

-- 7. Payroll Items Table (Itemized Employee Gross-to-Net Breakdown)
CREATE TABLE IF NOT EXISTS payroll_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    payroll_run_id VARCHAR(64) NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    basic_salary DOUBLE PRECISION DEFAULT 0.0,
    allowances DOUBLE PRECISION DEFAULT 0.0,
    overtime_pay DOUBLE PRECISION DEFAULT 0.0,
    bonuses DOUBLE PRECISION DEFAULT 0.0,
    gross_pay DOUBLE PRECISION DEFAULT 0.0,
    
    -- Kenya Statutory Breakdown (2026 Rules)
    nssf_employee DOUBLE PRECISION DEFAULT 0.0,
    nssf_employer DOUBLE PRECISION DEFAULT 0.0,
    shif_employee DOUBLE PRECISION DEFAULT 0.0,        -- 2.75%
    housing_levy_employee DOUBLE PRECISION DEFAULT 0.0, -- 1.5%
    housing_levy_employer DOUBLE PRECISION DEFAULT 0.0, -- 1.5%
    
    taxable_pay DOUBLE PRECISION DEFAULT 0.0,
    paye_tax_before_relief DOUBLE PRECISION DEFAULT 0.0,
    personal_relief DOUBLE PRECISION DEFAULT 2400.0,   -- KES 2,400 Monthly Relief
    paye_tax DOUBLE PRECISION DEFAULT 0.0,              -- Net PAYE after personal relief
    
    other_deductions DOUBLE PRECISION DEFAULT 0.0,
    total_deductions DOUBLE PRECISION DEFAULT 0.0,
    net_pay DOUBLE PRECISION DEFAULT 0.0,
    employer_cost DOUBLE PRECISION DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_emp ON payroll_items(employee_id);

-- 8. Payslips Table (Locked Historic Records)
CREATE TABLE IF NOT EXISTS payslips (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    payroll_run_id VARCHAR(64) NOT NULL,
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    period_name VARCHAR(100) NOT NULL,
    issue_date VARCHAR(50) NOT NULL,
    data_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Audit Logs Table (Security & Compliance Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);

-- 10. Country Statutory Rules Table
CREATE TABLE IF NOT EXISTS country_rules (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    country_code VARCHAR(10) DEFAULT 'KE',
    country_name VARCHAR(100) DEFAULT 'Kenya',
    rule_key VARCHAR(100) NOT NULL,
    rules_json JSONB NOT NULL,
    effective_from VARCHAR(50) NOT NULL,
    effective_to VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1
);
