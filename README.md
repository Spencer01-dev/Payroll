# PaySphere Global - Global Payroll & Workforce SaaS

Production-ready, multi-tenant SaaS payroll and workforce management platform designed **Kenya-first, Africa-ready, and globally scalable**.

---

## Key Features

- **Multi-Tenant SaaS Architecture**: Strict row-level organization data isolation (`organization_id`), tenant-level JWT auth context, and RBAC permissions.
- **Kenya Statutory Engine (2026 Ruleset)**:
  - **KRA PAYE**: Progressive monthly tax bands (10%, 25%, 30%, 32.5%, 35%) with Personal Relief (KES 2,400/month).
  - **NSSF**: Pension Tier I (6% up to KES 8,000) & Tier II (6% KES 8,001 - 72,000) matching contributions.
  - **SHIF**: 2.75% Social Health Insurance Fund.
  - **Affordable Housing Levy**: 1.5% employee + 1.5% employer contributions.
- **Gross-to-Net Interactive Console**: One-click Kenya payroll calculation, salary anomaly detection warnings, multi-stage approval (Draft $\rightarrow$ Calculated $\rightarrow$ Approved $\rightarrow$ Locked).
- **Printable PDF Payslip Generator**: KRA P9/P10 compliant itemized payslip with itemized deductions, net pay badges, and printable PDF export.
- **Statutory Returns & Reporting**: KRA iTax P10 CSV exports, NSSF schedules, SHIF portal returns, and Housing Levy reporting.
- **Security & Audit Trail**: Tamper-evident audit logging of all sensitive payroll and employee profile operations.

---

## Design System

- **Primary**: Deep Blue / Slate (`#0F172A`, `#1E293B`, `#1E3A8A`) for structure & headers.
- **Background**: Off-White (`#F8FAFC`) / Dark Charcoal (`#0B0F19`).
- **Surface Cards**: Pure White (`#FFFFFF`) / Deep Gray (`#1E293B`).
- **Action Accents**: Vibrant Teal (`#0D9488`) for primary CTAs ("Calculate Payroll", "Add Employee").
- **Status Badges**: Soft Green (Approved/Paid), Warm Yellow (Pending/Calculated), Muted Red (Failed).

---

## Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run Backend Unit Tests
```bash
$env:PYTHONPATH="backend"; python -m pytest backend/tests
```

### 3. Frontend (Next.js / Vite React)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)
