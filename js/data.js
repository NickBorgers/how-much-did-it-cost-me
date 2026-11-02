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
    label: 'Iran War Cost to Date (Pentagon Estimate)',
    value: 47_100_000_000,           // $47.1 billion (Pentagon estimate through Oct 16, 2026)
    source: 'Pentagon estimate to Congress (via Associated Press / PBS NewsHour)',
    sourceUrl: 'https://www.pbs.org/newshour/world/american-taxpayers-bill-for-iran-war-grows-to-estimated-47-1-billion',
    lastVerified: '2026-11-02',
    category: 'defense',
    notes: 'Reported Oct 28, 2026: about $29B for replacing munitions (mostly Patriot/THAAD interceptors), $11.9B for operations, $6B for lost equipment. Congressional officials say the estimate is low because it leaves out base damage and some fuel costs. The White House is still pushing a supplemental of roughly $95B, and the war is a major midterm issue'
  },
  trending2: {
    label: 'Record $1.5 Trillion Defense Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (FY2027 national defense request)
    source: 'White House FY2027 budget / Roll Call / CSIS',
    sourceUrl: 'https://rollcall.com/2026/10/27/defense-priorities-tied-up-in-lame-duck-jumble',
    lastVerified: '2026-11-02',
    category: 'defense',
    notes: 'Record request: $1.15T through regular appropriations plus $350B through party-line reconciliation. Senate Democrats call it bloated and are holding up the NDAA, partly in protest of the Iran war. The fight now moves to the post-election lame duck ahead of the Dec 11 funding deadline'
  },
  trending3: {
    label: 'ICE Purchase of Minnesota Prison (Alleged $420M Overpayment)',
    value: 495_600_000,              // $495.6 million (DHS purchase price for the Appleton, MN facility)
    source: 'KARE 11 / Bring Me The News / Minnesota Attorney General',
    sourceUrl: 'https://www.yahoo.com/news/politics/articles/ice-paid-private-prison-firm-190044965.html',
    lastVerified: '2026-11-02',
    category: 'general',
    notes: 'Reported Oct 30, 2026: DHS paid CoreCivic $495.6M for the empty 1,600-bed Appleton prison, which CoreCivic had offered to Minnesota for $75M (local assessed value: $14.75M). MN AG Keith Ellison calls it a $420M overpayment and wants a congressional investigation. CoreCivic says the government set the price. The same week, GEO Group got a $1.5B contract to keep running the Tacoma detention center'
  },
  trending4: {
    label: 'Tariff Refunds Paid Out (FY2026)',
    value: 144_600_000_000,          // $144.6 billion (total customs refunds in FY2026, per Treasury data)
    source: 'Treasury Monthly Treasury Statement (via Voronoi / La Voce di New York)',
    sourceUrl: 'https://www.voronoiapp.com/economy/Charted-134B-in-US-Tariff-Refunds-vs-119B-Collected-Since-May-9292',
    lastVerified: '2026-11-02',
    category: 'general',
    notes: 'After the Supreme Court struck down the IEEPA tariffs in Feb 2026, Treasury refunded about $145B in FY2026 (it refunded $7.5B the year before). From May through Sept, refunds ($134B) were larger than new tariff collections ($119B). Critics say the money goes to importing corporations, not to the consumers who paid higher prices. Treasury does not separate IEEPA refunds from other customs refunds, so the figure is approximate'
  },
  trending5: {
    label: 'Interest on the Debt (FY2026)',
    value: 1_100_000_000_000,        // $1.1 trillion (record FY2026 interest costs)
    source: 'Committee for a Responsible Federal Budget / CBO',
    sourceUrl: 'https://www.crfb.org/blogs/us-ran-2-trillion-deficit-last-year-we-estimate',
    lastVerified: '2026-11-02',
    category: 'interest',
    notes: 'FY2026 ended with a roughly $2.0T deficit, and interest hit a record of about $1.1T (3.4% of GDP), up roughly $115B (11%) from FY2025. That is more than the entire defense budget. Treasury counts net interest a bit lower, at about $1.05T, and some outlets cite $1.36T in gross interest'
  },
  trending6: {
    label: 'Restoring Expired ACA Subsidies (10-Year Cost)',
    value: 350_000_000_000,          // $350 billion (CBO estimate for a permanent extension over 10 years)
    source: 'Congressional Budget Office (via Becker\'s / KFF)',
    sourceUrl: 'https://www.kff.org/series/health-2026-midterm-elections/',
    lastVerified: '2026-11-02',
    category: 'medicare',
    multiYear: true,                 // 10-year cost, not a single year
    notes: 'The enhanced ACA tax credits expired at the end of 2025. Benchmark premiums rose from $497 to $625 a month, and KFF projects another ~13% increase in 2027, while marketplace enrollment fell by 4.6M. Democrats are campaigning on restoring the credits. CBO estimated a permanent extension at about $350B over 10 years (a 3-year extension would be about $85-95B)'
  },
  trending7: {
    label: '$810M Pocket Rescission (Claimed Savings)',
    value: 810_000_000,              // $810 million (FY2026 funds the White House moved to cancel)
    source: 'White House / OMB; GAO ruled it unlawful (via NPR / Roll Call)',
    sourceUrl: 'https://rollcall.com/2026/10/02/court-challenges-mount-over-trumps-funding-clawback/',
    lastVerified: '2026-11-02',
    category: 'general',
    notes: 'The White House moved on Sept 25 to cancel $810M that Congress had approved, across 11 accounts ($567M of it from HHS refugee assistance), just days before the money expired. GAO calls the move unlawful under the Impoundment Control Act, Sen. Susan Collins criticized it, and California, Maine and other states have sued. Litigation continues through October',
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
