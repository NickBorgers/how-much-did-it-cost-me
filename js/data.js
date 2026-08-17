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
    label: 'Total Cost of the Iran War',
    value: 113_300_000_000,          // $113.3 billion (108-day war tally based on Pentagon briefings to Congress)
    source: 'Washington Post / Pentagon briefings to Congress',
    sourceUrl: 'https://www.washingtonpost.com/world/2026/08/07/cost-iran-war-is-mounting-heres-latest-tally/',
    lastVerified: '2026-08-17',
    category: 'defense',
    notes: 'Running tally published August 7, 2026 puts the 108-day war (Feb 26 - Jun 14) at $113.3B; the figure is hotly disputed - CSIS estimates only $34-42B in direct military costs and Hegseth told the Senate $37.5B, while the Pentagon still asked Congress for an $87.6B supplemental'
  },
  trending2: {
    label: 'Funding Blocked by the White House',
    value: 410_000_000_000,          // $410 billion (Democrats' impoundment tracker total)
    source: 'House Appropriations Committee Democrats / Sen. Patty Murray',
    sourceUrl: 'https://democrats-appropriations.house.gov/news/press-releases/new-weeks-away-end-fiscal-year-trump-blocking-410-billion-funding-owed',
    lastVerified: '2026-08-17',
    category: 'general',
    notes: 'With weeks left in FY2026, Reps. DeLauro and Sen. Murray say OMB Director Russ Vought is withholding $410B+ that Congress already appropriated; the administration says it is lawful impoundment, GAO has repeatedly ruled otherwise - this is a running Democratic tally, not an audited figure'
  },
  trending3: {
    label: 'Fraud-Risk Federal Money Run Through States',
    value: 1_100_000_000_000,        // $1.1 trillion (FY2025 spending in the 20 largest state-administered federal programs)
    source: 'Government Accountability Office',
    sourceUrl: 'https://www.gao.gov/fraud-improper-payments',
    lastVerified: '2026-08-17',
    category: 'general',
    notes: 'An August 7, 2026 GAO report found substantial fraud risk across the 20 largest state-administered federal programs - Medicaid, SNAP, disaster relief and more - covering $1.1T of FY2025 spending, with only five having documented fraud controls; this is money at risk, not money proven lost (GAO puts actual government-wide fraud at $233B-$521B a year)'
  },
  trending4: {
    label: 'Tariff Refunds Paid Back to Importers',
    value: 100_000_000_000,          // $100 billion (refunded as of an August 2026 court filing)
    source: 'NBC News / U.S. government court filing',
    sourceUrl: 'https://www.nbcnews.com/news/us-news/trump-administration-refunded-100-billion-tariffs-struck-supreme-court-rcna591099',
    lastVerified: '2026-08-17',
    category: 'general',
    notes: 'An August 2026 court filing shows Treasury has refunded about $100B of the $166B in IEEPA tariffs the Supreme Court struck down in February 2026; the refunds are a major reason CBO just raised the FY2026 deficit to $2.1T'
  },
  trending5: {
    label: 'White House Ballroom Project',
    value: 600_000_000,              // $600 million (contractor's March 2026 total project estimate)
    source: 'USA Today / House Appropriations Committee Democrats',
    sourceUrl: 'https://democrats-appropriations.house.gov/news/press-releases/trump-administration-spent-tens-millions-taxpayer-funds-ballroom-and-then-lied',
    lastVerified: '2026-08-17',
    category: 'general',
    notes: 'The contractor pegged the total at $600M+, with more than half traced to government sources despite claims it is "taxpayer-free"; Sens. Murray and Murphy have asked GAO to investigate a transfer of nearly $397M in Secret Service funds, arguing the reconciliation law barred spending it this way'
  },
  trending6: {
    label: 'Automatic Medicare Cuts (PAYGO Sequester)',
    value: 536_000_000_000,          // $536 billion (projected automatic Medicare reductions over nine years)
    source: 'Sen. Sheldon Whitehouse / Congressional Budget Office',
    sourceUrl: 'https://www.whitehouse.senate.gov/news/release/trumps-big-beautiful-for-billionaires-law-triggers-536-billion-cut-to-medicare-over-next-decade/',
    lastVerified: '2026-08-17',
    category: 'medicare',
    notes: 'Because the 2025 reconciliation law added to the deficit, statutory PAYGO triggers automatic Medicare reductions - $45B in 2026 and $536B over nine years; supporters call it a spending cut, critics call it a benefit cut Congress never voted on directly',
    isSavings: true
  },
  trending7: {
    label: 'Troop Deployments to U.S. Cities',
    value: 1_100_000_000,            // $1.1 billion (CBO estimate for calendar year 2026 if deployments continue)
    source: 'Congressional Budget Office (via Senate Budget Committee)',
    sourceUrl: 'https://www.cbo.gov/publication/61943',
    lastVerified: '2026-08-17',
    category: 'defense',
    notes: 'CBO says National Guard and Marine deployments to six cities cost $496M through December 2025 and would reach roughly $1.1B across 2026 if they continue as directed; deploying 1,000 troops to a city runs $18M-$21M a month'
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
