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
    label: 'Iran War True Cost (Pentagon Lowball Disputed)',
    value: 50_000_000_000,           // ~$50 billion (sources say real cost; Pentagon admits $25B)
    source: 'CNN / Pentagon / NPR',
    sourceUrl: 'https://www.cnn.com/2026/04/29/politics/us-iran-war-25-billion-cost-estimate-low',
    lastVerified: '2026-05-04',
    category: 'defense',
    notes: 'Pentagon Comptroller told Congress Apr 29 cost is $25B, but CNN sources say real cost is $40-50B including base damage; 9 US bases hit in first 48 hrs; Navy 5th Fleet HQ alone needs $200M repair; not reflected in $1.5T FY27 request'
  },
  trending2: {
    label: 'Trump FY2027 Defense Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 defense budget)
    source: 'Breaking Defense / NPR / CSIS',
    sourceUrl: 'https://breakingdefense.com/2026/04/trumps-1-5t-defense-budget-to-weather-harsh-scrutiny-on-capitol-hill/',
    lastVerified: '2026-05-04',
    category: 'defense',
    notes: 'Largest defense budget in history (even inflation-adjusted, larger than any WWII year); $1.15T base + $350B reconciliation; 40% real increase from FY26; paid for with $73B in domestic cuts; AEI says US lacks manufacturing capacity to execute'
  },
  trending3: {
    label: 'Golden Dome Missile Defense Program',
    value: 185_000_000_000,          // $185B Pentagon objective (AEI estimates up to $3.6T over 20 yrs)
    source: 'Federal News Network / Defense One / AEI',
    sourceUrl: 'https://federalnewsnetwork.com/defense-news/2026/03/as-golden-domes-price-tag-rises-some-say-new-estimate-is-no-more-credible/',
    lastVerified: '2026-05-04',
    category: 'defense',
    notes: 'Pentagon program manager now says $185B objective architecture; AEI analysis says full robust system could hit $3.6 trillion over 20 years; Space Force general just told Congress space-based interceptors may "never be affordable"; critics call it "gold brick"'
  },
  trending4: {
    label: 'Trump-Class Battleship (Per Ship)',
    value: 20_000_000_000,           // ~$20 billion per ship (Cato estimate; CBO says $20B+ for first)
    source: 'Fortune / Breaking Defense / CBO / Cato Institute',
    sourceUrl: 'https://fortune.com/2026/05/03/trump-defense-budget-wwii-battleship-modern-missiles/',
    lastVerified: '2026-05-04',
    category: 'defense',
    notes: 'New Trump-class battleship costs MORE than a Ford-class nuclear carrier; CBO says first hull tops $20B; 3 ships = $43B+; experts say modern hypersonic missiles will easily destroy it; battleships were retired 30 years ago for good reasons'
  },
  trending5: {
    label: 'Federal Improper Payments (FY2025)',
    value: 186_000_000_000,          // $186 billion (GAO estimate, FY2025)
    source: 'U.S. GAO / Nextgov',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108694',
    lastVerified: '2026-05-04',
    category: 'medicare',
    notes: 'GAO report Apr 27: agencies made $186B in improper payments FY25, up $24B from prior year despite Trump anti-fraud claims; Medicare ($57B) + Medicaid ($37B) = $94B alone; EITC and SNAP also major contributors; 82% are overpayments; likely an undercount'
  },
  trending6: {
    label: 'ICE & Border Patrol Reconciliation Funding',
    value: 70_000_000_000,           // $70 billion (Senate-approved budget reconciliation amount)
    source: 'Al Jazeera / CBS News / Senate Budget Committee',
    sourceUrl: 'https://www.aljazeera.com/news/2026/4/23/us-senate-passes-70bn-funding-plan-for-ice-border-patrol',
    lastVerified: '2026-05-04',
    category: 'general',
    notes: 'Senate passed budget resolution 50-48 on Apr 23 unlocking $70B for ICE and CBP via reconciliation; House adopted; bill drafting due May 15; Trump wants signed by June 1; bypasses Democratic vote; ended 75-day DHS shutdown'
  },
  trending7: {
    label: 'DOGE Claimed Savings (Disputed)',
    value: 215_000_000_000,          // $215 billion (DOGE.gov claim as of early 2026)
    source: 'DOGE.gov / Yahoo Finance / Fortune',
    sourceUrl: 'https://doge.gov/savings',
    lastVerified: '2026-05-04',
    category: 'general',
    notes: 'DOGE claims $215B saved (vs original $2T promise); independent analyses say cuts actually COST taxpayers $135B; IRS predicts $500B revenue loss from DOGE-driven cuts; DOGE staffer admitted in deposition agency was unable to lower federal deficit',
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
