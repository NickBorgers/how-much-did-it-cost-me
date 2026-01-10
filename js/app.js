// app.js - Main application logic

const app = {
  // Current state
  state: {
    inputMode: 'income', // 'income' or 'tax'
    filingStatus: 'single',
    income: 0,
    incomeTax: 0,
    ficaTax: 0,
    directTax: null, // null means calculated, number means user-entered
    spendingAmount: 0,
    category: null,
    isMultiYear: false // tracks if selected spending is multi-year
  },

  // Initialize the app
  init() {
    // Render spending chips from data
    this.renderSpendingChips();

    // Check for returning user
    const saved = loadUserData();
    if (saved && saved.income) {
      this.loadSavedData(saved);
    }
  },

  // Load saved data for returning user
  loadSavedData(saved) {
    // Show returning banner
    document.getElementById('returningBanner').style.display = 'flex';

    // Restore state
    this.state.inputMode = saved.inputMode || 'income';
    this.state.filingStatus = saved.filingStatus || 'single';
    this.state.income = saved.income || 0;
    this.state.directTax = saved.directTax || null;

    // Update UI to reflect saved state
    if (this.state.inputMode === 'tax' && this.state.directTax !== null) {
      this.setInputMode('tax');
      document.getElementById('directTax').value = this.formatNumberInput(this.state.directTax);
      this.state.incomeTax = this.state.directTax;
    } else {
      document.getElementById('income').value = this.formatNumberInput(this.state.income);
      this.recalculateTax();
    }

    // Update filing status buttons
    document.querySelectorAll('[data-status]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === this.state.filingStatus);
    });

    // Show tax result and enable continue
    this.updateTaxDisplay();

    // Auto-advance to Stage 2 so returning users can immediately enter spending
    this.showStage(2);
  },

  // Set input mode (income or direct tax)
  setInputMode(mode) {
    this.state.inputMode = mode;

    // Update toggle buttons
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide appropriate input
    document.getElementById('incomeInput').style.display = mode === 'income' ? 'block' : 'none';
    document.getElementById('directTaxInput').style.display = mode === 'tax' ? 'block' : 'none';

    // Recalculate based on current values
    if (mode === 'income') {
      this.state.directTax = null;
      this.recalculateTax();
    } else {
      const val = parseCurrencyInput(document.getElementById('directTax').value);
      if (val > 0) {
        this.handleDirectTaxInput(document.getElementById('directTax').value);
      }
    }
  },

  // Set filing status
  setFilingStatus(status) {
    this.state.filingStatus = status;

    // Update toggle buttons
    document.querySelectorAll('[data-status]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === status);
    });

    // Recalculate tax
    this.recalculateTax();
    this.saveState();
  },

  // Handle income input
  handleIncomeInput(value) {
    const num = parseCurrencyInput(value);
    this.state.income = num;

    // Format the input
    const input = document.getElementById('income');
    const cursorPos = input.selectionStart;
    const oldLen = input.value.length;
    input.value = this.formatNumberInput(num);
    const newLen = input.value.length;

    // Try to maintain cursor position
    const newPos = cursorPos + (newLen - oldLen);
    input.setSelectionRange(newPos, newPos);

    this.recalculateTax();
    this.saveState();
  },

  // Handle direct tax input
  handleDirectTaxInput(value) {
    const num = parseCurrencyInput(value);
    this.state.directTax = num;
    this.state.incomeTax = num;

    // Format the input
    const input = document.getElementById('directTax');
    const cursorPos = input.selectionStart;
    const oldLen = input.value.length;
    input.value = this.formatNumberInput(num);
    const newLen = input.value.length;

    const newPos = cursorPos + (newLen - oldLen);
    input.setSelectionRange(newPos, newPos);

    // Calculate FICA based on estimated income (rough reverse calculation)
    // This is approximate - assume ~15% effective rate to estimate income
    const estimatedIncome = num / 0.15;
    this.state.income = estimatedIncome;
    const fica = calculateFICA(estimatedIncome, this.state.filingStatus);
    this.state.ficaTax = fica.total;

    this.updateTaxDisplay();
    this.saveState();
  },

  // Recalculate tax from income
  recalculateTax() {
    if (this.state.inputMode === 'tax') return;

    this.state.incomeTax = calculateIncomeTax(this.state.income, this.state.filingStatus);
    const fica = calculateFICA(this.state.income, this.state.filingStatus);
    this.state.ficaTax = fica.total;

    this.updateTaxDisplay();
  },

  // Update the tax display
  updateTaxDisplay() {
    const taxResultEl = document.getElementById('taxResult');
    const continueBtn = document.getElementById('continueToStage2');

    if (this.state.incomeTax > 0 || this.state.directTax > 0) {
      taxResultEl.style.display = 'block';
      document.getElementById('calculatedTax').textContent = formatCurrency(this.state.incomeTax);

      if (this.state.income > 0) {
        const percent = ((this.state.incomeTax / this.state.income) * 100).toFixed(1);
        document.getElementById('taxPercent').textContent = `(${percent}% effective rate)`;
      } else {
        document.getElementById('taxPercent').textContent = '';
      }

      continueBtn.disabled = false;
    } else {
      taxResultEl.style.display = 'none';
      continueBtn.disabled = true;
    }
  },

  // Handle spending input (in billions)
  handleSpendingInput(value) {
    // Parse as a decimal number (user enters billions)
    const billionsStr = value.replace(/[^0-9.]/g, '');
    const billions = parseFloat(billionsStr) || 0;

    // Convert to actual dollar amount
    const actualAmount = billions * 1_000_000_000;
    this.state.spendingAmount = actualAmount;

    // Manual input is not multi-year
    this.state.isMultiYear = false;
    document.getElementById('multiYearNote').style.display = 'none';

    // Update the hint to show the full dollar amount
    const hint = document.getElementById('spendingHint');
    if (billions > 0) {
      hint.innerHTML = `= <strong>${formatLargeNumber(actualAmount)}</strong>`;
    } else {
      hint.innerHTML = '';
    }

    // Enable continue if valid
    document.getElementById('continueToStage3').disabled = billions <= 0;

    // Clear chip selection when user types custom value
    this.clearChipSelection();
  },

  // Set spending from chip (optionally auto-select category for notable items)
  setSpending(amount, category = null, multiYear = false) {
    this.state.spendingAmount = amount;
    this.state.isMultiYear = multiYear;

    // Show/hide multi-year note
    const multiYearNote = document.getElementById('multiYearNote');
    if (multiYear) {
      multiYearNote.style.display = 'block';
    } else {
      multiYearNote.style.display = 'none';
    }

    // Display in billions (convert from actual amount)
    const billions = amount / 1_000_000_000;
    document.getElementById('spending').value = billions % 1 === 0 ? billions.toString() : billions.toFixed(1);

    // Update the hint to show the full dollar amount
    const hint = document.getElementById('spendingHint');
    hint.innerHTML = `= <strong>${formatLargeNumber(amount)}</strong>`;

    document.getElementById('continueToStage3').disabled = false;

    // If a category is provided (from notable spending items), auto-advance
    if (category && FUNDING_CATEGORIES[category]) {
      this.showStage(3);
      this.selectCategory(category);
    }
  },

  // Render spending chips from EXAMPLE_AMOUNTS data
  renderSpendingChips() {
    const container = document.getElementById('spendingChips');
    if (!container) return;

    container.innerHTML = '';
    EXAMPLE_AMOUNTS.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.dataset.index = index;
      btn.dataset.value = item.value;
      btn.textContent = item.label;
      btn.onclick = () => this.selectChip(index, item.value, item.category || null, item.multiYear || false);
      container.appendChild(btn);
    });
  },

  // Select a chip and highlight it
  selectChip(index, amount, category, multiYear = false) {
    // Update visual selection
    document.querySelectorAll('#spendingChips .chip').forEach(chip => {
      chip.classList.toggle('selected', chip.dataset.index === String(index));
    });
    this.state.selectedChipIndex = index;

    // Set the spending amount
    this.setSpending(amount, category, multiYear);
  },

  // Clear chip selection (when user types custom value)
  clearChipSelection() {
    document.querySelectorAll('#spendingChips .chip').forEach(chip => {
      chip.classList.remove('selected');
    });
    this.state.selectedChipIndex = null;
  },

  // Select funding category
  selectCategory(category) {
    this.state.category = category;

    // Update category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.category === category);
    });

    // Calculate and show results
    this.calculateAndShowResults();
  },

  // Calculate and display results
  calculateAndShowResults() {
    const result = calculateShare({
      incomeTax: this.state.incomeTax,
      ficaTax: this.state.ficaTax,
      spendingAmount: this.state.spendingAmount,
      category: this.state.category
    });

    // Update result display
    document.getElementById('resultSpendingAmount').textContent = formatLargeNumber(this.state.spendingAmount);
    document.getElementById('resultCategory').textContent = result.category.toLowerCase();
    document.getElementById('resultShare').textContent = formatCurrency(result.yourShare);

    // Get comparison
    const annualTax = this.state.incomeTax + this.state.ficaTax;
    const comparison = getComparison(result.yourShare, annualTax);
    document.getElementById('resultComparison').textContent = comparison;

    // Update math breakdown
    document.getElementById('mathYourTax').textContent = formatCurrency(result.breakdown.yourTax);
    document.getElementById('mathTaxType').textContent = result.breakdown.taxType;
    document.getElementById('mathTotalRevenue').textContent = formatLargeNumber(result.breakdown.totalRevenue || FEDERAL_BUDGET.revenue.individualIncomeTax);
    document.getElementById('mathProportion').textContent = (result.breakdown.proportion * 100).toExponential(2) + '%';
    document.getElementById('mathSpending').textContent = formatLargeNumber(this.state.spendingAmount);
    document.getElementById('mathShare').textContent = formatCurrency(result.yourShare);

    // Show stage 4
    this.showStage(4);
  },

  // Show a specific stage
  showStage(stageNum) {
    const stage = document.getElementById(`stage${stageNum}`);
    stage.classList.add('visible');

    // Smooth scroll into view
    setTimeout(() => {
      stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  },

  // Toggle math details
  toggleMath() {
    const details = document.getElementById('mathDetails');
    const text = document.getElementById('mathToggleText');
    const icon = document.getElementById('mathToggleIcon');

    const isVisible = details.classList.toggle('visible');
    text.textContent = isVisible ? 'Hide the math' : 'Show the math';
    icon.textContent = isVisible ? '-' : '+';
  },

  // Try another amount
  tryAnother() {
    // Hide stage 4
    document.getElementById('stage4').classList.remove('visible');

    // Clear category selection
    this.state.category = null;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));

    // Hide stage 3
    document.getElementById('stage3').classList.remove('visible');

    // Clear spending and hint
    this.state.spendingAmount = 0;
    this.state.isMultiYear = false;
    document.getElementById('spending').value = '';
    document.getElementById('spendingHint').innerHTML = '';
    document.getElementById('multiYearNote').style.display = 'none';
    document.getElementById('continueToStage3').disabled = true;

    // Scroll to stage 2
    document.getElementById('stage2').scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  // Clear data and reset
  clearAndReset() {
    clearUserData();

    // Reset state
    this.state = {
      inputMode: 'income',
      filingStatus: 'single',
      income: 0,
      incomeTax: 0,
      ficaTax: 0,
      directTax: null,
      spendingAmount: 0,
      category: null,
      isMultiYear: false
    };

    // Reset UI
    document.getElementById('returningBanner').style.display = 'none';
    document.getElementById('income').value = '';
    document.getElementById('directTax').value = '';
    document.getElementById('spending').value = '';
    document.getElementById('spendingHint').innerHTML = '';
    document.getElementById('multiYearNote').style.display = 'none';
    document.getElementById('taxResult').style.display = 'none';
    document.getElementById('continueToStage2').disabled = true;
    document.getElementById('continueToStage3').disabled = true;

    // Reset toggles
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === 'income');
    });
    document.querySelectorAll('[data-status]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === 'single');
    });
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
    this.clearChipSelection();

    // Hide stages 2, 3, 4
    document.getElementById('stage2').classList.remove('visible');
    document.getElementById('stage3').classList.remove('visible');
    document.getElementById('stage4').classList.remove('visible');

    // Reset input mode display
    document.getElementById('incomeInput').style.display = 'block';
    document.getElementById('directTaxInput').style.display = 'none';

    // Reset math toggle
    document.getElementById('mathDetails').classList.remove('visible');
    document.getElementById('mathToggleText').textContent = 'Show the math';
    document.getElementById('mathToggleIcon').textContent = '+';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Save current state to localStorage
  saveState() {
    saveUserData({
      inputMode: this.state.inputMode,
      filingStatus: this.state.filingStatus,
      income: this.state.income,
      directTax: this.state.directTax
    });
  },

  // Format number for input display
  formatNumberInput(num) {
    if (num === 0 || isNaN(num)) return '';
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
