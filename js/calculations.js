// calculations.js - Tax and share calculation functions

/**
 * Calculate federal income tax using progressive brackets
 * @param {number} grossIncome - Annual gross income
 * @param {string} filingStatus - 'single' or 'married'
 * @returns {number} Federal income tax amount
 */
function calculateIncomeTax(grossIncome, filingStatus = 'single') {
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);
  const brackets = TAX_BRACKETS[filingStatus];

  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousMax) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - previousMax;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }
    previousMax = bracket.max;
  }

  return tax;
}

/**
 * Calculate FICA (payroll) taxes
 * @param {number} grossIncome - Annual gross income
 * @param {string} filingStatus - 'single' or 'married'
 * @returns {object} Social Security and Medicare tax amounts
 */
function calculateFICA(grossIncome, filingStatus = 'single') {
  // Social Security (capped at wage base)
  const ssWages = Math.min(grossIncome, FICA.socialSecurity.wageBase);
  const socialSecurityTax = ssWages * FICA.socialSecurity.rate;

  // Medicare (no cap, but additional tax above threshold)
  let medicareTax = grossIncome * FICA.medicare.rate;
  const additionalThreshold = FICA.medicare.additionalThreshold[filingStatus];
  if (grossIncome > additionalThreshold) {
    medicareTax += (grossIncome - additionalThreshold) * FICA.medicare.additionalRate;
  }

  return {
    socialSecurity: socialSecurityTax,
    medicare: medicareTax,
    total: socialSecurityTax + medicareTax
  };
}

/**
 * Calculate user's share of a given spending amount
 * @param {object} params - Calculation parameters
 * @param {number} params.incomeTax - User's federal income tax
 * @param {number} params.ficaTax - User's total FICA tax
 * @param {number} params.spendingAmount - The spending amount to calculate share of
 * @param {string} params.category - Funding category key
 * @returns {object} Calculation result with share and breakdown
 */
function calculateShare({ incomeTax, ficaTax, spendingAmount, category }) {
  const categoryData = FUNDING_CATEGORIES[category];

  let yourShare;
  let breakdown = {};

  if (categoryData.taxSource === 'income') {
    // Income tax funded spending
    const proportion = incomeTax / categoryData.revenuePool;
    yourShare = proportion * spendingAmount;
    breakdown = {
      taxType: 'Federal Income Tax',
      yourTax: incomeTax,
      totalRevenue: categoryData.revenuePool,
      proportion: proportion
    };
  } else if (categoryData.taxSource === 'fica') {
    // FICA funded spending (Social Security)
    const proportion = ficaTax / categoryData.revenuePool;
    yourShare = proportion * spendingAmount;
    breakdown = {
      taxType: 'Payroll Tax (FICA)',
      yourTax: ficaTax,
      totalRevenue: categoryData.revenuePool,
      proportion: proportion
    };
  } else if (categoryData.taxSource === 'mixed') {
    // Mixed funding (Medicare/Medicaid)
    const incomeShare = (incomeTax / FEDERAL_BUDGET.revenue.individualIncomeTax) *
                        spendingAmount * categoryData.incomeSharePercent;
    const ficaShare = (ficaTax / FEDERAL_BUDGET.revenue.payrollTax) *
                      spendingAmount * categoryData.ficaSharePercent;
    yourShare = incomeShare + ficaShare;
    breakdown = {
      taxType: 'Mixed (Income Tax + FICA)',
      incomeContribution: incomeShare,
      ficaContribution: ficaShare,
      yourTax: incomeTax + ficaTax,
      proportion: yourShare / spendingAmount
    };
  }

  return {
    yourShare: yourShare,
    spendingAmount: spendingAmount,
    category: categoryData.name,
    taxSource: categoryData.taxSource,
    budgetPool: categoryData.budgetPool,
    breakdown: breakdown,
    exceedsBudget: spendingAmount > categoryData.budgetPool,
    deficitNote: 'About 28% of federal spending is deficit-financed (borrowed), not directly from current taxes.'
  };
}

/**
 * Get a tangible comparison for the calculated share
 * @param {number} share - The calculated share amount
 * @param {number} annualTax - User's annual tax (for days calculation)
 * @returns {string} Human-readable comparison
 */
function getComparison(share, annualTax) {
  for (const comp of COMPARISONS) {
    if (share < comp.max) {
      let text = comp.text;

      // Replace placeholders
      if (text.includes('{cents}')) {
        const cents = Math.round(share * 100);
        text = text.replace('{cents}', cents);
      }
      if (text.includes('{days}')) {
        const dailyTax = annualTax / 365;
        const days = dailyTax > 0 ? Math.round(share / dailyTax) : 0;
        text = text.replace('{days}', days);
      }

      return text;
    }
  }
  return '';
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {boolean} showCents - Whether to show cents
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, showCents = true) {
  if (showCents && amount < 100) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a large number in a readable way (e.g., "$1.4 trillion")
 * @param {number} amount - The amount to format
 * @returns {string} Formatted string
 */
function formatLargeNumber(amount) {
  if (amount >= 1_000_000_000_000) {
    return `$${(amount / 1_000_000_000_000).toFixed(1)} trillion`;
  } else if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)} billion`;
  } else if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)} million`;
  } else {
    return formatCurrency(amount, false);
  }
}

/**
 * Format a proportion in a user-friendly "1 in X" format
 * @param {number} proportion - The proportion as a decimal (e.g., 0.0000000221)
 * @returns {string} Formatted string like "1 in 45 million"
 */
function formatProportion(proportion) {
  if (proportion <= 0) return '0';
  if (proportion >= 1) return '100%';

  const oneInX = Math.round(1 / proportion);

  if (oneInX >= 1_000_000_000) {
    return `1 in ${(oneInX / 1_000_000_000).toFixed(1)} billion`;
  } else if (oneInX >= 1_000_000) {
    return `1 in ${(oneInX / 1_000_000).toFixed(1)} million`;
  } else if (oneInX >= 1_000) {
    return `1 in ${(oneInX / 1_000).toFixed(1)} thousand`;
  } else {
    return `1 in ${oneInX.toLocaleString()}`;
  }
}

/**
 * Parse a currency string to a number
 * @param {string} str - String like "$1,000,000" or "1000000"
 * @returns {number} Parsed number
 */
function parseCurrencyInput(str) {
  // Remove everything except digits and decimal point
  const cleaned = str.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
