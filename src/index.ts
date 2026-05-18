import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { Page, Browser } from 'playwright';
import { 
  ChargingLocationMetadataType, 
  QueryChargingLocationArgs, 
  QueryLocationPhotosArgs 
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
    locationPhotos(chargingLocation: $chargingLocation)
  }
`;

export class PlaywrightElectroverseClient {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private baseURL: string;

  constructor(baseURL: string = 'https://electroverse.com/api/proxy/graphql') {
    this.baseURL = baseURL;
  }

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

  async getChargingLocation(pk: string): Promise<ChargingLocationMetadataType | null> {
    const data = await this.executeQuery<{ chargingLocation: ChargingLocationMetadataType }>(
      GET_CHARGING_LOCATION,
      { pk }
    );
    return data?.chargingLocation ?? null;
  }

  async getLocationPhotos(chargingLocation: string): Promise<string[] | null> {
    const data = await this.executeQuery<{ locationPhotos: string[] }>(
      GET_LOCATION_PHOTOS,
      { chargingLocation }
    );
    return data?.locationPhotos ?? null;
  }

  async rawRequest<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    return this.executeQuery<T>(query, variables || {});
  }
}
