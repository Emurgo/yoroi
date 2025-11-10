# Known Type Issues

## Critical: TransactionBuilder Implementation

The current `TransactionBuilder` implementation tries to use `TransactionBody.setInputs()`, `TransactionBody.setOutputs()`, `TransactionBody.setFee()`, etc., but these methods don't exist because `TransactionBody` is immutable.

### Solution Required

We need to refactor `TransactionBuilder` to use CSL's `TransactionBuilder` class instead of creating `TransactionBody` directly. The correct pattern is:

1. Create CSL `TransactionBuilder` with config
2. Use methods like `addOutput()`, `setFee()`, `setTtl()`, `setCerts()`, `setWithdrawals()`, etc.
3. Call `build()` to get the `TransactionBody`

### Example from yoroi-lib:

```typescript
const txBuilder = await wasm.TransactionBuilder.new(config)
await txBuilder.addOutput(txOutput)
await txBuilder.setFee(fee)
await txBuilder.setTtl(ttl)
await txBuilder.setCerts(certs)
await txBuilder.setWithdrawals(withdrawals)
const txBody = await txBuilder.build()
```

### Files Affected

- `mobile/packages/tx/transaction-builder/builder.ts` - Main implementation needs refactor
- All code that uses `TransactionBuilder.build()` will continue to work after refactor

### Estimated Effort

- 4-6 hours for full refactor
- Need to create CSL TransactionBuilder config from CardanoHaskellConfig
- Need to handle fee calculation differently (CSL TransactionBuilder calculates fees automatically)
- Need to handle change output differently (CSL TransactionBuilder has `addChangeIfNeeded()`)

## Other Type Issues

### Balance.Amounts Type Compatibility

Some places assign strings to `Balance.Amounts` which expects `\`${number}\`` template literal types. This is a type system limitation - the values are valid at runtime but TypeScript's type system is strict.

**Status**: Non-critical, runtime works correctly

### WASM Async Patterns

Some WASM methods return Promises that need proper typing. Most are fixed, but some edge cases remain.

**Status**: Mostly fixed, minor issues remain

