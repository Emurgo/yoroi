# Multi-Chain Integration Plan for Yoroi

## Executive Summary

This plan outlines the integration of Bitcoin and Midnight blockchains into Yoroi wallet. The current architecture is Cardano-centric and requires significant refactoring to support multiple blockchains. The plan covers blockchain abstraction, API layer updates, transaction handling, wallet management, UI changes, hardware wallet support, deep links, dApp connectors, notifications, and all supporting infrastructure.

**Key Principles**:
- Maintain backward compatibility with existing Cardano wallets
- Single mnemonic supports all blockchains (different key derivation)
- Gradual rollout with feature flags
- Blockchain-agnostic architecture where possible

## Key Reuse Strategy

**Same Mnemonic, Different Keys**: All three blockchains can use the same BIP39 mnemonic seed, but derive different keys due to:
- **Cardano**: Uses Ed25519 curve with coin type 1815 (CIP-1852: `m/1852'/1815'/0'`)
- **Bitcoin**: Uses secp256k1 curve with coin type 0 (`m/84'/0'/0'/0/X` for SegWit)
- **Midnight**: Uses secp256k1 curve (same as Bitcoin) but different coin type and role structure (`m/${PURPOSE}'/${COIN_TYPE}'/${account}'/${role}/${index}`)

**Implications**:
- ✅ Single mnemonic can generate wallets for all three blockchains
- ✅ Bitcoin and Midnight share the same cryptographic curve (secp256k1) but use different derivation paths
- ❌ Cardano uses a different curve (Ed25519), so keys cannot be directly shared
- ✅ Wallet can derive keys for each blockchain independently from the same seed
- ✅ Multi-chain wallet architecture: one mnemonic → multiple blockchain accounts

**Architecture**:
```
Single Mnemonic (BIP39)
├── Cardano Account (Ed25519, m/1852'/1815'/0')
│   ├── Payment Key
│   └── Staking Key
├── Bitcoin Account (secp256k1, m/84'/0'/0'/0/X)
│   └── SegWit Address
└── Midnight Account (secp256k1, custom path)
    └── ZSwap Address
```

**Implementation Notes**:
- Wallet storage schema must track which blockchains are enabled per wallet
- Key derivation happens on-demand per blockchain
- Address generation is blockchain-specific
- Existing Cardano-only wallets can add Bitcoin/Midnight later via migration

## Hardware Wallet Support

**Current State**: Yoroi supports Ledger Nano S/X for Cardano using `@cardano-foundation/ledgerjs-hw-app-cardano` (version 7.1.4). Uses `@ledgerhq/react-native-hid` and `@ledgerhq/react-native-hw-transport-ble` for transport.

**Multi-Chain Hardware Wallet Strategy**:
- **Same Device, Different Apps**: Ledger/Trezor devices can have multiple apps installed
  - Cardano app for Cardano transactions (existing)
  - Bitcoin app for Bitcoin transactions (to be added)
  - (Future: Midnight app if available)
- **Key Derivation**: Hardware wallets use BIP32/BIP44, same mnemonic → same root seed
- **App Switching**: Users must open correct app on device (Cardano ↔ Bitcoin)
- **Transport Layer**: Same USB/BLE connection, different app protocols

**Implementation Requirements**:
- Add `@ledgerhq/hw-app-btc` package for Ledger Bitcoin support
- Add Trezor Connect SDK for Trezor Bitcoin support
- Create unified hardware wallet connection manager (`mobile/src/features/HW/multi-chain-hw-manager.ts`)
- Detect which app is open on device
- Guide users to switch apps when needed
- Blockchain-specific transaction signing flows
- Store device info per blockchain

**Key Files to Update**:
- `mobile/src/wallets/cardano/hw/hw.ts` - Extend for Bitcoin
- `mobile/src/wallets/hw/hw.ts` - Add blockchain parameter
- `mobile/src/features/ReviewTx/common/ConfirmRawTxWithHw.tsx` - Make blockchain-aware
- `mobile/packages/tx/ledger/` - Add Bitcoin ledger signing

**Midnight Hardware Wallet**: Research needed - may not be available initially. Check Midnight SDK documentation for hardware wallet support.

## Current State Analysis

### Yoroi Blockchains Package (`mobile/packages/blockchains/`)
- **Current Structure**: Cardano-only implementation
  - `cardano/constants.ts` - Cardano-specific constants (eras, epochs, protocol params)
  - `networks/network-configs.ts` - Hardcoded Cardano networks (Mainnet, Preprod, Preview)
  - `networks/network-manager.ts` - Cardano-specific API maker
  - `addresses/` - BIP32 derivation config (blockchain-agnostic)

### Key Dependencies
- `@yoroi/types` - `Chain.SupportedNetworks` currently only includes Cardano networks
- `@yoroi/api` - `CardanoApi.cardanoApiMaker` is Cardano-specific
- `@yoroi/tx` - Uses CSL (Cardano Serialization Library) for transaction building
- `@yoroi/portfolio` - Token management is blockchain-agnostic but only used for Cardano
- `@yoroi/explorers` - Explorer manager exists but only configured for Cardano
- `@yoroi/dapp-connector` - CIP-30 connector for Cardano dApps
- `@yoroi/links` - Cardano link parser (`web+cardano://`)

### Bitcoin Implementation (from mesh/ctrl-mobile)
- **Location**: `mesh/packages/bitcoin/`, `ctrl-mobile/src/modules/wallet/controllers/bitcoin.controller.ts`
- **Key Components**:
  - Providers: BlockstreamProvider, MaestroProvider (implements `IBitcoinProvider`)
  - Wallet: EmbeddedWallet (uses BIP32/BIP39, supports P2PKH/P2WPKH/P2TR)
  - UTXO model similar to Cardano
  - Transaction building uses `@scure/btc-signer` or `bitcoinjs-lib`
  - Fee estimation in sat/vB (different from Cardano)
  - Message signing: ECDSA and BIP322 (BIP322 needs implementation)
  - Links: BIP 21 standard (`bitcoin://` scheme)

### Midnight Implementation (from midnight/mesh)
- **Location**: `midnight/packages/mesh-midnight-core/`, `midnight/packages/mesh-midnight-wallet/`
- **Key Components**:
  - Providers: PublicDataProvider, PrivateStateProvider, ZKConfigProvider, ProofProvider
  - Wallet: EmbeddedWallet using `@midnight-ntwrk/wallet-sdk-hd`
  - Compact contracts (different from Cardano Plutus)
  - ZK proof generation required for transactions
  - Currently testnet only
  - Links: Research needed - may need custom scheme

## Implementation Plan

### Phase 1: Type System & Blockchain Abstraction

#### 1.1 Extend Type Definitions (`mobile/packages/types/`)
- **File**: `chain/network.ts`
  - Add `Bitcoin` and `Midnight` to `NetworkBlockchains` enum:
    ```typescript
    export enum NetworkBlockchains {
      Cardano = 'cardano',
      Bitcoin = 'bitcoin',
      Midnight = 'midnight',
    }
    ```
  - Extend `ChainSupportedNetworks` to include:
    - Bitcoin: `bitcoin-mainnet`, `bitcoin-testnet`
    - Midnight: `midnight-testnet` (mainnet when available)
  - Create union type `Chain.SupportedNetworks` that includes all blockchain networks

- **File**: `network/manager.ts`
  - Refactor `NetworkConfig` to be blockchain-agnostic using discriminated unions:
    ```typescript
    type NetworkConfigBase = {
      network: ChainSupportedNetworks
      blockchain: NetworkBlockchains
      isMainnet: boolean
      primaryTokenInfo: PortfolioTokenInfo
      name: string
      chainId: number
      legacyApiBaseUrl?: string
    }
    
    type NetworkConfigCardano = NetworkConfigBase & {
      blockchain: NetworkBlockchains.Cardano
      eras: ReadonlyArray<NetworkEraConfig>
      protocolMagic: number
      epoch: Readonly<{
        info: (date: Date) => Readonly<NetworkEpochInfo>
        progress: (date: Date) => Readonly<NetworkEpochProgress>
      }>
    }
    
    type NetworkConfigBitcoin = NetworkConfigBase & {
      blockchain: NetworkBlockchains.Bitcoin
      feeRate: { fast: number; medium: number; slow: number } // sat/vB
      networkParams: BitcoinNetworkParams
    }
    
    type NetworkConfigMidnight = NetworkConfigBase & {
      blockchain: NetworkBlockchains.Midnight
      testnetConfig: MidnightTestnetConfig
      providerUrls: MidnightProviderUrls
    }
    
    type NetworkConfig = NetworkConfigCardano | NetworkConfigBitcoin | NetworkConfigMidnight
    ```

- **File**: `api/` (new blockchain-agnostic API types)
  - Create base `Api.Blockchain` interface
  - Extend with `Api.Cardano`, `Api.Bitcoin`, `Api.Midnight`
  - Each blockchain API should provide:
    - `getUtxoData()` (or equivalent)
    - `getBestBlock()` (or equivalent)
    - `submitTransaction()`
    - Blockchain-specific methods

#### 1.2 Blockchain Registry (`mobile/packages/blockchains/blockchain-registry.ts`)
- Create registry mapping blockchain types to implementations
- Define blockchain capabilities:
  ```typescript
  type BlockchainCapabilities = {
    isUTXO: boolean
    supportsStaking: boolean
    supportsSmartContracts: boolean
    requiresZKProofs: boolean
    coinType: number
    derivationPath: string
    curve: 'ed25519' | 'secp256k1'
  }
  ```
- Store blockchain metadata (coin type, derivation paths, etc.)

### Phase 2: Blockchain-Specific Implementations

#### 2.1 Bitcoin Implementation (`mobile/packages/blockchains/bitcoin/`)

**2.1.1 Constants** (`bitcoin/constants.ts`)
- Network configurations:
  ```typescript
  export const bitcoinMainnetConfig = {
    network: bitcoin.networks.bitcoin,
    coinType: 0,
    hrp: 'bc',
    messagePrefix: '\x18Bitcoin Signed Message:\n',
  }
  
  export const bitcoinTestnetConfig = {
    network: bitcoin.networks.testnet,
    coinType: 1,
    hrp: 'tb',
    messagePrefix: '\x18Bitcoin Signed Message:\n',
  }
  ```
- Fee rate configurations (sat/vB):
  ```typescript
  export const feeRates = {
    mainnet: { fast: 10, medium: 5, slow: 1 },
    testnet: { fast: 5, medium: 2, slow: 1 },
  }
  ```
- Address type constants (P2PKH, P2WPKH, P2TR)
- BIP32 coin type (0 for mainnet, 1 for testnet)

**2.1.2 Providers** (`bitcoin/providers/`)
- Port `BlockstreamProvider` from `mesh/packages/bitcoin/src/providers/blockstream.ts`
- Port `MaestroProvider` from mesh if available
- Create provider interface matching `IBitcoinProvider`:
  ```typescript
  interface IBitcoinProvider {
    fetchAddress(address: string): Promise<AddressInfo>
    fetchAddressUTxOs(address: string): Promise<UTxO[]>
    fetchFeeEstimates(blocks: number): Promise<number>
    submitTx(tx: string): Promise<string>
    fetchTransactionStatus(txid: string): Promise<TransactionsStatus>
  }
  ```
- Implement provider factory pattern

**2.1.3 Wallet** (`bitcoin/wallet/`)
- Port `EmbeddedWallet` from `mesh/packages/bitcoin/src/wallets/embedded/index.ts`
- Adapt to Yoroi's wallet interface
- Support multiple address types (segwit, legacy, taproot)
- Implement key derivation using BIP32/BIP39
- Key methods:
  - `getAddresses()` - Get payment/ordinals addresses
  - `getUTxOs()` - Fetch UTXOs
  - `signMessage()` - Sign messages (ECDSA/BIP322)
  - `signPsbt()` - Sign PSBT transactions
  - `sendTransfer()` - Send Bitcoin transactions

**2.1.4 Network Config** (`bitcoin/network-config.ts`)
- Define Bitcoin network configs:
  ```typescript
  bitcoin-mainnet: {
    blockchain: NetworkBlockchains.Bitcoin,
    network: 'bitcoin-mainnet',
    isMainnet: true,
    primaryTokenInfo: { ticker: 'BTC', decimals: 8, name: 'Bitcoin', symbol: '₿' },
    feeRate: { fast: 10, medium: 5, slow: 1 }, // sat/vB
    chainId: 0,
    ...
  }
  ```

#### 2.2 Midnight Implementation (`mobile/packages/blockchains/midnight/`)

**2.2.1 Constants** (`midnight/constants.ts`)
- Testnet configuration
- Provider URLs (from Midnight SDK)
- Contract deployment configs
- ZK proof configuration

**2.2.2 Providers** (`midnight/providers/`)
- Port provider wrappers from `midnight/packages/mesh-midnight-core/src/providers-wrappers/`
- Implement `PublicDataProvider`, `PrivateStateProvider`, `ZKConfigProvider`, `ProofProvider`
- Create provider factory
- Key providers:
  - `indexerPublicDataProvider` - Query public chain data
  - `levelPrivateStateProvider` - Manage private state
  - `fetchZkConfigProvider` - ZK configuration
  - `httpClientProofProvider` - Generate ZK proofs

**2.2.3 Wallet** (`midnight/wallet/`)
- Port `EmbeddedWallet` from `midnight/packages/mesh-midnight-wallet/src/embedded/embedded-wallet.ts`
- Integrate HD wallet using `@midnight-ntwrk/wallet-sdk-hd`
- Support ZK proof generation
- Key methods:
  - `getAddresses()` - Get ZSwap addresses
  - `getBalance()` - Query balance (requires ZK proof)
  - `balanceAndProveTransaction()` - Balance + generate proof
  - `submitTransaction()` - Submit with ZK proof

**2.2.4 Network Config** (`midnight/network-config.ts`)
- Define Midnight testnet config
- Prepare for mainnet when available
- Store provider URLs and configuration

### Phase 3: API Layer Refactoring

#### 3.1 Abstract API Maker (`mobile/packages/api/blockchain-api-maker.ts`)
- Create factory function that returns blockchain-specific API makers:
  ```typescript
  export const blockchainApiMaker = ({
    blockchain,
    network,
  }: {
    blockchain: NetworkBlockchains
    network: ChainSupportedNetworks
  }) => {
    switch (blockchain) {
      case NetworkBlockchains.Cardano:
        return CardanoApi.cardanoApiMaker({ network })
      case NetworkBlockchains.Bitcoin:
        return BitcoinApi.bitcoinApiMaker({ network })
      case NetworkBlockchains.Midnight:
        return MidnightApi.midnightApiMaker({ network })
    }
  }
  ```

#### 3.2 Bitcoin API (`mobile/packages/api/bitcoin/`)
- **File**: `api/bitcoin-api-maker.ts`
  - Implement `Api.Bitcoin.Api` interface
  - Methods:
    - `getUtxoData(address: string)` - Fetch UTXOs from provider
    - `getBestBlock()` - Get latest block height
    - `getFeeEstimates()` - Get fee rates in sat/vB
    - `submitTransaction(txHex: string)` - Submit transaction
    - `getAddressInfo(address: string)` - Get address balance/transactions

- **File**: `api/utxo-data.ts`
  - Fetch UTXOs from provider (Blockstream/Maestro)
  - Transform to Yoroi UTXO format:
    ```typescript
    type BitcoinUtxo = {
      txid: string
      vout: number
      value: number // satoshis
      status: { confirmed: boolean; block_height?: number }
    }
    ```

- **File**: `api/fee-estimates.ts`
  - Fetch fee estimates from provider
  - Return in sat/vB format
  - Support multiple confirmation targets (1, 3, 6 blocks)

#### 3.3 Midnight API (`mobile/packages/api/midnight/`)
- **File**: `api/midnight-api-maker.ts`
  - Implement `Api.Midnight.Api` interface
  - Methods:
    - `getContractState(address: ContractAddress)` - Query contract state
    - `getZSwapState()` - Get ZSwap chain state
    - `submitTransaction(tx: Transaction)` - Submit with ZK proof
    - `watchForTxData(txId: TransactionId)` - Watch transaction status
    - `generateZKProof(tx: Transaction)` - Generate ZK proof

- **File**: `api/contract-state.ts`
  - Query contract states using PublicDataProvider
  - Handle private state queries
  - Watch for state changes

### Phase 4: Network Manager Refactoring

#### 4.1 Update Network Configs (`mobile/packages/blockchains/networks/network-configs.ts`)
- Add Bitcoin and Midnight network configs
- Refactor to use blockchain-specific configs
- Update `buildNetworkManagers` to handle multiple blockchains
- Example Bitcoin config:
  ```typescript
  [Chain.Network.BitcoinMainnet]: {
    blockchain: NetworkBlockchains.Bitcoin,
    network: Chain.Network.BitcoinMainnet,
    isMainnet: true,
    name: 'Bitcoin Mainnet',
    primaryTokenInfo: { ticker: 'BTC', decimals: 8, ... },
    chainId: 0,
    feeRate: { fast: 10, medium: 5, slow: 1 },
    networkParams: bitcoinMainnetConfig,
  }
  ```

#### 4.2 Update Network Manager (`mobile/packages/blockchains/networks/network-manager.ts`)
- Refactor `buildNetworkManagers` to:
  - Accept blockchain-specific API makers
  - Create appropriate API instances per blockchain
  - Handle blockchain-specific storage needs
  - Support blockchain-specific explorers
- Update signature:
  ```typescript
  export function buildNetworkManagers({
    tokenManagers,
    apiMaker = blockchainApiMaker, // Changed from CardanoApi.cardanoApiMaker
  }: {
    tokenManagers: TokenManagerByNetwork
    apiMaker?: ({blockchain, network}: {blockchain: NetworkBlockchains, network: Chain.SupportedNetworks}) => Api.Blockchain.Api
  })
  ```

#### 4.3 Blockchain-Specific Helpers
- **Cardano**: Keep existing epoch/era helpers
- **Bitcoin**: Add fee estimation helpers, block time helpers
- **Midnight**: Add contract state helpers, ZK proof helpers

### Phase 5: Transaction Building & Signing

#### 5.1 Abstract Transaction Builder (`mobile/packages/tx/blockchain-tx-builder.ts`)
- Create blockchain-agnostic transaction builder interface:
  ```typescript
  interface BlockchainTxBuilder {
    buildTransaction(state: TransactionBuilderState): Promise<UnsignedTransaction>
    signTransaction(unsignedTx: UnsignedTransaction, keys: SigningKeys): Promise<SignedTransaction>
  }
  ```
- Factory pattern to get blockchain-specific builders

#### 5.2 Bitcoin Transaction Builder (`mobile/packages/tx/bitcoin/`)
- **File**: `bitcoin-tx-builder.ts`
  - Port transaction building logic from `ctrl-mobile/src/modules/wallet/controllers/bitcoin.controller.ts`
  - Use `@scure/btc-signer` for transaction building
  - Support UTXO selection
  - Fee calculation in sat/vB
  - Support multiple address types (P2PKH, P2WPKH, P2TR)
  - Key methods:
    - `buildTransaction(inputs, outputs, feeRate)` - Build unsigned transaction
    - `estimateFee(inputs, outputs)` - Estimate transaction fee
    - `selectUtxos(amount, utxos)` - UTXO selection algorithm

- **File**: `bitcoin-signer.ts`
  - Sign transactions with private keys
  - Support hardware wallet signing (Ledger/Trezor)
  - PSBT support for complex transactions

#### 5.3 Midnight Transaction Builder (`mobile/packages/tx/midnight/`)
- **File**: `midnight-tx-builder.ts`
  - Build transactions using Midnight SDK
  - Integrate ZK proof generation
  - Handle contract interactions
  - Support private state updates
  - Key methods:
    - `buildTransaction(contractCall, privateState)` - Build transaction
    - `generateZKProof(tx)` - Generate ZK proof using ProofProvider
    - `balanceTransaction(tx, newCoins)` - Balance transaction

- **File**: `midnight-signer.ts`
  - Sign transactions
  - Generate ZK proofs using ProofProvider
  - Handle proof generation errors

#### 5.4 Update Transaction Package (`mobile/packages/tx/`)
- Keep Cardano transaction builder as-is
- Add blockchain parameter to transaction building functions
- Create unified transaction interface that works across blockchains
- Update `UnsignedTransaction` type to be blockchain-agnostic:
  ```typescript
  type UnsignedTransaction = {
    blockchain: NetworkBlockchains
    inputs: TransactionInput[]
    outputs: TransactionOutput[]
    fee: string
    cbor?: string // Cardano-specific
    hex?: string // Bitcoin-specific
    tx?: Transaction // Midnight-specific
  }
  ```

### Phase 6: Wallet Management Updates

#### 6.1 Wallet Creation (`mobile/src/features/WalletManager/`)
- **File**: `wallet-manager.ts`
  - Update `createWalletMnemonic` to support blockchain selection:
    ```typescript
    createWalletMnemonic(params: {
      name: string
      mnemonic: string
      password: string
      blockchains: NetworkBlockchains[] // New: which blockchains to enable
      implementation: Wallet.Implementation
      addressMode: Wallet.AddressMode
      accountVisual: number
    })
    ```
  - Add blockchain-specific derivation paths
  - Support multi-chain wallets (single mnemonic, multiple blockchains)
  - Store enabled blockchains in wallet metadata

- **File**: `wallet-creation/`
  - Add blockchain selection UI
  - Show blockchain-specific options:
    - Bitcoin: Address type selection (SegWit/Legacy/Taproot)
    - Midnight: Testnet warning
  - Multi-chain wallet creation option
  - Single mnemonic → multiple blockchain accounts

#### 6.2 Wallet Storage (`mobile/src/wallets/`)
- **File**: `wallet-storage.ts`
  - Update wallet storage schema to include blockchain type:
    ```typescript
    type WalletMeta = {
      id: string
      name: string
      enabledBlockchains: NetworkBlockchains[] // New
      // ... existing fields
    }
    ```
  - Store blockchain-specific data (addresses, keys per blockchain)
  - Support multiple accounts per blockchain
  - Migration: Add `enabledBlockchains: ['cardano']` to existing wallets

#### 6.3 Address Management
- **File**: `addresses/bitcoin-address-manager.ts`
  - Generate Bitcoin addresses (P2PKH, P2WPKH, P2TR)
  - Manage address derivation paths
  - Support address reuse policies
  - Key methods:
    - `generateAddress(derivationPath, addressType)` - Generate address
    - `validateAddress(address)` - Validate Bitcoin address format
    - `getAddressType(address)` - Detect address type

- **File**: `addresses/midnight-address-manager.ts`
  - Generate Midnight addresses
  - Manage contract addresses
  - Handle ZSwap addresses
  - Key methods:
    - `generateZSwapAddress(account, role, index)` - Generate ZSwap address
    - `generateContractAddress(contractId)` - Generate contract address

### Phase 7: Portfolio & Balance Management

#### 7.1 Multi-Chain Balance (`mobile/packages/portfolio/`)
- **File**: `balance-manager.ts`
  - Update to handle multiple blockchains
  - Aggregate balances across blockchains
  - Blockchain-specific balance calculations
  - Update signature to accept blockchain parameter:
    ```typescript
    syncBalances({
      blockchain: NetworkBlockchains,
      primaryStated,
      secondaryBalances,
    })
    ```

#### 7.2 Token Management
- Bitcoin: Native BTC only (no tokens initially)
- Midnight: Support native tokens and contract tokens
- Update token discovery to be blockchain-aware
- Token storage per blockchain

### Phase 8: Explorer Integration

#### 8.1 Bitcoin Explorers (`mobile/packages/explorers/bitcoin/`)
- Add Blockstream explorer:
  ```typescript
  blockstream: {
    mainnet: 'https://blockstream.info',
    testnet: 'https://blockstream.info/testnet',
    txPath: '/tx/',
    addressPath: '/address/',
  }
  ```
- Add blockchain.com explorer
- Support transaction and address viewing
- Update explorer manager to include Bitcoin explorers

#### 8.2 Midnight Explorers (`mobile/packages/explorers/midnight/`)
- Add Midnight testnet explorer
- Support contract state viewing
- Transaction status tracking
- Update explorer manager to include Midnight explorers

#### 8.3 Update Explorer Manager (`mobile/packages/explorers/explorer-manager.ts`)
- Add Bitcoin and Midnight explorers
- Make explorer selection blockchain-aware
- Update `explorerManager` to support all blockchains

### Phase 9: UI Updates

#### 9.1 Network Selection (`mobile/src/features/NetworkSelection/`)
- Add blockchain selection to network picker
- Show available networks per blockchain
- Handle network switching across blockchains
- UI: Dropdown or tabs for blockchain selection

#### 9.2 Wallet Creation Flow (`mobile/src/features/SetupWallet/`)
- Add blockchain selection step
- Show blockchain-specific options:
  - Bitcoin: Address type selection (SegWit/Legacy/Taproot)
  - Midnight: Testnet warning
- Multi-chain wallet creation option
- Single mnemonic → multiple blockchain accounts
- UI: Checkboxes for blockchain selection

#### 9.3 Transaction UI (`mobile/src/features/Transfer/`)
- **File**: `send-form.tsx`
  - Blockchain-aware form validation
  - Blockchain-specific fee display:
    - Bitcoin: Show fee rate (sat/vB) and total fee (BTC)
    - Midnight: Show ZK proof status
  - Address format validation per blockchain
  - Update address input to validate based on selected blockchain

- **File**: `transaction-review.tsx`
  - Show blockchain-specific transaction details
  - Bitcoin: Show inputs/outputs, fee rate, address types
  - Midnight: Show contract interactions, ZK proof status
  - Update review screen to display blockchain-specific info

#### 9.4 Balance Display (`mobile/src/features/Portfolio/`)
- Show balances per blockchain
- Aggregate total value (if exchange rates available)
- Blockchain-specific token lists
- UI: Tabs or sections per blockchain

#### 9.5 Transaction History (`mobile/src/features/Transactions/`)
- Filter by blockchain
- Blockchain-specific transaction details
- Explorer links per blockchain
- Update transaction list to show blockchain indicator

#### 9.6 Hardware Wallet UI (`mobile/src/features/HW/`)
- **File**: `multi-chain-hw-manager.tsx`
  - Multi-chain hardware wallet connection manager
  - Detect which app is open on device
  - Guide users to switch apps when needed
  - Unified connection/disconnection UI

- **File**: `hw-app-detector.ts`
  - Detect which hardware wallet app is open
  - Prompt user to switch apps if needed
  - Show clear error messages

### Phase 10: Deep Links & QR Codes

#### 10.1 Bitcoin Links (`mobile/packages/links/bitcoin/`)
- **File**: `bitcoin-module.ts`
  - Implement BIP 21 parser (`bitcoin://` scheme)
  - Parse format: `bitcoin:<address>[?amount=<amount>][&label=<label>][&message=<message>]`
  - Create Bitcoin payment links
  - Key methods:
    - `parse(uri: string)` - Parse Bitcoin URI
    - `create(params: {address, amount?, label?, message?})` - Create Bitcoin URI

- **File**: `bitcoin-types.ts`
  - Define Bitcoin link types:
    ```typescript
    type BitcoinPaymentLink = {
      scheme: 'bitcoin'
      address: string
      amount?: string // BTC amount
      label?: string
      message?: string
    }
    ```

- **File**: `bitcoin-validators.ts`
  - Validate Bitcoin addresses (P2PKH, P2WPKH, P2TR, P2SH)
  - Validate amount format
  - Sanitize label and message

#### 10.2 Link Integration (`mobile/src/features/Links/`)
- **File**: `useDeepLinkWatcher.tsx`
  - Detect `bitcoin://` links
  - Route to Bitcoin payment handler
  - Update to handle both `web+cardano://` and `bitcoin://`

- **File**: `useLinksRequestAction.tsx`
  - Handle Bitcoin payment requests
  - Pre-fill send form with Bitcoin link data
  - Update action handler to support Bitcoin links

#### 10.3 QR Code Support (`mobile/src/features/Scan/`)
- **File**: `parsers.ts`
  - Parse Bitcoin QR codes (BIP 21 format)
  - Handle `bitcoin://` URIs from QR codes
  - Update `parseScanAction` to detect Bitcoin links

- **File**: `triggerScanActionHelper.ts`
  - Detect Bitcoin links vs Cardano links
  - Route to appropriate handler
  - Update `isWebCardanoLink` to also check for Bitcoin links

#### 10.4 Midnight Links (Research Phase)
- Research Midnight link standards
- Determine if custom scheme needed (`web+midnight://` or `midnight://`)
- Plan implementation once standard is identified
- May need to create custom scheme if none exists

### Phase 11: DApp Connector & Wallet Connect

#### 11.1 Abstract DApp Connector (`mobile/packages/dapp-connector/`)
- **File**: `blockchain-dapp-connector.ts`
  - Create blockchain-agnostic dApp connector interface:
    ```typescript
    interface BlockchainDappConnector {
      blockchain: NetworkBlockchains
      connect(dappOrigin: string): Promise<Connection>
      disconnect(dappOrigin: string): Promise<void>
      signTransaction(tx: UnsignedTransaction): Promise<SignedTransaction>
      signMessage(message: string): Promise<Signature>
    }
    ```
  - Support multiple protocols:
    - Cardano: CIP-30 (existing)
    - Bitcoin: WalletConnect v2 or similar
    - Midnight: Research and implement (may have custom protocol)

- **File**: `bitcoin-wallet-connect.ts`
  - Implement Bitcoin WalletConnect integration
  - Handle Bitcoin transaction signing requests
  - Support PSBT signing via dApps
  - Key methods:
    - `connect(dappInfo)` - Connect to Bitcoin dApp
    - `signPsbt(psbt, signInputs)` - Sign PSBT from dApp
    - `signMessage(message)` - Sign messages from dApp

- **File**: `midnight-dapp-connector.ts`
  - Research Midnight dApp connection standards
  - Implement if standard exists
  - Handle contract interaction requests
  - May need custom protocol if no standard exists

#### 11.2 Update DApp Connector Manager (`mobile/src/features/Discover/`)
- **File**: `useDappConnectorManager.tsx`
  - Make dApp connector blockchain-aware
  - Route connection requests to appropriate blockchain handler
  - Support multiple simultaneous dApp connections (one per blockchain)
  - Update connection storage to include blockchain

- **File**: `dapp-connector-storage.ts`
  - Update storage schema to include blockchain:
    ```typescript
    type DappConnection = {
      dappOrigin: string
      walletId: string
      blockchain: NetworkBlockchains
      network: ChainSupportedNetworks
    }
    ```

### Phase 12: Notifications

#### 12.1 Multi-Chain Notification Manager (`mobile/packages/notifications/`)
- **File**: `blockchain-notification-manager.ts`
  - Extend notification system to be blockchain-aware
  - Support blockchain-specific notification types:
    - Bitcoin: Transaction confirmations, fee updates
    - Midnight: Transaction status, ZK proof completion
    - Cardano: Existing notifications
  - Update notification events to include blockchain:
    ```typescript
    type NotificationEvent = {
      trigger: NotificationTrigger
      blockchain: NetworkBlockchains
      metadata: BlockchainSpecificMetadata
    }
    ```

- **File**: `notification-types.ts`
  - Add blockchain field to notification events
  - Define blockchain-specific notification metadata
  - Update existing notification types

#### 12.2 Notification UI (`mobile/src/features/Notifications/`)
- **File**: `NotificationUIHandler.tsx`
  - Update notification display to show blockchain
  - Blockchain-specific notification icons
  - Filter notifications by blockchain
  - Update notification popup to include blockchain indicator

### Phase 13: Exchange Rates & USD Values

#### 13.1 Price API Integration (`mobile/packages/portfolio/`)
- **File**: `price-api.ts`
  - Integrate price APIs (CoinGecko, CoinMarketCap, etc.)
  - Fetch prices for BTC and Midnight tokens
  - Cache prices efficiently
  - Key methods:
    - `getPrice(tokenId: string, blockchain: NetworkBlockchains)` - Get token price
    - `getPrices(tokenIds: string[], blockchain: NetworkBlockchains)` - Batch get prices
    - `updatePrices()` - Refresh prices

- **File**: `multi-chain-price-manager.ts`
  - Aggregate prices across blockchains
  - Calculate total portfolio value in USD
  - Handle price update failures gracefully
  - Key methods:
    - `getTotalPortfolioValue(walletId)` - Get total USD value
    - `getBlockchainValue(walletId, blockchain)` - Get value per blockchain

#### 13.2 Balance Display Updates (`mobile/src/features/Portfolio/`)
- Show USD values for Bitcoin balances
- Show USD values for Midnight balances
- Aggregate total portfolio value
- Currency conversion support
- Update balance components to fetch and display prices

### Phase 14: Syncing Strategy

#### 14.1 Multi-Chain Sync Manager (`mobile/src/features/WalletManager/sync/`)
- **File**: `multi-chain-sync-manager.ts`
  - Coordinate syncing across multiple blockchains
  - Implement blockchain-specific sync strategies:
    - Bitcoin: Block height-based sync (simpler than Cardano)
    - Midnight: Contract state + ZK proof status sync
    - Cardano: Existing UTXO sync
  - Key methods:
    - `syncBlockchain(walletId, blockchain)` - Sync specific blockchain
    - `syncAllBlockchains(walletId)` - Sync all enabled blockchains
    - `prioritizeSync(walletId, blockchain)` - Prioritize active blockchain

- **File**: `sync-strategies.ts`
  - Define sync strategies per blockchain:
    ```typescript
    type SyncStrategy = {
      blockchain: NetworkBlockchains
      sync: (wallet: Wallet, api: Api.Blockchain.Api) => Promise<SyncResult>
      interval: number // Sync interval in ms
      priority: number // Sync priority
    }
    ```
  - Handle sync prioritization
  - Background sync for non-active blockchains

#### 14.2 Performance Optimization
- Lazy load blockchain data
- Prioritize active blockchain sync
- Batch sync operations
- Cache sync state per blockchain
- Update `sync-manager.ts` to support multi-chain syncing

### Phase 15: Favorite Contacts & Address Book

#### 15.1 Blockchain-Aware Contacts (`mobile/src/kernel/storage/`)
- **File**: `favorite-contacts-storage.ts` (update)
  - Add blockchain field to contact storage:
    ```typescript
    type FavoriteContact = {
      id: string
      name: string
      address: string
      blockchain: NetworkBlockchains // New
      createdAt: Date
    }
    ```
  - Validate addresses per blockchain
  - Filter contacts by blockchain
  - Update storage schema

#### 15.2 Contact Management UI (`mobile/src/features/Send/`)
- **File**: `FavoriteContactsList.tsx`
  - Update contact list to show blockchain
  - Filter contacts by blockchain
  - Validate addresses when adding contacts
  - Blockchain-specific address validation
  - Update contact item to display blockchain indicator

### Phase 16: Settings & Preferences

#### 16.1 Blockchain-Specific Settings (`mobile/src/features/Settings/`)
- **File**: `blockchain-settings.ts`
  - Per-blockchain settings storage:
    ```typescript
    type BlockchainSettings = {
      blockchain: NetworkBlockchains
      bitcoin?: {
        defaultFeeRate: 'fast' | 'medium' | 'slow'
        defaultAddressType: 'p2wpkh' | 'p2pkh' | 'p2tr'
      }
      midnight?: {
        zkProofSettings: ZKProofSettings
        contractInteractionSettings: ContractSettings
      }
    }
    ```
  - Bitcoin: Default fee rates, address type preferences
  - Midnight: ZK proof settings, contract interaction preferences
  - Cardano: Existing settings

#### 16.2 Settings UI
- Blockchain-specific settings screens
- Global vs per-blockchain settings
- Settings migration for existing users
- Update settings navigation to include blockchain-specific options

### Phase 17: Error Handling & Analytics

#### 17.1 Unified Error Handling (`mobile/packages/common/`)
- **File**: `blockchain-errors.ts`
  - Define blockchain-specific error types:
    ```typescript
    type BitcoinError = {
      type: 'BITCOIN_ERROR'
      code: 'NETWORK_ERROR' | 'FEE_ESTIMATION_FAILED' | 'INSUFFICIENT_FUNDS'
      message: string
    }
    
    type MidnightError = {
      type: 'MIDNIGHT_ERROR'
      code: 'ZK_PROOF_FAILED' | 'CONTRACT_ERROR' | 'PRIVATE_STATE_ERROR'
      message: string
    }
    ```
  - Unified error handling with blockchain context
  - Error mapping per blockchain

#### 17.2 Analytics Updates (`mobile/src/features/Analytics/`)
- **File**: `analytics-events.ts`
  - Add blockchain dimension to analytics events:
    ```typescript
    type AnalyticsEvent = {
      event: string
      blockchain?: NetworkBlockchains
      // ... other fields
    }
    ```
  - Track usage per blockchain
  - Monitor multi-chain wallet adoption
  - Performance metrics per blockchain

### Phase 18: Testing & Migration

#### 18.1 Unit Tests
- Test blockchain-specific implementations
- Test multi-chain wallet operations
- Test transaction building per blockchain
- Test hardware wallet integration per blockchain
- Test link parsing (Cardano and Bitcoin)
- Test dApp connector per blockchain
- Test notification system
- Test sync strategies
- Test price API integration
- Test contact management

#### 18.2 Integration Tests
- Test wallet creation with multiple blockchains
- Test transaction flows per blockchain
- Test network switching
- Test hardware wallet app switching
- Test deep link handling
- Test dApp connections per blockchain
- Test multi-chain sync coordination
- Test price aggregation
- Test settings migration

#### 18.3 Migration Strategy
- **File**: `migration/multi-chain-migration.ts`
  - Migrate existing Cardano-only wallets:
    ```typescript
    async function migrateWalletToMultiChain(walletId: string) {
      // Add enabledBlockchains: ['cardano'] to existing wallets
      // Preserve all existing data
      // Mark as migrated
    }
    ```
  - Add blockchain field to wallet metadata
  - Preserve existing wallet functionality
  - Support adding blockchains to existing wallets
  - Migrate favorite contacts with blockchain info
  - Migrate settings to blockchain-aware structure

#### 18.4 Backward Compatibility
- Ensure existing Cardano wallets continue to work
- Gradual rollout of multi-chain features
- Feature flags for new blockchains:
  ```typescript
  const FEATURE_FLAGS = {
    BITCOIN_ENABLED: false, // Start disabled
    MIDNIGHT_ENABLED: false, // Start disabled
  }
  ```
- Hardware wallet compatibility checks
- Settings migration for existing users

## Dependencies & Packages

### New Dependencies
- `@scure/btc-signer` - Bitcoin transaction signing
- `@scure/bip32` - BIP32 key derivation (already used)
- `bitcoinjs-lib` - Bitcoin utilities (if needed)
- `@midnight-ntwrk/wallet-sdk-hd` - Midnight HD wallet
- `@midnight-ntwrk/midnight-js-*` - Midnight providers:
  - `@midnight-ntwrk/midnight-js-fetch-zk-config-provider`
  - `@midnight-ntwrk/midnight-js-http-client-proof-provider`
  - `@midnight-ntwrk/midnight-js-indexer-public-data-provider`
  - `@midnight-ntwrk/midnight-js-level-private-state-provider`
- `@ledgerhq/hw-app-btc` - Ledger Bitcoin app support
- `@walletconnect/core` - WalletConnect for Bitcoin dApps (if using)
- `@meshsdk/bitcoin` - Bitcoin utilities from mesh (optional)

### Existing Dependencies (Reuse)
- `@scure/bip39` - Mnemonic handling
- `@yoroi/common` - Common utilities
- `@yoroi/types` - Type definitions (extend)
- `@cardano-foundation/ledgerjs-hw-app-cardano` - Cardano Ledger (existing)
- `@ledgerhq/react-native-hid` - Ledger transport (existing)
- `@ledgerhq/react-native-hw-transport-ble` - Ledger BLE transport (existing)

## File Structure

```
mobile/packages/
├── blockchains/
│   ├── bitcoin/
│   │   ├── constants.ts
│   │   ├── network-config.ts
│   │   ├── providers/
│   │   │   ├── blockstream.ts
│   │   │   └── maestro.ts
│   │   └── wallet/
│   │       └── embedded-wallet.ts
│   ├── midnight/
│   │   ├── constants.ts
│   │   ├── network-config.ts
│   │   ├── providers/
│   │   │   ├── public-data-provider.ts
│   │   │   ├── private-state-provider.ts
│   │   │   ├── zk-config-provider.ts
│   │   │   └── proof-provider.ts
│   │   └── wallet/
│   │       └── embedded-wallet.ts
│   ├── cardano/ (existing)
│   ├── blockchain-registry.ts
│   └── networks/ (updated)
├── api/
│   ├── bitcoin/
│   │   ├── bitcoin-api-maker.ts
│   │   ├── utxo-data.ts
│   │   └── fee-estimates.ts
│   ├── midnight/
│   │   ├── midnight-api-maker.ts
│   │   └── contract-state.ts
│   └── blockchain-api-maker.ts
├── tx/
│   ├── bitcoin/
│   │   ├── bitcoin-tx-builder.ts
│   │   └── bitcoin-signer.ts
│   ├── midnight/
│   │   ├── midnight-tx-builder.ts
│   │   └── midnight-signer.ts
│   └── blockchain-tx-builder.ts
├── links/
│   ├── bitcoin/
│   │   ├── bitcoin-module.ts
│   │   ├── bitcoin-types.ts
│   │   └── bitcoin-validators.ts
│   └── cardano/ (existing)
├── dapp-connector/
│   ├── blockchain-dapp-connector.ts
│   ├── bitcoin-wallet-connect.ts
│   └── midnight-dapp-connector.ts
└── notifications/
    ├── blockchain-notification-manager.ts
    └── notification-types.ts (updated)
```

## Feature Prioritization

### Phase 1 Release (Core Features) - MVP
- ✅ Send/Receive for Bitcoin and Midnight
- ✅ Balance display per blockchain
- ✅ Transaction history per blockchain
- ✅ Single mnemonic multi-chain wallet creation
- ✅ Bitcoin links (BIP 21)
- ✅ Basic hardware wallet support (Bitcoin Ledger)

### Phase 2 Release (Advanced Features)
- ⚠️ Message signing (Bitcoin: BIP322, Midnight: research needed)
- ⚠️ UTXO consolidation (Bitcoin: standard, Midnight: research needed)
- ⚠️ Swap (Bitcoin: UTXO swaps, Midnight: contract-based - complex)
- ✅ Full hardware wallet support (Trezor, multi-chain manager)
- ✅ DApp connector support

### Phase 3 Release (Polish & Optimization)
- ✅ Notifications per blockchain
- ✅ Exchange rates & USD values
- ✅ Favorite contacts per blockchain
- ✅ Settings per blockchain
- ✅ Analytics updates
- ✅ Performance optimizations

### Research Needed
- Midnight message signing mechanism
- Midnight UTXO consolidation approach
- Midnight link standards
- Midnight hardware wallet support availability
- Midnight dApp connection protocol

## Risk Mitigation

1. **Breaking Changes**: Use feature flags and gradual rollout
2. **Performance**: Lazy load blockchain-specific code, optimize sync
3. **Storage**: Efficient multi-chain wallet storage, cleanup strategies
4. **Testing**: Comprehensive test coverage before mainnet Bitcoin
5. **Midnight Testnet**: Clear testnet indicators in UI
6. **Hardware Wallets**: Clear app switching guidance, error handling
7. **ZK Proofs**: Handle proof generation failures gracefully, show progress

## Success Criteria

1. ✅ Bitcoin mainnet integration working
2. ✅ Midnight testnet integration working
3. ✅ Multi-chain wallet creation
4. ✅ Transaction building and signing for both blockchains
5. ✅ Backward compatibility with existing Cardano wallets
6. ✅ UI supports blockchain selection and switching
7. ✅ Hardware wallet support for Bitcoin
8. ✅ Bitcoin links (BIP 21) working
9. ✅ All tests passing
10. ✅ Performance acceptable (no significant slowdown)

## Timeline Estimate

- **Phase 1-2**: 2-3 weeks (Type system & implementations)
- **Phase 3-4**: 2-3 weeks (API & network manager)
- **Phase 5**: 2-3 weeks (Transaction building)
- **Phase 6-7**: 2 weeks (Wallet & portfolio)
- **Phase 8**: 1 week (Explorers)
- **Phase 9**: 3-4 weeks (UI updates)
- **Phase 10**: 1-2 weeks (Deep links & QR codes)
- **Phase 11**: 2 weeks (DApp connector & Wallet Connect)
- **Phase 12**: 1 week (Notifications)
- **Phase 13**: 1 week (Exchange rates & USD values)
- **Phase 14**: 2 weeks (Syncing strategy)
- **Phase 15**: 1 week (Favorite contacts)
- **Phase 16**: 1 week (Settings & preferences)
- **Phase 17**: 1 week (Error handling & analytics)
- **Phase 18**: 2 weeks (Testing & migration)

**Total**: ~22-28 weeks (~5.5-7 months)

## Notes

- Start with Bitcoin testnet for safer testing
- Midnight is testnet-only for now, prepare for mainnet
- Consider using mesh packages where possible to reduce duplication
- Maintain Cardano as primary blockchain initially
- Plan for future blockchains (Ethereum, etc.) in architecture
- Feature flags allow gradual rollout
- ZK proof generation for Midnight adds complexity - handle gracefully
- Hardware wallet app switching requires clear UX guidance
- Single mnemonic multi-chain support is a key differentiator
- Backward compatibility is critical - existing users must not be affected

## Key Implementation Details

### Wallet Storage Schema Update
```typescript
// Before
type WalletMeta = {
  id: string
  name: string
  // ... other fields
}

// After
type WalletMeta = {
  id: string
  name: string
  enabledBlockchains: NetworkBlockchains[] // ['cardano'] for existing wallets
  blockchainAccounts: {
    [blockchain: NetworkBlockchains]: {
      addresses: string[]
      derivationPaths: string[]
      // blockchain-specific data
    }
  }
  // ... other fields
}
```

### Network Manager Update Pattern
```typescript
// Current: Cardano-specific
const api = CardanoApi.cardanoApiMaker({ network })

// New: Blockchain-agnostic
const api = blockchainApiMaker({ blockchain, network })
```

### Transaction Building Pattern
```typescript
// Current: Cardano-only
const unsignedTx = await buildTransaction(state, protocolParams)

// New: Blockchain-aware
const builder = getTransactionBuilder(blockchain)
const unsignedTx = await builder.buildTransaction(state, blockchainParams)
```

### Hardware Wallet Pattern
```typescript
// Detect app and route to appropriate handler
const hwManager = getHardwareWalletManager(blockchain)
if (hwManager.detectApp() !== blockchain) {
  await hwManager.promptSwitchApp(blockchain)
}
const signedTx = await hwManager.signTransaction(unsignedTx)
```

