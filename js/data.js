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
    label: 'Trump Iran War Cost',
    value: 37_500_000_000,           // $37.5 billion (direct military cost so far, per DoD)
    source: 'CNN / Sec. Pete Hegseth testimony',
    sourceUrl: 'https://www.cnn.com/2026/07/21/world/live-news/iran-war-trump',
    lastVerified: '2026-07-27',
    category: 'defense',
    notes: 'Defense Sec. Hegseth told Congress July 21, 2026 the war has cost $37.5B; experts say the real bill is higher - CSIS estimates ~$40B in DoD costs and Moody\'s puts the broader economic hit near $132B'
  },
  trending2: {
    label: 'Golden Dome Missile Shield',
    value: 1_200_000_000_000,        // $1.2 trillion (CBO 20-year buildout estimate)
    source: 'Congressional Budget Office',
    sourceUrl: 'https://www.cbo.gov/system/files/2026-05/62379-golden-dome.pdf',
    lastVerified: '2026-07-27',
    category: 'defense',
    notes: 'CBO estimates Trump\'s Golden Dome could cost $1.2T over 20 years - nearly 7x his original $175B promise; ~$730B would buy space interceptors able to stop only ~10 incoming missiles'
  },
  trending3: {
    label: 'Trump FY2027 Pentagon Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion ($1.45T request)
    source: 'Bloomberg Government / Arms Control Association',
    sourceUrl: 'https://news.bgov.com/bloomberg-government-news/trumps-1-5-trillion-pentagon-request-is-unraveling-in-congress',
    lastVerified: '2026-07-27',
    category: 'defense',
    notes: 'Largest inflation-adjusted Pentagon request ever (~$420B one-year jump); "unraveling" in Congress because ~$350B relies on a party-line reconciliation bill lawmakers may not pass'
  },
  trending4: {
    label: 'Megabill Medicaid Cuts',
    value: 625_000_000_000,          // $625 billion (CBO 10-year savings estimate)
    source: 'Congressional Budget Office / CBPP',
    sourceUrl: 'https://www.cbpp.org/research/health/congressional-republicans-cant-cut-medicaid-by-hundreds-of-billions-without-hurting',
    lastVerified: '2026-07-27',
    category: 'medicare',
    notes: 'Largest Medicaid cut in the program\'s history, passed just before July 4; CBO scores ~$625B in savings but projects 7.6M+ people lose coverage; work requirements begin Jan 2027',
    isSavings: true
  },
  trending5: {
    label: 'Federal Improper Payments (FY2025)',
    value: 186_000_000_000,          // $186 billion (estimated improper payments FY2025)
    source: 'U.S. Government Accountability Office',
    sourceUrl: 'https://www.gao.gov/blog/186-billion-was-lost-improper-payments-last-year-how-can-we-prevent-them-future',
    lastVerified: '2026-07-27',
    category: 'general',
    notes: 'GAO: agencies made ~$186B in improper payments in FY2025 (up $24B); Medicare led at $57B, Medicaid $37B, EITC $21B; ~82% were overpayments; ~$3T lost since FY2003'
  },
  trending6: {
    label: 'DOGE Claimed Savings (Disputed)',
    value: 215_000_000_000,          // $215 billion (DOGE final claimed total savings)
    source: 'Fox Business / CBS News / Washington Times',
    sourceUrl: 'https://www.foxbusiness.com/politics/doge-website-deactivates-after-reaching-self-termination-deadline-come-end',
    lastVerified: '2026-07-27',
    category: 'general',
    notes: 'DOGE shut down July 4, 2026 claiming $215B saved - far short of its $2T goal; analysts dispute the figure (a CNN review found ~2/3 came from inflated contract ceilings) and OMB won\'t issue a final report',
    isSavings: true
  },
  trending7: {
    label: 'Loyal Source Contractor Fraud',
    value: 2_100_000_000,            // $2.1 billion (federal contracts retained after settlement)
    source: 'Stars and Stripes',
    sourceUrl: 'https://www.stripes.com/theaters/us/2026-07-24/contractor-settles-shell-company-allegations-22344655.html',
    lastVerified: '2026-07-27',
    category: 'general',
    notes: 'Medical-staffing firm Loyal Source settled allegations it fraudulently won contracts set aside for service-disabled-veteran businesses for just $1.8M - yet keeps ~$2.1B in active federal contracts and stays eligible for more'
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
