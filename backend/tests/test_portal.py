import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import SessionLocal
from app.models.schema import Organization, User, Employee, Department

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_data():
    db = SessionLocal()
    org = db.query(Organization).filter(Organization.name == "SmartPay Kenya").first()
    emp = db.query(Employee).filter(Employee.email == "joy.munene@smartpay.co.ke").first()
    org_id = org.id if org else "0a2827c0-9980-478e-889a-a3e76a2a6048"
    db.close()
    return {"org_id": org_id, "emp_email": "joy.munene@smartpay.co.ke"}

def test_portal_dashboard_summary(setup_data):
    res = client.get(
        f"/api/v1/portal/dashboard-summary?employee_email={setup_data['emp_email']}",
        headers={"x-org-id": setup_data["org_id"]}
    )
    assert res.status_code == 200
    data = res.json()
    assert "employee_name" in data
    assert "leave_balance" in data
    assert "attendance_today" in data
    assert data["basic_salary"] == 85000.0

def test_portal_salary_breakdown(setup_data):
    res = client.get(
        f"/api/v1/portal/salary-breakdown?employee_email={setup_data['emp_email']}",
        headers={"x-org-id": setup_data["org_id"]}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["basic_salary"] == 85000.0
    assert data["gross_pay"] >= 85000.0
    assert data["shif"] > 0
    assert data["housing_levy"] > 0
    assert data["net_pay"] > 0

def test_portal_statutory_info():
    res = client.get("/api/v1/portal/statutory-info")
    assert res.status_code == 200
    data = res.json()
    assert data["country"] == "Kenya"
    assert data["year"] == 2026

def test_portal_leave_workflow(setup_data):
    # 1. Apply for leave
    res = client.post(
        f"/api/v1/portal/leaves?employee_email={setup_data['emp_email']}",
        headers={"x-org-id": setup_data["org_id"]},
        json={
            "leave_type": "Annual Leave",
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "days": 5,
            "reason": "Family vacation"
        }
    )
    assert res.status_code == 200
    leave_id = res.json()["id"]

    # 2. Check pending leave in admin approvals
    admin_res = client.get(
        "/api/v1/portal/admin/pending-approvals",
        headers={"x-org-id": setup_data["org_id"]}
    )
    assert admin_res.status_code == 200
    pending_leaves = admin_res.json()["leaves"]
    assert any(l["id"] == leave_id for l in pending_leaves)

    # 3. Approve leave
    appr_res = client.put(
        f"/api/v1/portal/leaves/{leave_id}/approve",
        headers={"x-org-id": setup_data["org_id"]},
        json={"approved_by": "Spencer Admin"}
    )
    assert appr_res.status_code == 200

def test_portal_loan_workflow(setup_data):
    # 1. Apply for loan
    res = client.post(
        f"/api/v1/portal/loans?employee_email={setup_data['emp_email']}",
        headers={"x-org-id": setup_data["org_id"]},
        json={
            "request_type": "Salary Advance",
            "amount": 15000.0,
            "monthly_deduction": 15000.0,
            "reason": "School fees advance"
        }
    )
    assert res.status_code == 200
    loan_id = res.json()["id"]

    # 2. Approve loan
    appr_res = client.put(
        f"/api/v1/portal/loans/{loan_id}/approve",
        headers={"x-org-id": setup_data["org_id"]},
        json={"approved_by": "Finance Manager"}
    )
    assert appr_res.status_code == 200

def test_portal_ticket_workflow(setup_data):
    # 1. Create ticket
    res = client.post(
        f"/api/v1/portal/tickets?employee_email={setup_data['emp_email']}",
        headers={"x-org-id": setup_data["org_id"]},
        json={
            "category": "Salary Query",
            "subject": "Question regarding July SHIF deduction",
            "message": "Could you clarify the new 2.75% SHIF deduction calculation?",
            "priority": "Medium"
        }
    )
    assert res.status_code == 200
    ticket_id = res.json()["id"]

    # 2. Admin responds to ticket
    resp_res = client.put(
        f"/api/v1/portal/tickets/{ticket_id}/respond",
        headers={"x-org-id": setup_data["org_id"]},
        json={
            "response": "SHIF is calculated at 2.75% of your gross pay under the 2026 Social Health Insurance Act.",
            "responded_by": "HR Administrator"
        }
    )
    assert resp_res.status_code == 200

def test_portal_attendance_clock(setup_data):
    res = client.post(
        "/api/v1/portal/attendance/clock",
        headers={"x-org-id": setup_data["org_id"]},
        json={
            "employee_email": setup_data["emp_email"],
            "action": "clock_in"
        }
    )
    # Could be 200 (first clock in) or 400 (if already clocked in today)
    assert res.status_code in [200, 400]
