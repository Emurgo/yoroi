# UTXO Service API Documentation

## Overview

The UTXO Service provides a comprehensive functional API for UTXO selection, locked ADA calculations, transfer feasibility analysis, and UTXO reorganization suggestions. It centralizes all UTXO-related logic that was previously scattered across multiple files.

## Key Concepts

### Locked ADA

Locked ADA refers to the minimum ADA amount required to be held in UTXOs that contain native assets (CNT tokens). This is a Cardano protocol requirement - each UTXO containing tokens must have a minimum amount of ADA based on the UTXO size and the `coinsPerUtxoByte` protocol parameter.

- **Current Locked**: The total locked ADA for all UTXOs as they currently exist
- **Dynamic Locked**: The locked ADA after accounting for tokens being sent (excluding UTXOs being spent)
- **Optimized Locked**: The locked ADA if CNT tokens were consolidated into fewer UTXOs

### UTXO Selection Strategies

- **smart** (default): Prefers pure ADA UTXOs, minimizes change complexity
- **largestFirst**: Minimizes UTXO count by selecting largest UTXOs first
- **smallestFirst**: Minimizes change amount by selecting smallest UTXOs first
- **tokenAware**: Optimizes for token consolidation

## API Reference

### `calculateLockedAda`

Calculates locked ADA with current, dynamic, and optimized values.

```typescript
const result = await calculateLockedAda({
  utxos: ModernUtxo[],
  protocolParams: ProtocolParams,
  tokensBeingSent?: Record<Portfolio.Token.Id, Portfolio.Token.Amount>,
  primaryTokenId: Portfolio.Token.Id,
})
```

**Returns**: `LockedAdaResult` with:

- `currentLocked`: Current locked ADA
- `dynamicLocked`: Locked ADA after sending tokens
- `optimizedLocked`: Locked ADA if CNTs were consolidated
- `unlockedBySending`: ADA that would be unlocked
- `optimizationSavings`: Potential savings from consolidation
- `consolidationPlan`: Plan for consolidating UTXOs (if applicable)

### `analyzeTransferFeasibility`

Analyzes whether a transfer is feasible before attempting to build a transaction.

```typescript
const result = await analyzeTransferFeasibility({
  utxos: ModernUtxo[],
  requiredAmounts: Balance.Amounts,
  protocolParams: ProtocolParams,
  primaryTokenId: Portfolio.Token.Id,
  estimatedFee?: bigint,
  changeAddress: string,
})
```

**Returns**: `TransferFeasibilityResult` with:

- `isFeasible`: Whether the transfer can be completed
- `reason`: Explanation if not feasible
- `requiredAda`: Total ADA needed (outputs + fees + change)
- `availableAda`: Spendable ADA after accounting for locked
- `suggestions`: Actionable suggestions to make transfer feasible
- `selectedUtxos`: Recommended UTXO selection
- `estimatedFee`: Estimated transaction fee
- `changeOutputMinAda`: Minimum ADA for change output

### `selectUtxosForTransfer`

Selects UTXOs for a transfer using smart selection strategies.

```typescript
const result = await selectUtxosForTransfer({
  utxos: ModernUtxo[],
  requiredAmounts: Balance.Amounts,
  protocolParams: ProtocolParams,
  primaryTokenId: Portfolio.Token.Id,
  strategy?: UtxoSelectionStrategy,
  estimatedFee?: bigint,
  changeAddress: string,
})
```

**Returns**: `UtxoSelectionResult` with:

- `selectedUtxos`: Selected UTXOs
- `selectionStrategy`: Strategy used
- `totalInputAda`: Total ADA from selected UTXOs
- `totalInputTokens`: Total tokens from selected UTXOs
- `changeOutputTokens`: Tokens that will go to change
- `changeOutputMinAda`: Calculated minimum ADA for change
- `warnings`: Warnings about unexpected tokens in change

### `analyzeReorganizationOpportunities`

Identifies opportunities to reorganize UTXOs to unlock ADA.

```typescript
const result = await analyzeReorganizationOpportunities({
  utxos: ModernUtxo[],
  protocolParams: ProtocolParams,
  primaryTokenId: Portfolio.Token.Id,
  changeAddress: string,
})
```

**Returns**: `ReorganizationResult` with:

- `opportunities`: Array of reorganization opportunities
- `totalPotentialSavings`: Total potential savings from all opportunities

Each opportunity includes:

- `type`: Type of reorganization ('consolidate_cnt', 'merge_small_utxos', etc.)
- `description`: Human-readable description
- `utxosInvolved`: UTXOs that would be affected
- `potentialSavings`: ADA that could be saved
- `estimatedFee`: Estimated fee for reorganization
- `netBenefit`: Net benefit (savings - fee)
- `steps`: Human-readable steps to perform reorganization

### `calculateCntTransferRequirements`

Calculates requirements for transferring CNT tokens.

```typescript
const result = await calculateCntTransferRequirements({
  cntTokenId: Portfolio.Token.Id,
  cntAmount: Portfolio.Token.Amount,
  utxos: ModernUtxo[],
  protocolParams: ProtocolParams,
  primaryTokenId: Portfolio.Token.Id,
  changeAddress: string,
})
```

**Returns**: `CntTransferResult` with:

- `requiredAda`: ADA that must be included with CNT
- `automaticAdaAdded`: ADA automatically added to meet min UTXO
- `utxosContainingCnt`: UTXOs containing the CNT token
- `willUnlockAda`: ADA unlocked by sending CNT
- `explanation`: Human-readable explanation

## Usage Examples

### Checking Transfer Feasibility

```typescript
import {analyzeTransferFeasibility} from '@yoroi/cardano-wallet'

const feasibility = await analyzeTransferFeasibility({
  utxos: walletUtxos,
  requiredAmounts: {
    '.': '5000000', // 5 ADA
    'token123': '1000',
  },
  protocolParams: wallet.protocolParams,
  primaryTokenId: '.',
  changeAddress: wallet.changeAddress,
})

if (!feasibility.isFeasible) {
  console.log('Transfer not feasible:', feasibility.reason)
  feasibility.suggestions.forEach((suggestion) => {
    console.log('-', suggestion)
  })
}
```

### Calculating Locked ADA

```typescript
import {calculateLockedAda} from '@yoroi/cardano-wallet'

const lockedAda = await calculateLockedAda({
  utxos: walletUtxos,
  protocolParams: wallet.protocolParams,
  tokensBeingSent: {
    token123: {info: tokenInfo, quantity: BigInt('1000')},
  },
  primaryTokenId: '.',
})

console.log('Current locked:', lockedAda.currentLocked)
console.log('Will unlock:', lockedAda.unlockedBySending)
if (lockedAda.consolidationPlan) {
  console.log('Consolidation savings:', lockedAda.optimizationSavings)
}
```

### Finding Reorganization Opportunities

```typescript
import {analyzeReorganizationOpportunities} from '@yoroi/cardano-wallet'

const opportunities = await analyzeReorganizationOpportunities({
  utxos: walletUtxos,
  protocolParams: wallet.protocolParams,
  primaryTokenId: '.',
  changeAddress: wallet.changeAddress,
})

opportunities.opportunities.forEach((opp) => {
  if (opp.netBenefit > 0) {
    console.log(opp.description)
    console.log(`Net benefit: ${opp.netBenefit} ADA`)
  }
})
```

## Error Handling

All functions throw typed errors that include suggestions:

- `InsufficientAdaError`: Not enough spendable ADA
- `InsufficientTokensError`: Not enough tokens
- `UtxoSelectionFailedError`: Could not select appropriate UTXOs
- `ChangeOutputError`: Change output would violate min UTXO
- `FeeEstimationError`: Could not estimate fees

Each error includes:

- `code`: Machine-readable error code
- `message`: User-friendly message
- `suggestions`: Actionable suggestions
- `details`: Technical details for debugging

## Performance Considerations

- Locked ADA calculations use CSL (Cardano Serialization Library) which can be expensive
- Results are cached when possible (see `useDynamicLockedDeposit` hook)
- UTXO selection is optimized to minimize CSL calls
- Reorganization analysis uses heuristics to avoid expensive calculations

## Migration Notes

The service wraps existing functions from `assetUtils.ts` and `helpers.ts` to provide a cleaner API. The underlying implementations remain unchanged for backward compatibility.
