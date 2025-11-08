# @yoroi/p2p-communication

P2P communication package for Cardano wallet connections using WebRTC. Supports both React Native and browser environments. Enables dApp-to-wallet and wallet-to-wallet communication for complex multi-party transactions.

## Features

- WebRTC-based peer-to-peer communication
- Cross-platform support (React Native and Browser)
- Storage abstraction via dependency injection
- Heartbeat system for connection monitoring
- TypeScript with strict typing
- Functional programming approach (no classes)
- **Wallet-to-wallet connections** for multi-party transactions
- **Multiple simultaneous connections** support

## Installation

For React Native:
```bash
npm install react-native-webrtc
```

The package uses `react-native-webrtc` as a peer dependency for React Native environments. In browser environments, native WebRTC APIs are used.

## Usage

### dApp to Wallet Connection (Traditional)

#### React Native Example

```typescript
import {connectionManagerMaker, WebRTCAdapter} from '@yoroi/p2p-communication'
import {BaseStorage} from '@yoroi/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc'

// Create BaseStorage adapter (apps should provide their own)
const storage: BaseStorage = {
  getItem: async (key: string) => await AsyncStorage.getItem(key),
  setItem: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
  removeItem: async (key: string) => await AsyncStorage.removeItem(key),
}

// Create WebRTC adapter from react-native-webrtc
const webrtcAdapter: WebRTCAdapter = {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
}

// Create connection manager (dApp side - isWallet defaults to false)
const connectionManager = connectionManagerMaker({
  storage,
  webrtcAdapter,
  peerConfig: {
    signalingUrl: 'wss://signaling-server.com',
  },
})
```

#### Browser Example

```typescript
import {connectionManagerMaker, WebRTCAdapter} from '@yoroi/p2p-communication'
import {BaseStorage} from '@yoroi/types'

// Create BaseStorage adapter from localStorage
const storage: BaseStorage = {
  getItem: async (key: string) => localStorage.getItem(key),
  setItem: async (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: async (key: string) => localStorage.removeItem(key),
}

// Create WebRTC adapter from native browser APIs
const webrtcAdapter: WebRTCAdapter = {
  RTCPeerConnection: window.RTCPeerConnection,
  RTCSessionDescription: window.RTCSessionDescription,
  RTCIceCandidate: window.RTCIceCandidate,
}

// Create connection manager (dApp side)
const connectionManager = connectionManagerMaker({
  storage,
  webrtcAdapter,
  peerConfig: {
    signalingUrl: 'wss://signaling-server.com',
  },
})

// Initialize
await connectionManager.initialize()

// Get peer connection and wallet communication
const peerConnection = connectionManager.getPeerConnection()
const walletCommunication = connectionManager.getWalletCommunication()
```

### Wallet to Wallet Connection (New)

```typescript
import {connectionManagerMaker, WebRTCAdapter} from '@yoroi/p2p-communication'
import {BaseStorage} from '@yoroi/types'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc'

// Create storage adapter (example for React Native)
const storage: BaseStorage = {
  getItem: async (key: string) => await AsyncStorage.getItem(key),
  setItem: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
  removeItem: async (key: string) => await AsyncStorage.removeItem(key),
}

// Create WebRTC adapter from react-native-webrtc
const webrtcAdapter: WebRTCAdapter = {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
}

// Create connection manager (wallet side)
const connectionManager = connectionManagerMaker({
  storage,
  webrtcAdapter,
  peerConfig: {
    signalingUrl: 'wss://signaling-server.com',
  },
  isWallet: true, // Important: mark as wallet
})

// Initialize
await connectionManager.initialize()

// Get peer connection
const peerConnection = connectionManager.getPeerConnection()

// Connect to another wallet using their peer ID (from QR code/deeplink)
const targetPeerId = 'wallet-abc123-xyz789'
await peerConnection?.connectToPeer(targetPeerId)

// Listen for connection established
peerConnection?.on('peerConnected', (peerId) => {
  console.log('Connected to wallet:', peerId)
})

// Send messages
peerConnection?.send({type: 'request', method: 'signTx', data: txData})
```

### Multiple Wallet Connections

For scenarios requiring multiple wallets to connect simultaneously (e.g., multi-party transactions):

```typescript
import {multiConnectionManagerMaker} from '@yoroi/p2p-communication'
import {BaseStorage, WebRTCAdapter} from '@yoroi/types'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc'

// Create storage adapter
const storage: BaseStorage = {
  getItem: async (key: string) => await AsyncStorage.getItem(key),
  setItem: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
  removeItem: async (key: string) => await AsyncStorage.removeItem(key),
}

// Create WebRTC adapter from react-native-webrtc
const webrtcAdapter: WebRTCAdapter = {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
}

// Create multi-connection manager
const multiManager = multiConnectionManagerMaker(storage, webrtcAdapter, {
  signalingUrl: 'wss://signaling-server.com',
})

// Initialize and get your peer ID
const myPeerId = await multiManager.initialize()
console.log('My peer ID:', myPeerId)

// Connect to multiple wallets
const wallet1 = await multiManager.connectToPeer('wallet-abc123')
const wallet2 = await multiManager.connectToPeer('wallet-xyz789')
const wallet3 = await multiManager.connectToPeer('wallet-def456')

// Send to specific wallet
wallet1.send({type: 'request', method: 'signTx', data: txData})

// Get all active connections
const allConnections = multiManager.getAllConnections()
allConnections.forEach(({peerId, connection}) => {
  console.log(`Connected to: ${peerId}`)
})

// Disconnect from a specific wallet
multiManager.disconnectFromPeer('wallet-abc123')
```

### Browser Extension Example

```typescript
import {connectionManagerMaker} from '@yoroi/p2p-communication'
import {BaseStorage} from '@yoroi/types'
import {WebRTCAdapter} from '@yoroi/p2p-communication'

// Create BaseStorage adapter from chrome.storage (apps should provide their own)
const storage: BaseStorage = {
  getItem: async (key: string) => {
    const result = await chrome.storage.local.get(key)
    return typeof result[key] === 'string' ? result[key] : null
  },
  setItem: async (key: string, value: string) => {
    await chrome.storage.local.set({[key]: value})
  },
  removeItem: async (key: string) => {
    await chrome.storage.local.remove(key)
  },
}

// Create WebRTC adapter from native browser APIs
const webrtcAdapter: WebRTCAdapter = {
  RTCPeerConnection: window.RTCPeerConnection,
  RTCSessionDescription: window.RTCSessionDescription,
  RTCIceCandidate: window.RTCIceCandidate,
}

// Create connection manager
const connectionManager = connectionManagerMaker({
  storage,
  webrtcAdapter,
  peerConfig: {
    signalingUrl: 'wss://signaling-server.com',
  },
  isWallet: true, // For wallet extension
})

// Initialize
await connectionManager.initialize()
```

### Using React Hooks

```typescript
import {usePeerConnection, useWalletConnection, useWalletMessages} from '@yoroi/p2p-communication'
import {BaseStorage, WebRTCAdapter} from '@yoroi/types'
import {useEffect} from 'react'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc'

function MyComponent() {
  const storage: BaseStorage = {
    // ... storage implementation
  }

  const webrtcAdapter: WebRTCAdapter = {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
  }

  const connectionManager = connectionManagerMaker({
    storage,
    webrtcAdapter,
    peerConfig: {signalingUrl: 'wss://...'},
    isWallet: true,
  })
  const peerConnection = connectionManager.getPeerConnection()
  const walletCommunication = connectionManager.getWalletCommunication()

  const peerState = usePeerConnection(peerConnection)
  const walletState = useWalletConnection(peerState, walletCommunication)
  const messages = useWalletMessages(
    walletState.connected,
    walletState.setStatus,
    walletCommunication,
  )

  useEffect(() => {
    connectionManager.initialize()
    return () => {
      connectionManager.cleanup()
    }
  }, [])

  return (
    <div>
      <p>Peer ID: {peerState.peerId}</p>
      <p>Status: {peerState.status}</p>
      <p>Connected: {walletState.connected ? 'Yes' : 'No'}</p>
      {peerConnection && (
        <p>Connected to: {peerConnection.getConnectedPeerId() ?? 'None'}</p>
      )}
    </div>
  )
}
```

## Storage and WebRTC Adapters

The package requires two adapters to be provided by the app:

### Storage Adapter

Apps should provide a `BaseStorage` implementation from `@yoroi/types` based on their environment:

- **React Native**: Create an adapter from `@react-native-async-storage/async-storage`
- **Browser**: Create an adapter from `localStorage`
- **Browser Extensions**: Create an adapter from `chrome.storage.local`

### WebRTC Adapter

Apps should provide a `WebRTCAdapter` implementation from `@yoroi/p2p-communication` based on their environment:

- **React Native**: Pass exports from `react-native-webrtc`:
  ```typescript
  import {RTCPeerConnection, RTCSessionDescription, RTCIceCandidate} from 'react-native-webrtc'
  
  const webrtcAdapter: WebRTCAdapter = {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
  }
  ```

- **Browser**: Pass native WebRTC APIs:
  ```typescript
  const webrtcAdapter: WebRTCAdapter = {
    RTCPeerConnection: window.RTCPeerConnection,
    RTCSessionDescription: window.RTCSessionDescription,
    RTCIceCandidate: window.RTCIceCandidate,
  }
  ```

Both adapters use dependency injection, allowing the package to work across different environments without hardcoded dependencies.

## API Reference

### ConnectionManager

Manages the lifecycle of peer connections and wallet communication.

```typescript
type ConnectionManager = {
  initialize: () => Promise<void>
  cleanup: () => void
  getPeerConnection: () => PeerConnection | null
  getWalletCommunication: () => WalletCommunication | null
  isInitialized: () => boolean
}
```

### MultiConnectionManager

Manages multiple simultaneous peer connections for wallet-to-wallet scenarios.

```typescript
type MultiConnectionManager = {
  initialize: () => Promise<string> // Returns your peer ID
  connectToPeer: (targetPeerId: string) => Promise<PeerConnection>
  getConnection: (peerId: string) => PeerConnection | null
  getAllConnections: () => ReadonlyArray<{
    readonly peerId: string
    readonly connection: PeerConnection
  }>
  disconnectFromPeer: (peerId: string) => void
  cleanup: () => void
  getMyPeerId: () => string
}
```

### PeerConnection

Manages WebRTC peer connections.

```typescript
type PeerConnection = {
  init: () => Promise<string> // Returns peer ID
  connectToPeer: (targetPeerId: string) => Promise<void> // NEW: Initiate wallet-to-wallet connection
  send: (data: unknown) => boolean
  reconnect: () => void
  destroy: () => void
  on: (event: keyof EventListener, callback: EventCallback) => void
  off: (event: keyof EventListener, callback: EventCallback) => void
  getPeerId: () => string
  getStatus: () => ConnectionStatus
  isReady: () => boolean
  getConnectedPeerId: () => string | null // NEW: Get currently connected peer ID
}
```

**Events:**
- `open`: Fired when peer connection is ready
- `connection`: Fired when data channel is established
- `peerConnected`: Fired when a specific peer connects (wallet-to-wallet)
- `data`: Fired when data is received
- `error`: Fired on errors
- `close`: Fired when connection closes
- `disconnected`: Fired when connection is disconnected
- `connectionClosed`: Fired when data channel closes

### WalletCommunication

High-level wallet communication service.

```typescript
type WalletCommunication = {
  sendMessage: (message: string) => boolean
  callWalletFunction: (method: string, data?: unknown) => boolean
  signTransaction: (txData?: unknown) => boolean
  disconnect: () => boolean
  on: (event: 'message' | 'connect' | 'disconnect' | 'error', callback: EventCallback) => void
  off: (event: 'message' | 'connect' | 'disconnect' | 'error', callback: EventCallback) => void
  isConnected: () => boolean
  getWalletId: () => string | null
}
```

## Message Protocol

The package uses a standardized message protocol:

### Request
```typescript
{
  type: 'request',
  method: string,
  data?: unknown,
  id: number
}
```

### Response
```typescript
{
  type: 'response',
  method: string,
  data?: unknown,
  error?: string,
  id: number
}
```

### Heartbeat
```typescript
{
  type: 'heartbeat',
  action: 'ping' | 'pong',
  timestamp: number,
  received?: number
}
```

## Connection Modes

### dApp → Wallet (Traditional)

- **dApp side**: Sets `isWallet: false` (or omits it, defaults to false)
- **Wallet side**: Sets `isWallet: true`
- dApp creates data channel and initiates connection
- Wallet waits for incoming connection
- **Backward compatible** with existing implementations

### Wallet → Wallet (New)

- Both sides set `isWallet: true`
- Initiating wallet calls `connectToPeer(targetPeerId)`
- Target wallet receives connection automatically
- Supports multiple simultaneous connections via `MultiConnectionManager`

## Signaling Server Requirements

The signaling server must support:

1. **Peer ID registration**: Receives `peer-id` messages when peers connect
2. **Message routing**: Routes messages to specific peers using `targetPeerId` when present
3. **Broadcast support**: Routes messages without `targetPeerId` to all connected peers (backward compatibility)

Signaling message format:
```typescript
{
  type: 'offer' | 'answer' | 'ice-candidate' | 'peer-id',
  peerId: string,
  targetPeerId?: string, // Optional: for wallet-to-wallet connections
  sdp?: string, // For offer/answer
  candidate?: unknown // For ice-candidate
}
```

## Platform Support

The package works in any environment where you can provide:
- A `BaseStorage` implementation (for persistent ID storage)
- A `WebRTCAdapter` implementation (for WebRTC APIs)

This includes:
- **React Native**: Provide `react-native-webrtc` exports as the adapter
- **Browser**: Provide native WebRTC APIs as the adapter
- **Browser Extension**: Provide native WebRTC APIs as the adapter

## Peer ID Sharing

For wallet-to-wallet connections, peer IDs can be shared via:
- QR codes
- Deep links
- Manual entry
- Any other mechanism your app supports

The peer ID format is: `wallet-{deviceHash}-{installTime}` or `dapp-{deviceHash}-{timestamp}`

## License

See main project license.
