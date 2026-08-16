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
    return employees

@router.post("", response_model=dict)
def create_employee(payload: EmployeeCreate, org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    emp = Employee(
        organization_id=org_id,
        **payload.model_dump()
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)

    # Auto-create a User login account for this employee
    temp_password = f"{payload.first_name.lower()}2026!"
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if not existing_user:
        user = User(
            email=payload.email,
            hashed_password=get_password_hash(temp_password),
            full_name=f"{payload.first_name} {payload.last_name}",
            role="Employee",
            organization_id=org_id
        )
        db.add(user)
        db.commit()

    return {
        "employee": {
            "id": emp.id,
            "employee_code": emp.employee_code,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "job_title": emp.job_title,
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

