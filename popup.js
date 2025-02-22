let demoMode = false; // Default: real API
let port = chrome.runtime.connect({ name: "popup" });

port.onMessage.addListener((msg) => {
    const { btcData, mode, demoModeState } = msg;
    if (demoModeState !== undefined) {
        demoMode = demoModeState;
        const toggleDemoButton = document.getElementById("toggleDemo");
        toggleDemoButton.textContent = "Demo";
        if (demoMode) {
            toggleDemoButton.classList.add("active");
        } else {
            toggleDemoButton.classList.remove("active");
        }
    }
    if (!btcData) {
        document.getElementById("status").textContent = "Error fetching data!";
        document.getElementById("price-caption").textContent = "Bitcoin:";
        document.getElementById("price-value").textContent = "--";
        document.getElementById("satsPerUsd").textContent = "--";
        document.getElementById("priceChange").textContent = "--";
        document.getElementById("slogan").innerHTML = "--";
        document.getElementById("modeImage").src = "";
        return;
    }

    const price = btcData.current_price;
    const priceChange = btcData.price_change_percentage_24h;

    document.getElementById("price-caption").textContent = "Bitcoin:";
    document.getElementById("price-value").textContent = `$${price.toLocaleString()}`;
    document.getElementById("satsPerUsd").textContent = `1 USD = ${calculateSatsPerUsd(price)} sats`;
    document.getElementById("priceChange").textContent = determineModeComment(priceChange);

    // Get and display random slogan
    document.getElementById("slogan").innerHTML = getRandomSlogan(mode);

    // Set the image based on the mode
    const modeImage = document.getElementById("modeImage");
    if (mode === "sale") {
        modeImage.src = "images/sale.png";
    } else if (mode === "moon") {
        modeImage.src = "images/moon.png";
    } else {
        modeImage.src = "images/hodl.png";
    }

    // Remove loading status
    document.getElementById("status").textContent = "";
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
    toggleDemoButton.textContent = "Demo";
    if (demoMode) {
        toggleDemoButton.classList.add("active");
    } else {
        toggleDemoButton.classList.remove("active");
    }

    // Inform background script to switch modes
    if (port) {
        port.postMessage({ action: "toggleDemoMode", enabled: demoMode });
    }
});

// Run the update when popup opens
if (port) {
    port.postMessage({ action: "updateUI" });
}
