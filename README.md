# How Much Did It Cost Me?

**Contextualize federal spending in relation to YOUR tax burden.**

[**Try it now →**](https://nickborgers.github.io/how-much-did-it-cost-me/)

## The Problem

You're reading the news and see: *"Government wastes $1 billion on failed program"* or *"Congress approves $50 billion infrastructure package"* or *"Pentagon loses $10 billion to fraud."*

**Should you be angry? Should you care?**

Most of us can't easily translate billions of dollars into something personally meaningful. Is $1 billion a lot? How much of *my* money is that? Is it worth getting upset about, or is it such a tiny fraction of my tax contribution that it's not even worth thinking about?

## The Solution

**How Much Did It Cost Me?** translates federal spending into **your personal share** based on your actual tax contribution.

Instead of abstract billions, you'll see:
- "That $1 billion in waste cost you **$2.37**"
- "That $50 billion infrastructure package cost you **$118.50**"
- "That $10 billion Pentagon loss cost you **$23.70**"

Now you can make informed decisions about what's worth your outrage, activism, or support.

## How It Works

### Simple 4-Step Process

1. **Enter Your Tax Info** - Provide your income (or tax paid directly) and filing status
2. **Enter the Spending Amount** - Type in the federal spending you heard about
3. **Select the Category** - Choose what type of spending it is (defense, social security, general government, etc.)
4. **See Your Personal Share** - Get your exact cost, plus comparisons to everyday purchases

### Example

Let's say you:
- Make $75,000/year as a single filer
- Pay approximately $9,400 in federal income tax
- Hear about a $10 billion defense spending program

**Your share:** $22.26

That's about the cost of a nice dinner. Now you can decide if that spending is worth it to you.

## Features

- **Accurate Tax Calculations** - Uses 2024 IRS tax brackets and standard deductions
- **Multiple Spending Categories** - Accounts for different funding sources (income tax, payroll tax, mixed)
- **Real Budget Data** - Based on FY 2024 CBO and IRS federal budget figures
- **Privacy First** - Everything runs in your browser. No data sent to servers.
- **Mobile Friendly** - Works on any device
- **Shows the Math** - Transparent calculations you can verify

## Educational Value

This tool helps you:
- **Understand scale** - Grasp what billions actually mean in personal terms
- **Compare priorities** - See relative costs of different programs
- **Engage politically** - Make informed decisions about which issues matter to you
- **Budget perspective** - Understand how your taxes are being used

## Tech Stack

- **Pure HTML/CSS/JavaScript** - No frameworks, no build step
- **GitHub Pages Hosting** - Fast, free, reliable
- **Privacy-Focused** - No analytics, no tracking, no server-side code

## Local Development

```bash
# Clone the repository
git clone https://github.com/NickBorgers/how-much-did-it-cost-me.git
cd how-much-did-it-cost-me

# Serve locally (any static file server works)
python -m http.server 8080
# or
npx http-server . -p 8080

# Visit http://localhost:8080
```

## Contributing

Contributions welcome! Some ideas:
- Update tax brackets when they change annually
- Add state/local tax calculations
- Include more spending categories
- Improve mobile UX
- Add historical spending comparisons

## Important Disclaimers

This tool provides **estimates for educational purposes only**. It:
- Uses simplified tax calculations (standard deduction only)
- May not reflect all deductions, credits, or special circumstances
- Is not professional tax, legal, or financial advice
- Should not be used for actual tax preparation

For your specific tax situation, consult a qualified tax professional.

## Data Sources

- Tax brackets and rates: [IRS Tax Tables](https://www.irs.gov/)
- Federal budget data: [Congressional Budget Office (CBO)](https://www.cbo.gov/)
- Federal revenue figures: FY 2024 estimates

## Questions or Feedback?

Open an [issue](https://github.com/NickBorgers/how-much-did-it-cost-me/issues) or submit a pull request!

---

*Made with the goal of making government spending more relatable and understandable for everyday citizens.*
