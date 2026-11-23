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
    label: 'IEEPA Tariff Refunds',
    value: 166_000_000_000,          // $166 billion (government's estimate of total IEEPA duty refunds)
    source: 'U.S. Customs and Border Protection court filings (via Fortune / NPR)',
    sourceUrl: 'https://fortune.com/2026/11/12/tariff-refund-class-action-lawsuit-universal-tariff-refunds-trump-administration/',
    lastVerified: '2026-11-23',
    category: 'general',
    notes: 'After the Supreme Court struck down the IEEPA tariffs in February 2026, the government estimated refunds at ~$166B ($144.6B paid out so far, adding ~$140B to the FY2026 deficit); a Nov. 23 ProPublica investigation found some companies used refunds to pay executive bonuses while consumers who paid higher prices get nothing'
  },
  trending2: {
    label: 'Trump $350B Defense Reconciliation Plan',
    value: 350_000_000_000,          // $350 billion (proposed defense reconciliation package)
    source: 'Federal News Network / The Hill',
    sourceUrl: 'https://federalnewsnetwork.com/congress/2026/11/while-350-billion-reconciliation-bill-is-dead-top-republican-says-there-is-path-for-smaller-package',
    lastVerified: '2026-11-23',
    category: 'defense',
    notes: 'Included $48B for critical minerals and $17B for Golden Dome; Republicans clashed over it and House Armed Services Chair Mike Rogers now calls it dead, floating a ~$100B version instead, as a Dec. 11 shutdown deadline looms'
  },
  trending3: {
    label: 'Iran War Cost to Date',
    value: 48_300_000_000,           // $48.3 billion (Pentagon estimate as of Nov. 13, 2026)
    source: 'Pentagon testimony to Senate Armed Services (via Washington Post / AP)',
    sourceUrl: 'https://www.washingtonpost.com/politics/2026/11/19/iran-war-costs-base-damage-congress/66ca62b0-e452-11f1-a99e-b3e3805c6b8b_story.html',
    lastVerified: '2026-11-23',
    category: 'defense',
    notes: 'Pentagon says the war has cost $48.3B, rising $2-3B a month, but the total excludes damage to U.S. bases that lawmakers say the Pentagon is withholding; a $67B supplemental request is stalled and Democrats are eyeing the Dec. 11 funding deadline'
  },
  trending4: {
    label: 'Restoring Enhanced ACA Subsidies',
    value: 405_000_000_000,          // $405 billion (CRFB estimate through 2037)
    source: 'Committee for a Responsible Federal Budget (via Washington Times)',
    sourceUrl: 'https://washingtontimes.com/news/2026/nov/19/house-democrats-first-100-day-agenda-costs-41-trillion-watchdog-says',
    lastVerified: '2026-11-23',
    category: 'medicare',
    notes: 'Incoming House Democrats plan to revive the expired enhanced Obamacare subsidies; CRFB prices that piece at $405B of a $4.1T first-100-days agenda (another analyst says $4.9T) - estimates of proposals, not enacted law'
  },
  trending5: {
    label: 'ICE Detention Facility Buying Spree',
    value: 3_300_000_000,            // $3.3 billion (warehouse and detention facility purchases)
    source: 'Government Accountability Office (via ABC News / Axios)',
    sourceUrl: 'https://abcnews.com/US/federal-auditors-raise-concerns-billions-ice-spending-expand/story?id=138293636',
    lastVerified: '2026-11-23',
    category: 'general',
    notes: 'A Nov. 19 GAO report found ICE bought facilities without cost analysis - paying over triple assessed value for some warehouses it now plans to sell and ~$13M a month for empty beds; The Intercept reports ICE paid nearly $500M for a prison its owner valued at $67M; totals vary by outlet ($3B-$3.3B)'
  },
  trending6: {
    label: 'Interest on the Debt (FY2026)',
    value: 1_143_000_000_000,        // $1.143 trillion (net interest on the public debt, FY2026)
    source: 'Congressional Budget Office Monthly Budget Review',
    sourceUrl: 'https://www.cbo.gov/system/files/2026-11/61986-MBR.pdf',
    lastVerified: '2026-11-23',
    category: 'interest',
    notes: 'Net interest on the public debt topped $1.1T in FY2026, up 11%, as the year closed with a ~$1.99T deficit - the worst non-pandemic year on record; CBO notes its broader "net interest outlays" measure is somewhat smaller'
  },
  trending7: {
    label: 'F-35 Spare Parts Lost Track Of',
    value: 2_500_000_000,            // $2.5 billion (value of untracked spare parts)
    source: 'Government Accountability Office (via Citizens Against Government Waste)',
    sourceUrl: 'https://www.cagw.org/this-week-in-waste-november-20-2026/',
    lastVerified: '2026-11-23',
    category: 'defense',
    notes: 'A Nov. 9, 2026 GAO report found the F-35 logistics system failed to track 17,000 spare parts worth $2.5B - the latest in a long line of F-35 sustainment problems'
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
