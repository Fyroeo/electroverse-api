export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** Represents the operating hours information for a charging location, detailing whether it's open continuously or has specific daily hours. */
export type BaseOpeningTimes = {
  __typename?: 'BaseOpeningTimes';
  /** Details the specific daily opening and closing times for the charging location, applicable when it's not open 24/7. */
  regularHours?: Maybe<Scalars['String']['output']>;
  /** Indicates if the charging location is open 24 hours a day, 7 days a week. */
  twentyFourSeven?: Maybe<Scalars['Boolean']['output']>;
};

/** Represents an access card or payment card that is accepted or required at a charging location, potentially associated with a specific charging network or service. It details information about the card and related mobile applications. */
export type Card = {
  __typename?: 'Card';
  /** The URL to download the associated Android mobile application, likely used for managing the card or charging service. */
  androidAppUrl?: Maybe<Scalars['String']['output']>;
  /** The URL to download the associated iOS mobile application, likely used for managing the card or charging service. */
  iosAppUrl?: Maybe<Scalars['String']['output']>;
  /** The name or type of the card, often indicating if it's a generic card (e.g., 'CARD' for a payment card) or a specific service's card. */
  name?: Maybe<Scalars['String']['output']>;
  /** The official website for the card's issuer or the associated charging service/network. */
  site?: Maybe<Scalars['String']['output']>;
};

export type ChargingConnectorMetadataType = {
  __typename?: 'ChargingConnectorMetadataType';
  isChargingFree?: Maybe<Scalars['Boolean']['output']>;
  kilowatts?: Maybe<Scalars['Int']['output']>;
  pk?: Maybe<Scalars['Int']['output']>;
  priceComponents?: Maybe<Array<ConsumptionRate>>;
  pricing?: Maybe<PricingType>;
  speed?: Maybe<Scalars['String']['output']>;
  standard?: Maybe<EjnConnectorStandardType>;
};

/** Represents metadata and operational details for an Electric Vehicle Supply Equipment (EVSE) at a charging location. */
export type ChargingEvseMetadataType = {
  __typename?: 'ChargingEVSEMetadataType';
  /** A connection to a list of available physical connectors on this EVSE, describing their types and capabilities. */
  connectors?: Maybe<GenericConnectorConnectionTypeConnection>;
  /** A physical reference code or identifier for the EVSE, possibly its serial number or location ID. */
  physicalReference?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for the EVSE. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** The current operational status of the EVSE (e.g., 'AVAILABLE', 'OCCUPIED', 'OUT_OF_ORDER'). */
  status?: Maybe<Scalars['String']['output']>;
  /** Indicates whether this EVSE supports initiating and managing charging sessions directly through a mobile application. */
  supportsInAppCharging?: Maybe<Scalars['Boolean']['output']>;
};

export type ChargingLocationMetadataType = {
  __typename?: 'ChargingLocationMetadataType';
  address?: Maybe<Scalars['String']['output']>;
  alerts?: Maybe<Array<Scalars['String']['output']>>;
  capabilities?: Maybe<Array<Card>>;
  chargingLocationPk?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  coordinates?: Maybe<ChargingLocationMetadataType>;
  country?: Maybe<Scalars['String']['output']>;
  evses?: Maybe<GenericEvseConnectionTypeConnection>;
  externalId?: Maybe<Scalars['String']['output']>;
  facilities?: Maybe<Array<Scalars['String']['output']>>;
  isEjnLocation?: Maybe<Scalars['Boolean']['output']>;
  isFavourite?: Maybe<Scalars['Boolean']['output']>;
  locationFacilities?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  openingHours?: Maybe<BaseOpeningTimes>;
  operator?: Maybe<LocationOperatorType>;
  pk?: Maybe<Scalars['Int']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
};

export type ConsumptionRate = {
  __typename?: 'ConsumptionRate';
  currencyDetails?: Maybe<CurrencyType>;
  perUnit?: Maybe<Scalars['String']['output']>;
  unitAmount?: Maybe<Scalars['Int']['output']>;
};

export type CurrencyType = {
  __typename?: 'CurrencyType';
  decimalDigits?: Maybe<Scalars['Int']['output']>;
  minorUnitConversion?: Maybe<Scalars['Int']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
};

export type EjnConnectorStandardType = {
  __typename?: 'EJNConnectorStandardType';
  humanName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pk?: Maybe<Scalars['Int']['output']>;
};

/** Represents a paginated list or connection of generic connector types available at an EVSE (Electric Vehicle Supply Equipment) at a charging location. */
export type GenericConnectorConnectionTypeConnection = {
  __typename?: 'GenericConnectorConnectionTypeConnection';
  /** A list of edges, where each edge typically contains a single generic connector type node and potentially pagination information. */
  edges?: Maybe<Array<GenericConnectorConnectionTypeEdge>>;
};

export type GenericConnectorConnectionTypeEdge = {
  __typename?: 'GenericConnectorConnectionTypeEdge';
  node?: Maybe<ChargingConnectorMetadataType>;
};

/** This type represents a collection or a paginated list of EVSE (Electric Vehicle Supply Equipment) connection types available at a charging location. */
export type GenericEvseConnectionTypeConnection = {
  __typename?: 'GenericEVSEConnectionTypeConnection';
  /** A list of edges, where each edge typically contains information about a single EVSE connection type, often used for pagination. */
  edges?: Maybe<Array<GenericEvseConnectionTypeEdge>>;
  /** The total number of EVSE connection types in this collection. */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Represents an edge in a connection of Electric Vehicle Supply Equipment (EVSE) information, typically used in paginated queries to wrap individual EVSE nodes. */
export type GenericEvseConnectionTypeEdge = {
  __typename?: 'GenericEVSEConnectionTypeEdge';
  /** The actual EVSE metadata or details associated with this connection edge. */
  node?: Maybe<ChargingEvseMetadataType>;
};

/** This type represents a charging location operator, providing details about the company that manages the charging stations. */
export type LocationOperatorType = {
  __typename?: 'LocationOperatorType';
  /** Indicates whether the operator has partnered locations. */
  hasPartneredLocations?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the operator uses green or renewable energy for their charging services. */
  isGreenEnergy?: Maybe<Scalars['Boolean']['output']>;
  /** The URL to the operator's logo, potentially for display on a dark background. */
  logoDark?: Maybe<Scalars['String']['output']>;
  /** The name of the charging location operator. */
  name?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for the charging location operator. */
  pk?: Maybe<Scalars['Int']['output']>;
  /** The customer support email address for the operator. */
  supportEmail?: Maybe<Scalars['String']['output']>;
  /** The customer support phone number for the operator. */
  supportPhoneNumber?: Maybe<Scalars['String']['output']>;
  /** The URL to the operator's customer support website. */
  supportWebsite?: Maybe<Scalars['String']['output']>;
};

export type PricingType = {
  __typename?: 'PricingType';
  discount?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  chargingLocation?: Maybe<ChargingLocationMetadataType>;
  locationPhotos?: Maybe<Array<Scalars['String']['output']>>;
};


export type QueryChargingLocationArgs = {
  pk?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLocationPhotosArgs = {
  chargingLocation?: InputMaybe<Scalars['String']['input']>;
};
