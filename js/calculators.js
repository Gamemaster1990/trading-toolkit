/* ===========================
   Trading Toolkit - Calculator Logic
   Premium Features: Animated Counters, localStorage,
   Copy/Share, Market Ticker, Toast, FAQ, Mobile Drawer
   =========================== */

// ===========================
// Toast Notification System
// ===========================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const icons = { success: '\u2713', error: '\u2715', info: '\u25CF' };
  toast.innerHTML = '<span>' + (icons[type] || '\u25CF') + '</span> ' + message;
  container.appendChild(toast);
  
  setTimeout(function() {
    toast.classList.add('removing');
    setTimeout(function() { toast.remove(); }, 250);
  }, 3000);
}

// ===========================
// Animated Number Counter
// ===========================

function animateCounter(el, target, decimals, isCurrency, duration) {
  if (!el) return;
  if (decimals === undefined) decimals = 2;
  if (isCurrency === undefined) isCurrency = true;
  if (duration === undefined) duration = 800;
  
  el.dataset.targetValue = target;
  
  var startTime = performance.now();
  
  function update(currentTime) {
    var elapsed = currentTime - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = target * eased;
    
    if (isCurrency) {
      el.textContent = formatCurrency(current, decimals);
    } else {
      el.textContent = formatNumber(current, decimals);
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (isCurrency) {
        el.textContent = formatCurrency(target, decimals);
      } else {
        el.textContent = formatNumber(target, decimals);
      }
    }
  }
  
  requestAnimationFrame(update);
}

// ===========================
// localStorage for Input Persistence
// ===========================

var STORAGE_PREFIX = 'tt-';

function saveInputs(section) {
  var inputs = document.querySelectorAll('#section-' + section + ' .form-input, #section-' + section + ' .form-select');
  var data = {};
  inputs.forEach(function(inp) {
    if (inp.id) {
      data[inp.id] = inp.value;
    }
  });
  try {
    localStorage.setItem(STORAGE_PREFIX + section, JSON.stringify(data));
  } catch (e) {
    // localStorage might be full or unavailable
  }
}

function restoreInputs(section) {
  try {
    var saved = localStorage.getItem(STORAGE_PREFIX + section);
    if (!saved) return false;
    var data = JSON.parse(saved);
    Object.keys(data).forEach(function(id) {
      var el = document.getElementById(id);
      if (el && data[id]) el.value = data[id];
    });
    return true;
  } catch (e) {
    return false;
  }
}

function setupAutoSave(section) {
  var container = document.getElementById('section-' + section);
  if (!container) return;
  
  restoreInputs(section);
  
  container.addEventListener('input', function() { saveInputs(section); });
  container.addEventListener('change', function() { saveInputs(section); });
}

// ===========================
// Copy/Share Result Functions
// ===========================

function getSectionTitle(sectionId) {
  var map = {
    'ps': 'Position Size Calculator',
    'rr': 'Risk/Reward Calculator',
    'cp': 'Compounding Calculator',
    'br': 'Brokerage Calculator',
    'op': 'Option Payoff Chart'
  };
  return map[sectionId] || 'Calculator';
}

function copyResultsToClipboard(sectionId) {
  var resultsEl = document.getElementById(sectionId + '-results');
  if (!resultsEl) return;
  
  var items = resultsEl.querySelectorAll('.result-item');
  var text = 'Trading Toolkit - ' + getSectionTitle(sectionId) + '\n';
  text += '='.repeat(30) + '\n';
  
  items.forEach(function(item) {
    var labelEl = item.querySelector('.label');
    var valueEl = item.querySelector('.value');
    var subEl = item.querySelector('.sub-text');
    var label = labelEl ? labelEl.textContent : '';
    var value = valueEl ? valueEl.textContent : '';
    var sub = subEl ? subEl.textContent : '';
    text += label + ': ' + value;
    if (sub) text += ' (' + sub + ')';
    text += '\n';
  });
  
  text += '\n' + window.location.href;
  
  navigator.clipboard.writeText(text).then(function() {
    showToast('Results copied to clipboard!', 'success');
  }).catch(function() {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Results copied to clipboard!', 'success');
  });
}

function shareResults(sectionId) {
  var resultsEl = document.getElementById(sectionId + '-results');
  if (!resultsEl) return;
  
  var items = resultsEl.querySelectorAll('.result-item');
  var text = '\uD83D\uDCCA Trading Toolkit - ' + getSectionTitle(sectionId) + '\n\n';
  
  items.forEach(function(item) {
    var labelEl = item.querySelector('.label');
    var valueEl = item.querySelector('.value');
    var label = labelEl ? labelEl.textContent : '';
    var value = valueEl ? valueEl.textContent : '';
    text += label + ': ' + value + '\n';
  });
  
  text += '\n' + window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: 'Trading Toolkit - ' + getSectionTitle(sectionId),
      text: text
    }).catch(function() {});
  } else {
    copyResultsToClipboard(sectionId);
  }
}

function makeActionButtons(id) {
  return '<div class="action-buttons">' +
    '<button class="action-btn" onclick="copyResultsToClipboard(\'' + id + '\')" aria-label="Copy results">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      ' Copy' +
    '</button>' +
    '<button class="action-btn" onclick="shareResults(\'' + id + '\')" aria-label="Share results">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
      ' Share' +
    '</button>' +
  '</div>';
}

// ===========================
// Position Size Calculator
// ===========================

function calcPositionSize() {
  var accountBalance = parseFloat(document.getElementById('ps-account').value) || 0;
  var riskPercent = parseFloat(document.getElementById('ps-risk').value) || 0;
  var entryPrice = parseFloat(document.getElementById('ps-entry').value) || 0;
  var stopLoss = parseFloat(document.getElementById('ps-stoploss').value) || 0;

  var container = document.getElementById('ps-results');

  if (!accountBalance || !riskPercent || !entryPrice || !stopLoss) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--text-muted);">' +
        '\u26A0\uFE0F Please fill in all fields to calculate position size.</div></div>';
    return;
  }

  if (entryPrice === stopLoss) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--accent-red);">' +
        '\u26A0\uFE0F Entry price and stop loss cannot be the same.</div></div>';
    return;
  }

  var riskAmount = accountBalance * (riskPercent / 100);
  var riskPerShare = Math.abs(entryPrice - stopLoss);
  var positionSize = riskAmount / riskPerShare;
  var totalValue = positionSize * entryPrice;

  container.innerHTML =
    '<div class="result-item"><div class="label">Position Size (Shares)</div><div class="value accent" id="ps-val-shares"></div><div class="sub-text">Units to trade</div></div>' +
    '<div class="result-item"><div class="label">Risk Amount</div><div class="value negative" id="ps-val-risk"></div><div class="sub-text">' + riskPercent + '% of ' + formatCurrency(accountBalance, 2) + '</div></div>' +
    '<div class="result-item"><div class="label">Risk Per Share</div><div class="value" id="ps-val-rps"></div><div class="sub-text">Entry - Stop Loss</div></div>' +
    '<div class="result-item"><div class="label">Total Position Value</div><div class="value" id="ps-val-total"></div><div class="sub-text">Position \u00D7 Entry Price</div></div>' +
    makeActionButtons('ps');

  animateCounter(document.getElementById('ps-val-shares'), positionSize, 2, false);
  animateCounter(document.getElementById('ps-val-risk'), riskAmount, 2, true);
  animateCounter(document.getElementById('ps-val-rps'), riskPerShare, 2, true);
  animateCounter(document.getElementById('ps-val-total'), totalValue, 2, true);
  
  saveInputs('position-size');
}

// ===========================
// Risk/Reward Calculator
// ===========================

function calcRiskReward() {
  var entry = parseFloat(document.getElementById('rr-entry').value) || 0;
  var stopLoss = parseFloat(document.getElementById('rr-stoploss').value) || 0;
  var takeProfit = parseFloat(document.getElementById('rr-takeprofit').value) || 0;

  var container = document.getElementById('rr-results');

  if (!entry || !stopLoss || !takeProfit) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--text-muted);">' +
        '\u26A0\uFE0F Please fill in all fields to calculate risk/reward.</div></div>';
    return;
  }

  if (stopLoss === entry || takeProfit === entry) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--accent-red);">' +
        '\u26A0\uFE0F Stop loss and take profit must differ from entry price.</div></div>';
    return;
  }

  var isLong = entry > stopLoss;
  var riskPerShare = Math.abs(entry - stopLoss);
  var rewardPerShare = Math.abs(takeProfit - entry);
  var rrRatio = rewardPerShare / riskPerShare;
  var riskPercent = (riskPerShare / entry) * 100;
  var rewardPercent = (rewardPerShare / entry) * 100;

  container.innerHTML =
    '<div class="result-item"><div class="label">Direction</div><div class="value" style="font-family:var(--font-sans);font-size:1rem;">' + (isLong ? '\uD83D\uDCC8 Long' : '\uD83D\uDCC9 Short') + '</div></div>' +
    '<div class="result-item"><div class="label">Risk Per Share</div><div class="value negative" id="rr-val-risk"></div></div>' +
    '<div class="result-item"><div class="label">Reward Per Share</div><div class="value positive" id="rr-val-reward"></div></div>' +
    '<div class="result-item"><div class="label">Risk : Reward Ratio</div><div class="value gold" id="rr-val-ratio"></div></div>' +
    '<div class="result-item"><div class="label">Risk %</div><div class="value negative" id="rr-val-riskpct"></div></div>' +
    '<div class="result-item"><div class="label">Reward %</div><div class="value positive" id="rr-val-rewardpct"></div></div>' +
    makeActionButtons('rr');

  animateCounter(document.getElementById('rr-val-risk'), riskPerShare, 2, true);
  animateCounter(document.getElementById('rr-val-reward'), rewardPerShare, 2, true);
  document.getElementById('rr-val-ratio').textContent = '1 : ' + formatNumber(rrRatio, 2);
  document.getElementById('rr-val-riskpct').textContent = formatNumber(riskPercent, 2) + '%';
  document.getElementById('rr-val-rewardpct').textContent = formatNumber(rewardPercent, 2) + '%';

  updateRRBar(rrRatio);
  
  saveInputs('risk-reward');
}

function updateRRBar(rrRatio) {
  var bar = document.getElementById('rr-visual-bar');
  if (!bar) return;
  
  var total = rrRatio + 1;
  var riskPercent = (1 / total) * 100;
  var rewardPercent = (rrRatio / total) * 100;

  bar.innerHTML =
    '<div class="rr-visual-bar">' +
      '<div style="display:flex;width:100%;height:32px;border-radius:8px;overflow:hidden;">' +
        '<div style="flex:1;background:rgba(239,68,68,0.25);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:var(--accent-red);font-weight:600;">Risk ' + riskPercent.toFixed(1) + '%</div>' +
        '<div style="flex:' + rrRatio + ';background:rgba(16,185,129,0.25);border:1px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:var(--accent-green);font-weight:600;">Reward ' + rewardPercent.toFixed(1) + '%</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:0.68rem;color:var(--text-muted);">' +
        '<span>1 Unit Risk</span>' +
        '<span>' + formatNumber(rrRatio, 2) + ' Units Reward</span>' +
      '</div>' +
    '</div>';
}

// ===========================
// Compounding Calculator
// ===========================

function calcCompound() {
  var principal = parseFloat(document.getElementById('cp-principal').value) || 0;
  var monthly = parseFloat(document.getElementById('cp-monthly').value) || 0;
  var annualRate = parseFloat(document.getElementById('cp-rate').value) || 0;
  var years = parseFloat(document.getElementById('cp-years').value) || 0;
  var frequency = parseInt(document.getElementById('cp-frequency').value) || 12;

  var container = document.getElementById('cp-results');

  if (!principal || !annualRate || !years) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--text-muted);">' +
        '\u26A0\uFE0F Please fill in all required fields.</div></div>';
    return;
  }

  var ratePerPeriod = (annualRate / 100) / frequency;
  var totalPeriods = years * frequency;

  var futureValue;
  
  if (annualRate === 0) {
    futureValue = principal + monthly * 12 * years;
  } else {
    var base = Math.pow(1 + ratePerPeriod, totalPeriods);
    futureValue = principal * base + monthly * ((base - 1) / ratePerPeriod);
  }

  var totalContributions = principal + (monthly * 12 * years);
  var totalInterest = futureValue - totalContributions;

  // Generate year-by-year data for chart
  var yearlyData = [];
  for (var y = 0; y <= years; y++) {
    var periods = y * frequency;
    var base2 = Math.pow(1 + ratePerPeriod, periods);
    var fv = annualRate === 0 
      ? principal + monthly * 12 * y 
      : principal * base2 + monthly * ((base2 - 1) / ratePerPeriod);
    var tc = principal + monthly * 12 * y;
    yearlyData.push({
      year: y,
      value: fv,
      contributions: tc,
      interest: fv - tc
    });
  }

  var freqLabels = {1: 'Annually', 2: 'Semi-Annually', 4: 'Quarterly', 12: 'Monthly', 365: 'Daily'};
  var freqLabel = freqLabels[frequency] || 'Custom';

  container.innerHTML =
    '<div class="result-item"><div class="label">Final Balance</div><div class="value positive" id="cp-val-balance"></div></div>' +
    '<div class="result-item"><div class="label">Total Contributions</div><div class="value" id="cp-val-contrib"></div><div class="sub-text">Principal + Monthly additions</div></div>' +
    '<div class="result-item"><div class="label">Total Interest Earned</div><div class="value accent" id="cp-val-interest"></div></div>' +
    '<div class="result-item"><div class="label">Compound Frequency</div><div class="value" style="font-family:var(--font-sans);font-size:1rem;">' + freqLabel + '</div><div class="sub-text">' + formatNumber(annualRate, 2) + '% annual rate</div></div>' +
    makeActionButtons('cp');

  animateCounter(document.getElementById('cp-val-balance'), futureValue, 2, true);
  animateCounter(document.getElementById('cp-val-contrib'), totalContributions, 2, true);
  animateCounter(document.getElementById('cp-val-interest'), totalInterest, 2, true);

  drawCompoundChart(yearlyData);
  
  saveInputs('compounding');
}

function drawCompoundChart(data) {
  var canvas = document.getElementById('cp-chart');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.parentElement.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  ctx.scale(dpr, dpr);

  var width = rect.width;
  var height = rect.height;
  var padding = { top: 20, right: 20, bottom: 40, left: 60 };
  var chartW = width - padding.left - padding.right;
  var chartH = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  var maxVal = Math.max.apply(Math, data.map(function(d) { return d.value; }));

  var chartColors = getChartThemeColors();

  // Grid lines
  ctx.strokeStyle = chartColors.grid;
  ctx.lineWidth = 1;
  var gridLines = 5;
  for (var i = 0; i <= gridLines; i++) {
    var gy = padding.top + (chartH / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, gy);
    ctx.lineTo(width - padding.right, gy);
    ctx.stroke();

    var val = maxVal - (maxVal / gridLines) * i;
    ctx.fillStyle = chartColors.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(getCurrencySymbol() + formatNumber(val, 0), padding.left - 8, gy);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  var xStep = chartW / (data.length - 1 || 1);
  data.forEach(function(d, i) {
    var x = padding.left + xStep * i;
    if (data.length <= 15 || i % Math.ceil(data.length / 10) === 0 || i === data.length - 1) {
      ctx.fillStyle = chartColors.text;
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Yr ' + d.year, x, height - padding.bottom + 8);
    }
  });

  // Area fill for total value
  ctx.beginPath();
  data.forEach(function(d, i) {
    var x = padding.left + xStep * i;
    var y = padding.top + chartH - (d.value / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, padding.top + chartH);
    ctx.lineTo(x, y);
  });
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.closePath();
  
  var gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  gradient.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 212, 255, 0.02)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Contributions fill
  ctx.beginPath();
  data.forEach(function(d, i) {
    var x = padding.left + xStep * i;
    var y = padding.top + chartH - (d.contributions / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, padding.top + chartH);
    ctx.lineTo(x, y);
  });
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.closePath();
  
  var grad2 = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  grad2.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
  grad2.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
  ctx.fillStyle = grad2;
  ctx.fill();

  // Total value line
  ctx.beginPath();
  data.forEach(function(d, i) {
    var x = padding.left + xStep * i;
    var y = padding.top + chartH - (d.value / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Contributions line
  ctx.beginPath();
  data.forEach(function(d, i) {
    var x = padding.left + xStep * i;
    var y = padding.top + chartH - (d.contributions / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dots on value line
  data.forEach(function(d, i) {
    var x = padding.left + xStep * i;
    var y = padding.top + chartH - (d.value / maxVal) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();
  });
}

// ===========================
// Brokerage Calculator
// ===========================

function calcBrokerage() {
  var buyPrice = parseFloat(document.getElementById('br-buy').value) || 0;
  var sellPrice = parseFloat(document.getElementById('br-sell').value) || 0;
  var quantity = parseFloat(document.getElementById('br-qty').value) || 0;
  var chargeType = document.getElementById('br-charge-type').value;
  var chargeRate = parseFloat(document.getElementById('br-rate').value) || 0;

  var container = document.getElementById('br-results');

  if (!buyPrice || !sellPrice || !quantity || !chargeRate) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--text-muted);">' +
        '\u26A0\uFE0F Please fill in all fields.</div></div>';
    return;
  }

  var totalBuy = buyPrice * quantity;
  var totalSell = sellPrice * quantity;

  var buyBrokerage, sellBrokerage;
  if (chargeType === 'percent') {
    buyBrokerage = totalBuy * (chargeRate / 100);
    sellBrokerage = totalSell * (chargeRate / 100);
  } else {
    buyBrokerage = chargeRate * quantity;
    sellBrokerage = chargeRate * quantity;
  }

  var stt = (totalBuy + totalSell) * 0.001;
  var stampDuty = totalBuy * 0.00003;
  var otherCharges = stt + stampDuty;

  var totalBrokerage = buyBrokerage + sellBrokerage;
  var totalCharges = totalBrokerage + otherCharges;
  var netProfitLoss = (totalSell - totalBuy) - totalCharges;
  var breakEvenPrice = buyPrice + (totalCharges / quantity);
  var profitPercent = (netProfitLoss / totalBuy) * 100;

  container.innerHTML =
    '<div class="result-item"><div class="label">Net ' + (netProfitLoss >= 0 ? 'Profit' : 'Loss') + '</div><div class="value ' + (netProfitLoss >= 0 ? 'positive' : 'negative') + '" id="br-val-pnl"></div><div class="sub-text">' + formatNumber(profitPercent, 2) + '% return</div></div>' +
    '<div class="result-item"><div class="label">Total Buy Cost</div><div class="value" id="br-val-buy"></div><div class="sub-text">' + formatNumber(quantity, 0) + ' \u00D7 ' + formatCurrency(buyPrice, 2) + '</div></div>' +
    '<div class="result-item"><div class="label">Total Sell Proceeds</div><div class="value" id="br-val-sell"></div><div class="sub-text">' + formatNumber(quantity, 0) + ' \u00D7 ' + formatCurrency(sellPrice, 2) + '</div></div>' +
    '<div class="result-item"><div class="label">Total Brokerage</div><div class="value" id="br-val-brokerage"></div><div class="sub-text">Buy: ' + formatCurrency(buyBrokerage, 2) + ' + Sell: ' + formatCurrency(sellBrokerage, 2) + '</div></div>' +
    '<div class="result-item"><div class="label">Other Charges (STT + Stamp)</div><div class="value" id="br-val-other"></div></div>' +
    '<div class="result-item"><div class="label">Break-Even Price</div><div class="value accent" id="br-val-breakeven"></div><div class="sub-text">Price needed to cover all charges</div></div>' +
    makeActionButtons('br');

  animateCounter(document.getElementById('br-val-pnl'), netProfitLoss, 2, true);
  animateCounter(document.getElementById('br-val-buy'), totalBuy, 2, true);
  animateCounter(document.getElementById('br-val-sell'), totalSell, 2, true);
  animateCounter(document.getElementById('br-val-brokerage'), totalBrokerage, 2, true);
  animateCounter(document.getElementById('br-val-other'), otherCharges, 2, true);
  animateCounter(document.getElementById('br-val-breakeven'), breakEvenPrice, 2, true);
  
  saveInputs('brokerage');
}

// ===========================
// Option Payoff Calculator
// ===========================

function calcOptionPayoff() {
  var optionType = document.getElementById('op-type').value;
  var action = document.getElementById('op-action').value;
  var strike = parseFloat(document.getElementById('op-strike').value) || 0;
  var premium = parseFloat(document.getElementById('op-premium').value) || 0;
  var contracts = parseInt(document.getElementById('op-contracts').value) || 1;
  var spotMin = parseFloat(document.getElementById('op-spot-min').value) || 0;
  var spotMax = parseFloat(document.getElementById('op-spot-max').value) || 0;

  var container = document.getElementById('op-results');

  if (!strike || !premium || !spotMin || !spotMax || !contracts) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--text-muted);">' +
        '\u26A0\uFE0F Please fill in all fields to draw the payoff chart.</div></div>';
    return;
  }

  if (spotMax <= spotMin) {
    container.innerHTML = '<div class="result-item" style="grid-column: 1/-1;">' +
      '<div class="label">Status</div>' +
      '<div class="value" style="font-size:0.85rem;font-family:var(--font-sans);color:var(--accent-red);">' +
        '\u26A0\uFE0F Max spot price must be greater than min spot price.</div></div>';
    return;
  }

  var multiplier = 100;
  var totalPremium = premium * contracts * multiplier;

  var breakEven, maxProfit, maxLoss;
  var dataPoints = [];

  var step = (spotMax - spotMin) / 100;
  
  for (var spot = spotMin; spot <= spotMax; spot += step) {
    var intrinsicValue;
    if (optionType === 'call') {
      intrinsicValue = Math.max(0, spot - strike);
    } else {
      intrinsicValue = Math.max(0, strike - spot);
    }

    var pnl;
    if (action === 'buy') {
      pnl = (intrinsicValue - premium) * contracts * multiplier;
    } else {
      pnl = (premium - intrinsicValue) * contracts * multiplier;
    }

    dataPoints.push({ spot: spot, pnl: pnl });
  }

  // Calculate key metrics
  if (optionType === 'call' && action === 'buy') {
    breakEven = strike + premium;
    maxProfit = 'Unlimited';
    maxLoss = totalPremium;
  } else if (optionType === 'call' && action === 'sell') {
    breakEven = strike + premium;
    maxProfit = totalPremium;
    maxLoss = 'Unlimited';
  } else if (optionType === 'put' && action === 'buy') {
    breakEven = strike - premium;
    maxProfit = (strike - premium) * contracts * multiplier;
    maxLoss = totalPremium;
  } else {
    breakEven = strike - premium;
    maxProfit = totalPremium;
    maxLoss = (strike - premium) * contracts * multiplier;
  }

  var maxLossLabel = action === 'buy' ? 'Loss' : 'Profit';
  var maxProfitLabel = action === 'buy' ? 'Profit' : 'Loss';
  var premiumLabel = action === 'sell' ? 'collected' : 'paid';

  var maxProfitStr = typeof maxProfit === 'string' ? '\u221E (Unlimited)' : '';
  var maxLossStr = typeof maxLoss === 'string' ? '\u221E (Unlimited)' : '';

  container.innerHTML =
    '<div class="result-item"><div class="label">Break-Even Price</div><div class="value accent" id="op-val-be"></div></div>' +
    '<div class="result-item"><div class="label">Max ' + maxLossLabel + '</div><div class="value ' + (action === 'buy' ? 'negative' : 'positive') + '" id="op-val-max1">' + maxLossStr + '</div><div class="sub-text">Premium ' + premiumLabel + '</div></div>' +
    '<div class="result-item"><div class="label">Max ' + maxProfitLabel + '</div><div class="value ' + (action === 'buy' ? 'positive' : 'negative') + '" id="op-val-max2">' + maxProfitStr + '</div><div class="sub-text">' + (typeof maxProfit === 'string' ? '' : 'At expiry if ITM') + '</div></div>' +
    '<div class="result-item"><div class="label">Total Premium</div><div class="value" id="op-val-premium"></div><div class="sub-text">' + formatNumber(contracts, 0) + ' contract(s) \u00D7 ' + formatCurrency(premium, 2) + ' \u00D7 100</div></div>' +
    makeActionButtons('op');

  animateCounter(document.getElementById('op-val-be'), breakEven, 2, true);
  if (typeof maxLoss === 'number') {
    animateCounter(document.getElementById('op-val-max1'), maxLoss, 2, true);
  }
  if (typeof maxProfit === 'number') {
    animateCounter(document.getElementById('op-val-max2'), maxProfit, 2, true);
  }
  animateCounter(document.getElementById('op-val-premium'), totalPremium, 2, true);

  drawPayoffChart(dataPoints, breakEven, strike, optionType, action);
  
  saveInputs('option-payoff');
}

function drawPayoffChart(data, breakEven, strike, optionType, action) {
  var canvas = document.getElementById('op-chart');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.parentElement.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  ctx.scale(dpr, dpr);

  var width = rect.width;
  var height = rect.height;
  var padding = { top: 30, right: 30, bottom: 50, left: 70 };
  var chartW = width - padding.left - padding.right;
  var chartH = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  // Find min/max for PnL
  var minPnl = Infinity, maxPnl = -Infinity;
  data.forEach(function(d) {
    if (d.pnl < minPnl) minPnl = d.pnl;
    if (d.pnl > maxPnl) maxPnl = d.pnl;
  });

  var pnlRange = maxPnl - minPnl || 1;
  var yPadding = pnlRange * 0.1;
  var yMin = minPnl - yPadding;
  var yMax = maxPnl + yPadding;
  var yRange = yMax - yMin;

  var xMin = data[0].spot;
  var xMax = data[data.length - 1].spot;
  var xRange = xMax - xMin;

  var chartColors = getChartThemeColors();

  // Grid lines
  ctx.strokeStyle = chartColors.grid;
  ctx.lineWidth = 1;
  var gridLines = 6;
  for (var i = 0; i <= gridLines; i++) {
    var gy = padding.top + (chartH / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, gy);
    ctx.lineTo(width - padding.right, gy);
    ctx.stroke();

    var val = yMax - (yRange / gridLines) * i;
    ctx.fillStyle = chartColors.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(getCurrencySymbol() + formatNumber(val, 0), padding.left - 8, gy);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  var xLabels = 8;
  for (var i2 = 0; i2 <= xLabels; i2++) {
    var x = padding.left + (chartW / xLabels) * i2;
    var val2 = xMin + (xRange / xLabels) * i2;
    ctx.fillStyle = chartColors.text;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(getCurrencySymbol() + formatNumber(val2, 0), x, height - padding.bottom + 8);
  }

  // Zero line
  var zeroY = padding.top + chartH - ((0 - yMin) / yRange) * chartH;
  ctx.strokeStyle = chartColors.zeroLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(padding.left, zeroY);
  ctx.lineTo(width - padding.right, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Strike price vertical line
  var strikeX = padding.left + ((strike - xMin) / xRange) * chartW;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(strikeX, padding.top);
  ctx.lineTo(strikeX, height - padding.bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = chartColors.text;
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Strike ' + getCurrencySymbol() + formatNumber(strike, 0), strikeX, padding.top - 4);

  // Break-even vertical line
  if (breakEven >= xMin && breakEven <= xMax) {
    var beX = padding.left + ((breakEven - xMin) / xRange) * chartW;
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(beX, padding.top);
    ctx.lineTo(beX, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('B/E ' + getCurrencySymbol() + formatNumber(breakEven, 1), beX, height - padding.bottom + 22);
  }

  // Draw PnL line
  ctx.beginPath();
  data.forEach(function(d, i) {
    var x = padding.left + ((d.spot - xMin) / xRange) * chartW;
    var y = padding.top + chartH - ((d.pnl - yMin) / yRange) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  var lineGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  lineGradient.addColorStop(0, '#00d4ff');
  lineGradient.addColorStop(0.5, '#8b5cf6');
  lineGradient.addColorStop(1, '#ef4444');
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Fill area under the line
  ctx.beginPath();
  ctx.moveTo(padding.left, zeroY);
  data.forEach(function(d, i) {
    var x = padding.left + ((d.spot - xMin) / xRange) * chartW;
    var y = padding.top + chartH - ((d.pnl - yMin) / yRange) * chartH;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(width - padding.right, zeroY);
  ctx.closePath();

  var areaGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  areaGradient.addColorStop(0, 'rgba(0, 212, 255, 0.12)');
  areaGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
  areaGradient.addColorStop(1, 'rgba(239, 68, 68, 0.04)');
  ctx.fillStyle = areaGradient;
  ctx.fill();

  // Highlight max point
  var maxPnlPoint = data[0];
  data.forEach(function(d) { if (d.pnl > maxPnlPoint.pnl) maxPnlPoint = d; });
  var minPnlPoint = data[0];
  data.forEach(function(d) { if (d.pnl < minPnlPoint.pnl) minPnlPoint = d; });

  var maxX = padding.left + ((maxPnlPoint.spot - xMin) / xRange) * chartW;
  var maxY = padding.top + chartH - ((maxPnlPoint.pnl - yMin) / yRange) * chartH;
  
  ctx.beginPath();
  ctx.arc(maxX, maxY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  var minX = padding.left + ((minPnlPoint.spot - xMin) / xRange) * chartW;
  var minY = padding.top + chartH - ((minPnlPoint.pnl - yMin) / yRange) * chartH;
  
  ctx.beginPath();
  ctx.arc(minX, minY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = chartColors.axisLabel;
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Spot Price at Expiry (' + getCurrencySymbol() + ')', width / 2, height - 4);

  ctx.save();
  ctx.translate(12, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Profit / Loss (' + getCurrencySymbol() + ')', 0, 0);
  ctx.restore();
}

// ===========================
// Utility Functions
// ===========================

// ===========================
// Chart Theme Colors
// ===========================

function getChartThemeColors() {
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    text: isLight ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.4)',
    grid: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    zeroLine: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
    axisLabel: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)'
  };
}

// ===========================
// Currency State
// ===========================

var currentCurrency = localStorage.getItem('tt-currency') || 'USD';

function getCurrencySymbol() {
  return currentCurrency === 'INR' ? '\u20B9' : '$';
}

function getCurrencyCode() {
  return currentCurrency;
}

function formatCurrency(amount, decimals) {
  if (decimals === undefined) decimals = 2;
  if (typeof amount !== 'number' || isNaN(amount)) return '\u2014';
  return getCurrencySymbol() + formatNumber(amount, decimals);
}

function formatNumber(num, decimals) {
  if (decimals === undefined) decimals = 2;
  if (num === Infinity || num === -Infinity || isNaN(num)) return '\u2014';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function changeCurrency(code) {
  currentCurrency = code;
  localStorage.setItem('tt-currency', code);
  
  document.querySelectorAll('.currency-suffix, .currency-inline').forEach(function(el) {
    el.textContent = getCurrencySymbol();
  });
  
  var chargeType = document.getElementById('br-charge-type');
  var rateSuffix = document.getElementById('br-rate-suffix');
  if (chargeType && rateSuffix && chargeType.value === 'fixed') {
    rateSuffix.innerHTML = getCurrencySymbol() + '%';
  }
  
  // Recalculate all
  calcPositionSize();
  calcRiskReward();
  calcCompound();
  calcBrokerage();
  calcOptionPayoff();
}

// ===========================
// Mobile Drawer Navigation
// ===========================

function toggleMobileMenu() {
  var drawer = document.getElementById('mobileDrawer');
  var overlay = document.getElementById('drawerOverlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
}

function closeMobileDrawer() {
  var drawer = document.getElementById('mobileDrawer');
  var overlay = document.getElementById('drawerOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ===========================
// Section Navigation
// ===========================

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
  
  // Show target section
  var target = document.getElementById('section-' + sectionId);
  if (target) {
    target.classList.add('active');
  }

  // Update nav links (desktop)
  document.querySelectorAll('.nav-links a').forEach(function(a) { a.classList.remove('active'); });
  var navLink = document.querySelector('.nav-links a[onclick*="\'' + sectionId + '\'"]');
  if (navLink) navLink.classList.add('active');

  // Update mobile drawer links
  document.querySelectorAll('.mobile-drawer-links a').forEach(function(a) { a.classList.remove('active'); });
  var drawerLink = document.querySelector('.mobile-drawer-links a[onclick*="\'' + sectionId + '\'"]');
  if (drawerLink) drawerLink.classList.add('active');

  // Close mobile drawer
  closeMobileDrawer();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger chart redraw if applicable
  if (sectionId === 'compounding') {
    setTimeout(function() {
      var event = new Event('input', { bubbles: true });
      var cpFreq = document.getElementById('cp-frequency');
      if (cpFreq) cpFreq.dispatchEvent(event);
    }, 300);
  }
  if (sectionId === 'option-payoff') {
    setTimeout(function() {
      calcOptionPayoff();
    }, 300);
  }

  // Update URL hash
  if (sectionId !== 'home') {
    history.replaceState(null, '', '#' + sectionId);
  } else {
    history.replaceState(null, '', window.location.pathname);
  }
}

// ===========================
// FAQ Accordion
// ===========================

function toggleFAQ(btn) {
  var item = btn.closest('.faq-item');
  if (!item) return;
  
  // Close all other FAQs in same section
  var parent = item.closest('.faq-section');
  if (parent) {
    parent.querySelectorAll('.faq-item.active').forEach(function(el) {
      if (el !== item) {
        el.classList.remove('active');
        var q = el.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  var isActive = item.classList.contains('active');
  item.classList.toggle('active');
  btn.setAttribute('aria-expanded', String(!isActive));
}

// ===========================
// Floating Action Button (FAB)
// ===========================

function scrollToCalculator() {
  var activeSection = document.querySelector('.section.active');
  if (activeSection) {
    var calcCard = activeSection.querySelector('.calc-card');
    if (calcCard) {
      calcCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}


// ===========================
// Section Reveal on Scroll
// ===========================

function setupSectionReveal() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-section').forEach(function(el) { observer.observe(el); });
}

// ===========================
// FAB Visibility Control
// ===========================

function setupFABVisibility() {
  var fab = document.getElementById('fab-button');
  if (!fab) return;

  var hero = document.querySelector('.hero');
  if (!hero) return;
  
  var heroHeight = hero.offsetHeight;
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > heroHeight) {
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  }, { passive: true });
}

// ===========================
// Theme Toggle
// ===========================

function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var newTheme = current === 'light' ? '' : 'light';
  
  if (newTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    localStorage.setItem('tt-theme', 'light');
  } else {
    html.removeAttribute('data-theme');
    localStorage.setItem('tt-theme', 'dark');
  }
  
  // Update toggle button icons if needed (CSS handles display)
  updateThemeMeta(newTheme);
  
  // Redraw charts to match new theme
  setTimeout(function() {
    var compoundingSection = document.getElementById('section-compounding');
    if (compoundingSection && compoundingSection.classList.contains('active')) {
      calcCompound();
    }
    var optionSection = document.getElementById('section-option-payoff');
    if (optionSection && optionSection.classList.contains('active')) {
      calcOptionPayoff();
    }
  }, 50);
}

function updateThemeMeta(theme) {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = theme === 'light' ? '#f0f2f5' : '#060a15';
  }
}

function applySavedTheme() {
  var saved = localStorage.getItem('tt-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeMeta('light');
  } else if (saved === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    updateThemeMeta('dark');
  } else {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('tt-theme', 'light');
      updateThemeMeta('light');
    }
  }
}

// Apply theme before DOM paints to prevent flash
applySavedTheme();

// ===========================
// Live Calculation Triggers
// ===========================

document.addEventListener('DOMContentLoaded', function() {
  
  // ---- Position Size ----
  ['ps-account', 'ps-risk', 'ps-entry', 'ps-stoploss'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', calcPositionSize);
  });
  setupAutoSave('position-size');

  // ---- Risk Reward ----
  ['rr-entry', 'rr-stoploss', 'rr-takeprofit'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', calcRiskReward);
  });
  setupAutoSave('risk-reward');

  // ---- Compounding ----
  ['cp-principal', 'cp-monthly', 'cp-rate', 'cp-years', 'cp-frequency'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', calcCompound);
  });
  var cpFreq = document.getElementById('cp-frequency');
  if (cpFreq) cpFreq.addEventListener('change', calcCompound);
  setupAutoSave('compounding');

  // ---- Brokerage ----
  ['br-buy', 'br-sell', 'br-qty', 'br-rate'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', calcBrokerage);
  });
  var brType = document.getElementById('br-charge-type');
  if (brType) brType.addEventListener('change', calcBrokerage);
  setupAutoSave('brokerage');

  // ---- Option Payoff ----
  ['op-type', 'op-action', 'op-strike', 'op-premium', 'op-contracts', 'op-spot-min', 'op-spot-max'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calcOptionPayoff);
      el.addEventListener('change', calcOptionPayoff);
    }
  });
  setupAutoSave('option-payoff');

  // ---- Currency Initialization ----
  var curSel = document.getElementById('currency-select');
  if (curSel) curSel.value = currentCurrency;
  document.querySelectorAll('.currency-suffix, .currency-inline').forEach(function(el) {
    el.textContent = getCurrencySymbol();
  });

  // ---- Brokerage Rate Suffix ----
  var chargeType = document.getElementById('br-charge-type');
  var rateSuffix = document.getElementById('br-rate-suffix');
  if (chargeType && rateSuffix) {
    chargeType.addEventListener('change', function() {
      var sym = getCurrencySymbol();
      rateSuffix.innerHTML = this.value === 'percent' ? '%' : sym + '%';
      calcBrokerage();
    });
  }

  // ---- Close drawer on overlay click ----
  var overlay = document.getElementById('drawerOverlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileDrawer);
  }

  // ---- FAQ setup ----
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      toggleFAQ(this);
    });
  });

  // ---- Section reveal on scroll ----
  setupSectionReveal();

  // ---- FAB visibility ----
  setTimeout(setupFABVisibility, 500);

  // ---- Navbar scroll effect ----
  window.addEventListener('scroll', function() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ---- Handle window resize for charts ----
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      if (document.getElementById('section-compounding').classList.contains('active')) {
        calcCompound();
      }
      if (document.getElementById('section-option-payoff').classList.contains('active')) {
        calcOptionPayoff();
      }
    }, 300);
  });

  // ---- Check URL hash for direct section access ----
  if (window.location.hash) {
    var hash = window.location.hash.replace('#', '');
    if (hash && hash !== 'home') {
      setTimeout(function() { showSection(hash); }, 100);
    }
  }

  // ---- Initial calculations with defaults ----
  setTimeout(function() {
    
    // Position Size defaults
    var psAccount = document.getElementById('ps-account');
    if (psAccount) {
      psAccount.value = 10000;
      document.getElementById('ps-risk').value = 2;
      document.getElementById('ps-entry').value = 150;
      document.getElementById('ps-stoploss').value = 145;
      calcPositionSize();
    }

    // Risk Reward defaults
    if (document.getElementById('rr-entry')) {
      document.getElementById('rr-entry').value = 150;
      document.getElementById('rr-stoploss').value = 145;
      document.getElementById('rr-takeprofit').value = 165;
      calcRiskReward();
    }

    // Compounding defaults
    if (document.getElementById('cp-principal')) {
      document.getElementById('cp-principal').value = 10000;
      document.getElementById('cp-monthly').value = 500;
      document.getElementById('cp-rate').value = 12;
      document.getElementById('cp-years').value = 10;
      calcCompound();
    }

    // Brokerage defaults
    if (document.getElementById('br-buy')) {
      document.getElementById('br-buy').value = 150;
      document.getElementById('br-sell').value = 165;
      document.getElementById('br-qty').value = 100;
      document.getElementById('br-rate').value = 0.05;
      calcBrokerage();
    }

    // Option Payoff defaults
    if (document.getElementById('op-strike')) {
      document.getElementById('op-strike').value = 150;
      document.getElementById('op-premium').value = 5;
      document.getElementById('op-contracts').value = 1;
      document.getElementById('op-spot-min').value = 100;
      document.getElementById('op-spot-max').value = 200;
      calcOptionPayoff();
    }
    
    ['position-size', 'risk-reward', 'compounding', 'brokerage', 'option-payoff'].forEach(function(s) { saveInputs(s); });
    
  }, 100);
});


// ===========================
// Cookie Consent (GDPR / Google Consent Mode v2)
// ===========================

var COOKIE_CONSENT_KEY = 'tt-cookie-consent';

function getCookieConsent() {
  try {
    var saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function saveCookieConsent(preferences) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  updateConsentMode(preferences);
}

function updateConsentMode(preferences) {
  // Google Consent Mode v2 integration
  if (typeof gtag !== 'undefined') {
    gtag('consent', 'update', {
      'ad_storage': preferences.ad_storage || 'denied',
      'ad_user_data': preferences.ad_user_data || 'denied',
      'ad_personalization': preferences.ad_personalization || 'denied',
      'analytics_storage': preferences.analytics_storage || 'denied'
    });
  }
  
  // Set default consent for Google tags
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'update', {
    'ad_storage': preferences.ad_storage || 'denied',
    'ad_user_data': preferences.ad_user_data || 'denied',
    'ad_personalization': preferences.ad_personalization || 'denied',
    'analytics_storage': preferences.analytics_storage || 'denied'
  });
}

function showCookieBanner() {
  var banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.classList.add('visible');
  }
}

function hideCookieBanner() {
  var banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.classList.remove('visible');
    // Remove from DOM after transition
    setTimeout(function() {
      if (banner) banner.style.display = 'none';
    }, 500);
  }
}

function acceptAllCookies() {
  saveCookieConsent({
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
    timestamp: new Date().toISOString()
  });
  hideCookieBanner();
  showToast('Cookies accepted. Thank you!', 'success');
}

function rejectAllCookies() {
  saveCookieConsent({
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    timestamp: new Date().toISOString()
  });
  hideCookieBanner();
  showToast('Privacy preferences saved.', 'info');
}

function openCookiePreferences() {
  var modal = document.getElementById('cookie-preferences-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeCookiePreferences() {
  var modal = document.getElementById('cookie-preferences-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function saveCookiePreferences() {
  var adStorage = document.getElementById('cookie-ad-storage');
  var adPersonalization = document.getElementById('cookie-ad-personalization');
  var analyticsStorage = document.getElementById('cookie-analytics-storage');
  
  saveCookieConsent({
    ad_storage: adStorage && adStorage.checked ? 'granted' : 'denied',
    ad_user_data: adStorage && adStorage.checked ? 'granted' : 'denied',
    ad_personalization: adPersonalization && adPersonalization.checked ? 'granted' : 'denied',
    analytics_storage: analyticsStorage && analyticsStorage.checked ? 'granted' : 'denied',
    timestamp: new Date().toISOString()
  });
  
  closeCookiePreferences();
  hideCookieBanner();
  showToast('Preferences saved!', 'success');
}

function initCookieConsent() {
  // Set default consent to denied initially (before user makes choice)
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
  });
  
  // Check for existing consent
  var existing = getCookieConsent();
  if (existing) {
    updateConsentMode(existing);
  } else {
    // Show banner after a brief delay
    setTimeout(showCookieBanner, 1000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
} else {
  initCookieConsent();
}

