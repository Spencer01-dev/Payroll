"""
Seed script – creates one Admin and one Employee login in the database.
Run:  python seed_logins.py
"""
import os, sys, uuid
from datetime import datetime

# Make sure 'app' package is importable
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.db.base import SessionLocal
from app.models.schema import Organization, User, Employee, Department
from app.core.security import get_password_hash

# ---------- credentials ----------
ADMIN_EMAIL    = "admin@smartpay.co.ke"
ADMIN_PASSWORD = "Admin@2026"
ADMIN_NAME     = "Spencer Admin"

EMP_EMAIL      = "joy.munene@smartpay.co.ke"
EMP_PASSWORD   = "Employee@2026"
EMP_FIRST      = "Joy"
EMP_LAST       = "Munene"
EMP_TITLE      = "Payroll Officer"
EMP_DEPT       = "Finance"
EMP_SALARY     = 85000.0
# ---------------------------------

db = SessionLocal()

try:
    # 1 ── Organisation (reuse if it already exists)
    org = db.query(Organization).filter(Organization.name == "SmartPay Kenya").first()
    if not org:
        org = Organization(id=str(uuid.uuid4()), name="SmartPay Kenya", country="Kenya", currency="KES")
        db.add(org)
        db.commit()
        db.refresh(org)
        print(f"✅  Created organisation: {org.name}  (id: {org.id})")
    else:
        print(f"ℹ️  Organisation already exists: {org.name}  (id: {org.id})")

    # 2 ── Admin user
    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email=ADMIN_EMAIL,
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            plain_password=ADMIN_PASSWORD,
            full_name=ADMIN_NAME,
            role="Company Owner",
            organization_id=org.id,
        )
        db.add(admin)
        db.commit()
        print(f"✅  Created admin user:  {ADMIN_EMAIL}  /  {ADMIN_PASSWORD}")
    else:
        print(f"ℹ️  Admin user already exists: {ADMIN_EMAIL}")

    # 3 ── Department
    dept = db.query(Department).filter(
        Department.name == EMP_DEPT,
        Department.organization_id == org.id
    ).first()
    if not dept:
        dept = Department(id=str(uuid.uuid4()), organization_id=org.id, name=EMP_DEPT, code="FIN")
        db.add(dept)
        db.commit()
        db.refresh(dept)
        print(f"✅  Created department:  {EMP_DEPT}")
    else:
        print(f"ℹ️  Department already exists: {EMP_DEPT}")

    # 4 ── Employee user account (for login)
    emp_user = db.query(User).filter(User.email == EMP_EMAIL).first()
    if not emp_user:
        emp_user = User(
            id=str(uuid.uuid4()),
            email=EMP_EMAIL,
            hashed_password=get_password_hash(EMP_PASSWORD),
            plain_password=EMP_PASSWORD,
            full_name=f"{EMP_FIRST} {EMP_LAST}",
            role="Employee",
            organization_id=org.id,
        )
        db.add(emp_user)
        db.commit()
        print(f"✅  Created employee user:  {EMP_EMAIL}  /  {EMP_PASSWORD}")
    else:
        print(f"ℹ️  Employee user already exists: {EMP_EMAIL}")

    # 5 ── Employee record
    emp = db.query(Employee).filter(Employee.email == EMP_EMAIL).first()
    if not emp:
        emp = Employee(
            id=str(uuid.uuid4()),
            organization_id=org.id,
            employee_code="EMP-001",
            first_name=EMP_FIRST,
            last_name=EMP_LAST,
            email=EMP_EMAIL,
            phone="+254712345678",
            department_id=dept.id,
            job_title=EMP_TITLE,
            hire_date="2026-01-15",
            plain_password=EMP_PASSWORD,
            basic_salary=EMP_SALARY,
            pay_frequency="Monthly",
            payment_method="Bank Transfer",
            bank_name="Equity Bank",
            bank_account_number="0123456789",
            kra_pin="A012345678Z",
            nssf_number="12345678",
            shif_number="SH-001",
            housing_allowance=5000.0,
            transport_allowance=3000.0,
            status="Active",
        )
        db.add(emp)
        db.commit()
        print(f"✅  Created employee record:  {EMP_FIRST} {EMP_LAST}  ({EMP_TITLE})")
    else:
        print(f"ℹ️  Employee record already exists: {EMP_EMAIL}")

    print("\n" + "=" * 55)
    print("  LOGIN CREDENTIALS")
    print("=" * 55)
    print(f"  👑 ADMIN")
    print(f"     Email:    {ADMIN_EMAIL}")
    print(f"     Password: {ADMIN_PASSWORD}")
    print(f"     Role:     Company Owner")
    print()
    print(f"  👤 EMPLOYEE")
    print(f"     Email:    {EMP_EMAIL}")
    print(f"     Password: {EMP_PASSWORD}")
    print(f"     Role:     Employee")
    print("=" * 55)

except Exception as e:
    db.rollback()
    print(f"❌  Error: {e}")
    raise
finally:
    db.close()
