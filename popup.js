let demoMode = false; // Default: real API
let port = chrome.runtime.connect({ name: "popup" });

function showLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const content = document.querySelector(".content");
    if (loadingOverlay && content) {
        loadingOverlay.style.display = "flex";
        content.classList.add("loading");
    }
    const elementsToClear = ["price-caption", "price-value", "priceChange", "satsPerUsd", "slogan"];
    elementsToClear.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = "";
        }
    });
}

function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const content = document.querySelector(".content");
    if (loadingOverlay && content) {
        loadingOverlay.style.display = "none";
        content.classList.remove("loading");
    }
}

port.onMessage.addListener((msg) => {
    const { btcData, mode, demoModeState } = msg;
    if (demoModeState !== undefined) {
        demoMode = demoModeState;
        const toggleDemoButton = document.getElementById("toggleDemo");
        if (toggleDemoButton) {
            toggleDemoButton.textContent = "Demo";
            if (demoMode) {
                toggleDemoButton.classList.add("active");
            } else {
                toggleDemoButton.classList.remove("active");
            }
        }
    }
    if (!btcData) {
        const status = document.getElementById("status");
        if (status) {
            status.textContent = "Error fetching data!";
        }
        const elementsToClear = ["price-caption", "price-value", "satsPerUsd", "priceChange", "slogan"];
        elementsToClear.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = "";
            }
        });
        const modeImage = document.getElementById("modeImage");
        if (modeImage) {
            modeImage.src = "images/hodl.png";
        }
        hideLoading();
        return;
    }

    updateUI(btcData, mode);
    hideLoading();
});

function updateUI(btcData, mode) {
    const price = btcData.current_price;
    const priceChange = btcData.price_change_percentage_24h;

    const priceCaption = document.getElementById("price-caption");
    const priceValue = document.getElementById("price-value");
    const satsPerUsd = document.getElementById("satsPerUsd");
    const priceChangeElement = document.getElementById("priceChange");
    const slogan = document.getElementById("slogan");
    const modeImage = document.getElementById("modeImage");

    if (priceCaption) priceCaption.textContent = "Bitcoin:";
    if (priceValue) priceValue.textContent = `$${price.toLocaleString()}`;
    if (satsPerUsd) satsPerUsd.textContent = `1 USD = ${calculateSatsPerUsd(price)} sats`;
    if (priceChangeElement) priceChangeElement.textContent = determineModeComment(priceChange);
    if (slogan) slogan.innerHTML = getRandomSlogan(mode);
    if (modeImage) {
        if (mode === "sale") {
            modeImage.src = "images/sale.png";
        } else if (mode === "moon") {
            modeImage.src = "images/moon.png";
        } else {
            modeImage.src = "images/hodl.png";
        }
    }

    const status = document.getElementById("status");
    if (status) {
        status.textContent = "";
    }
}

// Ensure the spinner and overlay disappear when data is loaded
port.onDisconnect.addListener(() => {
    hideLoading();
});

function calculateSatsPerUsd(price) {
    return (1 / (price / 100_000_000)).toFixed(0); // Sats per 1 USD
}

function determineMode(priceChange) {
    if (priceChange < -3) return "sale";
    if (priceChange > 3) return "moon";
    return "hodl";
}

function determineModeComment(priceChange) {
    const absChange = Math.abs(priceChange).toFixed(1);
    if (priceChange > 0) {
        return `Up ${absChange}% last 24h 📈`;
    } else {
        return `Down ${absChange}% last 24h 📉`;
    }
}

// Handle demo mode toggle
document.getElementById("toggleDemo").addEventListener("click", () => {
    demoMode = !demoMode;
    const toggleDemoButton = document.getElementById("toggleDemo");
    if (toggleDemoButton) {
        toggleDemoButton.textContent = "Demo";
        if (demoMode) {
            toggleDemoButton.classList.add("active");
        } else {
            toggleDemoButton.classList.remove("active");
        }
    }

    // Inform background script to switch modes
    if (port) {
        port.postMessage({ action: "toggleDemoMode", enabled: demoMode });
    }
});

// Show loading spinner when popup opens
showLoading();

// Listen for updates from the background script
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "updateUI") {
        updateUI(msg.btcData, msg.mode);
    }
});

// Hide demo button in production
const manifest = chrome.runtime.getManifest();
if (manifest.update_url) {
    const toggleDemoButton = document.getElementById("toggleDemo");
    if (toggleDemoButton) {
        toggleDemoButton.style.display = "none";
    }
}
