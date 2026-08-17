from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_email: str
    user_name: str
    role: str
    organization_id: str
    organization_name: str

# Employee Schemas
class EmployeeCreate(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    job_title: str
    hire_date: str
    basic_salary: float
    pay_frequency: Optional[str] = "Monthly"
    payment_method: Optional[str] = "Bank Transfer"
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    kra_pin: Optional[str] = None
    nssf_number: Optional[str] = None
    shif_number: Optional[str] = None
    housing_allowance: Optional[float] = 0.0
    transport_allowance: Optional[float] = 0.0
    other_allowances: Optional[float] = 0.0
    custom_deductions: Optional[float] = 0.0

class EmployeeResponse(EmployeeCreate):
    id: str
    organization_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Department Schema
class DepartmentCreate(BaseModel):
    name: str
    code: Optional[str] = None

class DepartmentResponse(DepartmentCreate):
    id: str
    organization_id: str

    class Config:
        from_attributes = True

# Payroll Run Schemas
class PayrollRunCreate(BaseModel):
    period_name: str # e.g. "July 2026"
    country: Optional[str] = "Kenya"
    currency: Optional[str] = "KES"

class PayrollItemResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    employee_code: str
    job_title: str
    basic_salary: float
    allowances: float
    overtime_pay: float
    bonuses: float
    gross_pay: float
    nssf_employee: float
    nssf_employer: float
    shif_employee: float
    housing_levy_employee: float
    housing_levy_employer: float
    taxable_pay: float
    paye_tax_before_relief: float
    personal_relief: float
    paye_tax: float
    other_deductions: float
    total_deductions: float
    net_pay: float
    employer_cost: float

class PayrollRunResponse(BaseModel):
    id: str
    organization_id: str
    period_name: str
    country: str
    currency: str
    total_employees: int
    total_gross_pay: float
    total_paye_tax: float
    total_nssf: float
    total_shif: float
    total_housing_levy: float
    total_other_deductions: float
    total_net_pay: float
    total_employer_cost: float
    status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    locked_at: Optional[datetime] = None
    created_at: datetime
    items: List[PayrollItemResponse] = []

    class Config:
        from_attributes = True
