from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base, engine, SessionLocal
from app.models.schema import Organization, User, Department, Employee, AuditLog
from app.core.security import get_password_hash
from app.api.v1 import auth, employees, payroll, reports
from app.services.payroll.kenya import KenyaPayrollEngine

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Multi-tenant SaaS Payroll & Workforce Management Platform (Kenya-first, Africa-ready)"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(payroll.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default tenant and employees if DB is empty
    db = SessionLocal()
    try:
        org_count = db.query(Organization).count()
        if org_count == 0:
            org = Organization(
                id="default_org_id",
                name="SafariTech Solutions Kenya Ltd",
                registration_number="CPR/2023/889012",
                country="Kenya",
                currency="KES",
                city="Nairobi",
                phone="+254 712 345678",
                email="hr@safaritech.co.ke"
            )
            db.add(org)
            db.commit()

            admin = User(
                email="admin@smartpay.io",
                hashed_password=get_password_hash("admin123"),
                full_name="Faith Wanjiku",
                role="Company Owner",
                organization_id=org.id
            )
            db.add(admin)

            dept_eng = Department(id="dept_eng", organization_id=org.id, name="Engineering", code="ENG")
            dept_hr = Department(id="dept_hr", organization_id=org.id, name="Human Resources", code="HR")
            dept_fin = Department(id="dept_fin", organization_id=org.id, name="Finance & Ops", code="FIN")
            db.add_all([dept_eng, dept_hr, dept_fin])
            db.commit()

            # Seed realistic Kenyan employee payroll records
            demo_employees = [
                Employee(
                    organization_id=org.id,
                    employee_code="EMP-001",
                    first_name="David",
                    last_name="Ochieng",
                    email="david.ochieng@safaritech.co.ke",
                    phone="+254 722 100200",
                    department_id=dept_eng.id,
                    job_title="Lead Software Engineer",
                    hire_date="2023-01-15",
                    basic_salary=185000.0,
                    housing_allowance=25000.0,
                    transport_allowance=10000.0,
                    kra_pin="A019827364Z",
                    nssf_number="NSSF-987123",
                    shif_number="SHIF-443322",
                    bank_name="KCB Bank Kenya",
                    bank_account_number="1289004455"
                ),
                Employee(
                    organization_id=org.id,
                    employee_code="EMP-002",
                    first_name="Amina",
                    last_name="Hassan",
                    email="amina.hassan@safaritech.co.ke",
                    phone="+254 733 400500",
                    department_id=dept_fin.id,
                    job_title="Senior Financial Analyst",
                    hire_date="2023-06-01",
                    basic_salary=120000.0,
                    housing_allowance=15000.0,
                    kra_pin="A014556677Y",
                    nssf_number="NSSF-654321",
                    shif_number="SHIF-887766",
                    bank_name="Equity Bank Kenya",
                    bank_account_number="01102993881"
                ),
                Employee(
                    organization_id=org.id,
                    employee_code="EMP-003",
                    first_name="Samuel",
                    last_name="Mwangi",
                    email="samuel.mwangi@safaritech.co.ke",
                    phone="+254 711 889900",
                    department_id=dept_hr.id,
                    job_title="HR & Talent Specialist",
                    hire_date="2024-02-10",
                    basic_salary=75000.0,
                    housing_allowance=10000.0,
                    kra_pin="A011223344X",
                    nssf_number="NSSF-112233",
                    shif_number="SHIF-998877",
                    bank_name="Co-operative Bank",
                    bank_account_number="01129883774"
                ),
                Employee(
                    organization_id=org.id,
                    employee_code="EMP-004",
                    first_name="Grace",
                    last_name="Kiprono",
                    email="grace.kiprono@safaritech.co.ke",
                    phone="+254 701 554433",
                    department_id=dept_eng.id,
                    job_title="UI/UX Product Designer",
                    hire_date="2024-05-15",
                    basic_salary=95000.0,
                    transport_allowance=8000.0,
                    kra_pin="A017788990W",
                    nssf_number="NSSF-445566",
                    shif_number="SHIF-332211",
                    bank_name="Standard Chartered Kenya",
                    bank_account_number="01080998877"
                ),
                Employee(
                    organization_id=org.id,
                    employee_code="EMP-005",
                    first_name="Kevin",
                    last_name="Mutua",
                    email="kevin.mutua@safaritech.co.ke",
                    phone="+254 799 112233",
                    department_id=dept_fin.id,
                    job_title="Operations Assistant",
                    hire_date="2024-09-01",
                    basic_salary=45000.0,
                    kra_pin="A015544332V",
                    nssf_number="NSSF-778899",
                    shif_number="SHIF-554433",
                    bank_name="NCBA Bank",
                    bank_account_number="6655443322"
                )
            ]
            db.add_all(demo_employees)

            audit = AuditLog(
                organization_id=org.id,
                user_email="system",
                action="INITIAL_SEED",
                resource="Organization",
                details="Initialized SafariTech Kenya organization with 5 demo employees."
            )
            db.add(audit)
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SmartPay Global Payroll API",
        "version": "1.0.0",
        "country": "Kenya (Primary)",
        "docs": "/docs"
    }
