# Phase 1 & 2: Migration & Modern Transaction System

## Phase 1: Migrate yoroi-lib to Yoroi Monorepo

### Overview
Move relevant parts of yoroi-lib into `@yoroi/tx` package within the yoroi monorepo, removing unused/duplicated features. Main focus: UTXO handling and transaction building.

### Package Name: `@yoroi/tx`
- Focused on UTXO management and transaction building
- Core Cardano transaction functionality

### Tasks

**1.1 Create New Package Structure**
- Create `yoroi/mobile/packages/tx/`
- Set up package.json with proper dependencies
- Configure TypeScript build
- Set up workspace references

**1.2 Migrate Core Transaction Building**
- Move transaction building methods from yoroi-lib:
  - `createUnsignedTx()` → Keep (will be replaced in Phase 2)
  - `createUnsignedDelegationTx()` → Keep (will be replaced in Phase 2)
  - `createUnsignedWithdrawalTx()` → Keep (will be replaced in Phase 2)
  - `createUnsignedVotingTx()` → Keep (will be replaced in Phase 2)
- Move Ledger integration:
  - `buildLedgerPayload()`
  - `buildVotingLedgerPayloadV5()`
  - `buildLedgerSignedTx()`
  - `createSignedLedgerTxFromCbor()`
  - `signRawTransaction()`
- Move Cardano-specific utilities:
  - `normalizeToAddress()` - Address normalization (Cardano-specific)
  - `parseTokenList()` - Token parsing (Cardano-specific)
  - `calculateTxId()` - Transaction ID calculation
  - `getBalanceForStakingCredentials()` - Staking balance calculation
  - `AssetNameUtils` - Asset name utilities (Cardano-specific)

**1.3 Migrate UtxoService**
- Move `UtxoService` and `UtxoStorage` interface
- Move `initUtxo()` factory
- Move UTXO models (will be modernized in Phase 2)

**1.4 Move PoolInfoApi to Staking Package**
- Move `PoolInfoApi` class to `yoroi/mobile/packages/staking/pools/`
- Move pool-related types to staking package
- Update imports in mobile app

**1.5 Organize Utils & Types**

**Utils Organization:**
- **Stay in `@yoroi/tx`** (Cardano-specific):
  - `normalizeToAddress()` - Address normalization
  - `parseTokenList()` - Token list parsing
  - `AssetNameUtils` - Asset utilities
  - `cardanoValueFromMultiToken()` - Value conversion
  - `multiTokenFromCardanoValue()` - Value conversion
  - Address-related utilities

- **Move to `@yoroi/common`** (Generic utilities):
  - `isHex()` - Hex string validation
  - `bech32ToHex()` - Bech32 conversion
  - `stringToHex()` - String to hex
  - `joinUrl()` - URL joining
  - `tuplesIntoRecord()` - Record utilities
  - `mergeRecords()` - Record merging
  - `intoRecord()`, `keyIntoRecord()`, `valueIntoRecord()` - Record utilities

**Types Organization:**
- **Stay in `@yoroi/tx`** (Transaction-specific):
  - `CardanoAddressedUtxo` - UTXO with addressing info
  - `SendToken` - Token sending
  - `Change` - Change output
  - `MultiTokenValue` - Multi-token values
  - `TokenEntry` - Token entry
  - `Addressing` - BIP44 addressing
  - `AddressingAddress` - Address with derivation
  - `TxOutput` - Transaction output
  - `RemoteUnspentOutput` - Remote UTXO format
  - `UtxoAsset` - UTXO asset
  - `RegistrationStatus` - Staking registration status
  - `WithdrawalRequest` - Withdrawal request
  - Transaction error types

- **Coordinate with `@yoroi/types`** (Already exists):
  - `Datum` - Already imported in `types/chain/cardano.ts`
  - `UnsignedTx` - Already imported in `types/chain/cardano.ts`
  - `SignedTx` - Already imported in `types/chain/cardano.ts`
  - Consider re-exporting from `@yoroi/tx` or moving definitions

**1.6 Remove Unused Features**
- Remove `AccountService` (duplicated by mobile's AccountManager)
- Remove `encryptWithPassword`/`decryptWithPassword` (duplicated in catalystCipher)
- Remove Governance APIs (mobile has its own)
- Remove Protocol Parameters APIs (mobile has its own)
- Remove Assets APIs (unused)

**1.7 Update Imports**
- Update all mobile app imports from `@emurgo/yoroi-lib` to `@yoroi/tx`
- Update staking package to import PoolInfoApi from `@yoroi/staking`
- Update imports to use `@yoroi/common` for generic utils
- Ensure WASM module proxy is properly injected

**1.8 Testing & Validation**
- Ensure all existing functionality works
- Run mobile app tests
- Verify transaction building still works
- Verify Ledger signing still works
- Verify pool info access from staking package

### Files to Create
- `yoroi/mobile/packages/tx/package.json`
- `yoroi/mobile/packages/tx/src/index.ts`
- `yoroi/mobile/packages/tx/src/transaction/` (transaction building)
- `yoroi/mobile/packages/tx/src/utxo/` (UTXO service)
- `yoroi/mobile/packages/tx/src/utils/` (Cardano-specific utilities)
- `yoroi/mobile/packages/tx/src/types/` (transaction-specific types)
- `yoroi/mobile/packages/staking/pools/` (PoolInfoApi moved here)

### Files to Update
- `yoroi/mobile/package.json` - Add workspace reference
- `yoroi/mobile/packages/common/utils/` - Add generic utilities
- `yoroi/mobile/packages/staking/` - Add PoolInfoApi
- All files importing from `@emurgo/yoroi-lib` - Update to `@yoroi/tx` or appropriate package

---

## Phase 2: Modern UTXO Management & Flexible Transaction Builder

## Current State Analysis

### UTXO Management Issues
- **Current yoroi-lib UTXO types**: Uses `BigNumber` for amounts, `Asset[]` arrays, complex safe block/diff tracking
- **Mobile app usage**: Wraps UtxoService but transforms to `RawUtxo` with string amounts
- **Desired state**: Modern type like `useUtxoList.ts` uses `Balance.Amounts` (Record<string, Quantity>), integrates with portfolio system, includes derivation paths

### Transaction Building Limitations
- **Current**: 4 rigid functions (`createUnsignedTx`, `createUnsignedDelegationTx`, `createUnsignedWithdrawalTx`, `createUnsignedVotingTx`)
- **Problems**: 
  - Hardcoded logic per transaction type
  - No manual UTXO selection
  - No multiparty transaction support (can't save CBOR for later signing)
  - Can't combine multiple certificates
  - Automatic UTXO selection only
  - No reference input support in builder

### Old UnsignedTx vs New CBOR Format

**Old UnsignedTx (WasmUnsignedTx) Format:**
```typescript
// Rich object with WASM bindings
type WasmUnsignedTx = {
  // WASM objects (not serializable)
  txBody: WasmContract.TransactionBody
  txBuilder: WasmContract.TransactionBuilder
  certificates?: WasmContract.Certificates
  withdrawals?: WasmContract.Withdrawals
  
  // Structured data
  senderUtxos: CardanoAddressedUtxo[]  // With addressing info
  inputs: Array<{ address: string; value: MultiTokenValue }>
  outputs: Array<{ address: string; value: MultiTokenValue; datum?: Datum }>
  change: Change[]
  fee: MultiTokenValue
  metadata: TxMetadata[]
  
  // CBOR representation (hex string)
  encodedTx: string  // Hex CBOR, but object is primary
  
  // Addressing information embedded
  neededStakingKeyHashes: { neededHashes: Set<string>; wits: Set<string> }
}
```

**Characteristics:**
- ✅ Rich structured data with WASM bindings
- ✅ Addressing information embedded in UTXOs
- ✅ Helper methods for signing (`sign()` method)
- ❌ Not easily serializable (WASM objects)
- ❌ Can't be shared between parties
- ❌ Tied to WASM context
- ❌ Complex object structure

**New CBOR Format:**
```typescript
// Just a hex string
type CborTransaction = string  // Hex-encoded CBOR

// Usage:
const cbor: string = "84a30081825820..."  // Hex CBOR
```

**Characteristics:**
- ✅ Simple, serializable string
- ✅ Can be stored in database/storage
- ✅ Can be shared between parties (multiparty signing)
- ✅ Can be transmitted over network
- ✅ Standard Cardano transaction format
- ❌ Needs parsing to analyze (`Transaction.fromHex(cbor)`)
- ❌ Addressing info must be provided separately
- ❌ Requires separate signing function (`signRawTx(cbor, keys)`)

**Key Differences:**

1. **Serialization**: 
   - Old: Complex object with WASM bindings, not serializable
   - New: Simple hex string, fully serializable

2. **Sharing**:
   - Old: Can't easily share between wallets/parties
   - New: Can be shared, stored, transmitted

3. **Addressing Info**:
   - Old: Embedded in `CardanoAddressedUtxo[]` with derivation paths
   - New: Must be provided separately when signing

4. **Signing**:
   - Old: `unsignedTx.sign(privateKeys)` - method on object
   - New: `signRawTx(cbor, keys)` - separate function

5. **Analysis**:
   - Old: Direct access to structured data
   - New: Must parse: `Transaction.fromHex(cbor).toJson()`

**Migration Path:**
- Phase 2 will support both formats during transition
- New builder will produce CBOR by default
- Old UnsignedTx format kept for backward compatibility
- Review TX already handles both formats

### Review TX Feature
- **Current**: Analyzes transactions from CBOR/UnsignedTx, shows inputs/outputs/certificates/metadata/reference inputs
- **Missing**: 
  - Smart contract address identification and querying
  - Address alias resolution (adahandle, DRep)
  - Interactive transaction crafting
  - Past transaction analysis with enhanced info

## Implementation Plan

### 1. Modernize UTXO Data Types

**Goal**: Replace ancient UTXO types with modern, portfolio-integrated types

**Tasks**:
- Create new `ModernUtxo` type matching `useUtxoList.ts` pattern:
  ```typescript
  type ModernUtxo = {
    receiver: string
    txHash: string
    txIndex: number
    balance: Balance.Amounts  // Record<TokenId, Quantity>
    derivationPath?: string   // For display
    toTransactionUnspentOutputHex: () => string
  }
  ```
- Refactor `UtxoService` to work with `Balance.Amounts` instead of `BigNumber`
- Update `UtxoManager` to use modern types
- Create adapter layer for backward compatibility during migration

**Files to modify**:
- `@yoroi/tx/src/utxo/models.ts` - New modern types
- `@yoroi/tx/src/utxo/index.ts` - Update UtxoService
- `mobile/src/wallets/cardano/utxoManager/utxoManager.ts` - Use modern types
- `mobile/src/features/Transactions/useCases/UtxoList/useUtxoList.ts` - Remove transformation layer

### 2. Flexible Transaction Builder

**Goal**: Replace 4 rigid functions with a flexible builder pattern

**New API Design**:
```typescript
class TransactionBuilder {
  // Inputs
  addInput(utxo: ModernUtxo): TransactionBuilder
  addInputs(utxos: ModernUtxo[]): TransactionBuilder
  removeInput(txHash: string, txIndex: number): TransactionBuilder
  
  // Outputs
  addOutput(address: string, amounts: Balance.Amounts, datum?: Datum): TransactionBuilder
  addOutputs(outputs: Output[]): TransactionBuilder
  
  // Certificates
  addCertificate(cert: Certificate): TransactionBuilder
  addCertificates(certs: Certificate[]): TransactionBuilder
  
  // Withdrawals
  addWithdrawal(rewardAddress: string, amount: string): TransactionBuilder
  
  // Reference Inputs
  addReferenceInput(utxo: ModernUtxo): TransactionBuilder
  
  // Metadata
  addMetadata(label: string, data: any): TransactionBuilder
  
  // Options
  setChangeAddress(address: string): TransactionBuilder
  setTTL(slot: number): TransactionBuilder
  setValidityInterval(start: number, end: number): TransactionBuilder
  
  // Build
  build(): Promise<UnsignedTransaction>  // Old format (backward compat)
  buildCBOR(): Promise<string>  // New format (hex CBOR)
  estimateFee(): Promise<Balance.Amounts>
}
```

**Tasks**:
- Create new `TransactionBuilder` class in `@yoroi/tx`
- Support manual UTXO selection
- Support multiple certificates of any type
- Support reference inputs
- Support building to CBOR without signing (primary output)
- Keep automatic UTXO selection as optional helper method
- Support partial transaction building (for multiparty)
- Builder produces CBOR by default, can convert to old format if needed

**Files to create**:
- `@yoroi/tx/src/transaction-builder/index.ts` - Main builder class
- `@yoroi/tx/src/transaction-builder/types.ts` - Builder types
- `@yoroi/tx/src/transaction-builder/utxo-selector.ts` - Optional automatic UTXO selection

**Files to deprecate** (keep for backward compat):
- `@yoroi/tx/src/index.ts` - Mark old functions as deprecated
- Migration guide for old API users

### 3. Multiparty Transaction Support

**Goal**: Enable building, signing, and sharing transactions for multiple signers

**Tasks**:
- Add `buildCBOR()` method to builder (returns hex string)
- Add `loadFromCBOR(cbor: string, wasm: WasmModuleProxy)` to reconstruct builder state
- Add `addWitness(witness: Witness)` for adding signatures
- Add `isFullySigned()` check
- Add `getRequiredSigners()` to identify missing signatures
- Support partial signing workflow:
  1. Build transaction → CBOR
  2. Sign locally → Add witness → Save CBOR
  3. Share CBOR with other party
  4. Other wallet loads CBOR, signs, adds witness
  5. When fully signed, submit

**Files to create**:
- `@yoroi/tx/src/transaction-builder/multiparty.ts` - Multiparty utilities
- `@yoroi/tx/src/transaction-builder/witness-manager.ts` - Witness handling

### 4. Enhanced Transaction Analysis

**Goal**: Extend Review TX to identify smart contracts, resolve aliases, analyze past transactions

**Tasks**:
- **Smart Contract Identification**:
  - Detect script addresses (CredKind.Script) in inputs/outputs
  - Query smart contract service for contract info/summary
  - Display contract name, purpose, parameters in Review TX UI
  
- **Address Resolution**:
  - Integrate resolver package for adahandle/CNS resolution
  - Add DRep address resolution (extend resolver if needed)
  - Show resolved names in transaction views
  - Cache resolved addresses
  
- **Past Transaction Analysis**:
  - Extend `useFormattedTx` to work with transaction history
  - Add smart contract info to past transactions
  - Add address aliases to past transactions
  - Create transaction analysis view for history

**Files to create**:
- `mobile/src/features/ReviewTx/common/hooks/useSmartContractInfo.ts` - Query contract service
- `mobile/src/features/ReviewTx/common/hooks/useAddressResolution.ts` - Resolve aliases
- `mobile/src/features/ReviewTx/common/services/contract-service.ts` - Contract info API
- `mobile/src/features/Transactions/useCases/TxDetails/EnhancedTxDetails.tsx` - Enhanced analysis view

**Files to modify**:
- `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx` - Add contract/alias resolution
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/` - Update UI components

### 5. Interactive Transaction Crafting

**Goal**: Build transactions interactively using Review TX UI patterns

**Tasks**:
- Create transaction crafting mode in Review TX
- Allow adding/removing inputs, outputs, certificates interactively
- Show live fee estimation
- Validate transaction as user builds
- Support saving draft transactions (as CBOR)
- Use new TransactionBuilder API

**Files to create**:
- `mobile/src/features/ReviewTx/useCases/CraftTxScreen/CraftTxScreen.tsx` - Crafting UI
- `mobile/src/features/ReviewTx/common/hooks/useTransactionBuilder.ts` - React hook for builder
- `mobile/src/features/ReviewTx/common/components/` - Reusable crafting components

## Migration Strategy

1. **Phase 2.1**: Modern UTXO types (non-breaking, add new types alongside old)
2. **Phase 2.2**: Transaction Builder (new API, old API deprecated but functional)
3. **Phase 2.3**: Enhanced analysis (additive, doesn't break existing Review TX)
4. **Phase 2.4**: Interactive crafting (new feature, optional)
5. **Phase 2.5**: Remove deprecated APIs (breaking change, major version bump)

## Dependencies

- Resolver package: Already exists, may need DRep extension
- Smart contract service: Needs to be created/identified
- Portfolio types: Already used, ensure compatibility

## Success Criteria

- ✅ UTXO types use modern `Balance.Amounts` pattern
- ✅ Transaction builder supports all Cardano transaction features
- ✅ Multiparty transactions can be built, signed, and shared
- ✅ Review TX shows smart contract info and resolved addresses
- ✅ Past transactions can be analyzed with enhanced info
- ✅ Transactions can be crafted interactively
- ✅ CBOR format is primary, old UnsignedTx format supported for backward compat

