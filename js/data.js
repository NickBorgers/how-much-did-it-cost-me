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
    label: 'F-35 Fighter Jet Program (Lifetime Cost)',
    value: 2_000_000_000_000,        // $2 trillion (develop + produce + sustain through ~2088)
    source: 'ProPublica "The $1 Trillion Black Box" / GAO',
    sourceUrl: 'https://www.propublica.org/article/military-defense-spending-budget-series',
    lastVerified: '2026-08-24',
    category: 'defense',
    notes: 'ProPublica launched a Pentagon investigative series on Aug 19, 2026 built around the F-35 - the most expensive weapon system in history at ~$2T to develop, build and maintain. The figure spans ~60 years, not one budget, and has roughly doubled from early projections'
  },
  trending2: {
    label: 'FY2027 Pentagon Budget Request',
    value: 1_450_000_000_000,        // $1.45 trillion (White House FY2027 defense request)
    source: 'Arms Control Association / Bloomberg Opinion',
    sourceUrl: 'https://www.armscontrol.org/act/2026-05/news/costs-soar-145-trillion-defense-request',
    lastVerified: '2026-08-24',
    category: 'defense',
    notes: 'A record $1.45T request - $1.1T in regular appropriations plus $350B routed through reconciliation to dodge a 60-vote threshold. Congress appropriated ~$1T this year, so this is a near-40% jump; Bloomberg called for bipartisan scrutiny on Aug 17, 2026 and analysts say the reconciliation split obscures the real total'
  },
  trending3: {
    label: 'Federal Borrowing, First 10 Months of FY2026',
    value: 1_800_000_000_000,        // $1.8 trillion (Treasury, Oct 2025 - Jul 2026)
    source: 'U.S. Treasury (via Committee for a Responsible Federal Budget)',
    sourceUrl: 'https://www.crfb.org/press-releases/treasury-confirms-18-trillion-deficit-first-10-months-fy-2026',
    lastVerified: '2026-08-24',
    category: 'interest',
    notes: 'Treasury data released Aug 12, 2026 confirms $1.8T borrowed in ten months - about $14B a day in July alone. CRFB projects the full year tops $2T despite record tariff revenue'
  },
  trending4: {
    label: '$2,000 Tariff Dividend Checks',
    value: 450_000_000_000,          // $450 billion (Yale Budget Lab estimate for a one-time rebate)
    source: 'The Budget Lab at Yale',
    sourceUrl: 'https://budgetlab.yale.edu/research/estimated-budgetary-distributional-and-macroeconomic-effects-tariff-dividends',
    lastVerified: '2026-08-24',
    category: 'general',
    notes: 'A one-time $2,000 per-person rebate for filers under $100K would cost ~$450B - roughly twice all 2026 tariff revenue. Congress has not authorized it and no bill has passed, so this is a proposal cost, not money spent'
  },
  trending5: {
    label: 'Extending Enhanced ACA Subsidies',
    value: 350_000_000_000,          // $350 billion (CBO, 2026-2035 deficit effect of permanent extension)
    source: 'Congressional Budget Office',
    sourceUrl: 'https://www.cbo.gov/system/files/2025-09/61734-Health.pdf',
    lastVerified: '2026-08-24',
    category: 'medicare',
    notes: 'CBO scores permanent extension at $350B over ten years, covering 3.8M more people. The enhanced credits lapsed Dec 31, 2025, premiums jumped ~18%, and Senate votes on both parties\' fixes have failed - it remains one of the loudest fights heading into the midterms'
  },
  trending6: {
    label: 'Federal Improper Payments (FY2025)',
    value: 186_000_000_000,          // $186 billion (GAO, 15 agencies across 64 programs)
    source: 'U.S. Government Accountability Office (GAO-26-108694)',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108694',
    lastVerified: '2026-08-24',
    category: 'general',
    notes: 'GAO reported on Apr 27, 2026 that 15 agencies made $186B in improper payments across 64 programs - up $24B from the prior year, with ~82% ($153B) being overpayments. "Improper" includes documentation errors, not just fraud; cumulative estimates since 2003 approach $3T'
  },
  trending7: {
    label: 'Medicare Fraud Savings Claimed (CMS)',
    value: 41_900_000_000,           // $41.9 billion (CMS program integrity savings claim, FY2025)
    source: 'Centers for Medicare & Medicaid Services',
    sourceUrl: 'https://www.cms.gov/newsroom/press-releases/trump-administration-prioritizes-affordability-announcing-major-crackdown-health-care-fraud',
    lastVerified: '2026-08-24',
    category: 'medicare',
    notes: 'CMS claims FY2025 program integrity savings of $41.9B, up 59% from $26.3B, at a claimed 22-to-1 return. This is an agency self-report rather than an audited recovery total, and analysts note much of it comes from projected eligibility changes rather than clawed-back dollars',
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
