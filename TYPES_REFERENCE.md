# Yoroi SDK - Types & Interfaces Reference

This document provides a comprehensive reference for all TypeScript types, interfaces, and type definitions available in the Yoroi SDK.

## Table of Contents

1. [Core Types](#core-types)
2. [API Types](#api-types)
3. [Portfolio Types](#portfolio-types)
4. [Swap Types](#swap-types)
5. [DApp Connector Types](#dapp-connector-types)
6. [Chain Types](#chain-types)
7. [Wallet Types](#wallet-types)
8. [Theme Types](#theme-types)
9. [Utility Types](#utility-types)
10. [Error Types](#error-types)

---

## Core Types

### App Namespace

```typescript
import { App } from '@yoroi/types'

// Storage interface - generic async/sync storage
interface App.Storage<IsAsync extends boolean = true, K extends string = string> {
  getItem(key: K): IsAsync extends true ? Promise<string | null> : string | null
  setItem(key: K, value: string): IsAsync extends true ? Promise<void> : void
  removeItem(key: K): IsAsync extends true ? Promise<void> : void
  clear(): IsAsync extends true ? Promise<void> : void
  getAllKeys(): IsAsync extends true ? Promise<K[]> : K[]
}

// Multi-storage interface for managing multiple storage instances
interface App.MultiStorage<T, IsAsync extends boolean = true, K extends string = string> {
  get(folder: string): App.Storage<IsAsync, K>
  create(folder: string): App.Storage<IsAsync, K>
  destroy(folder: string): IsAsync extends true ? Promise<void> : void
  list(): IsAsync extends true ? Promise<string[]> : string[]
}

// Storage key manager for type-safe storage operations
type App.StorageKeyManager<T = unknown, R = T, Key extends string = string> = {
  key: Key
  serialize: (value: T) => string
  deserialize: (value: string) => R
  validate?: (value: unknown) => value is T
}

// Observer pattern interfaces
type App.Subscriber<T> = (data: T) => void
type App.ObserverSubscribe<T> = (subscriber: App.Subscriber<T>) => () => void

interface App.ObserverManager<T> {
  subscribe: App.ObserverSubscribe<T>
  notify: (data: T) => void
  unsubscribeAll: () => void
}

// Cache interfaces
interface App.CacheInfo {
  timestamp: number
  etag?: string
  ttl?: number
}

interface App.CacheRecord<T> {
  data: T
  info: App.CacheInfo
}

interface App.CacheRow<T, K extends string = string> {
  key: K
  record: App.CacheRecord<T>
}

// Queue task management
interface App.QueueTask {
  id: string
  type: string
  data: unknown
  priority: number
  createdAt: number
  scheduledFor?: number
  retries: number
  maxRetries: number
}

interface App.QueueTaskManager {
  enqueue: (task: Omit<App.QueueTask, 'id' | 'createdAt' | 'retries'>) => Promise<string>
  dequeue: () => Promise<App.QueueTask | null>
  peek: () => Promise<App.QueueTask | null>
  remove: (taskId: string) => Promise<boolean>
  clear: () => Promise<void>
  size: () => Promise<number>
}

// Error classes
class App.Errors.InvalidState extends Error {
  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message)
    this.name = 'AppErrorInvalidState'
  }
}

class App.Errors.WrongPassword extends Error {
  constructor(message: string = 'Invalid password') {
    super(message)
    this.name = 'AppErrorWrongPassword'
  }
}

class App.Errors.LibraryError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message)
    this.name = 'AppErrorLibraryFailed'
  }
}
```

### Numbers Namespace

```typescript
import { Numbers } from '@yoroi/types'

// Atomic value type for handling large numbers safely
type Numbers.AtomicValue = string

// Ratio type for percentage calculations
interface Numbers.Ratio {
  numerator: bigint
  denominator: bigint
  toDecimal(): number
  toString(): string
  multiply(other: Numbers.Ratio): Numbers.Ratio
  divide(other: Numbers.Ratio): Numbers.Ratio
}

// Locale configuration for number formatting
interface Numbers.Locale {
  decimal: string      // Decimal separator ('.' or ',')
  thousands: string    // Thousands separator (',' or ' ' or '.')
  currency: string     // Currency symbol ('$', '€', etc.)
  currencyPosition: 'before' | 'after'
}

// Error for invalid atomic values
class Numbers.Errors.InvalidAtomicValue extends Error {
  constructor(value: unknown, public readonly expectedType: string) {
    super(`Invalid atomic value: expected ${expectedType}, got ${typeof value}`)
    this.name = 'NumbersErrorInvalidAtomicValue'
  }
}
```

---

## API Types

### Core API Types

```typescript
import { Api } from '@yoroi/types'

// Generic API response wrapper
type Api.Response<T> = Api.ResponseSuccess<T> | Api.ResponseError

interface Api.ResponseSuccess<T> {
  tag: 'right'
  value: {
    status: number
    data: T
  }
}

interface Api.ResponseError {
  tag: 'left'
  error: {
    status: number
    message: string
    responseData?: unknown
  }
}

// HTTP status codes enum
enum Api.HttpStatusCode {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  
  // Client Error
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  GONE = 410,
  TOO_EARLY = 425,
  TOO_MANY_REQUESTS = 429,
  
  // Server Error
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

// Cached API types
interface Api.RequestWithCache<T> {
  request: T
  cacheKey: string
  ttl?: number
}

interface Api.ResponseWithCache<T> {
  data: T
  fromCache: boolean
  cacheInfo: App.CacheInfo
}

// API Error classes
class Api.Errors.BadRequest extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message)
    this.name = 'ApiErrorBadRequest'
  }
}

class Api.Errors.NotFound extends Error {
  constructor(resource: string, identifier?: string) {
    super(`${resource}${identifier ? ` '${identifier}'` : ''} not found`)
    this.name = 'ApiErrorNotFound'
  }
}

class Api.Errors.ServerSide extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
    this.name = 'ApiErrorServerSide'
  }
}

class Api.Errors.Network extends Error {
  constructor(message: string = 'Network request failed') {
    super(message)
    this.name = 'ApiErrorNetwork'
  }
}

class Api.Errors.ResponseMalformed extends Error {
  constructor(expectedType: string, public readonly received?: unknown) {
    super(`Expected ${expectedType} but received malformed response`)
    this.name = 'ApiErrorResponseMalformed'
  }
}
```

### Cardano API Types

```typescript
namespace Api.Cardano {
  // Token identity and metadata
  interface TokenIdentity {
    policyId: string
    assetName: string
    fingerprint: string
    subject: string
  }

  type TokenId = string // Format: "policyId.assetName" or "" for ADA

  // Metadata types
  interface FtMetadata {
    name: string
    symbol: string
    decimals: number
    description?: string
    url?: string
    logo?: string
  }

  interface NftMetadata {
    name: string
    image: string
    description?: string
    attributes?: Array<{
      trait_type: string
      value: string | number
    }>
    mediaType?: string
    files?: MetadataFile[]
  }

  interface MetadataFile {
    name: string
    mediaType: string
    src: string
    size?: number
  }

  // Token registry entry
  interface TokenRegistryEntry {
    subject: string
    policy: string
    name: {
      value: string
      signatures: Array<{
        publicKey: string
        signature: string
      }>
    }
    description?: {
      value: string
      signatures: Array<{
        publicKey: string
        signature: string
      }>
    }
    ticker?: {
      value: string
      signatures: Array<{
        publicKey: string
        signature: string
      }>
    }
    url?: {
      value: string
      signatures: Array<{
        publicKey: string
        signature: string
      }>
    }
    logo?: {
      value: string
      signatures: Array<{
        publicKey: string
        signature: string
      }>
    }
  }

  // Protocol parameters
  interface ProtocolParams {
    minFeeA: number
    minFeeB: number
    maxTxSize: number
    utxoCostPerWord: number
    minUtxo: string
    poolDeposit: string
    keyDeposit: string
    maxValSize: number
    maxTxExMem: string
    maxTxExSteps: string
    maxBlockSize: number
    maxBlockHeaderSize: number
    maxCollateralInputs: number
    coinsPerUtxoWord: string
  }

  // Best block information
  interface BestBlock {
    epoch: number
    slot: number
    hash: string
    height: number
    time: number
  }

  // UTXO data types
  interface UtxoDataRequest {
    addresses: string[]
  }

  interface UtxoDataAsset {
    policyId: string
    assetName: string
    quantity: string
  }

  interface UtxoData {
    txHash: string
    txIndex: number
    address: string
    amount: string
    assets: UtxoDataAsset[]
    datum?: string
    scriptRef?: string
  }

  // Token supply information
  interface TokenSupplyRequest {
    tokenId: string
  }

  interface TokenSupplyRecord {
    tokenId: string
    totalSupply: string
    circulatingSupply: string
    mintTransactions: number
    burnTransactions: number
  }

  interface TokenSupplyResponse {
    [tokenId: string]: TokenSupplyRecord
  }

  // Metadata requests/responses
  interface OnChainMetadataRequest {
    tokenIds: string[]
  }

  interface OffChainMetadataRequest {
    url: string
    hash?: string
  }

  interface OnChainMetadataRecord {
    tokenId: string
    metadata: FtMetadata | NftMetadata | null
    source: 'registry' | 'mint' | 'cache'
  }

  interface OffChainMetadataRecord {
    url: string
    metadata: NftMetadata | null
    hash?: string
    fetchedAt: number
  }

  interface OnChainMetadataResponse {
    [tokenId: string]: OnChainMetadataRecord
  }

  interface OffChainMetadataResponse {
    metadata: NftMetadata | null
    hash?: string
    fetchedAt: number
  }

  // Future token types (for upcoming tokens)
  interface FutureToken {
    tokenId: string
    name: string
    symbol: string
    decimals: number
    launchDate: number
    description?: string
  }

  interface FutureTokenRecords {
    [tokenId: string]: FutureToken
  }

  // Record collections
  interface FtRecords {
    [tokenId: string]: FtMetadata
  }

  interface NftRecords {
    [tokenId: string]: NftMetadata
  }

  interface FtMetadataRecord {
    tokenId: string
    metadata: FtMetadata
    source: 'registry' | 'mint' | 'cache'
    fetchedAt: number
  }

  interface NftMetadataRecord {
    tokenId: string
    metadata: NftMetadata
    source: 'registry' | 'mint' | 'cache'
    fetchedAt: number
  }

  // Cardano API interface
  interface Api {
    getProtocolParams(): Promise<ProtocolParams>
    getBestBlock(): Promise<BestBlock>
    getUtxoData(request: UtxoDataRequest): Promise<UtxoData[]>
  }
}
```

---

## Portfolio Types

### Core Portfolio Types

```typescript
import { Portfolio } from '@yoroi/types'

// Primary breakdown of portfolio value
interface Portfolio.PrimaryBreakdown {
  native: string    // ADA value
  ft: string       // Fungible tokens value
  nft: string      // NFT value
  total: string    // Total portfolio value
}

// Currency configuration
type Portfolio.Currency.Symbol = 'usd' | 'eur' | 'btc' | 'ada' | 'jpy' | 'gbp'

interface Portfolio.Currency.Config {
  symbol: Portfolio.Currency.Symbol
  name: string
  decimals: number
  format: string
}

interface Portfolio.Currency.ConfigBySymbol {
  [key: string]: Portfolio.Currency.Config
}

// Fungibility filter for tokens
enum Portfolio.FungibilityFilter {
  All = 'all',
  Fungible = 'fungible',
  NonFungible = 'non-fungible'
}
```

### Token Types

```typescript
namespace Portfolio.Token {
  // Token identification
  type Id = string

  // Token types
  enum Type {
    Ft = 'ft',           // Fungible token
    Nft = 'nft',         // Non-fungible token
    Native = 'native'    // Native blockchain token (ADA)
  }

  enum PropertyType {
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
    Document = 'document',
    Other = 'other'
  }

  enum Application {
    General = 'general',
    Gaming = 'gaming',
    Art = 'art',
    Music = 'music',
    Identity = 'identity',
    Utility = 'utility'
  }

  enum Source {
    Generated = 'generated',
    Registry = 'registry',
    Mint = 'mint',
    Cache = 'cache'
  }

  enum Nature {
    Primary = 'primary',      // Native token
    Secondary = 'secondary'   // Created token
  }

  enum Status {
    Active = 'active',
    Inactive = 'inactive',
    Unknown = 'unknown'
  }

  // Token information interface
  interface Info {
    id: Id
    name: string
    symbol: string
    decimals: number
    type: Type
    nature: Nature
    status: Status
    source: Source
    application: Application
    propertyType?: PropertyType
    description?: string
    image?: string
    website?: string
    originalMetadata?: unknown
  }

  // Token discovery (search results)
  interface Discovery {
    id: Id
    name: string
    symbol: string
    fingerprint: string
    image?: string
    verified: boolean
    rank?: number
  }

  // Token pricing information
  interface Price {
    usd: number
    ada: number
    eur: number
    btc: number
    change24h?: number
    change7d?: number
    marketCap?: number
    volume24h?: number
    lastUpdated: number
  }

  // Token traits (for NFTs)
  interface Trait {
    name: string
    value: string | number
    displayType?: 'string' | 'number' | 'date' | 'boost_number' | 'boost_percentage'
    rarity?: number
  }

  type Traits = Trait[]

  // Token amounts and balances
  interface Amount {
    tokenId: Id
    quantity: string
    decimals: number
  }

  interface AmountRecords {
    [tokenId: string]: Amount
  }

  interface Balances {
    available: string
    rewards: string
    total: string
  }

  // Token activity (transaction history)
  enum ActivityWindow {
    Day = '1d',
    Week = '1w',
    Month = '1m',
    Quarter = '3m',
    Year = '1y',
    All = 'all'
  }

  interface Activity {
    txHash: string
    type: 'sent' | 'received' | 'self'
    direction: 'in' | 'out'
    amount: string
    fee?: string
    timestamp: number
    addresses: {
      from: string[]
      to: string[]
    }
    confirmations: number
    status: 'pending' | 'confirmed' | 'failed'
  }

  interface ActivityRecord {
    tokenId: Id
    activities: Activity[]
    totalCount: number
    hasMore: boolean
  }

  // Token price history
  enum HistoryPeriod {
    Hour = '1h',
    Day = '1d',
    Week = '1w',
    Month = '1m',
    Quarter = '3m',
    Year = '1y'
  }

  interface History {
    tokenId: Id
    period: HistoryPeriod
    prices: Array<{
      timestamp: number
      price: number
      volume?: number
    }>
  }
}
```

### Portfolio API Types

```typescript
namespace Portfolio.Api {
  // API response types
  interface TokenInfosResponse {
    [tokenId: string]: Portfolio.Token.Info
  }

  interface TokenDiscoveryResponse {
    tokens: Portfolio.Token.Discovery[]
    totalCount: number
    hasMore: boolean
  }

  interface TokenTraitsResponse {
    [tokenId: string]: Portfolio.Token.Traits
  }

  interface TokenActivityResponse {
    [tokenId: string]: Portfolio.Token.ActivityRecord
  }

  interface TokenHistoryResponse {
    [tokenId: string]: Portfolio.Token.History
  }

  // Main portfolio API interface
  interface Api {
    getTokenInfos(tokenIds: string[]): Promise<TokenInfosResponse>
    searchTokens(query: string, limit?: number): Promise<TokenDiscoveryResponse>
    getTokenTraits(tokenIds: string[]): Promise<TokenTraitsResponse>
    getTokenActivity(tokenIds: string[], window?: Portfolio.Token.ActivityWindow): Promise<TokenActivityResponse>
    getTokenHistory(tokenIds: string[], period?: Portfolio.Token.HistoryPeriod): Promise<TokenHistoryResponse>
  }
}
```

### Portfolio Storage Types

```typescript
namespace Portfolio.Storage {
  // Storage record for tokens
  interface Token {
    id: string
    info: Portfolio.Token.Info
    updatedAt: number
    source: Portfolio.Token.Source
  }

  // Storage record for balances
  interface Balance {
    tokenId: string
    address: string
    amounts: Portfolio.Token.Balances
    updatedAt: number
  }
}
```

### Portfolio Manager Types

```typescript
namespace Portfolio.Manager {
  // Token manager interface
  interface Token {
    sync(options: { tokenIds: string[]; forceUpdate?: boolean }): Promise<void>
    getTokenInfo(tokenId: string): Promise<Portfolio.Token.Info | null>
    searchTokens(query: string, limit?: number): Promise<Portfolio.Token.Discovery[]>
    getTokenTraits(tokenId: string): Promise<Portfolio.Token.Traits | null>
    subscribe(event: Portfolio.Event.TokenManager, callback: (data: any) => void): () => void
  }

  // Balance manager interface
  interface Balance {
    sync(options: { addresses: string[] }): Promise<void>
    getBalances(): Portfolio.Token.Balances[]
    getTotalValue(currency: Portfolio.Currency.Symbol): string
    getPrimaryBreakdown(): Portfolio.PrimaryBreakdown
    subscribe(event: Portfolio.Event.BalanceManager, callback: (data: any) => void): () => void
  }
}
```

### Portfolio Events

```typescript
namespace Portfolio.Event {
  type SourceId = string

  enum ManagerOn {
    Sync = 'sync',
    Hydrate = 'hydrate',
    Refresh = 'refresh',
    Error = 'error'
  }

  // Token manager events
  type TokenManager = TokenManagerSync | TokenManagerHydrate | TokenManagerError

  interface TokenManagerSync {
    type: 'sync'
    sourceId: SourceId
    tokenIds: string[]
    timestamp: number
  }

  interface TokenManagerHydrate {
    type: 'hydrate'
    sourceId: SourceId
    tokenIds: string[]
    timestamp: number
  }

  interface TokenManagerError {
    type: 'error'
    sourceId: SourceId
    error: Error
    timestamp: number
  }

  // Balance manager events
  type BalanceManager = BalanceManagerSync | BalanceManagerHydrate | BalanceManagerRefresh | BalanceManagerError

  interface BalanceManagerSync {
    type: 'sync'
    sourceId: SourceId
    addresses: string[]
    timestamp: number
  }

  interface BalanceManagerHydrate {
    type: 'hydrate'
    sourceId: SourceId
    addresses: string[]
    timestamp: number
  }

  interface BalanceManagerRefresh {
    type: 'refresh'
    sourceId: SourceId
    addresses: string[]
    timestamp: number
  }

  interface BalanceManagerError {
    type: 'error'
    sourceId: SourceId
    error: Error
    timestamp: number
  }
}
```

---

## Swap Types

```typescript
import { Swap } from '@yoroi/types'

// Swap protocols/DEXes
enum Swap.Protocol {
  Sundae = 'sundae',
  Minswap = 'minswap',
  Wingriders = 'wingriders',
  Muesliswap = 'muesliswap',
  AdaSwap = 'adaswap'
}

enum Swap.Aggregator {
  Yoroi = 'yoroi',
  OneInch = '1inch',
  Jupiter = 'jupiter'
}

enum Swap.Dex {
  SundaeSwap = 'sundaeswap',
  Minswap = 'minswap',
  WingRiders = 'wingriders',
  MuesliSwap = 'muesliswap'
}

// Swap request/response types
interface Swap.LimitOptionsRequest {
  sell: {
    tokenId: string
  }
  buy: {
    tokenId: string
  }
}

interface Swap.LimitOptionsResponse {
  sellMin: string
  sellMax: string
  buyMin: string
  buyMax: string
}

interface Swap.EstimateRequest {
  sell: {
    tokenId: string
    quantity: string
  }
  buy: {
    tokenId: string
  }
  slippage: number
  aggregator?: Swap.Aggregator
}

interface Swap.EstimateResponse {
  sell: {
    tokenId: string
    quantity: string
  }
  buy: {
    tokenId: string
    quantity: string
  }
  provider: Swap.Protocol
  fee: string
  priceImpact: number
  rate: number
  validUntil: number
  estimateId: string
}

interface Swap.CreateRequest {
  estimate: Swap.EstimateResponse
  address: string
  utxos: Array<{
    txHash: string
    index: number
    amount: string
    assets: Array<{
      policyId: string
      assetName: string
      quantity: string
    }>
  }>
}

interface Swap.CreateResponse {
  txHash: string
  unsignedTx: string
  fee: string
  validUntil: number
}

interface Swap.CancelRequest {
  estimateId: string
  reason?: string
}

interface Swap.CancelResponse {
  success: boolean
  message?: string
}

// Swap split for multi-hop routes
interface Swap.Split {
  protocol: Swap.Protocol
  percentage: number
  sellQuantity: string
  buyQuantity: string
  route: Array<{
    tokenIn: string
    tokenOut: string
    poolId: string
  }>
}

// Swap order information
interface Swap.Order {
  id: string
  type: 'market' | 'limit'
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled'
  sell: {
    tokenId: string
    quantity: string
  }
  buy: {
    tokenId: string
    quantity: string
    received?: string
  }
  fee: string
  slippage: number
  createdAt: number
  completedAt?: number
  txHash?: string
  error?: string
}

// Swap storage interface
interface Swap.Storage {
  saveOrder(order: Swap.Order): Promise<void>
  getOrder(orderId: string): Promise<Swap.Order | null>
  getOrders(limit?: number, offset?: number): Promise<Swap.Order[]>
  updateOrder(orderId: string, updates: Partial<Swap.Order>): Promise<void>
  deleteOrder(orderId: string): Promise<void>
}

// Main swap API interface
interface Swap.Api {
  getLimitOptions(request: Swap.LimitOptionsRequest): Promise<Swap.LimitOptionsResponse>
  estimate(request: Swap.EstimateRequest): Promise<Swap.EstimateResponse[]>
  create(request: Swap.CreateRequest): Promise<Swap.CreateResponse>
  cancel(request: Swap.CancelRequest): Promise<Swap.CancelResponse>
}

// Swap manager settings
interface Swap.ManagerSettings {
  maxSlippage: number
  deadline: number // minutes
  defaultAggregator: Swap.Aggregator
  enabledProtocols: Swap.Protocol[]
}

// Swap manager maker function type
type Swap.ManagerMaker = (options: {
  network: Chain.Network
  storage: Swap.Storage
  settings?: Partial<Swap.ManagerSettings>
}) => Swap.Manager

// Main swap manager interface
interface Swap.Manager {
  estimate(request: Swap.EstimateRequest): Promise<Swap.EstimateResponse[]>
  create(request: Swap.CreateRequest): Promise<Swap.CreateResponse>
  cancel(request: Swap.CancelRequest): Promise<Swap.CancelResponse>
  getOrder(orderId: string): Promise<Swap.Order | null>
  getOrders(): Promise<Swap.Order[]>
  settings: Swap.ManagerSettings
}
```

---

## DApp Connector Types

```typescript
import { DappConnector } from '@yoroi/types'

// DApp connection information
interface DappConnection {
  origin: string
  name: string
  icon?: string
  permissions: string[]
  connectedAt: number
  lastUsed: number
  isActive: boolean
}

// DApp API method types
type DappApiMethod = 
  | 'getBalance'
  | 'getUtxos'
  | 'getUsedAddresses'
  | 'getUnusedAddresses'
  | 'getChangeAddress'
  | 'getRewardAddresses'
  | 'signTx'
  | 'signData'
  | 'submitTx'

// DApp connector storage interface
interface DappConnector.Storage {
  addConnection(connection: Omit<DappConnection, 'connectedAt' | 'lastUsed' | 'isActive'>): Promise<void>
  getConnection(origin: string): Promise<DappConnection | null>
  getConnections(): Promise<DappConnection[]>
  updateConnection(origin: string, updates: Partial<DappConnection>): Promise<void>
  removeConnection(origin: string): Promise<void>
  clearConnections(): Promise<void>
}

// DApp API request/response types
interface DappApiRequest {
  method: DappApiMethod
  params?: unknown
  origin: string
  requestId: string
}

interface DappApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
  }
  requestId: string
}

// DApp list response
interface DappListResponse {
  dapps: Array<{
    id: string
    name: string
    description: string
    icon: string
    url: string
    category: string
    verified: boolean
    connected: boolean
    stats?: {
      users?: number
      tvl?: string
      volume24h?: string
    }
  }>
  totalCount: number
}

// DApp connector manager interface
interface DappConnectorManager {
  connect(origin: string, permissions: string[]): Promise<DappConnection>
  disconnect(origin: string): Promise<void>
  getConnections(): Promise<DappConnection[]>
  isConnected(origin: string): Promise<boolean>
  hasPermission(origin: string, permission: string): Promise<boolean>
  handleApiCall(request: DappApiRequest): Promise<DappApiResponse>
}

// Main DApp connector interface
interface DappConnector {
  manager: DappConnectorManager
  storage: DappConnector.Storage
  onConnect: (callback: (connection: DappConnection) => void) => () => void
  onDisconnect: (callback: (origin: string) => void) => () => void
  onApiCall: (callback: (request: DappApiRequest) => Promise<DappApiResponse>) => () => void
}
```

---

## Chain Types

```typescript
import { Chain } from '@yoroi/types'

// Supported networks
enum Chain.Network {
  Mainnet = 'mainnet',
  Preprod = 'preprod',
  Preview = 'preview',
  Legacy = 'legacy'
}

type Chain.SupportedNetworks = Chain.Network.Mainnet | Chain.Network.Preprod | Chain.Network.Preview

namespace Chain.Cardano {
  // Basic types
  type Address = string
  type TokenId = string
  type TxHash = string
  type PolicyId = string
  type AssetName = string

  // Transaction information
  interface TxInfo {
    hash: TxHash
    block: {
      hash: string
      number: number
      slot: number
      epoch: number
      timestamp: number
    }
    fee: string
    size: number
    inputs: Array<{
      txHash: TxHash
      index: number
      address: Address
      amount: string
      assets: Array<{
        policyId: PolicyId
        assetName: AssetName
        quantity: string
      }>
    }>
    outputs: Array<{
      address: Address
      amount: string
      assets: Array<{
        policyId: PolicyId
        assetName: AssetName
        quantity: string
      }>
      datum?: string
      scriptRef?: string
    }>
    certificates?: Array<{
      type: 'delegation' | 'registration' | 'deregistration' | 'withdrawal'
      stakeAddress?: Address
      poolId?: string
      amount?: string
    }>
    withdrawals?: Array<{
      stakeAddress: Address
      amount: string
    }>
    metadata?: Record<string, unknown>
    scriptDataHash?: string
    status: 'pending' | 'confirmed' | 'failed'
    confirmations: number
  }

  // Unsigned transaction
  interface UnsignedTx {
    body: string
    hash: string
    size: number
    fee: string
    inputs: Array<{
      txHash: string
      index: number
    }>
    outputs: Array<{
      address: string
      amount: string
      assets?: Array<{
        policyId: string
        assetName: string
        quantity: string
      }>
    }>
    auxiliaryData?: string
  }

  // Signed transaction
  interface SignedTx {
    body: string
    witnessSet: string
    hash: string
    size: number
  }

  // Metadata
  interface Metadata {
    [label: string]: unknown
  }

  // Staking information
  interface Staking {
    stakeAddress: Address
    poolId?: string
    status: 'registered' | 'delegated' | 'not_registered'
    rewards: string
    withdrawableRewards: string
    poolInfo?: {
      id: string
      name: string
      ticker: string
      description: string
      homepage: string
      pledge: string
      cost: string
      margin: number
      activeStake: string
      liveStake: string
      blocks: number
      retiringEpoch?: number
    }
  }

  // Voting information
  interface Voting {
    stakeAddress: Address
    votingPower: string
    registrationTx?: TxHash
    votingKeys?: Array<{
      publicKey: string
      signature: string
    }>
    catalystRegistration?: {
      votingKey: string
      stakePubKey: string
      rewardAddress: Address
      nonce: number
    }
  }

  // Protocol parameters (from earlier, but included for completeness)
  interface ProtocolParams {
    minFeeA: number
    minFeeB: number
    maxTxSize: number
    utxoCostPerWord: number
    minUtxo: string
    poolDeposit: string
    keyDeposit: string
    maxValSize: number
    maxTxExMem: string
    maxTxExSteps: string
    maxBlockSize: number
    maxBlockHeaderSize: number
    maxCollateralInputs: number
    coinsPerUtxoWord: string
  }

  // Best block (from earlier, but included for completeness)
  interface BestBlock {
    epoch: number
    slot: number
    hash: string
    height: number
    time: number
  }
}
```

---

## Wallet Types

```typescript
import { Wallet } from '@yoroi/types'

// Wallet implementation types
enum Wallet.Implementation {
  Byron = 'byron',
  Shelley = 'shelley',
  Multisig = 'multisig'
}

// Address derivation modes
enum Wallet.AddressMode {
  Single = 'single',
  Multiple = 'multiple'
}

// Wallet metadata
interface Wallet.Meta {
  id: string
  name: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
  networkId: number
  isMainnet: boolean
  isLegacy: boolean
  isHardwareWallet: boolean
  walletChecksum: string
  createdAt: number
  lastSyncedAt?: number
}

// Hardware wallet types
namespace HW {
  interface Features {
    vendor: string
    model: string
    deviceId: string
    deviceLabel?: string
    firmwareVersion: string
    isInitialized: boolean
    pinProtected: boolean
    passphraseProtected: boolean
  }

  interface DeviceInfo {
    path: string
    features: Features
    connected: boolean
  }

  interface DeviceObj {
    deviceInfo: DeviceInfo
    connect(): Promise<void>
    disconnect(): Promise<void>
    getPublicKey(path: string): Promise<string>
    signTx(tx: Chain.Cardano.UnsignedTx): Promise<Chain.Cardano.SignedTx>
    signData(address: string, data: string): Promise<string>
  }
}
```

---

## Theme Types

```typescript
import { Theme } from '@yoroi/types'

// Theme names
type ThemeName = 'light' | 'dark' | 'system' | string

// Base palette for light/dark variants
interface ThemeBasePalette {
  // Primary colors
  primary: string
  primaryLight: string
  primaryDark: string
  
  // Secondary colors
  secondary: string
  secondaryLight: string
  secondaryDark: string
  
  // Background colors
  background: string
  surface: string
  surfaceVariant: string
  
  // Text colors
  onBackground: string
  onSurface: string
  onPrimary: string
  onSecondary: string
  
  // Status colors
  error: string
  warning: string
  success: string
  info: string
  
  // Border colors
  border: string
  borderLight: string
  
  // Additional colors
  accent?: string
  highlight?: string
}

// Themed palette with context-aware colors
interface ThemedPalette extends ThemeBasePalette {
  // Context-aware aliases
  text: {
    primary: string
    secondary: string
    disabled: string
    inverse: string
  }
  
  action: {
    active: string
    hover: string
    selected: string
    disabled: string
    disabledBackground: string
  }
  
  divider: string
  backdrop: string
}

// Typography definitions
interface ThemeTypography {
  fontFamily: string
  fontFamilyBold?: string
  fontFamilyMono?: string
  
  // Text styles
  heading1: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
  heading2: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
  heading3: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
  subtitle1: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
  subtitle2: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
  body: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
  caption: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
  button: {
    fontSize: number
    fontWeight: string
    lineHeight: number
    fontFamily?: string
  }
}

// Spacing system
interface ThemeSpacing {
  xs: number    // 4
  sm: number    // 8
  md: number    // 16
  lg: number    // 24
  xl: number    // 32
  xxl: number   // 48
}

// Border radius
interface ThemeBorderRadius {
  sm: number    // 4
  md: number    // 8
  lg: number    // 12
  xl: number    // 16
  full: number  // 9999
}

// Shadow definitions
interface ThemeShadows {
  sm: {
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: number
  }
  md: {
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: number
  }
  lg: {
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: number
  }
}

// Design tokens
interface ThemeTokens {
  space: ThemeSpacing
  radius: ThemeBorderRadius
  shadows: ThemeShadows
  typography: ThemeTypography
}

// Complete theme configuration
interface ThemeConfig {
  name: ThemeName
  palette: ThemeBasePalette
  typography?: Partial<ThemeTypography>
  spacing?: Partial<ThemeSpacing>
  borderRadius?: Partial<ThemeBorderRadius>
  shadows?: Partial<ThemeShadows>
}

// Theme record for multiple themes
interface ThemeRecord {
  [themeName: string]: ThemeConfig
}

// Atomic design system styles
interface ThemeAtoms {
  // Layout
  flex_1: { flex: 1 }
  flex_row: { flexDirection: 'row' }
  flex_column: { flexDirection: 'column' }
  items_center: { alignItems: 'center' }
  items_start: { alignItems: 'flex-start' }
  items_end: { alignItems: 'flex-end' }
  justify_center: { justifyContent: 'center' }
  justify_between: { justifyContent: 'space-between' }
  justify_around: { justifyContent: 'space-around' }
  
  // Spacing (margins and padding)
  p_4: { padding: 4 }
  p_8: { padding: 8 }
  p_12: { padding: 12 }
  p_16: { padding: 16 }
  p_20: { padding: 20 }
  p_24: { padding: 24 }
  
  m_4: { margin: 4 }
  m_8: { margin: 8 }
  m_12: { margin: 12 }
  m_16: { margin: 16 }
  m_20: { margin: 20 }
  m_24: { margin: 24 }
  
  mt_4: { marginTop: 4 }
  mt_8: { marginTop: 8 }
  mt_12: { marginTop: 12 }
  mt_16: { marginTop: 16 }
  
  mb_4: { marginBottom: 4 }
  mb_8: { marginBottom: 8 }
  mb_12: { marginBottom: 12 }
  mb_16: { marginBottom: 16 }
  
  ml_4: { marginLeft: 4 }
  ml_8: { marginLeft: 8 }
  ml_12: { marginLeft: 12 }
  ml_16: { marginLeft: 16 }
  
  mr_4: { marginRight: 4 }
  mr_8: { marginRight: 8 }
  mr_12: { marginRight: 12 }
  mr_16: { marginRight: 16 }
  
  // Colors (dynamic based on theme)
  bg_color_max: { backgroundColor: string }
  bg_color_min: { backgroundColor: string }
  bg_primary: { backgroundColor: string }
  bg_secondary: { backgroundColor: string }
  bg_error: { backgroundColor: string }
  bg_warning: { backgroundColor: string }
  bg_success: { backgroundColor: string }
  bg_info: { backgroundColor: string }
  
  text_primary_max: { color: string }
  text_primary_medium: { color: string }
  text_primary_min: { color: string }
  text_gray_max: { color: string }
  text_gray_medium: { color: string }
  text_gray_min: { color: string }
  text_error: { color: string }
  text_warning: { color: string }
  text_success: { color: string }
  text_info: { color: string }
  
  // Typography
  font_thin: { fontWeight: '100' }
  font_light: { fontWeight: '300' }
  font_normal: { fontWeight: '400' }
  font_medium: { fontWeight: '500' }
  font_semibold: { fontWeight: '600' }
  font_bold: { fontWeight: '700' }
  font_black: { fontWeight: '900' }
  
  text_xs: { fontSize: 12 }
  text_sm: { fontSize: 14 }
  text_base: { fontSize: 16 }
  text_lg: { fontSize: 18 }
  text_xl: { fontSize: 20 }
  text_2xl: { fontSize: 24 }
  text_3xl: { fontSize: 30 }
  text_4xl: { fontSize: 36 }
  
  // Border radius
  rounded_4: { borderRadius: 4 }
  rounded_8: { borderRadius: 8 }
  rounded_12: { borderRadius: 12 }
  rounded_16: { borderRadius: 16 }
  rounded_full: { borderRadius: 9999 }
  
  // Shadows
  shadow_sm: ThemeShadows['sm']
  shadow_md: ThemeShadows['md']
  shadow_lg: ThemeShadows['lg']
  
  // Borders
  border_1: { borderWidth: 1 }
  border_2: { borderWidth: 2 }
  border_gray: { borderColor: string }
  border_primary: { borderColor: string }
  
  // Buttons (theme-aware)
  btn_primary: {
    backgroundColor: string
    paddingHorizontal: number
    paddingVertical: number
    borderRadius: number
  }
  btn_secondary: {
    backgroundColor: string
    borderColor: string
    borderWidth: number
    paddingHorizontal: number
    paddingVertical: number
    borderRadius: number
  }
  btn_error: {
    backgroundColor: string
    paddingHorizontal: number
    paddingVertical: number
    borderRadius: number
  }
  
  text_button: { color: string }
}
```

---

## Utility Types

### Helper Types

```typescript
// Common utility types used across the SDK
type Maybe<T> = T | null | undefined

type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

type AsyncResult<T, E = Error> = Promise<Result<T, E>>

// Branded types for additional type safety
type Branded<T, Brand> = T & { __brand: Brand }

type TokenId = Branded<string, 'TokenId'>
type Address = Branded<string, 'Address'>
type TxHash = Branded<string, 'TxHash'>
type AtomicValue = Branded<string, 'AtomicValue'>

// Recursive partial type
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Make specific properties optional
type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific properties required
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Extract function parameters
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never

// Extract function return type
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any

// Array element type
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never

// Object value types
type ValueOf<T> = T[keyof T]

// Promise unwrapping
type Awaited<T> = T extends PromiseLike<infer U> ? U : T
```

### Storage Helper Types

```typescript
// Storage serialization helpers
interface StorageSerializer<T, R = T> {
  serialize: (value: T) => string
  deserialize: (value: string) => R
  validate?: (value: unknown) => value is T
}

// JSON serializer
const jsonSerializer = <T>(): StorageSerializer<T> => ({
  serialize: (value: T) => JSON.stringify(value),
  deserialize: (value: string) => JSON.parse(value) as T,
  validate: (value: unknown): value is T => {
    try {
      JSON.parse(JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }
})

// String serializer
const stringSerializer: StorageSerializer<string> = {
  serialize: (value: string) => value,
  deserialize: (value: string) => value,
  validate: (value: unknown): value is string => typeof value === 'string'
}

// Number serializer
const numberSerializer: StorageSerializer<number> = {
  serialize: (value: number) => value.toString(),
  deserialize: (value: string) => parseFloat(value),
  validate: (value: unknown): value is number => typeof value === 'number' && !isNaN(value)
}

// Boolean serializer
const booleanSerializer: StorageSerializer<boolean> = {
  serialize: (value: boolean) => value.toString(),
  deserialize: (value: string) => value === 'true',
  validate: (value: unknown): value is boolean => typeof value === 'boolean'
}
```

---

## Error Types

### Core Error Classes

```typescript
// Base error class for all Yoroi SDK errors
abstract class YoroiError extends Error {
  abstract readonly code: string
  abstract readonly category: 'api' | 'validation' | 'storage' | 'network' | 'crypto' | 'user'
  
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = this.constructor.name
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      context: this.context,
      stack: this.stack
    }
  }
}

// API-related errors
class ApiError extends YoroiError {
  readonly category = 'api' as const
  
  constructor(
    message: string,
    public readonly statusCode?: number,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

class ApiErrorNetwork extends ApiError {
  readonly code = 'API_NETWORK_ERROR'
}

class ApiErrorTimeout extends ApiError {
  readonly code = 'API_TIMEOUT_ERROR'
}

class ApiErrorRateLimit extends ApiError {
  readonly code = 'API_RATE_LIMIT_ERROR'
}

// Validation errors
class ValidationError extends YoroiError {
  readonly category = 'validation' as const
  readonly code = 'VALIDATION_ERROR'
  
  constructor(
    field: string,
    value: unknown,
    expectedType: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Validation failed for field '${field}': expected ${expectedType}, got ${typeof value}`,
      { field, value, expectedType, ...context }
    )
  }
}

// Storage errors
class StorageError extends YoroiError {
  readonly category = 'storage' as const
}

class StorageErrorNotFound extends StorageError {
  readonly code = 'STORAGE_NOT_FOUND'
}

class StorageErrorCorrupted extends StorageError {
  readonly code = 'STORAGE_CORRUPTED'
}

class StorageErrorQuotaExceeded extends StorageError {
  readonly code = 'STORAGE_QUOTA_EXCEEDED'
}

// Cryptographic errors
class CryptoError extends YoroiError {
  readonly category = 'crypto' as const
}

class CryptoErrorInvalidKey extends CryptoError {
  readonly code = 'CRYPTO_INVALID_KEY'
}

class CryptoErrorSignatureFailed extends CryptoError {
  readonly code = 'CRYPTO_SIGNATURE_FAILED'
}

// User-facing errors
class UserError extends YoroiError {
  readonly category = 'user' as const
}

class UserErrorInsufficientFunds extends UserError {
  readonly code = 'USER_INSUFFICIENT_FUNDS'
}

class UserErrorInvalidAddress extends UserError {
  readonly code = 'USER_INVALID_ADDRESS'
}

class UserErrorTransactionFailed extends UserError {
  readonly code = 'USER_TRANSACTION_FAILED'
}
```

### Error Union Types

```typescript
// Union types for different error categories
type ApiErrors = 
  | Api.Errors.BadRequest
  | Api.Errors.NotFound
  | Api.Errors.ServerSide
  | Api.Errors.Network
  | Api.Errors.ResponseMalformed

type ValidationErrors = 
  | ValidationError
  | Numbers.Errors.InvalidAtomicValue

type StorageErrors = 
  | StorageErrorNotFound
  | StorageErrorCorrupted
  | StorageErrorQuotaExceeded

type CryptoErrors = 
  | CryptoErrorInvalidKey
  | CryptoErrorSignatureFailed

type UserErrors = 
  | UserErrorInsufficientFunds
  | UserErrorInvalidAddress
  | UserErrorTransactionFailed

type YoroiErrors = 
  | ApiErrors
  | ValidationErrors
  | StorageErrors
  | CryptoErrors
  | UserErrors

// Error handling helper types
type ErrorHandler<T extends YoroiError = YoroiError> = (error: T) => void

type ErrorHandlerMap = {
  [K in YoroiErrors['code']]?: ErrorHandler<Extract<YoroiErrors, { code: K }>>
}

// Error boundary types for React
interface ErrorBoundaryState {
  hasError: boolean
  error?: YoroiError
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: YoroiError; reset: () => void }>
  onError?: (error: YoroiError, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
}
```

---

## Type Guards and Validators

### Type Guard Functions

```typescript
// Type guards for runtime type checking
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false
  if (!itemGuard) return true
  return value.every(item => itemGuard(item))
}

// API response type guards
function isApiSuccess<T>(response: Api.Response<T>): response is Api.ResponseSuccess<T> {
  return response.tag === 'right'
}

function isApiError<T>(response: Api.Response<T>): response is Api.ResponseError {
  return response.tag === 'left'
}

// Portfolio type guards
function isTokenInfo(value: unknown): value is Portfolio.Token.Info {
  return isObject(value) &&
         isString(value.id) &&
         isString(value.name) &&
         isString(value.symbol) &&
         isNumber(value.decimals) &&
         Object.values(Portfolio.Token.Type).includes(value.type as Portfolio.Token.Type)
}

function isTokenAmount(value: unknown): value is Portfolio.Token.Amount {
  return isObject(value) &&
         isString(value.tokenId) &&
         isString(value.quantity) &&
         isNumber(value.decimals)
}

// Chain type guards
function isCardanoAddress(value: unknown): value is Chain.Cardano.Address {
  if (!isString(value)) return false
  // Basic validation - starts with addr1 (mainnet) or addr_test1 (testnet)
  return value.startsWith('addr1') || value.startsWith('addr_test1')
}

function isTxHash(value: unknown): value is Chain.Cardano.TxHash {
  if (!isString(value)) return false
  // Basic validation - 64 character hex string
  return /^[a-fA-F0-9]{64}$/.test(value)
}

// Swap type guards
function isSwapEstimate(value: unknown): value is Swap.EstimateResponse {
  return isObject(value) &&
         isObject(value.sell) &&
         isObject(value.buy) &&
         isString(value.provider) &&
         isString(value.fee) &&
         isNumber(value.priceImpact) &&
         isNumber(value.rate)
}

// Error type guards
function isYoroiError(error: unknown): error is YoroiError {
  return error instanceof YoroiError
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}
```

### Validation Schemas

```typescript
// Zod-style validation schemas
import { z } from 'zod'

// Basic schemas
const stringSchema = z.string()
const numberSchema = z.number()
const booleanSchema = z.boolean()
const atomicValueSchema = z.string().regex(/^\d+$/)

// Portfolio schemas
const tokenInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().min(0).max(18),
  type: z.nativeEnum(Portfolio.Token.Type),
  nature: z.nativeEnum(Portfolio.Token.Nature),
  status: z.nativeEnum(Portfolio.Token.Status),
  source: z.nativeEnum(Portfolio.Token.Source),
  application: z.nativeEnum(Portfolio.Token.Application),
  propertyType: z.nativeEnum(Portfolio.Token.PropertyType).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  website: z.string().url().optional()
})

const tokenAmountSchema = z.object({
  tokenId: z.string(),
  quantity: atomicValueSchema,
  decimals: z.number().min(0).max(18)
})

// API schemas
const apiResponseSuccessSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  tag: z.literal('right'),
  value: z.object({
    status: z.number(),
    data: dataSchema
  })
})

const apiResponseErrorSchema = z.object({
  tag: z.literal('left'),
  error: z.object({
    status: z.number(),
    message: z.string(),
    responseData: z.unknown().optional()
  })
})

const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.union([
  apiResponseSuccessSchema(dataSchema),
  apiResponseErrorSchema
])

// Swap schemas
const swapEstimateRequestSchema = z.object({
  sell: z.object({
    tokenId: z.string(),
    quantity: atomicValueSchema
  }),
  buy: z.object({
    tokenId: z.string()
  }),
  slippage: z.number().min(0).max(100),
  aggregator: z.nativeEnum(Swap.Aggregator).optional()
})

const swapEstimateResponseSchema = z.object({
  sell: z.object({
    tokenId: z.string(),
    quantity: atomicValueSchema
  }),
  buy: z.object({
    tokenId: z.string(),
    quantity: atomicValueSchema
  }),
  provider: z.nativeEnum(Swap.Protocol),
  fee: atomicValueSchema,
  priceImpact: z.number(),
  rate: z.number(),
  validUntil: z.number(),
  estimateId: z.string()
})

// Chain schemas
const cardanoAddressSchema = z.string().refine(
  (value) => value.startsWith('addr1') || value.startsWith('addr_test1'),
  { message: 'Invalid Cardano address format' }
)

const txHashSchema = z.string().regex(
  /^[a-fA-F0-9]{64}$/,
  { message: 'Invalid transaction hash format' }
)

// Export validation functions
export const validateTokenInfo = (value: unknown): Portfolio.Token.Info => {
  return tokenInfoSchema.parse(value)
}

export const validateTokenAmount = (value: unknown): Portfolio.Token.Amount => {
  return tokenAmountSchema.parse(value)
}

export const validateSwapEstimateRequest = (value: unknown): Swap.EstimateRequest => {
  return swapEstimateRequestSchema.parse(value)
}

export const validateCardanoAddress = (value: unknown): Chain.Cardano.Address => {
  return cardanoAddressSchema.parse(value) as Chain.Cardano.Address
}
```

This comprehensive types reference provides a complete overview of all TypeScript types, interfaces, and type definitions used throughout the Yoroi SDK. Use this as a reference when working with the SDK to ensure proper typing and avoid runtime errors.