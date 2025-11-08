import {App, BaseStorage} from '@yoroi/types'

import {freeze} from 'immer'

import {PeerConnectionConfig, WebRTCAdapter} from '../types'
import {PeerConnection, peerConnectionMaker} from './peer-connection'

/**
 * Multi-Connection Manager State
 */
type MultiConnectionManagerState = {
  readonly myPeerId: string
  readonly connections: ReadonlyMap<string, PeerConnection>
  readonly initialized: boolean
}

/**
 * Multi-Connection Manager API
 * Manages multiple simultaneous peer connections for wallet-to-wallet scenarios
 */
export type MultiConnectionManager = {
  readonly initialize: () => Promise<string>
  readonly connectToPeer: (targetPeerId: string) => Promise<PeerConnection>
  readonly getConnection: (peerId: string) => PeerConnection | null
  readonly getAllConnections: () => ReadonlyArray<{
    readonly peerId: string
    readonly connection: PeerConnection
  }>
  readonly disconnectFromPeer: (peerId: string) => void
  readonly cleanup: () => void
  readonly getMyPeerId: () => string
}

export const multiConnectionManagerMaker = (
  storage: BaseStorage,
  webrtcAdapter: WebRTCAdapter,
  peerConfig?: PeerConnectionConfig,
  logger?: App.Logger.Manager,
): MultiConnectionManager => {
  let state: MultiConnectionManagerState = freeze({
    myPeerId: '',
    connections: new Map(),
    initialized: false,
  } as const)

  const updateState = (updates: Partial<MultiConnectionManagerState>): void => {
    state = freeze({...state, ...updates} as const)
  }

  const initialize = async (): Promise<string> => {
    if (state.initialized) {
      return state.myPeerId
    }

    // Create a base peer connection for receiving connections
    const baseConnection = peerConnectionMaker({
      storage,
      webrtcAdapter,
      config: peerConfig,
      isWallet: true, // Assume wallet for multi-wallet scenario
      logger,
    })

    const peerId = await baseConnection.init()

    updateState({
      myPeerId: peerId,
      initialized: true,
      connections: new Map([['base', baseConnection]]),
    })

    return peerId
  }

  const connectToPeer = async (
    targetPeerId: string,
  ): Promise<PeerConnection> => {
    if (!state.initialized) {
      await initialize()
    }

    // Check if connection already exists
    const existing = Array.from(state.connections.values()).find(
      (conn) => conn.getConnectedPeerId() === targetPeerId,
    )
    if (existing) {
      return existing
    }

    // Create new connection for this specific peer
    const connection = peerConnectionMaker({
      storage,
      webrtcAdapter,
      config: {
        ...peerConfig,
        targetPeerId,
      },
      isWallet: true,
      logger,
    })

    await connection.init()
    await connection.connectToPeer(targetPeerId)

    const newConnections = new Map(state.connections)
    newConnections.set(targetPeerId, connection)
    updateState({connections: newConnections})

    return connection
  }

  const getConnection = (peerId: string): PeerConnection | null => {
    return state.connections.get(peerId) ?? null
  }

  const getAllConnections = (): ReadonlyArray<{
    readonly peerId: string
    readonly connection: PeerConnection
  }> => {
    return Array.from(state.connections.entries()).map(
      ([peerId, connection]) => ({
        peerId,
        connection,
      }),
    )
  }

  const disconnectFromPeer = (peerId: string): void => {
    const connection = state.connections.get(peerId)
    if (connection) {
      connection.destroy()
      const newConnections = new Map(state.connections)
      newConnections.delete(peerId)
      updateState({connections: newConnections})
    }
  }

  const cleanup = (): void => {
    state.connections.forEach((conn) => conn.destroy())
    updateState({
      connections: new Map(),
      initialized: false,
      myPeerId: '',
    })
  }

  const getMyPeerId = (): string => state.myPeerId

  return freeze(
    {
      initialize,
      connectToPeer,
      getConnection,
      getAllConnections,
      disconnectFromPeer,
      cleanup,
      getMyPeerId,
    } as const,
    true,
  )
}
