import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePayroll, PAYROLL_2026 } from '../lib/payroll.ts';

void test('resident calculation for 1 000 000 KZT matches the reference example', () => {
  const result = calculatePayroll({
    gross: 1_000_000,
    isResident: true,
    bornBefore1975: false,
  });

  assert.equal(result.opv, 100_000);
  assert.equal(result.vosms, 20_000);
  assert.equal(result.appliedDeduction, 129_750);
  assert.equal(result.ipn, 75_025);
  assert.equal(result.net, 804_975);
  assert.equal(result.employerAdditions, 147_550);
  assert.equal(result.totalCost, 1_147_550);
});

void test('nonresident born before 1975 has no deduction and no OPVR', () => {
  const result = calculatePayroll({
    gross: 1_000_000,
    isResident: false,
    bornBefore1975: true,
  });

  assert.equal(result.appliedDeduction, 0);
  assert.equal(result.ipn, 100_000);
  assert.equal(result.net, 780_000);
  assert.equal(result.opvr, 0);
  assert.equal(result.totalCost, 1_112_550);
});

void test('the applied deduction cannot exceed income after contributions', () => {
  const result = calculatePayroll({
    gross: 100_000,
    isResident: true,
    bornBefore1975: false,
  });

  assert.equal(result.appliedDeduction, 88_000);
  assert.equal(result.ipnBase, 0);
  assert.equal(result.ipn, 0);
  assert.equal(result.net, 88_000);
});

void test('OPV, OPVR and medical contribution caps are applied', () => {
  const result = calculatePayroll({
    gross: 5_000_000,
    isResident: true,
    bornBefore1975: false,
  });

  assert.equal(result.opvBase, PAYROLL_2026.opvMaxBase);
  assert.equal(result.opv, 425_000);
  assert.equal(result.vosms, 34_000);
  assert.equal(result.opvr, 148_750);
  assert.equal(result.employerOsms, 102_000);
  assert.equal(result.socialContributions, 29_750);
});

void test('IPN is split between 10 and 15 percent when the annual threshold is crossed', () => {
  const result = calculatePayroll({
    gross: 100_000,
    isResident: false,
    bornBefore1975: true,
    taxableIncomeBeforeMonth: PAYROLL_2026.ipnAnnualThreshold - 50_000,
  });

  assert.equal(result.ipnAt10Base, 50_000);
  assert.equal(result.ipnAt15Base, 50_000);
  assert.equal(result.ipn, 12_500);
});

void test('zero income produces only zero values', () => {
  const result = calculatePayroll({
    gross: 0,
    isResident: true,
    bornBefore1975: false,
  });

  assert.equal(result.opv, 0);
  assert.equal(result.vosms, 0);
  assert.equal(result.ipn, 0);
  assert.equal(result.opvr, 0);
  assert.equal(result.totalCost, 0);
});

void test('total cost equals gross plus individually rounded employer payments', () => {
  const result = calculatePayroll({
    gross: 85_003,
    isResident: true,
    bornBefore1975: false,
  });

  assert.equal(
    result.employerAdditions,
    result.opvr +
      result.socialContributions +
      result.employerOsms +
      result.socialTax,
  );
  assert.equal(result.totalCost, result.gross + result.employerAdditions);
});
