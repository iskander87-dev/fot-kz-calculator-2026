export const PAYROLL_2026 = {
  mrp: 4_325,
  mzp: 85_000,
  basicDeduction: 30 * 4_325,
  ipnAnnualThreshold: 8_500 * 4_325,
  opvMaxBase: 50 * 85_000,
  opvrMinBase: 85_000,
  opvrMaxBase: 50 * 85_000,
  vosmsMaxBase: 20 * 85_000,
  employerOsmsMaxBase: 40 * 85_000,
  socialContributionsMaxBase: 7 * 85_000,
} as const;

export type PayrollInput = {
  gross: number;
  isResident: boolean;
  bornBefore1975: boolean;
  taxableIncomeBeforeMonth?: number;
};

export type PayrollResult = {
  gross: number;
  opvBase: number;
  opv: number;
  vosmsBase: number;
  vosms: number;
  appliedDeduction: number;
  ipnBase: number;
  ipnAt10Base: number;
  ipnAt15Base: number;
  ipn: number;
  net: number;
  opvrBase: number;
  opvr: number;
  socialContributionsBase: number;
  socialContributions: number;
  employerOsmsBase: number;
  employerOsms: number;
  socialTax: number;
  employerAdditions: number;
  totalCost: number;
  annualTaxableIncomeAfterMonth: number;
  remainingBeforeHigherRate: number;
};

export function roundTenge(value: number) {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  return Object.is(rounded, -0) ? 0 : rounded;
}

function nonNegativeTenge(value: number) {
  return Math.max(0, roundTenge(value));
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const gross = nonNegativeTenge(input.gross);
  const taxableIncomeBeforeMonth = nonNegativeTenge(
    input.taxableIncomeBeforeMonth ?? 0,
  );

  const opvBase = Math.min(gross, PAYROLL_2026.opvMaxBase);
  const opv = roundTenge(opvBase * 0.1);

  const vosmsBase = Math.min(gross, PAYROLL_2026.vosmsMaxBase);
  const vosms = roundTenge(vosmsBase * 0.02);

  const incomeAfterContributions = Math.max(0, gross - opv - vosms);
  const appliedDeduction = input.isResident
    ? Math.min(PAYROLL_2026.basicDeduction, incomeAfterContributions)
    : 0;
  const ipnBase = Math.max(
    0,
    input.isResident ? incomeAfterContributions - appliedDeduction : gross,
  );

  const remainingAt10Percent = Math.max(
    0,
    PAYROLL_2026.ipnAnnualThreshold - taxableIncomeBeforeMonth,
  );
  const ipnAt10Base = Math.min(ipnBase, remainingAt10Percent);
  const ipnAt15Base = Math.max(0, ipnBase - ipnAt10Base);
  const ipn = roundTenge(ipnAt10Base * 0.1 + ipnAt15Base * 0.15);
  const net = gross - opv - vosms - ipn;

  const opvrBase =
    gross === 0 || input.bornBefore1975
      ? 0
      : Math.min(
          Math.max(gross, PAYROLL_2026.opvrMinBase),
          PAYROLL_2026.opvrMaxBase,
        );
  const opvr = roundTenge(opvrBase * 0.035);

  const socialContributionsBase = Math.min(
    gross,
    PAYROLL_2026.socialContributionsMaxBase,
  );
  const socialContributions = roundTenge(socialContributionsBase * 0.05);

  const employerOsmsBase = Math.min(gross, PAYROLL_2026.employerOsmsMaxBase);
  const employerOsms = roundTenge(employerOsmsBase * 0.03);
  const socialTax = roundTenge(incomeAfterContributions * 0.06);

  const employerAdditions =
    opvr + socialContributions + employerOsms + socialTax;
  const annualTaxableIncomeAfterMonth = taxableIncomeBeforeMonth + ipnBase;

  return {
    gross,
    opvBase,
    opv,
    vosmsBase,
    vosms,
    appliedDeduction,
    ipnBase,
    ipnAt10Base,
    ipnAt15Base,
    ipn,
    net,
    opvrBase,
    opvr,
    socialContributionsBase,
    socialContributions,
    employerOsmsBase,
    employerOsms,
    socialTax,
    employerAdditions,
    totalCost: gross + employerAdditions,
    annualTaxableIncomeAfterMonth,
    remainingBeforeHigherRate: Math.max(
      0,
      PAYROLL_2026.ipnAnnualThreshold - annualTaxableIncomeAfterMonth,
    ),
  };
}
