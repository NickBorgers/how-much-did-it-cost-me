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
    label: 'FY2026 Federal Deficit',
    value: 2_000_000_000_000,        // ~$2 trillion (fiscal year ended Sept 30, 2026)
    source: 'Congressional Budget Office (via Washington Times / Reason / CRFB)',
    sourceUrl: 'https://www.washingtontimes.com/news/2026/oct/8/federal-budget-deficit-climbed-2-trillion-fiscal-26/',
    lastVerified: '2026-10-12',
    category: 'general',
    notes: 'CBO says the deficit hit roughly $2T for FY2026 (about 6.2% of GDP), up ~12% from last year; corporate tax receipts fell 16% after the 2025 tax law and interest costs passed $1T - with no war or pandemic to blame. Approximate; final Treasury figures pending'
  },
  trending2: {
    label: 'Golden Dome Missile Shield',
    value: 1_200_000_000_000,        // $1.2 trillion (CBO 20-year build + operate estimate)
    source: 'Congressional Budget Office (via Committee for a Responsible Federal Budget / Axios)',
    sourceUrl: 'https://www.crfb.org/blogs/cbo-estimates-golden-dome-could-cost-more-1-trillion',
    lastVerified: '2026-10-12',
    category: 'defense',
    notes: 'At a Sept 29 Senate hearing, CBO defended its $1.2T 20-year estimate ($734B just for ~7,800 interceptor satellites that must be constantly replaced) while the program director insisted it will stay within $185B; senators from both parties questioned cost and feasibility'
  },
  trending3: {
    label: 'Pentagon Contracts to Trump Sons-Backed Firms',
    value: 6_000_000_000,            // $6 billion+ (ABC News analysis)
    source: 'ABC News analysis (via Common Dreams)',
    sourceUrl: 'https://www.commondreams.org/news/trump-brothers-pentagon-contracts',
    lastVerified: '2026-10-12',
    category: 'defense',
    notes: 'ABC News found companies backed by Donald Trump Jr. and Eric Trump (largely via 1789 Capital) have won over $6B in Defense Department contracts and loans since the 2024 election; critics call it self-dealing, while the brothers say it reflects independent business judgment and no wrongdoing has been found'
  },
  trending4: {
    label: 'Record Farm Safety-Net Payments',
    value: 13_800_000_000,           // $13.8 billion (ARC/PLC payments for 2025 crop year)
    source: 'U.S. Department of Agriculture',
    sourceUrl: 'https://www.usda.gov/about-usda/news/press-releases/2026/10/07/usda-announces-record-payments-138-billion-2025-crop-year-revenue-and-price-safety-net-programs',
    lastVerified: '2026-10-12',
    category: 'general',
    notes: 'USDA announced Oct 7, 2026 the largest ARC/PLC payout since the programs began in 2014, boosted by higher reference prices in the 2025 tax law; it lands on top of $12B+ in tariff "bridge" aid, fueling criticism that farm subsidies keep stacking up'
  },
  trending5: {
    label: 'Federal Reserve HQ Renovation',
    value: 2_500_000_000,            // ~$2.5 billion (estimated total project cost)
    source: 'Federal Reserve Office of Inspector General (via CBS News)',
    sourceUrl: 'https://www.cbsnews.com/news/federal-reserve-renovations-inspector-general-report/',
    lastVerified: '2026-10-12',
    category: 'general',
    notes: 'The Fed watchdog found no crimes in the renovation Trump called "disgraceful", but cited serious mismanagement as costs rose from $1.9B to nearly $2.5B; the IG says the marble, private elevator and terrace did not materially drive costs. Technically paid from Fed earnings, which otherwise go to the Treasury'
  },
  trending6: {
    label: 'Medicaid Drug Price Deals (Claimed Savings)',
    value: 64_300_000_000,           // $64.3 billion over 10 years (White House CEA estimate)
    source: 'White House Council of Economic Advisers (via FactCheck.org)',
    sourceUrl: 'https://factcheck.org/2026/10/trump-touts-medicaid-drug-savings-but-details-remain-murky',
    lastVerified: '2026-10-12',
    category: 'medicare',
    notes: 'Trump says pharma deals will save Medicaid "over $64 billion" (maybe $100B); FactCheck.org (Oct 5) says the details are murky - independent studies estimate only $3.1B-$8.6B a year, and the deals cover only select drugs',
    isSavings: true
  },
  trending7: {
    label: 'Pocket Rescission of Approved Funds',
    value: 810_000_000,              // $810 million (funds the White House moved to cancel)
    source: 'NBC News / Office of Management and Budget',
    sourceUrl: 'https://www.nbcnews.com/politics/congress/lawmakers-slam-trumps-unlawful-move-cut-810-million-federal-funds-rcna599942',
    lastVerified: '2026-10-12',
    category: 'general',
    notes: 'The White House used a late-fiscal-year "pocket rescission" to cancel $810M Congress already approved, including $547M for refugee assistance; GOP Appropriations Chair Susan Collins called it "unlawful" and GAO has previously said pocket rescissions are illegal',
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
