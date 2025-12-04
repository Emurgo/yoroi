# Multisig Wallets Testing Guide

## Overview

This document outlines the testing strategy for multisig wallet functionality in Yoroi, including unit tests, integration tests, and E2E test scenarios.

## Unit Tests

Unit tests have been created for the following components:

### 1. Native Script Building (`build-native-script.test.ts`)
- Tests for building payment scripts with different quorum rules (RequireAllOf, RequireAnyOf, RequireNOf)
- Tests for building staking scripts
- Validation tests for empty signers

### 2. Script Utilities (`script-utils.test.ts`)
- Tests for validating shared wallet scripts
- Tests for extracting sign policies from scripts
- Tests for checking if scripts are native scripts

### 3. Transaction Builder (`multisig-tx-builder.test.ts`)
- Tests for building multisig transactions with native scripts
- Error handling tests

### 4. Transaction Signer (`multisig-tx-signer.test.ts`)
- Tests for signing multisig transactions
- Tests for checking co-signer signatures
- Tests for quorum validation

### 5. Wallet Creation (`create-multisig-wallet.test.ts`)
- Integration tests for creating multisig wallets
- Validation tests for quorum rules
- Tests for different quorum types

### 6. Transaction JSON (`transaction-json.test.ts`)
- Tests for constructing transaction JSON
- Tests for parsing transaction JSON
- Validation tests for invalid JSON

## Integration Tests

### Test Scenarios

1. **Multisig Wallet Creation Flow**
   - Create multisig wallet with multiple co-signers
   - Verify wallet metadata is stored correctly
   - Verify scripts are generated correctly
   - Test with different quorum rules

2. **Transaction Building**
   - Build transaction for multisig wallet
   - Verify native scripts are included in witness set
   - Test with different transaction types (send, stake, etc.)

3. **Transaction Signing**
   - Sign transaction with one co-signer
   - Verify signature is added correctly
   - Test quorum validation
   - Test partial signing workflow

4. **Transaction JSON Export/Import**
   - Export transaction as JSON
   - Import transaction JSON
   - Verify transaction integrity after import
   - Test co-signing workflow with JSON files

## E2E Test Scenarios

### Scenario 1: Complete Multisig Wallet Creation

**Steps:**
1. User selects "Create Multisig Wallet"
2. User selects parent wallet
3. User enters password to generate shared key
4. User adds co-signers (public keys)
5. User defines quorum rules (e.g., 2-of-3)
6. User reviews and confirms wallet creation
7. User shares wallet setup JSON with co-signers

**Expected Results:**
- Multisig wallet is created successfully
- Wallet appears in wallet list with multisig indicator
- Wallet setup JSON can be exported
- Wallet can be imported by co-signers

### Scenario 2: Multisig Transaction Flow

**Steps:**
1. User creates a send transaction from multisig wallet
2. Transaction review screen shows multisig-specific UI
3. User signs transaction (first signature)
4. Transaction JSON is exported
5. Co-signer imports transaction JSON
6. Co-signer signs transaction (second signature)
7. Transaction meets quorum requirements
8. Transaction is submitted to network

**Expected Results:**
- Transaction is built with native scripts
- Co-signer status is tracked correctly
- Quorum validation works correctly
- Transaction can be submitted when quorum is met

### Scenario 3: Offline Signing Workflow

**Steps:**
1. User A creates transaction in Wallet A
2. User A exports transaction JSON file
3. User A shares JSON file with User B (via file transfer)
4. User B imports JSON file in Wallet B
5. User B reviews transaction details
6. User B signs transaction
7. User B exports updated transaction JSON
8. User B shares updated JSON with User A
9. User A imports updated JSON
10. Transaction meets quorum and is submitted

**Expected Results:**
- Transaction JSON can be exported and imported
- Signatures are preserved across imports/exports
- Quorum status is tracked correctly
- Transaction can be submitted after quorum is met

### Scenario 4: Ledger Hardware Wallet Co-Signing

**Steps:**
1. User creates multisig transaction
2. User signs with Ledger hardware wallet
3. Native scripts are preserved in signed transaction
4. Transaction JSON is exported
5. Co-signer signs with software wallet
6. Transaction meets quorum and is submitted

**Expected Results:**
- Ledger signing preserves native scripts
- Transaction can be signed with Ledger
- Co-signing workflow works with Ledger signatures

### Scenario 5: Quorum Scenarios

**Test Cases:**
- RequireAllOf: All co-signers must sign
- RequireAnyOf: Any co-signer can sign
- RequireNOf: N of K co-signers must sign

**Expected Results:**
- Quorum validation works correctly for each type
- Transaction submission is blocked until quorum is met
- Transaction can be submitted when quorum is met

## Test Data

### Mock Co-Signers
```typescript
const mockCoSigners = [
  {
    name: 'Co-signer 1',
    sharedWalletKey: 'acct_shared_xvk1z8kc04y...' as Bip32PublicKeyHex,
  },
  {
    name: 'Co-signer 2',
    sharedWalletKey: 'acct_shared_xvk2z9ld15z...' as Bip32PublicKeyHex,
  },
  {
    name: 'Co-signer 3',
    sharedWalletKey: 'acct_shared_xvk3z0me26a...' as Bip32PublicKeyHex,
  },
]
```

### Mock Quorum Rules
```typescript
const quorumRules = {
  kind: 'RequireNOf',
  required: 2, // 2-of-3 multisig
}
```

## Running Tests

### Unit Tests
```bash
npm test -- build-native-script.test.ts
npm test -- script-utils.test.ts
npm test -- multisig-tx-builder.test.ts
npm test -- multisig-tx-signer.test.ts
npm test -- create-multisig-wallet.test.ts
npm test -- transaction-json.test.ts
```

### Integration Tests
```bash
npm test -- --testPathPattern=integration
```

### E2E Tests
E2E tests should be run using the app's E2E testing framework (e.g., Detox, Appium). See the main E2E test documentation for setup instructions.

## Test Coverage Goals

- **Unit Tests**: >80% coverage for multisig utilities
- **Integration Tests**: Cover all major workflows
- **E2E Tests**: Cover critical user journeys

## Known Limitations

1. **Mock CSL Objects**: Unit tests use mocked CSL objects. Full integration tests should use real CSL instances.
2. **Hardware Wallet Testing**: Ledger hardware wallet tests require physical devices or simulators.
3. **Network Testing**: Transaction submission tests require testnet/mainnet access or mocked network responses.

## Future Test Improvements

1. Add more comprehensive error case testing
2. Add performance tests for large multisig wallets (many co-signers)
3. Add tests for edge cases (e.g., script updates, co-signer changes)
4. Add visual regression tests for multisig UI components
5. Add accessibility tests for multisig screens

