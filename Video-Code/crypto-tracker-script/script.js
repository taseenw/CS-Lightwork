/**
 * Crypto Trading Tracker - Google Apps Script
 * This would be a .gs file in Apps Script, but not supported elsewhere so just copy paste the code
 * 
 * SETUP:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any code in there and paste this entire script
 * 4. Add your CoinGecko API key below (see API Key Setup section)
 * 5. Add your trades to COIN_TRADES object below
 * 6. Save (Ctrl+S or Cmd+S)
 * 7. Go back to your sheet and refresh the page
 * 8. Use the custom menu: Crypto Tracker > Setup All Coins
 * 9. Grant permissions when asked
 * 10. Use menu: Crypto Tracker > Populate All Trades
 * 
 * API KEY SETUP:
 * This script uses CoinGecko API to fetch live crypto prices.
 * - Get a free API key at: https://www.coingecko.com/en/api/pricing
 * - Free tier: 10,000 calls/month (more than enough for personal use)
 * - Once you have your key, paste it below where it says 'YOUR_API_KEY_HERE'
 * 
 * ALTERNATIVE: If you don't want to use CoinGecko, you can:
 * - Remove the getCoinPrice() function calls
 * - Manually enter prices in the summary section
 * - Or modify getCoinPrice() to use a different API (CoinCap, CryptoCompare, etc.)
 * 
 * TO ADD NEW COINS:
 * - Add trades to COIN_TRADES object below
 * - Use menu: Crypto Tracker > Setup All Coins
 * 
 * TO ADD TRADES:
 * - Use menu: Crypto Tracker > Add New Trade (while on that coin's tab)
 * - Or add to COIN_TRADES below and run Populate All Trades
 */

// ============== CONFIGURATION ==============

const COINGECKO_API_KEY = 'Your API Key';
const BASE_CURRENCY = 'usd';

// Add all your trades here organized by coin
// Format: { date: 'YYYY-MM-DD', type: 'BUY' or 'SELL', quantity: number, price: price in your base currency }
const COIN_TRADES = {
  'SOL': [
    { date: '2025-11-14', type: 'BUY', quantity: 1.5, price: 145.20 },
    { date: '2025-11-28', type: 'BUY', quantity: 0.8, price: 138.50 },
    { date: '2025-12-05', type: 'BUY', quantity: 1.2, price: 142.80 },
  ],
  'BTC': [
    { date: '2025-10-15', type: 'BUY', quantity: 0.015, price: 95000 },
    { date: '2025-11-20', type: 'BUY', quantity: 0.01, price: 98500 },
    { date: '2025-12-01', type: 'BUY', quantity: 0.008, price: 102000 },
  ],
  'ETH': [
    { date: '2025-11-01', type: 'BUY', quantity: 0.5, price: 3200 },
    { date: '2025-11-18', type: 'BUY', quantity: 0.3, price: 3350 },
  ]
};

// Map coin symbols to CoinGecko IDs (add more as needed), or whatever IDs for the asset API
const COIN_IDS = {
  'SOL': 'solana',
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
};


/**
 * Helper function to find last row with data
 * This prevents adding trades to wrong rows when empty formatted rows exist
 */
function getLastDataRow(sheet) {
  const data = sheet.getRange('A:A').getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] !== '') {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Setup all coin tabs from COIN_TRADES configuration
 * Creates a new tab for each coin with formatted headers and summary section
 */
function setupAllCoins() {
  for (const coinSymbol of Object.keys(COIN_TRADES)) {
    setupSheet(coinSymbol);
  }
  SpreadsheetApp.getUi().alert('All coin tabs created! Now run "Populate All Trades".');
}

/**
 * Setup a single coin sheet with headers and formatting
 * @param {string} coinSymbol - The coin symbol (e.g., 'BTC', 'ETH', 'SOL')
 */
function setupSheet(coinSymbol) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const currency = BASE_CURRENCY.toUpperCase();
  
  let sheet = ss.getSheetByName(coinSymbol);
  if (!sheet) {
    sheet = ss.insertSheet(coinSymbol);
  } else {
    sheet.clear();
  }
  
  const headers = [
    'Date', 'Type', 'Quantity', `Price (${currency})`, `Total (${currency})`, 
    'Running Total', 'Avg Buy Price', `Portfolio Value (${currency})`
  ];
  
  sheet.getRange('A1:H1').setValues([headers]);
  sheet.getRange('A1:H1')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#e0e0e0');
  
  const summaryLabels = [
    [`${coinSymbol} SUMMARY`],
    [`Current Price (${currency}):`],
    ['Total Holdings:'],
    [`Portfolio Value (${currency}):`],
    [''],
    ['Last Updated:']
  ];
  
  sheet.getRange('J1:J6').setValues(summaryLabels);
  sheet.getRange('J1:K1')
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground('#cfe2f3');
  
  sheet.getRange('J2:J6').setFontWeight('bold');
  sheet.autoResizeColumns(1, 11);
  sheet.setFrozenRows(1);
}

/**
 * Populate all coin sheets with trades from COIN_TRADES configuration
 */
function populateAllTrades() {
  let totalCoins = 0;
  for (const [coinSymbol, trades] of Object.entries(COIN_TRADES)) {
    if (!trades || trades.length === 0) continue;
    populateTrades(coinSymbol, trades);
    totalCoins++;
  }
  SpreadsheetApp.getUi().alert(`Populated ${totalCoins} coins!`);
}

/**
 * Populate a single coin sheet with its trades
 * @param {string} coinSymbol - The coin symbol
 * @param {Array} trades - Array of trade objects
 */
function populateTrades(coinSymbol, trades) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(coinSymbol);
  if (!sheet) return;
  if (!trades || trades.length === 0) return;
  
  const lastRow = getLastDataRow(sheet);
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 8).clearContent();
  }
  
  let runningTotal = 0;
  let totalCost = 0;
  const rows = [];
  
  trades.forEach((trade, index) => {
    const totalAmount = trade.quantity * trade.price;
    
    if (trade.type.toUpperCase() === 'BUY') {
      runningTotal += trade.quantity;
      totalCost += totalAmount;
    } else {
      const avgPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
      totalCost -= avgPrice * trade.quantity;
      runningTotal -= trade.quantity;
    }
    
    const avgBuyPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
    const rowNum = index + 2;
    const portfolioFormula = `=F${rowNum}*$K$2`;
    
    rows.push([
      trade.date,
      trade.type.toUpperCase(),
      trade.quantity,
      trade.price,
      totalAmount,
      runningTotal,
      avgBuyPrice,
      portfolioFormula
    ]);
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
    sheet.getRange(2, 3, rows.length, 1).setNumberFormat('0.0000');
    sheet.getRange(2, 4, rows.length, 2).setNumberFormat('$0.00');
    sheet.getRange(2, 6, rows.length, 1).setNumberFormat('0.0000');
    sheet.getRange(2, 7, rows.length, 2).setNumberFormat('$0.00');
  }
  
  updateSummary(coinSymbol);
}

/**
 * Update the summary section with live price and portfolio calculations
 * @param {string} coinSymbol - The coin symbol (optional, uses active sheet if not provided)
 */
function updateSummary(coinSymbol) {
  const sheet = coinSymbol ? 
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(coinSymbol) : 
    SpreadsheetApp.getActiveSheet();
  
  if (!coinSymbol) coinSymbol = sheet.getName();
  
  const lastRow = getLastDataRow(sheet);
  const price = getCoinPrice(coinSymbol);
  
  sheet.getRange('K2').setValue(price).setNumberFormat('$0.00');
  
  if (lastRow > 1) {
    sheet.getRange('K3').setFormula(`=F${lastRow}`).setNumberFormat('0.0000');
  }
  
  sheet.getRange('K4').setFormula('=K2*K3').setNumberFormat('$0.00');
  sheet.getRange('K6').setValue(new Date()).setNumberFormat('yyyy-mm-dd hh:mm');
}

/**
 * Fetch current price for a coin from CoinGecko API
 * @param {string} coinSymbol - The coin symbol
 * @returns {number} Current price or 0 if fetch fails
 */
function getCoinPrice(coinSymbol) {
  const coinId = COIN_IDS[coinSymbol];
  if (!coinId || !COINGECKO_API_KEY || COINGECKO_API_KEY === 'YOUR_API_KEY_HERE') {
    return 0;
  }
  
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=${BASE_CURRENCY}&ids=${coinId}&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    const response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
    
    if (response.getResponseCode() !== 200) return 0;
    
    const data = JSON.parse(response.getContentText());
    return data[coinId] && data[coinId][BASE_CURRENCY] ? data[coinId][BASE_CURRENCY] : 0;
  } catch (error) {
    return 0;
  }
}

// ============== MANUAL TRADE ENTRY ==============

/**
 * Add a previous trade with manual date and price entry
 * Prompts user for all trade details
 */
function addNewTradeToCurrentSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const coinSymbol = sheet.getName();
  const ui = SpreadsheetApp.getUi();
  const currency = BASE_CURRENCY.toUpperCase();
  
  const dateResponse = ui.prompt(`Add ${coinSymbol} Trade - Date`, 'Format: YYYY-MM-DD', ui.ButtonSet.OK_CANCEL);
  if (dateResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const typeResponse = ui.prompt(`Add ${coinSymbol} Trade - Type`, 'BUY or SELL', ui.ButtonSet.OK_CANCEL);
  if (typeResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const qtyResponse = ui.prompt(`Add ${coinSymbol} Trade - Quantity`, 'e.g., 0.5', ui.ButtonSet.OK_CANCEL);
  if (qtyResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const priceResponse = ui.prompt(`Add ${coinSymbol} Trade - Price (${currency})`, 'e.g., 185.00', ui.ButtonSet.OK_CANCEL);
  if (priceResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const date = dateResponse.getResponseText().trim();
  const type = typeResponse.getResponseText().toUpperCase();
  const quantity = parseFloat(qtyResponse.getResponseText());
  const price = parseFloat(priceResponse.getResponseText());
  
  if (!date || (type !== 'BUY' && type !== 'SELL') || isNaN(quantity) || isNaN(price)) {
    ui.alert('Invalid input.');
    return;
  }
  
  const lastRow = getLastDataRow(sheet);
  let runningTotal = 0;
  let totalCost = 0;
  
  if (lastRow > 1) {
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    data.forEach(row => {
      if (row[1] === 'BUY') {
        runningTotal += row[2];
        totalCost += row[2] * row[3];
      } else {
        const avgPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
        totalCost -= avgPrice * row[2];
        runningTotal -= row[2];
      }
    });
  }
  
  const totalAmount = quantity * price;
  
  if (type === 'BUY') {
    runningTotal += quantity;
    totalCost += totalAmount;
  } else {
    const avgPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
    totalCost -= avgPrice * quantity;
    runningTotal -= quantity;
  }
  
  const avgBuyPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
  const newRow = lastRow + 1;
  const portfolioFormula = `=F${newRow}*$K$2`;
  
  sheet.getRange(newRow, 1, 1, 8).setValues([[date, type, quantity, price, totalAmount, runningTotal, avgBuyPrice, portfolioFormula]]);
  sheet.getRange(newRow, 3).setNumberFormat('0.0000');
  sheet.getRange(newRow, 4, 1, 2).setNumberFormat('$0.00');
  sheet.getRange(newRow, 6).setNumberFormat('0.0000');
  sheet.getRange(newRow, 7, 1, 2).setNumberFormat('$0.00');
  
  updateSummary(coinSymbol);
  ui.alert(`Added ${type}: ${quantity} ${coinSymbol} @ $${price.toFixed(2)}\nNew total: ${runningTotal.toFixed(4)} ${coinSymbol}`);
}

function quickBuy() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const coinSymbol = sheet.getName();
  const ui = SpreadsheetApp.getUi();
  const currency = BASE_CURRENCY.toUpperCase();
  
  const currentPrice = getCoinPrice(coinSymbol);
  if (currentPrice === 0) {
    ui.alert('Error: Could not fetch current price.');
    return;
  }
  
  const qtyResponse = ui.prompt(
    `Quick Buy ${coinSymbol}`,
    `Current price: $${currentPrice.toFixed(2)} ${currency}\nEnter quantity:`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (qtyResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const quantity = parseFloat(qtyResponse.getResponseText());
  if (isNaN(quantity) || quantity <= 0) {
    ui.alert('Invalid quantity.');
    return;
  }
  
  const date = new Date().toISOString().split('T')[0];
  const lastRow = getLastDataRow(sheet);
  let runningTotal = 0;
  let totalCost = 0;
  
  if (lastRow > 1) {
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    data.forEach(row => {
      if (row[1] === 'BUY') {
        runningTotal += row[2];
        totalCost += row[2] * row[3];
      } else {
        const avgPrice = runningTotal > 0 ? totalCost / runningTotal : 0;
        totalCost -= avgPrice * row[2];
        runningTotal -= row[2];
      }
    });
  }
  
  const totalAmount = quantity * currentPrice;
  runningTotal += quantity;
  totalCost += totalAmount;
  
  const avgBuyPrice = totalCost / runningTotal;
  const newRow = lastRow + 1;
  const portfolioFormula = `=F${newRow}*$K$2`;
  
  sheet.getRange(newRow, 1, 1, 8).setValues([[date, 'BUY', quantity, currentPrice, totalAmount, runningTotal, avgBuyPrice, portfolioFormula]]);
  sheet.getRange(newRow, 3).setNumberFormat('0.0000');
  sheet.getRange(newRow, 4, 1, 2).setNumberFormat('$0.00');
  sheet.getRange(newRow, 6).setNumberFormat('0.0000');
  sheet.getRange(newRow, 7, 1, 2).setNumberFormat('$0.00');
  
  updateSummary(coinSymbol);
  ui.alert(`Quick Buy Complete!\n${quantity} ${coinSymbol} @ $${currentPrice.toFixed(2)}\nTotal: $${totalAmount.toFixed(2)}\nHoldings: ${runningTotal.toFixed(4)} ${coinSymbol}`);
}

// ============== PRICE REFRESH FUNCTIONS ==============

/**
 * Refresh the live price for the current sheet/coin
 */
function refreshCurrentPrice() {
  updateSummary(SpreadsheetApp.getActiveSheet().getName());
  SpreadsheetApp.getUi().alert('Price refreshed!');
}

/**
 * Refresh live prices for all coins that have trades
 */
function refreshAllPrices() {
  for (const coinSymbol of Object.keys(COIN_TRADES)) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(coinSymbol);
    if (sheet && getLastDataRow(sheet) > 1) {
      updateSummary(coinSymbol);
    }
  }
  SpreadsheetApp.getUi().alert('All prices refreshed!');
}

// ============== CUSTOM MENU ==============

/**
 * Create custom menu when spreadsheet opens
 */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Crypto Tracker')
    .addItem('Setup All Coins', 'setupAllCoins')
    .addItem('Populate All Trades', 'populateAllTrades')
    .addSeparator()
    .addItem('Quick Buy (Today, Current Price)', 'quickBuy')
    .addItem('Add Previous Trade', 'addNewTradeToCurrentSheet')
    .addSeparator()
    .addItem('Refresh Price (Current Sheet)', 'refreshCurrentPrice')
    .addItem('Refresh All Prices', 'refreshAllPrices')
    .addToUi();
}