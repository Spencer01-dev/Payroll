from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.schema import Employee, PayrollRun, PayrollItem, AuditLog, Payslip
from app.schemas.models import PayrollRunCreate, PayrollRunResponse, PayrollItemResponse
from app.services.payroll.kenya import KenyaPayrollEngine

router = APIRouter(prefix="/payroll", tags=["Payroll"])

def get_tenant_org_id(x_org_id: str = Header(default="default_org_id")):
    return x_org_id

@router.get("/runs", response_model=List[PayrollRunResponse])
def list_payroll_runs(org_id: str = Depends(get_tenant_org_id), db: Session = Depends(get_db)):
    runs = db.query(PayrollRun).filter(PayrollRun.organization_id == org_id).all()
    
    # Format items to include employee code and full name
    result = []
    for r in runs:
        items_formatted = []
        for item in r.items:
            emp = db.query(Employee).filter(Employee.id == item.employee_id).first()
            emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown Employee"
            emp_code = emp.employee_code if emp else "N/A"
            emp_title = emp.job_title if emp else "Staff"

            items_formatted.append(PayrollItemResponse(
                id=item.id,
                employee_id=item.employee_id,
                employee_name=emp_name,
                employee_code=emp_code,
                job_title=emp_title,
                basic_salary=item.basic_salary,
                allowances=item.allowances,
                overtime_pay=item.overtime_pay,
                bonuses=item.bonuses,
                gross_pay=item.gross_pay,
                nssf_employee=item.nssf_employee,
                nssf_employer=item.nssf_employer,
                shif_employee=item.shif_employee,
                housing_levy_employee=item.housing_levy_employee,
                housing_levy_employer=item.housing_levy_employer,
                taxable_pay=item.taxable_pay,
                paye_tax_before_relief=item.paye_tax_before_relief,
                personal_relief=item.personal_relief,
                paye_tax=item.paye_tax,
                other_deductions=item.other_deductions,
                total_deductions=item.total_deductions,
                net_pay=item.net_pay,
                employer_cost=item.employer_cost
            ))
        
        run_res = PayrollRunResponse(
            id=r.id,
            organization_id=r.organization_id,
            period_name=r.period_name,
            country=r.country,
            currency=r.currency,
            total_employees=r.total_employees,
            total_gross_pay=r.total_gross_pay,
            total_paye_tax=r.total_paye_tax,
            total_nssf=r.total_nssf,
            total_shif=r.total_shif,
            total_housing_levy=r.total_housing_levy,
            total_other_deductions=r.total_other_deductions,
            total_net_pay=r.total_net_pay,
            total_employer_cost=r.total_employer_cost,
            status=r.status,
            approved_by=r.approved_by,
            approved_at=r.approved_at,
            locked_at=r.locked_at,
            created_at=r.created_at,
            items=items_formatted
        )
        result.append(run_res)

    return result

@router.post("/runs", response_model=PayrollRunResponse)
def create_and_calculate_payroll_run(
    payload: PayrollRunCreate,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db)
):
    employees = db.query(Employee).filter(
        Employee.organization_id == org_id,
        Employee.status == "Active"
    ).all()

    if not employees:
        raise HTTPException(status_code=400, detail="No active employees found for this organization.")

    payroll_run = PayrollRun(
        organization_id=org_id,
        period_name=payload.period_name,
        country=payload.country or "Kenya",
        currency=payload.currency or "KES",
        status="CALCULATED"
    )
    db.add(payroll_run)
    db.commit()
    db.refresh(payroll_run)

    tot_gross = 0.0
    tot_paye = 0.0
    tot_nssf = 0.0
    tot_shif = 0.0
    tot_housing = 0.0
    tot_other = 0.0
    tot_net = 0.0
    tot_cost = 0.0

    items_res = []

    for emp in employees:
        calc = KenyaPayrollEngine.process_payroll_item(
            basic_salary=emp.basic_salary,
            housing_allowance=emp.housing_allowance or 0.0,
            transport_allowance=emp.transport_allowance or 0.0,
            other_allowances=emp.other_allowances or 0.0,
            custom_deductions=emp.custom_deductions or 0.0
        )

        item = PayrollItem(
            payroll_run_id=payroll_run.id,
            employee_id=emp.id,
            basic_salary=calc["basic_salary"],
            allowances=calc["allowances"],
            overtime_pay=calc["overtime_pay"],
            bonuses=calc["bonuses"],
            gross_pay=calc["gross_pay"],
            nssf_employee=calc["nssf_employee"],
            nssf_employer=calc["nssf_employer"],
            shif_employee=calc["shif_employee"],
            housing_levy_employee=calc["housing_levy_employee"],
            housing_levy_employer=calc["housing_levy_employer"],
            taxable_pay=calc["taxable_pay"],
            paye_tax_before_relief=calc["paye_tax_before_relief"],
            personal_relief=calc["personal_relief"],
            paye_tax=calc["paye_tax"],
            other_deductions=calc["other_deductions"],
            total_deductions=calc["total_deductions"],
            net_pay=calc["net_pay"],
            employer_cost=calc["employer_cost"]
        )
        db.add(item)

        tot_gross += calc["gross_pay"]
        tot_paye += calc["paye_tax"]
        tot_nssf += calc["nssf_employee"]
        tot_shif += calc["shif_employee"]
        tot_housing += calc["housing_levy_employee"]
        tot_other += calc["other_deductions"]
        tot_net += calc["net_pay"]
        tot_cost += calc["employer_cost"]

        items_res.append(PayrollItemResponse(
            id=item.id,
            employee_id=emp.id,
            employee_name=f"{emp.first_name} {emp.last_name}",
            employee_code=emp.employee_code,
            job_title=emp.job_title,
            **calc
        ))

    payroll_run.total_employees = len(employees)
    payroll_run.total_gross_pay = round(tot_gross, 2)
    payroll_run.total_paye_tax = round(tot_paye, 2)
    payroll_run.total_nssf = round(tot_nssf, 2)
    payroll_run.total_shif = round(tot_shif, 2)
    payroll_run.total_housing_levy = round(tot_housing, 2)
    payroll_run.total_other_deductions = round(tot_other, 2)
    payroll_run.total_net_pay = round(tot_net, 2)
    payroll_run.total_employer_cost = round(tot_cost, 2)

    # Audit log
    audit = AuditLog(
        organization_id=org_id,
        user_email="admin@smartpay.io",
        action="PAYROLL_CALCULATED",
        resource=f"PayrollRun:{payroll_run.id}",
        details=f"Calculated payroll for {len(employees)} employees in period {payload.period_name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(payroll_run)

    return PayrollRunResponse(
        id=payroll_run.id,
        organization_id=payroll_run.organization_id,
        period_name=payroll_run.period_name,
        country=payroll_run.country,
        currency=payroll_run.currency,
        total_employees=payroll_run.total_employees,
        total_gross_pay=payroll_run.total_gross_pay,
        total_paye_tax=payroll_run.total_paye_tax,
        total_nssf=payroll_run.total_nssf,
        total_shif=payroll_run.total_shif,
        total_housing_levy=payroll_run.total_housing_levy,
        total_other_deductions=payroll_run.total_other_deductions,
        total_net_pay=payroll_run.total_net_pay,
        total_employer_cost=payroll_run.total_employer_cost,
        status=payroll_run.status,
        created_at=payroll_run.created_at,
        items=items_res
    )

@router.post("/runs/{run_id}/approve")
def approve_payroll_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(PayrollRun).filter(PayrollRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Payroll run not found.")

    run.status = "APPROVED"
    run.approved_by = "Finance Manager"
    run.approved_at = datetime.utcnow()
    db.commit()
    return {"status": "APPROVED", "message": f"Payroll run {run_id} approved successfully."}

@router.post("/runs/{run_id}/lock")
def lock_payroll_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(PayrollRun).filter(PayrollRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Payroll run not found.")

    run.status = "LOCKED"
    run.locked_at = datetime.utcnow()

    # Generate Payslip records
    for item in run.items:
        emp = db.query(Employee).filter(Employee.id == item.employee_id).first()
        payslip_data = {
            "employee_id": item.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Staff",
            "employee_code": emp.employee_code if emp else "N/A",
            "job_title": emp.job_title if emp else "Staff",
            "kra_pin": emp.kra_pin if emp else "N/A",
            "nssf_number": emp.nssf_number if emp else "N/A",
            "shif_number": emp.shif_number if emp else "N/A",
            "bank_name": emp.bank_name if emp else "N/A",
            "bank_account_number": emp.bank_account_number if emp else "N/A",
            "period_name": run.period_name,
            "basic_salary": item.basic_salary,
            "allowances": item.allowances,
            "gross_pay": item.gross_pay,
            "paye_tax": item.paye_tax,
            "nssf_employee": item.nssf_employee,
            "shif_employee": item.shif_employee,
            "housing_levy_employee": item.housing_levy_employee,
            "other_deductions": item.other_deductions,
            "total_deductions": item.total_deductions,
            "net_pay": item.net_pay
        }
        payslip = Payslip(
            payroll_run_id=run.id,
            employee_id=item.employee_id,
            period_name=run.period_name,
            issue_date=datetime.utcnow().strftime("%Y-%m-%d"),
            data_json=payslip_data
        )
        db.add(payslip)

    db.commit()
    return {"status": "LOCKED", "message": f"Payroll run {run_id} locked and payslips finalized."}
