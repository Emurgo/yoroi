# Yoroi SDK - Comprehensive API Documentation

Welcome to the Yoroi SDK documentation. This document provides comprehensive coverage of all public APIs, functions, and components across all packages in the Yoroi ecosystem.

## Table of Contents

1. [Overview](#overview)
2. [Package Architecture](#package-architecture)
3. [Core Packages](#core-packages)
   - [@yoroi/types](#yoroitypes)
   - [@yoroi/common](#yoroicommon)
   - [@yoroi/api](#yoroiapi)
   - [@yoroi/theme](#yoroitheme)
4. [Feature Packages](#feature-packages)
   - [@yoroi/swap](#yoroiswap)
   - [@yoroi/staking](#yoroistaking)
   - [@yoroi/portfolio](#yoroiportfolio)
   - [@yoroi/dapp-connector](#yoroidapp-connector)
   - [@yoroi/transfer](#yoroitransfer)
   - [@yoroi/resolver](#yoroiresolver)
   - [@yoroi/explorers](#yoroiexplorers)
   - [@yoroi/exchange](#yoroiexchange)
   - [@yoroi/notifications](#yoroinotifications)
   - [@yoroi/claim](#yoroiclaim)
   - [@yoroi/setup-wallet](#yoroisetup-wallet)
   - [@yoroi/links](#yoroilinks)
   - [@yoroi/identicon](#yoroiidenticon)
   - [@yoroi/blockchains](#yoroiblockchains)
5. [Applications](#applications)
   - [@yoroi/mobile](#yoroimobile)
6. [Installation & Setup](#installation--setup)
7. [Migration Guide](#migration-guide)

---

## Overview

The Yoroi SDK is a comprehensive TypeScript/JavaScript library for building Cardano-based wallet applications. It provides a modular architecture with separate packages for different functionalities, enabling developers to use only what they need.

### Key Features

- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Modular**: Use only the packages you need
- **Cross-Platform**: Works with React, React Native, and vanilla JavaScript
- **Cardano-First**: Built specifically for the Cardano ecosystem
- **Well-Tested**: Comprehensive test coverage across all packages

---

## Package Architecture

The Yoroi SDK follows a modular monorepo architecture:

```
yoroi/
├── packages/
│   ├── types/          # Core type definitions
│   ├── common/         # Shared utilities and helpers
│   ├── api/           # API layer for external services
│   ├── theme/         # UI theming system
│   ├── swap/          # DEX and swap functionality
│   ├── staking/       # Staking and governance
│   ├── portfolio/     # Portfolio management
│   ├── dapp-connector/# DApp connection
│   └── ...
└── apps/
    └── mobile/        # Mobile application
```

---

## Core Packages

### @yoroi/types

The foundational package containing all TypeScript type definitions used across the Yoroi ecosystem.

#### Installation

```bash
npm install @yoroi/types
```

#### Key Exports

The types package provides comprehensive namespaces for all Yoroi functionality:

```typescript
import {
  App,
  Api,
  Chain,
  Portfolio,
  Swap,
  Balance,
  Wallet,
  // ... many more
} from '@yoroi/types'
```

#### Core Namespaces

##### App Namespace

```typescript
// Storage interfaces
interface App.Storage<IsAsync extends boolean = true, K extends string = string> {
  // Storage operations
}

// Error classes
class App.Errors.InvalidState extends Error {}
class App.Errors.WrongPassword extends Error {}
class App.Errors.LibraryError extends Error {}

// Observer pattern
type App.ObserverManager<T> = {
  subscribe: (observer: App.Subscriber<T>) => () => void
  notify: (data: T) => void
}

// Cache management
interface App.CacheRecord<T> {
  data: T
  timestamp: number
  etag?: string
}
```

##### Api Namespace

```typescript
// Response types
type Api.Response<T> = Api.ResponseSuccess<T> | Api.ResponseError

interface Api.ResponseSuccess<T> {
  tag: 'right'
  value: { status: number; data: T }
}

interface Api.ResponseError {
  tag: 'left'
  error: { status: number; message: string; responseData: any }
}

// HTTP status codes
enum Api.HttpStatusCode {
  OK = 200,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  // ... all standard HTTP codes
}

// Error classes
class Api.Errors.BadRequest extends Error {}
class Api.Errors.NotFound extends Error {}
class Api.Errors.ServerSide extends Error {}
```

##### Chain Namespace

```typescript
// Network types
enum Chain.Network {
  Mainnet = 'mainnet',
  Preprod = 'preprod',
  Preview = 'preview'
}

// Cardano-specific types
namespace Chain.Cardano {
  type Address = string
  type TokenId = string
  
  interface TxInfo {
    hash: string
    inputs: Array<{ txHash: string; index: number }>
    outputs: Array<{ address: string; amount: string }>
  }
  
  interface ProtocolParams {
    minFeeA: number
    minFeeB: number
    maxTxSize: number
    utxoCostPerWord: number
    // ... all protocol parameters
  }
}
```

#### Usage Examples

```typescript
import { App, Api, Chain } from '@yoroi/types'

// Using storage types
const storage: App.Storage<true, string> = {
  async getItem(key: string): Promise<string | null> {
    // Implementation
  },
  async setItem(key: string, value: string): Promise<void> {
    // Implementation
  }
}

// Using API response types
async function fetchData(): Promise<Api.Response<any>> {
  try {
    const response = await fetch('/api/data')
    return {
      tag: 'right',
      value: { status: response.status, data: await response.json() }
    }
  } catch (error) {
    return {
      tag: 'left',
      error: { status: -1, message: error.message, responseData: null }
    }
  }
}

// Using chain types
const network: Chain.Network = Chain.Network.Mainnet
```

---

### @yoroi/common

Shared utilities, helpers, and common functionality used across all Yoroi packages.

#### Installation

```bash
npm install @yoroi/common
```

#### Key Exports

##### API Utilities

```typescript
import { fetchData, getApiError, fetcher } from '@yoroi/common'

// HTTP request utility
const fetchData: <T, D = any>(
  config: RequestConfig<D>,
  fetcherConfig?: AxiosRequestConfig<D>
) => Promise<Api.Response<T>>
```

**fetchData Usage:**

```typescript
import { fetchData } from '@yoroi/common'

// GET request
const response = await fetchData<{ users: User[] }>({
  url: 'https://api.example.com/users',
  onSuccess: () => console.log('Success!'),
  onError: () => console.log('Error occurred')
})

// POST request with data
const createResponse = await fetchData<User, CreateUserData>({
  url: 'https://api.example.com/users',
  method: 'post',
  data: { name: 'John', email: 'john@example.com' },
  headers: { 'Authorization': 'Bearer token' }
})

// Handle response
if (response.tag === 'right') {
  console.log('Users:', response.value.data.users)
} else {
  console.error('Error:', response.error.message)
}
```

##### Cache Management

```typescript
import { 
  cacheManageMultiRequest,
  cacheRecordMaker,
  isExpired,
  recordWithEtag
} from '@yoroi/common'

// Create cache record
const cacheRecord = cacheRecordMaker<UserData>({
  data: userData,
  timestamp: Date.now(),
  etag: 'abc123'
})

// Check if cache is expired
const expired = isExpired(cacheRecord, 60000) // 1 minute TTL

// Multi-request cache management
const cachedResults = await cacheManageMultiRequest({
  requests: [request1, request2, request3],
  cache: cacheStorage,
  ttl: 300000 // 5 minutes
})
```

##### Utility Functions

```typescript
import { 
  arrays,
  strings,
  predicates,
  monads,
  promises,
  hex
} from '@yoroi/common'

// Array utilities
const chunked = arrays.chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
const unique = arrays.unique([1, 2, 2, 3]) // [1, 2, 3]

// String utilities
const truncated = strings.truncate('Long text here', 10) // 'Long te...'
const camelCase = strings.toCamelCase('hello-world') // 'helloWorld'

// Predicates
const isString = predicates.isString('test') // true
const isNumber = predicates.isNumber(42) // true

// Monads
const maybe = monads.Maybe.of('value')
const result = maybe.map(v => v.toUpperCase()) // Maybe('VALUE')

// Promise utilities
const delayed = await promises.delay(1000) // Wait 1 second
const timeout = promises.withTimeout(fetch('/api'), 5000) // 5s timeout

// Hex utilities
const bytes = hex.toBytes('48656c6c6f') // [72, 101, 108, 108, 111]
const hexString = hex.fromBytes([72, 101, 108, 108, 111]) // '48656c6c6f'
```

##### Number Utilities

```typescript
import { 
  atomicToDecimal,
  atomicFormatter,
  parseDecimal,
  atomicBreakdown,
  toNumber,
  toBigInt
} from '@yoroi/common'

// Convert atomic units to decimal
const ada = atomicToDecimal('1000000', 6) // '1.000000'

// Format atomic values
const formatted = atomicFormatter('1500000', {
  decimals: 6,
  symbol: 'ADA'
}) // '1.5 ADA'

// Parse decimal to atomic
const atomic = parseDecimal('1.5', 6) // '1500000'

// Breakdown amounts
const breakdown = atomicBreakdown('1234567', 6)
// { integer: '1', decimal: '234567' }

// Safe number conversions
const num = toNumber('123.45') // 123.45 or throws if invalid
const bigint = toBigInt('123') // 123n or throws if invalid
```

##### Storage Adapters

```typescript
import { 
  asyncStorageAdapter,
  mmkvStorageAdapter,
  observableStorageAdapter
} from '@yoroi/common'

// AsyncStorage adapter (React Native)
const asyncStorage = asyncStorageAdapter({
  AsyncStorage: require('@react-native-async-storage/async-storage').default
})

// MMKV adapter (React Native)
const mmkvStorage = mmkvStorageAdapter({
  MMKV: require('react-native-mmkv').MMKV
})

// Observable storage wrapper
const observableStorage = observableStorageAdapter(asyncStorage)

// Usage
await asyncStorage.setItem('key', JSON.stringify(data))
const data = JSON.parse(await asyncStorage.getItem('key') ?? '{}')

// With observers
observableStorage.subscribe('key', (value) => {
  console.log('Value changed:', value)
})
```

##### React Hooks

```typescript
import { 
  useMutationWithInvalidations,
  useObservableValue,
  useSyncStorageToState
} from '@yoroi/common'

// Mutation with cache invalidation
const mutation = useMutationWithInvalidations({
  mutationFn: updateUser,
  invalidateQueries: ['users', 'profile']
})

// Observable value hook
const value = useObservableValue(observableValue, initialValue)

// Sync storage to state
const [value, setValue] = useSyncStorageToState(storage, 'key', defaultValue)
```

---

### @yoroi/api

API layer providing interfaces to external services and Cardano network APIs.

#### Installation

```bash
npm install @yoroi/api
```

#### Key Exports

The API package is organized into three main areas:

```typescript
import { AppApi, CardanoApi, CardanoTokenId } from '@yoroi/api'
```

##### AppApi

Application-level API functions:

```typescript
// Frontend fees
const fees = await AppApi.getFrontendFees()

// Create app API instance
const appApi = AppApi.appApiMaker({
  baseUrl: 'https://api.yoroi.com',
  apiKey: 'your-api-key'
})
```

**Frontend Fees Usage:**

```typescript
import { AppApi } from '@yoroi/api'

const feesResponse = await AppApi.getFrontendFees()

if (feesResponse.tag === 'right') {
  const fees = feesResponse.value.data
  console.log('Fee tiers:', fees.tiers)
  // Use fees for transaction calculations
} else {
  console.error('Failed to fetch fees:', feesResponse.error)
}
```

##### CardanoApi

Cardano blockchain API functions:

```typescript
import { CardanoApi } from '@yoroi/api'

// Create Cardano API instance
const cardanoApi = CardanoApi.cardanoApiMaker({
  network: Chain.Network.Mainnet,
  request: customFetcher // optional
})

// Get protocol parameters
const protocolParams = await cardanoApi.getProtocolParams()

// Get UTXO data
const utxoData = await cardanoApi.getUtxoData({
  addresses: ['addr1...']
})

// Token metadata functions
const onChainMetadata = await CardanoApi.getOnChainMetadatas({
  tokenIds: ['policy.assetname']
})

const offChainMetadata = await CardanoApi.getOffChainMetadata({
  url: 'https://example.com/metadata.json'
})

// Token supply information
const supply = await CardanoApi.getTokenSupply({
  tokenId: 'policy.assetname'
})
```

**Detailed Usage Examples:**

```typescript
import { CardanoApi, CardanoTokenId } from '@yoroi/api'
import { Chain } from '@yoroi/types'

// Initialize API for mainnet
const api = CardanoApi.cardanoApiMaker({
  network: Chain.Network.Mainnet
})

// Fetch protocol parameters
async function getProtocolInfo() {
  const params = await api.getProtocolParams()
  console.log('Min fee:', params.minFeeA)
  console.log('UTXO cost per word:', params.utxoCostPerWord)
  return params
}

// Get UTXO data for addresses
async function getAddressUTXOs(addresses: string[]) {
  const response = await api.getUtxoData({ addresses })
  
  if (response.tag === 'right') {
    const utxos = response.value.data
    console.log(`Found ${utxos.length} UTXOs`)
    return utxos
  } else {
    throw new Error(`Failed to fetch UTXOs: ${response.error.message}`)
  }
}

// Token metadata fetching
async function getTokenInfo(tokenId: string) {
  // Get on-chain metadata
  const onChainResponse = await CardanoApi.getOnChainMetadatas({
    tokenIds: [tokenId]
  })
  
  // Get off-chain metadata if available
  let offChainMetadata = null
  if (onChainResponse.tag === 'right') {
    const onChain = onChainResponse.value.data[0]
    if (onChain?.metadata?.url) {
      const offChainResponse = await CardanoApi.getOffChainMetadata({
        url: onChain.metadata.url
      })
      if (offChainResponse.tag === 'right') {
        offChainMetadata = offChainResponse.value.data
      }
    }
  }
  
  return { onChain: onChainResponse, offChain: offChainMetadata }
}
```

##### CardanoTokenId

Token ID utilities and transformers:

```typescript
import { CardanoTokenId } from '@yoroi/api'

// Transform token ID to fingerprint
const fingerprint = CardanoTokenId.asFingerprint('policy123.assetname')

// Transform to subject
const subject = CardanoTokenId.asSubject('policy123.assetname')

// Get token identity information
const identity = CardanoTokenId.getTokenIdentity('policy123.assetname')
```

**Token ID Utilities:**

```typescript
import { CardanoTokenId } from '@yoroi/api'

const policyId = 'a1b2c3d4e5f6...'
const assetName = 'MyToken'
const tokenId = `${policyId}.${assetName}`

// Convert to CIP-14 fingerprint
const fingerprint = CardanoTokenId.asFingerprint(tokenId)
console.log('Fingerprint:', fingerprint) // asset1abc123...

// Get subject (policy + asset name as hex)
const subject = CardanoTokenId.asSubject(tokenId)
console.log('Subject:', subject)

// Get complete token identity
const identity = CardanoTokenId.getTokenIdentity(tokenId)
console.log('Identity:', {
  policyId: identity.policyId,
  assetName: identity.assetName,
  fingerprint: identity.fingerprint
})
```

##### Metadata Parsers

```typescript
import { CardanoApi } from '@yoroi/api'

// Check metadata types
const isNft = CardanoApi.isNftMetadata(metadata)
const isFt = CardanoApi.isFtMetadata(metadata)
const isFile = CardanoApi.isMetadataFile(metadata)

// Usage in metadata processing
function processMetadata(metadata: unknown) {
  if (CardanoApi.isNftMetadata(metadata)) {
    console.log('NFT metadata:', metadata.name, metadata.image)
  } else if (CardanoApi.isFtMetadata(metadata)) {
    console.log('FT metadata:', metadata.name, metadata.symbol)
  } else if (CardanoApi.isMetadataFile(metadata)) {
    console.log('File metadata:', metadata.name, metadata.mediaType)
  }
}
```

---

### @yoroi/theme

UI theming system providing consistent design tokens and theme management.

#### Installation

```bash
npm install @yoroi/theme
```

#### Key Exports

```typescript
import { 
  ThemeProvider,
  useTheme,
  lightPalette,
  darkPalette,
  atoms,
  tokens
} from '@yoroi/theme'
```

##### ThemeProvider

The root component for theme context:

```typescript
import { ThemeProvider } from '@yoroi/theme'

function App() {
  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  )
}
```

**Advanced ThemeProvider Usage:**

```typescript
import { ThemeProvider, ThemeConfig } from '@yoroi/theme'

// Custom theme configuration
const customTheme: ThemeConfig = {
  name: 'custom',
  palette: {
    primary: '#1a73e8',
    secondary: '#34a853',
    background: '#ffffff',
    surface: '#f8f9fa',
    // ... more colors
  }
}

function App() {
  return (
    <ThemeProvider initialTheme={customTheme}>
      <YourAppContent />
    </ThemeProvider>
  )
}
```

##### useTheme Hook

Access theme data and controls:

```typescript
import { useTheme } from '@yoroi/theme'

function MyComponent() {
  const {
    config,
    palette,
    atoms,
    selectTheme,
    isLight,
    isDark
  } = useTheme()
  
  return (
    <View style={[atoms.bg_color_max, { padding: 16 }]}>
      <Text style={atoms.text_primary_max}>
        Current theme: {config.name}
      </Text>
      <Button 
        onPress={() => selectTheme(isLight ? darkTheme : lightTheme)}
        title={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
      />
    </View>
  )
}
```

##### Design Tokens

```typescript
import { tokens } from '@yoroi/theme'

// Spacing tokens
console.log(tokens.space.xs)  // 4
console.log(tokens.space.sm)  // 8
console.log(tokens.space.md)  // 16
console.log(tokens.space.lg)  // 24
console.log(tokens.space.xl)  // 32

// Typography tokens
console.log(tokens.typography.heading1) 
// { fontSize: 32, fontWeight: 'bold', lineHeight: 40 }

console.log(tokens.typography.body) 
// { fontSize: 16, fontWeight: 'normal', lineHeight: 24 }

// Border radius tokens
console.log(tokens.radius.sm)  // 4
console.log(tokens.radius.md)  // 8
console.log(tokens.radius.lg)  // 12

// Shadow tokens
console.log(tokens.shadows.sm)
// { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, ... }
```

##### Atoms

Pre-styled atomic design elements:

```typescript
import { atoms } from '@yoroi/theme'

function StyledComponent() {
  return (
    <View style={[
      atoms.bg_color_max,      // Background color
      atoms.p_16,              // Padding 16
      atoms.m_8,               // Margin 8
      atoms.rounded_8,         // Border radius 8
      atoms.shadow_sm          // Small shadow
    ]}>
      <Text style={[
        atoms.text_primary_max,  // Primary text color
        atoms.font_semibold,     // Semibold font weight
        atoms.text_lg            // Large text size
      ]}>
        Styled with atoms
      </Text>
    </View>
  )
}
```

##### Color Palettes

```typescript
import { lightPalette, darkPalette } from '@yoroi/theme'

// Light theme colors
console.log(lightPalette.primary)     // '#1a73e8'
console.log(lightPalette.background)  // '#ffffff'
console.log(lightPalette.surface)     // '#f8f9fa'

// Dark theme colors
console.log(darkPalette.primary)      // '#4285f4'
console.log(darkPalette.background)   // '#121212'
console.log(darkPalette.surface)      // '#1e1e1e'

// Usage in custom styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: lightPalette.background,
    borderColor: lightPalette.border
  }
})
```

##### Theme Detection

```typescript
import { detectTheme } from '@yoroi/theme'

// Detect system theme preference
const preferredTheme = detectTheme()
console.log('User prefers:', preferredTheme) // 'light' | 'dark'

// Use with theme selection
function useSystemTheme() {
  const [theme, setTheme] = useState(detectTheme())
  
  useEffect(() => {
    const listener = (event) => {
      setTheme(event.matches ? 'dark' : 'light')
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', listener)
    
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])
  
  return theme
}
```

---

## Feature Packages

### @yoroi/swap

DEX integration and token swapping functionality.

#### Installation

```bash
npm install @yoroi/swap
```

#### Key Features

- Multi-DEX aggregation
- Best price discovery
- Swap execution
- Liquidity pool information
- Slippage protection

#### Key Exports

```typescript
import { 
  swapManagerMaker,
  getBestSwap,
  getDexByProtocol,
  getDexUrlByProtocol,
  swapStorageMaker
} from '@yoroi/swap'
```

##### Swap Manager

```typescript
import { swapManagerMaker } from '@yoroi/swap'
import { Swap } from '@yoroi/types'

const swapManager: Swap.Manager = swapManagerMaker({
  network: Chain.Network.Mainnet,
  storage: swapStorage,
  api: swapApi
})

// Get swap options
const swapOptions = await swapManager.getSwapOptions({
  from: { tokenId: 'ada', amount: '100000000' }, // 100 ADA
  to: { tokenId: 'policy.token' },
  slippage: 0.5 // 0.5%
})

// Execute swap
const swapResult = await swapManager.executeSwap({
  option: swapOptions[0],
  address: 'addr1...'
})
```

**Detailed Swap Usage:**

```typescript
import { swapManagerMaker, getBestSwap } from '@yoroi/swap'
import { Swap, Chain } from '@yoroi/types'

// Initialize swap manager
const swapManager = swapManagerMaker({
  network: Chain.Network.Mainnet,
  storage: await swapStorageMaker(),
  settings: {
    maxSlippage: 1.0,  // 1% max slippage
    deadline: 30       // 30 minutes
  }
})

// Find best swap route
async function findBestSwapRoute() {
  const swapRequest: Swap.EstimateRequest = {
    sell: {
      tokenId: '',  // ADA (empty string for native token)
      quantity: '100000000'  // 100 ADA in lovelace
    },
    buy: {
      tokenId: 'policy123.token456'
    },
    slippage: 0.5  // 0.5%
  }
  
  const estimates = await swapManager.estimate(swapRequest)
  const bestSwap = getBestSwap(estimates)
  
  console.log('Best swap:', {
    dex: bestSwap.provider,
    rate: bestSwap.rate,
    fee: bestSwap.fee,
    impact: bestSwap.priceImpact
  })
  
  return bestSwap
}

// Execute a swap
async function executeSwap(estimate: Swap.EstimateResponse) {
  const createRequest: Swap.CreateRequest = {
    estimate,
    address: 'addr1qxyz...',  // User's address
    utxos: userUtxos         // User's UTXOs
  }
  
  const swapTx = await swapManager.create(createRequest)
  
  if (swapTx.tag === 'right') {
    // Sign and submit transaction
    const signedTx = await wallet.signTx(swapTx.value.unsignedTx)
    const result = await swapManager.submit(signedTx)
    
    console.log('Swap submitted:', result.txHash)
    return result
  } else {
    throw new Error(`Swap failed: ${swapTx.error}`)
  }
}
```

##### DEX Integration

```typescript
import { getDexByProtocol, getDexUrlByProtocol } from '@yoroi/swap'
import { Swap } from '@yoroi/types'

// Get DEX information
const dex = getDexByProtocol(Swap.Protocol.Sundae)
console.log('DEX name:', dex.name)
console.log('DEX fee:', dex.fee)

// Get DEX URL
const dexUrl = getDexUrlByProtocol(Swap.Protocol.Sundae)
console.log('DEX URL:', dexUrl)

// Available protocols
const protocols = [
  Swap.Protocol.Sundae,
  Swap.Protocol.Minswap,
  Swap.Protocol.Wingriders,
  Swap.Protocol.Muesliswap
]
```

##### Swap Storage

```typescript
import { swapStorageMaker } from '@yoroi/swap'

// Create swap storage
const swapStorage = await swapStorageMaker({
  storage: mmkvStorage,  // or asyncStorage
  keyPrefix: 'swap_'
})

// Storage includes:
// - Swap history
// - User preferences
// - Cached price data
// - Slippage settings
```

---

### @yoroi/staking

Staking, delegation, and governance functionality for Cardano.

#### Installation

```bash
npm install @yoroi/staking
```

#### Key Features

- Stake pool delegation
- Rewards tracking
- Governance voting (Catalyst)
- Staking history
- Pool information

#### Key Exports

```typescript
import { 
  CatalystManager,
  CatalystProvider,
  GovernanceApi,
  useCatalyst
} from '@yoroi/staking'
```

##### Catalyst Integration

```typescript
import { CatalystManager, CatalystProvider } from '@yoroi/staking'

// Catalyst manager for governance
const catalystManager = new CatalystManager({
  network: Chain.Network.Mainnet,
  apiKey: 'catalyst-api-key'
})

// React provider for Catalyst
function App() {
  return (
    <CatalystProvider manager={catalystManager}>
      <GovernanceApp />
    </CatalystProvider>
  )
}
```

**Catalyst Voting Usage:**

```typescript
import { useCatalyst } from '@yoroi/staking'

function VotingComponent() {
  const {
    funds,
    proposals,
    vote,
    getVotingPower,
    isRegistered
  } = useCatalyst()
  
  // Check voting registration
  const registered = await isRegistered(walletId)
  
  // Get voting power
  const votingPower = await getVotingPower(walletId)
  
  // Cast vote
  const voteResult = await vote({
    proposalId: 'proposal123',
    choice: 'yes',
    votingPower: votingPower
  })
  
  return (
    <View>
      <Text>Voting Power: {votingPower} ADA</Text>
      <Text>Registration: {registered ? 'Active' : 'Required'}</Text>
    </View>
  )
}
```

##### Governance API

```typescript
import { GovernanceApi } from '@yoroi/staking'

// Get governance information
const governance = await GovernanceApi.getGovernanceInfo()

// Get fund information
const currentFund = await GovernanceApi.getCurrentFund()

// Get proposals
const proposals = await GovernanceApi.getProposals({
  fundId: currentFund.id,
  limit: 20,
  offset: 0
})

// Vote on proposal
const voteResult = await GovernanceApi.submitVote({
  proposalId: 'proposal123',
  vote: 'yes',
  signature: votingSignature
})
```

---

### @yoroi/portfolio

Portfolio management, token tracking, and balance calculations.

#### Installation

```bash
npm install @yoroi/portfolio
```

#### Key Features

- Multi-token portfolio tracking
- Price aggregation
- Balance calculations
- Transaction history
- Token metadata management
- Portfolio analytics

#### Key Exports

```typescript
import { 
  PortfolioTokenManager,
  PortfolioBalanceManager,
  usePortfolioTokenInfo,
  usePortfolioTokenDiscovery,
  portfolioApiMaker
} from '@yoroi/portfolio'
```

##### Token Manager

```typescript
import { PortfolioTokenManager } from '@yoroi/portfolio'
import { Portfolio } from '@yoroi/types'

const tokenManager: Portfolio.Manager.Token = new PortfolioTokenManager({
  storage: tokenStorage,
  api: portfolioApi,
  network: Chain.Network.Mainnet
})

// Sync token information
await tokenManager.sync({
  tokenIds: ['policy.token1', 'policy.token2'],
  forceUpdate: false
})

// Get token information
const tokenInfo = await tokenManager.getTokenInfo('policy.token1')
console.log('Token:', tokenInfo.name, tokenInfo.symbol)

// Subscribe to token updates
tokenManager.subscribe(Portfolio.Event.ManagerOn.Sync, (event) => {
  console.log('Tokens synced:', event.tokenIds.length)
})
```

##### Balance Manager

```typescript
import { PortfolioBalanceManager } from '@yoroi/portfolio'
import { Portfolio } from '@yoroi/types'

const balanceManager: Portfolio.Manager.Balance = new PortfolioBalanceManager({
  storage: balanceStorage,
  api: cardanoApi,
  tokenManager: tokenManager
})

// Update balances for addresses
await balanceManager.sync({
  addresses: ['addr1...', 'addr2...']
})

// Get total portfolio value
const totalValue = balanceManager.getTotalValue('usd')
console.log('Portfolio value:', totalValue)

// Get balances by token
const balances = balanceManager.getBalances()
balances.forEach(balance => {
  console.log(`${balance.info.name}: ${balance.quantity.total}`)
})
```

**Detailed Portfolio Usage:**

```typescript
import { 
  PortfolioTokenManager,
  PortfolioBalanceManager,
  portfolioApiMaker
} from '@yoroi/portfolio'
import { Portfolio, Chain } from '@yoroi/types'

// Setup portfolio managers
async function setupPortfolio() {
  const api = portfolioApiMaker({
    baseUrl: 'https://portfolio-api.yoroi.com',
    network: Chain.Network.Mainnet
  })
  
  const tokenManager = new PortfolioTokenManager({
    storage: await tokenStorageMaker(),
    api: api,
    network: Chain.Network.Mainnet
  })
  
  const balanceManager = new PortfolioBalanceManager({
    storage: await balanceStorageMaker(),
    api: api,
    tokenManager: tokenManager
  })
  
  return { tokenManager, balanceManager }
}

// Track portfolio performance
async function getPortfolioSummary(addresses: string[]) {
  const { tokenManager, balanceManager } = await setupPortfolio()
  
  // Sync latest data
  await balanceManager.sync({ addresses })
  
  // Get current balances
  const balances = balanceManager.getBalances()
  
  // Calculate total values
  const totalValueUsd = balanceManager.getTotalValue('usd')
  const totalValueAda = balanceManager.getTotalValue('ada')
  
  // Get breakdown by token type
  const breakdown = balanceManager.getPrimaryBreakdown()
  
  return {
    totalTokens: balances.length,
    totalValueUsd,
    totalValueAda,
    breakdown: {
      native: breakdown.native,
      ft: breakdown.ft,
      nft: breakdown.nft
    },
    topHoldings: balances
      .sort((a, b) => b.price.usd - a.price.usd)
      .slice(0, 10)
  }
}
```

##### React Hooks

```typescript
import { 
  usePortfolioTokenInfo,
  usePortfolioTokenDiscovery,
  usePortfolioTokenTraits
} from '@yoroi/portfolio'

function TokenDetails({ tokenId }: { tokenId: string }) {
  // Get token information
  const tokenInfo = usePortfolioTokenInfo({
    tokenId,
    options: { enabled: !!tokenId }
  })
  
  // Get token discovery data
  const discovery = usePortfolioTokenDiscovery({
    tokenId,
    options: { enabled: !!tokenId }
  })
  
  // Get token traits (for NFTs)
  const traits = usePortfolioTokenTraits({
    tokenId,
    options: { enabled: !!tokenId }
  })
  
  if (tokenInfo.isLoading) return <LoadingSpinner />
  if (tokenInfo.error) return <ErrorMessage error={tokenInfo.error} />
  
  return (
    <View>
      <Text>{tokenInfo.data.name}</Text>
      <Text>{tokenInfo.data.symbol}</Text>
      <Text>Type: {tokenInfo.data.type}</Text>
      {traits.data && (
        <TraitsList traits={traits.data} />
      )}
    </View>
  )
}
```

##### Portfolio Analytics

```typescript
import { 
  amountFormatter,
  amountBreakdown,
  amountsCalculator,
  createPrimaryTokenInfo
} from '@yoroi/portfolio'

// Format token amounts
const formatted = amountFormatter({
  quantity: '1500000',
  decimals: 6,
  symbol: 'ADA'
})
console.log(formatted) // '1.5 ADA'

// Calculate amounts
const calculator = amountsCalculator({
  balances: portfolioBalances,
  prices: tokenPrices
})

const totalUsd = calculator.getTotalValue('usd')
const totalAda = calculator.getTotalValue('ada')

// Create primary token info (ADA)
const adaInfo = createPrimaryTokenInfo(Chain.Network.Mainnet)
console.log('Primary token:', adaInfo.name, adaInfo.ticker)
```

---

### @yoroi/dapp-connector

DApp connection and wallet integration functionality.

#### Installation

```bash
npm install @yoroi/dapp-connector
```

#### Key Features

- DApp discovery and connection
- Wallet API implementation
- Permission management
- Transaction signing
- Address sharing

#### Key Exports

```typescript
import { 
  dappConnectorMaker,
  DappConnectorProvider,
  useDappList,
  connectionStorageMaker,
  ResolverWallet
} from '@yoroi/dapp-connector'
```

##### DApp Connector

```typescript
import { dappConnectorMaker } from '@yoroi/dapp-connector'

const dappConnector = dappConnectorMaker({
  storage: connectionStorage,
  wallet: walletInstance,
  permissions: {
    allowedOrigins: ['https://app.sundaeswap.finance'],
    autoApprove: false
  }
})

// Handle connection request
const connection = await dappConnector.connect({
  origin: 'https://dapp.example.com',
  permissions: ['getBalance', 'signTx']
})

// Handle API calls
dappConnector.onApiCall(async (request) => {
  switch (request.method) {
    case 'getBalance':
      return await wallet.getBalance()
    case 'getUtxos':
      return await wallet.getUtxos()
    case 'signTx':
      return await wallet.signTx(request.params.tx)
  }
})
```

**DApp Integration Example:**

```typescript
import { 
  dappConnectorMaker,
  connectionStorageMaker,
  DappConnectorProvider
} from '@yoroi/dapp-connector'

// Setup DApp connector
async function setupDappConnector(wallet: Wallet) {
  const storage = await connectionStorageMaker()
  
  const connector = dappConnectorMaker({
    storage,
    wallet,
    network: Chain.Network.Mainnet,
    permissions: {
      allowedMethods: [
        'getBalance',
        'getUtxos', 
        'getUsedAddresses',
        'getUnusedAddresses',
        'signTx',
        'submitTx'
      ],
      requireApproval: ['signTx', 'submitTx']
    }
  })
  
  return connector
}

// React provider setup
function App() {
  const [connector, setConnector] = useState(null)
  
  useEffect(() => {
    setupDappConnector(wallet).then(setConnector)
  }, [wallet])
  
  return (
    <DappConnectorProvider connector={connector}>
      <WalletApp />
    </DappConnectorProvider>
  )
}

// Component using DApp connections
function DappList() {
  const dappList = useDappList()
  
  return (
    <FlatList
      data={dappList.data}
      renderItem={({ item }) => (
        <DappCard
          name={item.name}
          url={item.url}
          icon={item.icon}
          connected={item.connected}
          onConnect={() => connector.connect(item.url)}
        />
      )}
    />
  )
}
```

##### Wallet Resolver

```typescript
import { ResolverWallet } from '@yoroi/dapp-connector'

// Create wallet resolver for DApp API
const resolverWallet = new ResolverWallet({
  wallet: walletInstance,
  permissions: connectionPermissions
})

// Implements CIP-30 Wallet API
const api = {
  getBalance: () => resolverWallet.getBalance(),
  getUtxos: (amount?, paginate?) => resolverWallet.getUtxos(amount, paginate),
  getUsedAddresses: (paginate?) => resolverWallet.getUsedAddresses(paginate),
  getUnusedAddresses: () => resolverWallet.getUnusedAddresses(),
  getChangeAddress: () => resolverWallet.getChangeAddress(),
  getRewardAddresses: () => resolverWallet.getRewardAddresses(),
  signTx: (tx, partialSign?) => resolverWallet.signTx(tx, partialSign),
  signData: (addr, payload) => resolverWallet.signData(addr, payload),
  submitTx: (tx) => resolverWallet.submitTx(tx)
}
```

##### Connection Storage

```typescript
import { connectionStorageMaker } from '@yoroi/dapp-connector'

const connectionStorage = await connectionStorageMaker({
  storage: mmkvStorage,
  keyPrefix: 'dapp_connections_'
})

// Store connection
await connectionStorage.addConnection({
  origin: 'https://dapp.example.com',
  permissions: ['getBalance', 'signTx'],
  timestamp: Date.now()
})

// Get connections
const connections = await connectionStorage.getConnections()

// Remove connection
await connectionStorage.removeConnection('https://dapp.example.com')
```

---

### @yoroi/transfer

Transfer and transaction building functionality.

#### Installation

```bash
npm install @yoroi/transfer
```

#### Key Features

- Transaction building
- Multi-output transfers
- Fee calculation
- Input selection
- Address validation

#### Key Types

```typescript
import { Transfer } from '@yoroi/types'

// Transfer entry
interface TransferEntry {
  address: string
  amounts: Array<{
    tokenId: string
    quantity: string
  }>
  datum?: string
}

// Transfer targets
type TransferTargets = TransferEntry[]
```

**Transfer Usage Example:**

```typescript
import { Transfer } from '@yoroi/types'

// Single ADA transfer
const adaTransfer: Transfer.Entry = {
  address: 'addr1qxyz...',
  amounts: [{
    tokenId: '', // Empty for ADA
    quantity: '5000000' // 5 ADA in lovelace
  }]
}

// Multi-asset transfer
const multiAssetTransfer: Transfer.Entry = {
  address: 'addr1qabc...',
  amounts: [
    {
      tokenId: '', // ADA
      quantity: '2000000' // 2 ADA
    },
    {
      tokenId: 'policy123.token456',
      quantity: '100' // 100 tokens
    }
  ]
}

// Multiple recipients
const transferTargets: Transfer.Targets = [
  adaTransfer,
  multiAssetTransfer,
  {
    address: 'addr1qdef...',
    amounts: [{
      tokenId: 'policy789.nft001',
      quantity: '1'
    }]
  }
]
```

---

### @yoroi/resolver

Address resolution for human-readable names (ADA Handle, etc.).

#### Installation

```bash
npm install @yoroi/resolver
```

#### Key Features

- ADA Handle resolution
- ENS-style name resolution
- Address validation
- Reverse resolution
- Caching

#### Key Exports

```typescript
import { 
  ResolverManager,
  ResolverApi,
  resolverStorageMaker
} from '@yoroi/resolver'
```

##### Resolver Manager

```typescript
import { ResolverManager } from '@yoroi/resolver'
import { Resolver } from '@yoroi/types'

const resolverManager: Resolver.Manager = new ResolverManager({
  storage: resolverStorage,
  api: resolverApi,
  strategy: Resolver.Strategy.CacheFirst
})

// Resolve handle to address
const address = await resolverManager.resolve('$alice')
console.log('Alice address:', address)

// Reverse resolve address to handle
const handle = await resolverManager.reverseResolve('addr1...')
console.log('Address handle:', handle)

// Batch resolution
const addresses = await resolverManager.resolveMany([
  '$alice', '$bob', '$charlie'
])
```

**Detailed Resolver Usage:**

```typescript
import { ResolverManager, resolverStorageMaker } from '@yoroi/resolver'
import { Resolver } from '@yoroi/types'

// Setup resolver
async function setupResolver() {
  const storage = await resolverStorageMaker({
    storage: mmkvStorage,
    ttl: 3600000 // 1 hour cache
  })
  
  const manager = new ResolverManager({
    storage,
    nameServers: [
      Resolver.NameServer.AdaHandle,
      Resolver.NameServer.CNS
    ],
    strategy: Resolver.Strategy.CacheFirst
  })
  
  return manager
}

// Resolve names in UI
async function resolveRecipient(input: string) {
  const resolver = await setupResolver()
  
  // Check if input looks like a handle
  if (input.startsWith('$') || input.includes('.ada')) {
    try {
      const resolved = await resolver.resolve(input)
      
      if (resolved.tag === 'right') {
        return {
          type: 'handle',
          handle: input,
          address: resolved.value.address,
          verified: true
        }
      }
    } catch (error) {
      console.error('Resolution failed:', error)
    }
  }
  
  // Validate as direct address
  if (isValidCardanoAddress(input)) {
    return {
      type: 'address',
      address: input,
      verified: true
    }
  }
  
  return { type: 'invalid', verified: false }
}

// Get resolver receiver for a name
const receiver: Resolver.Receiver = await resolver.getReceiver('$alice')
console.log('Receiver info:', {
  address: receiver.address,
  verified: receiver.verified,
  source: receiver.source
})
```

##### Resolver API

```typescript
import { ResolverApi } from '@yoroi/resolver'

// Direct API usage
const api: Resolver.Api = {
  resolveAddress: async (name: string) => {
    const response = await ResolverApi.resolveAddress(name)
    return response
  },
  
  resolveAddresses: async (names: string[]) => {
    const response = await ResolverApi.resolveAddresses(names)
    return response
  }
}
```

---

### @yoroi/explorers

Blockchain explorer integration and transaction tracking.

#### Installation

```bash
npm install @yoroi/explorers
```

#### Key Features

- Multiple explorer support
- Transaction links
- Address links
- Asset links
- Network-specific URLs

#### Key Exports

```typescript
import { ExplorersManager, Explorer } from '@yoroi/explorers'
```

##### Explorers Manager

```typescript
import { ExplorersManager, Explorer } from '@yoroi/explorers'

const explorersManager: Explorers.Manager = new ExplorersManager({
  network: Chain.Network.Mainnet,
  defaultExplorer: Explorer.CardanoScan
})

// Get transaction URL
const txUrl = explorersManager.getTxUrl('abc123...def')
console.log('Transaction URL:', txUrl)

// Get address URL
const addrUrl = explorersManager.getAddressUrl('addr1...')
console.log('Address URL:', addrUrl)

// Get token URL
const tokenUrl = explorersManager.getTokenUrl('policy.asset')
console.log('Token URL:', tokenUrl)

// Switch explorer
explorersManager.setExplorer(Explorer.AdaEx)
```

**Explorer Usage Example:**

```typescript
import { ExplorersManager, Explorer } from '@yoroi/explorers'
import { Chain } from '@yoroi/types'

// Setup explorer manager
const explorer = new ExplorersManager({
  network: Chain.Network.Mainnet,
  defaultExplorer: Explorer.CardanoScan
})

// Available explorers
const explorers = [
  Explorer.CardanoScan,
  Explorer.AdaEx,
  Explorer.Cardanoscan,
  Explorer.AdaStat,
  Explorer.CExplorer
]

// Generate explorer links for transaction history
function TransactionList({ transactions }) {
  return (
    <FlatList
      data={transactions}
      renderItem={({ item }) => (
        <View>
          <Text>{item.hash}</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(
              explorer.getTxUrl(item.hash)
            )}
          >
            <Text>View in Explorer</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  )
}

// Generate links for different resources
const links = {
  transaction: explorer.getTxUrl('tx123...'),
  address: explorer.getAddressUrl('addr1...'),
  stakeKey: explorer.getStakeKeyUrl('stake1...'),
  policy: explorer.getPolicyUrl('policy123...'),
  asset: explorer.getAssetUrl('policy123.asset456')
}
```

---

### @yoroi/exchange

Cryptocurrency exchange integration for buying/selling crypto.

#### Installation

```bash
npm install @yoroi/exchange
```

#### Key Features

- Multiple exchange provider support
- Fiat on/off ramps
- Rate comparison
- Order management
- KYC integration

#### Key Exports

```typescript
import { 
  ExchangeManager,
  exchangeManagerMaker,
  ExchangeProvider,
  ExchangeApi
} from '@yoroi/exchange'
```

##### Exchange Manager

```typescript
import { exchangeManagerMaker } from '@yoroi/exchange'
import { Exchange } from '@yoroi/types'

const exchangeManager: Exchange.Manager = exchangeManagerMaker({
  providers: [
    Exchange.Provider.Banxa,
    Exchange.Provider.Ramp,
    Exchange.Provider.MoonPay
  ],
  network: Chain.Network.Mainnet
})

// Get buy quotes
const buyQuotes = await exchangeManager.getBuyQuotes({
  fiatAmount: 100,
  fiatCurrency: 'USD',
  cryptoCurrency: 'ADA'
})

// Get sell quotes
const sellQuotes = await exchangeManager.getSellQuotes({
  cryptoAmount: 1000,
  cryptoCurrency: 'ADA',
  fiatCurrency: 'USD'
})

// Create buy order
const buyOrder = await exchangeManager.createBuyOrder({
  quote: buyQuotes[0],
  walletAddress: 'addr1...'
})
```

**Exchange Integration Example:**

```typescript
import { exchangeManagerMaker } from '@yoroi/exchange'
import { Exchange } from '@yoroi/types'

// Setup exchange manager
const exchangeManager = exchangeManagerMaker({
  providers: [
    Exchange.Provider.Banxa,
    Exchange.Provider.Ramp,
    Exchange.Provider.MoonPay
  ],
  apiKeys: {
    [Exchange.Provider.Banxa]: 'banxa-api-key',
    [Exchange.Provider.Ramp]: 'ramp-api-key',
    [Exchange.Provider.MoonPay]: 'moonpay-api-key'
  },
  network: Chain.Network.Mainnet,
  testMode: false
})

// Compare exchange rates
async function compareRates(amount: number, currency: string) {
  const quotes = await exchangeManager.getBuyQuotes({
    fiatAmount: amount,
    fiatCurrency: currency,
    cryptoCurrency: 'ADA'
  })
  
  return quotes
    .sort((a, b) => b.cryptoAmount - a.cryptoAmount)
    .map(quote => ({
      provider: quote.provider,
      rate: quote.rate,
      fee: quote.fee,
      total: quote.fiatAmount,
      crypto: quote.cryptoAmount
    }))
}

// Execute purchase
async function buyAda(amount: number, currency: string, address: string) {
  const quotes = await exchangeManager.getBuyQuotes({
    fiatAmount: amount,
    fiatCurrency: currency,
    cryptoCurrency: 'ADA'
  })
  
  // Select best quote
  const bestQuote = quotes[0]
  
  // Create order
  const order = await exchangeManager.createBuyOrder({
    quote: bestQuote,
    walletAddress: address,
    returnUrl: 'https://myapp.com/success',
    cancelUrl: 'https://myapp.com/cancel'
  })
  
  return order
}
```

##### Exchange Providers

```typescript
import { Exchange } from '@yoroi/types'

// Available providers
const providers = [
  Exchange.Provider.Banxa,
  Exchange.Provider.Ramp,
  Exchange.Provider.MoonPay,
  Exchange.Provider.Simplex,
  Exchange.Provider.ChangeNOW
]

// Provider configurations
const providerConfig = {
  [Exchange.Provider.Banxa]: {
    name: 'Banxa',
    supportedFiats: ['USD', 'EUR', 'GBP'],
    supportedCryptos: ['ADA', 'BTC', 'ETH'],
    fees: { buy: 3.5, sell: 1.5 }
  },
  [Exchange.Provider.Ramp]: {
    name: 'Ramp',
    supportedFiats: ['USD', 'EUR'],
    supportedCryptos: ['ADA', 'BTC'],
    fees: { buy: 2.9, sell: 1.2 }
  }
}
```

---

### @yoroi/notifications

Push and in-app notification management.

#### Installation

```bash
npm install @yoroi/notifications
```

#### Key Features

- Push notifications
- In-app notifications
- Event-driven triggers
- Notification scheduling
- User preferences

#### Key Exports

```typescript
import { 
  NotificationManager,
  notificationManagerMaker,
  NotificationConfig
} from '@yoroi/notifications'
```

##### Notification Manager

```typescript
import { notificationManagerMaker } from '@yoroi/notifications'
import { Notifications } from '@yoroi/types'

const notificationManager: Notifications.Manager = notificationManagerMaker({
  config: {
    pushEnabled: true,
    bannerEnabled: true,
    triggers: [
      Notifications.Trigger.TransactionReceived,
      Notifications.Trigger.RewardsUpdated,
      Notifications.Trigger.PriceAlert
    ]
  },
  storage: notificationStorage
})

// Register for notifications
await notificationManager.register({
  pushToken: 'firebase-token',
  preferences: {
    transactions: true,
    rewards: true,
    priceAlerts: false
  }
})

// Handle incoming notifications
notificationManager.onNotification((notification) => {
  switch (notification.type) {
    case 'transaction':
      showTransactionNotification(notification)
      break
    case 'reward':
      showRewardNotification(notification)
      break
  }
})
```

**Notification Usage Example:**

```typescript
import { notificationManagerMaker } from '@yoroi/notifications'
import { Notifications } from '@yoroi/types'

// Setup notification manager
const notificationManager = notificationManagerMaker({
  config: {
    appName: 'Yoroi Wallet',
    pushEnabled: true,
    bannerEnabled: true,
    triggers: [
      Notifications.Trigger.TransactionReceived,
      Notifications.Trigger.RewardsUpdated,
      Notifications.Trigger.PrimaryTokenPriceChanged
    ]
  },
  storage: await notificationStorageMaker(),
  pushService: {
    register: async () => {
      // Firebase/APNS registration
      const token = await messaging().getToken()
      return token
    },
    unregister: async () => {
      await messaging().deleteToken()
    }
  }
})

// Subscribe to wallet events
function subscribeToWalletEvents(wallet: Wallet) {
  // Transaction received
  wallet.onTransactionReceived((tx) => {
    notificationManager.trigger({
      type: Notifications.Trigger.TransactionReceived,
      data: {
        txHash: tx.hash,
        amount: tx.amount,
        sender: tx.sender
      }
    })
  })
  
  // Rewards updated
  wallet.onRewardsUpdated((rewards) => {
    notificationManager.trigger({
      type: Notifications.Trigger.RewardsUpdated,
      data: {
        amount: rewards.amount,
        epoch: rewards.epoch
      }
    })
  })
  
  // Price alerts
  priceService.onPriceChange((price) => {
    if (price.changePercent > 10) {
      notificationManager.trigger({
        type: Notifications.Trigger.PrimaryTokenPriceChanged,
        data: {
          price: price.current,
          change: price.changePercent
        }
      })
    }
  })
}

// Notification components
function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    transactions: true,
    rewards: true,
    priceAlerts: false
  })
  
  const updatePreference = async (key: string, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    await notificationManager.updatePreferences(newPrefs)
  }
  
  return (
    <View>
      <SwitchSetting
        title="Transaction Notifications"
        value={preferences.transactions}
        onValueChange={(value) => updatePreference('transactions', value)}
      />
      <SwitchSetting
        title="Rewards Notifications"
        value={preferences.rewards}
        onValueChange={(value) => updatePreference('rewards', value)}
      />
      <SwitchSetting
        title="Price Alert Notifications"
        value={preferences.priceAlerts}
        onValueChange={(value) => updatePreference('priceAlerts', value)}
      />
    </View>
  )
}
```

##### Notification Events

```typescript
import { Notifications } from '@yoroi/types'

// Transaction received event
const txEvent: Notifications.TransactionReceivedEvent = {
  type: 'transaction_received',
  timestamp: Date.now(),
  data: {
    txHash: 'abc123...',
    amount: '5000000',
    fromAddress: 'addr1...',
    toAddress: 'addr2...'
  }
}

// Rewards updated event
const rewardEvent: Notifications.RewardsUpdatedEvent = {
  type: 'rewards_updated',
  timestamp: Date.now(),
  data: {
    amount: '250000',
    epoch: 425,
    poolId: 'pool1...'
  }
}

// Price change event
const priceEvent: Notifications.PrimaryTokenPriceChangedEvent = {
  type: 'price_changed',
  timestamp: Date.now(),
  data: {
    symbol: 'ADA',
    currentPrice: 0.45,
    previousPrice: 0.42,
    changePercent: 7.14
  }
}
```

---

### @yoroi/claim

Token claiming functionality for airdrops and rewards.

#### Installation

```bash
npm install @yoroi/claim
```

#### Key Features

- Airdrop claiming
- Reward claiming
- Eligibility checking
- Claim tracking
- Multi-token claims

#### Key Exports

```typescript
import { 
  ClaimManager,
  claimManagerMaker,
  ClaimApi
} from '@yoroi/claim'
```

##### Claim Manager

```typescript
import { claimManagerMaker } from '@yoroi/claim'
import { Claim } from '@yoroi/types'

const claimManager: Claim.Manager = claimManagerMaker({
  network: Chain.Network.Mainnet,
  storage: claimStorage,
  api: claimApi
})

// Check eligibility
const eligibility = await claimManager.checkEligibility({
  address: 'addr1...',
  claimId: 'airdrop-2024-01'
})

// Get claimable tokens
const claimable = await claimManager.getClaimableTokens('addr1...')

// Execute claim
const claimResult = await claimManager.claim({
  claimId: 'airdrop-2024-01',
  address: 'addr1...',
  signature: claimSignature
})
```

**Claim Usage Example:**

```typescript
import { claimManagerMaker, ClaimApi } from '@yoroi/claim'
import { Claim } from '@yoroi/types'

// Setup claim manager
const claimManager = claimManagerMaker({
  network: Chain.Network.Mainnet,
  storage: await claimStorageMaker(),
  api: ClaimApi
})

// Check for available claims
async function checkAvailableClaims(walletAddresses: string[]) {
  const claims = []
  
  for (const address of walletAddresses) {
    const addressClaims = await claimManager.getClaimableTokens(address)
    claims.push(...addressClaims)
  }
  
  return claims.filter(claim => claim.status === Claim.Status.Available)
}

// Execute multiple claims
async function claimAllAvailable(address: string, wallet: Wallet) {
  const availableClaims = await claimManager.getClaimableTokens(address)
  const results = []
  
  for (const claim of availableClaims) {
    try {
      // Create claim signature
      const message = `claim:${claim.id}:${address}`
      const signature = await wallet.signData(address, message)
      
      // Execute claim
      const result = await claimManager.claim({
        claimId: claim.id,
        address: address,
        signature: signature
      })
      
      results.push({ claim, result, success: true })
    } catch (error) {
      results.push({ claim, error, success: false })
    }
  }
  
  return results
}

// Claim status tracking
function ClaimStatus({ claimId }: { claimId: string }) {
  const [status, setStatus] = useState<Claim.Status>(Claim.Status.Checking)
  
  useEffect(() => {
    const checkStatus = async () => {
      const claimInfo = await claimManager.getClaimInfo(claimId)
      setStatus(claimInfo.status)
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30s
    
    return () => clearInterval(interval)
  }, [claimId])
  
  return (
    <View>
      <Text>Claim Status: {status}</Text>
      {status === Claim.Status.Available && (
        <Button title="Claim Now" onPress={() => executeClaim(claimId)} />
      )}
      {status === Claim.Status.Processing && <LoadingSpinner />}
      {status === Claim.Status.Completed && <SuccessIcon />}
    </View>
  )
}
```

##### Claim API

```typescript
import { ClaimApi } from '@yoroi/claim'
import { Claim } from '@yoroi/types'

// Check claim eligibility
const eligibility = await ClaimApi.checkEligibility({
  address: 'addr1...',
  claimId: 'airdrop-2024-01'
})

// Get claim information
const claimInfo = await ClaimApi.getClaimInfo('airdrop-2024-01')

// Execute claim
const claimResponse = await ClaimApi.claimTokens({
  claimId: 'airdrop-2024-01',
  address: 'addr1...',
  signature: 'claim-signature'
})

// Handle API errors
try {
  await ClaimApi.claimTokens(payload)
} catch (error) {
  if (error instanceof Claim.Api.Errors.AlreadyClaimed) {
    console.log('Tokens already claimed')
  } else if (error instanceof Claim.Api.Errors.Expired) {
    console.log('Claim period expired')
  } else if (error instanceof Claim.Api.Errors.NotFound) {
    console.log('Claim not found')
  }
}
```

---

## Additional Packages

### @yoroi/setup-wallet

Wallet initialization and setup functionality.

#### Installation

```bash
npm install @yoroi/setup-wallet
```

#### Key Features

- Wallet creation
- Mnemonic generation
- Hardware wallet setup
- Wallet restoration
- Multi-wallet management

---

### @yoroi/links

Deep linking and URI handling.

#### Installation

```bash
npm install @yoroi/links
```

#### Key Features

- Cardano URI parsing
- Yoroi-specific URIs
- Payment requests
- DApp launches
- Link validation

---

### @yoroi/identicon

Avatar generation for addresses and wallets.

#### Installation

```bash
npm install @yoroi/identicon
```

#### Key Features

- Address-based avatars
- Consistent generation
- Multiple styles
- Customizable colors
- SVG output

---

### @yoroi/blockchains

Multi-blockchain support and abstractions.

#### Installation

```bash
npm install @yoroi/blockchains
```

#### Key Features

- Blockchain abstractions
- Network configurations
- Protocol adapters
- Cross-chain utilities
- Future blockchain support

---

## Applications

### @yoroi/mobile

The complete Yoroi mobile wallet application.

#### Key Features

- Full wallet functionality
- Multi-account support
- DApp browser
- Staking interface
- Portfolio tracking
- Exchange integration

---

## Installation & Setup

### Basic Installation

```bash
# Install all packages
npm install @yoroi/types @yoroi/common @yoroi/api @yoroi/theme

# Or install specific packages as needed
npm install @yoroi/swap @yoroi/staking @yoroi/portfolio
```

### React Native Setup

```bash
# Install React Native dependencies
npm install react-native @react-native-async-storage/async-storage react-native-mmkv

# iOS pods (if on macOS)
cd ios && pod install
```

### Basic Configuration

```typescript
import { 
  AppStorageMaker,
  ThemeProvider,
  QueryClient,
  QueryClientProvider
} from '@yoroi/common'
import { cardanoApiMaker } from '@yoroi/api'
import { Chain } from '@yoroi/types'

// Setup storage
const storage = AppStorageMaker({
  AsyncStorage: require('@react-native-async-storage/async-storage').default
})

// Setup API
const cardanoApi = cardanoApiMaker({
  network: Chain.Network.Mainnet
})

// Setup React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

// App root
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <YourApp />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

### Environment Configuration

```typescript
// config.ts
export const config = {
  network: process.env.NODE_ENV === 'production' 
    ? Chain.Network.Mainnet 
    : Chain.Network.Preprod,
    
  apiBaseUrl: process.env.YOROI_API_BASE_URL || 'https://api.yoroi.com',
  
  features: {
    swap: true,
    staking: true,
    dappConnector: true,
    notifications: process.env.NODE_ENV === 'production'
  }
}
```

---

## Migration Guide

### From v5 to v6

#### Breaking Changes

1. **Import paths changed**
   ```typescript
   // Before
   import { fetchData } from '@yoroi/common/lib/api/fetchData'
   
   // After
   import { fetchData } from '@yoroi/common'
   ```

2. **Type namespace reorganization**
   ```typescript
   // Before
   import { PortfolioTokenInfo } from '@yoroi/types/lib/portfolio/info'
   
   // After
   import { Portfolio } from '@yoroi/types'
   type TokenInfo = Portfolio.Token.Info
   ```

3. **New theme system**
   ```typescript
   // Before
   import { YoroiTheme } from '@yoroi/theme'
   
   // After
   import { ThemeProvider, useTheme } from '@yoroi/theme'
   ```

#### Migration Steps

1. **Update imports**
   ```bash
   # Use a codemod or find-replace to update import paths
   find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/@yoroi\/common\/lib\//@yoroi\/common/g'
   ```

2. **Update type usage**
   ```typescript
   // Update type imports to use namespaces
   import { App, Api, Portfolio, Swap } from '@yoroi/types'
   ```

3. **Update theme usage**
   ```typescript
   // Wrap app with new theme provider
   <ThemeProvider>
     <App />
   </ThemeProvider>
   
   // Use theme hook in components
   const { palette, atoms } = useTheme()
   ```

---

## Best Practices

### Error Handling

```typescript
import { Api } from '@yoroi/types'

// Always handle API responses properly
async function safeApiCall<T>(apiCall: () => Promise<Api.Response<T>>) {
  try {
    const response = await apiCall()
    
    if (response.tag === 'right') {
      return response.value.data
    } else {
      // Handle specific error types
      switch (response.error.status) {
        case 404:
          throw new Api.Errors.NotFound(response.error.message)
        case 500:
          throw new Api.Errors.ServerSide(response.error.message)
        default:
          throw new Api.Errors.Unknown(response.error.message)
      }
    }
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}
```

### Type Safety

```typescript
// Use type guards for runtime safety
import { Portfolio } from '@yoroi/types'

function isPortfolioToken(obj: any): obj is Portfolio.Token.Info {
  return obj && 
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.symbol === 'string'
}

// Use generic types properly
function processTokens<T extends Portfolio.Token.Info>(tokens: T[]): T[] {
  return tokens.filter(token => token.status === Portfolio.Token.Status.Active)
}
```

### Performance

```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query'
import { usePortfolioTokenInfo } from '@yoroi/portfolio'

function TokenInfo({ tokenId }: { tokenId: string }) {
  const { data, isLoading, error } = usePortfolioTokenInfo({
    tokenId,
    options: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!tokenId
    }
  })
  
  // Component implementation
}

// Batch operations when possible
import { CardanoApi } from '@yoroi/api'

async function getMultipleTokenInfo(tokenIds: string[]) {
  // Batch API call instead of individual calls
  const response = await CardanoApi.getOnChainMetadatas({ tokenIds })
  return response
}
```

### Testing

```typescript
// Use mocks from packages
import { mockCardanoApi } from '@yoroi/api'
import { mockAppApi } from '@yoroi/api'

describe('Token Manager', () => {
  it('should fetch token info', async () => {
    const mockApi = mockCardanoApi({
      getOnChainMetadatas: jest.fn().mockResolvedValue({
        tag: 'right',
        value: { data: [mockTokenInfo] }
      })
    })
    
    const tokenManager = new PortfolioTokenManager({
      api: mockApi,
      storage: mockStorage
    })
    
    const result = await tokenManager.getTokenInfo('token123')
    expect(result).toEqual(mockTokenInfo)
  })
})
```

---

## Support

### Documentation

- API Reference: [https://docs.yoroi.com](https://docs.yoroi.com)
- Examples: [https://github.com/Emurgo/yoroi/tree/develop/examples](https://github.com/Emurgo/yoroi/tree/develop/examples)
- Migration Guides: [https://docs.yoroi.com/migration](https://docs.yoroi.com/migration)

### Community

- Discord: [https://discord.gg/yoroi](https://discord.gg/yoroi)
- GitHub Issues: [https://github.com/Emurgo/yoroi/issues](https://github.com/Emurgo/yoroi/issues)
- Stack Overflow: Tag `yoroi-sdk`

### Contributing

See [CONTRIBUTING.md](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for guidelines on contributing to the Yoroi SDK.

---

## License

The Yoroi SDK is licensed under the Apache 2.0 License. See [LICENSE](LICENSE) for more information.