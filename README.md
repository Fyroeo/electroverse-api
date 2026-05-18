# Electroverse API Client

> **⚠️ WARNING:** This project is a Work In Progress (WIP). The underlying API schema is manually reverse-engineered and subject to change without notice.

An **unofficial** TypeScript client library and data pipeline architecture for interacting with the **Electroverse** API. 

This repository demonstrates how to bypass bot protection (Kasada) to successfully fetch real-time EV charging station data, pricing, and connector availability.

## Architecture & Data Pipeline

The Electroverse platform uses a hybrid approach to serve data to its frontend. To efficiently scrape or interact with the platform, the following two-step data pipeline is required:

### 1. Station Discovery (REST + Mapbox Vector Tiles)
Fetching all charging stations via GraphQL is impossible due to performance limitations and server-side restrictions. Instead, the platform serves "all stations" using a tile-based REST API designed for Mapbox.

The endpoint `/api/proxy/rest/locations/tiles/elastic/{z}/{x}/{y}` returns binary **Protobuf (.pbf / MVT)** data. Decoding this binary data yields thousands of station records per tile, containing basic information and the crucial primary key (`_id`).

### 2. Station Details (GraphQL)
Once the primary key (`_id`) is obtained from the vector tiles, it is passed to the GraphQL API (`/api/proxy/graphql`). The GraphQL API provides:
* Pricing and tariffs
* Real-time connector status (Available, Charging, Offline)
* Facilities, opening hours, and supported access methods (RFID, App, Contactless)

## Project Structure

* `src/index.ts`: The core Playwright stealth client that executes GraphQL queries.
* `src/generated/graphql.ts`: Auto-generated TypeScript types based on the schema.
* `electroverse.graphql`: The manually reverse-engineered GraphQL schema definitions.
* `codegen.ts`: Configuration file for generating TypeScript types from the schema.
* `examples/`: Contains examples on how to use the client.
  * `basic-query.ts`: Simple CLI example demonstrating how to fetch station details.
  * `decode-tile.ts`: Script demonstrating how to download and parse Mapbox Vector Tiles (.pbf) into JSON.
  * `web-server.ts`: Node.js/Express backend that proxies map tiles and GraphQL requests to bypass Kasada.
  * `public/index.html`: The Maplibre GL JS frontend interface for testing map rendering.

## Bypassing Kasada Bot Protection

The Electroverse GraphQL API is protected by **Kasada**, a anti-bot system deployed via Vercel. Standard Node.js HTTP clients (like `fetch`, `axios`, or `graphql-request`) will be instantly blocked with a `429 Too Many Requests` or `400 Bad Request` error due to TLS fingerprinting and missing dynamic header tokens (`x-kpsdk-*`).

**The Solution:**
This client utilizes `playwright` with `puppeteer-extra-plugin-stealth`. By launching a headless Chromium browser and navigating to the site, the Kasada challenge scripts are executed natively. The client then injects the GraphQL `fetch` calls directly into the authenticated browser context (`page.evaluate`), inheriting the required cookies, TLS fingerprints, and security tokens.

*(Note: Server-side schema introspection is explicitly disabled by the Electroverse GraphQL engine. The schema must be reverse-engineered from network traffic.)*

## Installation

Install the required dependencies, including Playwright and the Mapbox decoding libraries:

```bash
npm install
npm run build
npx playwright install chromium
```

## Usage Examples

### 1. Fetching Rich Station Details (GraphQL)

The `PlaywrightElectroverseClient` automatically handles the Kasada bypass and executes strongly-typed GraphQL queries.

```typescript
import { PlaywrightElectroverseClient } from './src/index';

async function fetchStationDetails() {
  const client = new PlaywrightElectroverseClient();
  
  // Set headless to false for debugging the browser automation
  await client.init({ headless: true }); 

  // Pass the primary key (pk) obtained from the map tiles
  const location = await client.getChargingLocation('XXX');
  
  console.log(location.name);
  console.log(location.operator.name);
  console.log(`Connectors: ${location.evses.totalCount}`);

  await client.close();
}
```

### 2. Decoding Map Tiles for Discovery (Protobuf)

Use the REST API and `@mapbox/vector-tile` to extract thousands of station IDs from geographic bounding boxes.

```typescript
import { PlaywrightElectroverseClient } from './src/index';
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';

async function discoverStations() {
  const client = new PlaywrightElectroverseClient();
  await client.init({ headless: true });

  // Fetch a specific map tile (Zoom 4, X 8, Y 5)
  const url = 'https://electroverse.com/api/proxy/rest/locations/tiles/elastic/4/8/5';
  
  // Extract the binary ArrayBuffer via the browser context
  const base64Data = await client['page'].evaluate(async (tileUrl) => {
    const response = await fetch(tileUrl);
    const buffer = await response.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }, url);

  // Decode Protobuf Mapbox Vector Tile in Node.js
  const buffer = Buffer.from(base64Data, 'base64');
  const tile = new VectorTile(new Pbf(buffer));
  
  // Extract the primary keys from the 'hits' layer
  const stations = [];
  const layer = tile.layers['hits'];
  
  for (let i = 0; i < layer.length; i++) {
    stations.push(layer.feature(i).properties);
  }

  console.log(`Extracted ${stations.length} stations from tile.`);
  // Output: { _id: '1507868', current_status: 'AVAILABLE', max_speed: 'FAST' ... }

  await client.close();
}
```

## Available Scripts

* `npm run build`: Compiles the TypeScript source into `dist/` (ESM and CJS).
* `npm run generate`: Re-runs GraphQL codegen to update TypeScript interfaces if `electroverse.graphql` is modified.
* `npx tsx examples/basic-query.ts`: Runs the GraphQL client example.
* `npx tsx examples/decode-tile.ts`: Runs the Mapbox Vector Tile decoding example.
* `npm start`: Runs the web server example.
