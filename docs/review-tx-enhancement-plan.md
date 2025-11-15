# Transaction Review Component Enhancement Plan

## Overview

This document outlines potential enhancements to the transaction review component (`src/features/ReviewTx/`) using the newly implemented Phase 1 features from `@yoroi/tx`.

## Current State

The transaction review component currently displays:
- **Overview Tab**: Transaction summary, sends/receives, operations
- **UTXOs Tab**: Inputs and outputs with addresses and assets
- **Metadata Tab**: Transaction metadata (if present)
- **Mint Tab**: Basic minting information (if present)
- **Reference Inputs Tab**: Reference inputs (if present)

## Potential Enhancements

### 1. Datum Display & Decoding ⭐ HIGH IMPACT

**Current State**: Outputs have `contractInfo` but no datum display.

**Enhancements**:
- Add a **"Datum" tab** or section showing decoded datums for outputs
- Use `decodeDatum()`, `decodeDatumToJson()`, `formatDecodedDatum()` from `@yoroi/tx` to show human-readable datum content
- Display datum type (hash/inline/embedded) and decoded structure
- Highlight outputs with datums as smart contract interactions

**Files to Enhance**:
- `src/features/ReviewTx/common/types.ts` - Add `datum?: DecodedDatum` to `FormattedOutput` type
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/UTxOs/UTxOsTab.tsx` - Show datum info for each output
- Create `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Datum/DatumTab.tsx` - Dedicated tab for datum details

**Implementation Steps**:
1. Parse datums from transaction outputs using `parseDatumFromOutput()` from `@yoroi/tx`
2. Decode datums using `decodeDatum()` or `decodeDatumToJson()`
3. Format decoded datums using `formatDecodedDatum()` for display
4. Add datum information to `FormattedOutput` during transaction formatting
5. Create new `DatumTab` component to display decoded datum structures
6. Add conditional tab display when datums are present

**User Value**: Makes smart contract transactions understandable - users can see what data is being sent to contracts

---

### 2. Enhanced Mint/Burn Display

**Current State**: `MintTab` exists but shows basic mint data.

**Enhancements**:
- Use `MintAction` types from `@yoroi/tx` to show mint vs burn actions
- Display policy IDs with script type (native/plutus)
- Show minting script details if available
- Add warnings for unusual mint amounts

**Files to Enhance**:
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Mint/MintTab.tsx` - Use `MintAction` types and display script info

**Implementation Steps**:
1. Parse mint actions from transaction using minting utilities
2. Distinguish between mint (positive) and burn (negative) actions
3. Display policy ID and script type
4. Show script hash if available
5. Add visual indicators for mint vs burn

**User Value**: Better understanding of token creation/destruction operations

---

### 3. Governance Actions Tab ⭐ NEW FEATURE

**Current State**: No governance display currently exists.

**Enhancements**:
- Add a **"Governance" tab** when certificates include governance actions
- Use `addProposal()`, `addVote()` types from `@yoroi/tx` to display:
  - Proposal details (action type, anchor, parameters)
  - Vote details (voter type, vote choice)
  - DRep information
- Show governance action IDs and links to on-chain proposals

**Files to Create**:
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Governance/GovernanceTab.tsx` - Display governance actions
- Update `src/features/ReviewTx/common/types.ts` - Add `governance?: {proposals: Proposal[], votes: Vote[]}` to `FormattedTx`

**Implementation Steps**:
1. Parse governance certificates from transaction
2. Identify proposal and vote certificates
3. Extract governance action details using governance utilities
4. Display proposal information (type, anchor, parameters)
5. Display vote information (voter, choice)
6. Add conditional tab display when governance actions are present

**User Value**: Users can review governance proposals and votes before signing

---

### 4. Transaction Chaining Visualization

**Current State**: No chain relationship display.

**Enhancements**:
- Detect chained transactions using `detectReferenceScript()` and chaining utilities from `@yoroi/tx`
- Show a **"Chain" indicator** when inputs reference unconfirmed transactions
- Display chain order using `getSubmissionOrder()`
- Warn if chain validation fails using `validateChain()`

**Files to Enhance**:
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab.tsx` - Add chain indicator/warning
- `src/features/ReviewTx/common/types.ts` - Add `chainInfo?: {isChained: boolean, chainOrder?: number}` to `FormattedTx`

**Implementation Steps**:
1. Detect chained inputs using chaining utilities
2. Validate chain using `validateChain()`
3. Get submission order using `getSubmissionOrder()`
4. Display chain information in overview tab
5. Show warnings if chain validation fails

**User Value**: Users understand transaction dependencies and submission order

---

### 5. Reference Script Details

**Current State**: Reference inputs tab exists but shows basic info.

**Enhancements**:
- Use `detectReferenceScript()`, `findReferenceScripts()` from `@yoroi/tx` to show:
  - Script type (native/plutus)
  - Script hash and size
  - Policy ID if used for minting
- Display estimated script fees using `estimateReferenceScriptFee()`
- Show execution units if available

**Files to Enhance**:
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/ReferenceInputs/ReferenceInputs.tsx` - Add script details section
- `src/features/ReviewTx/common/types.ts` - Add `referenceScript?: ReferenceScript` to `FormattedInput`

**Implementation Steps**:
1. Detect reference scripts in reference inputs
2. Extract script information (type, hash, size)
3. Calculate estimated fees using `estimateReferenceScriptFee()`
4. Display script details in reference inputs tab
5. Show policy ID if script is used for minting

**User Value**: Users understand what scripts are being referenced and their costs

---

### 6. CIP-30 Validation Warnings

**Current State**: No validation display in review.

**Enhancements**:
- Use `validateTransactionCbor()` from `@yoroi/tx` to show:
  - Validation errors before signing
  - Warnings (e.g., unusual fees, missing signers)
  - Security indicators
- Display `CIP30TransactionError` details if validation fails

**Files to Enhance**:
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTxScreen.tsx` - Add validation step before showing review
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab.tsx` - Show validation warnings banner

**Implementation Steps**:
1. Validate transaction CBOR using `validateTransactionCbor()` before displaying review
2. Show validation errors as blocking warnings
3. Show validation warnings as informational banners
4. Display security indicators based on validation results

**User Value**: Users catch transaction issues before signing

---

### 7. Smart Contract Interaction Detection

**Current State**: Basic `contractInfo` exists.

**Enhancements**:
- Use datum parsing to detect contract interactions
- Combine with reference scripts to identify contract calls
- Show interaction summary (e.g., "Interacting with DEX contract", "Staking to pool")

**Files to Enhance**:
- `src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab.tsx` - Enhance contract detection logic
- Use `parseDatumFromOutput()` from `@yoroi/tx` to detect contract interactions

**Implementation Steps**:
1. Parse datums from outputs
2. Detect reference scripts
3. Combine information to identify contract interactions
4. Display interaction summary in overview tab

**User Value**: Users understand what contracts they're interacting with

---

## Implementation Priority

### High Priority
1. **Datum Display** - Most user value, makes smart contract transactions understandable
2. **Governance Tab** - New feature, important for governance participation

### Medium Priority
3. **Enhanced Mint/Burn Display** - Improves existing feature
4. **Reference Script Details** - Enhances existing tab
5. **CIP-30 Validation Warnings** - Security improvement

### Low Priority
6. **Transaction Chaining Visualization** - Nice to have, less common use case
7. **Smart Contract Interaction Detection** - Enhancement to existing feature

---

## Technical Considerations

### Type Updates Required

```typescript
// src/features/ReviewTx/common/types.ts

export type FormattedOutput = {
  // ... existing fields
  datum?: {
    type: 'hash' | 'inline' | 'embedded'
    decoded?: DecodedDatum
    json?: JsonValue
  }
  referenceScript?: ReferenceScript
}

export type FormattedTx = {
  // ... existing fields
  governance?: {
    proposals: Proposal[]
    votes: Vote[]
  }
  chainInfo?: {
    isChained: boolean
    chainOrder?: number
    validationResult?: ChainValidationResult
  }
}

export type FormattedInput = {
  // ... existing fields
  referenceScript?: ReferenceScript
}
```

### Integration Points

- **Datum Parsing**: Use `parseDatumFromOutput()` from `@yoroi/tx/datum/parsing`
- **Datum Decoding**: Use `decodeDatum()`, `decodeDatumToJson()` from `@yoroi/tx/datum/decoding`
- **Governance**: Use `validateProposal()`, `validateVote()` from `@yoroi/tx/governance`
- **Chaining**: Use `validateChain()`, `getSubmissionOrder()` from `@yoroi/tx/chaining`
- **Reference Scripts**: Use `detectReferenceScript()` from `@yoroi/tx/scripts/reference`
- **CIP-30**: Use `validateTransactionCbor()` from `@yoroi/tx/cip30/validation`

### Performance Considerations

- Datum decoding can be expensive - consider lazy loading or caching
- Governance parsing should happen during transaction formatting
- Chain validation should be done once and cached

---

## Success Metrics

- **Datum Display**: 90% of smart contract transactions show decoded datum
- **User Understanding**: Users can identify contract interactions without technical knowledge
- **Governance Participation**: Users can review proposals/votes before signing
- **Security**: Validation warnings prevent signing of invalid transactions

---

## Future Enhancements (Phase 2)

Once backend script evaluation is available:
- Show actual execution units (not just estimates)
- Display script evaluation results
- Show accurate script fees
- Validate script execution before signing

