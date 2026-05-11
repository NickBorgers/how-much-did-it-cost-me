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
    label: 'Trump FY2027 Defense Budget Request',
    value: 1_500_000_000_000,        // $1.5 trillion (proposed FY2027 national security budget)
    source: 'Washington Post / Pentagon / DefenseScoop',
    sourceUrl: 'https://www.washingtonpost.com/national-security/2026/04/21/pentagon-15-trillion-budget-details/',
    lastVerified: '2026-05-11',
    category: 'defense',
    notes: 'Historic $1.5T request: $1.15T discretionary + $350B reconciliation; first time base budget tops $1T; ~40% jump over FY26; paired with 10% non-defense cuts'
  },
  trending2: {
    label: 'Senate $70B ICE & Border Patrol Funding',
    value: 70_000_000_000,           // $70 billion (Senate-passed funding plan)
    source: 'Al Jazeera / CNBC / House Appropriations Democrats',
    sourceUrl: 'https://www.aljazeera.com/news/2026/4/23/us-senate-passes-70bn-funding-plan-for-ice-border-patrol',
    lastVerified: '2026-05-11',
    category: 'general',
    notes: 'Senate passed 50-48 on April 23 after all-night session, ending DHS shutdown that began Feb 14; $38.2B ICE + $26B CBP + $5B DHS slush fund + $1.5B DOJ + $1B for Secret Service tied to Trump ballroom; runs through Jan 2029'
  },
  trending3: {
    label: 'White House Ballroom Taxpayer Security Funding',
    value: 1_000_000_000,            // $1 billion (Senate GOP proposed Secret Service "East Wing Modernization")
    source: 'NBC News / Washington Post / The Hill',
    sourceUrl: 'https://www.nbcnews.com/politics/white-house/republicans-propose-1-billion-taxpayer-dollars-secure-trump-ballroom-rcna343637',
    lastVerified: '2026-05-11',
    category: 'general',
    notes: 'Senate GOP proposal (May 5-6) gives Secret Service $1B for "East Wing Modernization" security tied to Trump\'s ballroom; ballroom itself reportedly $200M-$400M and "privately funded"; critics say taxpayers were misled; some Senate GOP fear political landmine'
  },
  trending4: {
    label: 'DOGE Claimed Savings (Disputed)',
    value: 214_000_000_000,          // $214 billion (DOGE claimed savings as of May 2026)
    source: 'DOGE.gov / CBS News',
    sourceUrl: 'https://doge.gov/savings',
    lastVerified: '2026-05-11',
    category: 'general',
    notes: 'DOGE claims $214B+ saved (~$1,400/taxpayer); CBS analysis finds cuts have actually cost taxpayers $135B; IRS projects $500B+ revenue loss from DOGE-driven cuts; 13,440 contract + 15,887 grant terminations',
    isSavings: true
  },
  trending5: {
    label: 'National Debt Interest Payments (FY26)',
    value: 1_000_000_000_000,        // $1.0 trillion (projected FY2026 net interest)
    source: 'Peter G. Peterson Foundation / CBO',
    sourceUrl: 'https://www.pgpf.org/programs-and-projects/fiscal-policy/monthly-interest-tracker-national-debt/',
    lastVerified: '2026-05-11',
    category: 'interest',
    notes: 'First fiscal year interest tops $1T (3.3% of GDP); more than national defense ($947B), Medicaid ($708B), and veterans benefits combined; Treasury borrowing on track for $2T this year; debt-to-GDP eclipses post-WWII high'
  },
  trending6: {
    label: 'Golden Dome Missile Defense Program',
    value: 185_000_000_000,          // $185 billion (latest official program cost estimate)
    source: 'National Defense Magazine / Breaking Defense / Taxpayers for Common Sense',
    sourceUrl: 'https://www.nationaldefensemagazine.org/articles/2026/4/10/pentagons-flagship-golden-dome-missile-defense-program-spinning-its-wheels',
    lastVerified: '2026-05-11',
    category: 'defense',
    notes: 'Renamed from "Iron Dome for America"; official estimate jumped from $175B to $185B in March; Taxpayers for Common Sense projects up to $3.6T over 20 years; $17B requested for FY27 alone; critics say it is unlikely to work'
  },
  trending7: {
    label: 'OBBBA Medicaid Cuts (10-Year Total)',
    value: 863_000_000_000,          // $863 billion in Medicaid cuts over 10 years
    source: 'AMA / Center for Children and Families / Center for American Progress',
    sourceUrl: 'https://www.ama-assn.org/health-care-advocacy/federal-advocacy/changes-medicaid-aca-and-other-key-provisions-one-big',
    lastVerified: '2026-05-11',
    category: 'medicare',
    notes: 'One Big Beautiful Bill Act (signed July 2025) cuts Medicaid by $863B over 10 years; projected to drop enrollment by 10.3M people by 2034; work-reporting requirements kick in December 2026; first major rollout phase generating renewed controversy',
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
