# Devcontainer Dockerfile with pre-installed Claude Code and Playwright
# For GitHub Pages web application development (no server-side code)

FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install system packages: Playwright browser dependencies, zsh, and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Shell and common utilities
    zsh \
    # Core Chromium dependencies
    libglib2.0-0 libnss3 libnspr4 libdbus-1-3 libatk1.0-0 \
    libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libatspi2.0-0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    # Fonts
    fonts-liberation fonts-noto-color-emoji \
    # Playwright host dependencies (recommended)
    libcairo2 libpango-1.0-0 \
    # Utilities used by Claude Code
    bc \
    && rm -rf /var/lib/apt/lists/* \
    # Set zsh as default shell for node user
    && chsh -s /usr/bin/zsh node

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

# Install useful web development tools globally
# - typescript: TypeScript compiler
# - http-server: Simple static file server for local testing
# - prettier: Code formatter
RUN npm install -g typescript http-server prettier

# Create directories for node user with correct ownership
RUN mkdir -p /home/node/.claude/tmp \
    && mkdir -p /home/node/.claude/plugins/cache \
    && mkdir -p /home/node/.claude/plugins/marketplaces \
    && mkdir -p /home/node/.cache/ms-playwright \
    && chown -R node:node /home/node/.claude \
    && chown -R node:node /home/node/.cache

# Switch to node user for plugin installation
USER node
WORKDIR /home/node

# Set TMPDIR to avoid EXDEV errors during plugin installation
ENV TMPDIR=/home/node/.claude/tmp

# Install playwright-skill plugin
RUN claude plugin marketplace add lackeyjb/playwright-skill \
    && claude plugin install playwright-skill@playwright-skill

# Install Playwright npm dependencies and browser
RUN cd ~/.claude/plugins/cache/playwright-skill/playwright-skill/*/skills/playwright-skill \
    && npm install \
    && npx playwright install chromium

# Switch back to root for any remaining operations
USER root
