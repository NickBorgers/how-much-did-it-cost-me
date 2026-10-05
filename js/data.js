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
    label: 'Pentagon FY2027 Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (administration's FY2027 defense request)
    source: 'The Hill / NPR / Mother Jones',
    sourceUrl: 'https://thehill.com/policy/defense/6110595-pentagon-trump-budget-briefings-senate/',
    lastVerified: '2026-10-05',
    category: 'defense',
    notes: 'A ~50% jump that would be the first $1.5T defense budget ever - more, inflation-adjusted, than the WWII peak; the Pentagon ramped up closed-door Senate briefings on Oct 1, 2026 and GOP senators say the push came too late; critics argue the true military total is $1T higher once non-Pentagon accounts are counted'
  },
  trending2: {
    label: 'Pentagon September "Use-It-or-Lose-It" Spree',
    value: 93_400_000_000,           // $93.4 billion (single-month September obligations)
    source: 'Open The Books (watchdog report)',
    sourceUrl: 'https://www.foxla.com/news/pete-hegseth-pentagon-lobster-spending-93-billion',
    lastVerified: '2026-10-05',
    category: 'defense',
    notes: '"Lobstergate" - the Pentagon burned $93.4B in a single September to avoid losing the money, the biggest September since at least 2008; receipts include $15.1M of ribeye, $6.9M of lobster tail, $2M of king crab and $124K of ice cream machines, landing awkwardly next to the administration\'s efficiency push'
  },
  trending3: {
    label: 'Interest on the National Debt (FY2026)',
    value: 1_100_000_000_000,        // $1.1 trillion (full-year FY2026 net interest)
    source: 'Committee for a Responsible Federal Budget',
    sourceUrl: 'https://www.crfb.org/blogs/us-ran-2-trillion-deficit-last-year-we-estimate',
    lastVerified: '2026-10-05',
    category: 'interest',
    notes: 'FY2026 closed Sept 30 with a $2.0T deficit (6.2% of GDP) and a record $1.1T in interest - 3.4% of GDP, now the second largest line item in the budget, ahead of both defense and Medicare; debt held by the public hit ~$32.3T, or 100% of GDP'
  },
  trending4: {
    label: 'Federal Funding Blocked by Impoundment',
    value: 410_000_000_000,          // $410 billion (appropriated funds being withheld)
    source: 'Senate Appropriations Committee Democrats (Sen. Patty Murray)',
    sourceUrl: 'https://www.murray.senate.gov/new-weeks-away-from-end-of-fiscal-year-trump-is-blocking-410-billion-dollars-in-funding-owed-to-communities-nationwide/',
    lastVerified: '2026-10-05',
    category: 'general',
    notes: 'Democratic appropriators tally at least $410B in appropriated money the White House and OMB are sitting on; California and six other states sued Trump and OMB Director Russ Vought in early October 2026 over the impoundments. The figure is a minority-staff count, not an audited total'
  },
  trending5: {
    label: 'Health Care Fraud Loss Estimate',
    value: 521_000_000_000,          // $521 billion (upper-bound annual federal fraud estimate)
    source: 'House Energy & Commerce Committee report (citing GAO)',
    sourceUrl: 'https://www.foxnews.com/politics/bombshell-report-exposes-healthcare-fraud-schemes-taxpayers-lose-521-billion-annually',
    lastVerified: '2026-10-05',
    category: 'medicare',
    notes: 'A Sept 29, 2026 House E&C report pegged losses at up to $521B a year - "$1 million a minute" - and 14 GOP anti-fraud bills followed. The number is badly stretched: GAO\'s 2024 estimate of $233B-$521B covers ALL federal programs, not just Medicare and Medicaid'
  },
  trending6: {
    label: 'White House Ballroom Project',
    value: 600_000_000,              // $600 million (contractor's internal full-project estimate)
    source: 'Leaked Clark Construction estimate / House Appropriations Democrats',
    sourceUrl: 'https://democrats-appropriations.house.gov/news/press-releases/trump-administration-spent-tens-millions-taxpayer-funds-ballroom-and-then-lied',
    lastVerified: '2026-10-05',
    category: 'general',
    notes: 'Public price tags have run from $200M to $1B; a leaked contractor summary puts the full bill at $600M with just under half from private sources, leaving ~$307M on taxpayers via the Secret Service ($155M), White House Military Office ($149M) and Executive Residence ($3M) - despite repeated claims that it costs taxpayers nothing'
  },
  trending7: {
    label: 'Pocket Rescission (Claimed Savings)',
    value: 810_000_000,              // $810 million (funds cancelled 5 days before fiscal year end)
    source: 'Office of Management and Budget (via ABC News)',
    sourceUrl: 'https://abcnews.com/Politics/white-house-orders-800m-funds-rescinded-collins-calls/story?id=136772703',
    lastVerified: '2026-10-05',
    category: 'general',
    notes: 'OMB cancelled $810M on Sept 25, 2026 - five days before the money expired, so Congress had no time to vote it down; it hit HHS and DHS programs including refugee services and aid for unaccompanied minors. GAO and Senate Appropriations Chair Susan Collins (R) both call the maneuver an unlawful impoundment, and it is now in court',
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
