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
    label: 'Golden Dome Missile Shield (CBO Estimate)',
    value: 1_200_000_000_000,        // $1.2 trillion over 20 years (CBO estimate, May 12 2026)
    source: 'Congressional Budget Office / Defense One / Bloomberg',
    sourceUrl: 'https://www.defenseone.com/defense-systems/2026/05/golden-dome-cost-trillion-cbo/413485/',
    lastVerified: '2026-05-25',
    category: 'defense',
    notes: 'CBO May 12 estimate is 7x the Trump administration\'s $175B figure; space-based interceptors are 70% of acquisition cost; CBO notes system would not be an "impenetrable shield"'
  },
  trending2: {
    label: 'Trump FY2027 Defense Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion proposed for FY2027
    source: 'Department of War / Washington Post / Federal News Network',
    sourceUrl: 'https://www.washingtonpost.com/opinions/2026/05/12/raising-defense-spending-15-trillion-requires-congressional-oversight/',
    lastVerified: '2026-05-25',
    category: 'defense',
    notes: 'Largest US military budget request in history (larger than WWII peak); 42-44% jump over FY26; $1.15T base + $350B reconciliation; $350B reconciliation portion now stalled in Congress per Breaking Defense May 2026'
  },
  trending3: {
    label: 'Iran War Cost (Pentagon Comptroller Update)',
    value: 29_000_000_000,           // $29 billion Pentagon-reported total cost as of May 12, 2026
    source: 'Pentagon Comptroller (Jules Hurst) / Al Jazeera / Military Times',
    sourceUrl: 'https://www.militarytimes.com/news/pentagon-congress/2026/05/12/pentagon-seeks-additional-funding-as-cost-of-iran-war-tops-29-billon/',
    lastVerified: '2026-05-25',
    category: 'defense',
    notes: 'Pentagon revealed $29B figure in Senate testimony May 12; up from $25B in late April; experts say true cost is higher and excludes installation repairs; supplemental spending request expected'
  },
  trending4: {
    label: 'Federal Improper Payments FY2025 (GAO)',
    value: 186_000_000_000,          // $186 billion in improper payments reported by GAO
    source: 'U.S. Government Accountability Office (GAO-26-108694)',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108694',
    lastVerified: '2026-05-25',
    category: 'general',
    notes: 'GAO report widely covered May 20; up $24B from prior year; 15 agencies, 64 programs; Medicare ($57B) and Medicaid ($37B) are largest contributors; $3T cumulative since 2003'
  },
  trending5: {
    label: 'Congressional Pork Earmarks (2026 Pig Book)',
    value: 23_700_000_000,           // $23.7 billion in earmarks identified by CAGW
    source: 'Citizens Against Government Waste 2026 Congressional Pig Book',
    sourceUrl: 'https://www.cagw.org/this-week-in-waste-may-15-2026/',
    lastVerified: '2026-05-25',
    category: 'general',
    notes: 'Released May 14; 8,392 earmarks, 4.4% more than FY24; fourth-highest total since 1991; Sen. Patty Murray got "Whole Hog Award" with 96 earmarks worth $484M; Rep. Chuck Fleischmann led the House'
  },
  trending6: {
    label: 'ICE & Border Patrol Reconciliation Funding',
    value: 70_000_000_000,           // $70 billion proposed for ICE/CBP via reconciliation
    source: 'CBS News / Brennan Center / Cato Institute',
    sourceUrl: 'https://www.cbsnews.com/news/house-vote-senate-approved-budget-resolution-ice-funding/',
    lastVerified: '2026-05-25',
    category: 'general',
    notes: 'Reconciliation bill due by June 1 Trump deadline; would 400% increase ICE annual detention budget; aims for 1M deportations/year; critics note 74% of ICE detainees have no criminal record'
  },
  trending7: {
    label: 'Medicaid Cuts in Reconciliation (10-yr)',
    value: 911_000_000_000,          // $911 billion in Medicaid cuts over 10 years per CBO
    source: 'Congressional Budget Office / KFF / CBPP',
    sourceUrl: 'https://www.kff.org/policy-watch/how-might-federal-medicaid-cuts-in-the-senate-passed-reconciliation-bill-affect-rural-areas/',
    lastVerified: '2026-05-25',
    category: 'medicare',
    notes: 'CBO estimates reconciliation package reduces federal Medicaid spending by $911B over 10 years; 10M more uninsured; work requirements take effect Dec 31, 2026; rural hospitals hit hardest',
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
