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
    # Create DB tables in Supabase PostgreSQL
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SmartPay Global Payroll API",
        "version": "1.0.0",
        "country": "Kenya (Primary)",
        "docs": "/docs"
    }
