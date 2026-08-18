"""
Employee Portal API – comprehensive endpoints for the employee self-service
portal and Admin/HR approval workflows.
"""
import uuid
from datetime import datetime, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel

from app.db.base import get_db
from app.models.schema import (
    Employee, User, PayrollRun, PayrollItem, Payslip,
    LeaveRequest, AttendanceRecord, LoanRequest,
    HRTicket, EmployeeDocument, Notification
)

router = APIRouter(prefix="/portal", tags=["Employee Portal"])


# ─── Dependency helpers ───────────────────────────────────────────────
def get_tenant_org_id(x_org_id: str = Header(default="default_org_id")):
    return x_org_id


def _get_employee_by_email(db: Session, email: str, org_id: str) -> Optional[Employee]:
    if not email:
        return None
    clean_email = email.strip()
    if clean_email.lower() in ["", "undefined", "null"]:
        return None

    # First attempt: match email (case-insensitive) and organization_id
    emp = db.query(Employee).filter(
        func.lower(Employee.email) == func.lower(clean_email),
        Employee.organization_id == org_id
    ).first()

    # Second attempt: fallback by email (case-insensitive)
    if not emp:
        emp = db.query(Employee).filter(
            func.lower(Employee.email) == func.lower(clean_email)
        ).first()

    return emp


# ─── Pydantic schemas (portal-specific) ──────────────────────────────

class LeaveCreate(BaseModel):
    leave_type: str
    start_date: str
    end_date: str
    days: int
    reason: Optional[str] = None

class LeaveActionPayload(BaseModel):
    approved_by: str

class AttendanceClockPayload(BaseModel):
    employee_email: str
    action: str  # "clock_in" or "clock_out"

class LoanCreate(BaseModel):
    request_type: Optional[str] = "Salary Advance"
    amount: float
    monthly_deduction: float
    reason: Optional[str] = None

class LoanActionPayload(BaseModel):
    approved_by: str

class TicketCreate(BaseModel):
    category: str
    subject: str
    message: str
    priority: Optional[str] = "Medium"

class TicketRespondPayload(BaseModel):
    response: str
    responded_by: str

class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class MarkReadPayload(BaseModel):
    notification_ids: Optional[List[str]] = None  # None = mark all read


# ─── Utility: create a notification ──────────────────────────────────
def _notify(db: Session, org_id: str, email: str, title: str, message: str, ntype: str = "info"):
    n = Notification(
        organization_id=org_id,
        user_email=email,
        title=title,
        message=message,
        notification_type=ntype,
    )
    db.add(n)
    db.commit()


# ======================================================================
#  1.  DASHBOARD SUMMARY
# ======================================================================
@router.get("/dashboard-summary")
def get_dashboard_summary(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee record not found for this email")

    # Leave balance (simple: 21 annual days - used)
    used_annual = db.query(func.coalesce(func.sum(LeaveRequest.days), 0)).filter(
        LeaveRequest.employee_id == emp.id,
        LeaveRequest.leave_type == "Annual Leave",
        LeaveRequest.status == "Approved",
    ).scalar()

    # Today's attendance
    today_str = date.today().isoformat()
    today_att = db.query(AttendanceRecord).filter(
        AttendanceRecord.employee_id == emp.id,
        AttendanceRecord.date == today_str,
    ).first()

    # Pending requests count
    pending_leaves = db.query(func.count(LeaveRequest.id)).filter(
        LeaveRequest.employee_id == emp.id, LeaveRequest.status == "Pending"
    ).scalar()
    pending_loans = db.query(func.count(LoanRequest.id)).filter(
        LoanRequest.employee_id == emp.id, LoanRequest.status == "Pending"
    ).scalar()
    pending_tickets = db.query(func.count(HRTicket.id)).filter(
        HRTicket.employee_id == emp.id, HRTicket.status.in_(["Open", "In Progress"])
    ).scalar()

    # Unread notifications
    unread = db.query(func.count(Notification.id)).filter(
        Notification.user_email == employee_email,
        Notification.organization_id == org_id,
        Notification.is_read == False,
    ).scalar()

    # YTD earnings from payslips
    payslip_items = (
        db.query(PayrollItem)
        .join(PayrollRun, PayrollItem.payroll_run_id == PayrollRun.id)
        .filter(
            PayrollItem.employee_id == emp.id,
            PayrollRun.organization_id == org_id,
        )
        .all()
    )
    ytd_gross = sum(i.gross_pay for i in payslip_items)
    ytd_net = sum(i.net_pay for i in payslip_items)
    ytd_tax = sum(i.paye_tax for i in payslip_items)
    latest_net = payslip_items[-1].net_pay if payslip_items else emp.basic_salary

    return {
        "employee_id": emp.id,
        "employee_name": f"{emp.first_name} {emp.last_name}",
        "employee_code": emp.employee_code,
        "job_title": emp.job_title,
        "department_id": emp.department_id,
        "basic_salary": emp.basic_salary,
        "latest_net_pay": latest_net,
        "ytd_gross": ytd_gross,
        "ytd_net": ytd_net,
        "ytd_tax": ytd_tax,
        "leave_balance": max(0, 21 - int(used_annual)),
        "attendance_today": {
            "clocked_in": today_att.clock_in if today_att else None,
            "clocked_out": today_att.clock_out if today_att else None,
            "status": today_att.status if today_att else "Not Clocked In",
        },
        "pending_requests": pending_leaves + pending_loans + pending_tickets,
        "unread_notifications": unread,
        "total_payslips": len(payslip_items),
    }


# ======================================================================
#  2.  LEAVE REQUESTS
# ======================================================================
@router.get("/leaves")
def get_leaves(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    leaves = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == emp.id, LeaveRequest.organization_id == org_id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    # Leave balance summary
    balances = {"Annual Leave": 21, "Sick Leave": 14, "Maternity Leave": 90, "Paternity Leave": 14, "Compassionate": 7}
    for lv in leaves:
        if lv.status == "Approved" and lv.leave_type in balances:
            balances[lv.leave_type] = max(0, balances[lv.leave_type] - lv.days)

    return {
        "balances": balances,
        "requests": [
            {
                "id": lv.id,
                "leave_type": lv.leave_type,
                "start_date": lv.start_date,
                "end_date": lv.end_date,
                "days": lv.days,
                "reason": lv.reason,
                "status": lv.status,
                "approved_by": lv.approved_by,
                "created_at": lv.created_at.isoformat() if lv.created_at else None,
            }
            for lv in leaves
        ],
    }


@router.post("/leaves")
def create_leave(
    payload: LeaveCreate,
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    leave = LeaveRequest(
        organization_id=org_id,
        employee_id=emp.id,
        employee_name=f"{emp.first_name} {emp.last_name}",
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        days=payload.days,
        reason=payload.reason,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)

    # Notify admin(s)
    admins = db.query(User).filter(
        User.organization_id == org_id,
        User.role.in_(["Company Owner", "HR Administrator"])
    ).all()
    for adm in admins:
        _notify(db, org_id, adm.email,
                "New Leave Request",
                f"{emp.first_name} {emp.last_name} requested {payload.days} days {payload.leave_type}.",
                "leave")

    return {"message": "Leave request submitted", "id": leave.id}


@router.put("/leaves/{leave_id}/approve")
def approve_leave(
    leave_id: str,
    payload: LeaveActionPayload,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id, LeaveRequest.organization_id == org_id
    ).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = "Approved"
    leave.approved_by = payload.approved_by
    leave.approved_at = datetime.utcnow()
    db.commit()

    # Notify employee
    emp = db.query(Employee).filter(Employee.id == leave.employee_id).first()
    if emp:
        _notify(db, org_id, emp.email,
                "Leave Approved ✅",
                f"Your {leave.leave_type} request ({leave.days} days) has been approved by {payload.approved_by}.",
                "leave")

    return {"message": "Leave approved", "id": leave_id}


@router.put("/leaves/{leave_id}/reject")
def reject_leave(
    leave_id: str,
    payload: LeaveActionPayload,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == leave_id, LeaveRequest.organization_id == org_id
    ).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = "Rejected"
    leave.approved_by = payload.approved_by
    leave.approved_at = datetime.utcnow()
    db.commit()

    emp = db.query(Employee).filter(Employee.id == leave.employee_id).first()
    if emp:
        _notify(db, org_id, emp.email,
                "Leave Rejected ❌",
                f"Your {leave.leave_type} request ({leave.days} days) was not approved.",
                "leave")

    return {"message": "Leave rejected", "id": leave_id}


# ======================================================================
#  3.  ATTENDANCE
# ======================================================================
@router.post("/attendance/clock")
def clock_in_out(
    payload: AttendanceClockPayload,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, payload.employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    today_str = date.today().isoformat()
    now_time = datetime.now().strftime("%H:%M:%S")

    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.employee_id == emp.id,
        AttendanceRecord.date == today_str,
    ).first()

    if payload.action == "clock_in":
        if existing and existing.clock_in:
            raise HTTPException(status_code=400, detail="Already clocked in today")
        if not existing:
            existing = AttendanceRecord(
                organization_id=org_id,
                employee_id=emp.id,
                employee_name=f"{emp.first_name} {emp.last_name}",
                date=today_str,
                clock_in=now_time,
                status="Present",
            )
            db.add(existing)
        else:
            existing.clock_in = now_time
            existing.status = "Present"
        db.commit()
        db.refresh(existing)
        return {"message": "Clocked in", "clock_in": now_time, "record_id": existing.id}

    elif payload.action == "clock_out":
        if not existing or not existing.clock_in:
            raise HTTPException(status_code=400, detail="Must clock in first")
        if existing.clock_out:
            raise HTTPException(status_code=400, detail="Already clocked out today")

        existing.clock_out = now_time
        # Calculate working hours
        fmt = "%H:%M:%S"
        ci = datetime.strptime(existing.clock_in, fmt)
        co = datetime.strptime(now_time, fmt)
        diff_h = (co - ci).seconds / 3600
        existing.working_hours = round(diff_h, 2)
        existing.overtime_hours = round(max(0, diff_h - 8), 2)
        db.commit()
        db.refresh(existing)
        return {
            "message": "Clocked out",
            "clock_out": now_time,
            "working_hours": existing.working_hours,
            "overtime_hours": existing.overtime_hours,
            "record_id": existing.id,
        }

    raise HTTPException(status_code=400, detail="action must be 'clock_in' or 'clock_out'")


@router.get("/attendance/history")
def get_attendance_history(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    records = (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.employee_id == emp.id, AttendanceRecord.organization_id == org_id)
        .order_by(AttendanceRecord.date.desc())
        .limit(60)
        .all()
    )
    return [
        {
            "id": r.id,
            "date": r.date,
            "clock_in": r.clock_in,
            "clock_out": r.clock_out,
            "working_hours": r.working_hours,
            "overtime_hours": r.overtime_hours,
            "status": r.status,
        }
        for r in records
    ]


# ======================================================================
#  4.  LOANS & SALARY ADVANCES
# ======================================================================
@router.get("/loans")
def get_loans(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    loans = (
        db.query(LoanRequest)
        .filter(LoanRequest.employee_id == emp.id, LoanRequest.organization_id == org_id)
        .order_by(LoanRequest.created_at.desc())
        .all()
    )
    return [
        {
            "id": ln.id,
            "request_type": ln.request_type,
            "amount": ln.amount,
            "monthly_deduction": ln.monthly_deduction,
            "amount_paid": ln.amount_paid,
            "remaining_balance": ln.remaining_balance,
            "reason": ln.reason,
            "status": ln.status,
            "approved_by": ln.approved_by,
            "created_at": ln.created_at.isoformat() if ln.created_at else None,
        }
        for ln in loans
    ]


@router.post("/loans")
def create_loan(
    payload: LoanCreate,
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    loan = LoanRequest(
        organization_id=org_id,
        employee_id=emp.id,
        employee_name=f"{emp.first_name} {emp.last_name}",
        request_type=payload.request_type,
        amount=payload.amount,
        monthly_deduction=payload.monthly_deduction,
        remaining_balance=payload.amount,
        reason=payload.reason,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    # Notify admins
    admins = db.query(User).filter(
        User.organization_id == org_id,
        User.role.in_(["Company Owner", "HR Administrator"])
    ).all()
    for adm in admins:
        _notify(db, org_id, adm.email,
                "New Loan/Advance Request",
                f"{emp.first_name} {emp.last_name} requested KES {payload.amount:,.0f} ({payload.request_type}).",
                "loan")

    return {"message": "Loan request submitted", "id": loan.id}


@router.put("/loans/{loan_id}/approve")
def approve_loan(
    loan_id: str,
    payload: LoanActionPayload,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    loan = db.query(LoanRequest).filter(
        LoanRequest.id == loan_id, LoanRequest.organization_id == org_id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")

    loan.status = "Approved"
    loan.approved_by = payload.approved_by
    loan.approved_at = datetime.utcnow()
    db.commit()

    emp = db.query(Employee).filter(Employee.id == loan.employee_id).first()
    if emp:
        _notify(db, org_id, emp.email,
                "Loan Approved ✅",
                f"Your {loan.request_type} of KES {loan.amount:,.0f} has been approved.",
                "loan")

    return {"message": "Loan approved", "id": loan_id}


@router.put("/loans/{loan_id}/reject")
def reject_loan(
    loan_id: str,
    payload: LoanActionPayload,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    loan = db.query(LoanRequest).filter(
        LoanRequest.id == loan_id, LoanRequest.organization_id == org_id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")

    loan.status = "Rejected"
    loan.approved_by = payload.approved_by
    loan.approved_at = datetime.utcnow()
    db.commit()

    emp = db.query(Employee).filter(Employee.id == loan.employee_id).first()
    if emp:
        _notify(db, org_id, emp.email,
                "Loan Rejected ❌",
                f"Your {loan.request_type} request of KES {loan.amount:,.0f} was not approved.",
                "loan")

    return {"message": "Loan rejected", "id": loan_id}


# ======================================================================
#  5.  HR HELPDESK TICKETS
# ======================================================================
@router.get("/tickets")
def get_tickets(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    tickets = (
        db.query(HRTicket)
        .filter(HRTicket.employee_id == emp.id, HRTicket.organization_id == org_id)
        .order_by(HRTicket.created_at.desc())
        .all()
    )
    return [
        {
            "id": t.id,
            "ticket_number": t.ticket_number,
            "category": t.category,
            "subject": t.subject,
            "message": t.message,
            "priority": t.priority,
            "status": t.status,
            "response": t.response,
            "responded_by": t.responded_by,
            "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tickets
    ]


@router.post("/tickets")
def create_ticket(
    payload: TicketCreate,
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Generate ticket number
    count = db.query(func.count(HRTicket.id)).filter(HRTicket.organization_id == org_id).scalar()
    ticket_number = f"HR-{1000 + count + 1}"

    ticket = HRTicket(
        ticket_number=ticket_number,
        organization_id=org_id,
        employee_id=emp.id,
        employee_name=f"{emp.first_name} {emp.last_name}",
        category=payload.category,
        subject=payload.subject,
        message=payload.message,
        priority=payload.priority,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Notify admins
    admins = db.query(User).filter(
        User.organization_id == org_id,
        User.role.in_(["Company Owner", "HR Administrator"])
    ).all()
    for adm in admins:
        _notify(db, org_id, adm.email,
                f"New HR Ticket: {ticket_number}",
                f"{emp.first_name} {emp.last_name} raised a {payload.priority} priority ticket: {payload.subject}",
                "info")

    return {"message": "Ticket created", "id": ticket.id, "ticket_number": ticket_number}


@router.put("/tickets/{ticket_id}/respond")
def respond_ticket(
    ticket_id: str,
    payload: TicketRespondPayload,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    ticket = db.query(HRTicket).filter(
        HRTicket.id == ticket_id, HRTicket.organization_id == org_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.response = payload.response
    ticket.responded_by = payload.responded_by
    ticket.status = "Resolved"
    ticket.resolved_at = datetime.utcnow()
    db.commit()

    emp = db.query(Employee).filter(Employee.id == ticket.employee_id).first()
    if emp:
        _notify(db, org_id, emp.email,
                f"Ticket {ticket.ticket_number} Resolved",
                f"Your ticket \"{ticket.subject}\" has been resolved by {payload.responded_by}.",
                "success")

    return {"message": "Ticket resolved", "id": ticket_id}


# ======================================================================
#  6.  DOCUMENTS
# ======================================================================
@router.get("/documents")
def get_documents(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    docs = (
        db.query(EmployeeDocument)
        .filter(
            EmployeeDocument.organization_id == org_id,
            (EmployeeDocument.employee_id == emp.id) | (EmployeeDocument.employee_id == None),
        )
        .order_by(EmployeeDocument.created_at.desc())
        .all()
    )
    return [
        {
            "id": d.id,
            "title": d.title,
            "category": d.category,
            "file_url": d.file_url,
            "uploaded_by": d.uploaded_by,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


@router.post("/documents")
def upload_document(
    title: str,
    category: str,
    uploaded_by: str,
    employee_email: Optional[str] = None,
    file_url: Optional[str] = None,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp_id = None
    if employee_email:
        emp = _get_employee_by_email(db, employee_email, org_id)
        if emp:
            emp_id = emp.id

    doc = EmployeeDocument(
        organization_id=org_id,
        employee_id=emp_id,
        title=title,
        category=category,
        file_url=file_url,
        uploaded_by=uploaded_by,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"message": "Document uploaded", "id": doc.id}


# ======================================================================
#  7.  NOTIFICATIONS
# ======================================================================
@router.get("/notifications")
def get_notifications(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    notes = (
        db.query(Notification)
        .filter(
            Notification.user_email == employee_email,
            Notification.organization_id == org_id,
        )
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notes
    ]


@router.put("/notifications/mark-read")
def mark_notifications_read(
    payload: MarkReadPayload,
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(
        Notification.user_email == employee_email,
        Notification.organization_id == org_id,
        Notification.is_read == False,
    )
    if payload.notification_ids:
        query = query.filter(Notification.id.in_(payload.notification_ids))

    query.update({Notification.is_read: True}, synchronize_session="fetch")
    db.commit()
    return {"message": "Notifications marked as read"}


# ======================================================================
#  8.  SALARY BREAKDOWN (mirrors Kenya payroll engine output)
# ======================================================================
@router.get("/salary-breakdown")
def get_salary_breakdown(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    basic = emp.basic_salary or 0
    housing = emp.housing_allowance or 0
    transport = emp.transport_allowance or 0
    other = emp.other_allowances or 0
    gross = basic + housing + transport + other

    # NSSF (Tier I & II)
    nssf_t1 = min(basic, 8000) * 0.06
    nssf_t2 = max(0, min(basic, 72000) - 8000) * 0.06
    nssf_total = round(nssf_t1 + nssf_t2, 2)

    # SHIF (2.75% of gross)
    shif = round(gross * 0.0275, 2)

    # Housing Levy (1.5% of gross)
    housing_levy = round(gross * 0.015, 2)

    # Taxable pay
    taxable = gross - nssf_total

    # PAYE bands (Kenya 2026)
    bands = [
        (24000, 0.10),
        (16667, 0.25),  # 24001 - 40667
        (16667, 0.30),  # 40668 - 57334
        (16667, 0.325), # 57335 - 74001
        (float('inf'), 0.35),
    ]
    remaining = taxable
    paye_before = 0
    for width, rate in bands:
        if remaining <= 0:
            break
        chunk = min(remaining, width)
        paye_before += chunk * rate
        remaining -= chunk
    paye_before = round(paye_before, 2)

    personal_relief = 2400
    paye = round(max(0, paye_before - personal_relief), 2)

    custom = emp.custom_deductions or 0
    total_deductions = round(nssf_total + shif + housing_levy + paye + custom, 2)
    net_pay = round(gross - total_deductions, 2)

    return {
        "basic_salary": basic,
        "housing_allowance": housing,
        "transport_allowance": transport,
        "other_allowances": other,
        "gross_pay": gross,
        "nssf_employee": nssf_total,
        "shif": shif,
        "housing_levy": housing_levy,
        "taxable_pay": taxable,
        "paye_before_relief": paye_before,
        "personal_relief": personal_relief,
        "paye": paye,
        "custom_deductions": custom,
        "total_deductions": total_deductions,
        "net_pay": net_pay,
    }


# ======================================================================
#  9.  STATUTORY INFO  (read-only reference)
# ======================================================================
@router.get("/statutory-info")
def get_statutory_info():
    return {
        "country": "Kenya",
        "year": 2026,
        "rules": [
            {"name": "PAYE", "description": "Progressive tax: 10% (0-24K), 25% (24K-40.6K), 30% (40.6K-57.3K), 32.5% (57.3K-74K), 35% (74K+). Monthly personal relief KES 2,400."},
            {"name": "NSSF", "description": "6% employee + 6% employer. Tier I limit KES 8,000; Tier II limit KES 72,000."},
            {"name": "SHIF", "description": "Social Health Insurance Fund: 2.75% of gross pay (employee contribution)."},
            {"name": "Housing Levy (AHL)", "description": "Affordable Housing Levy: 1.5% employee + 1.5% employer of gross pay."},
        ],
    }


# ======================================================================
#  10.  PROFILE (view & limited edit)
# ======================================================================
@router.get("/profile")
def get_profile(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    dept_name = emp.department.name if emp.department else None

    return {
        "id": emp.id,
        "employee_code": emp.employee_code,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "email": emp.email,
        "phone": emp.phone,
        "job_title": emp.job_title,
        "department_name": dept_name,
        "hire_date": emp.hire_date,
        "basic_salary": emp.basic_salary,
        "pay_frequency": emp.pay_frequency,
        "payment_method": emp.payment_method,
        "bank_name": emp.bank_name,
        "bank_account_number": emp.bank_account_number,
        "kra_pin": emp.kra_pin,
        "nssf_number": emp.nssf_number,
        "shif_number": emp.shif_number,
        "status": emp.status,
    }


@router.put("/profile")
def update_profile(
    payload: ProfileUpdate,
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Only allow phone updates for now (field-level restriction)
    if payload.phone is not None:
        emp.phone = payload.phone
    db.commit()
    db.refresh(emp)
    return {"message": "Profile updated"}


# ======================================================================
#  11.  PAYSLIPS (employee view)
# ======================================================================
@router.get("/payslips")
def get_my_payslips(
    employee_email: str,
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    emp = _get_employee_by_email(db, employee_email, org_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    slips = (
        db.query(Payslip)
        .filter(Payslip.employee_id == emp.id)
        .order_by(Payslip.created_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "period_name": s.period_name,
            "issue_date": s.issue_date,
            "data": s.data_json,
        }
        for s in slips
    ]


# ======================================================================
#  12.  ADMIN – aggregated pending items for approval desk
# ======================================================================
@router.get("/admin/pending-approvals")
def admin_pending_approvals(
    org_id: str = Depends(get_tenant_org_id),
    db: Session = Depends(get_db),
):
    leaves = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.organization_id == org_id, LeaveRequest.status == "Pending")
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    loans = (
        db.query(LoanRequest)
        .filter(LoanRequest.organization_id == org_id, LoanRequest.status == "Pending")
        .order_by(LoanRequest.created_at.desc())
        .all()
    )

    tickets = (
        db.query(HRTicket)
        .filter(HRTicket.organization_id == org_id, HRTicket.status.in_(["Open", "In Progress"]))
        .order_by(HRTicket.created_at.desc())
        .all()
    )

    return {
        "leaves": [
            {
                "id": lv.id, "employee_name": lv.employee_name,
                "leave_type": lv.leave_type, "start_date": lv.start_date,
                "end_date": lv.end_date, "days": lv.days, "reason": lv.reason,
                "status": lv.status,
                "created_at": lv.created_at.isoformat() if lv.created_at else None,
            }
            for lv in leaves
        ],
        "loans": [
            {
                "id": ln.id, "employee_name": ln.employee_name,
                "request_type": ln.request_type, "amount": ln.amount,
                "monthly_deduction": ln.monthly_deduction, "reason": ln.reason,
                "status": ln.status,
                "created_at": ln.created_at.isoformat() if ln.created_at else None,
            }
            for ln in loans
        ],
        "tickets": [
            {
                "id": t.id, "ticket_number": t.ticket_number,
                "employee_name": t.employee_name, "category": t.category,
                "subject": t.subject, "message": t.message,
                "priority": t.priority, "status": t.status,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tickets
        ],
        "summary": {
            "pending_leaves": len(leaves),
            "pending_loans": len(loans),
            "open_tickets": len(tickets),
        },
    }
