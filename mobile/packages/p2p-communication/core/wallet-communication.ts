import {getLogger} from '@yoroi/common'

import {freeze} from 'immer'

import {CONNECTION_CONSTANTS} from '../constants'
import {EventCallback, HeartbeatMessage, WalletMessage} from '../types'
import {createWalletRequest, isHeartbeatMessage} from '../utils/message-utils'
import {PeerConnection} from './peer-connection'

/**
 * Wallet Communication State
 */
type WalletCommunicationState = {
  readonly walletId: string | null
  readonly connected: boolean
  readonly heartbeatInterval: ReturnType<typeof setInterval> | null
  readonly heartbeatTimeout: ReturnType<typeof setTimeout> | null
  readonly listeners: {
    readonly message: ReadonlyArray<EventCallback<WalletMessage>>
    readonly connect: ReadonlyArray<EventCallback<string>>
    readonly disconnect: ReadonlyArray<EventCallback<void>>
    readonly error: ReadonlyArray<EventCallback<Error>>
  }
}

/**
 * Wallet Communication API
 */
export type WalletCommunication = {
  readonly sendMessage: (message: string) => boolean
  readonly callWalletFunction: (method: string, data?: unknown) => boolean
  readonly signTransaction: (txData?: unknown) => boolean
  readonly disconnect: () => boolean
  readonly on: (
    event: 'message' | 'connect' | 'disconnect' | 'error',
    callback: EventCallback<unknown>,
  ) => void
  readonly off: (
    event: 'message' | 'connect' | 'disconnect' | 'error',
    callback: EventCallback<unknown>,
  ) => void
  readonly isConnected: () => boolean
}

type WalletCommunicationDeps = {
  readonly peerConnection: PeerConnection
}

const createInitialState = (): WalletCommunicationState =>
  freeze({
    walletId: null,
    connected: false,
    heartbeatInterval: null,
    heartbeatTimeout: null,
    listeners: {
      message: [],
      connect: [],
      disconnect: [],
      error: [],
    },
  } as const)

export const walletCommunicationMaker = (
  deps: WalletCommunicationDeps,
): WalletCommunication => {
  let state = createInitialState()
  const logger = getLogger()

  const updateState = (updates: Partial<WalletCommunicationState>): void => {
    state = freeze({...state, ...updates} as const)
  }

  const notifyListeners = <T>(
    event: keyof WalletCommunicationState['listeners'],
    data: T,
  ): void => {
    state.listeners[event].forEach((callback) => {
      try {
        ;(callback as EventCallback<T>)(data)
      } catch (error: unknown) {
        getLogger().error(
          error instanceof Error ? error : new Error(String(error)),
          {origin: 'p2p-communication', event: String(event)},
        )
      }
    })
  }

  const startHeartbeat = (): void => {
    stopHeartbeat()

    if (!state.connected || !deps.peerConnection.isReady()) {
      getLogger().debug('Cannot start heartbeat - no wallet connection', {
        origin: 'p2p-communication',
      })
      return
    }

    getLogger().log('Starting wallet heartbeat monitoring', {
      origin: 'p2p-communication',
    })

    const interval = setInterval(() => {
      if (!deps.peerConnection.isReady()) {
        stopHeartbeat()
        return
      }

      const pingTime = Date.now()

      // Clear any existing timeout before sending new ping
      if (state.heartbeatTimeout) {
        clearTimeout(state.heartbeatTimeout)
      }

      const success = deps.peerConnection.send({
        type: 'heartbeat',
        action: 'ping',
        timestamp: pingTime,
      })

      if (!success) {
        getLogger().error(new Error('Failed to send heartbeat'), {
          origin: 'p2p-communication',
          operation: 'heartbeat',
        })
        stopHeartbeat()
        if (state.connected) {
          updateState({connected: false})
          notifyListeners('disconnect', undefined)
        }
        return
      }

      getLogger().debug('Sent heartbeat ping to wallet', {
        origin: 'p2p-communication',
      })

      // Set timeout for waiting for pong response
      const timeout = setTimeout(() => {
        getLogger().warn('Wallet heartbeat timeout - connection may be dead', {
          origin: 'p2p-communication',
          operation: 'heartbeat',
        })
        if (state.connected) {
          updateState({connected: false})
          notifyListeners('disconnect', undefined)
        }
      }, CONNECTION_CONSTANTS.HEARTBEAT_TIMEOUT)

      updateState({heartbeatTimeout: timeout})
    }, CONNECTION_CONSTANTS.HEARTBEAT_INTERVAL)

    updateState({heartbeatInterval: interval})
  }

  const stopHeartbeat = (): void => {
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval)
    }
    if (state.heartbeatTimeout) {
      clearTimeout(state.heartbeatTimeout)
    }
    updateState({
      heartbeatInterval: null,
      heartbeatTimeout: null,
    })
  }

  const processHeartbeatMessage = (message: HeartbeatMessage): boolean => {
    if (message.action === 'ping') {
      deps.peerConnection.send({
        type: 'heartbeat',
        action: 'pong',
        timestamp: message.timestamp,
        received: Date.now(),
      })
      getLogger().debug('Received heartbeat ping, sent pong', {
        origin: 'p2p-communication',
      })
      return true
    }

    if (message.action === 'pong') {
      if (state.heartbeatTimeout) {
        clearTimeout(state.heartbeatTimeout)
        updateState({heartbeatTimeout: null})
      }
      const latency = Date.now() - message.timestamp
      getLogger().debug(`Wallet connection confirmed (${latency}ms latency)`, {
        origin: 'p2p-communication',
        latency,
      })

      if (!state.connected) {
        updateState({connected: true})
        notifyListeners('connect', deps.peerConnection.getPeerId())
      }
      return true
    }

    return false
  }

  const handleIncomingData = (data: unknown): void => {
    try {
      let message: WalletMessage
      if (typeof data === 'string') {
        message = JSON.parse(data) as WalletMessage
      } else if (typeof data === 'object' && data !== null) {
        message = data as WalletMessage
      } else {
        throw new Error('Invalid message format')
      }

      if (isHeartbeatMessage(message)) {
        processHeartbeatMessage(message)
        return
      }

      notifyListeners('message', message)
    } catch (error) {
      getLogger().error(error instanceof Error ? error : new Error(String(error)), {
        origin: 'p2p-communication',
        operation: 'parseMessage',
      })
      notifyListeners('error', new Error(`Failed to parse message: ${error}`))
    }
  }

  // Setup peer connection listeners
  const setupListeners = (): void => {
    deps.peerConnection.on('connection', () => {
      const walletId = deps.peerConnection.getPeerId()
      updateState({connected: true, walletId})
      notifyListeners('connect', walletId)
      startHeartbeat()
    })

    deps.peerConnection.on('connectionClosed', () => {
      updateState({connected: false})
      notifyListeners('disconnect', undefined)
      stopHeartbeat()
    })

    deps.peerConnection.on('data', handleIncomingData)
  }

  setupListeners()

  // Check if already connected
  if (deps.peerConnection.isReady()) {
    const walletId = deps.peerConnection.getPeerId()
    updateState({connected: true, walletId})
    notifyListeners('connect', walletId)
    startHeartbeat()
  }

  const sendMessage = (message: string): boolean => {
    if (!state.connected) {
      getLogger().warn('Cannot send: Not connected to wallet', {
        origin: 'p2p-communication',
      })
      return false
    }

    const messageObj = {message}
    return deps.peerConnection.send(messageObj)
  }

  const callWalletFunction = (
    method: string,
    data: unknown = null,
  ): boolean => {
    if (!state.connected) {
      getLogger().warn(`Cannot call ${method}: Not connected to wallet`, {
        origin: 'p2p-communication',
        method,
      })
      return false
    }

    const request = createWalletRequest(method, data)
    return deps.peerConnection.send(request)
  }

  const signTransaction = (txData: unknown = null): boolean => {
    if (!state.connected) {
      getLogger().warn('Cannot sign transaction: Not connected to wallet', {
        origin: 'p2p-communication',
      })
      return false
    }

    getLogger().log('Creating transaction signing request...', {
      origin: 'p2p-communication',
    })

    const defaultTxData = txData ?? {
      type: 'Payment',
      amount: '2.5 ADA',
      recipient: 'addr1qxyz...abc123',
      fee: '0.17 ADA',
      metadata: `dApp Payment #${Date.now()}`,
    }

    return callWalletFunction('signTx', defaultTxData)
  }

  const disconnect = (): boolean => {
    if (!state.connected) {
      getLogger().debug('Not connected to a wallet', {
        origin: 'p2p-communication',
      })
      return false
    }

    stopHeartbeat()

    // Close the P2P connection if peer connection is available
    // Note: In our implementation, the peer connection manages its own lifecycle
    // The wallet communication just tracks the connection state

    updateState({connected: false})
    notifyListeners('disconnect', undefined)

    return true
  }

  const on = (
    event: 'message' | 'connect' | 'disconnect' | 'error',
    callback: EventCallback,
  ): void => {
    const currentListeners = state.listeners[event]
    updateState({
      listeners: {
        ...state.listeners,

        [event]: [...currentListeners, callback],
      },
    })
  }

  const off = (
    event: 'message' | 'connect' | 'disconnect' | 'error',
    callback: EventCallback,
  ): void => {
    const currentListeners = state.listeners[event]
    updateState({
      listeners: {
        ...state.listeners,

        [event]: currentListeners.filter(
          (cb) => cb !== (callback as EventCallback<unknown>),
        ),
      },
    })
  }

  const isConnected = (): boolean => state.connected

  return freeze(
    {
      sendMessage,
      callWalletFunction,
      signTransaction,
      disconnect,
      on,
      off,
      isConnected,
    } as const,
    true,
  )
}
