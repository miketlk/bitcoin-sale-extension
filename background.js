const API_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin";
const UPDATE_PERIOD = 60000; // 60 seconds
const UPDATE_PERIOD_DEMO = 3000; // 3 seconds
const RETRY_INTERVAL = 2000; // 2 seconds
const RETRY_ATTEMPTS = 3;
const FRESHNESS_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
const RATE_LIMIT_PERIOD = 55000; // 55 seconds in milliseconds
const IDLE_DETECTION_INTERVAL = 15; // 15 seconds
const FETCH_AWAIT_INTERVAL = 1000; // 1 second
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

let latestData = null;
let latestDataTimestamp = null;
let lastApiCallTimestamp = 0;
let fetchInProgress = false;

async function fetchBitcoinData() {
    while (fetchInProgress) {
        console.log("Fetch in progress. Waiting for it to complete.");
        await new Promise(resolve => setTimeout(resolve, FETCH_AWAIT_INTERVAL));
    }

    const now = Date.now();
    console.log("Fetching data at", now);
    if (now - lastApiCallTimestamp < RATE_LIMIT_PERIOD) {
        console.log("Rate limit exceeded. Using cached data if available.");
        if (latestData && (now - latestDataTimestamp) <= FRESHNESS_TIME) {
            return latestData;
        } else {
            return null;
        }
    }

    if (demoMode) {
        return getNextDemoData(); // Fetch demo data
    } else {
        for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
            try {
                fetchInProgress = true;
                const response = await fetch(API_URL);
                console.log("Fetching data using API. Attempt:", attempt, "Response status: ", response.status);
                if (response.ok) {
                    const data = await response.json();
                    latestData = data[0];
                    latestDataTimestamp = now;
                    lastApiCallTimestamp = now;
                    console.log("Data fetched successfully. Data:", data);
                    console.log("Latest data timestamp:", latestDataTimestamp);
                    console.log("Last API call timestamp:", lastApiCallTimestamp);
                    console.log("Latest data:", latestData);
                }
                fetchInProgress = false;

                if (!response.ok) {
                    if (response.status === 429) {
                        console.log("Rate limit exceeded. Scheduling next update after UPDATE_PERIOD.");
                        await new Promise(resolve => setTimeout(resolve, UPDATE_PERIOD));
                        return null;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return latestData;
            } catch (error) {
                fetchInProgress = false;
                if (attempt < RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                } else {
                    return null;
                }
            }
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

let retryTimeoutId = null;

async function updateBadge() {
    let btcData = await fetchBitcoinData();
    if (!btcData) {
        // Check if latest data is still fresh (within 10 minutes)
        if (latestData && (Date.now() - latestDataTimestamp) <= FRESHNESS_TIME) {
            btcData = latestData;
        } else {
            chrome.action.setBadgeText({ text: "?" });
            chrome.action.setBadgeBackgroundColor({ color: "#808080" });
            if (port) {
                try {
                    port.postMessage({ btcData: null, mode: "error", demoModeState: demoMode });
                } catch (error) {
                    console.log("Failed to send message to popup:", error);
                }
            }
            // Retry after 1 minute if there's an error
            if (!retryTimeoutId) {
                retryTimeoutId = setTimeout(updateBadge, UPDATE_PERIOD);
            }
            return;
        }
    }

    // Clear retry timeout if data is successfully fetched
    if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
    }

    const price = btcData.current_price;
    const priceChange = btcData.price_change_percentage_24h;
    const mode = determineMode(priceChange);

    // Set the badge text with price in thousands
    chrome.action.setBadgeText({ text: formatPriceForBadge(price) });
    chrome.action.setBadgeBackgroundColor({ color: "#ff9800" });

    // Update the toolbar icon
    updateIcon(mode);

    // Send data to popup if connected
    if (port) {
        try {
            port.postMessage({ btcData, mode, demoModeState: demoMode });
        } catch (error) {
            console.log("Failed to send message to popup:", error);
        }
    } else {
        console.warn("No active port to send message to popup.");
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
                intervalId = setInterval(updateBadge, UPDATE_PERIOD_DEMO);
            } else {
                clearInterval(intervalId);
                updateBadge(); // Fetch real API data immediately
                intervalId = setInterval(updateBadge, UPDATE_PERIOD);
            }
        }
    });
    updateBadge(); // Fetch data immediately after connection
});

// Initial fetch and interval setup
updateBadge();
intervalId = setInterval(updateBadge, UPDATE_PERIOD);

// Ensure the extension starts updating the badge immediately when Chrome starts
chrome.runtime.onStartup.addListener(() => {
    updateBadge();
    intervalId = setInterval(updateBadge, UPDATE_PERIOD);
});

// Ensure the extension starts updating the badge immediately when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    updateBadge();
    intervalId = setInterval(updateBadge, UPDATE_PERIOD);
});

// Use alarms to keep the service worker active
chrome.alarms.create("updateBadgeAlarm", { periodInMinutes: UPDATE_PERIOD / 60000 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "updateBadgeAlarm") {
        updateBadge();
    }
});

// Implement Idle API to avoid suspension of background script
function setupIdleDetection() {
    chrome.idle.setDetectionInterval(IDLE_DETECTION_INTERVAL); // Set the detection interval in seconds
    chrome.idle.onStateChanged.addListener((newState) => {
        if (newState === "active") {
            console.log("User is active. Updating badge.");
            updateBadge();
        } else if (newState === "idle") {
            console.log("User is idle. No need to update badge frequently.");
        }
    });
}

setupIdleDetection();