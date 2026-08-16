from typing import List
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.schema import Employee, PayrollRun, AuditLog

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

def get_tenant_org_id(x_org_id: str = Header(default="default_org_id")):
    return x_org_id

@router.get("/summary")
def get_dashboard_summary(org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    active_employees = db.query(Employee).filter(
        Employee.organization_id == org_id,
        Employee.status == "Active"
    ).count()

    payroll_runs = db.query(PayrollRun).filter(PayrollRun.organization_id == org_id).all()
    
    total_payroll_cost = sum(r.total_employer_cost for r in payroll_runs)
    latest_run = payroll_runs[-1] if payroll_runs else None

    return {
        "active_employees": active_employees,
        "total_payroll_runs": len(payroll_runs),
        "total_payroll_cost_ytd": round(total_payroll_cost, 2),
        "latest_run": {
            "id": latest_run.id if latest_run else None,
            "period_name": latest_run.period_name if latest_run else "N/A",
            "total_gross": latest_run.total_gross_pay if latest_run else 0.0,
            "total_net": latest_run.total_net_pay if latest_run else 0.0,
            "total_paye": latest_run.total_paye_tax if latest_run else 0.0,
            "total_nssf": latest_run.total_nssf if latest_run else 0.0,
            "total_shif": latest_run.total_shif if latest_run else 0.0,
            "total_housing": latest_run.total_housing_levy if latest_run else 0.0,
            "status": latest_run.status if latest_run else "N/A"
        }
    }

@router.get("/audit-logs")
def get_audit_logs(org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.organization_id == org_id).order_by(AuditLog.timestamp.desc()).all()
    return logs
