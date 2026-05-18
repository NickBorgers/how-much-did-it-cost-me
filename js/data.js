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
    label: 'Golden Dome Missile Defense (CBO 20-Year Estimate)',
    value: 1_200_000_000_000,        // $1.2 trillion (CBO 20-year cost estimate)
    source: 'Congressional Budget Office / NPR / Defense One',
    sourceUrl: 'https://www.cbo.gov/publication/62379',
    lastVerified: '2026-05-18',
    category: 'defense',
    notes: 'CBO released May 13 estimate of $1.2T over 20 years; Trump claimed $175B, Space Force estimated $185B through 2035; ~70% goes to space-based portion including ~7,800 satellites; CBO says even at full cost would stop ~10 incoming ballistic missiles'
  },
  trending2: {
    label: 'Iran War Total Cost (Pentagon Estimate)',
    value: 29_000_000_000,           // $29 billion (Pentagon estimate as of May 12, 2026)
    source: 'Pentagon Comptroller Testimony / NOTUS / Al Jazeera',
    sourceUrl: 'https://www.notus.org/defense/pentagon-iran-war-cost-29-billion',
    lastVerified: '2026-05-18',
    category: 'defense',
    notes: 'Pentagon told Congress May 12 that Iran war cost has climbed to $29B (up from $25B last month); experts say true cost likely exceeds $1 trillion; Brown University estimates broader economic cost at $37B+ including $20B in gas prices'
  },
  trending3: {
    label: 'ICE/CBP $70B Reconciliation Funding Bill',
    value: 70_000_000_000,           // $70 billion (proposed via reconciliation)
    source: 'NPR / Roll Call / American Immigration Council',
    sourceUrl: 'https://www.npr.org/2026/05/11/nx-s1-5816261/congress-likely-to-pass-republicans-plan-to-fund-ice',
    lastVerified: '2026-05-18',
    category: 'general',
    notes: 'Senate committees holding markup week of May 19; adds $70B over 10 years on top of $170B from OBBBA; ICE gets $38.2B for enforcement/detention; controversy after federal agents killed 2 citizens in Minnesota; Democrats blocked funding since Feb 14'
  },
  trending4: {
    label: 'Federal Improper Payments (FY2025 GAO Report)',
    value: 186_000_000_000,          // $186 billion (FY2025 improper payments per GAO)
    source: 'Government Accountability Office',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108694',
    lastVerified: '2026-05-18',
    category: 'general',
    notes: 'New GAO report shows $186B in improper payments across 64 programs in FY25 — up $24B from prior year; Medicare $57B, Medicaid $37B; 19 programs had rates above 10%, six above 25%; actual total likely higher (excludes some uncounted programs)'
  },
  trending5: {
    label: 'NASA Science Mission Cut (FY27 Proposal)',
    value: 3_400_000_000,            // $3.4 billion (proposed cut from $7.25B to $3.9B)
    source: 'Space.com / CNN / The Planetary Society',
    sourceUrl: 'https://www.space.com/space-exploration/what-a-waste-us-scientists-decry-trumps-47-percent-cuts-to-nasa-science-budget',
    lastVerified: '2026-05-18',
    category: 'general',
    notes: 'Trump FY27 budget proposes cutting NASA Science Mission Directorate 47% from $7.25B to $3.9B — largest single-year science cut in agency history; threatens dozens of planetary/astrophysics/Earth missions; Senate rejected nearly identical FY26 proposal',
    isSavings: true
  },
  trending6: {
    label: 'DOGE Final Claimed Savings (Disputed)',
    value: 214_000_000_000,          // $214 billion (DOGE final claimed savings)
    source: 'DOGE.gov / CBS News / TIME',
    sourceUrl: 'https://www.cbsnews.com/news/doge-wall-of-receipts-misleading-inaccurate-claims/',
    lastVerified: '2026-05-18',
    category: 'general',
    notes: 'DOGE disbanded with claimed $214B savings — but only $70.9B itemized and analyses find true number is $1-80B; CBS found cuts cost $135B; AEI estimates ~$80B; IRS predicts $500B+ in lost revenue from DOGE-driven cuts; far short of Musk\'s $1T promise',
    isSavings: true
  },
  trending7: {
    label: 'Trump FY2027 Defense Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 defense budget)
    source: 'Washington Post / Breaking Defense / Arms Control Association',
    sourceUrl: 'https://www.washingtonpost.com/opinions/2026/05/12/raising-defense-spending-15-trillion-requires-congressional-oversight/',
    lastVerified: '2026-05-18',
    category: 'defense',
    notes: 'Largest defense request since WWII; $1.15T base + $350B reconciliation (latter delayed indefinitely); watchdogs warn it adds $5.8T to debt; Pentagon has failed every annual audit since 2018; paired with 10% non-defense cuts'
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
