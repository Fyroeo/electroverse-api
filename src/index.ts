import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { Page, Browser } from 'playwright';
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';
import { Buffer } from 'buffer';
import {
  ChargingLocationMetadataType, 
  QueryChargingLocationArgs, 
  QueryLocationPhotosArgs,
  QueryOffersArgs,
  DiscountInterface,
  VerifyTokenPayload,
  MutationVerifyTokenArgs,
  DiscountVariety
} from './generated/graphql';

export * from './generated/graphql';

// Tell playwright-extra to use the stealth plugin
chromium.use(stealth());

const GET_CHARGING_LOCATION = `
  query chargingLocation($pk: String!) {
    chargingLocation(pk: $pk) {
      pk
      chargingLocationPk
      externalId
      name
      address
      city
      postalCode
      country
      coordinates
      isEjnLocation
      facilities
      locationFacilities
      alerts {
        type
        content
        __typename
      }
      operator {
        pk
        name
        logoDark
        hasPartneredLocations
        supportPhoneNumber
        supportWebsite
        supportEmail
        isGreenEnergy
        __typename
      }
      openingHours {
        twentyFourSeven
        regularHours {
          weekday
          periodBegin
          periodEnd
          __typename
        }
        __typename
      }
      capabilities {
        ... on OperatorApp {
          androidAppUrl
          iosAppUrl
          name
          __typename
        }
        ... on Web {
          name
          site
          __typename
        }
        __typename
      }
      evses {
        totalCount
        edges {
          node {
            pk
            physicalReference
            supportsInAppCharging
            status
            connectors {
              edges {
                node {
                  pk
                  isChargingFree
                  priceComponents {
                    ... on ConsumptionRate {
                      currencyDetails {
                        symbol
                        decimalDigits
                        minorUnitConversion
                        __typename
                      }
                      unitAmount
                      perUnit
                      __typename
                    }
                    __typename
                  }
                  kilowatts
                  speed
                  standard {
                    pk
                    humanName
                    name
                    __typename
                  }
                  pricing {
                    discount {
                      variety
                      __typename
                      ... on CountryDiscountType {
                        campaignType
                        __typename
                      }
                    }
                    __typename
                  }
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

const GET_LOCATION_PHOTOS = `
  query GetLocationPhotos($chargingLocation: String!) {
    locationPhotos(chargingLocation: $chargingLocation) {
      pk
      photo
      updatedAt
      photoType
    }
  }
`;

const GET_OFFERS = `
  query GetOffers($includeUpcoming: Boolean!, $varieties: [DiscountVariety!]) {
    offers(includeUpcoming: $includeUpcoming, varieties: $varieties) {
      name
      variety
      rate
      validFrom
      validTo
      ... on CountryDiscountType {
        country {
          name
          alpha2
        }
        campaignType
      }
      ... on SubscriptionOfferDiscountType {
        name
      }
      ... on GlobalDiscountType {
        name
      }
    }
  }
`;

const GET_STATION_PRICING = `
  query getStationPricing($pk: String!) {
    chargingLocation(pk: $pk) {
      evses {
        edges {
          node {
            connectors {
              edges {
                node {
                  pk
                  isChargingFree
                  priceComponents {
                    ... on ConsumptionRate {
                      currencyDetails { symbol decimalDigits minorUnitConversion }
                      unitAmount perUnit __typename
                    }
                    ... on TimeRate {
                      currencyDetails { symbol decimalDigits minorUnitConversion }
                      unitAmount perUnit __typename
                    }
                    ... on ParkingTimeRate {
                      currencyDetails { symbol decimalDigits minorUnitConversion }
                      unitAmount perUnit __typename
                    }
                    ... on ConnectionFee {
                      currencyDetails { symbol decimalDigits minorUnitConversion }
                      unitAmount __typename
                    }
                    ... on VAT { __typename }
                  }
                  pricing { discount { variety __typename } __typename }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_STATION_STATUS = `
  query getStationStatus($pk: String!) {
    chargingLocation(pk: $pk) {
      evses {
        edges {
          node {
            pk
            physicalReference
            status
            connectors {
              edges {
                node {
                  pk
                  kilowatts
                  speed
                  standard { pk name humanName __typename }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_STATION_FACILITIES = `
  query getStationFacilities($pk: String!) {
    chargingLocation(pk: $pk) {
      facilities
      locationFacilities
    }
  }
`;

const GET_STATION_CAPABILITIES = `
  query getStationCapabilities($pk: String!) {
    chargingLocation(pk: $pk) {
      capabilities {
        ... on EJNApp { name __typename }
        ... on OperatorApp { androidAppUrl iosAppUrl name __typename }
        ... on QRCode { name __typename }
        ... on RFID { name __typename }
        ... on TeslaCar { name __typename }
        ... on Card { name __typename }
        ... on Contactless { name __typename }
        ... on Free { name __typename }
        ... on Web { name site __typename }
        ... on PlugAndCharge { name __typename }
        __typename
      }
    }
  }
`;

const GET_STATION_OPENING_HOURS = `
  query getStationOpeningHours($pk: String!) {
    chargingLocation(pk: $pk) {
      openingHours {
        twentyFourSeven
        regularHours {
          weekday
          periodBegin
          periodEnd
        }
      }
    }
  }
`;

const GET_STATION_OPERATOR = `
  query getStationOperator($pk: String!) {
    chargingLocation(pk: $pk) {
      operator {
        pk
        name
        logoDark
        hasPartneredLocations
        supportPhoneNumber
        supportWebsite
        supportEmail
        isGreenEnergy
      }
    }
  }
`;

const GET_STATION_ALERTS = `
  query getStationAlerts($pk: String!) {
    chargingLocation(pk: $pk) {
      alerts {
        type
        content
      }
    }
  }
`;

const VERIFY_TOKEN = `
  mutation VerifyToken($token: String) {
    verifyToken(token: $token) {
      payload
    }
  }
`;

export class PlaywrightElectroverseClient {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private baseURL: string;

  /**
   * Instantiates a new Electroverse client.
   * @param baseURL The GraphQL proxy endpoint used for communication. Defaults to the official Electroverse proxy.
   */
  constructor(baseURL: string = 'https://electroverse.com/api/proxy/graphql') {
    this.baseURL = baseURL;
  }

  /**
   * Initializes the stealth browser instance and acquires the necessary Kasada bot protection tokens.
   * MUST be called before any other API requests.
   * @param headless Whether to run the browser in the background. Highly recommended to keep true unless debugging.
   */
  async init(headless: boolean = true) {
    this.browser = await chromium.launch({ headless });
    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    this.page = await context.newPage();

    console.log("Navigating to electroverse.com to acquire tokens...");
    await this.page.goto('https://electroverse.com/map', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Closes the browser and cleans up resources.
   * Always call this when you are finished making API requests.
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  private async executeQuery<T>(query: string, variables: Record<string, any>): Promise<T> {
    if (!this.page) {
      throw new Error("Client is not initialized. Call init() first.");
    }

    const endpoint = this.baseURL;

    const result = await this.page.evaluate(async ({ query, variables, endpoint }) => {
      const match = query.match(/(query|mutation)\s+([A-Za-z0-9_]+)/);
      const operationName = match ? match[2] : undefined;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify({ operationName, query, variables })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
      }
      return await response.json();
    }, { query, variables, endpoint });

    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    return result.data as T;
  }

  /**
   * Fetches detailed metadata for a specific charging location (EVSEs, connectors, pricing, facilities, etc.).
   * @param pk The unique primary key identifier for the location (e.g., '1109280').
   * @returns Detailed location data or null if not found.
   */
  async getChargingLocation(pk: string): Promise<ChargingLocationMetadataType | null> {
    const data = await this.executeQuery<{ chargingLocation: ChargingLocationMetadataType }>(
      GET_CHARGING_LOCATION,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Retrieves an array of images associated with a charging location.
   * @param chargingLocation The unique identifier (pk) for the location.
   * @returns Array of photo objects or null if none exist.
   */
  async getLocationPhotos(chargingLocation: string): Promise<any[] | null> {
    const data = await this.executeQuery<{ locationPhotos: any[] }>(
      GET_LOCATION_PHOTOS,
      { chargingLocation }
    );
    return data?.locationPhotos ?? null;
  }

  /**
   * Performs a raw GraphQL query against the Electroverse API.
   * @param query The raw GraphQL query or mutation string.
   * @param variables Optional variables required by the query.
   * @returns The raw typed response data.
   */
  async rawRequest<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    return this.executeQuery<T>(query, variables || {});
  }

  /**
   * Alias for getChargingLocation to fetch the full location payload.
   * @param pk The primary key of the location.
   */
  async getStation(pk: string): Promise<ChargingLocationMetadataType | null> {
    return this.getChargingLocation(pk);
  }

  /**
   * Fetches only the pricing and price components for the connectors at a station.
   * Very lightweight compared to the full station payload.
   */
  async getStationPricing(pk: string): Promise<Pick<ChargingLocationMetadataType, 'evses'> | null> {
    const data = await this.executeQuery<{ chargingLocation: Pick<ChargingLocationMetadataType, 'evses'> }>(
      GET_STATION_PRICING,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Fetches the real-time availability status and speed details for the connectors at a station.
   */
  async getStationStatus(pk: string): Promise<Pick<ChargingLocationMetadataType, 'evses'> | null> {
    const data = await this.executeQuery<{ chargingLocation: Pick<ChargingLocationMetadataType, 'evses'> }>(
      GET_STATION_STATUS,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Fetches the specific facilities available at or near a station.
   */
  async getStationFacilities(pk: string): Promise<Pick<ChargingLocationMetadataType, 'facilities' | 'locationFacilities'> | null> {
    const data = await this.executeQuery<{ chargingLocation: Pick<ChargingLocationMetadataType, 'facilities' | 'locationFacilities'> }>(
      GET_STATION_FACILITIES,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Fetches the supported access and payment capabilities for a station.
   */
  async getStationCapabilities(pk: string): Promise<Pick<ChargingLocationMetadataType, 'capabilities'> | null> {
    const data = await this.executeQuery<{ chargingLocation: Pick<ChargingLocationMetadataType, 'capabilities'> }>(
      GET_STATION_CAPABILITIES,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Fetches the operating hours for a station.
   */
  async getStationOpeningHours(pk: string): Promise<Pick<ChargingLocationMetadataType, 'openingHours'> | null> {
    const data = await this.executeQuery<{ chargingLocation: Pick<ChargingLocationMetadataType, 'openingHours'> }>(
      GET_STATION_OPENING_HOURS,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Fetches details about the operator of a station.
   */
  async getStationOperator(pk: string): Promise<Pick<ChargingLocationMetadataType, 'operator'> | null> {
    const data = await this.executeQuery<{ chargingLocation: Pick<ChargingLocationMetadataType, 'operator'> }>(
      GET_STATION_OPERATOR,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Fetches any active alerts or notices for a station.
   */
  async getStationAlerts(pk: string): Promise<Pick<ChargingLocationMetadataType, 'alerts'> | null> {
    const data = await this.executeQuery<{ chargingLocation: Pick<ChargingLocationMetadataType, 'alerts'> }>(
      GET_STATION_ALERTS,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  /**
   * Fetches available promotional discounts, subscription offers, and global campaigns.
   * @param includeUpcoming Whether to include offers that are not yet active.
   * @param varieties Optional filter for specific discount varieties (e.g., [DiscountVariety.Country]).
   * @returns Array of offers or null.
   */
  async getOffers(includeUpcoming: boolean, varieties?: DiscountVariety[]): Promise<DiscountInterface[] | null> {
    const data = await this.executeQuery<{ offers: DiscountInterface[] }>(
      GET_OFFERS,
      { includeUpcoming, varieties }
    );
    return data?.offers ?? null;
  }

  /**
   * Verifies the status of an authentication token.
   * @param token The token string to verify.
   * @returns The verification payload.
   */
  async verifyToken(token?: string): Promise<VerifyTokenPayload | null> {
    const data = await this.executeQuery<{ verifyToken: VerifyTokenPayload }>(
      VERIFY_TOKEN,
      { token }
    );
    return data?.verifyToken ?? null;
  }

  /**
   * Downloads, decrypts, and decodes an Electroverse Mapbox Vector Tile into a GeoJSON-like array of charging stations.
   * This is extremely fast for querying thousands of stations across a wide geographical area.
   * @param z The zoom level of the tile.
   * @param x The X coordinate of the tile.
   * @param y The Y coordinate of the tile.
   * @param excludeNonEjnLocations Whether to exclude stations that are not part of the native Electroverse network. Defaults to false.
   * @returns An array of station objects with `id`, `properties`, and `type`.
   */
  async getMapTile(z: number, x: number, y: number, excludeNonEjnLocations: boolean = false): Promise<any[]> {
    if (!this.page) {
      throw new Error("Client is not initialized. Call init() first.");
    }

    const tileUrl = `https://electroverse.com/api/proxy/rest/locations/tiles/elastic/${z}/${x}/${y}?exclude_non_ejn_locations=${excludeNonEjnLocations}`;
    
    const base64Data = await this.page.evaluate(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const buffer = await response.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, tileUrl);

    const buffer = Buffer.from(base64Data as string, 'base64');
    const pbf = new Pbf(buffer);
    const tile = new VectorTile(pbf);
    
    const stations: any[] = [];
    for (const layerName in tile.layers) {
      const layer = tile.layers[layerName];
      for (let i = 0; i < layer.length; i++) {
        const feature = layer.feature(i);
        stations.push({
          id: feature.id,
          properties: feature.properties,
          type: feature.type // 1 = Point
        });
      }
    }

    return stations;
  }
}
