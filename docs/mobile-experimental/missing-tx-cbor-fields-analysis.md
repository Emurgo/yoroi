# Missing Transaction CBOR Fields Analysis

## Overview

This document analyzes what parts of a Cardano transaction CBOR are not yet displayed in the review transaction flow. The analysis compares available transaction body fields from CSL (Cardano Serialization Library) with what's currently extracted and displayed in the UI.

## Current Display Status

### ✅ Currently Displayed Fields

The review transaction flow currently displays:

1. **Overview Tab**
   - Inputs (with addresses, assets, UTXO references)
   - Outputs (with addresses, assets, datum, reference scripts)
   - Fee
   - Wallet information
   - Operations (certificates)
   - Smart contract interactions (detected but basic info)
   - Transaction chaining info (basic detection)

2. **UTxOs Tab**
   - Detailed input/output UTXOs with addresses and assets
   - Fee breakdown

3. **Metadata Tab**
   - Metadata hash (`auxiliary_data_hash`)
   - Decoded metadata (CIP-674 only - label 674)

4. **Mint Tab**
   - Token minting information (policy ID, asset name, quantity)

5. **Reference Inputs Tab**
   - Reference inputs (if present)

6. **Datum Tab**
   - Datum information from outputs (type, hash, decoded data, JSON)

7. **Governance Tab**
   - Governance proposals and votes (from certificates)

8. **CBOR Tab**
   - Raw CBOR hex (if available)

## Missing Transaction Body Fields

### ❌ Withdrawals

**Status**: Not extracted or displayed

**Field**: `withdrawals` (stake reward withdrawals)

**Evidence**:
- Exists in `WalletTransaction` type (`mobile/src/wallets/types/other.ts:240-244`)
- Not extracted in `useFormattedTx.tsx`
- Not included in `FormattedTx` type
- Not displayed in any tab

**Impact**: Users cannot see stake reward withdrawals in the transaction review

**Priority**: Medium (important for staking operations)

---

### ❌ TTL (Time To Live)

**Status**: Not extracted or displayed

**Field**: `ttl` (transaction expiration slot)

**Evidence**:
- Available in CSL: `txBody.ttl()`
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:591`)
- Not extracted in `useFormattedTx.tsx`
- Not displayed in UI

**Impact**: Users cannot see when the transaction expires

**Priority**: Low-Medium (useful for debugging expired transactions)

---

### ❌ Validity Interval Start

**Status**: Not extracted or displayed

**Field**: `validity_interval_start` (transaction validity start slot)

**Evidence**:
- Available in CSL: `txBody.validityStartIntervalBignum()`
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:596`)
- Not extracted in `useFormattedTx.tsx`
- Not displayed in UI

**Impact**: Users cannot see when the transaction becomes valid

**Priority**: Low-Medium (useful for time-locked transactions)

---

### ❌ Network ID

**Status**: Not extracted or displayed

**Field**: `network_id` (network identifier)

**Evidence**:
- Available in CSL: `txBody.networkId()`
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:611`)
- Not extracted in `useFormattedTx.tsx`
- Not displayed in UI

**Impact**: Users cannot verify which network the transaction targets

**Priority**: Low (usually inferred from wallet network, but useful for verification)

---

### ❌ Collateral Inputs

**Status**: Not extracted or displayed

**Field**: `collateral` (Plutus transaction collateral inputs)

**Evidence**:
- Exists in `WalletTransaction` type (`mobile/src/wallets/types/other.ts:248-252`)
- Available in CSL: `txBody.collateral()`
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:556`)
- Not extracted in `useFormattedTx.tsx`
- Not included in `FormattedTx` type
- Not displayed in any tab

**Impact**: Users cannot see collateral inputs for Plutus transactions

**Priority**: High (critical for Plutus transactions - users need to see what's at risk)

---

### ❌ Collateral Return

**Status**: Not extracted or displayed

**Field**: `collateral_return` (collateral return output)

**Evidence**:
- Available in CSL: `txBody.collateralReturn()`
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:562`)
- Not extracted in `useFormattedTx.tsx`
- Not displayed in UI

**Impact**: Users cannot see where collateral is returned if transaction succeeds

**Priority**: Medium-High (important for understanding Plutus transaction flow)

---

### ❌ Total Collateral

**Status**: Not extracted or displayed

**Field**: `total_collateral` (total collateral amount)

**Evidence**:
- Available in CSL: `txBody.totalCollateral()`
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:613`)
- Not extracted in `useFormattedTx.tsx`
- Not displayed in UI

**Impact**: Users cannot see total collateral amount at risk

**Priority**: Medium-High (important for Plutus transactions)

---

### ❌ Required Signers

**Status**: Not extracted or displayed

**Field**: `required_signers` (required signer key hashes)

**Evidence**:
- Available in CSL: `txBody.requiredSigners()`
- Used in signature utilities (`mobile/src/wallets/cardano/common/signatureUtils.ts:121`)
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:465`)
- Not extracted in `useFormattedTx.tsx`
- Not displayed in UI

**Impact**: Users cannot see which keys are required to sign the transaction

**Priority**: Medium (useful for multi-sig transactions)

---

### ❌ Script Data Hash

**Status**: Not extracted or displayed

**Field**: `script_data_hash` (Plutus script data hash)

**Evidence**:
- Available in CSL: `txBody.scriptDataHash()`
- Used in ledger signing (`mobile/src/features/Discover/common/ledger.ts:607`)
- Not extracted in `useFormattedTx.tsx`
- Not displayed in UI

**Impact**: Users cannot verify the script data hash for Plutus transactions

**Priority**: Medium (useful for Plutus transaction verification)

---

### ⚠️ Auxiliary Data Hash (Partial)

**Status**: Partially displayed

**Field**: `auxiliary_data_hash` (hash is shown, but full auxiliary data is not)

**Current Implementation**:
- Hash is extracted: `txBody.auxiliary_data_hash` (`useFormattedMetadata.tsx:14`)
- Only metadata label 674 is decoded and displayed (`useFormattedMetadata.tsx:24`)
- Other metadata labels are ignored
- Scripts in auxiliary data are not shown

**Missing**:
- Other metadata labels (not just 674)
- Scripts in auxiliary data
- Full auxiliary data structure

**Impact**: Users can only see CIP-674 metadata, not other metadata or scripts

**Priority**: Medium (depends on use case - CIP-674 is most common)

---

## Missing Transaction Witness Set Fields

### ❌ Transaction Witness Set (Complete)

**Status**: Not extracted or displayed at all

**Components**:
1. **VKey Witnesses** (signatures)
   - Available in CSL: `tx.witnessSet()?.vkeys()`
   - Contains Ed25519 signatures
   - Not extracted or displayed

2. **Bootstrap Witnesses**
   - Available in CSL: `tx.witnessSet()?.bootstraps()`
   - Used for Byron-era addresses
   - Not extracted or displayed

3. **Native Script Witnesses**
   - Available in CSL: `tx.witnessSet()?.nativeScripts()`
   - Contains native script hashes
   - Not extracted or displayed

4. **Plutus Script Witnesses**
   - Available in CSL: `tx.witnessSet()?.plutusScripts()`
   - Contains Plutus script bytes/hashes
   - Not extracted or displayed

5. **Plutus Data (Redeemers)**
   - Available in CSL: `tx.witnessSet()?.plutusData()`
   - Contains redeemer data for Plutus scripts
   - Not extracted or displayed

**Evidence**:
- Witness set is accessible via `tx.witnessSet()` from `Transaction.fromHex(cbor)`
- Used in signing code (`mobile/packages/tx/ledger/signing.ts:120`)
- Not extracted in review flow
- Not displayed in UI

**Impact**: Users cannot see:
- Who signed the transaction (signatures)
- What scripts are involved
- What redeemers are used for Plutus transactions

**Priority**: Medium-High (important for transaction verification and debugging)

---

## Summary Table

| Field | Status | Priority | Impact |
|-------|--------|----------|--------|
| **Transaction Body** |
| `withdrawals` | ❌ Missing | Medium | Stake rewards not visible |
| `ttl` | ❌ Missing | Low-Medium | Expiration not visible |
| `validity_interval_start` | ❌ Missing | Low-Medium | Validity start not visible |
| `network_id` | ❌ Missing | Low | Network verification |
| `collateral` | ❌ Missing | High | Plutus collateral not visible |
| `collateral_return` | ❌ Missing | Medium-High | Collateral return not visible |
| `total_collateral` | ❌ Missing | Medium-High | Total collateral not visible |
| `required_signers` | ❌ Missing | Medium | Multi-sig info not visible |
| `script_data_hash` | ❌ Missing | Medium | Script data hash not visible |
| `auxiliary_data_hash` | ⚠️ Partial | Medium | Only label 674 shown |
| **Witness Set** |
| `vkeys` (signatures) | ❌ Missing | Medium-High | Signers not visible |
| `bootstrapWitnesses` | ❌ Missing | Low | Byron witnesses not visible |
| `nativeScripts` | ❌ Missing | Medium | Native scripts not visible |
| `plutusScripts` | ❌ Missing | Medium-High | Plutus scripts not visible |
| `plutusData` (redeemers) | ❌ Missing | Medium-High | Redeemers not visible |

## Recommendations

### High Priority
1. **Collateral Fields** (`collateral`, `collateral_return`, `total_collateral`)
   - Critical for Plutus transactions
   - Users need to see what's at risk
   - Should be displayed prominently in Overview or separate tab

2. **Witness Set - Signatures** (`vkeys`)
   - Important for transaction verification
   - Users should see who signed the transaction
   - Could be shown in Overview or new "Signatures" tab

### Medium Priority
3. **Withdrawals**
   - Important for staking operations
   - Should be displayed in Overview or Operations section

4. **Witness Set - Plutus Data** (`plutusData`, `plutusScripts`)
   - Important for Plutus transaction understanding
   - Should be displayed in a Plutus-specific section or tab

5. **Required Signers**
   - Useful for multi-sig transactions
   - Could be shown in Overview or Details section

6. **Script Data Hash**
   - Useful for Plutus transaction verification
   - Could be shown in Details or Plutus section

### Low Priority
7. **TTL and Validity Interval**
   - Useful for debugging expired transactions
   - Could be shown in Details section

8. **Network ID**
   - Usually inferred from wallet network
   - Could be shown in Details section

9. **Full Auxiliary Data**
   - Depends on use case
   - Could expand Metadata tab to show all labels

10. **Bootstrap Witnesses**
    - Rarely used (Byron addresses)
    - Low priority unless Byron support is needed

## Implementation Notes

### Extraction Points

1. **Transaction Body Fields**: Extract from `txBody` in `useFormattedTx.tsx`
   - Currently only extracts: `inputs`, `outputs`, `fee`, `certs`, `mint`, `reference_inputs`
   - Need to add: `withdrawals`, `ttl`, `validity_interval_start`, `network_id`, `collateral`, `collateral_return`, `total_collateral`, `required_signers`, `script_data_hash`

2. **Witness Set**: Extract from `tx.witnessSet()` in `useFormattedTx.tsx`
   - Currently not extracted at all
   - Need to add extraction for all witness set components

3. **Auxiliary Data**: Expand `useFormattedMetadata.tsx`
   - Currently only extracts label 674
   - Need to extract all metadata labels and scripts

### Type Updates Needed

Update `FormattedTx` type in `mobile/src/features/ReviewTx/common/types.ts`:
- Add `withdrawals?: FormattedWithdrawals | null`
- Add `collateral?: FormattedInputs | null`
- Add `collateralReturn?: FormattedOutput | null`
- Add `totalCollateral?: FormattedFee | null`
- Add `requiredSigners?: string[] | null`
- Add `scriptDataHash?: string | null`
- Add `ttl?: number | null`
- Add `validityIntervalStart?: number | null`
- Add `networkId?: number | null`
- Add `witnessSet?: FormattedWitnessSet | null`

### UI Considerations

1. **Collateral Fields**: Should be prominently displayed for Plutus transactions
   - Could add a "Collateral" section in Overview tab
   - Or create a "Plutus" tab for all Plutus-related fields

2. **Withdrawals**: Could be shown in Operations section or Overview tab

3. **Witness Set**: Could add a "Signatures" tab or section
   - Show signer key hashes
   - Show script hashes
   - Show redeemer data

4. **Details Section**: Add a "Transaction Details" section for:
   - TTL
   - Validity interval
   - Network ID
   - Script data hash
   - Required signers

## Files to Modify

1. `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx`
   - Extract missing transaction body fields
   - Extract witness set data

2. `mobile/src/features/ReviewTx/common/types.ts`
   - Add types for missing fields

3. `mobile/src/features/ReviewTx/common/hooks/useFormattedMetadata.tsx`
   - Expand to show all metadata labels

4. `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/ReviewTx.tsx`
   - Add tabs/sections for new fields

5. `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab.tsx`
   - Display new fields in Overview

6. Create new components:
   - `CollateralTab.tsx` or `PlutusTab.tsx`
   - `SignaturesTab.tsx` or `WitnessSetTab.tsx`
   - `WithdrawalsSection.tsx`

## Verification Checklist

### ✅ Transaction Body Fields - Verified
- [x] `inputs` - ✅ Extracted and displayed
- [x] `outputs` - ✅ Extracted and displayed  
- [x] `fee` - ✅ Extracted and displayed
- [x] `certs` - ✅ Extracted and displayed
- [x] `mint` - ✅ Extracted and displayed
- [x] `reference_inputs` - ✅ Extracted and displayed
- [x] `withdrawals` - ❌ NOT extracted (verified in `useFormattedTx.tsx:49-54`)
- [x] `ttl` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `validity_interval_start` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `network_id` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `collateral` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `collateral_return` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `total_collateral` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `required_signers` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `script_data_hash` - ❌ NOT extracted (verified - not accessed from `data` parameter)
- [x] `auxiliary_data_hash` - ⚠️ Hash extracted, but only metadata 674 decoded

### ✅ Witness Set - Verified
- [x] Witness set access - ❌ NOT accessed (verified - `tx.witnessSet()` never called in review flow)
- [x] VKey witnesses - ❌ NOT extracted
- [x] Bootstrap witnesses - ❌ NOT extracted
- [x] Native script witnesses - ❌ NOT extracted
- [x] Plutus script witnesses - ❌ NOT extracted
- [x] Plutus data (redeemers) - ❌ NOT extracted

### ✅ Auxiliary Data - Verified
- [x] Metadata hash - ✅ Extracted (`useFormattedMetadata.tsx:14`)
- [x] Metadata label 674 - ✅ Decoded and displayed (`useFormattedMetadata.tsx:24`)
- [x] Other metadata labels - ❌ NOT extracted (verified - only label 674 accessed)
- [x] Scripts in auxiliary data - ❌ NOT extracted (verified - `auxiliaryData?.scripts()` never called)

### ✅ Output Fields - Verified
- [x] Reference scripts - ✅ Detected and included in `FormattedOutput` (`useFormattedTx.tsx:350-391`)
- [x] Datum - ✅ Extracted and displayed (`useFormattedTx.tsx:319-347`)
- [x] Address resolution - ⚠️ Placeholder fields exist in types but not implemented (`types.ts:34,54`)

## Analysis Methodology

1. **Code Review**: Examined `useFormattedTx.tsx` to identify which fields are extracted from `TransactionBody`
2. **Type Analysis**: Reviewed `FormattedTx` type to see what's included in the formatted output
3. **UI Review**: Checked all tabs in `ReviewTx.tsx` to see what's displayed
4. **Reference Comparison**: Compared with `ledger.ts` which uses all available CSL fields for signing
5. **CSL API Review**: Verified available methods via codebase search for CSL usage patterns

## References

- CSL Transaction Body API: `txBody.withdrawals()`, `txBody.collateral()`, etc.
- CSL Transaction API: `tx.witnessSet()`, `tx.auxiliaryData()`
- Current extraction: `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx`
- Ledger signing reference: `mobile/src/features/Discover/common/ledger.ts` (shows all available fields)
- Transaction body extraction: `mobile/src/features/ReviewTx/common/hooks/useTxBody.tsx`
- Metadata extraction: `mobile/src/features/ReviewTx/common/hooks/useFormattedMetadata.tsx`

