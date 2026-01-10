# How Much Did It Cost Me

## Project Overview

A GitHub Pages hosted web application. No server-side code - everything runs in the browser.

## Tech Stack

- **Hosting:** GitHub Pages (static files only)
- **Testing:** Playwright for browser automation and testing

## Development

### Local Development

```bash
# Serve static files locally
http-server . -p 8080

# Or use Vite dev server if using a build tool
npm run dev
```

### Testing with Playwright

Use the playwright skill for browser automation and testing screenshots.

## GitHub Actions Workflows

### Deploy to GitHub Pages (`deploy-pages.yml`)
- **Trigger:** Push to main branch
- **Purpose:** Deploys the static site to GitHub Pages
- Uploads the repository contents and deploys via `actions/deploy-pages`
- If using a build tool (Vite, etc.), uncomment the build steps in the workflow

### Claude Code (`claude.yml`)
- **Trigger:** @claude mentions in issues, PRs, or comments
- **Also:** Auto-resolves new issues by creating PRs
- Responds to user requests and implements changes

### PR Reviews (`pr-reviews.yml`)
- **Trigger:** Pull requests (opened, synchronize, ready_for_review, reopened)
- **Purpose:** AI-powered behavioral testing of the web application
- **Merge Requirement:** Add "All Agent Reviews" as a required status check
- Contains the following review agents:
  - **Impatient User Review**: Uses Playwright to test the app as a real user would
    - First visit: Enters income, goes through full calculation flow
    - Second visit: Verifies the app remembers income for faster repeat use
    - Validates the returning user experience is faster than first visit

### Monthly Data Verification (`monthly-data-verification.yml`)
- **Schedule:** 1st of each month at 9am UTC
- **Purpose:** Verifies all data in the repository is still accurate
- Uses Claude Code with web search to check data against current sources
- Opens a PR if any inaccuracies are detected

## Repository Secrets Required

For the GitHub Actions workflows to function, configure these secrets:

| Secret | Description |
|--------|-------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | OAuth token for Claude Code CLI authentication |

Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions.

## Deployment

The application is deployed automatically to GitHub Pages when pushing to the main branch.

**Setup required in repository settings:**
1. Go to Settings > Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. The `deploy-pages.yml` workflow will handle deployments automatically
