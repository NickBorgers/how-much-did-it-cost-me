/**
 * Unit tests for calculations.js
 *
 * Tests all core calculation functions to ensure correctness of:
 * - Federal income tax calculations
 * - FICA (payroll) tax calculations
 * - User share of federal spending calculations
 * - Currency formatting and parsing utilities
 * - Comparison text generation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Load the JS files into a shared context (simulating browser globals)
let context;

beforeAll(() => {
  // Create a context with necessary globals
  context = {
    console,
    Math,
    Intl,
    parseFloat,
    isNaN,
    Infinity
  };

  // Load data.js first (defines constants)
  const dataCode = readFileSync(join(projectRoot, 'js/data.js'), 'utf-8');
  vm.runInNewContext(dataCode, context);

  // Load calculations.js (uses constants from data.js)
  const calcCode = readFileSync(join(projectRoot, 'js/calculations.js'), 'utf-8');
  vm.runInNewContext(calcCode, context);
});

// ============================================================================
// calculateIncomeTax() Tests
// ============================================================================

describe('calculateIncomeTax', () => {
  describe('single filer', () => {
    it('returns 0 for income at or below standard deduction', () => {
      expect(context.calculateIncomeTax(0, 'single')).toBe(0);
      expect(context.calculateIncomeTax(14600, 'single')).toBe(0);
      expect(context.calculateIncomeTax(10000, 'single')).toBe(0);
    });

    it('calculates tax correctly in the 10% bracket', () => {
      // $20,000 gross - $14,600 deduction = $5,400 taxable at 10%
      const tax = context.calculateIncomeTax(20000, 'single');
      expect(tax).toBeCloseTo(540, 2);
    });

    it('calculates tax correctly spanning 10% and 12% brackets', () => {
      // $50,000 gross - $14,600 deduction = $35,400 taxable
      // First $11,600 at 10% = $1,160
      // Next $23,800 at 12% = $2,856
      // Total = $4,016
      const tax = context.calculateIncomeTax(50000, 'single');
      expect(tax).toBeCloseTo(4016, 2);
    });

    it('calculates tax correctly for income in 22% bracket', () => {
      // $100,000 gross - $14,600 deduction = $85,400 taxable
      // $11,600 at 10% = $1,160
      // $35,550 ($47,150 - $11,600) at 12% = $4,266
      // $38,250 ($85,400 - $47,150) at 22% = $8,415
      // Total = $13,841
      const tax = context.calculateIncomeTax(100000, 'single');
      expect(tax).toBeCloseTo(13841, 2);
    });

    it('calculates tax correctly for high income in 24% bracket', () => {
      // $200,000 gross - $14,600 deduction = $185,400 taxable
      // $11,600 at 10% = $1,160
      // $35,550 at 12% = $4,266
      // $53,375 ($100,525 - $47,150) at 22% = $11,742.50
      // $84,875 ($185,400 - $100,525) at 24% = $20,370
      // Total = $37,538.50
      const tax = context.calculateIncomeTax(200000, 'single');
      expect(tax).toBeCloseTo(37538.50, 2);
    });

    it('calculates tax correctly for income in 32% bracket', () => {
      // $250,000 gross - $14,600 deduction = $235,400 taxable
      const tax = context.calculateIncomeTax(250000, 'single');
      // Verify it's higher than 24% bracket amount
      expect(tax).toBeGreaterThan(context.calculateIncomeTax(200000, 'single'));
      // Should be in reasonable range for this income level
      expect(tax).toBeGreaterThan(50000);
      expect(tax).toBeLessThan(60000);
    });

    it('calculates tax correctly for income in 35% bracket', () => {
      // $500,000 gross - $14,600 deduction = $485,400 taxable
      const tax = context.calculateIncomeTax(500000, 'single');
      expect(tax).toBeGreaterThan(100000);
      expect(tax).toBeLessThan(150000);
    });

    it('calculates tax correctly for income in 37% bracket', () => {
      // $1,000,000 gross - $14,600 deduction = $985,400 taxable
      const tax = context.calculateIncomeTax(1000000, 'single');
      // Should be substantially higher
      expect(tax).toBeGreaterThan(context.calculateIncomeTax(500000, 'single'));
      expect(tax).toBeGreaterThan(300000);
      expect(tax).toBeLessThan(400000);
    });

    it('handles bracket boundary exactly at first bracket max', () => {
      // Exactly at $11,600 taxable income (income = $11,600 + $14,600 = $26,200)
      const tax = context.calculateIncomeTax(26200, 'single');
      expect(tax).toBeCloseTo(1160, 2); // $11,600 * 10%
    });
  });

  describe('married filer', () => {
    it('returns 0 for income at or below standard deduction', () => {
      expect(context.calculateIncomeTax(0, 'married')).toBe(0);
      expect(context.calculateIncomeTax(29200, 'married')).toBe(0);
      expect(context.calculateIncomeTax(20000, 'married')).toBe(0);
    });

    it('calculates tax correctly in the 10% bracket', () => {
      // $40,000 gross - $29,200 deduction = $10,800 taxable at 10%
      const tax = context.calculateIncomeTax(40000, 'married');
      expect(tax).toBeCloseTo(1080, 2);
    });

    it('calculates tax correctly spanning multiple brackets', () => {
      // $100,000 gross - $29,200 deduction = $70,800 taxable
      // First $23,200 at 10% = $2,320
      // Next $47,600 at 12% = $5,712
      // Total = $8,032
      const tax = context.calculateIncomeTax(100000, 'married');
      expect(tax).toBeCloseTo(8032, 2);
    });

    it('calculates lower tax than single filer for same income', () => {
      const singleTax = context.calculateIncomeTax(100000, 'single');
      const marriedTax = context.calculateIncomeTax(100000, 'married');
      expect(marriedTax).toBeLessThan(singleTax);
    });

    it('calculates tax correctly for high income', () => {
      // $500,000 gross - $29,200 deduction = $470,800 taxable
      const tax = context.calculateIncomeTax(500000, 'married');
      expect(tax).toBeGreaterThan(80000);
    });
  });

  describe('edge cases', () => {
    it('handles negative income gracefully', () => {
      expect(context.calculateIncomeTax(-10000, 'single')).toBe(0);
    });

    it('defaults to single filing status', () => {
      const taxWithDefault = context.calculateIncomeTax(50000);
      const taxWithSingle = context.calculateIncomeTax(50000, 'single');
      expect(taxWithDefault).toBe(taxWithSingle);
    });

    it('handles very large incomes', () => {
      const tax = context.calculateIncomeTax(10000000, 'single');
      // 37% bracket should dominate
      expect(tax).toBeGreaterThan(3000000);
    });
  });
});

// ============================================================================
// calculateFICA() Tests
// ============================================================================

describe('calculateFICA', () => {
  describe('Social Security tax', () => {
    it('calculates 6.2% for income below wage base', () => {
      const result = context.calculateFICA(50000, 'single');
      expect(result.socialSecurity).toBeCloseTo(3100, 2); // $50,000 * 6.2%
    });

    it('caps Social Security at wage base ($168,600)', () => {
      const result = context.calculateFICA(200000, 'single');
      expect(result.socialSecurity).toBeCloseTo(10453.20, 2); // $168,600 * 6.2%
    });

    it('same cap applies regardless of income above wage base', () => {
      const result100k = context.calculateFICA(168600, 'single');
      const result200k = context.calculateFICA(200000, 'single');
      const result500k = context.calculateFICA(500000, 'single');

      expect(result100k.socialSecurity).toBeCloseTo(result200k.socialSecurity, 2);
      expect(result200k.socialSecurity).toBeCloseTo(result500k.socialSecurity, 2);
    });
  });

  describe('Medicare tax', () => {
    it('calculates 1.45% base rate for all income', () => {
      const result = context.calculateFICA(100000, 'single');
      expect(result.medicare).toBeCloseTo(1450, 2); // $100,000 * 1.45%
    });

    it('adds 0.9% additional Medicare tax above $200k for single filer', () => {
      const result = context.calculateFICA(250000, 'single');
      // Base: $250,000 * 1.45% = $3,625
      // Additional: ($250,000 - $200,000) * 0.9% = $450
      // Total: $4,075
      expect(result.medicare).toBeCloseTo(4075, 2);
    });

    it('applies $250k threshold for married filers', () => {
      const result = context.calculateFICA(300000, 'married');
      // Base: $300,000 * 1.45% = $4,350
      // Additional: ($300,000 - $250,000) * 0.9% = $450
      // Total: $4,800
      expect(result.medicare).toBeCloseTo(4800, 2);
    });

    it('no additional tax below threshold', () => {
      const resultSingle = context.calculateFICA(199999, 'single');
      const resultMarried = context.calculateFICA(249999, 'married');

      // Should be exactly 1.45% with no additional
      expect(resultSingle.medicare).toBeCloseTo(199999 * 0.0145, 2);
      expect(resultMarried.medicare).toBeCloseTo(249999 * 0.0145, 2);
    });
  });

  describe('total FICA', () => {
    it('returns correct total combining SS and Medicare', () => {
      const result = context.calculateFICA(100000, 'single');
      expect(result.total).toBeCloseTo(result.socialSecurity + result.medicare, 2);
      expect(result.total).toBeCloseTo(7650, 2); // 6.2% + 1.45% = 7.65%
    });

    it('returns all three components', () => {
      const result = context.calculateFICA(100000, 'single');
      expect(result).toHaveProperty('socialSecurity');
      expect(result).toHaveProperty('medicare');
      expect(result).toHaveProperty('total');
    });
  });

  describe('edge cases', () => {
    it('handles zero income', () => {
      const result = context.calculateFICA(0, 'single');
      expect(result.socialSecurity).toBe(0);
      expect(result.medicare).toBe(0);
      expect(result.total).toBe(0);
    });

    it('defaults to single filing status', () => {
      const resultDefault = context.calculateFICA(250000);
      const resultSingle = context.calculateFICA(250000, 'single');
      expect(resultDefault.total).toBe(resultSingle.total);
    });

    it('different additional Medicare tax for single vs married at $250k', () => {
      const singleResult = context.calculateFICA(250000, 'single');
      const marriedResult = context.calculateFICA(250000, 'married');

      // Single should have additional tax (above $200k threshold)
      // Married should NOT have additional tax (at $250k threshold, not above)
      expect(singleResult.medicare).toBeGreaterThan(marriedResult.medicare);
    });
  });
});

// ============================================================================
// calculateShare() Tests
// ============================================================================

describe('calculateShare', () => {
  // Use realistic tax values for a $100k income earner
  const testTaxes = {
    incomeTax: 13841,  // Approximate for $100k single filer
    ficaTax: 7650      // Approximate for $100k income
  };

  describe('income tax funded categories', () => {
    it('calculates defense spending share correctly', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000, // $1 billion
        category: 'defense'
      });

      expect(result.yourShare).toBeGreaterThan(0);
      expect(result.taxSource).toBe('income');
      expect(result.breakdown.taxType).toBe('Federal Income Tax');

      // Verify the math: share = (incomeTax / totalIncomeTaxRevenue) * spendingAmount
      // Total individual income tax revenue is $2.4 trillion
      const expectedProportion = testTaxes.incomeTax / 2_400_000_000_000;
      const expectedShare = expectedProportion * 1_000_000_000;
      expect(result.yourShare).toBeCloseTo(expectedShare, 2);
    });

    it('calculates general government share correctly', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 500_000_000, // $500 million
        category: 'general'
      });

      expect(result.yourShare).toBeGreaterThan(0);
      expect(result.taxSource).toBe('income');
      expect(result.category).toBe('General Government');
    });

    it('calculates interest on debt share correctly', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 100_000_000, // $100 million
        category: 'interest'
      });

      expect(result.yourShare).toBeGreaterThan(0);
      expect(result.taxSource).toBe('income');
      expect(result.category).toBe('Interest on Debt');
    });
  });

  describe('FICA funded categories', () => {
    it('calculates Social Security share correctly', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000, // $1 billion
        category: 'socialSecurity'
      });

      expect(result.yourShare).toBeGreaterThan(0);
      expect(result.taxSource).toBe('fica');
      expect(result.breakdown.taxType).toBe('Payroll Tax (FICA)');

      // Verify the math: share = (ficaTax / totalPayrollTaxRevenue) * spendingAmount
      // Total payroll tax revenue is $1.7 trillion
      const expectedProportion = testTaxes.ficaTax / 1_700_000_000_000;
      const expectedShare = expectedProportion * 1_000_000_000;
      expect(result.yourShare).toBeCloseTo(expectedShare, 2);
    });
  });

  describe('mixed funding categories', () => {
    it('calculates Medicare/Medicaid share with both income and FICA', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000, // $1 billion
        category: 'medicare'
      });

      expect(result.yourShare).toBeGreaterThan(0);
      expect(result.taxSource).toBe('mixed');
      expect(result.breakdown.taxType).toBe('Mixed (Income Tax + FICA)');
      expect(result.breakdown).toHaveProperty('incomeContribution');
      expect(result.breakdown).toHaveProperty('ficaContribution');

      // Both contributions should be positive
      expect(result.breakdown.incomeContribution).toBeGreaterThan(0);
      expect(result.breakdown.ficaContribution).toBeGreaterThan(0);

      // Sum should equal total share
      expect(result.breakdown.incomeContribution + result.breakdown.ficaContribution)
        .toBeCloseTo(result.yourShare, 2);
    });

    it('applies 60/40 split for Medicare/Medicaid', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000,
        category: 'medicare'
      });

      // Income share is 60% of spending allocation
      // FICA share is 40% of spending allocation
      // Total individual income tax revenue is $2.4 trillion
      // Total payroll tax revenue is $1.7 trillion
      const incomeShare = (testTaxes.incomeTax / 2_400_000_000_000) *
                          1_000_000_000 * 0.60;
      const ficaShare = (testTaxes.ficaTax / 1_700_000_000_000) *
                        1_000_000_000 * 0.40;

      expect(result.breakdown.incomeContribution).toBeCloseTo(incomeShare, 2);
      expect(result.breakdown.ficaContribution).toBeCloseTo(ficaShare, 2);
    });
  });

  describe('result properties', () => {
    it('includes all expected properties in result', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000,
        category: 'defense'
      });

      expect(result).toHaveProperty('yourShare');
      expect(result).toHaveProperty('spendingAmount');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('taxSource');
      expect(result).toHaveProperty('budgetPool');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('exceedsBudget');
      expect(result).toHaveProperty('deficitNote');
    });

    it('flags when spending exceeds budget pool', () => {
      // Defense budget is $872 billion
      const bigSpending = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000_000, // $1 trillion (exceeds defense budget)
        category: 'defense'
      });

      expect(bigSpending.exceedsBudget).toBe(true);

      const smallSpending = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000, // $1 million
        category: 'defense'
      });

      expect(smallSpending.exceedsBudget).toBe(false);
    });

    it('includes deficit note', () => {
      const result = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000,
        category: 'defense'
      });

      expect(result.deficitNote).toContain('26%');
      expect(result.deficitNote).toContain('deficit');
    });
  });

  describe('proportionality', () => {
    it('share scales linearly with spending amount', () => {
      const share1 = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000,
        category: 'defense'
      });

      const share2 = context.calculateShare({
        incomeTax: testTaxes.incomeTax,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 2_000_000_000,
        category: 'defense'
      });

      expect(share2.yourShare).toBeCloseTo(share1.yourShare * 2, 2);
    });

    it('share scales linearly with income tax paid', () => {
      const lowTaxShare = context.calculateShare({
        incomeTax: 5000,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000,
        category: 'defense'
      });

      const highTaxShare = context.calculateShare({
        incomeTax: 10000,
        ficaTax: testTaxes.ficaTax,
        spendingAmount: 1_000_000_000,
        category: 'defense'
      });

      expect(highTaxShare.yourShare).toBeCloseTo(lowTaxShare.yourShare * 2, 2);
    });
  });
});

// ============================================================================
// getComparison() Tests
// ============================================================================

describe('getComparison', () => {
  const annualTax = 20000; // Use $20k annual tax for {days} calculations

  it('returns "Less than a penny" for amounts under $0.01', () => {
    expect(context.getComparison(0.005, annualTax)).toBe('Less than a penny');
    expect(context.getComparison(0.001, annualTax)).toBe('Less than a penny');
  });

  it('returns cents text for amounts $0.01-$0.10', () => {
    const result = context.getComparison(0.05, annualTax);
    expect(result).toContain('cents');
    expect(result).toContain('5'); // Should show 5 cents
  });

  it('returns cents text for amounts $0.10-$1.00', () => {
    const result = context.getComparison(0.75, annualTax);
    expect(result).toContain('cents');
    expect(result).toContain('75'); // Should show 75 cents
  });

  it('returns coffee comparison for $1-$5', () => {
    expect(context.getComparison(3.50, annualTax)).toContain('coffee');
  });

  it('returns fast food comparison for $5-$15', () => {
    expect(context.getComparison(10, annualTax)).toContain('fast food');
  });

  it('returns movie ticket comparison for $15-$25', () => {
    expect(context.getComparison(20, annualTax)).toContain('movie ticket');
  });

  it('returns tank of gas comparison for $25-$75', () => {
    expect(context.getComparison(50, annualTax)).toContain('tank of gas');
  });

  it('returns dinner comparison for $75-$150', () => {
    expect(context.getComparison(100, annualTax)).toContain('dinner');
  });

  it('returns utility bill comparison for $150-$500', () => {
    expect(context.getComparison(300, annualTax)).toContain('utility bill');
  });

  it('returns days of tax for amounts over $500', () => {
    const result = context.getComparison(1000, annualTax);
    expect(result).toContain('days');
    // $1000 / ($20000/365) = $1000 / $54.79 = ~18 days
    expect(result).toContain('18');
  });

  it('calculates days correctly based on annual tax', () => {
    // Daily tax = $20000 / 365 = $54.79
    // Share of $548 = 10 days
    const result = context.getComparison(548, annualTax);
    expect(result).toContain('10');
    expect(result).toContain('days');
  });

  it('handles zero annual tax gracefully', () => {
    const result = context.getComparison(1000, 0);
    expect(result).toContain('0 days');
  });

  it('handles boundary values correctly', () => {
    // Exactly at boundary between tiers
    expect(context.getComparison(5, annualTax)).toContain('fast food'); // 5 is < max of coffee tier, so should be next tier
    expect(context.getComparison(4.99, annualTax)).toContain('coffee');
  });
});

// ============================================================================
// formatCurrency() Tests
// ============================================================================

describe('formatCurrency', () => {
  it('formats small amounts with cents', () => {
    expect(context.formatCurrency(5.50)).toBe('$5.50');
    expect(context.formatCurrency(0.99)).toBe('$0.99');
    expect(context.formatCurrency(50.00)).toBe('$50.00');
  });

  it('formats amounts >= $100 without cents by default', () => {
    expect(context.formatCurrency(100)).toBe('$100');
    expect(context.formatCurrency(999.99)).toBe('$1,000');
    expect(context.formatCurrency(1234)).toBe('$1,234');
  });

  it('respects showCents parameter for small amounts', () => {
    expect(context.formatCurrency(50, true)).toBe('$50.00');
    expect(context.formatCurrency(50, false)).toBe('$50');
  });

  it('formats large numbers with commas', () => {
    expect(context.formatCurrency(1000000)).toBe('$1,000,000');
    expect(context.formatCurrency(1234567890)).toBe('$1,234,567,890');
  });

  it('handles zero', () => {
    expect(context.formatCurrency(0)).toBe('$0.00');
    expect(context.formatCurrency(0, false)).toBe('$0');
  });

  it('handles negative amounts', () => {
    expect(context.formatCurrency(-50)).toBe('-$50.00');
    // Negative amounts >= $100 in absolute value still show cents due to the condition check
    expect(context.formatCurrency(-1000)).toBe('-$1,000.00');
  });
});

// ============================================================================
// formatLargeNumber() Tests
// ============================================================================

describe('formatLargeNumber', () => {
  it('formats trillions correctly', () => {
    expect(context.formatLargeNumber(1_000_000_000_000)).toBe('$1.0 trillion');
    expect(context.formatLargeNumber(1_400_000_000_000)).toBe('$1.4 trillion');
    expect(context.formatLargeNumber(6_800_000_000_000)).toBe('$6.8 trillion');
  });

  it('formats billions correctly', () => {
    expect(context.formatLargeNumber(1_000_000_000)).toBe('$1.0 billion');
    expect(context.formatLargeNumber(13_300_000_000)).toBe('$13.3 billion');
    expect(context.formatLargeNumber(500_000_000_000)).toBe('$500.0 billion');
  });

  it('formats millions correctly', () => {
    expect(context.formatLargeNumber(1_000_000)).toBe('$1.0 million');
    expect(context.formatLargeNumber(50_000_000)).toBe('$50.0 million');
    expect(context.formatLargeNumber(999_000_000)).toBe('$999.0 million');
  });

  it('falls back to formatCurrency for smaller amounts', () => {
    expect(context.formatLargeNumber(999_999)).toBe('$999,999');
    expect(context.formatLargeNumber(100_000)).toBe('$100,000');
    expect(context.formatLargeNumber(1000)).toBe('$1,000');
  });

  it('handles edge cases at boundaries', () => {
    // Just under trillion
    expect(context.formatLargeNumber(999_999_999_999)).toBe('$1000.0 billion');
    // Just at trillion
    expect(context.formatLargeNumber(1_000_000_000_000)).toBe('$1.0 trillion');
  });
});

// ============================================================================
// parseCurrencyInput() Tests
// ============================================================================

describe('parseCurrencyInput', () => {
  it('parses plain numbers', () => {
    expect(context.parseCurrencyInput('1000')).toBe(1000);
    expect(context.parseCurrencyInput('50000')).toBe(50000);
  });

  it('parses numbers with dollar sign', () => {
    expect(context.parseCurrencyInput('$1000')).toBe(1000);
    expect(context.parseCurrencyInput('$50000')).toBe(50000);
  });

  it('parses numbers with commas', () => {
    expect(context.parseCurrencyInput('1,000')).toBe(1000);
    expect(context.parseCurrencyInput('1,000,000')).toBe(1000000);
    expect(context.parseCurrencyInput('$1,234,567')).toBe(1234567);
  });

  it('parses numbers with decimal points', () => {
    expect(context.parseCurrencyInput('1000.50')).toBe(1000.5);
    expect(context.parseCurrencyInput('$1,234.56')).toBe(1234.56);
  });

  it('handles invalid input gracefully', () => {
    expect(context.parseCurrencyInput('')).toBe(0);
    expect(context.parseCurrencyInput('abc')).toBe(0);
    expect(context.parseCurrencyInput('$')).toBe(0);
  });

  it('handles mixed valid/invalid characters', () => {
    expect(context.parseCurrencyInput('$1,000 dollars')).toBe(1000);
    expect(context.parseCurrencyInput('about $50k')).toBe(50);
  });

  it('handles whitespace', () => {
    expect(context.parseCurrencyInput('  1000  ')).toBe(1000);
    expect(context.parseCurrencyInput(' $ 1,000 ')).toBe(1000);
  });
});

// ============================================================================
// Integration Tests - Real-World Scenarios
// ============================================================================

describe('Integration: Real-World Scenarios', () => {
  it('calculates correct share for median income earner ($60k)', () => {
    const income = 60000;
    const incomeTax = context.calculateIncomeTax(income, 'single');
    const fica = context.calculateFICA(income, 'single');

    // James Webb Telescope cost: $10 billion
    const result = context.calculateShare({
      incomeTax,
      ficaTax: fica.total,
      spendingAmount: 10_000_000_000,
      category: 'general'
    });

    // Should be a small but non-zero amount
    expect(result.yourShare).toBeGreaterThan(0);
    expect(result.yourShare).toBeLessThan(100); // Definitely under $100
  });

  it('calculates correct share for high income earner ($500k)', () => {
    const income = 500000;
    const incomeTax = context.calculateIncomeTax(income, 'single');
    const fica = context.calculateFICA(income, 'single');

    // Gerald R. Ford Carrier: $13.3 billion
    const result = context.calculateShare({
      incomeTax,
      ficaTax: fica.total,
      spendingAmount: 13_300_000_000,
      category: 'defense'
    });

    // High income = larger share
    expect(result.yourShare).toBeGreaterThan(100);
  });

  it('married vs single filing produces different shares', () => {
    const income = 150000;

    const singleTax = context.calculateIncomeTax(income, 'single');
    const marriedTax = context.calculateIncomeTax(income, 'married');
    const fica = context.calculateFICA(income, 'single'); // FICA same for both

    const singleShare = context.calculateShare({
      incomeTax: singleTax,
      ficaTax: fica.total,
      spendingAmount: 1_000_000_000,
      category: 'defense'
    });

    const marriedShare = context.calculateShare({
      incomeTax: marriedTax,
      ficaTax: fica.total,
      spendingAmount: 1_000_000_000,
      category: 'defense'
    });

    // Married pays less income tax, so smaller share of income-tax funded spending
    expect(marriedShare.yourShare).toBeLessThan(singleShare.yourShare);
  });

  it('provides appropriate comparison text for various share amounts', () => {
    const incomes = [30000, 75000, 150000, 500000];

    for (const income of incomes) {
      const incomeTax = context.calculateIncomeTax(income, 'single');
      const fica = context.calculateFICA(income, 'single');

      const result = context.calculateShare({
        incomeTax,
        ficaTax: fica.total,
        spendingAmount: 10_000_000_000, // $10 billion
        category: 'defense'
      });

      const comparison = context.getComparison(result.yourShare, incomeTax + fica.total);

      // Should get a non-empty, meaningful comparison
      expect(comparison).toBeTruthy();
      expect(comparison.length).toBeGreaterThan(5);
    }
  });

  it('Social Security share uses FICA, not income tax', () => {
    const income = 100000;
    const incomeTax = context.calculateIncomeTax(income, 'single');
    const fica = context.calculateFICA(income, 'single');

    // Test with wildly different tax amounts to verify correct source is used
    const resultWithHighIncome = context.calculateShare({
      incomeTax: 50000, // Higher income tax
      ficaTax: 5000,     // Lower FICA
      spendingAmount: 1_000_000_000,
      category: 'socialSecurity'
    });

    const resultWithHighFICA = context.calculateShare({
      incomeTax: 5000,   // Lower income tax
      ficaTax: 50000,    // Higher FICA (impossible in reality, but for testing)
      spendingAmount: 1_000_000_000,
      category: 'socialSecurity'
    });

    // Higher FICA should mean higher Social Security share
    expect(resultWithHighFICA.yourShare).toBeGreaterThan(resultWithHighIncome.yourShare);

    // Verify breakdown shows FICA, not income tax
    expect(resultWithHighFICA.breakdown.taxType).toBe('Payroll Tax (FICA)');
  });
});
