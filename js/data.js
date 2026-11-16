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
    label: '$350B Defense Reconciliation Push',
    value: 350_000_000_000,          // $350 billion (proposed defense money via party-line reconciliation)
    source: 'Defense Daily / The Fiscal Times / The Hill',
    sourceUrl: 'https://www.defensedaily.com/trump-urges-senate-to-move-immediately-on-350-billion-defense-reconciliation-bill-in-lame-duck/congress/',
    lastVerified: '2026-11-16',
    category: 'defense',
    notes: 'On Nov. 12, 2026 Trump urged the Senate to move "IMMEDIATELY" on a lame-duck reconciliation bill with $350B for defense, and Hegseth called it a minimum; GOP Sen. Mike Rounds and Senate Democrats warn it could trigger a shutdown before the Dec. 11 funding deadline, and it is still stalled over how to pay for it'
  },
  trending2: {
    label: 'Iran War Emergency Funding Request',
    value: 70_000_000_000,           // $70 billion (up to, per administration request)
    source: 'Congressional Budget Office / The Hill (via Yahoo News)',
    sourceUrl: 'https://www.yahoo.com/news/politics/articles/trump-says-iran-war-effectively-110000130.html',
    lastVerified: '2026-11-16',
    category: 'defense',
    notes: 'The administration wants up to $70B in emergency money for war costs, new weapons and personnel, even though Trump calls the war "effectively over"; CBO puts costs at $47.1B as of Oct. 16 and rising $2-3B a month, excluding $65B+ to repair damaged bases; Senate Democrats will not back a stopgap that funds the war without restrictions'
  },
  trending3: {
    label: 'Air Traffic Control Funding Request',
    value: 50_000_000_000,           // $50 billion (up to; original request was ~$30.1B)
    source: 'Roll Call',
    sourceUrl: 'https://rollcall.com/2026/11/16/aviation-funding-becomes-political-football-in-lame-duck-session/',
    lastVerified: '2026-11-16',
    category: 'general',
    notes: 'After a nationwide FAA ground stop, the administration raised its aviation ask from about $30.1B to as much as $50B; the extra ~$20B has not been explained, and Democrats say ~$9B of the $14.4B appropriated since last July is still unspent'
  },
  trending4: {
    label: 'ICE & Border Patrol Funding (2025-2026)',
    value: 240_000_000_000,          // ~$240 billion (NPR count; Brennan Center counts ~$183B available)
    source: 'NPR / Brennan Center for Justice',
    sourceUrl: 'https://www.npr.org/2026/11/09/nx-s1-6032870/immigration-enforcement-ice-democrats-election',
    lastVerified: '2026-11-16',
    category: 'general',
    notes: 'NPR says Congress gave ICE and CBP about $240B in 2025-2026 combined; incoming Democratic majorities vow to rein in ICE after record deportations, but most of the money is multi-year and already appropriated; totals vary by outlet depending on which bills are counted'
  },
  trending5: {
    label: 'Medicare for All (10-Year Cost Estimate)',
    value: 47_000_000_000_000,       // $47 trillion over 10 years (White House CEA estimate)
    source: 'White House Council of Economic Advisers (via House Budget Committee)',
    sourceUrl: 'https://budget.house.gov/press-release/exposing-the-true-cost-of-medicare-for-all',
    lastVerified: '2026-11-16',
    category: 'medicare',
    notes: 'Republicans are attacking the proposal with a CEA estimate of $47T over 10 years as Democrats take power; disputed - CBO has never scored a full bill, older independent estimates ranged $25-32.6T, and supporters argue it would replace (not add to) most private health spending'
  },
  trending6: {
    label: 'SNAP Food Stamp Cuts (Claimed Savings)',
    value: 44_600_000_000,           // $44.6 billion over five years (projected reduction)
    source: 'New Jersey Monitor / USDA proposed rule',
    sourceUrl: 'https://newjerseymonitor.com/2026/11/13/more-people-could-lose-food-stamp-benefits-under-trump-administration-proposal/',
    lastVerified: '2026-11-16',
    category: 'general',
    notes: 'A Trump administration proposal to restrict food stamp eligibility is projected to cut spending by about $44.6B over five years and could end benefits for more than 6 million people; critics say it is about cutting aid, not eliminating waste',
    isSavings: true
  },
  trending7: {
    label: 'FY2026 Federal Budget Deficit',
    value: 2_000_000_000_000,        // $2.0 trillion (CBO, fiscal year ended Sept. 30, 2026)
    source: 'Congressional Budget Office Monthly Budget Review',
    sourceUrl: 'https://www.cbo.gov/publication/61986',
    lastVerified: '2026-11-16',
    category: 'general',
    notes: 'CBO says the FY2026 deficit hit about $2.0T, up $217B (12%) from FY2025 and $140B above its February forecast; interest costs rose ~$115B, and October 2026 alone ran a $404B deficit as defense and homeland security outlays jumped'
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
