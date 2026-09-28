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
    label: 'Pentagon "Use It or Lose It" September Spree',
    value: 93_400_000_000,           // $93.4 billion spent on contracts and grants in a single month
    source: 'Open the Books (via CNN)',
    sourceUrl: 'https://www.cnn.com/2026/03/12/politics/use-it-or-lose-it-pentagon-spending-binge-set-record-in-final-days-of-fiscal-year',
    lastVerified: '2026-09-28',
    category: 'defense',
    notes: 'Back in the news as FY2026 ends September 30: no federal agency has ever spent more in one month than the Pentagon\'s record $93.4B last September, over half of it in the final five working days - including $15.1M on ribeye steaks, $6.9M on lobster tails and $124K on ice cream machines. Average non-September month since 2008 is $28.9B'
  },
  trending2: {
    label: '340B Drug Discount Program',
    value: 100_000_000_000,          // ~$100 billion in 2025 discounted drug purchases
    source: 'Citizens Against Government Waste / HRSA program data',
    sourceUrl: 'https://www.cagw.org/this-week-in-waste-september-18-2026/',
    lastVerified: '2026-09-28',
    category: 'medicare',
    notes: 'Covered entities bought ~$100B in discounted outpatient drugs in 2025, up 86% from $53.7B in 2022, with hospitals alone accounting for $79B. Critics say the missing patient definition lets hospitals and contract pharmacies pocket the spread; competing Senate and House reform bills are fighting over it right now. This is drug purchase volume, not a federal appropriation'
  },
  trending3: {
    label: 'National Guard Deployments to U.S. Cities',
    value: 1_700_000_000,            // $1.7 billion through the end of 2026
    source: 'Center for American Progress / Congressional Budget Office',
    sourceUrl: 'https://www.americanprogress.org/article/the-trump-administrations-1-7-billion-national-guard-deployments-fail-to-reduce-urban-crime/',
    lastVerified: '2026-09-28',
    category: 'defense',
    notes: 'CBO put 2025 deployments to LA, DC, Memphis, Portland and Chicago at $496M; CAP projects $1.7B once extended 2026 deployments are counted, at roughly $93M a month and $18-21M per 1,000 soldiers. CAP found no measurable reduction in violent crime, homicides or gun violence'
  },
  trending4: {
    label: 'Trump Pocket Rescission (Claimed Savings)',
    value: 810_000_000,              // $810 million in enacted appropriations cancelled
    source: 'The White House / CBS News / Senate Appropriations Committee',
    sourceUrl: 'https://www.whitehouse.gov/briefings-statements/2026/09/president-trump-takes-historic-action-to-eliminate-wasteful-and-harmful-spending/',
    lastVerified: '2026-09-28',
    category: 'general',
    notes: 'Announced September 25, 2026: $810M in funds Congress already appropriated, cancelled by running out the fiscal-year clock - $567M for refugee and migrant services, $70M for international education, $56M for HUD housing counseling. GAO has called pocket rescissions illegal and Appropriations Chair Susan Collins called it "a clear violation of the law"',
    isSavings: true
  },
  trending5: {
    label: 'ICE Warehouses Bought Then Scrapped',
    value: 1_070_000_000,            // $1.07 billion spent on 11 warehouses
    source: 'U.S. Government Accountability Office (GAO-26-108663)',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108663',
    lastVerified: '2026-09-28',
    category: 'general',
    notes: 'GAO reported September 24, 2026 that ICE bought 11 warehouses for $1.07B to convert into detention space, then abandoned the plan before housing a single detainee. Seven are now being sold, with $20M in unrecoverable costs already sunk and $3M more on unused tents at Guantanamo Bay'
  },
  trending6: {
    label: 'White House East Wing Ballroom',
    value: 600_000_000,              // $600 million total project cost per contractor invoices
    source: 'Washington Post / USA Today (via Rep. Katherine Clark)',
    sourceUrl: 'https://katherineclark.house.gov/2026/06/16/usa-today-trump-ballroom-soars-to-600m-with-taxpayers-on-hook-for-half-report/',
    lastVerified: '2026-09-28',
    category: 'general',
    notes: 'Announced at $200M and promised to cost taxpayers "not one dime," the ballroom is now pegged at $600M by contractor invoices, with reporting attributing roughly half to the Secret Service and White House Military Office. An appeals court halted construction in August 2026 pending congressional approval, teeing up a Supreme Court fight'
  },
  trending7: {
    label: 'Improper SSI Payments (SSA Watchdog)',
    value: 1_000_000_000,            // ~$1 billion in improper payments identified
    source: 'Social Security Administration Office of the Inspector General',
    sourceUrl: 'https://oig.ssa.gov/news-releases/2026-09-23-oig-report-identifies-1-billion-in-improper-ssi-payments-due-to-unresolved-earnings-alerts/',
    lastVerified: '2026-09-28',
    category: 'socialSecurity',
    notes: 'SSA OIG found on September 23, 2026 that roughly $1B went to 333,800 SSI recipients whose earnings alerts were never resolved - pending an average of 733 days. Only 20 of 100 sampled cases were handled correctly, and an estimated $664M can never be clawed back'
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
