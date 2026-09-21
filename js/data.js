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
    label: 'Iran War Cost So Far (Pentagon Estimate)',
    value: 45_100_000_000,           // $45.1 billion (CENTCOM estimate given to Congress)
    source: 'U.S. Central Command estimate to Congress (via CNN)',
    sourceUrl: 'https://www.cnn.com/2026/09/18/politics/us-iran-war-cost',
    lastVerified: '2026-09-21',
    category: 'defense',
    notes: 'CENTCOM told Congress the week of Sept 15, 2026 that seven months of war has cost $45.1B - $28.1B to replace spent munitions, $11.2B in operations, $4.3B in "lost" weapons and $1.5B in extra fuel; the figure excludes damage to U.S. bases, and the Pentagon says it needs $28B more just to refill munitions stocks'
  },
  trending2: {
    label: 'Proposed $1.5 Trillion Defense Budget',
    value: 1_500_000_000_000,        // $1.5 trillion (FY2027 request: $1.15T discretionary + $350B mandatory)
    source: 'CSIS / Air & Space Forces Magazine',
    sourceUrl: 'https://www.csis.org/analysis/unpacking-15-trillion-fy-2027-defense-budget-topline',
    lastVerified: '2026-09-21',
    category: 'defense',
    notes: 'The FY2027 request is the largest single-year defense topline since World War II - a 28% discretionary increase; the Sept 1, 2026 continuing resolution froze the Pentagon at current levels through Dec 11, and budget analysts openly doubt the $1.5T number survives'
  },
  trending3: {
    label: 'Federal Workers Paid Not to Work (2025)',
    value: 9_500_000_000,            // $9.5 billion (GAO estimate of 2025 paid administrative leave salary costs)
    source: 'Government Accountability Office (GAO-26-108477)',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108477',
    lastVerified: '2026-09-21',
    category: 'general',
    notes: 'GAO reported Sept 15, 2026 that agencies spent $9.5B on paid administrative leave in 2025 - a sixfold jump - with $6.7B of it tied to the DOGE-era deferred resignation buyouts; OPM counters that the workforce cuts should save $20B a year, so this is a one-time cost'
  },
  trending4: {
    label: 'Interest on the National Debt (FY2026)',
    value: 1_020_000_000_000,        // $1.02 trillion (interest costs, first 11 months of FY2026)
    source: 'Peter G. Peterson Foundation interest tracker (Treasury data)',
    sourceUrl: 'https://www.pgpf.org/programs-and-projects/fiscal-policy/monthly-interest-tracker-national-debt/',
    lastVerified: '2026-09-21',
    category: 'interest',
    notes: 'Interest costs passed $1 trillion in a single fiscal year for the first time ever, up 9% year over year with a month still to go; CBO put the 11-month deficit at $2.0T on Sept 9, 2026 as gross debt crossed $40 trillion - the government now spends more on interest than on national defense'
  },
  trending5: {
    label: '340B Drug Discount Program',
    value: 100_000_000_000,          // $100 billion (2025 discounted drug purchases)
    source: 'HRSA data via Citizens Against Government Waste / Drug Channels',
    sourceUrl: 'https://www.cagw.org/this-week-in-waste-september-18-2026/',
    lastVerified: '2026-09-21',
    category: 'medicare',
    notes: 'Discounted purchases hit $100B in 2025, up 23% in a single year; critics say weak oversight and no clear definition of an eligible "patient" let hospitals and contract pharmacies pocket the spread - note this is the value of drugs bought at a discount, not a direct federal outlay, and oversight is being moved from HRSA to CMS'
  },
  trending6: {
    label: 'EPA Carbon Rule Repeal (Claimed Savings)',
    value: 310_000_000_000,          // $310 billion (EPA's claimed savings from repealing the 2024 power plant rule)
    source: 'U.S. Environmental Protection Agency',
    sourceUrl: 'https://www.epa.gov/newsreleases/what-they-are-saying-huge-support-across-america-after-trump-epa-delivers-largest',
    lastVerified: '2026-09-21',
    category: 'general',
    notes: 'EPA finalized the repeal of the 2024 power plant greenhouse gas standards on Sept 14, 2026 and claims $310B in savings; this is avoided private compliance cost, not federal budget savings, and EDF, NRDC, the Sierra Club and New York\'s attorney general have all said they will sue',
    isSavings: true
  },
  trending7: {
    label: 'Pandemic Unemployment Fraud',
    value: 135_000_000_000,          // $135 billion (high end of GAO's estimated range)
    source: 'Government Accountability Office (GAO-23-106696)',
    sourceUrl: 'https://www.gao.gov/products/gao-23-106696',
    lastVerified: '2026-09-21',
    category: 'general',
    notes: 'Back in the headlines in September 2026 as reporting revisits how identity verification was simply switched off: GAO estimates $100B-$135B of pandemic unemployment benefits went to fraud, 11-15% of everything paid; states have clawed back only about $1.2B, and the Labor Department disputes the methodology'
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
