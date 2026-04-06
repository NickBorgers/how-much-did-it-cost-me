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
    value: 45_000_000_000,           // ~$45 billion (direct military + economic costs through ~Day 36)
    source: 'CSIS / Pentagon / Newsweek',
    sourceUrl: 'https://www.newsweek.com/iran-war-cost-tracker-how-much-us-has-spent-11692991',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'Operation Epic Fury began Feb 28; ~$1B/day burn rate; $11.3B in first 6 days alone; Pentagon requesting $200B supplemental; Penn Wharton projects $65B+ if war continues'
  },
  trending2: {
    label: 'Pentagon Iran War Supplemental Request',
    value: 200_000_000_000,          // $200 billion (Pentagon supplemental budget request to Congress)
    source: 'Washington Post / Time / Military.com',
    sourceUrl: 'https://www.washingtonpost.com/national-security/2026/03/18/iran-cost-budget-pentagon/',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'Pentagon asked White House to approve $200B request to Congress; bipartisan opposition; Schumer called it "preposterous"; GOP lacks votes even within own party; no clear war timeline'
  },
  trending3: {
    label: 'Trump FY2027 Defense Budget Proposal',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 defense budget)
    source: 'NPR / Federal News Network',
    sourceUrl: 'https://www.npr.org/2026/04/03/nx-s1-5772701/trump-budget-defense-spending',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'Released April 3; largest defense request in history; 44% increase over FY26; $1.15T base + $350B reconciliation; accompanied by 10% ($73B) nondefense cuts; Trump said "can\'t take care of daycare" while fighting wars'
  },
  trending4: {
    label: 'DOGE Claimed Savings (Disputed)',
    value: 215_000_000_000,          // $215 billion (DOGE claimed savings as of early 2026)
    source: 'DOGE.gov / CBS News / Fortune',
    sourceUrl: 'https://doge.gov/savings',
    lastVerified: '2026-04-06',
    category: 'general',
    notes: 'DOGE claims ~$215B saved; independent analyses say cuts actually cost $135B+; IRS predicts $500B+ revenue loss from DOGE-driven cuts; 300,000+ federal jobs eliminated; Musk dropped goal from $2T to $150B',
    isSavings: true
  },
  trending5: {
    label: 'One Big Beautiful Bill - Medicaid Cuts',
    value: 1_020_000_000_000,        // $1.02 trillion (Medicaid cuts over 10 years from OBBBA)
    source: 'CBO / Center for American Progress',
    sourceUrl: 'https://www.americanprogress.org/article/the-truth-about-the-one-big-beautiful-bill-acts-cuts-to-medicaid-and-medicare/',
    lastVerified: '2026-04-06',
    category: 'medicare',
    notes: 'Signed July 4, 2025; $1.02T in Medicaid cuts over 10 years; CBO estimates 11.8M lose coverage; work requirements ($326B), provider tax limits ($191B); states now grappling with rural health impacts'
  },
  trending6: {
    label: 'DHS Shutdown - TSA Back Pay Crisis',
    value: 1_000_000_000,            // ~$1 billion (unpaid TSA wages during record DHS shutdown)
    source: 'CNBC / TSA Congressional Testimony',
    sourceUrl: 'https://www.cnbc.com/2026/04/01/tsa-trump-dhs-shutdown-airports.html',
    lastVerified: '2026-04-06',
    category: 'defense',
    notes: 'DHS shutdown since Feb 14 (49+ days, record-setting); ~$1B unpaid payroll; 460+ officers lost; 11% call-out rate (up from 4%); 4.5-hour airport waits; House rejected Senate funding deal'
  },
  trending7: {
    label: 'FY2027 Science & Environment Cuts (NSF + EPA)',
    value: 9_400_000_000,            // $9.4 billion (combined cuts to NSF $4.8B + EPA $4.6B)
    source: 'Scientific American / Nature / E&E News',
    sourceUrl: 'https://www.scientificamerican.com/article/trump-administration-proposes-massive-budget-cuts-to-science/',
    lastVerified: '2026-04-06',
    category: 'general',
    notes: 'NSF cut 55% ($4.8B); EPA cut 52% ($4.6B) in FY2027 proposal; Congress rejected similar FY26 cuts; OMB delaying release of already-approved FY26 science funds; research community alarmed',
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
