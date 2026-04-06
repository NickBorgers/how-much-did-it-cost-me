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
    label: 'Iran War - Operation Epic Fury (So Far)',
    value: 45_000_000_000,           // ~$45 billion (direct military + economic costs through April 4)
    source: 'CSIS / Pentagon / European Business Magazine',
    sourceUrl: 'https://www.csis.org/analysis/iran-war-cost-estimate-update-113-billion-day-6-165-billion-day-12',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'Operation Epic Fury began Feb 28; $11.3B in first 6 days; burning ~$1-2B/day; 13 US service members killed; Penn Wharton projects $65B if war continues; Brent crude up 55%+'
  },
  trending2: {
    label: 'F-15E Rescue Mission with FARP in Iran',
    value: 2_000_000_000,            // ~$2 billion (estimated cost of rescue including lost aircraft)
    source: 'Defence Security Asia / The Aviationist / Washington Post',
    sourceUrl: 'https://defencesecurityasia.com/en/us-2-billion-burned-iran-f15e-rescue-mission-hc130-helicopter-losses/',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'Costliest rescue mission in history; FARP set up deep inside Iran near Isfahan; lost F-15E, 2 MC-130Js, MH-6 Little Birds, A-10; WSO evaded capture 24+ hours in mountains; 160th SOAR Night Stalkers deployed'
  },
  trending3: {
    label: 'Trump FY2027 Defense Budget Proposal',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 defense budget)
    source: 'NPR / Breaking Defense / Washington Post',
    sourceUrl: 'https://www.npr.org/2026/04/03/nx-s1-5772701/trump-budget-defense-spending',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'Largest defense request in history; 44% increase over FY26; $1.15T base + $350B reconciliation; first time base budget exceeds $1T; accompanied by 10% nondefense cuts'
  },
  trending4: {
    label: 'DOGE Claimed Savings (Disputed)',
    value: 214_000_000_000,          // $214 billion (DOGE claimed savings as of April 2026)
    source: 'DOGE.gov / CBS News',
    sourceUrl: 'https://doge.gov/savings',
    lastVerified: '2026-04-06',
    category: 'general',
    notes: 'DOGE claims $214B saved (~$1,400/taxpayer); CBS analysis finds cuts actually cost $135B; 13,440 contract + 15,887 grant terminations; Musk dropped goal from $2T to $150B',
    isSavings: true
  },
  trending5: {
    label: 'National Debt Interest Payments (FY26)',
    value: 1_040_000_000_000,        // $1.04 trillion (projected FY2026 net interest)
    source: 'Congressional Budget Office / Peter G. Peterson Foundation',
    sourceUrl: 'https://www.pgpf.org/programs-and-projects/fiscal-policy/monthly-interest-tracker-national-debt/',
    lastVerified: '2026-04-06',
    category: 'interest',
    notes: 'First time exceeding $1T; tripled since 2020; $7,700 per household; will surpass Medicare spending by FY2028; debt past $39T'
  },
  trending6: {
    label: 'DHS Shutdown - TSA Back Pay Crisis',
    value: 1_000_000_000,            // ~$1 billion (unpaid TSA wages during DHS shutdown)
    source: 'TSA Congressional Testimony / TheStreet',
    sourceUrl: 'https://www.tsa.gov/news/press/testimony/2026/03/25/oversight-hearing-dhs-shutdown-impacts',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'DHS shutdown since Feb 14; 61,000 TSA workers unpaid; 480+ officers lost; 4.5-hour airport waits; only unfunded department while Iran war rages'
  },
  trending7: {
    label: 'Iran War Gas Price Surge - Consumer Cost',
    value: 150_000_000_000,          // ~$150 billion (estimated annualized extra consumer fuel cost)
    source: 'CNBC / Center for American Progress / PBS',
    sourceUrl: 'https://www.americanprogress.org/article/the-war-in-iran-will-raise-fuel-prices-and-costs-throughout-the-economy/',
    lastVerified: '2026-04-06',
    category: 'general',
    notes: 'Gas hit $4/gal nationally (up $1+ since Feb 28); diesel at $5.45 (up 45%); Strait of Hormuz disrupted; analysts warn Brent could hit $120-200/barrel; recession fears mounting'
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
