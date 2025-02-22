const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin";
let currentMode = "hodl"; // Default mode
let demoMode = false; // Default: real API
let intervalId = null; // Stores interval for demo mode cycling

const demoData = [
  { current_price: 88214, price_change_percentage_24h: -6.3 },
  { current_price: 91220, price_change_percentage_24h: -5.3 },
  { current_price: 93402, price_change_percentage_24h: -4.2 },
  { current_price: 95000, price_change_percentage_24h: -4.0 },
  { current_price: 99500, price_change_percentage_24h: -1.0 },
  { current_price: 100000, price_change_percentage_24h: 0 },
  { current_price: 101000, price_change_percentage_24h: 0.8 },
  { current_price: 105000, price_change_percentage_24h: 3.0 },
  { current_price: 110000, price_change_percentage_24h: 4.5 },
  { current_price: 115000, price_change_percentage_24h: 5.5 },
  { current_price: 119920, price_change_percentage_24h: 6.4 }
];

let demoIndex = 0;
let demoDirection = 1;

function getNextDemoData() {
  const data = demoData[demoIndex];
  demoIndex += demoDirection;
  if (demoIndex === demoData.length || demoIndex === -1) {
    demoDirection *= -1;
    demoIndex += demoDirection;
  }
  return data;
}

async function fetchBitcoinData() {
    if (demoMode) {
        return getNextDemoData(); // Fetch demo data
    } else {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data[0];
        } catch (error) {
            return null;
        }
    }
}

function formatPriceForBadge(price) {
    let priceInThousands = price / 1000;
    return priceInThousands < 100 ? priceInThousands.toFixed(1) : Math.round(priceInThousands).toString();
}

function determineMode(priceChange) {
    if (priceChange <= -5) {
        return "sale"; // Bitcoin is on sale
    } else if (priceChange >= 5) {
        return "moon"; // Bitcoin is mooning
    }
    return "hodl"; // Neutral state
}

function updateIcon(mode) {
    let iconPath = "icons/icon_hodl32.png";
    if (mode === "sale") {
        iconPath = "icons/icon_sale32.png";
    } else if (mode === "moon") {
        iconPath = "icons/icon_moon32.png";
    }
    chrome.action.setIcon({ path: iconPath });
}

async function updateBadge() {
    const btcData = await fetchBitcoinData();
    if (!btcData) {
        chrome.action.setBadgeText({ text: "ERR" });
        chrome.action.setBadgeBackgroundColor({ color: "#ff8080" });
        if (port) {
            port.postMessage({ btcData: null, mode: "error", demoModeState: demoMode });
        }
        return;
    }

    const price = btcData.current_price;
    const priceChange = btcData.price_change_percentage_24h;
    const mode = determineMode(priceChange);

    // Set the badge text with price in thousands
    chrome.action.setBadgeText({ text: formatPriceForBadge(price) });
    chrome.action.setBadgeBackgroundColor({ color: "#ff9800" });

    // Update the toolbar icon
    updateIcon(mode);

    // Send data to popup
    if (port) {
        port.postMessage({ btcData, mode, demoModeState: demoMode });
    }
}

let port = null;

// Handle long-lived connection with popup
chrome.runtime.onConnect.addListener(function(p) {
    port = p;
    port.onDisconnect.addListener(() => {
        port = null;
    });
    port.onMessage.addListener((msg) => {
        if (msg.action === "toggleDemoMode") {
            demoMode = msg.enabled;
            if (demoMode) {
                clearInterval(intervalId);
                updateBadge(); // Fetch mock data immediately
                intervalId = setInterval(updateBadge, 3000); // Update demo mode every 3 seconds
            } else {
                clearInterval(intervalId);
                updateBadge(); // Fetch real API data immediately
                intervalId = setInterval(updateBadge, 60000); // Update real API every 1 min
            }
        }
    });
    updateBadge(); // Fetch data immediately after connection
});

// Initial fetch and interval setup
updateBadge();
intervalId = setInterval(updateBadge, 60000);

// Ensure the extension starts updating the badge immediately when Chrome starts
chrome.runtime.onStartup.addListener(() => {
    updateBadge();
    intervalId = setInterval(updateBadge, 60000);
});
