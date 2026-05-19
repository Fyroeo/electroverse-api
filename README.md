# electroverse-api

[![npm version](https://img.shields.io/npm/v/electroverse-api.svg)](https://www.npmjs.com/package/electroverse-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

> **⚠️ WARNING:** This project is an unofficial wrapper. The underlying Electroverse API schema is manually reverse-engineered and subject to change without notice.

An **unofficial**, robust, and typed TypeScript client library for interacting with the **Electroverse** EV Charging API. 

This package handles the platform's Kasada bot protection and decodes Mapbox Vector Tiles, providing JSON data for charging stations.

## Features
- 🛡️ **Bot Bypass**: Uses headless Chromium via Playwright Stealth to solve Kasada challenges.
- 🗺️ **Vector Tile Decoding**: Intercepts and parses Mapbox Protobufs (`.pbf`) into GeoJSON-like objects.
- ⚡ **GraphQL Helpers**: Provides query methods to get only the specific data you need.
- 🟦 **Typed**: Fully regenerated TypeScript interfaces built directly from the live Electroverse GraphQL schema.

---

## Installation

Install the package alongside `playwright` (which is required to bypass the bot protection):

```bash
npm install electroverse-api playwright
```

After installation, ensure the Playwright browsers are installed:
```bash
npx playwright install chromium
```

---

## Quick Start

### Initialization
Because the client needs to navigate to Electroverse to acquire the Kasada security tokens, you must `init()` the client before making requests.

```typescript
import { PlaywrightElectroverseClient } from 'electroverse-api';

async function main() {
  const client = new PlaywrightElectroverseClient();
  
  // Launches stealth browser and solves Kasada challenges
  await client.init(true); // set headless: false for debugging

  // Make your requests here...

  // Always close the browser when finished
  await client.close();
}
```

---

## API Reference

### 🗺️ Discovery (Map Tiles)
Fetching all charging stations via standard GraphQL is impossible due to performance limitations. Electroverse serves "all stations" using a tile-based REST API designed for Mapbox. 

This client intercepts these tiles and decodes the Protobufs:

```typescript
// Fetch Tile (Zoom 8, X 127, Y 84)
const stations = await client.getMapTile(8, 127, 84);

console.log(`Found ${stations.length} charging stations in this tile!`);
console.log(stations[0].properties);
// Output: { id: '1109280', status: 'AVAILABLE', speed: 'RAPID' ... }
```

### ⚡ Station Helpers
Once you have a station's primary key (`pk`) from the map tiles, you can query its real-time data with targeted helpers so you only download what you need:

```typescript
const pk = '1109280';

// 1. Fetch the station payload
const fullStation = await client.getStation(pk);

// 2. Fetch ONLY the pricing and tariffs for the connectors
const pricing = await client.getStationPricing(pk);

// 3. Fetch ONLY the real-time availability of the chargers
const status = await client.getStationStatus(pk);

// 4. Fetch ONLY the specific facilities (WIFI, Toilets, Cafe)
const facilities = await client.getStationFacilities(pk);

// 5. Fetch ONLY the supported access methods (RFID, Plug&Charge, App)
const capabilities = await client.getStationCapabilities(pk);

// 6. Fetch ONLY the opening hours
const hours = await client.getStationOpeningHours(pk);

// 7. Fetch ONLY the operator's support contact details
const operator = await client.getStationOperator(pk);

// 8. Fetch ONLY the active notices or downtime reports
const alerts = await client.getStationAlerts(pk);
```

### Global Network Data
You can also query network-wide data, such as promotional discounts:

```typescript
// Get promotional offers and subscription discounts
const offers = await client.getOffers(true); // true = include upcoming offers
console.log(offers[0].name);

// Get station image URLs
const photos = await client.getLocationPhotos('1109280');
```

---

## Advanced: Raw Requests
If you need to query something not covered by the helpers, you can pass raw GraphQL queries directly:

```typescript
const customQuery = `
  query getCustom($pk: String!) {
    chargingLocation(pk: $pk) {
      name
      address
    }
  }
`;

const data = await client.rawRequest(customQuery, { pk: '1109280' });
console.log(data.chargingLocation.name);
```

## Bypassing Kasada (Technical Details)
The Electroverse GraphQL API is protected by **Kasada**, an anti-bot system deployed via Vercel. Standard Node.js HTTP clients (like `fetch`, `axios`, or `graphql-request`) will be instantly blocked with a `429 Too Many Requests` or `400 Bad Request` error due to TLS fingerprinting and missing dynamic header tokens (`x-kpsdk-*`).

This library uses `playwright-extra` with `puppeteer-extra-plugin-stealth`. By launching a headless browser context, the Kasada challenge scripts are executed. The client then executes the GraphQL `fetch` calls directly within the authenticated browser context (`page.evaluate`), inheriting the required cookies, TLS fingerprints, and security tokens.
