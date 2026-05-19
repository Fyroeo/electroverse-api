export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A scalar representing geographical coordinates (latitude, longitude) in JSON format. */
  PointJSON: { input: unknown; output: unknown; }
};

/** An alert or notice related to a charging location. */
export type AlertType = {
  __typename?: 'AlertType';
  /** The descriptive content of the alert. */
  content?: Maybe<Scalars['String']['output']>;
  /** The type of alert (e.g., 'INFO', 'WARNING'). */
  type?: Maybe<AlertTypeEnum>;
};

/** The category of an alert. */
export enum AlertTypeEnum {
  Alert = 'ALERT',
  Discount = 'DISCOUNT',
  Report = 'REPORT'
}

/** Represents the operating hours information for a charging location, detailing whether it's open continuously or has specific daily hours. */
export type BaseOpeningTimes = {
  __typename?: 'BaseOpeningTimes';
  /** Details the specific daily opening and closing times for the charging location, applicable when it's not open 24/7. */
  regularHours?: Maybe<Array<RegularHoursType>>;
  /** Indicates if the charging location is open 24 hours a day, 7 days a week. */
  twentyFourSeven?: Maybe<Scalars['Boolean']['output']>;
};

/** The type of marketing campaign for a discount. */
export enum CampaignType {
  OperatorMarketing = 'OPERATOR_MARKETING',
  Plunge = 'PLUNGE'
}

/** A union of all possible access or payment capabilities supported by a location. */
export type CapabilityType = Card | Contactless | EjnApp | Free | OperatorApp | PlugAndCharge | QrCode | Rfid | TeslaCar | Web;

/** Represents an access card or payment card that is accepted or required at a charging location. */
export type Card = {
  __typename?: 'Card';
  /** The name or type of the card. */
  name?: Maybe<Scalars['String']['output']>;
};

/** Represents metadata for a specific physical charging connector. */
export type ChargingConnectorMetadataType = {
  __typename?: 'ChargingConnectorMetadataType';
  /** Indicates if charging from this connector is currently free of charge. */
  isChargingFree?: Maybe<Scalars['Boolean']['output']>;
  /** The maximum power output of the connector in kilowatts (kW). */
  kilowatts?: Maybe<Scalars['Int']['output']>;
  /** A unique identifier for the connector. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** A list of pricing components detailing the cost structure for using this connector. */
  priceComponents?: Maybe<Array<PriceComponentType>>;
  /** Pricing information including applicable discounts. */
  pricing?: Maybe<PricingType>;
  /** The speed category of the connector (e.g., 'FAST', 'RAPID'). */
  speed?: Maybe<ConnectorSpeed>;
  /** The physical standard or plug type of the connector (e.g., Type 2, CCS). */
  standard?: Maybe<EjnConnectorStandardType>;
};

/** Represents metadata and operational details for an Electric Vehicle Supply Equipment (EVSE) at a charging location. */
export type ChargingEvseMetadataType = {
  __typename?: 'ChargingEVSEMetadataType';
  /** A connection to a list of available physical connectors on this EVSE. */
  connectors?: Maybe<GenericConnectorConnectionTypeConnection>;
  /** A physical reference code or identifier for the EVSE, possibly its serial number. */
  physicalReference?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for the EVSE. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** The current operational status of the EVSE (e.g., 'AVAILABLE', 'UNKNOWN'). */
  status?: Maybe<EvseStatus>;
  /** Indicates whether this EVSE supports initiating charging sessions via the app. */
  supportsInAppCharging?: Maybe<Scalars['Boolean']['output']>;
};

/** Represents comprehensive metadata for a charging location (e.g., a charging station or hub). */
export type ChargingLocationMetadataType = {
  __typename?: 'ChargingLocationMetadataType';
  /** The physical street address of the charging location. */
  address?: Maybe<Scalars['String']['output']>;
  /** Active alerts or notices regarding the location (e.g., out of order warnings). */
  alerts?: Maybe<Array<AlertType>>;
  /** Supported payment and access methods (e.g., RFID, App, Contactless). */
  capabilities?: Maybe<Array<CapabilityType>>;
  /** A unique string identifier for the charging location. */
  chargingLocationPk?: Maybe<Scalars['String']['output']>;
  /** The city where the charging location is situated. */
  city?: Maybe<Scalars['String']['output']>;
  /** The geographical coordinates (latitude and longitude) of the location. */
  coordinates?: Maybe<Scalars['PointJSON']['output']>;
  /** The country where the location is situated, usually as an ISO code. */
  country?: Maybe<Scalars['String']['output']>;
  /** A connection to the EVSEs (charging posts/points) available at this location. */
  evses?: Maybe<GenericEvseConnectionTypeConnection>;
  /** An external identifier, often a UUID used by the operator's backend. */
  externalId?: Maybe<Scalars['String']['output']>;
  /** A list of facilities available at the charging location (e.g., 'WIFI', 'CAFE'). */
  facilities?: Maybe<Array<FacilityType>>;
  /** Indicates if this location is part of the Electroverse network (EJN). */
  isEjnLocation?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates if the user has marked this location as a favourite. */
  isFavourite?: Maybe<Scalars['Boolean']['output']>;
  /** A list of facilities nearby the charging location. */
  locationFacilities?: Maybe<Array<FacilityType>>;
  /** The display name of the charging location. */
  name?: Maybe<Scalars['String']['output']>;
  /** The opening hours for the charging location. */
  openingHours?: Maybe<BaseOpeningTimes>;
  /** The operator managing this charging location. */
  operator?: Maybe<LocationOperatorType>;
  /** A unique integer identifier for the charging location. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** The postal or zip code of the charging location. */
  postalCode?: Maybe<Scalars['String']['output']>;
};

/** A fixed pricing component applied once per charging session connection. */
export type ConnectionFee = {
  __typename?: 'ConnectionFee';
  /** Currency details including symbol and minor unit conversion. */
  currencyDetails?: Maybe<CurrencyType>;
  /** The fixed fee in minor currency units. */
  unitAmount?: Maybe<Scalars['Int']['output']>;
};

/** The speed category of a connector. */
export enum ConnectorSpeed {
  Fast = 'FAST',
  Rapid = 'RAPID',
  Slow = 'SLOW',
  Ultra = 'ULTRA'
}

/** A pricing component that charges based on energy consumed (e.g., per kWh). */
export type ConsumptionRate = {
  __typename?: 'ConsumptionRate';
  /** Currency details including symbol and minor unit conversion. */
  currencyDetails?: Maybe<CurrencyType>;
  /** The unit of consumption (e.g., 'kWh'). */
  perUnit?: Maybe<Scalars['String']['output']>;
  /** The cost per unit in minor currency units (e.g., pence or cents). */
  unitAmount?: Maybe<Scalars['Int']['output']>;
};

/** Indicates support for contactless credit/debit card payments. */
export type Contactless = {
  __typename?: 'Contactless';
  name?: Maybe<Scalars['String']['output']>;
};

/** A discount that applies to a specific country. */
export type CountryDiscountType = DiscountInterface & {
  __typename?: 'CountryDiscountType';
  /** The internal type of marketing campaign for this discount. */
  campaignType?: Maybe<CampaignType>;
  /** The country where this discount is valid. */
  country?: Maybe<CountryType>;
  /** A paginated list of operators that participate in this country discount. */
  displayOperators?: Maybe<DisplayOperatorTypeConnection>;
  name?: Maybe<Scalars['String']['output']>;
  pk?: Maybe<Scalars['Int']['output']>;
  rate?: Maybe<Scalars['Float']['output']>;
  validFrom?: Maybe<Scalars['String']['output']>;
  validTo?: Maybe<Scalars['String']['output']>;
  variety?: Maybe<DiscountVariety>;
};

/** Represents geographical country metadata. */
export type CountryType = {
  __typename?: 'CountryType';
  /** The two-letter ISO country code. */
  alpha2?: Maybe<Scalars['String']['output']>;
  /** The three-letter ISO country code. */
  alpha3?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Indicates if new user signups are supported in this country. */
  isSignupSupported?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates if physical items (like RFID cards) can be delivered here. */
  isValidDeliveryLocation?: Maybe<Scalars['Boolean']['output']>;
  /** The common name of the country. */
  name?: Maybe<Scalars['String']['output']>;
  /** The numeric ISO country code. */
  numeric?: Maybe<Scalars['String']['output']>;
  /** The official full name of the country. */
  officialName?: Maybe<Scalars['String']['output']>;
};

/** Details about a currency used for pricing. */
export type CurrencyType = {
  __typename?: 'CurrencyType';
  /** The number of decimal digits the currency uses. */
  decimalDigits?: Maybe<Scalars['Int']['output']>;
  /** The conversion factor from major to minor units (e.g., 100 for GBP to pence). */
  minorUnitConversion?: Maybe<Scalars['Int']['output']>;
  /** The display symbol for the currency (e.g., '£'). */
  symbol?: Maybe<Scalars['String']['output']>;
};

/** An interface representing a common structure for all discount offers. */
export type DiscountInterface = {
  /** The display name of the offer or discount. */
  name?: Maybe<Scalars['String']['output']>;
  /** A unique integer identifier for the offer. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** The rate of the discount (e.g., 0.15 for 15% off). */
  rate?: Maybe<Scalars['Float']['output']>;
  /** The ISO datetime when the discount becomes valid. */
  validFrom?: Maybe<Scalars['String']['output']>;
  /** The ISO datetime when the discount expires. */
  validTo?: Maybe<Scalars['String']['output']>;
  /** The category or variety of the discount. */
  variety?: Maybe<DiscountVariety>;
};

/** The different categories of discounts available. */
export enum DiscountVariety {
  Country = 'COUNTRY',
  Global = 'GLOBAL',
  SubscriptionOffer = 'SUBSCRIPTION_OFFER'
}

/** A minimal representation of an operator used for display purposes within discount contexts. */
export type DisplayOperatorType = {
  __typename?: 'DisplayOperatorType';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

/** A paginated connection of operators that are eligible for a specific discount. */
export type DisplayOperatorTypeConnection = {
  __typename?: 'DisplayOperatorTypeConnection';
  edges?: Maybe<Array<Maybe<DisplayOperatorTypeEdge>>>;
  pageInfo?: Maybe<PageInfo>;
};

/** An edge wrapping a display operator node. */
export type DisplayOperatorTypeEdge = {
  __typename?: 'DisplayOperatorTypeEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node?: Maybe<DisplayOperatorType>;
};

/** Indicates support for starting sessions via the Electroverse (EJN) app. */
export type EjnApp = {
  __typename?: 'EJNApp';
  name?: Maybe<Scalars['String']['output']>;
};

/** Represents the physical standard of a connector (e.g., Type 2, CCS, CHAdeMO). */
export type EjnConnectorStandardType = {
  __typename?: 'EJNConnectorStandardType';
  /** A human-readable name for the connector standard. */
  humanName?: Maybe<Scalars['String']['output']>;
  /** An internal identifier or enum name for the standard. */
  name?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for the connector standard. */
  pk?: Maybe<Scalars['Int']['output']>;
};

/** The operational status of an EVSE. */
export enum EvseStatus {
  Available = 'AVAILABLE',
  Blocked = 'BLOCKED',
  Charging = 'CHARGING',
  Inoperative = 'INOPERATIVE',
  Outoforder = 'OUTOFORDER',
  Planned = 'PLANNED',
  Removed = 'REMOVED',
  Reserved = 'RESERVED',
  Unknown = 'UNKNOWN'
}

/** Facilities available at or near a charging location. */
export enum FacilityType {
  Covered = 'COVERED',
  Entertainment = 'ENTERTAINMENT',
  FoodDrink = 'FOOD_DRINK',
  Lighting = 'LIGHTING',
  Lodging = 'LODGING',
  Nature = 'NATURE',
  Parking = 'PARKING',
  PhoneSignal = 'PHONE_SIGNAL',
  Retail = 'RETAIL',
  Toilets = 'TOILETS',
  Transport = 'TRANSPORT'
}

/** Indicates that charging is completely free. */
export type Free = {
  __typename?: 'Free';
  name?: Maybe<Scalars['String']['output']>;
};

/** Represents a connection of generic connector types available at an EVSE. */
export type GenericConnectorConnectionTypeConnection = {
  __typename?: 'GenericConnectorConnectionTypeConnection';
  /** A list of edges containing connector nodes. */
  edges?: Maybe<Array<GenericConnectorConnectionTypeEdge>>;
};

/** An edge wrapping a generic connector type node. */
export type GenericConnectorConnectionTypeEdge = {
  __typename?: 'GenericConnectorConnectionTypeEdge';
  /** The actual connector metadata. */
  node?: Maybe<ChargingConnectorMetadataType>;
};

/** This type represents a connection of EVSEs available at a charging location. */
export type GenericEvseConnectionTypeConnection = {
  __typename?: 'GenericEVSEConnectionTypeConnection';
  /** A list of edges containing EVSE nodes. */
  edges?: Maybe<Array<GenericEvseConnectionTypeEdge>>;
  /** The total number of EVSEs in this connection. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An edge wrapping an EVSE node. */
export type GenericEvseConnectionTypeEdge = {
  __typename?: 'GenericEVSEConnectionTypeEdge';
  /** The actual EVSE metadata. */
  node?: Maybe<ChargingEvseMetadataType>;
};

/** A discount that applies globally across the network. */
export type GlobalDiscountType = DiscountInterface & {
  __typename?: 'GlobalDiscountType';
  name?: Maybe<Scalars['String']['output']>;
  pk?: Maybe<Scalars['Int']['output']>;
  rate?: Maybe<Scalars['Float']['output']>;
  validFrom?: Maybe<Scalars['String']['output']>;
  validTo?: Maybe<Scalars['String']['output']>;
  variety?: Maybe<DiscountVariety>;
};

/** This type represents a charging location operator. */
export type LocationOperatorType = {
  __typename?: 'LocationOperatorType';
  /** Indicates whether the operator has partnered locations. */
  hasPartneredLocations?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the operator uses green or renewable energy. */
  isGreenEnergy?: Maybe<Scalars['Boolean']['output']>;
  /** The URL to the operator's logo, optimized for dark backgrounds. */
  logoDark?: Maybe<Scalars['String']['output']>;
  /** The name of the charging location operator. */
  name?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for the operator. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** The customer support email address for the operator. */
  supportEmail?: Maybe<Scalars['String']['output']>;
  /** The customer support phone number for the operator. */
  supportPhoneNumber?: Maybe<Scalars['String']['output']>;
  /** The URL to the operator's customer support website. */
  supportWebsite?: Maybe<Scalars['String']['output']>;
};

/** A single photo associated with a charging location. */
export type LocationPhotoType = {
  __typename?: 'LocationPhotoType';
  /** The URL of the photo. */
  photo?: Maybe<Scalars['String']['output']>;
  /** The category/type of the photo. */
  photoType?: Maybe<Scalars['String']['output']>;
  /** The unique integer identifier of the photo. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** When the photo was last updated. */
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Verifies the validity of an authentication or session token. */
  verifyToken?: Maybe<VerifyTokenPayload>;
};


export type MutationVerifyTokenArgs = {
  token?: InputMaybe<Scalars['String']['input']>;
};

/** Indicates support for starting sessions via the operator's specific app. */
export type OperatorApp = {
  __typename?: 'OperatorApp';
  androidAppUrl?: Maybe<Scalars['String']['output']>;
  iosAppUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** Pagination context information. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** Indicates if there are more items following the current page. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Indicates if there are items preceding the current page. */
  hasPreviousPage: Scalars['Boolean']['output'];
};

/** A pricing component that charges based on time spent parked, typically applied after charging is complete. */
export type ParkingTimeRate = {
  __typename?: 'ParkingTimeRate';
  /** Currency details including symbol and minor unit conversion. */
  currencyDetails?: Maybe<CurrencyType>;
  /** The unit of time (e.g., '/min'). */
  perUnit?: Maybe<Scalars['String']['output']>;
  /** The cost per unit of time in minor currency units. */
  unitAmount?: Maybe<Scalars['Int']['output']>;
};

/** Indicates support for Plug & Charge (ISO 15118) automatic authentication. */
export type PlugAndCharge = {
  __typename?: 'PlugAndCharge';
  name?: Maybe<Scalars['String']['output']>;
};

/** A union of all possible price components that make up the total cost of charging. */
export type PriceComponentType = ConnectionFee | ConsumptionRate | ParkingTimeRate | TimeRate | Vat;

/** Wrapper for pricing information and active discounts. */
export type PricingType = {
  __typename?: 'PricingType';
  /** An active discount offer applied to the pricing, if any. */
  discount?: Maybe<DiscountInterface>;
};

/** Indicates support for starting sessions by scanning a QR code. */
export type QrCode = {
  __typename?: 'QRCode';
  name?: Maybe<Scalars['String']['output']>;
};

/** WIP: Manually reverse engineered schema from running Electroverse */
export type Query = {
  __typename?: 'Query';
  /** Fetches metadata and details for a specific charging location using its primary key. */
  chargingLocation?: Maybe<ChargingLocationMetadataType>;
  /** Retrieves a list of photos associated with a specific charging location. */
  locationPhotos?: Maybe<Array<LocationPhotoType>>;
  /** Fetches available subscription offers and discounts, optionally including upcoming ones and filtering by variety. */
  offers?: Maybe<Array<DiscountInterface>>;
};


/** WIP: Manually reverse engineered schema from running Electroverse */
export type QueryChargingLocationArgs = {
  pk?: InputMaybe<Scalars['String']['input']>;
};


/** WIP: Manually reverse engineered schema from running Electroverse */
export type QueryLocationPhotosArgs = {
  chargingLocation?: InputMaybe<Scalars['String']['input']>;
};


/** WIP: Manually reverse engineered schema from running Electroverse */
export type QueryOffersArgs = {
  includeUpcoming: Scalars['Boolean']['input'];
  varieties?: InputMaybe<Array<DiscountVariety>>;
};

/** Indicates support for starting sessions using an RFID card or fob. */
export type Rfid = {
  __typename?: 'RFID';
  name?: Maybe<Scalars['String']['output']>;
};

/** Defines a specific time period on a given weekday when the location is open. */
export type RegularHoursType = {
  __typename?: 'RegularHoursType';
  /** The time the location opens, usually in HH:MM format. */
  periodBegin?: Maybe<Scalars['String']['output']>;
  /** The time the location closes, usually in HH:MM format. */
  periodEnd?: Maybe<Scalars['String']['output']>;
  /** The day of the week (e.g., 1 for Monday, 7 for Sunday). */
  weekday?: Maybe<Scalars['Int']['output']>;
};

/** A discount provided as part of a premium subscription offer. */
export type SubscriptionOfferDiscountType = DiscountInterface & {
  __typename?: 'SubscriptionOfferDiscountType';
  name?: Maybe<Scalars['String']['output']>;
  pk?: Maybe<Scalars['Int']['output']>;
  rate?: Maybe<Scalars['Float']['output']>;
  validFrom?: Maybe<Scalars['String']['output']>;
  validTo?: Maybe<Scalars['String']['output']>;
  variety?: Maybe<DiscountVariety>;
};

/** Indicates support for Tesla vehicles (typically Superchargers). */
export type TeslaCar = {
  __typename?: 'TeslaCar';
  name?: Maybe<Scalars['String']['output']>;
};

/** A pricing component that charges based on time spent charging. */
export type TimeRate = {
  __typename?: 'TimeRate';
  /** Currency details including symbol and minor unit conversion. */
  currencyDetails?: Maybe<CurrencyType>;
  /** The unit of time (e.g., '/min'). */
  perUnit?: Maybe<Scalars['String']['output']>;
  /** The cost per unit of time in minor currency units. */
  unitAmount?: Maybe<Scalars['Int']['output']>;
};

/** Represents the Value Added Tax component of the price. */
export type Vat = {
  __typename?: 'VAT';
  _empty?: Maybe<Scalars['Boolean']['output']>;
};

/** The payload returned after verifying an authentication token. */
export type VerifyTokenPayload = {
  __typename?: 'VerifyTokenPayload';
  /** The decoded token payload or success confirmation. */
  payload?: Maybe<Scalars['String']['output']>;
};

/** Indicates support for web-based payment portals. */
export type Web = {
  __typename?: 'Web';
  name?: Maybe<Scalars['String']['output']>;
  site?: Maybe<Scalars['String']['output']>;
};
