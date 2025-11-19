# AccountPubKeyHex Handling for Readonly Wallets

## Issue

When loading wallets, some wallets (particularly readonly wallets from other branches) may not have `accountPubKeyHex` stored in their encrypted storage. This causes `loadWallet()` to fail with the error:

```
Error: WalletManager: loadWallet accountPubKeyHex not found
```

This error was crashing the app during wallet hydration when trying to load all wallets from storage.

## Root Cause

The `loadWallet()` method in `wallet-manager.ts` was using `throwLoggedError()` which logs an error and throws, causing the entire `hydrate()` process to fail when encountering wallets without `accountPubKeyHex`.

## Solution

### Changes Made

1. **`wallet-manager.ts` - `loadWallet()` method** (lines ~641-645):

   - Changed from `throwLoggedError()` to regular `throw new Error()`
   - Removed error logging (only debug logging remains)
   - Added comment explaining this is expected for readonly wallets

2. **`wallet-manager.ts` - `hydrate()` method** (lines ~399-440):
   - Changed from `Promise.all()` to `Promise.allSettled()`
   - Added error handling to catch and skip wallets that fail to load
   - Added debug logging (not error logging) when skipping wallets
   - Wallets without `accountPubKeyHex` are now skipped gracefully instead of crashing

### Code Changes

**Before:**

```typescript
if (!accountPubKeyHex) {
  logger.error('WalletManager: loadWallet accountPubKeyHex not found', {...})
  throwLoggedError('WalletManager: loadWallet accountPubKeyHex not found')
}

// In hydrate():
const loadedWallets = await Promise.all(
  metasToLoad.map(({id, implementation}) =>
    this.loadWallet({id, implementation, isForced, network}),
  ),
)
```

**After:**

```typescript
if (!accountPubKeyHex) {
  // Don't log as error - this is expected for readonly wallets without accountPubKeyHex
  // The error will be caught and handled gracefully in hydrate()
  throw new Error('WalletManager: loadWallet accountPubKeyHex not found')
}

// In hydrate():
const loadedWallets = await Promise.allSettled(
  metasToLoad.map(async ({id, implementation}) => {
    try {
      return await this.loadWallet({id, implementation, isForced, network})
    } catch (error) {
      throw {error, walletId: id, implementation}
    }
  }),
)

// Filter out failed wallet loads
for (let i = 0; i < loadedWallets.length; i++) {
  const result = loadedWallets[i]
  const meta = metasToLoad[i]

  if (result.status === 'fulfilled') {
    this.#wallets.set(result.value.id, result.value)
  } else {
    logger.debug('WalletManager: hydrate skipped wallet (missing accountPubKeyHex)', {
      walletId: meta?.id,
      implementation: meta?.implementation,
      isReadOnly: meta?.isReadOnly,
      network,
      error: errorMessage,
    })
  }
}
```

## Impact

- **Before**: App crashes when encountering wallets without `accountPubKeyHex`
- **After**: App continues loading other wallets, skipping problematic ones with debug logs only

## Merge Conflict Resolution

If there are conflicts when merging branches with readonly wallet support:

1. **Keep the `Promise.allSettled()` approach** - This allows graceful handling of failed wallet loads
2. **Keep the regular `throw new Error()`** instead of `throwLoggedError()` - Prevents console error spam
3. **Keep the debug logging** in `hydrate()` - Provides visibility without noise
4. **Ensure readonly wallet checks** - The `isReadOnly` flag should be checked before attempting to load wallets that require `accountPubKeyHex`

## Related Files

- `mobile/src/features/WalletManager/wallet-manager.ts` - Main changes
- `mobile/src/features/Airdrop/common/useAirdropEligibility.ts` - Uses `useWalletManager()` instead of `useSelectedWallet()` to handle missing wallets gracefully
- `mobile/src/features/Airdrop/common/useRedeemThaw.ts` - Checks for readonly wallets before attempting redemption
- `mobile/src/features/Airdrop/common/useAirdropBanner.ts` - Handles missing wallets gracefully

## Testing

To verify the fix works:

1. Create/import a readonly wallet without `accountPubKeyHex` in storage
2. Verify the app doesn't crash during hydration
3. Verify other wallets still load correctly
4. Check logs show debug messages (not errors) for skipped wallets
