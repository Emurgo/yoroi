# TransactionBuilder Refactor Plan

## Problem

The current `TransactionBuilder.build()` method tries to use `TransactionBody.setInputs()`, `TransactionBody.setOutputs()`, `TransactionBody.setFee()`, etc., but these methods don't exist because `TransactionBody` is immutable in CSL.

## Solution

Refactor to use CSL's `TransactionBuilder` class, which provides a proper builder pattern API.

## Implementation Steps

### 1. Create Helper Function for CSL TransactionBuilder Config

Create a helper function similar to `getTxBuilder` from yoroi-lib:

```typescript
async function createCSLTransactionBuilder(
  wasm: WasmModuleProxy,
  params: CardanoHaskellConfig,
): Promise<CSLTransactionBuilder> {
  // Create LinearFee
  const linearFee = await wasm.LinearFee.new(
    await wasm.BigNum.fromStr(params.linearFee.coefficient),
    await wasm.BigNum.fromStr(params.linearFee.constant),
  )

  // Create other protocol params
  const poolDeposit = await wasm.BigNum.fromStr(params.poolDeposit)
  const keyDeposit = await wasm.BigNum.fromStr(params.keyDeposit)
  const coinsPerUtxoByte = await wasm.BigNum.fromStr(params.coinsPerUtxoByte)

  // Create ExUnitPrices (for Plutus)
  const unitPrice = await wasm.ExUnitPrices.new(
    await wasm.UnitInterval.new(
      await wasm.BigNum.fromStr('577'),
      await wasm.BigNum.fromStr('10000'),
    ),
    await wasm.UnitInterval.new(
      await wasm.BigNum.fromStr('721'),
      await wasm.BigNum.fromStr('10000000'),
    ),
  )

  // Build config
  const configBuilder = await wasm.TransactionBuilderConfigBuilder.new()
    .then((b) => b.feeAlgo(linearFee))
    .then((b) => b.poolDeposit(poolDeposit))
    .then((b) => b.keyDeposit(keyDeposit))
    .then((b) => b.coinsPerUtxoByte(coinsPerUtxoByte))
    .then((b) => b.maxValueSize(5000))
    .then((b) => b.maxTxSize(16384))
    .then((b) => b.exUnitPrices(unitPrice))
    .then((b) => b.preferPureChange(true))

  const config = await configBuilder.build()
  return await wasm.TransactionBuilder.new(config)
}
```

### 2. Refactor `build()` Method

Replace the current implementation with:

```typescript
async build(
  wasm: WasmModuleProxy,
  protocolParams?: CardanoHaskellConfig,
  primaryTokenId: string = '',
): Promise<UnsignedTransaction> {
  const params = protocolParams || this.protocolParams
  if (!params) {
    throw new Error('Protocol parameters required')
  }

  // Validate inputs
  this.validateInputs()

  // Basic validation
  if (this.outputs.length === 0) {
    throw new NoOutputsError()
  }

  // Create CSL TransactionBuilder
  const cslTxBuilder = await createCSLTransactionBuilder(wasm, params)

  // Add outputs first (CSL builder needs outputs to calculate fees)
  for (const output of this.outputs) {
    const cslOutput = await this.outputToCSL(wasm, output, primaryTokenId)
    await cslTxBuilder.addOutput(cslOutput)
  }

  // Add certificates
  if (this.certificates.length > 0) {
    const certs = await wasm.Certificates.new()
    for (const cert of this.certificates) {
      await certs.add(cert.cert)
    }
    await cslTxBuilder.setCerts(certs)
  }

  // Add withdrawals
  if (this.withdrawals.length > 0) {
    const withdrawals = await wasm.Withdrawals.new()
    for (const withdrawal of this.withdrawals) {
      const rewardAddr = await wasm.RewardAddress.fromAddress(
        await wasm.Address.fromBech32(withdrawal.rewardAddress),
      )
      if (!rewardAddr) {
        throw new Error(`Invalid reward address: ${withdrawal.rewardAddress}`)
      }
      const amount = await wasm.BigNum.fromStr(withdrawal.amount)
      await withdrawals.insert(rewardAddr, amount)
    }
    await cslTxBuilder.setWithdrawals(withdrawals)
  }

  // Add reference inputs
  if (this.referenceInputs.length > 0) {
    // CSL TransactionBuilder doesn't have direct reference input support
    // We'll need to add them after building, or use a different approach
    // TODO: Check CSL API for reference inputs
  }

  // Add collateral inputs
  if (this.collateralInputs.length > 0) {
    // CSL TransactionBuilder doesn't have direct collateral input support
    // We'll need to add them after building, or use a different approach
    // TODO: Check CSL API for collateral inputs
  }

  // Set TTL
  if (this.options.ttl) {
    await cslTxBuilder.setTtl(this.options.ttl)
  }

  // Set validity interval
  if (this.options.validityInterval) {
    // TODO: Check CSL API for validity interval
  }

  // Add inputs (UTXOs)
  // CSL TransactionBuilder uses addUtxoInput which takes TransactionUnspentOutput
  for (const input of this.inputs) {
    const utxo = await input.utxo.toTransactionUnspentOutput(wasm)
    await cslTxBuilder.addUtxoInput(utxo)
  }

  // Handle manual fee
  if (this.options.manualFee) {
    const feeAmount = this.options.manualFee[primaryTokenId] || '0'
    const feeBigNum = await wasm.BigNum.fromStr(feeAmount)
    await cslTxBuilder.setFee(feeBigNum)
  } else {
    // CSL TransactionBuilder calculates fee automatically
    // We can get it with: await cslTxBuilder.getFeeIfSet()
  }

  // Handle change output
  if (this.options.manualChangeOutput) {
    const cslChangeOutput = await this.outputToCSL(
      wasm,
      this.options.manualChangeOutput,
      primaryTokenId,
    )
    await cslTxBuilder.addOutput(cslChangeOutput)
  } else if (this.options.changeAddress && !this.options.manualFee) {
    // Use CSL's automatic change handling
    const changeAddr = await wasm.Address.fromBech32(this.options.changeAddress)
    if (!changeAddr) {
      throw new Error(`Invalid change address: ${this.options.changeAddress}`)
    }
    await cslTxBuilder.addChangeIfNeeded(changeAddr)
  }

  // Add metadata
  if (this.metadata.length > 0) {
    const auxData = await wasm.AuxiliaryData.new()
    const metadataMap = await wasm.GeneralTransactionMetadata.new()

    for (const meta of this.metadata) {
      const label = typeof meta.label === 'string' ? parseInt(meta.label, 10) : meta.label
      const metadata = await wasm.encodeJsonStrToMetadatum(
        JSON.stringify(meta.data),
        1, // MetadataJsonSchema.BasicConversions
      )
      await metadataMap.insert(
        await wasm.BigNum.fromStr(label.toString()),
        metadata,
      )
    }

    await auxData.setMetadata(metadataMap)
    await cslTxBuilder.setAuxiliaryData(auxData)
  }

  // Build the transaction body
  const txBody = await cslTxBuilder.build()

  // Handle reference inputs and collateral inputs after building
  // These need to be added to the TransactionBody directly
  // But TransactionBody is immutable, so we need to reconstruct it
  // OR: Check if CSL TransactionBuilder has methods for these

  // Get fee from builder
  const feeBigNum = await cslTxBuilder.getFeeIfSet()
  const fee: Balance.Amounts = feeBigNum
    ? {[primaryTokenId]: await feeBigNum.toStr()}
    : {}

  // Validate sufficient funds
  const totalInput = this.calculateTotalInputValue()
  const totalOutput = this.calculateTotalOutputValue()
  const feeAda = BigInt(fee[primaryTokenId] || '0')
  const inputAda = BigInt(totalInput[primaryTokenId] || '0')
  const outputAda = BigInt(totalOutput[primaryTokenId] || '0')

  if (inputAda < outputAda + feeAda) {
    throw new NotEnoughMoneyToSendError()
  }

  // Serialize to CBOR
  const cbor = Buffer.from(await txBody.toBytes()).toString('hex')

  return {
    inputs: this.inputs,
    outputs: this.outputs,
    certificates: this.certificates,
    withdrawals: this.withdrawals,
    referenceInputs: this.referenceInputs,
    collateralInputs: this.collateralInputs,
    metadata: this.metadata.length > 0 ? this.metadata : undefined,
    options: this.options,
    cbor,
  }
}
```

### 3. Handle Reference Inputs and Collateral Inputs

CSL's `TransactionBuilder` may not have direct support for reference inputs and collateral inputs. We have two options:

**Option A**: Add them after building by reconstructing the TransactionBody
- Build the transaction without reference/collateral inputs
- Extract all fields from the built TransactionBody
- Create a new TransactionBody with reference/collateral inputs included
- This is complex because TransactionBody is immutable

**Option B**: Check if CSL TransactionBuilder has methods for these
- Research CSL API documentation
- If methods exist, use them directly

**Option C**: Use TransactionBody constructor (if it exists)
- Check if TransactionBody has a constructor that takes all fields
- Build everything manually and construct TransactionBody once

### 4. Handle Validity Interval

Similar to reference/collateral inputs, we need to check CSL API for validity interval support.

### 5. Testing Strategy

1. Test basic transaction building (inputs, outputs, fee)
2. Test with certificates
3. Test with withdrawals
4. Test with change output (automatic and manual)
5. Test with manual fee
6. Test with metadata
7. Test with reference inputs (if supported)
8. Test with collateral inputs (if supported)
9. Test with validity interval (if supported)
10. Test fee calculation accuracy
11. Test change calculation accuracy

## Challenges

1. **Reference Inputs & Collateral Inputs**: CSL TransactionBuilder may not support these directly
2. **Validity Interval**: Need to check CSL API
3. **Fee Calculation**: CSL calculates automatically, but we want manual control option
4. **Change Output**: CSL has `addChangeIfNeeded()`, but we want manual control option
5. **Order of Operations**: CSL TransactionBuilder may require specific order (outputs before inputs, etc.)

## Research Needed

1. Check CSL TransactionBuilder API for:
   - Reference inputs support
   - Collateral inputs support
   - Validity interval support
   - Manual fee override
   - Manual change output (vs automatic)

2. Check if TransactionBody has a constructor that takes all fields

3. Check if we can modify TransactionBody after creation (unlikely, but worth checking)

## Key Findings from yoroi-lib

1. **Adding UTXOs**: Use `addUtxoInput(txBuilder, utxo)` helper function
   - Takes `TransactionUnspentOutput` (not just TransactionInput)
   - Our `ModernUtxo` has `toTransactionUnspentOutput()` method - perfect!

2. **Adding Outputs**: Use `txBuilder.addOutput(transactionOutput)`
   - Must be done before adding inputs (for fee calculation)

3. **Fee Calculation**: CSL calculates automatically
   - Can override with `txBuilder.setFee(bigNum)`
   - Get calculated fee with `txBuilder.getFeeIfSet()`

4. **Change Output**: Use `txBuilder.addChangeIfNeeded(address)`
   - Automatically calculates and adds change if needed
   - For manual change, just add it as a regular output

5. **Order Matters**: 
   - Add outputs first
   - Then certificates, withdrawals, TTL
   - Then add inputs (UTXOs)
   - Then handle change
   - Then set fee (if manual)

## Estimated Effort

- Research: 1-2 hours
- Implementation: 3-4 hours
- Testing: 2-3 hours
- **Total: 6-9 hours**

## Alternative Approach

If CSL TransactionBuilder doesn't support all features we need, we could:
1. Use TransactionBuilder for basic transactions
2. For advanced features (reference inputs, collateral, etc.), build TransactionBody manually using a different approach
3. Check if there's a TransactionBodyBuilder or similar class

