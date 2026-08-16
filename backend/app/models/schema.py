import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean, Text, Integer, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    registration_number = Column(String, nullable=True)
    country = Column(String, default="Kenya")
    currency = Column(String, default="KES")
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    departments = relationship("Department", back_populates="organization")
    employees = relationship("Employee", back_populates="organization")
    payroll_runs = relationship("PayrollRun", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="Company Owner") # Company Owner, HR Administrator, Payroll Administrator, Employee
    is_active = Column(Boolean, default=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")


class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)

    organization = relationship("Organization", back_populates="departments")
    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    employee_code = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    job_title = Column(String, nullable=False)
    hire_date = Column(String, nullable=False)
    
    # Financial details
    basic_salary = Column(Float, nullable=False, default=0.0)
    pay_frequency = Column(String, default="Monthly") # Monthly, Weekly, Biweekly
    payment_method = Column(String, default="Bank Transfer") # Bank Transfer, M-Pesa, Cash
    bank_name = Column(String, nullable=True)
    bank_account_number = Column(String, nullable=True)
    kra_pin = Column(String, nullable=True) # Kenya KRA Tax PIN
    nssf_number = Column(String, nullable=True)
    shif_number = Column(String, nullable=True)

    # Recurring allowances & deductions
    housing_allowance = Column(Float, default=0.0)
    transport_allowance = Column(Float, default=0.0)
    other_allowances = Column(Float, default=0.0)
    custom_deductions = Column(Float, default=0.0)

    status = Column(String, default="Active") # Active, On Leave, Terminated
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    payroll_items = relationship("PayrollItem", back_populates="employee")
    payslips = relationship("Payslip", back_populates="employee")


class PayrollPeriod(Base):
    __tablename__ = "payroll_periods"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, nullable=False)
    name = Column(String, nullable=False) # e.g., "July 2026"
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    pay_date = Column(String, nullable=False)
    frequency = Column(String, default="Monthly")


class PayrollRun(Base):
    __tablename__ = "payroll_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    period_name = Column(String, nullable=False)
    country = Column(String, default="Kenya")
    currency = Column(String, default="KES")
    
    # Totals
    total_employees = Column(Integer, default=0)
    total_gross_pay = Column(Float, default=0.0)
    total_paye_tax = Column(Float, default=0.0)
    total_nssf = Column(Float, default=0.0)
    total_shif = Column(Float, default=0.0)
    total_housing_levy = Column(Float, default=0.0)
    total_other_deductions = Column(Float, default=0.0)
    total_net_pay = Column(Float, default=0.0)
    total_employer_cost = Column(Float, default=0.0)

    # Lifecycle Status: DRAFT -> CALCULATED -> APPROVED -> LOCKED -> PROCESSED
    status = Column(String, default="DRAFT")
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    locked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="payroll_runs")
    items = relationship("PayrollItem", back_populates="payroll_run", cascade="all, delete-orphan")


class PayrollItem(Base):
    __tablename__ = "payroll_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    payroll_run_id = Column(String, ForeignKey("payroll_runs.id"), nullable=False)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)

    basic_salary = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    overtime_pay = Column(Float, default=0.0)
    bonuses = Column(Float, default=0.0)
    gross_pay = Column(Float, default=0.0)

    # Kenya Statutory Breakdown
    nssf_employee = Column(Float, default=0.0)
    nssf_employer = Column(Float, default=0.0)
    shif_employee = Column(Float, default=0.0) # 2.75%
    housing_levy_employee = Column(Float, default=0.0) # 1.5%
    housing_levy_employer = Column(Float, default=0.0) # 1.5%
    
    taxable_pay = Column(Float, default=0.0)
    paye_tax_before_relief = Column(Float, default=0.0)
    personal_relief = Column(Float, default=0.0)
    paye_tax = Column(Float, default=0.0) # Final PAYE tax after relief

    other_deductions = Column(Float, default=0.0)
    total_deductions = Column(Float, default=0.0)
    net_pay = Column(Float, default=0.0)
    employer_cost = Column(Float, default=0.0)

    payroll_run = relationship("PayrollRun", back_populates="items")
    employee = relationship("Employee", back_populates="payroll_items")


class Payslip(Base):
    __tablename__ = "payslips"

    id = Column(String, primary_key=True, default=generate_uuid)
    payroll_run_id = Column(String, nullable=False)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    period_name = Column(String, nullable=False)
    issue_date = Column(String, nullable=False)
    data_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="payslips")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="audit_logs")


class CountryRule(Base):
    __tablename__ = "country_rules"

    id = Column(String, primary_key=True, default=generate_uuid)
    country_code = Column(String, nullable=False, default="KE")
    country_name = Column(String, nullable=False, default="Kenya")
    rule_key = Column(String, nullable=False) # PAYE_BANDS, NSSF_LIMITS, SHIF_RATE, HOUSING_LEVY_RATE
    rules_json = Column(JSON, nullable=False)
    effective_from = Column(String, nullable=False)
    effective_to = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
