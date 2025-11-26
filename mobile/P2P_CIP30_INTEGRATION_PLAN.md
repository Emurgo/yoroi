# P2P CIP-30 Integration Plan

## Overview

Enable CIP-30 wallet API methods to work via P2P connections, similar to how they work in the browser dApp discover feature.

## Current Architecture

### Browser CIP-30 Flow (Current)

1. **dApp Connector** (`@yoroi/dapp-connector`)

   - Injected into browser tabs
   - Sends messages via `postMessage` to React Native bridge
   - Messages have format: `{id, method, params, source: 'dapp-connector'}`

2. **Message Handling** (`resolver.ts`)

   - `resolverHandleEvent` receives messages
   - Routes to `handleMethod` based on method name
   - Methods: `getBalance`, `signTx`, `getUtxos`, `signData`, etc.

3. **Wallet Handler** (`createDappConnector` in `helpers.ts`)

   - `handlerWallet` object implements CIP-30 methods
   - `signTx` calls `signTx` callback → navigates to `navigateToTxReview`
   - Other methods call `cip30ExtensionMaker` directly

4. **Transaction Signing Flow**
   - `handleSignTx` in `useDappConnectorManager.tsx`
   - Navigates to review screen with `navigateToTxReview({cbor, context: 'dapp'})`
   - User reviews and signs
   - Returns `rootKey` → `cip30.signTx(rootKey, cbor)`
   - Signed tx sent back to dApp

### P2P Communication Flow (Current)

1. **Connection** (`P2PConnectionScreen`)

   - Only place where connections are established
   - Uses `connectionManagerMaker` → `peerConnectionMaker` → `walletCommunicationMaker`
   - Connection is isolated to this screen

2. **Message Format** (`WalletMessage`)

   ```typescript
   type WalletRequest = {
     type: 'request'
     method: string
     data?: unknown
     id: number
   }
   ```

3. **Message Handling** (`wallet-communication.ts`)
   - Receives messages via `on('message')` listener
   - Currently only handles heartbeat messages
   - No CIP-30 method routing yet

## Implementation Plan

### Phase 1: Global P2P Connection Status Indicator

**Goal**: Show connection status at top of app when P2P connection is active

**Components**:

1. **P2PConnectionProvider** (new)

   - Global context provider
   - Manages active P2P connection state
   - Exposes connection status and peer ID
   - Location: `src/features/P2P/context/P2PConnectionProvider.tsx`

2. **P2PConnectionStatusBar** (new)

   - Fixed status bar component at top of app
   - Shows: "P2P Connected" with peer ID
   - Only visible when connection is active
   - Location: `src/features/P2P/components/P2PConnectionStatusBar.tsx`

3. **Integration Points**:
   - Add provider to root app layout
   - Add status bar to main navigator
   - Update `P2PConnectionScreen` to register/unregister connection with provider

**Files to Create**:

- `src/features/P2P/context/P2PConnectionProvider.tsx`
- `src/features/P2P/components/P2PConnectionStatusBar.tsx`

**Files to Modify**:

- `src/features/P2P/useCases/P2PConnectionScreen/P2PConnectionScreen.tsx` - Register connection
- Root layout/navigator - Add provider and status bar

### Phase 2: Global P2P Message Handler

**Goal**: Listen for P2P messages globally and route to CIP-30 handlers

**Components**:

1. **useP2PCIP30Handler** (new hook)

   - Listens for P2P messages globally
   - Routes messages to CIP-30 method handlers
   - Handles request/response pattern
   - Location: `src/features/P2P/hooks/useP2PCIP30Handler.ts`

2. **Message Router**

   - Maps P2P `WalletRequest.method` to CIP-30 methods
   - Methods to support:
     - `getBalance` → `cip30.getBalance()`
     - `getUtxos` → `cip30.getUtxos()`
     - `getUsedAddresses` → `cip30.getUsedAddresses()`
     - `getUnusedAddresses` → `cip30.getUnusedAddresses()`
     - `getChangeAddress` → `cip30.getChangeAddress()`
     - `getRewardAddresses` → `cip30.getRewardAddresses()`
     - `getNetworkId` → `wallet.networkManager.chainId`
     - `getExtensions` → `[{cip: 30}, {cip: 95}]` (if supported)
     - `signTx` → Navigate to review screen
     - `signData` → Navigate to sign data screen
     - `submitTx` → `cip30.submitTx()`
     - `getCollateral` → `cip30.getCollateral()`

3. **Integration with Existing Handlers**
   - Reuse `createDappConnector` logic
   - Reuse `handleSignTx` from `useDappConnectorManager`
   - Reuse `handleSignData` logic
   - Create adapter to convert P2P messages to dApp connector format

**Files to Create**:

- `src/features/P2P/hooks/useP2PCIP30Handler.ts`
- `src/features/P2P/utils/p2pCIP30Adapter.ts` - Converts between P2P and CIP-30 formats

**Files to Modify**:

- `src/features/P2P/context/P2PConnectionProvider.tsx` - Add message handler
- `src/features/P2P/useCases/P2PConnectionScreen/P2PConnectionScreen.tsx` - Pass connection to provider

### Phase 3: Transaction Signing via P2P

**Goal**: When dApp requests `signTx` via P2P, navigate to review screen and return signed tx

**Flow**:

1. P2P message received: `{type: 'request', method: 'signTx', data: {cbor, partial}, id: 1}`
2. Route to `handleSignTx` (reuse from `useDappConnectorManager`)
3. Navigate to `navigateToTxReview` with CBOR
4. User reviews and signs
5. On success, send response via P2P: `{type: 'response', method: 'signTx', data: signedCbor, id: 1}`
6. On error/reject, send error response: `{type: 'response', method: 'signTx', error: 'User rejected', id: 1}`

**Key Differences from Browser Flow**:

- Browser: Returns `rootKey`, then dApp connector calls `cip30.signTx(rootKey, cbor)`
- P2P: Need to sign directly and return signed CBOR (since no dApp connector bridge)

**Implementation**:

- Modify `handleSignTx` to accept P2P context
- Or create `handleSignTxP2P` that signs directly and returns signed CBOR
- Use `cip30ExtensionMaker` to sign after getting rootKey

**Files to Modify**:

- `src/features/P2P/hooks/useP2PCIP30Handler.ts` - Add signTx handler
- `src/features/Discover/useDappConnectorManager.tsx` - Extract signTx logic (or create shared)

### Phase 4: Data Signing via P2P

**Goal**: Support `signData` method via P2P

**Flow**:

1. P2P message: `{type: 'request', method: 'signData', data: {address, payload}, id: 2}`
2. Show sign data modal (reuse from browser flow)
3. User approves/rejects
4. Return signature: `{type: 'response', method: 'signData', data: {signature, key}, id: 2}`

**Files to Modify**:

- `src/features/P2P/hooks/useP2PCIP30Handler.ts` - Add signData handler
- Reuse `useSignData` hook from `useDappConnectorManager`

## Technical Details

### Message Format Mapping

**P2P Request** → **CIP-30 Method**

```typescript
// P2P
{
  type: 'request',
  method: 'signTx',
  data: {cbor: '...', partial: false},
  id: 1
}

// Maps to CIP-30
api.signTx('...', false)
```

**CIP-30 Response** → **P2P Response**

```typescript
// CIP-30 returns
signedCbor: string

// P2P response
{
  type: 'response',
  method: 'signTx',
  data: signedCbor,
  id: 1
}
```

### Connection Lifecycle

1. **Connection Established** (`P2PConnectionScreen`)

   - User opens P2P connection screen
   - Connection manager created
   - Connection registered with `P2PConnectionProvider`
   - Status bar appears

2. **Message Handling** (Global)

   - `P2PConnectionProvider` listens for messages
   - Routes to `useP2PCIP30Handler`
   - Handler processes and responds

3. **Transaction Signing**

   - Message received → Navigate to review screen
   - User signs → Response sent back
   - User can navigate back to any screen

4. **Connection Closed**
   - User disconnects or leaves P2P screen
   - Connection cleaned up
   - Status bar disappears

### Error Handling

- **Connection Lost**: Show error in status bar, stop processing messages
- **Invalid Method**: Return error response
- **User Rejection**: Return user rejection error (same as browser)
- **Network Errors**: Log and return error response

## Implementation Order

1. ✅ **Phase 1**: Global connection status indicator
2. ✅ **Phase 2**: Global message handler setup
3. ✅ **Phase 3**: Transaction signing integration
4. ✅ **Phase 4**: Data signing integration
5. ✅ **Testing**: End-to-end P2P CIP-30 flow

## Files Summary

### New Files

- `src/features/P2P/context/P2PConnectionProvider.tsx`
- `src/features/P2P/components/P2PConnectionStatusBar.tsx`
- `src/features/P2P/hooks/useP2PCIP30Handler.ts`
- `src/features/P2P/utils/p2pCIP30Adapter.ts`

### Modified Files

- `src/features/P2P/useCases/P2PConnectionScreen/P2PConnectionScreen.tsx`
- Root app layout/navigator (add provider and status bar)
- Possibly extract shared signTx logic from `useDappConnectorManager.tsx`

## Notes

- P2P connections are still only established in `P2PConnectionScreen`
- Connection state is managed globally via context
- Message handling happens globally, not just in P2P screen
- Reuse existing CIP-30 implementation as much as possible
- Maintain same user experience as browser CIP-30 flow
