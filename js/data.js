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
    label: 'Lame-Duck Pentagon Funding Package',
    value: 350_000_000_000,          // $350 billion (minimum size of the reconciliation package Hegseth wants after the midterms)
    source: 'The Hill (via Yahoo News)',
    sourceUrl: 'https://www.yahoo.com/news/politics/articles/republicans-warn-pentagon-funds-hinge-100000461.html',
    lastVerified: '2026-10-26',
    category: 'defense',
    notes: 'The administration wants at least $350B in new military money passed in the lame-duck session after the Nov. 3 midterms; around Oct. 18, 2026, a group of House Republicans (incl. Reps. Bacon and Fitzpatrick) threatened to withhold votes unless Trump gets tougher on Russia after his Oct. 16 sanctions waiver; the package sits on top of a proposed $1.5T Pentagon budget'
  },
  trending2: {
    label: 'DHS Immigration Funding With "No Oversight Plan"',
    value: 260_000_000_000,          // $260 billion (DHS funding from OBBBA + Secure America Act)
    source: 'Senate Homeland Security & Governmental Affairs Committee (Ranking Member Peters)',
    sourceUrl: 'https://www.hsgac.senate.gov/wp-content/uploads/101426-Letter-from-RM-Peters-to-Secretary-of-DHS_OBBA-Spending.pdf',
    lastVerified: '2026-10-26',
    category: 'general',
    notes: 'In an Oct. 14, 2026 letter, Sen. Gary Peters said DHS has no meaningful plan to oversee the $260B it was given; CBP awarded every border wall contract even though the government owns or has access to less than half of the 700 planned miles, and he cited a $1.3B detention contract to a firm with no detention experience'
  },
  trending3: {
    label: 'Pentagon Wall Street-Style Investment Offices',
    value: 90_000_000_000,           // $90 billion (~$20B Office of Strategic Capital + $70B IBAS/Defense Production Act request)
    source: 'The American Prospect',
    sourceUrl: 'https://prospect.org/2026/10/22/as-lawmakers-scrutinize-pentagon-equity-deals-pentagon-keeps-making-them/',
    lastVerified: '2026-10-26',
    category: 'defense',
    notes: 'The FY2027 request seeks $20B+ for the Office of Strategic Capital (up from $300M) and $70B for industrial-base/DPA programs (up from $2B); the Pentagon keeps taking equity stakes in private companies, including $775M in four new deals, even as the Senate NDAA tries to strip an unauthorized "Economic Defense Unit" of that power; critics cite conflicts of interest; the $90B is a combined approximation'
  },
  trending4: {
    label: 'Medicaid Spending (FY2026)',
    value: 723_000_000_000,          // $723 billion (federal Medicaid outlays in FY2026)
    source: 'Monthly Treasury Statement (via Issues & Insights)',
    sourceUrl: 'https://issuesinsights.com/2026/10/20/draconian-cuts-medicaid-spending-shot-up-8-this-year',
    lastVerified: '2026-10-26',
    category: 'medicare',
    notes: 'Final FY2026 Treasury figures show federal Medicaid spending up about 8% to $723B, $15B above CBO\'s February projection; conservatives say this undercuts claims of "draconian cuts," while the reconciliation law\'s major Medicaid cuts phase in later; the source is an opinion piece citing Treasury data'
  },
  trending5: {
    label: 'Trump "Vanity Projects"',
    value: 2_300_000_000,            // $2.3 billion (CAP high-end estimate; $1.6B low end)
    source: 'Center for American Progress',
    sourceUrl: 'https://www.americanprogress.org/article/the-trump-administration-has-devoted-at-least-1-6-billion-in-taxpayer-dollars-to-vanity-projects/',
    lastVerified: '2026-10-26',
    category: 'general',
    notes: 'An Oct. 23, 2026 CAP analysis puts taxpayer spending on presidential "vanity projects" at $1.6B to $2.3B+: the Qatari jet\'s Air Force One refit, the National Garden of American Heroes, the 2025 military parade and the "Arc de Trump"; the ballroom is only partly counted; this is a left-leaning think tank estimate, and JEC Democrats separately estimated $1.8B'
  },
  trending6: {
    label: 'Improper SSI Payments (Unresolved Earnings Alerts)',
    value: 1_000_000_000,            // $1 billion (SSA OIG estimated improper SSI payments)
    source: 'Social Security Administration Office of the Inspector General (via The Fulcrum)',
    sourceUrl: 'https://thefulcrum.us/economy/social-security-backlog',
    lastVerified: '2026-10-26',
    category: 'socialSecurity',
    notes: 'SSA OIG estimates about $1B in improper SSI payments to 333,800 recipients because wage-mismatch alerts sat unresolved for an average of 733 days; roughly $664M is now legally unrecoverable; this reflects an agency backlog, not beneficiary fraud, and it is extrapolated from a 100-case sample'
  },
  trending7: {
    label: 'GSA OneGov Software Discounts (Claimed Savings)',
    value: 1_620_000_000,            // $1.62 billion (claimed savings since April 2025)
    source: 'Citizens Against Government Waste / GSA',
    sourceUrl: 'https://www.cagw.org/this-week-in-waste-october-16-2026/',
    lastVerified: '2026-10-26',
    category: 'general',
    notes: 'GSA says consolidating federal software purchases has saved $1.62B since April 2025, but $1.4B (86%) comes from temporary AI software discounts; CAGW warns the "discounts won\'t last"',
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
