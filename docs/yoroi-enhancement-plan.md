# Yoroi Enhancement Plan: Enhanced Transaction Features

## Executive Summary

This plan outlines how to enhance Yoroi wallet with advanced Cardano transaction features implemented in Yoroi's functional, immutable style. The plan covers 9 major feature areas with in-depth explanations, creative wallet use cases, and implementation strategies.

## Implementation Principles

**Constraints**:
- **Phase 1**: No backend changes required - all features must work with existing Yoroi backend API
- **Phase 2**: Backend changes allowed - see "Backend Requirements Document" for specifications
- No third-party provider dependencies
- Maintain CIP-30 compatibility (cannot break existing dApp integrations - must return CSL types)

---

## 1. Reference Scripts, Script Evaluation & Automatic Redeemer Execution Unit Calculation

### In-Depth Explanation

#### Reference Scripts (CIP-33)

**What They Are**:
Reference scripts allow Plutus scripts to be stored on-chain in UTXO outputs rather than included in every transaction. This dramatically reduces transaction size and fees.

**How They Work**:
1. **Script Storage**: A script is attached to a UTXO output as a "reference script"
2. **Script Reference**: Transactions reference the UTXO containing the script instead of including the script code
3. **Fee Reduction**: Only the reference UTXO location is included (small), not the entire script (large)
4. **Reusability**: Multiple transactions can reference the same script UTXO

**Types**:
- **Inline Reference**: Script stored in a UTXO that's also spent in the transaction
- **Read-Only Reference**: Script stored in a UTXO that's only referenced (not spent)

#### Script Evaluation

**What It Is**:
Script evaluation runs Plutus scripts to determine:
- Whether the script validates successfully
- Execution units (memory and CPU steps) required
- Script integrity hash

**How It Works**:
1. Transaction is serialized to hex
2. Script evaluator (requires backend - Ogmios, Blockfrost, etc.) runs the script
3. Returns execution units for each redeemer
4. Execution units are used to calculate script fees

**Local vs Backend Requirements**:
- **Local (Phase 1)**: Can detect reference scripts, calculate reference script fees, validate script format
- **Backend (Phase 2)**: Actual script execution requires evaluation service (Ogmios/Blockfrost)

#### Automatic Redeemer Execution Unit Calculation

**What It Is**:
Automatically calculating the exact execution units needed for redeemers instead of using estimates.

**Benefits**:
- Accurate fee calculation
- Prevents transaction failures due to insufficient execution units
- Optimizes fees (no over-estimation)

**Requirements**:
- **Phase 1**: Can estimate execution units using protocol parameters (rough)
- **Phase 2**: Requires backend evaluation endpoint for accurate calculation

### Creative Wallet Use Cases

#### 1. Smart Contract Transaction Preview
```typescript
// Enhanced transaction review with script evaluation
async function previewSmartContractTx(
  builder: TransactionBuilderState,
  protocolParams: CardanoHaskellConfig
): Promise<TransactionPreview> {
  // Phase 1: Detect reference scripts locally
  const referenceScripts = detectReferenceScripts(builder)
  
  // Phase 1: Estimate fees (rough)
  const estimatedFees = estimateFeesWithScripts(builder, protocolParams)
  
  // Phase 2: Evaluate scripts to get exact execution units (requires backend)
  const evaluation = await evaluateScripts(builder, protocolParams)
  
  // Show user:
  // - Scripts being used (with reference script detection)
  // - Estimated vs exact execution units
  // - Accurate total fees
  // - Script validation status
  return {
    scripts: referenceScripts,
    executionUnits: evaluation,
    estimatedFees,
    validationStatus: 'valid' | 'invalid' | 'unknown'
  }
}
```

#### 2. Reference Script Discovery & Caching
```typescript
// Automatically discover and cache reference scripts
class ReferenceScriptManager {
  // Cache commonly used scripts
  private scriptCache: Map<string, ReferenceScriptInfo>
  
  async discoverReferenceScript(
    policyId: string,
    scriptHash: string
  ): Promise<ReferenceScriptInfo | null> {
    // Search blockchain for UTXOs containing this script
    const utxos = await api.findUtxosWithScript(scriptHash)
    
    if (utxos.length > 0) {
      // Use existing reference script
      return {
        txHash: utxos[0].txHash,
        txIndex: utxos[0].txIndex,
        scriptHash,
        scriptSize: utxos[0].scriptRef.length / 2
      }
    }
    
    return null
  }
  
  // Suggest creating reference script for frequently used scripts
  suggestReferenceScriptCreation(scriptHash: string, usageCount: number) {
    if (usageCount > 5) {
      // Suggest user create a reference script UTXO
      return {
        scriptHash,
        estimatedSavings: calculateFeeSavings(scriptHash, usageCount),
        recommendation: 'Create reference script to save fees'
      }
    }
  }
}
```

#### 3. Script Execution Unit Estimation (Phase 1 - Local)
```typescript
// Estimate execution units locally before building transaction
function estimateExecutionUnits(
  scriptCbor: string,
  redeemer: Redeemer,
  protocolParams: CardanoHaskellConfig
): ExecutionUnits {
  // Rough estimation based on:
  // - Script size
  // - Redeemer size
  // - Protocol parameters
  const scriptSize = scriptCbor.length / 2
  const redeemerSize = estimateRedeemerSize(redeemer)
  
  // Use protocol parameters for rough estimate
  const estimatedMem = scriptSize * protocolParams.scriptExecutionPrices.memory
  const estimatedSteps = scriptSize * protocolParams.scriptExecutionPrices.cpu
  
  // Add safety margin
  return {
    mem: estimatedMem * 1.5, // 50% safety margin
    steps: estimatedSteps * 1.5
  }
}
```

#### 4. Transaction Fee Optimization
```typescript
// Optimize transaction fees using reference scripts
async function optimizeTransactionFees(
  builder: TransactionBuilderState
): Promise<TransactionBuilderState> {
  // Find scripts that could use reference scripts
  const scriptsToOptimize = findScriptsWithoutReferences(builder)
  
  for (const script of scriptsToOptimize) {
    // Try to find existing reference script
    const refScript = await findReferenceScript(script.hash)
    
    if (refScript) {
      // Replace script with reference
      builder = replaceScriptWithReference(builder, script, refScript)
    }
  }
  
  return builder
}
```

### Implementation Plan

**Phase 1: Reference Script Support (Local)**
- Add `ReferenceScript` type to `@yoroi/tx/types`
- Implement `addReferenceScript()` function
- Update `buildTransaction()` to handle reference scripts
- Add reference script detection utilities
- Add reference script fee calculation (local)

**Phase 2: Script Evaluation Integration (Backend Required)**
- Create `ScriptEvaluator` interface
- Implement evaluation via backend API endpoint
- Add evaluation result types
- Integrate with transaction builder
- Add automatic execution unit calculation

**Files to Create/Modify**:
- `mobile/packages/tx/scripts/reference.ts` - Reference script utilities
- `mobile/packages/tx/scripts/evaluation.ts` - Script evaluation (Phase 2)
- `mobile/packages/tx/scripts/execution-units.ts` - Execution unit calculation
- `mobile/packages/tx/types/scripts.ts` - Script-related types

---

## 2. Coin Selection Algorithms

### In-Depth Explanation

**What They Are**:
Algorithms that automatically select UTXOs from a wallet to satisfy transaction requirements (amounts, fees, etc.).

**Why They Matter**:
- **User Experience**: Users don't need to manually select UTXOs
- **Optimization**: Algorithms optimize for various goals (minimize UTXO count, minimize fees, etc.)
- **CIP-2 Compliance**: Standard algorithms ensure interoperability

### Algorithms Available

#### 1. Largest First
- Selects largest UTXOs first
- Good for: Simple payments, minimizing UTXO count
- CIP-2 compliant

#### 2. Keep Relevant
- Keeps UTXOs that match required assets
- Good for: Multi-asset transactions
- CIP-2 compliant

#### 3. Largest First Multi-Asset
- Variant that handles multiple assets
- Good for: Complex token transactions

#### 4. Experimental
- Research-based algorithm
- Good for: Optimal fee/UTXO balance

### Creative Wallet Use Cases

#### 1. Smart UTXO Selection with User Preferences
```typescript
// Coin selection with user preferences
type SelectionStrategy = 
  | 'minimizeUtxoCount'      // Fewer UTXOs (largest first)
  | 'preservePrivacy'        // Use smaller UTXOs first
  | 'optimizeFees'           // Minimize transaction size
  | 'keepAssetsTogether'     // Keep multi-asset UTXOs

function selectUtxos(
  requiredAmounts: Balance.Amounts,
  availableUtxos: ModernUtxo[],
  strategy: SelectionStrategy,
  userPreferences?: {
    excludeUtxos?: string[],
    preferUtxos?: string[],
    maxUtxoCount?: number
  }
): ModernUtxo[] {
  // Apply user preferences first
  let filteredUtxos = filterByPreferences(availableUtxos, userPreferences)
  
  // Apply strategy
  switch (strategy) {
    case 'minimizeUtxoCount':
      return largestFirst(requiredAmounts, filteredUtxos)
    case 'preservePrivacy':
      return smallestFirst(requiredAmounts, filteredUtxos)
    case 'optimizeFees':
      return experimental(requiredAmounts, filteredUtxos)
    case 'keepAssetsTogether':
      return keepRelevant(requiredAmounts, filteredUtxos)
  }
}
```

#### 2. UTXO Selection Preview
```typescript
// Show user which UTXOs will be selected before building
function previewUtxoSelection(
  requiredAmounts: Balance.Amounts,
  strategy: SelectionStrategy
): SelectionPreview {
  const selected = selectUtxos(requiredAmounts, availableUtxos, strategy)
  
  return {
    selectedUtxos: selected,
    totalAmount: sumUtxos(selected),
    estimatedFee: estimateFee(selected),
    utxoCount: selected.length,
    // Show user what will happen
    impact: {
      remainingUtxos: availableUtxos.length - selected.length,
      largestUtxoRemaining: findLargest(availableUtxos.filter(u => !selected.includes(u)))
    }
  }
}
```

### Implementation Plan

**Phase 1: Core Algorithms (Local - No Backend)**
- Implement `largestFirst()` algorithm
- Implement `keepRelevant()` algorithm
- Implement `largestFirstMultiAsset()` algorithm
- Add algorithm types and interfaces

**Phase 2: Integration**
- Add `selectUtxos()` function to `@yoroi/tx`
- Integrate with transaction builder (optional, not automatic)
- Add selection preview utilities

**Phase 3: Advanced Features**
- Add experimental algorithm
- Add selection strategies
- Add batch optimization

**Files to Create**:
- `mobile/packages/tx/utxo-selection/largest-first.ts`
- `mobile/packages/tx/utxo-selection/keep-relevant.ts`
- `mobile/packages/tx/utxo-selection/multi-asset.ts`
- `mobile/packages/tx/utxo-selection/experimental.ts`
- `mobile/packages/tx/utxo-selection/index.ts` - Main API

---

## 3. Governance: Proposals & Voting

### In-Depth Explanation

#### Governance Proposals (CIP-1694)

**What They Are**:
Proposals are governance actions submitted to the Cardano blockchain for voting. They require a deposit and can be voted on by DReps, SPOs, and the Constitutional Committee.

**Types of Proposals**:
- **Parameter Change**: Change protocol parameters
- **Hard Fork**: Initiate a hard fork
- **Treasury Withdrawal**: Withdraw funds from treasury
- **Info Action**: Informational proposals

#### Voting

**What It Is**:
Voting on governance proposals by:
- **DReps** (Delegated Representatives)
- **Staking Pools** (SPOs)
- **Constitutional Committee**

**Vote Types**:
- **Yes**: Approve the proposal
- **No**: Reject the proposal
- **Abstain**: Neutral vote

### Creative Wallet Use Cases

#### 1. Governance Dashboard
```typescript
// Show active proposals and user's voting status
type GovernanceDashboard = {
  activeProposals: Proposal[]
  userVotingPower: {
    asDRep?: bigint,
    asSPO?: bigint,
    asCommittee?: bigint
  }
  votingHistory: Vote[]
  upcomingProposals: Proposal[]
}

async function getGovernanceDashboard(
  wallet: YoroiWallet
): Promise<GovernanceDashboard> {
  // Fetch active proposals (may need backend for data, but transaction building is local)
  const proposals = await api.getActiveProposals()
  
  // Check user's roles
  const dRepKey = await wallet.getDRepKey()
  const poolId = await wallet.getPoolId()
  
  // Get voting history
  const votes = await api.getUserVotes(wallet.addresses)
  
  return {
    activeProposals: proposals,
    userVotingPower: {
      asDRep: dRepKey ? await calculateDRepPower(dRepKey) : undefined,
      asSPO: poolId ? await calculatePoolPower(poolId) : undefined
    },
    votingHistory: votes,
    upcomingProposals: await api.getUpcomingProposals()
  }
}
```

#### 2. Proposal Creation Wizard
```typescript
// Guide users through creating governance proposals
async function createProposal(
  governanceAction: GovernanceAction,
  metadata: ProposalMetadata
): Promise<TransactionBuilderState> {
  let builder = createTransactionBuilder()
  
  // Add proposal
  builder = addProposal(builder, {
    governanceAction,
    anchor: {
      url: metadata.url,
      hash: hashMetadata(metadata)
    },
    rewardAccount: wallet.rewardAddress,
    deposit: VOTING_PROPOSAL_DEPOSIT
  })
  
  // Add required inputs for deposit
  const depositUtxos = selectUtxos(
    { '.': VOTING_PROPOSAL_DEPOSIT },
    availableUtxos,
    'minimizeUtxoCount'
  )
  builder = addInputs(builder, depositUtxos)
  
  return builder
}
```

#### 3. Voting Interface
```typescript
// Easy voting interface
async function voteOnProposal(
  proposalId: RefTxIn,
  vote: 'yes' | 'no' | 'abstain',
  voterType: 'drep' | 'pool' | 'committee'
): Promise<TransactionBuilderState> {
  let builder = createTransactionBuilder()
  
  // Get voter information
  const voter = await getVoterInfo(voterType)
  
  // Add vote
  builder = addVote(builder, {
    voter,
    govActionId: proposalId,
    votingProcedure: {
      vote: vote === 'yes' ? 'VoteYes' : vote === 'no' ? 'VoteNo' : 'VoteAbstain',
      anchor: undefined // Optional anchor
    }
  })
  
  return builder
}
```

### Implementation Plan

**Phase 1: Basic Governance Types (Local)**
- Add `GovernanceAction` type
- Add `Proposal` type
- Add `Vote` type
- Add `Voter` type (DRep, SPO, Committee)

**Phase 2: Proposal Building (Local)**
- Implement `addProposal()` function
- Add proposal metadata handling
- Add deposit calculation

**Phase 3: Voting (Local)**
- Implement `addVote()` function
- Add voter identification
- Add voting procedure handling

**Phase 4: Governance UI Integration**
- Create governance dashboard components
- Add proposal creation wizard
- Add voting interface

**Files to Create**:
- `mobile/packages/tx/governance/types.ts`
- `mobile/packages/tx/governance/proposals.ts`
- `mobile/packages/tx/governance/voting.ts`
- `mobile/packages/tx/governance/index.ts`

---

## 4. Minting & Burning

### In-Depth Explanation

#### Minting

**What It Is**:
Creating new native assets (tokens) on Cardano. Requires a minting policy script that controls:
- Who can mint
- When minting is allowed
- How much can be minted

**Types**:
- **Native Script Minting**: Simple time-locked scripts
- **Plutus Script Minting**: Complex logic (V1/V2/V3)

**Process**:
1. Create minting policy script
2. Get policy ID (hash of script)
3. Build transaction with mint action
4. Include redeemer (if Plutus)
5. Sign with policy key (if Native)

#### Burning

**What It Is**:
Destroying native assets by minting negative quantities. Same process as minting but with negative amounts.

**Use Cases**:
- Token buybacks
- Deflationary mechanisms
- Error correction

### Creative Wallet Use Cases

#### 1. Token Creation Wizard
```typescript
// Guide users through creating tokens
async function createToken(
  name: string,
  amount: string,
  decimals: number,
  metadata?: TokenMetadata
): Promise<{
  policyId: string,
  assetName: string,
  transaction: TransactionBuilderState
}> {
  // Generate minting policy
  const policy = createMintingPolicy({
    type: 'native', // or 'plutus'
    beforeSlot?: number, // Time-lock
    afterSlot?: number
  })
  
  const policyId = hashPolicy(policy)
  const assetName = encodeAssetName(name)
  
  // Build minting transaction
  let builder = createTransactionBuilder()
  builder = addMint(builder, {
    policyId,
    assetName,
    amount,
    script: policy
  })
  
  // Add metadata if provided
  if (metadata) {
    builder = addMetadata(builder, '721', {
      [policyId]: {
        [assetName]: metadata
      }
    })
  }
  
  return {
    policyId,
    assetName,
    transaction: builder
  }
}
```

#### 2. Token Management Dashboard
```typescript
// Manage user's minted tokens
type TokenManagement = {
  mintedTokens: MintedToken[]
  mintingPolicies: MintingPolicy[]
  burnableTokens: Token[]
}

async function getTokenManagement(wallet: YoroiWallet): Promise<TokenManagement> {
  // Find all tokens minted by this wallet
  const mintedTokens = await findMintedTokens(wallet.addresses)
  
  // Get minting policies
  const policies = await getMintingPolicies(mintedTokens)
  
  // Find tokens that can be burned (user has minting rights)
  const burnable = await findBurnableTokens(wallet, policies)
  
  return {
    mintedTokens,
    mintingPolicies: policies,
    burnableTokens: burnable
  }
}
```

#### 3. Batch Minting
```typescript
// Mint multiple tokens in one transaction
async function batchMint(
  mints: Array<{
    policyId: string,
    assetName: string,
    amount: string
  }>
): Promise<TransactionBuilderState> {
  let builder = createTransactionBuilder()
  
  // Group by policy ID (same policy = same redeemer)
  const grouped = groupByPolicyId(mints)
  
  for (const [policyId, assets] of grouped) {
    const policy = await getMintingPolicy(policyId)
    
    builder = addMint(builder, {
      policyId,
      assets, // Multiple assets with same policy
      script: policy,
      redeemer: createRedeemer(assets) // Single redeemer for all
    })
  }
  
  return builder
}
```

#### 4. Token Burning Interface
```typescript
// Burn tokens with confirmation
async function burnTokens(
  tokenId: Portfolio.Token.Id,
  amount: Balance.Quantity
): Promise<TransactionBuilderState> {
  // Verify user has minting rights
  const canBurn = await verifyBurnRights(tokenId, wallet)
  if (!canBurn) {
    throw new Error('Cannot burn: No minting rights')
  }
  
  // Get policy and asset info
  const { policyId, assetName } = parseTokenId(tokenId)
  const policy = await getMintingPolicy(policyId)
  
  // Build burn transaction (negative mint)
  let builder = createTransactionBuilder()
  builder = addMint(builder, {
    policyId,
    assetName,
    amount: `-${amount}`, // Negative amount = burn
    script: policy
  })
  
  return builder
}
```

### Implementation Plan

**Phase 1: Basic Minting (Local)**
- Add `Mint` type
- Implement `addMint()` function
- Support Native and Plutus scripts
- Add minting policy utilities

**Phase 2: Burning**
- Add `burn()` function (negative mint)
- Add burn rights verification
- Add burn confirmation UI

**Phase 3: Advanced Features**
- Batch minting
- Token creation wizard
- Minting policy management

**Files to Create**:
- `mobile/packages/tx/minting/types.ts`
- `mobile/packages/tx/minting/mint.ts`
- `mobile/packages/tx/minting/burn.ts`
- `mobile/packages/tx/minting/policies.ts`
- `mobile/packages/tx/minting/index.ts`

---

## 5. Datum Handling

### In-Depth Explanation

#### What Are Datums?

Datums are data attached to UTXO outputs in Plutus smart contracts. They represent the "state" of a UTXO.

**Types**:
1. **Datum Hash**: Only hash is stored (smaller, requires off-chain storage)
2. **Inline Datum**: Full datum stored on-chain (larger, but always available)
3. **Embedded Datum**: Datum embedded in output (legacy, rarely used)

**Use Cases**:
- Smart contract state
- NFT metadata
- Token metadata
- Contract parameters

### Creative Wallet Use Cases

#### 1. Enhanced Transaction Review for Smart Contracts
```typescript
// Parse and display datum information in transaction review
type EnhancedTxReview = {
  inputs: Array<{
    utxo: ModernUtxo,
    datum?: {
      type: 'hash' | 'inline' | 'embedded',
      data: PlutusData,
      decoded?: any, // Human-readable if possible
      script?: ScriptInfo // If script UTXO
    }
  }>,
  outputs: Array<{
    address: string,
    amounts: Balance.Amounts,
    datum?: {
      type: 'hash' | 'inline',
      data: PlutusData,
      decoded?: any
    }
  }>,
  scripts: ScriptInfo[],
  contractInteractions: ContractInteraction[]
}

async function enhanceTxReview(
  txCbor: string
): Promise<EnhancedTxReview> {
  const tx = deserializeTransaction(txCbor)
  
  // Parse inputs with datum
  const inputs = await Promise.all(
    tx.inputs.map(async (input) => {
      const utxo = await fetchUtxo(input.txHash, input.txIndex)
      const datum = await parseDatum(utxo.datum)
      
      return {
        utxo,
        datum: datum ? {
          type: utxo.datumType,
          data: datum,
          decoded: tryDecodeDatum(datum), // Try to decode to JSON
          script: utxo.scriptRef ? await parseScript(utxo.scriptRef) : undefined
        } : undefined
      }
    })
  )
  
  // Parse outputs with datum
  const outputs = tx.outputs.map(output => ({
    address: output.address,
    amounts: parseAmounts(output.value),
    datum: output.datum ? {
      type: output.datumType,
      data: output.datum,
      decoded: tryDecodeDatum(output.datum)
    } : undefined
  }))
  
  // Detect contract interactions
  const contracts = detectContractInteractions(inputs, outputs)
  
  return {
    inputs,
    outputs,
    scripts: extractScripts(tx),
    contractInteractions: contracts
  }
}
```

#### 2. Datum Decoder Library
```typescript
// Decode common datum formats for display
class DatumDecoder {
  // Decode common formats
  decode(datum: PlutusData): DecodedDatum {
    // Try to decode as common formats
    if (isTokenMetadata(datum)) {
      return decodeTokenMetadata(datum)
    }
    if (isNFTMetadata(datum)) {
      return decodeNFTMetadata(datum)
    }
    if (isContractState(datum)) {
      return decodeContractState(datum)
    }
    
    // Fallback to generic decoding
    return decodeGeneric(datum)
  }
  
  // Human-readable display
  toDisplayString(datum: PlutusData): string {
    const decoded = this.decode(datum)
    return formatDecodedDatum(decoded)
  }
}
```

#### 3. Smart Contract State Viewer
```typescript
// View and track smart contract state via datums
class ContractStateViewer {
  async viewContractState(
    contractAddress: string
  ): Promise<ContractState> {
    // Fetch all UTXOs at contract address
    const utxos = await api.getUtxosAtAddress(contractAddress)
    
    // Parse datums from UTXOs
    const states = utxos.map(utxo => ({
      utxo,
      datum: parseDatum(utxo.datum),
      decoded: decodeDatum(utxo.datum)
    }))
    
    return {
      contractAddress,
      states,
      totalValue: sumUtxos(utxos)
    }
  }
  
  // Track state changes
  async trackStateChanges(
    contractAddress: string,
    callback: (change: StateChange) => void
  ) {
    // Monitor UTXOs at address
    // Notify on state changes
  }
}
```

### Implementation Plan

**Phase 1: Datum Types & Utilities (Local)**
- Add `Datum` type (hash, inline, embedded)
- Add datum parsing utilities
- Add datum encoding/decoding

**Phase 2: Transaction Review Enhancement**
- Integrate datum parsing into transaction review
- Add datum display in UI
- Add contract interaction detection

**Phase 3: Advanced Features**
- Datum decoder library
- Contract state viewer
- Datum validation

**Files to Create**:
- `mobile/packages/tx/datum/types.ts`
- `mobile/packages/tx/datum/parsing.ts`
- `mobile/packages/tx/datum/decoding.ts`
- `mobile/packages/tx/datum/validation.ts`
- `mobile/packages/tx/datum/index.ts`

---

## 6. Transaction Chaining

### In-Depth Explanation

#### What Is Transaction Chaining?

Transaction chaining allows building transactions that reference outputs from other transactions that haven't been confirmed on-chain yet. This enables:
- **Batch Transactions**: Multiple transactions that depend on each other
- **Atomic Operations**: Complex multi-step operations
- **Off-Chain Coordination**: Transactions built off-chain before submission

**How It Works**:
1. Build first transaction (Tx1)
2. Build second transaction (Tx2) that references outputs from Tx1
3. Submit Tx1 first
4. Submit Tx2 after Tx1 confirms (or submit together if supported)

**Use Cases**:
- Complex DeFi operations
- Multi-step swaps
- Batch operations
- Atomic multi-party transactions

### Creative Wallet Use Cases

#### 1. Batch Transaction Builder
```typescript
// Build multiple related transactions
async function buildBatchTransactions(
  operations: TransactionOperation[]
): Promise<ChainedTransaction[]> {
  const transactions: ChainedTransaction[] = []
  
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]
    let builder = createTransactionBuilder()
    
    // Add inputs from previous transaction if chained
    if (i > 0 && operation.chainFromPrevious) {
      const prevTx = transactions[i - 1]
      builder = addChainedInputs(builder, prevTx)
    }
    
    // Build transaction
    builder = buildOperation(builder, operation)
    const unsignedTx = await buildTransaction(builder, protocolParams)
    
    transactions.push({
      transaction: unsignedTx,
      dependsOn: i > 0 ? transactions[i - 1].transaction.id : undefined,
      chainIndex: i
    })
  }
  
  return transactions
}
```

#### 2. Atomic Multi-Step Operations
```typescript
// Build atomic multi-step operations
async function buildAtomicOperation(
  steps: OperationStep[]
): Promise<ChainedTransaction[]> {
  // Build all transactions first
  const transactions = await buildBatchTransactions(steps)
  
  // Validate all transactions are valid
  for (const tx of transactions) {
    await validateTransaction(tx.transaction)
  }
  
  // Return as atomic batch
  return transactions
}
```

#### 3. Transaction Chain Preview
```typescript
// Preview entire transaction chain before submission
async function previewTransactionChain(
  chain: ChainedTransaction[]
): Promise<ChainPreview> {
  return {
    transactions: chain.map(tx => ({
      id: tx.transaction.id,
      inputs: tx.transaction.inputs,
      outputs: tx.transaction.outputs,
      dependsOn: tx.dependsOn,
      estimatedFee: estimateFee(tx.transaction)
    })),
    totalFees: sumFees(chain),
    submissionOrder: chain.map(tx => tx.transaction.id),
    warnings: validateChain(chain)
  }
}
```

### Implementation Plan

**Phase 1: Transaction Chaining (Local - Transaction Building)**
- Add `ChainedTransaction` type
- Add `addChainedInput()` function
- Add chain validation utilities
- Add chain preview functionality

**Phase 2: Chain Evaluation (Backend Required)**
- Backend endpoint for evaluating chained transactions
- Validate unconfirmed transaction references
- Calculate fees for entire chain

**Files to Create**:
- `mobile/packages/tx/chaining/types.ts`
- `mobile/packages/tx/chaining/builder.ts`
- `mobile/packages/tx/chaining/validation.ts`
- `mobile/packages/tx/chaining/index.ts`

---

## 7. Hydra Support

### In-Depth Explanation

#### What Is Hydra?

Hydra is a Layer 2 scaling solution for Cardano that enables:
- **High Throughput**: Thousands of transactions per second
- **Low Latency**: Instant transaction confirmation
- **Zero Fees**: Transactions within Hydra heads are free
- **Isomorphic**: Same transaction format as mainnet

#### How It Works

1. **Head Opening**: Multiple parties commit UTXOs to a Hydra head
2. **Head Operation**: Transactions happen off-chain within the head
3. **Head Closure**: Parties agree to close the head and settle on mainnet

#### Support Extent

**Capabilities**:
- Commit UTXOs to Hydra head
- Build Hydra transactions (zero fees)
- Submit transactions to Hydra head
- Close Hydra head

**Limitations**:
- Requires Hydra infrastructure
- Multi-party coordination needed
- Specialized use case

### Creative Wallet Use Cases

#### 1. Hydra Head Participation
```typescript
// Allow users to participate in Hydra heads
class HydraHeadManager {
  async joinHydraHead(
    headUrl: string,
    utxosToCommit: ModernUtxo[]
  ): Promise<HydraHeadSession> {
    // Connect to Hydra head
    const hydra = new HydraInstance({
      provider: new HydraProvider({ httpUrl: headUrl }),
      fetcher: yoroiApi,
      submitter: yoroiApi
    })
    
    // Commit UTXOs
    const commits = await Promise.all(
      utxosToCommit.map(utxo => 
        hydra.commitFunds(utxo.txHash, utxo.txIndex)
      )
    )
    
    return {
      hydra,
      commits,
      headUrl,
      committedUtxos: utxosToCommit
    }
  }
  
  // Build zero-fee transactions within head
  async buildHydraTransaction(
    session: HydraHeadSession,
    builder: TransactionBuilderState
  ): Promise<string> {
    // Build transaction with Hydra mode (zero fees)
    const tx = await buildTransaction(builder, protocolParams, {
      isHydra: true // Special mode
    })
    
    // Submit to Hydra head (not mainnet)
    return session.hydra.submitTx(tx.cbor)
  }
}
```

### Implementation Plan

**Phase 1: Basic Hydra Types**
- Add `HydraHead` type
- Add `HydraTransaction` type
- Add Hydra protocol types

**Phase 2: Hydra Integration**
- Add `isHydra` flag to transaction builder
- Implement Hydra transaction building
- Add Hydra head management

**Phase 3: UI Integration**
- Add Hydra head participation UI
- Add Hydra transaction mode toggle
- Add Hydra head status display

**Files to Create**:
- `mobile/packages/tx/hydra/types.ts`
- `mobile/packages/tx/hydra/head.ts`
- `mobile/packages/tx/hydra/transactions.ts`
- `mobile/packages/tx/hydra/index.ts`

**Note**: Hydra support is specialized and may have limited use cases in a general-purpose wallet.

---

## 8. Bitcoin Support

### In-Depth Explanation

#### Support Extent

**Capabilities**:
- Bitcoin transaction building
- UTXO management
- Address generation
- Provider support (Blockstream, Maestro)
- Wallet integration

**Extent**:
- Full Bitcoin transaction support
- Multiple provider options
- Address utilities
- Transaction signing

### Integration into Yoroi Blockchains Package

#### Current Blockchains Package Structure

Yoroi has a `blockchains` package that could be extended:

```typescript
// Current structure (Cardano-focused)
packages/blockchains/
  networks/
    cardano/
  types/
    cardano.ts
```

#### Proposed Bitcoin Integration

```typescript
// Extended structure
packages/blockchains/
  networks/
    cardano/
    bitcoin/        // NEW
  types/
    cardano.ts
    bitcoin.ts     // NEW
  providers/
    cardano.ts
    bitcoin.ts     // NEW
```

### What We'd Need

#### 1. Bitcoin Transaction Building
- Transaction construction
- UTXO selection
- Fee calculation
- Signing

#### 2. Bitcoin Address Utilities
- Address generation
- Address validation
- Address encoding/decoding

#### 3. Bitcoin Provider Interface
- Unified interface for Bitcoin providers
- Blockstream integration
- Maestro integration

#### 4. Bitcoin Types
- Transaction types
- UTXO types
- Address types

### Creative Wallet Use Cases

#### 1. Multi-Chain Portfolio
```typescript
// Unified portfolio across Cardano and Bitcoin
type MultiChainPortfolio = {
  cardano: Portfolio.Manager.Balance,
  bitcoin: BitcoinBalance
}

class MultiChainWallet {
  async getTotalPortfolio(): Promise<MultiChainPortfolio> {
    return {
      cardano: await this.cardanoWallet.getBalances(),
      bitcoin: await this.bitcoinWallet.getBalance()
    }
  }
  
  // Cross-chain operations
  async sendCrossChain(
    from: 'cardano' | 'bitcoin',
    to: 'cardano' | 'bitcoin',
    amount: string
  ) {
    // Bridge functionality
  }
}
```

### Implementation Plan

**Phase 1: Bitcoin Types**
- Add Bitcoin types to `@yoroi/types`
- Add Bitcoin address types
- Add Bitcoin transaction types

**Phase 2: Bitcoin Network Integration**
- Add Bitcoin network to `@yoroi/blockchains`
- Implement Bitcoin provider interface
- Add Bitcoin API integration

**Phase 3: Bitcoin Wallet Features**
- Bitcoin transaction building
- Bitcoin UTXO management
- Bitcoin address generation

**Files to Create**:
- `mobile/packages/blockchains/networks/bitcoin/`
- `mobile/packages/blockchains/types/bitcoin.ts`
- `mobile/packages/blockchains/providers/bitcoin.ts`

**Dependencies Needed**:
- Bitcoin libraries (bitcoinjs-lib, bip32, bip39)
- Bitcoin provider SDKs

---

## 9. CIP-30 Improvements

### Current State Analysis

**Yoroi's CIP-30 Implementation**:
- Basic CIP-30 methods implemented
- Returns CSL types directly
- Limited error handling
- No advanced features

**Improvements Needed**:
- Better validation before signing
- Enhanced error messages
- Transaction review improvements
- Multi-transaction signing support

### CIP-30 Compatibility Constraints

**Critical**: CIP-30 specification requires returning CSL types (`CSL.Value`, `CSL.Address`, etc.). Changing return types would break existing dApp integrations.

**What We Can Improve**:
- Internal implementation can use Yoroi types
- Convert Yoroi types → CSL types at the CIP-30 boundary
- Add validation and error handling
- Improve error messages
- Add `signTxs()` for batch signing (if wallet supports)
- Enhance transaction review before signing

**What We Cannot Change**:
- Return types must remain CSL types
- Method signatures must match CIP-30 spec

### Creative Wallet Use Cases

#### 1. Enhanced Transaction Validation
```typescript
// Validate transactions before signing (internal, then convert to CSL)
class EnhancedCIP30 {
  async signTransaction(
    unsignedTx: UnsignedTransaction | string
  ): Promise<string> {
    // If UnsignedTransaction, use new builder (internal)
    if (typeof unsignedTx === 'object') {
      // Validate transaction using Yoroi types
      const validation = validateTransaction(unsignedTx)
      if (!validation.valid) {
        throw new CIP30Error('Invalid transaction', validation.errors)
      }
      
      // Show enhanced review
      const review = await enhanceTxReview(unsignedTx)
      await showTransactionReview(review)
      
      // Sign (internal uses Yoroi types)
      const signed = await this.signWithLedgerOrKey(unsignedTx)
      
      // Return as CBOR string (CIP-30 compatible)
      return signed.cbor
    }
    
    // Legacy CBOR signing
    return this.signCbor(unsignedTx)
  }
}
```

#### 2. Script Evaluation Before Signing
```typescript
// Evaluate scripts before signing (Phase 2 - requires backend)
async function signWithEvaluation(
  unsignedTx: UnsignedTransaction
): Promise<string> {
  // Phase 2: Evaluate scripts to get execution units (requires backend)
  const evaluation = await evaluateScripts(unsignedTx)
  
  // Update transaction with accurate execution units
  const updatedTx = updateExecutionUnits(unsignedTx, evaluation)
  
  // Show user accurate fees
  const fees = calculateFees(updatedTx, evaluation)
  await showFeeBreakdown(fees)
  
  // Sign
  return signTransaction(updatedTx)
}
```

#### 3. Reference Script Optimization
```typescript
// Automatically detect and use reference scripts (Phase 1 - local detection)
async function optimizeTransactionForSigning(
  unsignedTx: UnsignedTransaction
): Promise<UnsignedTransaction> {
  // Find scripts that could use reference scripts
  const optimizations = await findReferenceScriptOpportunities(unsignedTx)
  
  // Apply optimizations
  let optimized = unsignedTx
  for (const opt of optimizations) {
    optimized = applyReferenceScript(optimized, opt)
  }
  
  return optimized
}
```

### Implementation Plan

**Phase 1: Type Improvements (Local)**
- Keep CSL return types for CIP-30 compatibility
- Use Yoroi types internally
- Add conversion layer (Yoroi → CSL at boundary)
- Add better error types
- Add validation types

**Phase 2: Enhanced Methods (Local)**
- Improve `signTx()` with validation
- Add `signTxs()` for batch signing (if supported)
- Add script evaluation integration (requires Phase 2 backend)
- Better error messages

**Phase 3: Advanced Features**
- Reference script optimization
- Enhanced transaction review
- Better error messages

**Files to Modify**:
- `mobile/src/wallets/cardano/cip30/cip30.ts`
- `mobile/packages/dapp-connector/resolver.ts`

---

## 10. Blockchain Data Providers Comparison

### Current Yoroi Backend

**What We Have**:
- Custom Cardano backend API
- UTXO fetching (`getUtxoData`)
- Protocol parameters (`getProtocolParams`)
- Best block info (`getBestBlock`)

**Current API Structure**:
```typescript
interface Api.Cardano.Api {
  getProtocolParams(): Promise<ProtocolParams>
  getBestBlock(): Promise<BestBlock>
  getUtxoData(request: UtxoDataRequest): Promise<UtxoData>
}
```

### Provider Interface Comparison

**Yoroi Types**:
- Custom types aligned with backend
- UTXO data includes address, amount, assets, dataHash
- Protocol parameters include all Cardano parameters

**Potential Improvements**:
- Standardized error handling
- Better type definitions
- Caching support
- Retry logic

### Bitcoin Provider

**What We'd Need**:
- Bitcoin UTXO fetching
- Bitcoin transaction submission
- Bitcoin address info
- Bitcoin fee estimation

### Implementation Plan

**Phase 1: Interface Standardization (Local)**
- Review current provider interface
- Document type formats
- Compare with standard formats
- Identify improvements

**Phase 2: Provider Abstraction (If Needed)**
- Create unified provider interface
- Add adapter for current backend
- Add error handling types

**Phase 3: Bitcoin Provider (Future)**
- Add Bitcoin provider interface
- Integrate Bitcoin providers
- Add Bitcoin API methods

**Files to Review**:
- `mobile/packages/api/cardano/api/`
- `mobile/packages/types/chain/cardano.ts`

---

## Implementation Priority

### Phase 1: Local Implementation (No Backend Changes Required)

**All features in this phase can be implemented entirely in the wallet without requiring backend API changes.**

1. **Coin Selection Algorithms** ⭐⭐⭐
   - Pure functions, no backend needed
   - Multiple strategies (largest first, keep relevant, experimental)
   - UTXO selection utilities

2. **Datum Handling & Parsing** ⭐⭐⭐
   - Local datum parsing and decoding
   - Enhanced transaction review with datum display
   - Datum validation utilities
   - Contract interaction detection

3. **Minting & Burning** ⭐⭐⭐
   - Transaction building for minting/burning
   - Minting policy utilities
   - Token creation helpers
   - Note: Script evaluation for execution units requires Phase 2 backend

4. **Governance (Transaction Building)** ⭐⭐⭐
   - Proposal creation transaction building
   - Voting transaction building
   - DRep certificate building
   - Note: Proposal/vote data fetching may need backend, but transaction building is local

5. **Transaction Chaining** ⭐⭐⭐
   - Support for referencing unconfirmed transactions
   - Chain transaction building
   - Multi-step transaction workflows
   - Note: Evaluation of chained transactions requires Phase 2 backend

6. **CIP-30 Improvements (Local Only)** ⭐⭐
   - Enhanced validation before signing
   - Better error messages
   - Transaction review improvements
   - Note: Must maintain CSL return types for compatibility

7. **Reference Script Detection & Management** ⭐⭐
   - Detect reference scripts in UTXOs
   - Reference script discovery utilities
   - Reference script fee calculation
   - Note: Script evaluation requires Phase 2 backend

### Phase 2: Backend-Dependent Features

**These features require backend API changes. See "Backend Requirements Document" for specifications.**

1. **Script Evaluation & Execution Unit Calculation** ⭐⭐⭐
   - Backend endpoint for script evaluation
   - Automatic execution unit calculation
   - Accurate fee estimation for Plutus transactions
   - Script validation

2. **Reference Script Evaluation** ⭐⭐
   - Evaluate transactions using reference scripts
   - Calculate reference script fees accurately

3. **Transaction Chaining Evaluation** ⭐⭐
   - Evaluate chained transactions
   - Validate unconfirmed transaction references

### Phase 3: Strategic Features (Future Consideration)

1. **Bitcoin Support** - Multi-chain expansion (requires significant architecture work)
2. **Provider Abstraction** - Infrastructure improvement (if needed)
3. **Hydra** - Specialized use case (limited applicability)

---

## Technical Considerations

### Functional Style Requirements

- All functions must be pure (no side effects)
- Immutable data structures
- Use Yoroi types (`Balance.Amounts`, `ModernUtxo`, etc.)
- No class-based patterns
- Type-safe with TypeScript

### Integration Points

- `@yoroi/tx` - Transaction building
- `@yoroi/types` - Type definitions
- `@yoroi/blockchains` - Network support
- Backend API - Data fetching (existing endpoints)

### Testing Strategy

- Unit tests for all algorithms
- Integration tests with real transactions
- E2E tests for wallet flows

---

## Success Metrics

- **Transaction Review**: 90% of smart contract transactions show decoded datum
- **Fee Accuracy**: Script execution unit calculation within 5% of actual (Phase 2)
- **User Experience**: Coin selection reduces manual UTXO selection by 80%
- **dApp Integration**: CIP-30 improvements increase dApp compatibility by 50%

