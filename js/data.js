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
    label: 'Artillery Plant That Made Nothing',
    value: 533_000_000,              // $533 million (paid to General Dynamics for the Mesquite, TX shell factory)
    source: 'ProPublica',
    sourceUrl: 'https://www.propublica.org/article/general-dynamics-artillery-factory-failed',
    lastVerified: '2026-08-31',
    category: 'defense',
    notes: 'ProPublica reported Aug 12, 2026 that taxpayers paid $533M for a no-bid artillery shell factory near Dallas that never produced a single usable shell; robots caught fire, the Army halted two of three lines, no money was clawed back, and the same General Dynamics unit has since won $2.5B in new contracts',
    multiYear: true                  // Paid out across the multi-year contract
  },
  trending2: {
    label: 'DHS Jets Bought, Then Parked',
    value: 464_000_000,              // $464 million (no-bid purchase of 10 used aircraft)
    source: 'Washington Post (via Philadelphia Inquirer)',
    sourceUrl: 'https://www.inquirer.com/news/nation-world/homeland-security-planes-unused-no-bid-contract-deportations-fbi-noem-mullin-20260814.html',
    lastVerified: '2026-08-31',
    category: 'general',
    notes: 'Reported Aug 14, 2026: DHS spent $464M on a no-bid contract for 10 used jets it said were urgently needed for deportation flights, then barely flew them - seven Boeing 737s sat parked in Lake Charles, LA for months because the agency lacked staff to operate them',
    multiYear: false
  },
  trending3: {
    label: 'White House Ballroom & Construction',
    value: 900_000_000,              // $900 million (expected total White House construction spend)
    source: 'U.S. Senate (Whitehouse/Reed GAO audit request) / Washington Post',
    sourceUrl: 'https://www.whitehouse.senate.gov/news/release/whitehouse-reed-seek-watchdog-audit-of-trumps-glitzy-ballroom-boondoggle/',
    lastVerified: '2026-08-31',
    category: 'general',
    notes: 'Eight Senate Democrats asked GAO on Aug 14, 2026 to audit the project; reporting puts expected White House construction spending at $900M+, with the ballroom alone at $600M funded by a mix of private donations and appropriated federal money Congress never approved for this purpose',
    multiYear: true                  // Construction spending spread across several budget years
  },
  trending4: {
    label: 'FY2026 Federal Deficit (Revised Up)',
    value: 2_100_000_000_000,        // $2.1 trillion (CBO revised FY2026 deficit projection)
    source: 'Congressional Budget Office, Monthly Budget Review',
    sourceUrl: 'https://www.cbo.gov/system/files/2026-08/61983-2026-07-MBR.pdf',
    lastVerified: '2026-08-31',
    category: 'general',
    notes: 'CBO raised its FY2026 deficit projection to $2.1T in August 2026 - $200B worse than its February estimate - mostly because tariff collections came in ~$250B short after the Supreme Court struck down the tariffs; the deficit already hit $1.8T through 10 months, and July alone ran $432B, the worst month since the pandemic',
    multiYear: false
  },
  trending5: {
    label: 'Yearly Interest on the National Debt',
    value: 1_100_000_000_000,        // $1.1 trillion (annual debt service)
    source: 'U.S. Treasury / NPR / Al Jazeera',
    sourceUrl: 'https://www.npr.org/2026/08/19/nx-s1-5937552/the-u-s-debt-tops-a-record-shattering-40-trillion-yes-with-a-t',
    lastVerified: '2026-08-31',
    category: 'interest',
    notes: 'The national debt topped $40 trillion on Aug 18, 2026 - just five months after crossing $39T - and the government now pays about $1.1T a year just to service it, slightly more than it spends on defense; interest is up 15% year over year and is now the second-largest line in the budget after Social Security',
    multiYear: false
  },
  trending6: {
    label: 'ICE Contract Awards Since Jan 2025',
    value: 8_400_000_000,            // $8.4 billion (contracts awarded to 1,100+ companies)
    source: 'The Appeal (federal contract database analysis)',
    sourceUrl: 'https://theappeal.org/ice-local-business-contracts/',
    lastVerified: '2026-08-31',
    category: 'general',
    notes: 'An Aug 19, 2026 analysis found ICE has awarded $8.4B to 1,100+ companies across 48 states since Jan 20, 2025 - including $1B+ to CoreCivic and GEO Group, $154M on weapons and combat training, and $52M on office furniture; on Aug 28 ICE added a no-bid $16.7M order for 6,000 pairs of electric-shock gloves',
    multiYear: true                  // Awards span from January 2025 through August 2026
  },
  trending7: {
    label: 'Medicare Lab Fraud Blocked (CMS Claim)',
    value: 1_600_000_000,            // $1.6 billion (CMS claimed savings from lab payment enforcement)
    source: 'Centers for Medicare & Medicaid Services',
    sourceUrl: 'https://www.cms.gov/newsroom/press-releases/cms-prevents-1-6-billion-fraudulent-medicare-laboratory-payments',
    lastVerified: '2026-08-31',
    category: 'medicare',
    notes: 'CMS announced Aug 28, 2026 it has stopped $1.6B in potentially improper Medicare lab payments using AI billing analytics - $732M from revoking 157 labs, $500M+ from 185 payment suspensions, $276M recouped, $127M from law-enforcement referrals; this is an agency claim of prevented spending, not an audited figure',
    multiYear: true,                 // Cumulative since the start of the administration
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
