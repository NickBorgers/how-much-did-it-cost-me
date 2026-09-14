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
    label: 'FY2027 Pentagon Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (full FY2027 defense request)
    source: 'Air & Space Forces Magazine / CSIS FY27 defense tracker',
    sourceUrl: 'https://www.airandspaceforces.com/congress-cr-pentagon-december-1-5t-budget-request/',
    lastVerified: '2026-09-14',
    category: 'defense',
    notes: 'The first-ever $1.5T defense request - $1.15T in regular appropriations plus $350B through reconciliation. The Sept 1, 2026 continuing resolution froze DoD at $838.5B (44% below the request) through Dec 11, and Congress has yet to act on the $350B piece at all'
  },
  trending2: {
    label: 'Interest on the Debt (10 Months of FY2026)',
    value: 931_000_000_000,          // $931 billion (interest costs through July 2026)
    source: 'Peter G. Peterson Foundation monthly interest tracker (Treasury data)',
    sourceUrl: 'https://www.pgpf.org/programs-and-projects/fiscal-policy/monthly-interest-tracker-national-debt/',
    lastVerified: '2026-09-14',
    category: 'interest',
    notes: '$931B in interest through 10 months of FY2026, up 11% from $842B a year earlier. CBO reported Sept 11 that the 11-month deficit hit $2.0 trillion - already more than all of FY2025 - as gross debt crossed $40 trillion. Interest now outruns the entire defense budget'
  },
  trending3: {
    label: 'DOGE Claimed Savings (GAO Disputed)',
    value: 110_000_000_000,          // $110 billion (savings claimed on the "Wall of Receipts" GAO reviewed)
    source: 'U.S. Government Accountability Office (GAO-26-108615)',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108615',
    lastVerified: '2026-09-14',
    category: 'general',
    notes: 'GAO found the $110B claim inflated and largely unverifiable: ~$34.6B of $61B in "cancelled contract" savings came from contracts never actually terminated, 96% of grant savings could not be verified, and 108 lease cancellations were already underway before DOGE existed. DOGE ended July 4 but still advertises $215B total; Democrats asked Sept 2026 for Musk to testify',
    isSavings: true
  },
  trending4: {
    label: 'Social Security Cash Shortfall (2026)',
    value: 270_000_000_000,          // $270 billion (combined OASDI cash deficit this year)
    source: '2026 Social Security Trustees Report (via CRFB)',
    sourceUrl: 'https://www.crfb.org/papers/analysis-2026-social-security-trustees-report',
    lastVerified: '2026-09-14',
    category: 'socialSecurity',
    notes: 'Trustees project a $270B combined cash deficit in 2026 - benefits paid out exceed payroll taxes collected, with general revenue covering the gap. The retirement (OASI) trust fund is projected insolvent in 2032; the combined funds in 2034. Back in the news as the $40T debt milestone reignites the entitlement fight'
  },
  trending5: {
    label: 'Pentagon September Spending Surge',
    value: 93_400_000_000,           // $93.4 billion (DoD obligations in a single September)
    source: 'Open the Books (via CNN / The Fiscal Times)',
    sourceUrl: 'https://www.thefiscaltimes.com/2026/03/10/Pentagons-93-Billion-Use-It-or-Lose-It-September',
    lastVerified: '2026-09-14',
    category: 'defense',
    notes: 'The largest "use it or lose it" year-end binge since 2008 - more than half of it in the final five working days. Purchases included ~$9M of Alaskan king crab and lobster tails, $200M+ of furniture and $5.3M of Apple devices. Timely again: FY2026 ends Sept 30 and the same incentive is live right now'
  },
  trending6: {
    label: 'Congressional Earmarks in FY2027 Spending Bills',
    value: 6_500_000_000,            // $6.5 billion (earmarks across three House appropriations bills)
    source: 'Fox News / The Hill (House Appropriations Committee bills)',
    sourceUrl: 'https://www.foxnews.com/politics/house-gop-spending-bills-pack-billions-earmarks-sparking-backlash-from-fiscal-hawks',
    lastVerified: '2026-09-14',
    category: 'general',
    notes: 'Over 3,000 earmarks worth $6.5B packed into three House spending bills - $3B in Energy and Water, $1.7B in Interior, $1.7B in Commerce-Justice-Science. Fiscal hawks call it a betrayal of spending-cut promises; Sen. Rick Scott called the package "another slush fund for political passion projects"'
  },
  trending7: {
    label: 'Medicare Equipment Supplier Fraud Scheme',
    value: 3_400_000_000,            // $3.4 billion (suspected fraudulent billing by 11 suppliers)
    source: 'Centers for Medicare & Medicaid Services (CMS)',
    sourceUrl: 'https://www.cms.gov/newsroom/press-releases/cms-cracks-down-massive-3-4-billion-medical-equipment-supplier-fraud-scheme',
    lastVerified: '2026-09-14',
    category: 'medicare',
    notes: 'CMS announced Sept 8, 2026 it is barring 11 medical equipment suppliers over $3.4B in suspected fraudulent billing - including claims for beneficiaries who were already dead, $18.4M of catheter claims filed by one Florida provider in two days, and four suppliers already kicked out of Original Medicare who simply switched to billing Medicare Advantage'
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
