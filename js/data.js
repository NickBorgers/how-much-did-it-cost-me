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
    label: 'Trump-Class Battleship Program',
    value: 275_000_000_000,          // $275 billion (CBO estimate for all 15 ships, FY2028-FY2056)
    source: 'Congressional Budget Office',
    sourceUrl: 'https://www.cbo.gov/publication/62644',
    lastVerified: '2026-08-10',
    category: 'defense',
    notes: 'CBO said on Aug 5, 2026 that 15 nuclear-powered Trump-class battleships would cost $275B - $23.4B for the lead ship and ~$18B each after that, roughly $6B above the Navy\'s own estimate; a single ship would cost nearly twice the entire Gerald R. Ford carrier program. Senators just stripped the $1B in advance procurement the White House wanted in the stopgap bill'
  },
  trending2: {
    label: 'Medicare Drug Pricing Law Cost Reversal',
    value: 700_000_000_000,          // $700 billion (CBO's upward revision to Part D spending)
    source: 'Congressional Budget Office',
    sourceUrl: 'https://www.cbo.gov/publication/62549',
    lastVerified: '2026-08-10',
    category: 'medicare',
    notes: 'A July 29, 2026 CBO analysis found the Inflation Reduction Act\'s Medicare Part D redesign and drug "negotiation" provisions raised projected spending by about $700B rather than saving $129B as originally scored; per-member monthly drug spending rose to $3,500 instead of falling to $2,300. Republicans are citing it constantly; defenders say it reflects higher drug use, not the negotiations themselves'
  },
  trending3: {
    label: 'DOGE "Wall of Receipts" Claimed Savings',
    value: 110_000_000_000,          // $110 billion (contract, grant and lease savings GAO reviewed)
    source: 'U.S. Government Accountability Office (GAO-26-108615)',
    sourceUrl: 'https://www.gao.gov/products/gao-26-108615',
    lastVerified: '2026-08-10',
    category: 'general',
    notes: 'GAO reported Aug 6, 2026 that it could not verify much of the $110B in contract, grant and lease savings DOGE advertised - 2,503 of 13,476 "terminated" contracts worth $27.4B were never actually cancelled, 108 lease cancellations were already in motion beforehand, and 96% of grant savings lacked a verifiable method. DOGE\'s full claim across all categories is $215B; DOGE did not respond to GAO',
    isSavings: true
  },
  trending4: {
    label: 'Iran War, Farm Aid & Election Package',
    value: 95_000_000_000,           // $95 billion (House GOP FY2027 reconciliation instruction ceiling)
    source: 'PBS NewsHour / House Budget Committee',
    sourceUrl: 'https://www.pbs.org/newshour/politics/house-republicans-adopt-95-billion-package-for-the-iran-war-and-trumps-priorities',
    lastVerified: '2026-08-10',
    category: 'defense',
    notes: 'House Republicans adopted a budget resolution teeing up as much as $95B - $73B for the Iran war and defense, $12B in farm aid, $10B to push states toward the SAVE America Act voter-ID rules - with no offsetting cuts, on top of a deficit already near $2T. It is far short of the $350B the White House asked for'
  },
  trending5: {
    label: 'FY2026 Earmarks in Spending Bills',
    value: 24_000_000_000,           // $24 billion (earmarks across the FY2026 appropriations bills)
    source: 'Citizens Against Government Waste (via Reason)',
    sourceUrl: 'https://reason.com/2026/08/05/senators-want-to-claw-back-trumps-spending-power-they-should-just-pass-a-real-budget-instead/',
    lastVerified: '2026-08-10',
    category: 'general',
    notes: 'Roughly $24B in earmarks across the FY2026 funding bills - including $41.7M to "combat underwater pests" - has set off a Republican civil war between appropriators and fiscal hawks; separately, Congress added $34B in defense program funding the Pentagon never requested'
  },
  trending6: {
    label: 'White House Ballroom Project',
    value: 600_000_000,              // $600 million (contractor estimate reported by the Washington Post)
    source: 'Washington Post (Clark Construction estimate)',
    sourceUrl: 'https://www.washingtonpost.com/investigations/2026/06/16/records-reveal-600m-estimate-trumps-ballroom-project-with-half-taxpayers/',
    lastVerified: '2026-08-10',
    category: 'general',
    notes: 'Internal contractor records put the ballroom at $600M - up from the $200M announced in 2025 - with about $307M coming from taxpayers via the Secret Service ($155M), White House Military Office ($149M) and Executive Residence, despite repeated promises no public money would be used. A federal appeals court ruled in early August 2026 that the project needs congressional authorization it never got'
  },
  trending7: {
    label: 'Social Security Annual Cash Shortfall',
    value: 230_000_000_000,          // $230 billion (2026 gap between payroll tax revenue and benefits paid)
    source: 'Brookings Institution / 2026 Social Security Trustees Report',
    sourceUrl: 'https://www.brookings.edu/articles/yes-social-security-can-run-budget-deficits/',
    lastVerified: '2026-08-10',
    category: 'socialSecurity',
    notes: 'Social Security will take in about $1.44T and pay out about $1.67T in 2026 - a $230B cash shortfall, plus ~$20B in interest costs. The July 2026 Trustees Report moved retirement trust fund depletion to late 2032, which would trigger an automatic 22% benefit cut (about $16,900 a year for a typical dual-earner couple)'
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
