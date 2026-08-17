from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.schema import Employee, Department, User
from app.schemas.models import EmployeeCreate, EmployeeResponse, DepartmentCreate, DepartmentResponse
from app.core.security import get_password_hash

router = APIRouter(prefix="/employees", tags=["Employees"])

def get_tenant_org_id(x_org_id: str = Header(default="default_org_id")):
    return x_org_id

@router.get("", response_model=List[EmployeeResponse])
def get_employees(org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    employees = db.query(Employee).filter(Employee.organization_id == org_id).all()
    result = []
    for emp in employees:
        dept_name = emp.department.name if emp.department else None
        emp_res = EmployeeResponse(
            id=emp.id,
            organization_id=emp.organization_id,
            employee_code=emp.employee_code,
            first_name=emp.first_name,
            last_name=emp.last_name,
            email=emp.email,
            phone=emp.phone,
            department_id=emp.department_id,
            department_name=dept_name,
            job_title=emp.job_title,
            hire_date=emp.hire_date,
            basic_salary=emp.basic_salary,
            pay_frequency=emp.pay_frequency,
            payment_method=emp.payment_method,
            bank_name=emp.bank_name,
            bank_account_number=emp.bank_account_number,
            kra_pin=emp.kra_pin,
            nssf_number=emp.nssf_number,
            shif_number=emp.shif_number,
            housing_allowance=emp.housing_allowance,
            transport_allowance=emp.transport_allowance,
            other_allowances=emp.other_allowances,
            custom_deductions=emp.custom_deductions,
            status=emp.status,
            created_at=emp.created_at
        )
        result.append(emp_res)
    return result

@router.post("", response_model=dict)
def create_employee(payload: EmployeeCreate, org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    data = payload.model_dump()
    dept_name = data.pop("department_name", None)

    # Auto-generate employee password
    temp_password = f"{payload.first_name.lower()}2026!"

    # If department_name is passed, find or create the Department record
    if dept_name and not data.get("department_id"):
        dept = db.query(Department).filter(
            Department.organization_id == org_id,
            Department.name == dept_name
        ).first()
        if not dept:
            dept = Department(organization_id=org_id, name=dept_name)
            db.add(dept)
            db.commit()
            db.refresh(dept)
        data["department_id"] = dept.id

    emp = Employee(
        organization_id=org_id,
        plain_password=temp_password,
        **data
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)

    # Auto-create a User login account for this employee with plain_password
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if not existing_user:
        user = User(
            email=payload.email,
            hashed_password=get_password_hash(temp_password),
            plain_password=temp_password,
            full_name=f"{payload.first_name} {payload.last_name}",
            role="Employee",
            organization_id=org_id
        )
        db.add(user)
        db.commit()

    return {
        "employee": {
            "id": emp.id,
            "organization_id": emp.organization_id,
            "employee_code": emp.employee_code,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "job_title": emp.job_title,
            "department_id": emp.department_id,
            "department_name": dept_name,
            "basic_salary": emp.basic_salary,
            "status": emp.status,
            "kra_pin": emp.kra_pin,
            "hire_date": emp.hire_date
        },
        "login_credentials": {
            "email": payload.email,
            "temporary_password": temp_password,
            "role": "Employee"
        }
    }

@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    depts = db.query(Department).filter(Department.organization_id == org_id).all()
    return depts

@router.post("/departments", response_model=DepartmentResponse)
def create_department(payload: DepartmentCreate, org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    dept = Department(organization_id=org_id, name=payload.name, code=payload.code)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: str, payload: EmployeeCreate, org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id, Employee.organization_id == org_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = payload.model_dump()
    dept_name = update_data.pop("department_name", None)

    if dept_name and not update_data.get("department_id"):
        dept = db.query(Department).filter(
            Department.organization_id == org_id,
            Department.name == dept_name
        ).first()
        if not dept:
            dept = Department(organization_id=org_id, name=dept_name)
            db.add(dept)
            db.commit()
            db.refresh(dept)
        update_data["department_id"] = dept.id

    for key, value in update_data.items():
        setattr(emp, key, value)
        
    db.commit()
    db.refresh(emp)
    
    # Update corresponding user full_name and email if they changed
    user = db.query(User).filter(User.email == emp.email).first()
    if user:
        user.full_name = f"{payload.first_name} {payload.last_name}"
        user.email = payload.email
        db.commit()
        
    return EmployeeResponse(
        id=emp.id,
        organization_id=emp.organization_id,
        employee_code=emp.employee_code,
        first_name=emp.first_name,
        last_name=emp.last_name,
        email=emp.email,
        phone=emp.phone,
        department_id=emp.department_id,
        department_name=dept_name or (emp.department.name if emp.department else None),
        job_title=emp.job_title,
        hire_date=emp.hire_date,
        basic_salary=emp.basic_salary,
        pay_frequency=emp.pay_frequency,
        payment_method=emp.payment_method,
        bank_name=emp.bank_name,
        bank_account_number=emp.bank_account_number,
        kra_pin=emp.kra_pin,
        nssf_number=emp.nssf_number,
        shif_number=emp.shif_number,
        housing_allowance=emp.housing_allowance,
        transport_allowance=emp.transport_allowance,
        other_allowances=emp.other_allowances,
        custom_deductions=emp.custom_deductions,
        status=emp.status,
        created_at=emp.created_at
    )

@router.delete("/{employee_id}", response_model=dict)
def delete_employee(employee_id: str, org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id, Employee.organization_id == org_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    email_to_delete = emp.email
    db.delete(emp)
    db.commit()
    
    # Optionally remove user access
    user = db.query(User).filter(User.email == email_to_delete).first()
    if user:
        db.delete(user)
        db.commit()
        
    return {"message": "Employee deleted successfully"}

