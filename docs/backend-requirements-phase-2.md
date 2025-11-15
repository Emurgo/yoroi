# Backend Requirements for Phase 2: Script Evaluation & Transaction Chaining

## Overview

This document specifies the backend API requirements needed to support Phase 2 features in the Yoroi wallet. These features require script evaluation capabilities that cannot be performed locally in the wallet.

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

## Questions for Backend Team

1. Which evaluation service should we integrate with? (Ogmios recommended)
2. Do we need to run our own evaluation infrastructure?
3. What are the performance requirements? (response time, throughput)
4. Should we implement caching? (protocol parameters, evaluation results)
5. What rate limiting strategy should we use?
6. Do we need batch evaluation support?
7. Should we support WebSocket for real-time evaluation?

