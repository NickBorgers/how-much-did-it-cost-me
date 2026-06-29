// data.js - FY 2024 Federal Tax and Budget Data
// Sources: IRS, CBO, Tax Foundation, U.S. Treasury Fiscal Data

const DATA_YEAR = 2024;
const DATA_LAST_UPDATED = '2025-01-10';  // Updated verification date

// Standard Deductions (2024)
const STANDARD_DEDUCTIONS = {
  single: 14600,
  married: 29200
};

// Federal Income Tax Brackets (2024)
const TAX_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 }
  ]
};

// FICA (Payroll Tax) Rates (2024)
const FICA = {
  socialSecurity: {
    rate: 0.062,           // 6.2% employee portion
    wageBase: 168600       // Maximum wages subject to SS tax
  },
  medicare: {
    rate: 0.0145,          // 1.45% employee portion
    additionalRate: 0.009, // 0.9% additional Medicare tax
    additionalThreshold: {
      single: 200000,
      married: 250000
    }
  }
};

// FY 2024 Federal Budget (in dollars)
const FEDERAL_BUDGET = {
  revenue: {
    total: 4_900_000_000_000,              // $4.9 trillion
    individualIncomeTax: 2_400_000_000_000, // $2.4 trillion
    payrollTax: 1_700_000_000_000,          // $1.7 trillion (FICA)
    corporateTax: 500_000_000_000,          // $0.5 trillion
    other: 300_000_000_000                  // $0.3 trillion
  },
  spending: {
    total: 6_800_000_000_000,               // $6.8 trillion
    socialSecurity: 1_400_000_000_000,      // $1.4 trillion
    medicareMedicaid: 1_700_000_000_000,    // $1.7 trillion
    defense: 900_000_000_000,               // $0.9 trillion
    otherDiscretionary: 900_000_000_000,    // $0.9 trillion
    otherMandatory: 1_000_000_000_000,      // $1.0 trillion
    netInterest: 900_000_000_000            // $0.9 trillion
  },
  deficit: 1_900_000_000_000                // $1.9 trillion (~28% of spending)
};

// Funding source categories for the selector
const FUNDING_CATEGORIES = {
  defense: {
    name: 'Defense & Military',
    examples: 'Pentagon, weapons systems, military bases, VA healthcare & benefits',
    taxSource: 'income',
    budgetPool: FEDERAL_BUDGET.spending.defense,
    revenuePool: FEDERAL_BUDGET.revenue.individualIncomeTax
  },
  general: {
    name: 'General Government',
    examples: 'SNAP, WIC, TANF, child care (CCAP/CCDBG), education grants, housing assistance, transportation, federal agencies, research',
    taxSource: 'income',
    budgetPool: FEDERAL_BUDGET.spending.otherDiscretionary + FEDERAL_BUDGET.spending.otherMandatory,
    revenuePool: FEDERAL_BUDGET.revenue.individualIncomeTax
  },
  socialSecurity: {
    name: 'Social Security',
    examples: 'Retirement benefits, disability (SSDI), survivors benefits',
    taxSource: 'fica',
    budgetPool: FEDERAL_BUDGET.spending.socialSecurity,
    revenuePool: FEDERAL_BUDGET.revenue.payrollTax
  },
  medicare: {
    name: 'Medicare & Medicaid',
    examples: 'Medicare, Medicaid, CHIP, ACA marketplace subsidies',
    taxSource: 'mixed',
    budgetPool: FEDERAL_BUDGET.spending.medicareMedicaid,
    // Mixed: ~60% from general funds, ~40% from payroll
    incomeSharePercent: 0.60,
    ficaSharePercent: 0.40,
    revenuePool: FEDERAL_BUDGET.revenue.individualIncomeTax * 0.6 + FEDERAL_BUDGET.revenue.payrollTax * 0.4
  },
  interest: {
    name: 'Interest on Debt',
    examples: 'Treasury bond payments, debt service',
    taxSource: 'income',
    budgetPool: FEDERAL_BUDGET.spending.netInterest,
    revenuePool: FEDERAL_BUDGET.revenue.individualIncomeTax
  }
};

// Tangible comparisons for result display
const COMPARISONS = [
  { max: 0.01, text: 'Less than a penny' },
  { max: 0.10, text: 'About {cents} cents' },
  { max: 1.00, text: 'About {cents} cents' },
  { max: 5.00, text: 'About the cost of a coffee' },
  { max: 15.00, text: 'About the cost of a fast food meal' },
  { max: 25.00, text: 'About the cost of a movie ticket' },
  { max: 75.00, text: 'About the cost of a tank of gas' },
  { max: 150.00, text: 'About the cost of a nice dinner out' },
  { max: 500.00, text: 'About the cost of a monthly utility bill' },
  { max: Infinity, text: 'About {days} days of your annual tax contribution' }
];

// Permanent Spending Items - These always appear on the list
// Classic examples of major federal spending projects
const PERMANENT_SPENDING = {
  geraldRFordCarrier: {
    label: 'Gerald R. Ford Aircraft Carrier',
    value: 13_300_000_000,           // $13.3 billion (USS Gerald R. Ford total program cost)
    source: 'Congressional Research Service',
    sourceUrl: 'https://crsreports.congress.gov/product/pdf/RS/RS20643',
    lastVerified: DATA_LAST_UPDATED,
    category: 'defense',
    notes: 'Total acquisition cost for lead ship CVN-78',
    multiYear: true                  // Spent over construction period, not in one year
  },
  jamesWebbTelescope: {
    label: 'James Webb Space Telescope',
    value: 10_000_000_000,           // $10 billion (total development cost)
    source: 'NASA',
    sourceUrl: 'https://www.nasa.gov/mission_pages/webb/about/index.html',
    lastVerified: DATA_LAST_UPDATED,
    category: 'general',
    notes: 'Total lifecycle development cost',
    multiYear: true                  // Spent over development period, not in one year
  }
};

// Trending Spending Items - Updated weekly by the trending-spending workflow
// These rotate based on what federal spending stories are in the news
// The workflow searches for spending scandals, controversies, and hot topics
const TRENDING_SPENDING = {
  trending1: {
    label: 'Trump FY2027 Defense Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 defense budget)
    source: 'The Washington Post / Center for American Progress',
    sourceUrl: 'https://www.washingtonpost.com/national-security/2026/04/21/pentagon-15-trillion-budget-details/',
    lastVerified: '2026-06-29',
    category: 'defense',
    notes: 'Largest defense request in history (~50% jump); $1.15T base + $350B resting on a third reconciliation bill; largest defense increase since the Korean War; a Democratic amendment to cut $150B failed 25-31 but signaled a rare showdown over Pentagon size'
  },
  trending2: {
    label: 'Secure America Act - ICE & Border Funding',
    value: 69_500_000_000,           // $69.5 billion (ICE + CBP funding through 2029)
    source: 'Federal News Network / American Immigration Council',
    sourceUrl: 'https://federalnewsnetwork.com/congress/2026/06/a-stretch-of-capitol-hill-work-is-shifting-from-debate-to-decisions/',
    lastVerified: '2026-06-29',
    category: 'general',
    notes: 'Signed June 10, 2026; ~$69.5B for ICE and CBP through 2029 ($38.5B to ICE, $26B to CBP) via reconciliation; passed House 214-212; routes spending around the regular appropriations process; on top of $75B ICE received in the 2025 reconciliation bill'
  },
  trending3: {
    label: 'Federal Improper Payments (FY2025)',
    value: 186_000_000_000,          // $186 billion (estimated improper payments FY2025)
    source: 'U.S. Government Accountability Office / Washington Times',
    sourceUrl: 'https://www.washingtontimes.com/news/2026/jun/6/federal-agencies-made-186-billion-improper-payments-last-year/',
    lastVerified: '2026-06-29',
    category: 'general',
    notes: 'GAO: agencies made an estimated $186B in improper payments in FY2025 (up ~$24B); mostly overpayments to ineligible recipients; ~$3T in payment errors since 2003; Medicare, Medicaid, EITC and SNAP led the list'
  },
  trending4: {
    label: 'ACA Enhanced Subsidies Expired',
    value: 31_000_000_000,           // $31 billion (CBO cost to restore the expired enhanced premium tax credits)
    source: 'NPR / CBO / KFF',
    sourceUrl: 'https://www.npr.org/2026/06/26/nx-s1-5860746/aca-health-insurance-subsidies-rates-premiums',
    lastVerified: '2026-06-29',
    category: 'medicare',
    notes: 'Enhanced ACA premium tax credits expired end of 2025; ~5M people dropped marketplace coverage as premiums roughly doubled; CBO pegs the cost to restore the credits at ~$31B/yr (~$335B over 10 years) - a live budget fight in Congress'
  },
  trending5: {
    label: '2026 Health Care Fraud Takedown',
    value: 6_500_000_000,            // $6.5 billion (alleged fraud in the 2026 national takedown)
    source: 'U.S. Department of Justice',
    sourceUrl: 'https://www.justice.gov/opa/pr/national-health-care-fraud-takedown-results-455-defendants-charged-connection-over-65',
    lastVerified: '2026-06-29',
    category: 'medicare',
    notes: 'DOJ charged 455 defendants (including 90 doctors) across 56 districts over $6.5B in alleged Medicare/Medicaid fraud and opioid schemes; over $182M in cash and luxury assets seized; the most state Medicaid units ever to participate'
  },
  trending6: {
    label: 'Annual Interest on the National Debt',
    value: 1_200_000_000_000,        // ~$1.2 trillion (annual net interest on the federal debt)
    source: 'NPR / CBS News / Committee for a Responsible Federal Budget',
    sourceUrl: 'https://www.npr.org/2026/05/02/nx-s1-5807628/federal-debt-exceeds-39-trillion-for-the-1st-time-why-is-this-milestone-significant',
    lastVerified: '2026-06-29',
    category: 'interest',
    notes: 'Total national debt topped $39.28T and publicly held debt briefly exceeded the entire U.S. economy (100%+ of GDP) for the first time since WWII; interest on the debt now runs more than $1 trillion a year, crowding out other spending'
  },
  trending7: {
    label: 'DOGE Claimed Savings (Disputed)',
    value: 170_000_000_000,          // $170 billion (DOGE claimed total savings)
    source: 'DOGE.gov / NPR / CBS News',
    sourceUrl: 'https://doge.gov/savings',
    lastVerified: '2026-06-29',
    category: 'general',
    notes: 'DOGE claims ~$170B saved but only ~$70.9B is itemized; NPR estimates real savings near $2B and AEI puts it around $80B; "wall of receipts" riddled with documented errors (an $8M ICE contract listed as $8B, a $560K contract listed as $232M)',
    isSavings: true
  }
};

// Combined for backwards compatibility
const NOTABLE_SPENDING = {
  ...PERMANENT_SPENDING,
  ...TRENDING_SPENDING
};

// Example spending amounts for the chips
// Permanent items first (always shown), then trending items (updated weekly)
const EXAMPLE_AMOUNTS = [
  // Permanent spending items - always on the list
  { label: PERMANENT_SPENDING.jamesWebbTelescope.label, value: PERMANENT_SPENDING.jamesWebbTelescope.value, category: PERMANENT_SPENDING.jamesWebbTelescope.category, multiYear: PERMANENT_SPENDING.jamesWebbTelescope.multiYear },
  { label: PERMANENT_SPENDING.geraldRFordCarrier.label, value: PERMANENT_SPENDING.geraldRFordCarrier.value, category: PERMANENT_SPENDING.geraldRFordCarrier.category, multiYear: PERMANENT_SPENDING.geraldRFordCarrier.multiYear },
  // Trending spending items - rotated weekly based on news
  { label: TRENDING_SPENDING.trending1.label, value: TRENDING_SPENDING.trending1.value, category: TRENDING_SPENDING.trending1.category, multiYear: TRENDING_SPENDING.trending1.multiYear, isSavings: TRENDING_SPENDING.trending1.isSavings },
  { label: TRENDING_SPENDING.trending2.label, value: TRENDING_SPENDING.trending2.value, category: TRENDING_SPENDING.trending2.category, multiYear: TRENDING_SPENDING.trending2.multiYear, isSavings: TRENDING_SPENDING.trending2.isSavings },
  { label: TRENDING_SPENDING.trending3.label, value: TRENDING_SPENDING.trending3.value, category: TRENDING_SPENDING.trending3.category, multiYear: TRENDING_SPENDING.trending3.multiYear, isSavings: TRENDING_SPENDING.trending3.isSavings },
  { label: TRENDING_SPENDING.trending4.label, value: TRENDING_SPENDING.trending4.value, category: TRENDING_SPENDING.trending4.category, multiYear: TRENDING_SPENDING.trending4.multiYear, isSavings: TRENDING_SPENDING.trending4.isSavings },
  { label: TRENDING_SPENDING.trending5.label, value: TRENDING_SPENDING.trending5.value, category: TRENDING_SPENDING.trending5.category, multiYear: TRENDING_SPENDING.trending5.multiYear, isSavings: TRENDING_SPENDING.trending5.isSavings },
  { label: TRENDING_SPENDING.trending6.label, value: TRENDING_SPENDING.trending6.value, category: TRENDING_SPENDING.trending6.category, multiYear: TRENDING_SPENDING.trending6.multiYear, isSavings: TRENDING_SPENDING.trending6.isSavings },
  { label: TRENDING_SPENDING.trending7.label, value: TRENDING_SPENDING.trending7.value, category: TRENDING_SPENDING.trending7.category, multiYear: TRENDING_SPENDING.trending7.multiYear, isSavings: TRENDING_SPENDING.trending7.isSavings }
];
