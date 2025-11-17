# Backend Requirements: Phase 2 & Additional Features

## Executive Summary

This document outlines backend API requirements for:
1. **Phase 2 Features**: Script evaluation and transaction chaining (original scope)
2. **Governance Features**: Proposal and vote discovery for DRep voting functionality
3. **Missing Implementation**: Token price history endpoint (currently broken)
4. **UTXO Format Enhancement**: Additional data for CIP-30 and script evaluation

**Priority Items**:
- **CRITICAL**: Token price history endpoint (`POST /tokens/history/price`) - never implemented, breaks portfolio charts
- **HIGH**: Governance action discovery endpoints - needed for DRep voting feature
- **MEDIUM**: UTXO format enhancements - improves CIP-30 and script evaluation

**Timeline**: Governance and price history endpoints are blockers for user-facing features. UTXO enhancements can be phased.

---

## Overview

This document specifies the backend API requirements needed to support Phase 2 features (script evaluation), governance features (DRep voting), and improvements to existing endpoints.

## Current Backend API

### Existing Endpoints

```typescript
interface Api.Cardano.Api {
  getProtocolParams(): Promise<ProtocolParams>
  getBestBlock(): Promise<BestBlock>
  getUtxoData(request: UtxoDataRequest): Promise<UtxoData>
}
```

## Required New Endpoints

### 1. Script Evaluation Endpoint

**Purpose**: Evaluate Plutus scripts to calculate execution units and validate script execution.

**Endpoint**: `POST /api/v1/transactions/evaluate`

**Request**:
```typescript
interface EvaluateTransactionRequest {
  // Transaction CBOR hex (unsigned transaction body)
  transactionHex: string
  
  // UTXOs referenced in the transaction (for evaluation context)
  utxos: Array<{
    txHash: string
    txIndex: number
    address: string
    amount: string
    assets?: Array<{
      assetId: string
      amount: string
    }>
    datumHash?: string
    datum?: string // Inline datum
    scriptRef?: string // Reference script CBOR
  }>
  
  // Chained transactions (unconfirmed transactions referenced by this transaction)
  chainedTransactions?: string[] // Array of transaction CBOR hex strings
  
  // Network identifier
  network: 'mainnet' | 'preprod' | 'preview'
}
```

**Response**:
```typescript
interface EvaluateTransactionResponse {
  // Execution units for each redeemer
  redeemers: Array<{
    tag: 'SPEND' | 'MINT' | 'CERT' | 'REWARD' | 'VOTE'
    index: number
    executionUnits: {
      memory: string // Memory units as string (bigint)
      steps: string // CPU steps as string (bigint)
    }
  }>
  
  // Script integrity hash (if scripts are present)
  scriptIntegrityHash?: string
  
  // Validation result
  valid: boolean
  
  // Error details if validation failed
  error?: {
    message: string
    redeemerIndex?: number
    scriptHash?: string
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid transaction format
- `422 Unprocessable Entity`: Script evaluation failed
- `500 Internal Server Error`: Evaluation service error

**Implementation Notes**:
- Backend should use Ogmios, Blockfrost, or similar evaluation service
- Evaluation should use current protocol parameters
- Should support all Plutus script versions (V1, V2, V3)
- Should handle reference scripts correctly
- Should support chained transaction evaluation

---

### 2. Reference Script Discovery Endpoint (Optional Enhancement)

**Purpose**: Find UTXOs containing specific reference scripts on-chain.

**Endpoint**: `GET /api/v1/utxos/reference-scripts`

**Request**:
```typescript
interface FindReferenceScriptsRequest {
  scriptHash: string // Script hash to search for
  network: 'mainnet' | 'preprod' | 'preview'
  limit?: number // Maximum results to return (default: 10)
}
```

**Response**:
```typescript
interface ReferenceScriptResponse {
  utxos: Array<{
    txHash: string
    txIndex: number
    address: string
    scriptRef: string // Script CBOR hex
    scriptHash: string
    scriptSize: number // Size in bytes
  }>
}
```

**Note**: This is optional - wallet can also search UTXOs via existing `getUtxoData` endpoint, but a dedicated endpoint would be more efficient.

---

### 3. Transaction Chain Validation Endpoint (Optional Enhancement)

**Purpose**: Validate that a chain of transactions can be executed in sequence.

**Endpoint**: `POST /api/v1/transactions/validate-chain`

**Request**:
```typescript
interface ValidateChainRequest {
  transactions: Array<{
    transactionHex: string
    dependsOn?: string // Transaction ID this depends on
  }>
  network: 'mainnet' | 'preprod' | 'preview'
}
```

**Response**:
```typescript
interface ValidateChainResponse {
  valid: boolean
  transactions: Array<{
    transactionId: string
    valid: boolean
    evaluation?: EvaluateTransactionResponse
    errors?: string[]
  }>
  totalFees: string
  warnings?: string[]
}
```

**Note**: This is optional - wallet can validate chains locally, but backend validation provides additional assurance.

---

## Implementation Recommendations

### Evaluation Service Integration

**Recommended Approach**:
1. Backend integrates with Ogmios evaluation service (preferred) or Blockfrost
2. Backend acts as proxy/wrapper around evaluation service
3. Backend handles error translation and response formatting
4. Backend caches protocol parameters for efficiency

**Alternative Approach**:
- Direct integration with Cardano node evaluation endpoint
- Requires running Cardano node infrastructure

### Error Handling

**Standardized Error Format**:
```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

**Error Codes**:
- `INVALID_TRANSACTION`: Transaction format is invalid
- `SCRIPT_EVALUATION_FAILED`: Script execution failed
- `INSUFFICIENT_EXECUTION_UNITS`: Execution units exceed limits
- `MISSING_UTXO`: Required UTXO not found
- `EVALUATION_SERVICE_ERROR`: Evaluation service unavailable

### Performance Considerations

- **Caching**: Cache protocol parameters (update per epoch)
- **Timeout**: Set reasonable timeout for evaluation (30-60 seconds)
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Batch Support**: Consider batch evaluation endpoint for multiple transactions

### Security Considerations

- Validate transaction format before evaluation
- Limit transaction size to prevent DoS
- Rate limit requests per user/IP
- Validate network parameter matches backend configuration

---

## Testing Requirements

### Test Cases

1. **Basic Script Evaluation**
   - Simple Plutus V2 script
   - Multiple redeemers
   - Reference scripts

2. **Chained Transactions**
   - Two transactions where second references first
   - Validation of dependency chain

3. **Error Cases**
   - Invalid transaction format
   - Script execution failure
   - Missing UTXO
   - Execution units exceed limits

4. **Edge Cases**
   - Large transactions
   - Many redeemers
   - Complex script interactions

---

## Migration Path

### Phase 1: Basic Evaluation Endpoint
- Implement `/api/v1/transactions/evaluate`
- Support single transaction evaluation
- Basic error handling

### Phase 2: Enhanced Features
- Add chained transaction support
- Add reference script discovery
- Add caching and optimization

### Phase 3: Advanced Features
- Batch evaluation
- Advanced error reporting
- Performance optimizations

---

## Dependencies

### External Services Required

1. **Script Evaluation Service**:
   - Ogmios (recommended) - WebSocket-based evaluation
   - Blockfrost - REST API evaluation
   - Cardano Node - Direct node evaluation

2. **Blockchain Data**:
   - UTXO data (already available via `getUtxoData`)
   - Protocol parameters (already available via `getProtocolParams`)

---

## API Versioning

- Use versioned endpoints: `/api/v1/...`
- Maintain backward compatibility
- Document breaking changes

---

## Documentation Requirements

- API endpoint documentation
- Request/response examples
- Error code reference
- Rate limiting documentation
- Integration examples

---

## Timeline Estimate

- **Basic Evaluation Endpoint**: 2-3 weeks
- **Chained Transaction Support**: 1 week
- **Reference Script Discovery**: 1 week
- **Testing & Documentation**: 1 week

**Total**: ~5-6 weeks for complete Phase 2 backend support

---

## Additional Required Endpoints

### 1. Token Price History Endpoint (CRITICAL - Missing Implementation)

**Status**: Endpoint was planned but never implemented. Currently breaks chart functionality for all non-primary tokens.

**Question for Backend Team**: 
**Is this endpoint planned for implementation?** If not, or if implementation is significantly delayed, we will explore alternative solutions using swap aggregator APIs (e.g., Minswap, SundaeSwap, WingRiders APIs) to fetch historical price data directly from DEX sources.

**Endpoint**: `POST /tokens/history/price`

**Request**:
```typescript
interface TokenHistoryRequest {
  tokenId: string // Portfolio.Token.Id format (e.g., "policyId.assetNameHex")
  period: '1d' | '1w' | '1m' | '6m' | '1y' | 'all'
}
```

**Response**:
```typescript
interface TokenHistoryResponse {
  prices: Array<{
    ts: number // Timestamp in milliseconds
    open: string // Opening price (BigNumber string)
    close: string // Closing price (BigNumber string)
    low: string // Low price (BigNumber string)
    high: string // High price (BigNumber string)
    change: number // Percentage change
  }>
}
```

**Current Endpoints**:
- Mainnet: `https://zero.yoroiwallet.com/tokens/history/price`
- Preprod: `https://yoroi-backend-zero-preprod.emurgornd.com/tokens/history/price`
- Preview: `https://yoroi-backend-zero-preview.emurgornd.com/tokens/history/price`

**Implementation Notes**:
- Return price data in primary token (ADA) terms
- Aggregate prices based on period (hourly for 1d, daily for 1w, etc.)
- Empty array `{prices: []}` acceptable if no data available

---

### 2. Governance Action Discovery Endpoint

**Purpose**: List active governance actions (proposals) that DReps can vote on.

**Endpoint**: `GET /api/v1/governance/actions`

**Request**:
```typescript
interface GetGovernanceActionsRequest {
  network: 'mainnet' | 'preprod' | 'preview'
  status?: 'active' | 'passed' | 'rejected' | 'expired'
  type?: 'parameterChange' | 'hardFork' | 'treasuryWithdrawal' | 'infoAction'
  epoch?: number
  limit?: number // Default: 50
  offset?: number
}
```

**Response**:
```typescript
interface GovernanceActionsResponse {
  actions: Array<{
    actionId: {txHash: string; txIndex: number}
    type: 'parameterChange' | 'hardFork' | 'treasuryWithdrawal' | 'infoAction'
    status: 'active' | 'passed' | 'rejected' | 'expired'
    deposit: string
    rewardAccount: string
    anchor?: {url: string; hash: string}
    parameters?: Record<string, unknown>
    submittedEpoch: number
    expiresEpoch?: number
    votingResults?: {yes: string; no: string; abstain: string}
  }>
  total: number
  limit: number
  offset: number
}
```

---

### 3. Governance Action Details Endpoint

**Purpose**: Get detailed information about a specific governance action including all votes.

**Endpoint**: `GET /api/v1/governance/actions/:txHash/:txIndex`

**Response**:
```typescript
interface GovernanceActionDetailsResponse {
  actionId: {txHash: string; txIndex: number}
  type: 'parameterChange' | 'hardFork' | 'treasuryWithdrawal' | 'infoAction'
  status: 'active' | 'passed' | 'rejected' | 'expired'
  deposit: string
  rewardAccount: string
  anchor?: {url: string; hash: string}
  parameters: Record<string, unknown>
  submittedEpoch: number
  expiresEpoch?: number
  votingResults: {yes: string; no: string; abstain: string}
  votes: Array<{
    voter: {type: 'drep' | 'pool' | 'committee'; credential: string}
    vote: 'yes' | 'no' | 'abstain'
    votingPower: string
    txHash: string
    epoch: number
    slot: number
  }>
}
```

---

### 4. Vote Discovery Endpoint

**Purpose**: List votes cast by a specific DRep, stake pool, or on a specific governance action.

**Endpoint**: `GET /api/v1/governance/votes`

**Request**:
```typescript
interface GetVotesRequest {
  network: 'mainnet' | 'preprod' | 'preview'
  actionId?: {txHash: string; txIndex: number}
  voter?: {type: 'drep' | 'pool' | 'committee'; credential: string}
  epoch?: number
  limit?: number
  offset?: number
}
```

**Response**:
```typescript
interface VotesResponse {
  votes: Array<{
    actionId: {txHash: string; txIndex: number}
    voter: {type: 'drep' | 'pool' | 'committee'; credential: string}
    vote: 'yes' | 'no' | 'abstain'
    votingPower: string
    anchor?: {url: string; hash: string}
    txHash: string
    epoch: number
    slot: number
  }>
  total: number
  limit: number
  offset: number
}
```

---

### 5. DRep Information Endpoint (Enhanced)

**Purpose**: Get comprehensive DRep information including voting power, history, and statistics.

**Endpoint**: `GET /api/v1/governance/dreps/:drepId`

**Response**:
```typescript
interface DRepInfoResponse {
  drepId: string
  credential: {type: 'key' | 'script'; hash: string}
  registration: {
    tx: string
    epoch: number
    slot: number
    deposit: string
    anchor?: {url: string; hash: string}
  }
  deregistration?: {tx: string; epoch: number; slot: number}
  votingPower: string
  delegations: {count: number; totalStake: string}
  votingHistory: {
    totalVotes: number
    activeVotes: number
    passedVotes: number
    rejectedVotes: number
  }
  recentVotes?: Array<{
    actionId: {txHash: string; txIndex: number}
    vote: 'yes' | 'no' | 'abstain'
    epoch: number
  }>
}
```

---

### 6. DRep List Endpoint

**Purpose**: List all registered DReps with basic information.

**Endpoint**: `GET /api/v1/governance/dreps`

**Request**:
```typescript
interface GetDRepsRequest {
  network: 'mainnet' | 'preprod' | 'preview'
  sortBy?: 'votingPower' | 'registrationEpoch' | 'name'
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
```

**Response**:
```typescript
interface DRepsListResponse {
  dreps: Array<{
    drepId: string
    credential: {type: 'key' | 'script'; hash: string}
    votingPower: string
    delegations: {count: number; totalStake: string}
    registration: {epoch: number; anchor?: {url: string}}
  }>
  total: number
  limit: number
  offset: number
}
```

---

### 7. Stake Pool Governance Participation Endpoint

**Purpose**: Get governance participation data for stake pools.

**Endpoint**: `GET /api/v1/governance/pools/:poolId`

**Response**:
```typescript
interface PoolGovernanceResponse {
  poolId: string
  votingHistory?: Array<{
    actionId: {txHash: string; txIndex: number}
    vote: 'yes' | 'no' | 'abstain'
    votingPower: string
    epoch: number
  }>
  drepDelegation?: {drepId: string; tx: string; epoch: number}
  totalVotes: number
}
```

---

### 8. Governance Statistics Endpoint

**Purpose**: Get overall governance statistics for the network.

**Endpoint**: `GET /api/v1/governance/stats`

**Response**:
```typescript
interface GovernanceStatsResponse {
  currentEpoch: number
  activeActions: number
  totalDReps: number
  totalVotingPower: string
  participationRate: string
  recentActions: Array<{
    actionId: {txHash: string; txIndex: number}
    type: string
    status: string
    submittedEpoch: number
  }>
}
```

---

### 9. UTXO Format Enhancement

**Purpose**: Improve UTXO data format to include missing information (inline datum data, reference scripts).

**Current Issue**: `RawUtxo` is not actually "raw" - it's preprocessed by backend. Missing:
- Inline datum PlutusData (only hash provided)
- Reference script information
- Datum type indication (hash vs inline)
- Optional raw CBOR for verification/efficiency

**Endpoint**: `GET /api/v1/utxos/:txHash/:txIndex` (enhance existing)

**Enhanced Response**:
```typescript
interface EnhancedUtxoData {
  output: {
    address: string
    amount: string
    assets: Array<ApiUtxoDataAsset>
    datum?: {
      type: 'hash' | 'inline'
      hash: string
      data?: string // PlutusData hex (if inline datum)
    }
    referenceScript?: {
      type: 'native' | 'plutus'
      hash: string
      cbor: string // Script CBOR hex
      size: number
    }
  }
  spendingTxHash: string | null
  cbor?: string // Optional: TransactionUnspentOutput CBOR hex
}
```

**Benefits**:
- CIP-30 `getUtxos()` can return CSL objects directly without reconstruction
- Script evaluation has complete UTXO data
- Transaction building has all required information

---

## Implementation Notes

### Governance APIs
- Data sources: Governance actions in transaction metadata/certificates, votes in metadata
- Update frequency: Per epoch is sufficient (no real-time needed)
- Voting power: Calculated from stake delegations
- Caching: Cache governance action lists and DRep info (update per epoch)

### Token Price History
- Price data source: TBD (DEX aggregator, oracle, exchange APIs)
- Price calculation: In primary token (ADA) terms
- Update frequency: TBD (hourly or per block sufficient)

### UTXO Format
- Performance: Consider making raw CBOR optional via query parameter
- Backward compatibility: Existing fields remain unchanged

---

## Questions for Backend Team

### Token Price History (Priority)
1. **Is `POST /tokens/history/price` planned for implementation?** If not, we'll use swap aggregator APIs.
2. What price data source will be used? (DEX aggregator, oracle, exchange APIs)
3. What's the estimated timeline for implementation?

### Governance APIs
4. What data source will be used for governance actions? (Cardano node, indexer, custom indexer)
5. Should voting power calculations include pending delegations or only confirmed?
6. How should we handle governance action expiration and status transitions?

### UTXO Format
7. Can we add inline datum data to UTXO responses? (currently only hash provided)
8. Can we add reference script information to UTXO responses?
9. Should we provide raw CBOR hex for UTXOs? (optional query parameter?)

### Phase 2 (Script Evaluation)
10. Which evaluation service should we integrate with? (Ogmios recommended)
11. What rate limiting strategy should we use?
12. Do we need batch evaluation support?

