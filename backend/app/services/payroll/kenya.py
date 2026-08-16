from typing import Dict, Any

class KenyaPayrollEngine:
    """
    Official Kenya Statutory Payroll Calculation Engine.
    Supports KRA PAYE progressive tax bands, NSSF Tier I & II, SHIF 2.75%,
    Affordable Housing Levy 1.5%, and Personal Relief KES 2,400/month.
    """

    # Default Statutory Constants
    PERSONAL_RELIEF_MONTHLY = 2400.0
    NSSF_TIER_1_LIMIT = 8000.0
    NSSF_TIER_2_LIMIT = 72000.0
    NSSF_RATE = 0.06
    SHIF_RATE = 0.0275
    MIN_SHIF_DEDUCTION = 300.0
    HOUSING_LEVY_RATE = 0.015

    # Progressive Monthly PAYE Tax Bands (2024/2026 KRA Rules)
    # (upper_limit, tax_rate)
    TAX_BANDS = [
        (24000.0, 0.10),
        (32333.0, 0.25),
        (500000.0, 0.30),
        (800000.0, 0.325),
        (float('inf'), 0.35)
    ]

    @classmethod
    def calculate_nssf(cls, gross_pay: float) -> Dict[str, float]:
        """Calculates Tier I & Tier II NSSF contributions."""
        if gross_pay <= 0:
            return {"employee": 0.0, "employer": 0.0, "tier1": 0.0, "tier2": 0.0}

        tier1_pay = min(gross_pay, cls.NSSF_TIER_1_LIMIT)
        tier1_contrib = tier1_pay * cls.NSSF_RATE

        tier2_pay = max(0.0, min(gross_pay, cls.NSSF_TIER_2_LIMIT) - cls.NSSF_TIER_1_LIMIT)
        tier2_contrib = tier2_pay * cls.NSSF_RATE

        total_nssf = tier1_contrib + tier2_contrib

        return {
            "employee": round(total_nssf, 2),
            "employer": round(total_nssf, 2),
            "tier1": round(tier1_contrib, 2),
            "tier2": round(tier2_contrib, 2)
        }

    @classmethod
    def calculate_shif(cls, gross_pay: float) -> Dict[str, float]:
        """Calculates 2.75% Social Health Insurance Fund (SHIF) contribution."""
        if gross_pay <= 0:
            return {"employee": 0.0}

        shif_amount = max(cls.MIN_SHIF_DEDUCTION, gross_pay * cls.SHIF_RATE)
        return {"employee": round(shif_amount, 2)}

    @classmethod
    def calculate_housing_levy(cls, gross_pay: float) -> Dict[str, float]:
        """Calculates 1.5% Affordable Housing Levy for employee & employer."""
        if gross_pay <= 0:
            return {"employee": 0.0, "employer": 0.0}

        levy = gross_pay * cls.HOUSING_LEVY_RATE
        return {
            "employee": round(levy, 2),
            "employer": round(levy, 2)
        }

    @classmethod
    def calculate_paye(cls, taxable_pay: float) -> Dict[str, float]:
        """Calculates progressive KRA PAYE tax before & after personal relief."""
        if taxable_pay <= 0:
            return {
                "taxable_pay": 0.0,
                "gross_paye": 0.0,
                "personal_relief": cls.PERSONAL_RELIEF_MONTHLY,
                "paye_due": 0.0
            }

        tax_remaining = taxable_pay
        gross_paye = 0.0
        previous_limit = 0.0

        for upper_limit, rate in cls.TAX_BANDS:
            if taxable_pay > previous_limit:
                taxable_amount_in_band = min(taxable_pay - previous_limit, upper_limit - previous_limit)
                gross_paye += taxable_amount_in_band * rate
                previous_limit = upper_limit
            else:
                break

        net_paye = max(0.0, gross_paye - cls.PERSONAL_RELIEF_MONTHLY)

        return {
            "taxable_pay": round(taxable_pay, 2),
            "gross_paye": round(gross_paye, 2),
            "personal_relief": cls.PERSONAL_RELIEF_MONTHLY,
            "paye_due": round(net_paye, 2)
        }

    @classmethod
    def process_payroll_item(
        cls,
        basic_salary: float,
        housing_allowance: float = 0.0,
        transport_allowance: float = 0.0,
        other_allowances: float = 0.0,
        overtime_pay: float = 0.0,
        bonuses: float = 0.0,
        custom_deductions: float = 0.0
    ) -> Dict[str, Any]:
        """Executes the full Kenya Gross-to-Net payroll calculation pipeline."""
        
        total_allowances = housing_allowance + transport_allowance + other_allowances
        gross_pay = basic_salary + total_allowances + overtime_pay + bonuses

        nssf_data = cls.calculate_nssf(gross_pay)
        shif_data = cls.calculate_shif(gross_pay)
        housing_levy_data = cls.calculate_housing_levy(gross_pay)

        # Taxable Pay = Gross Pay minus statutory tax-deductible items (NSSF, SHIF, Housing Levy)
        total_statutory_deductions_for_tax = (
            nssf_data["employee"] +
            shif_data["employee"] +
            housing_levy_data["employee"]
        )
        taxable_pay = max(0.0, gross_pay - total_statutory_deductions_for_tax)

        paye_data = cls.calculate_paye(taxable_pay)

        # Total Deductions for Employee
        total_employee_deductions = (
            paye_data["paye_due"] +
            nssf_data["employee"] +
            shif_data["employee"] +
            housing_levy_data["employee"] +
            custom_deductions
        )

        net_pay = max(0.0, gross_pay - total_employee_deductions)

        # Total Employer Cost
        employer_cost = (
            gross_pay +
            nssf_data["employer"] +
            housing_levy_data["employer"]
        )

        return {
            "basic_salary": round(basic_salary, 2),
            "allowances": round(total_allowances, 2),
            "overtime_pay": round(overtime_pay, 2),
            "bonuses": round(bonuses, 2),
            "gross_pay": round(gross_pay, 2),

            "nssf_employee": nssf_data["employee"],
            "nssf_employer": nssf_data["employer"],
            "shif_employee": shif_data["employee"],
            "housing_levy_employee": housing_levy_data["employee"],
            "housing_levy_employer": housing_levy_data["employer"],

            "taxable_pay": paye_data["taxable_pay"],
            "paye_tax_before_relief": paye_data["gross_paye"],
            "personal_relief": paye_data["personal_relief"],
            "paye_tax": paye_data["paye_due"],

            "other_deductions": round(custom_deductions, 2),
            "total_deductions": round(total_employee_deductions, 2),
            "net_pay": round(net_pay, 2),
            "employer_cost": round(employer_cost, 2)
        }
