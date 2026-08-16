from app.services.payroll.kenya import KenyaPayrollEngine

def test_kenya_payroll_calculation_50k():
    result = KenyaPayrollEngine.process_payroll_item(
        basic_salary=50000.0
    )

    assert result["gross_pay"] == 50000.0
    assert result["nssf_employee"] == 3000.0
    assert result["shif_employee"] == 1375.0
    assert result["housing_levy_employee"] == 750.0
    assert result["taxable_pay"] == 44875.0
    assert result["personal_relief"] == 2400.0
    assert result["paye_tax"] == 5845.85
    assert result["net_pay"] == 39029.15
    assert result["employer_cost"] == 53750.0 # 50,000 + 3,000 NSSF + 750 Housing Levy

def test_kenya_payroll_calculation_150k():
    result = KenyaPayrollEngine.process_payroll_item(
        basic_salary=150000.0,
        housing_allowance=20000.0
    )

    assert result["gross_pay"] == 170000.0
    assert result["nssf_employee"] == 4320.0 # Max NSSF cap (Tier 1 480 + Tier 2 3840)
    assert result["shif_employee"] == 4675.0 # 170k * 0.0275
    assert result["housing_levy_employee"] == 2550.0 # 170k * 0.015
    assert result["net_pay"] > 0
    assert result["paye_tax"] > 0
