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
    label: 'Interest on the National Debt',
    value: 1_250_000_000_000,        // $1.25 trillion per year in interest payments
    source: 'U.S. Treasury / DoubleLine (via Fortune)',
    sourceUrl: 'https://fortune.com/2026/09/07/us-national-debt-interest-1-trillion-1991-bond-yields-scott-bessent/',
    lastVerified: '2026-09-07',
    category: 'interest',
    notes: 'The national debt crossed $40 trillion on August 18, 2026; interest now eats 18.5% of all federal revenue - a record that beats 1991 - and costs more per year than the entire defense budget. CBO projects it reaches 25% of revenue by 2036'
  },
  trending2: {
    label: '$2,000 Tariff Dividend Checks',
    value: 450_000_000_000,          // $450 billion (Yale Budget Lab estimate for one round of checks)
    source: 'Yale Budget Lab (via Axios) / Tax Foundation',
    sourceUrl: 'https://www.axios.com/2025/11/18/2000-tariff-dividend-trump-check-2026-growth',
    lastVerified: '2026-09-07',
    category: 'general',
    notes: 'One round of $2,000-per-person checks would cost about $450B - roughly twice the ~$208B tariffs are expected to raise in 2026; other estimates run to $600B. As of September 2026 it is still an unfunded promise with no bill passed, and Section 122 authority has expired'
  },
  trending3: {
    label: 'Extending Enhanced ACA Subsidies',
    value: 350_000_000_000,          // $350 billion over 10 years (CBO)
    source: 'Congressional Budget Office (via CNBC / KFF)',
    sourceUrl: 'https://www.congress.gov/crs-product/R48290',
    lastVerified: '2026-09-07',
    category: 'medicare',
    notes: 'CBO puts a 10-year extension at ~$350B ($23B in 2026 alone). The enhanced credits expired at the end of 2025, roughly doubling premiums for ~22 million enrollees; the fight helped drive the 2025 shutdown and is back on the table before the December 11, 2026 funding deadline'
  },
  trending4: {
    label: 'Pentagon September Spending Spree',
    value: 93_400_000_000,           // $93.4 billion spent in a single month
    source: 'Open the Books / Department of Defense (via CNN)',
    sourceUrl: 'https://www.cnn.com/2026/03/12/politics/use-it-or-lose-it-pentagon-spending-binge-set-record-in-final-days-of-fiscal-year',
    lastVerified: '2026-09-07',
    category: 'defense',
    notes: 'DoD obligated $93.4B in grants and contracts in one month under "use-it-or-lose-it" rules - the biggest September since at least 2008, with over half of it in the final five working days. It included $15.1M on ribeye, $6.9M on lobster tail, $2M on king crab and $124K on ice cream machines. September 2026 closes FY2026, and watchdogs are pressing Secretary Hegseth not to repeat it'
  },
  trending5: {
    label: 'DOGE Savings GAO Says Never Happened',
    value: 110_000_000_000,          // $110 billion in claimed savings GAO found unsupported
    source: 'U.S. Government Accountability Office (via Washington Post / GovExec)',
    sourceUrl: 'https://www.govexec.com/management/2026/08/doge-took-credit-savings-never-happened-watchdog-finds/415270/',
    lastVerified: '2026-09-07',
    category: 'general',
    notes: 'GAO reported in 2026 that $110B of DOGE\'s claimed contract, grant and lease savings were incorrect or unsupported: 2,503 of 13,476 "terminated" contracts worth $27.4B were never cancelled, and 108 of 264 "terminated" leases were already being ended before DOGE existed. DOGE still claims $215B saved overall',
    isSavings: true
  },
  trending6: {
    label: 'National Guard Deployments to U.S. Cities',
    value: 1_700_000_000,            // $1.7 billion through the end of 2026
    source: 'Center for American Progress / Congressional Budget Office',
    sourceUrl: 'https://www.cbo.gov/publication/61943',
    lastVerified: '2026-09-07',
    category: 'defense',
    notes: 'CBO confirmed $496M spent in 2025 alone on troop deployments to Los Angeles, Washington, Memphis, Portland, Chicago and New Orleans, at roughly $93M a month; CAP projects over $1.7B through the end of 2026 and found no measurable effect on violent crime'
  },
  trending7: {
    label: 'White House Construction Projects',
    value: 900_000_000,              // $900 million (Washington Post review of contracts)
    source: 'Washington Post investigation (via The Hill / Al Jazeera)',
    sourceUrl: 'https://www.washingtonpost.com/investigations/2026/08/12/trump-administration-set-spend-least-900-million-white-house-construction/',
    lastVerified: '2026-09-07',
    category: 'general',
    notes: 'A review of confidential contracts found at least $900M committed to the ballroom, a granite helipad, a visitor screening center and Lafayette Park fountains, with ~$875M routed through a repair-and-restoration account that normally holds a few million. Trump said taxpayers would not pay "one dime"; separately, Republicans proposed $1B in taxpayer funds for ballroom security'
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
