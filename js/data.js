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
    label: 'DOGE Final Savings Tally (Disputed)',
    value: 215_000_000_000,          // $215 billion (DOGE's final claimed savings)
    source: 'The Washington Times / Fox Business / Cato Institute',
    sourceUrl: 'https://www.washingtontimes.com/news/2026/jul/8/doge-shuts-tally-budget-savings-dispute/',
    lastVerified: '2026-07-13',
    category: 'general',
    notes: 'DOGE shut down and took its website dark on July 4, 2026 claiming ~$215B saved, but OMB says it will produce no final after-action report; auditors found duplicate entries, arithmetic errors and contract "ceiling" values counted as savings - Cato projects the cuts may actually cost ~$135B once lost productivity, rehiring and litigation are counted',
    isSavings: true
  },
  trending2: {
    label: 'Trump FY2027 Defense Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 defense budget)
    source: 'NGAUS / Arms Control Association / Bloomberg Government',
    sourceUrl: 'https://www.ngaus.org/newsroom/president-proposes-15-trillion-defense-budget',
    lastVerified: '2026-07-13',
    category: 'defense',
    notes: 'Largest defense request in U.S. history - a ~$234B jump over FY26; $1.15T discretionary base plus ~$350B crammed into a party-line reconciliation package that is now "unraveling in Congress"; House vote expected mid-July 2026'
  },
  trending3: {
    label: 'F-35 Readiness Rescue Funding',
    value: 13_700_000_000,           // $13.7 billion (new sustainment strategy funding)
    source: 'U.S. Government Accountability Office (GAO-26-108113)',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108113',
    lastVerified: '2026-07-13',
    category: 'defense',
    notes: 'June 11, 2026 GAO report: Pentagon is spending $13.7B on a new strategy to fix F-35 readiness after the fleet full-mission-capable rate fell to just 25% (1 in 4 jets); Pratt & Whitney delivered engines late 100% of the time and Lockheed delivered jets late 91% of the time'
  },
  trending4: {
    label: 'Congressional Earmarks (2026 Pig Book)',
    value: 24_000_000_000,           // $24 billion (total earmarks in FY2026)
    source: 'Citizens Against Government Waste - 2026 Congressional Pig Book',
    sourceUrl: 'https://www.cagw.org/costly-and-corrupt-earmarks-waste-taxpayer-resources/',
    lastVerified: '2026-07-13',
    category: 'general',
    notes: "CAGW's 2026 Pig Book exposes 8,595 earmarks worth $24B - up 5.7% and the fourth-highest total on record; the 17% of members on the appropriations committees claimed ~39% of the money; Alaska got the most pork per capita at $444.55 per resident"
  },
  trending5: {
    label: 'Medicare Advantage Overpayments (2026)',
    value: 76_000_000_000,           // $76 billion (estimated MA overpayment in 2026)
    source: 'Medicare Payment Advisory Commission (MedPAC) / Center for Medicare Advocacy',
    sourceUrl: 'https://medicareadvocacy.org/overpayments-to-medicare-advantage-in-2026-76-billion/',
    lastVerified: '2026-07-13',
    category: 'medicare',
    notes: 'MedPAC estimates private Medicare Advantage plans will be overpaid ~14%, or $76B, in 2026; a WSJ/Senate Judiciary investigation tied $50B of extra payments (2018-2021) to "questionable diagnoses" insurers added to records - CMS is now moving to claw some of it back'
  },
  trending6: {
    label: 'Social Security Improper Payments',
    value: 72_000_000_000,           // ~$72 billion (improper payments FY2015-2022)
    source: 'Social Security Administration Office of the Inspector General',
    sourceUrl: 'https://oig.ssa.gov/news-releases/2024-08-19-ig-reports-nearly-72-billion-improperly-paid-recommended-improvements-go-unimplemented/',
    lastVerified: '2026-07-13',
    category: 'socialSecurity',
    notes: 'SSA made nearly $72B in improper payments (mostly overpayments) over FY2015-2022; in 2026 the agency began defaulting to a 100% clawback of benefit checks to recover them, a policy critics (including a former commissioner) blast as "clawback cruelty"'
  },
  trending7: {
    label: 'Pandemic Unemployment Fraud',
    value: 43_600_000_000,           // $43.6 billion (improper PUA payments, FY23)
    source: 'U.S. Government Accountability Office / Washington Times',
    sourceUrl: 'https://www.washingtontimes.com/news/2026/jan/7/finally-stop-wasteful-fraudulent-government-spending/',
    lastVerified: '2026-07-13',
    category: 'general',
    notes: 'GAO found $43.6B in improper payments in the Federal Pandemic Unemployment Assistance program; it is a centerpiece of the 2026 anti-fraud push behind the Protecting American Taxpayers Act (PATA), a bundle of 17 bills sponsors say could cut $240B in losses'
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
