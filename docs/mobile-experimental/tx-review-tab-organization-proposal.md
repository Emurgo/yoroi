# Transaction Review Tab Organization Proposal

## Overview

This document proposes a reorganization of the transaction review tabs to accommodate all missing CBOR fields while maintaining clarity and avoiding tab overload. The proposal uses accordions within tabs to organize related information.

## Proposed Tab Structure

### 1. **Overview** (Always visible)
**Purpose**: High-level transaction summary for quick review

**Content**:
- Wallet info & fee (current)
- My wallet section (sends/receives) (current)
- External parties section (current)
- Operations summary (current - certificates, withdrawals preview)
- Smart contract interactions summary (current - enhanced)
- Transaction chaining info (current)
- Validation warnings/errors (current)

**New additions**:
- Collateral summary (if present): "X ADA at risk"
- Signatures summary: "Signed by 2 keys" or "Requires 3 signatures"
- Withdrawals summary: "Withdrawing X ADA rewards"

**Rationale**: Keep overview focused on "what's happening" - users can drill down for details

---

### 2. **Assets & UTxOs** (Always visible)
**Purpose**: Detailed view of all assets and UTXOs involved

**Content** (using accordions):
- **Inputs** (current)
  - All input UTXOs with addresses and assets
- **Outputs** (current)
  - All output UTXOs with addresses and assets
- **Reference Inputs** (current - moved here)
  - Reference inputs with scripts
- **Mint** (current - moved here)
  - Token minting information
- **Fee** (current)
  - Transaction fee breakdown

**Rationale**: All asset movement in one place - inputs, outputs, minting, and fees

---

### 3. **Operations** (Conditional - shown if any operations exist)
**Purpose**: Staking, governance, and reward operations

**Content** (using accordions):
- **Certificates** (current)
  - Stake registration/delegation/deregistration
  - Vote delegation
  - Other certificate types
- **Withdrawals** (NEW)
  - Stake reward withdrawals
  - Address, amount for each withdrawal
- **Governance** (current - moved here)
  - Proposals
  - Votes
  - DRep delegations

**Rationale**: All staking/governance operations grouped together

---

### 4. **Smart Contracts** (Conditional - shown if Plutus-related fields exist)
**Purpose**: Plutus transaction details and smart contract interactions

**Content** (using accordions):
- **Collateral** (NEW - High Priority)
  - Collateral inputs (UTXOs at risk)
  - Collateral return output (where collateral goes if successful)
  - Total collateral amount
- **Scripts** (NEW)
  - Script data hash
  - Plutus script witnesses (from witness set)
  - Native script witnesses (from witness set)
- **Datum** (current - moved here)
  - Datum information from outputs
- **Redeemers** (NEW)
  - Plutus data (redeemers) from witness set
  - Decoded redeemer information

**Rationale**: All Plutus/smart contract information in one place - critical for understanding what's at risk

---

### 5. **Signatures** (Conditional - shown if signed transaction or required signers exist)
**Purpose**: Transaction authorization and signing information

**Content** (using accordions):
- **Required Signers** (NEW)
  - List of Ed25519 key hashes that must sign
  - Multi-signature requirements
- **Witnesses** (NEW)
  - **VKey Witnesses**: Actual signatures (public key + signature)
  - **Bootstrap Witnesses**: Byron-era signatures (if present)
  - Show which keys signed vs which are required

**Rationale**: Security-focused tab - users can verify who signed and what's required

---

### 6. **Details** (Conditional - shown if any detail fields exist)
**Purpose**: Technical transaction metadata and raw data

**Content** (using accordions):
- **Timing** (NEW)
  - TTL (Time To Live)
  - Validity Interval Start
- **Network** (NEW)
  - Network ID
- **Metadata** (current - moved here, expanded)
  - Metadata hash
  - All metadata labels (not just 674)
  - Scripts in auxiliary data (if any)
- **CBOR** (current - moved here)
  - Raw CBOR hex

**Rationale**: Technical details for advanced users and debugging

---

## Tab Visibility Logic

```typescript
const showOperationsTab = 
  tx.certificates?.length > 0 || 
  tx.withdrawals?.length > 0 || 
  tx.governance != null

const showSmartContractsTab = 
  tx.collateral != null ||
  tx.collateralReturn != null ||
  tx.totalCollateral != null ||
  tx.scriptDataHash != null ||
  tx.outputs.some(o => o.datum != null) ||
  tx.witnessSet?.plutusScripts?.length > 0 ||
  tx.witnessSet?.plutusData?.length > 0

const showSignaturesTab = 
  tx.requiredSigners?.length > 0 ||
  tx.witnessSet?.vkeys?.length > 0 ||
  tx.witnessSet?.bootstraps?.length > 0 ||
  tx.witnessSet?.nativeScripts?.length > 0

const showDetailsTab = 
  tx.ttl != null ||
  tx.validityIntervalStart != null ||
  tx.networkId != null ||
  formattedMetadata != null ||
  cbor != null
```

---

## Field Mapping

### Overview Tab
- ✅ Wallet info & fee
- ✅ My wallet sends/receives
- ✅ External parties
- ✅ Operations summary (certificates, withdrawals preview)
- ✅ Smart contract interactions summary
- ✅ Transaction chaining
- ✅ Validation warnings/errors
- 🆕 Collateral summary (if present)
- 🆕 Signatures summary
- 🆕 Withdrawals summary

### Assets & UTxOs Tab
- ✅ Inputs (detailed)
- ✅ Outputs (detailed)
- ✅ Reference Inputs (moved from separate tab)
- ✅ Mint (moved from separate tab)
- ✅ Fee (detailed)

### Operations Tab (NEW)
- ✅ Certificates (moved from Overview)
- 🆕 Withdrawals (detailed)
- ✅ Governance (moved from separate tab)

### Smart Contracts Tab (NEW)
- 🆕 Collateral (inputs, return, total)
- 🆕 Scripts (script data hash, plutus scripts, native scripts)
- ✅ Datum (moved from separate tab)
- 🆕 Redeemers (plutus data)

### Signatures Tab (NEW)
- 🆕 Required Signers
- 🆕 Witnesses (VKeys, Bootstrap, Native Scripts)

### Details Tab (NEW)
- 🆕 Timing (TTL, validity interval)
- 🆕 Network (network ID)
- ✅ Metadata (expanded - all labels, scripts)
- ✅ CBOR (moved from separate tab)

---

## Accordion Structure Examples

### Operations Tab Structure
```
Operations Tab
├─ Certificates (Accordion)
│  ├─ Stake Registration
│  ├─ Stake Delegation
│  └─ Vote Delegation
├─ Withdrawals (Accordion)
│  ├─ Withdrawal 1: Address + Amount
│  └─ Withdrawal 2: Address + Amount
└─ Governance (Accordion)
   ├─ Proposals
   └─ Votes
```

### Smart Contracts Tab Structure
```
Smart Contracts Tab
├─ Collateral (Accordion)
│  ├─ Collateral Inputs (list of UTXOs)
│  ├─ Collateral Return (output address + amount)
│  └─ Total Collateral (amount)
├─ Scripts (Accordion)
│  ├─ Script Data Hash
│  ├─ Plutus Scripts (list)
│  └─ Native Scripts (list)
├─ Datum (Accordion)
│  └─ Output datums (current structure)
└─ Redeemers (Accordion)
   └─ Plutus data/redeemers (list)
```

### Signatures Tab Structure
```
Signatures Tab
├─ Required Signers (Accordion)
│  └─ List of Ed25519 key hashes
└─ Witnesses (Accordion)
   ├─ VKey Witnesses (public key + signature)
   ├─ Bootstrap Witnesses (if any)
   └─ Native Script Witnesses (if any)
```

### Details Tab Structure
```
Details Tab
├─ Timing (Accordion)
│  ├─ TTL
│  └─ Validity Interval Start
├─ Network (Accordion)
│  └─ Network ID
├─ Metadata (Accordion)
│  ├─ Metadata Hash
│  ├─ Label 674 (current)
│  ├─ Other Labels (NEW)
│  └─ Scripts in Auxiliary Data (NEW)
└─ CBOR (Accordion)
   └─ Raw CBOR hex
```

---

## Benefits of This Organization

1. **Logical Grouping**: Related fields are together (e.g., all Plutus stuff in Smart Contracts tab)
2. **Progressive Disclosure**: Overview shows summary, tabs show details
3. **Conditional Tabs**: Only show tabs when relevant data exists
4. **Accordion Flexibility**: Can collapse/expand sections within tabs
5. **User Mental Model**: Matches how users think about transactions
   - "What's moving?" → Assets & UTxOs
   - "What actions?" → Operations
   - "What's at risk?" → Smart Contracts
   - "Who authorized?" → Signatures
   - "Technical details?" → Details

---

## Migration Strategy

### Phase 1: Add Missing Fields to Types
- Update `FormattedTx` type with all new fields
- Extract fields in `useFormattedTx.tsx`

### Phase 2: Reorganize Existing Tabs
- Move Reference Inputs to Assets & UTxOs tab
- Move Mint to Assets & UTxOs tab
- Move Governance to Operations tab
- Move Datum to Smart Contracts tab
- Move CBOR to Details tab

### Phase 3: Create New Tabs
- Create Operations tab (withdrawals + moved content)
- Create Smart Contracts tab (collateral + scripts + moved content)
- Create Signatures tab (required signers + witnesses)
- Create Details tab (timing + network + expanded metadata + moved CBOR)

### Phase 4: Enhance Overview
- Add summaries for new fields (collateral, signatures, withdrawals)

---

## Tab Count Summary

**Current**: 8 tabs (1 always visible + 7 conditional)
**Proposed**: 6 tabs (2 always visible + 4 conditional)

**Always Visible**:
1. Overview
2. Assets & UTxOs

**Conditional**:
3. Operations (if certificates/withdrawals/governance exist)
4. Smart Contracts (if Plutus-related fields exist)
5. Signatures (if required signers or witnesses exist)
6. Details (if any detail fields exist)

This reduces tab clutter while ensuring all information is accessible.

---

## Alternative: Fewer Tabs Option

If 6 tabs is still too many, we could combine:

**Option A**: Merge Signatures into Details
- Signatures becomes an accordion in Details tab
- Result: 5 tabs total

**Option B**: Merge Smart Contracts into Assets & UTxOs
- Smart Contracts becomes accordions in Assets & UTxOs
- Result: 5 tabs total

**Recommendation**: Keep 6 tabs as proposed - each serves a distinct user need and the conditional visibility prevents clutter.

