# Bitcoin Sale Extension

## Overview
Bitcoin Sale is a fun and lightweight Chrome extension that humorously notifies users about Bitcoin price changes. It operates in three modes:

- **Sale Mode**: Displays if Bitcoin is significantly down in the last 24 hours, encouraging users to "buy more sats."
- **HODL Mode**: Advises users to keep their Bitcoin holdings when price changes are minimal.
- **To the Moon Mode**: Celebrates a price increase, reinforcing a "HODL and enjoy the ride" mindset.

## Features
- Real-time Bitcoin price updates using CoinGecko API
- Mode determination (Sale, HODL, Moon)
- Dynamic badge text
- Random fun messages
- Demo mode

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/miketlk/bitcoin-sale-extension.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click "Load unpacked" and select the cloned repository folder.

## Usage
1. Click on the Bitcoin Sale extension icon in the Chrome toolbar.
2. The pop-up window will display the current Bitcoin price, 24-hour change, and a fun message.
3. Toggle the demo mode by clicking the "Demo" button in the top right corner of the pop-up window.

## Development

### Project Structure
Overview of the project files and their purposes.

```
bitcoin-sale-extension/
│── icons/
│── images/
│── background.js
│── manifest.json
│── popup.html
│── popup.js
│── README.md
│── slogans.js
│── styles.css
```

### Key Files
- **popup.js**: Handles fetching data, updating UI, and logic for mode determination.
- **background.js**: Updates the badge text dynamically to show Bitcoin price in thousands.
- **slogans.js**: Stores predefined slogans/messages per mode and returns a random one per request.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.
