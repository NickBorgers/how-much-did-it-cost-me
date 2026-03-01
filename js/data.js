// data.js - FY 2024 Federal Tax and Budget Data
// Sources: IRS, CBO, Tax Foundation, U.S. Treasury Fiscal Data

const DATA_YEAR = 2024;
const DATA_LAST_UPDATED = '2026-03-01';  // Updated verification date

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
    sourceUrl: 'https://science.nasa.gov/mission/webb/about-overview/',
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
    label: 'Trump FY27 Defense Proposal',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 defense budget)
    source: 'Bloomberg / CRFB',
    sourceUrl: 'https://www.crfb.org/blogs/15-trillion-military-budget-would-add-58-trillion-debt-over-decade',
    lastVerified: '2026-02-23',
    category: 'defense',
    notes: 'Controversial 50% increase over FY26; largest single-year jump since Korean War; would add $5.8T to debt over decade'
  },
  trending2: {
    label: 'One Big Beautiful Bill - Medicaid Cuts',
    value: 1_000_000_000_000,        // $1 trillion (10-year Medicaid cuts)
    source: 'Congressional Budget Office / Center for American Progress',
    sourceUrl: 'https://www.americanprogress.org/article/the-truth-about-the-one-big-beautiful-bill-acts-cuts-to-medicaid-and-medicare/',
    lastVerified: '2026-02-23',
    category: 'medicare',
    notes: 'CBO: 11.8 million to lose coverage; work requirements taking effect Dec 2026; 300+ rural hospitals at closure risk',
    isSavings: true
  },
  trending3: {
    label: 'IRS Funding Rescission',
    value: 11_600_000_000,           // $11.6 billion (clawed back IRS modernization funds)
    source: 'Bloomberg Tax / Grant Thornton',
    sourceUrl: 'https://news.bloombergtax.com/daily-tax-report/lawmakers-ax-11-6-billion-more-in-irs-funding-in-spending-plan',
    lastVerified: '2026-02-23',
    category: 'general',
    notes: 'Latest rescission of IRA funds; CBO: will cost $38B in lost enforcement revenue over 10 years; total IRA clawbacks now $53B',
    isSavings: true
  },
  trending4: {
    label: 'Pentagon Classified Budget',
    value: 90_000_000_000,           // $90 billion (fully classified spend plan)
    source: 'Stars and Stripes / Military.com',
    sourceUrl: 'https://www.stripes.com/theaters/us/2026-02-04/senators-transparency-pentagon-classified-spending-20625172.html',
    lastVerified: '2026-02-23',
    category: 'defense',
    notes: 'Senators demand answers on fully classified spending plan; unprecedented departure from standard practice; includes routine items like barracks'
  },
  trending5: {
    label: 'DOGE Claimed Savings (Disputed)',
    value: 160_000_000_000,          // $160 billion (DOGE claimed savings)
    source: 'CBS News / DOGE.gov',
    sourceUrl: 'https://www.cbsnews.com/news/doge-cuts-cost-135-billion-analysis-elon-musk-department-of-government-efficiency/',
    lastVerified: '2026-02-23',
    category: 'general',
    notes: 'DOGE claims $160B saved; analysis says cuts actually cost $135B; IRS projects $500B+ revenue loss; Congress rejected most proposals',
    isSavings: true
  },
  trending6: {
    label: 'Federal Improper Payments (FY24)',
    value: 162_000_000_000,          // $162 billion (FY2024 improper payments)
    source: 'Government Accountability Office',
    sourceUrl: 'https://www.gao.gov/blog/federal-government-made-236-billion-improper-payments-last-fiscal-year',
    lastVerified: '2026-02-23',
    category: 'general',
    notes: 'Down from $236B in FY23; 74% were overpayments; concentrated in Medicare, Medicaid, unemployment programs'
  },
  trending7: {
    label: 'Ukraine Security Aid (FY26)',
    value: 220_000_000,              // $220 million (FY2026 Ukraine aid allocation)
    source: 'Defense News / Pentagon Report',
    sourceUrl: 'https://www.defensenews.com/global/europe/2026/01/16/eu-mandates-buy-european-preference-in-new-ukraine-assistance-package/',
    lastVerified: '2026-02-23',
    category: 'defense',
    notes: 'Down 40-fold from peak; FY25 was $3.92B; Europe now bearing primary burden; Ukraine says needs $120B for 2026 defense'
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
