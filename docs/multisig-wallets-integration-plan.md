# Multisig Wallets Integration Plan for Yoroi

## Executive Summary

This plan adds Cardano native script-based multisig (shared) wallets to Yoroi, enabling multi-signature transactions with configurable quorum rules (all/any/N-of-K). The implementation follows CIP-1854 standards and integrates with Yoroi's existing wallet architecture.

**Key Principles**:

- Use Cardano native scripts (no Plutus contracts needed)
- Support offline transaction signing via JSON file exchange
- Integrate with existing wallet manager and transaction flows
- Maintain backward compatibility with existing wallets
- Follow CIP-1854 key derivation for multisig accounts
- Use functional programming (no classes, no `any`, no `require` or inline imports)
- Use branded types when needed
- Support P2P wallet-to-wallet communication for JSON file sharing (optional, not required)
- Support multiparty transactions where multiple different wallets participate in signing complex transactions

## Current State Analysis

### Yoroi Wallet Architecture

- **Wallet Types**: Currently supports `cardano-cip1852` and `cardano-bip44` implementations
- **Wallet Creation**: `createWalletFromMnemonic`, `createWalletFromXPub`, `createWalletFromRootKey`
- **Wallet Storage**: Uses `WalletEncryptedStorage` with encrypted root keys
- **Transaction Signing**: `signTx()` method with root key, supports Ledger hardware wallets
- **Address Generation**: Uses account public keys with CIP-1852 derivation

### Missing Components

- Script wallet type support (`WalletType.Script`)
- Native script building utilities
- Multisig account derivation (CIP-1854 MULTI_SIG purpose)
- Transaction JSON export/import for co-signing
- Multisig wallet creation flows
- Co-signer management UI
- Quorum rule configuration
- P2P integration for JSON file sharing (optional enhancement)
- Multiparty transaction coordination (for non-multisig wallets)

### Existing Infrastructure

- **P2P Communication**: `@yoroi/p2p-communication` package already exists with WebRTC support
- **Multi-Connection Manager**: Supports multiple simultaneous wallet-to-wallet connections
- **Peer Connection**: Wallet-to-wallet connection infrastructure ready
- **Signaling Server**: WebRTC signaling support for peer discovery

## Implementation Plan

### Phase 1: Type System & Core Types

#### 1.1 Extend Wallet Types (`mobile/packages/types/wallet/`)

- **File**: `wallet.ts`
  - Add `'cardano-multisig'` to `WalletImplementation` type
  - Add multisig-specific metadata types:
    ```typescript
    type MultisigWalletMeta = {
      coSigners: Array<{
        name: string
        sharedWalletKey: string // Bip32PublicKeyHex
      }>
      quorumRules: {
        kind: 'RequireAllOf' | 'RequireAnyOf' | 'RequireNOf'
        required?: number // For N-of-K
      }
      paymentScript: string // Native script CBOR hex
      stakingScript: string // Native script CBOR hex
    }
    ```

#### 1.2 Add Script Wallet Types (`mobile/packages/cardano-wallet/types.ts`)

- Extend `YoroiWallet` interface to support script wallets
- Add script wallet detection utilities
- Add multisig-specific wallet metadata fields

### Phase 2: Native Script Utilities

#### 2.1 Script Building (`mobile/packages/cardano-wallet/multisig/`)

- **File**: `build-native-script.ts`

  - Support `RequireAllOf`, `RequireAnyOf`, `RequireNOf` script types
  - Derive Ed25519 key hashes from Bip32 public keys
  - Build payment and staking scripts

- **File**: `script-derivation.ts`

  - Implement CIP-1854 MULTI_SIG purpose derivation
  - Derive shared wallet keys from parent wallet
  - Payment script key path: `{role: External, index: 0}`
  - Staking script key path: `{role: Stake, index: 0}`

- **File**: `script-utils.ts`
  - Validate native scripts
  - Check if script is valid shared wallet script
  - Extract sign policy from script
  - Check if co-signer has signed transaction

### Phase 3: Address Derivation

#### 3.1 Script Address Generation (`mobile/packages/cardano-wallet/account-manager/`)

- **File**: `multisig-address-generator.ts`

  - Derive addresses from native script hashes
  - Create payment credential from script hash
  - Create staking credential from script hash
  - Generate base addresses with script credentials

- **File**: `account-manager.ts` (update)
  - Add multisig address generator factory
  - Support script-based address generation
  - Integrate with existing address discovery

### Phase 4: Wallet Creation

#### 4.1 Multisig Wallet Factory (`mobile/packages/wallet-manager/creation/`)

- **File**: `create-multisig-wallet.ts`

  - Create multisig wallet from co-signers and quorum rules
  - Generate shared wallet keys from parent wallets
  - Build native scripts for payment and staking
  - Store script wallets in encrypted storage

- **File**: `multisig-account-derivation.ts`
  - Derive MULTI_SIG purpose accounts from parent wallets
  - Generate shared wallet keys (CIP-1854)
  - Link multisig accounts to parent wallets

#### 4.2 Wallet Storage Updates (`mobile/packages/wallet-manager/`)

- **File**: `lifecycle/wallet-lifecycle.ts` (update)

  - Add multisig wallet metadata creation
  - Store co-signers and quorum rules
  - Store payment/staking script CBOR

- **File**: `common/types.ts` (update)
  - Add multisig wallet factory type
  - Extend `WalletFactory` to support script wallets

### Phase 5: Transaction Building & Signing

#### 5.1 Multisig Transaction Builder (`mobile/packages/tx/multisig/`)

- **File**: `multisig-tx-builder.ts`

  - Build transactions for script wallets
  - Handle UTXO selection for multisig addresses
  - Include native scripts in transaction witness set
  - Support script-based change addresses

- **File**: `multisig-tx-signer.ts`
  - Sign transactions with multiple co-signers
  - Track which co-signers have signed
  - Validate quorum requirements before submission
  - Support partial signing (export/import flow)

#### 5.2 Transaction JSON Format (`mobile/packages/tx/multisig/`)

- **File**: `transaction-json.ts`
  - Export transaction as JSON for co-signing:
    ```typescript
    type MultisigTransactionJSON = {
      version: string
      metadata: {
        createdAt: string
        createdBy: string // Bip32PublicKeyHex or wallet ID
        chainId: string // CIP-34 format
        note?: string
        signers?: Array<{
          walletId: string
          publicKey: string
          signed: boolean
        }>
      }
      transaction: {
        cborHex: string
      }
    }
    ```
  - Import transaction JSON for signing
  - Validate transaction structure
  - Check if transaction already signed by current co-signer
  - Support both multisig and multiparty transaction formats

#### 5.3 Multiparty Transaction Support (`mobile/packages/tx/multiparty/`)

- **File**: `multiparty-tx-builder.ts`

  - Build transactions requiring signatures from multiple different wallets
  - Support complex transactions (e.g., swaps, atomic swaps, multi-asset transfers)
  - Track required signers (not limited to multisig wallets)
  - Coordinate transaction building across multiple wallet instances

- **File**: `multiparty-tx-coordinator.ts`
  - Coordinate transaction signing across multiple wallets
  - Track signing progress for each participant
  - Validate all required signatures before submission
  - Support both P2P and offline signing workflows

### Phase 6: Wallet Manager Integration

#### 6.1 Wallet Manager Updates (`mobile/packages/wallet-manager/`)

- **File**: `wallet-manager.ts` (update)

  - Add multisig wallet creation methods
  - Support loading script wallets from storage
  - Detect multisig wallets vs regular wallets
  - Handle multisig wallet selection

- **File**: `network-manager/get-wallet-factory.ts` (update)
  - Add multisig wallet factory creation
  - Support script wallet type in factory map

#### 6.2 Wallet Loading (`mobile/packages/wallet-manager/lifecycle/`)

- **File**: `wallet-lifecycle.ts` (update)
  - Load script wallets from storage
  - Reconstruct native scripts from stored CBOR
  - Validate multisig wallet metadata
  - Link multisig wallets to parent wallets

### Phase 7: UI - Wallet Creation Flow

#### 7.1 Setup Wallet Screens (`mobile/src/features/SetupWallet/`)

- **File**: `useCases/CreateMultisigWallet/`
  - `CreateMultisigWalletScreen.tsx` - Main entry point
  - `GenerateSharedKeyScreen.tsx` - Generate shared wallet key from parent wallet
  - `AddCoSignersScreen.tsx` - Add co-signers by public key
  - `DefineQuorumScreen.tsx` - Configure quorum rules (all/any/N-of-K)
  - `ReviewMultisigWalletScreen.tsx` - Review before creation
  - `ShareWalletDetailsScreen.tsx` - Export wallet setup JSON

#### 7.2 Import Multisig Wallet (`mobile/src/features/SetupWallet/`)

- **File**: `useCases/ImportMultisigWallet/`
  - `ImportMultisigWalletScreen.tsx` - Import wallet setup JSON
  - `ValidateCoSignerScreen.tsx` - Verify co-signer matches active wallet
  - `CompleteImportScreen.tsx` - Complete import flow

### Phase 8: UI - Transaction Signing Flow

#### 8.1 Send Transaction Updates (`mobile/src/features/Transfer/`)

- **File**: `send-form.tsx` (update)

  - Detect multisig wallet
  - Show co-signer status in transaction review
  - Export transaction JSON for co-signing
  - Support multiparty transaction creation

- **File**: `multisig-transaction-review.tsx` (new)

  - Display transaction details
  - Show co-signer list with signing status
  - Show quorum requirements
  - Export transaction JSON button
  - Option to share via P2P (if available)

- **File**: `multiparty-transaction-review.tsx` (new)
  - Display transaction details for multiparty transactions
  - Show all required signers (may include non-multisig wallets)
  - Track signing progress across all participants
  - Support P2P sharing option

#### 8.2 Co-Sign Transaction (`mobile/src/features/Transfer/`)

- **File**: `CoSignTransactionScreen.tsx` (new)
  - Import transaction JSON file (file picker or P2P)
  - Display transaction details
  - Show which co-signers have signed
  - Sign transaction with current wallet
  - Export updated transaction JSON
  - Option to share via P2P after signing
  - Submit transaction when quorum met

#### 8.3 P2P Integration (`mobile/src/features/Transfer/`)

- **File**: `p2p-transaction-sharing.ts` (new)

  - Share transaction JSON via P2P connection
  - Receive transaction JSON via P2P connection
  - Handle P2P connection state for transaction sharing
  - Fallback to file export/import if P2P unavailable
  - Support multiple simultaneous P2P connections for multiparty transactions

- **File**: `useP2PTransactionSharing.ts` (new)
  - Hook for P2P transaction sharing functionality
  - Manage P2P connections for transaction coordination
  - Handle incoming transaction JSON via P2P
  - Broadcast signed transaction updates to other participants

### Phase 9: UI - Wallet Management

#### 9.1 Wallet List Updates (`mobile/src/features/WalletManager/`)

- **File**: `ui/screens/SelectWalletFromListScreen/WalletListItem.tsx` (update)
  - Show multisig wallet indicator
  - Display co-signer count
  - Show quorum rules

#### 9.2 Wallet Details (`mobile/src/features/WalletDetails/`)

- **File**: `MultisigWalletDetailsScreen.tsx` (new)
  - Display co-signers list
  - Show quorum rules
  - Export wallet setup JSON
  - View transaction history

### Phase 10: Transaction History

#### 10.1 Multisig Transaction Display (`mobile/src/features/Transactions/`)

- **File**: `MultisigTransactionItem.tsx` (new)

  - Show transaction with co-signer status
  - Display quorum progress
  - Link to co-sign flow if pending signatures

- **File**: `TransactionDetailsScreen.tsx` (update)
  - Show multisig transaction details
  - Display all co-signers and signing status
  - Show quorum requirements

### Phase 11: Storage & Persistence

#### 11.1 Multisig Wallet Storage (`mobile/packages/wallet-manager/storage/`)

- **File**: `multisig-wallet-storage.ts` (new)
  - Store multisig wallet metadata
  - Store co-signers and quorum rules
  - Store payment/staking script CBOR
  - Link multisig wallets to parent wallets

#### 11.2 Migration (`mobile/packages/wallet-manager/migrations/`)

- **File**: `migrate-to-multisig-support.ts` (new)
  - Migrate existing wallets (no changes needed)
  - Add multisig support flag to wallet manager version
  - Handle script wallet loading for older versions

### Phase 12: Hardware Wallet Support

#### 12.1 Ledger Multisig (`mobile/packages/tx/ledger/`)

- **File**: `multisig-ledger-signer.ts` (new)

  - Support signing multisig transactions with Ledger
  - Handle native script witness set
  - Verify script on device

- **File**: `transform.ts` (update)
  - Transform multisig transactions for Ledger
  - Include native scripts in witness set
  - Handle multiple signatures

### Phase 14: Transaction Sharing Infrastructure

#### 14.1 Local Transaction Context (`mobile/packages/tx/multisig/`)

- **File**: `local-transaction-context.ts` (new)

  - In-memory transaction registry for same-app wallet sharing
  - Transaction state management:

    ```typescript
    type TransactionRegistry = {
      transactions: Map<string, TransactionState>
      subscribers: Map<string, Set<(state: TransactionState) => void>>
    }

    type TransactionState = {
      transactionJson: MultisigTransactionJSON | MultipartyTransactionJSON
      signers: Map<string, {walletId: string; signed: boolean}>
      status: 'pending' | 'partially-signed' | 'ready' | 'submitted'
      createdAt: Date
      updatedAt: Date
    }
    ```

  - Register transaction for sharing
  - Subscribe to transaction updates
  - Update transaction state when signed
  - Auto-cleanup expired transactions
  - Support multiple simultaneous transactions

#### 14.2 P2P Transaction Sharing (`mobile/packages/p2p-communication/`)

- **File**: `transaction-sharing.ts` (new)
  - Extend P2P communication for transaction JSON sharing
  - Message types for transaction sharing:
    ```typescript
    type TransactionSharingMessage = {
      type: 'transaction-share' | 'transaction-signed' | 'transaction-ready'
      transactionJson: MultisigTransactionJSON | MultipartyTransactionJSON
      transactionId: string
      fromPeerId: string
      toPeerId?: string // Optional for broadcast
    }
    ```
  - Handle incoming transaction JSON via P2P
  - Broadcast signed transaction updates
  - Support both multisig and multiparty transaction sharing

#### 14.3 Unified Transaction Sharing (`mobile/packages/tx/multisig/`)

- **File**: `transaction-sharing-manager.ts` (new)
  - Unified interface for all transaction sharing methods
  - Automatic method selection:
    - Check if all signers are in same app → use Local Context
    - Check if P2P available → use P2P
    - Fallback → use File Export/Import
  - Transaction state synchronization across methods
  - Handle method switching if context changes

#### 14.4 UI Integration (`mobile/src/features/Transfer/`)

- **File**: `useCases/ShareTransaction/`
  - `ShareTransactionScreen.tsx` - Unified UI for transaction sharing
  - `SelectSharingMethodScreen.tsx` - Choose sharing method (if multiple available)
  - `LocalTransactionStatusScreen.tsx` - Show status for local context transactions
  - `P2PTransactionStatusScreen.tsx` - Show status for P2P transactions
  - `FileTransactionStatusScreen.tsx` - Show status for file-based transactions
  - Automatic method detection and UI adaptation

### Phase 15: Multiparty Transaction Coordination

#### 15.1 Multiparty Transaction Types (`mobile/packages/types/tx/`)

- **File**: `multiparty-tx.ts` (new)
  - Define multiparty transaction types:
    ```typescript
    type MultipartyTransaction = {
      id: string
      unsignedTx: UnsignedTransaction
      requiredSigners: Array<{
        walletId: string
        publicKey: string
        walletName?: string
      }>
      signatures: Map<string, Signature>
      status: 'pending' | 'partially-signed' | 'ready' | 'submitted'
      createdAt: Date
      updatedAt: Date
    }
    ```
  - Support for complex transaction types (swaps, atomic swaps, etc.)

#### 15.2 Multiparty Transaction Manager (`mobile/packages/tx/multiparty/`)

- **File**: `multiparty-tx-manager.ts` (new)
  - Manage multiparty transaction state
  - Coordinate signing across multiple wallets
  - Track signing progress
  - Validate all signatures before submission
  - Support both P2P and offline workflows

#### 15.3 Multiparty Transaction UI (`mobile/src/features/Transfer/`)

- **File**: `useCases/CreateMultipartyTransaction/`
  - `CreateMultipartyTransactionScreen.tsx` - Create multiparty transaction
  - `AddSignersScreen.tsx` - Add required signers (wallet IDs or public keys)
  - `ReviewMultipartyTransactionScreen.tsx` - Review before sharing
  - `MultipartyTransactionStatusScreen.tsx` - Track signing progress

### Phase 16: Testing & Validation

#### 16.1 Unit Tests

- Test native script building
- Test address derivation from scripts
- Test transaction JSON export/import
- Test quorum validation
- Test signature tracking
- Test P2P transaction sharing
- Test multiparty transaction coordination

#### 16.2 Integration Tests

- Test multisig wallet creation flow
- Test transaction signing flow
- Test co-signer import flow
- Test quorum enforcement
- Test transaction submission
- Test P2P JSON sharing (when available)
- Test multiparty transaction flow
- Test offline signing workflow

#### 16.3 E2E Tests

- Test complete multisig wallet creation
- Test transaction with multiple co-signers
- Test offline signing workflow
- Test quorum scenarios (all/any/N-of-K)
- Test P2P transaction sharing between wallets
- Test multiparty transaction with multiple different wallets
- Test fallback to file export when P2P unavailable

## File Structure

```
mobile/
├── packages/
│   ├── cardano-wallet/
│   │   ├── multisig/
│   │   │   ├── build-native-script.ts
│   │   │   ├── script-derivation.ts
│   │   │   └── script-utils.ts
│   │   └── account-manager/
│   │       └── multisig-address-generator.ts
│   ├── tx/
│   │   ├── multisig/
│   │   │   ├── multisig-tx-builder.ts
│   │   │   ├── multisig-tx-signer.ts
│   │   │   └── transaction-json.ts
│   │   └── multiparty/
│   │       ├── multiparty-tx-builder.ts
│   │       ├── multiparty-tx-coordinator.ts
│   │       └── multiparty-tx-manager.ts
│   ├── p2p-communication/
│   │   └── transaction-sharing.ts (new)
│   └── wallet-manager/
│       ├── creation/
│       │   ├── create-multisig-wallet.ts
│       │   └── multisig-account-derivation.ts
│       └── storage/
│           └── multisig-wallet-storage.ts
└── src/
    └── features/
        ├── SetupWallet/
        │   ├── useCases/CreateMultisigWallet/
        │   └── useCases/ImportMultisigWallet/
        ├── Transfer/
        │   ├── multisig-transaction-review.tsx
        │   ├── multiparty-transaction-review.tsx
        │   ├── CoSignTransactionScreen.tsx
        │   ├── p2p-transaction-sharing.ts
        │   ├── useP2PTransactionSharing.ts
        │   └── useCases/CreateMultipartyTransaction/
        ├── P2P/
        │   └── useCases/ShareTransactionViaP2P/
        └── WalletDetails/
            └── MultisigWalletDetailsScreen.tsx
```

## Dependencies

### New Dependencies

- No new external dependencies needed (uses existing Cardano libraries)
- May need to add native script utilities from `@cardano-sdk/wallet` if not already present

### Existing Dependencies (Reuse)

- `@yoroi/cardano-wallet` - Extend for script wallet support
- `@yoroi/tx` - Extend for multisig transaction building
- `@yoroi/types` - Extend wallet types
- `@emurgo/cardano-serialization-lib` - Native script building
- `@yoroi/p2p-communication` - P2P wallet-to-wallet communication (already exists)
- `react-native-webrtc` - WebRTC support for P2P (already exists)

## Key Implementation Details

### Native Script Structure

```typescript
// Payment script example (2-of-3 quorum)
{
  __type: 'Native',
  kind: 'RequireNOf',
  required: 2,
  scripts: [
    { __type: 'Native', kind: 'RequireSignature', keyHash: 'hash1' },
    { __type: 'Native', kind: 'RequireSignature', keyHash: 'hash2' },
    { __type: 'Native', kind: 'RequireSignature', keyHash: 'hash3' }
  ]
}
```

### Transaction JSON Format

```json
{
  "version": "1.0.0",
  "metadata": {
    "createdAt": "2024-01-15T10:00:00Z",
    "createdBy": "acct_shared_xvk1z8kc04y...",
    "chainId": "cip34:0-1",
    "note": "Payment to vendor"
  },
  "transaction": {
    "cborHex": "84a30081825820..."
  }
}
```

### Wallet Storage Schema

```typescript
type MultisigWalletStorage = {
  walletId: string
  name: string
  coSigners: Array<{
    name: string
    sharedWalletKey: string
  }>
  quorumRules: {
    kind: 'RequireAllOf' | 'RequireAnyOf' | 'RequireNOf'
    required?: number
  }
  paymentScriptCbor: string
  stakingScriptCbor: string
  parentWalletIds: string[] // Links to parent wallets
}
```

## Success Criteria

1. ✅ Create multisig wallets with configurable quorum rules
2. ✅ Import multisig wallets via JSON setup file
3. ✅ Build and sign transactions for multisig wallets
4. ✅ Export/import transaction JSON for co-signing
5. ✅ Track co-signer signatures and enforce quorum
6. ✅ Submit transactions when quorum is met
7. ✅ Display multisig wallet details and co-signers
8. ✅ Support Ledger hardware wallets for co-signing
9. ✅ Backward compatibility with existing wallets
10. ✅ All tests passing

## Timeline Estimate

- **Phase 1-2**: 1 week (Type system & script utilities)
- **Phase 3**: 1 week (Address derivation)
- **Phase 4**: 2 weeks (Wallet creation)
- **Phase 5**: 2 weeks (Transaction building & signing)
- **Phase 6**: 1 week (Wallet manager integration)
- **Phase 7**: 3 weeks (UI - Wallet creation)
- **Phase 8**: 2 weeks (UI - Transaction signing)
- **Phase 9**: 1 week (UI - Wallet management)
- **Phase 10**: 1 week (Transaction history)
- **Phase 11**: 1 week (Storage & persistence)
- **Phase 12**: 1 week (Hardware wallet support)
- **Phase 13**: 2 weeks (Testing & validation)
- **Phase 14**: 2 weeks (Transaction sharing infrastructure - Local Context, P2P, File)
- **Phase 15**: 3 weeks (Multiparty transaction coordination)
- **Phase 16**: 2 weeks (Extended testing & validation)

**Total**: ~23 weeks (~5.75 months)

## Risk Mitigation

1. **Script Complexity**: Start with simple quorum rules, add complexity gradually
2. **Transaction Flow**: Thoroughly test offline signing workflow
3. **Storage**: Ensure multisig wallets don't break existing wallet loading
4. **UI/UX**: Make co-signing flow intuitive and clear
5. **Hardware Wallets**: Test Ledger support early, may have limitations
6. **Backward Compatibility**: Ensure existing wallets continue to work

## Notes

- Follow CIP-1854 for key derivation
- Native scripts don't require on-chain deployment
- Each multisig wallet has unique script (different co-signers/quorum = different address)
- Transaction JSON format enables offline signing workflow
- P2P sharing is optional enhancement - file export/import remains primary method
- Multiparty transactions extend beyond multisig wallets to support complex multi-wallet scenarios
- Use functional programming throughout (no classes, no `any`, no `require` or inline imports)
- Use branded types for type safety (e.g., `Bip32PublicKeyHex`, `TransactionCborHex`)
- Consider future enhancements: timelock scripts, script updates, advanced multiparty transaction types

## How Multisig Wallets Work

### Key Concepts

1. **No Script Deployment**: Native scripts don't need to be deployed like Plutus contracts. The script hash is used directly to derive the address.

2. **Each Wallet = Unique Script**: Each multisig wallet has its own unique script because:

   - Different co-signers (different public keys)
   - Different quorum rules (all/any/N-of-K)
   - Different script hash = different address

3. **Offline Signing**: Transactions are exported as JSON files, shared between co-signers, signed sequentially, and submitted when quorum is met.

4. **CIP-1854 Key Derivation**: Multisig accounts use MULTI_SIG purpose (`m/1852'/1815'/account'/2'/0`) to derive shared wallet keys from parent wallets.

### Transaction Flow

1. **Create Transaction**: Initiator builds unsigned transaction
2. **Export JSON**: Transaction exported as JSON file with metadata
3. **Share**: JSON file shared with co-signers (email, USB, etc.)
4. **Sign**: Each co-signer imports JSON, reviews, signs, exports updated JSON
5. **Track**: UI shows which co-signers have signed
6. **Submit**: When quorum met, transaction can be submitted to chain

### Quorum Types

- **RequireAllOf**: All co-signers must sign
- **RequireAnyOf**: Any one co-signer can sign
- **RequireNOf**: N of K co-signers must sign (e.g., 2-of-3)

## Additional Features

### P2P Wallet-to-Wallet Communication

**Purpose**: Enable seamless sharing of transaction JSON files between wallet instances via WebRTC.

**Key Points**:

- Uses existing `@yoroi/p2p-communication` infrastructure
- Optional enhancement - file export/import remains primary method
- Supports both multisig and multiparty transaction sharing
- Handles connection state and fallback to file sharing
- Multiple simultaneous connections supported for multiparty scenarios

**Implementation**:

- Extend P2P communication package with transaction sharing message types
- Add UI for selecting peer and sharing transaction JSON
- Handle incoming transaction JSON via P2P data channels
- Broadcast signed transaction updates to all participants
- Graceful fallback when P2P unavailable

### Multiparty Transactions

**Purpose**: Enable multiple different wallets (not necessarily multisig) to participate in signing complex transactions.

**Key Points**:

- Extends beyond multisig wallets to support any combination of wallets
- Useful for complex transactions: swaps, atomic swaps, multi-asset transfers
- Shared UX for transaction creation, review, and signing
- Supports both P2P and offline signing workflows
- Tracks signing progress across all participants

**Use Cases**:

- Atomic swaps between two different wallets
- Multi-asset transfers requiring multiple wallet signatures
- Complex DeFi transactions involving multiple parties
- Cross-wallet transaction coordination

**Implementation**:

- Multiparty transaction manager for state coordination
- Transaction JSON format extended to support multiple wallet signers
- UI for adding required signers and tracking progress
- Integration with P2P for real-time coordination (optional)
- Support for both online and offline signing workflows
