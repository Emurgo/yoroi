import {getLogger} from '@yoroi/common'

import {freeze} from 'immer'

import {ConnectionManagerConfig} from '../types'
import {PeerConnection, peerConnectionMaker} from './peer-connection'
import {
  WalletCommunication,
  walletCommunicationMaker,
} from './wallet-communication'

/**
 * Connection Manager State
 */
type ConnectionManagerState = {
  readonly initialized: boolean
  readonly initPromise: Promise<void> | null
  readonly peerConnection: PeerConnection | null
  readonly walletCommunication: WalletCommunication | null
}

/**
 * Connection Manager API
 */
export type ConnectionManager = {
  readonly initialize: () => Promise<void>
  readonly cleanup: () => void
  readonly getPeerConnection: () => PeerConnection | null
  readonly getWalletCommunication: () => WalletCommunication | null
  readonly isInitialized: () => boolean
}

const createInitialState = (): ConnectionManagerState =>
  freeze({
    initialized: false,
    initPromise: null,
    peerConnection: null,
    walletCommunication: null,
  } as const)

export const connectionManagerMaker = (
  config: ConnectionManagerConfig,
): ConnectionManager => {
  let state = createInitialState()
  const logger = getLogger()

  const updateState = (updates: Partial<ConnectionManagerState>): void => {
    state = freeze({...state, ...updates} as const)
  }

  const initialize = async (): Promise<void> => {
    if (state.initialized) {
      logger.debug('Services already initialized', {
        origin: 'p2p-communication',
      })
      return
    }

    if (state.initPromise) {
      logger.debug('Services initialization in progress', {
        origin: 'p2p-communication',
      })
      return state.initPromise
    }

    logger.log('Initializing all services centrally', {
      origin: 'p2p-communication',
    })

    const performInit = async (): Promise<void> => {
      try {
        const peerConnection = peerConnectionMaker({
          storage: config.storage,
          webrtcAdapter: config.webrtcAdapter,
          config: config.peerConfig,
          isWallet: config.isWallet,
        })

        await peerConnection.init()

        const walletCommunication = walletCommunicationMaker({
          peerConnection,
        })

        updateState({
          initialized: true,
          peerConnection,
          walletCommunication,
        })

        logger.log('All services initialized successfully', {
          origin: 'p2p-communication',
        })
      } catch (error) {
        logger.error(
          error instanceof Error ? error : new Error(String(error)),
          {origin: 'p2p-communication', operation: 'initialize'},
        )
        updateState({initPromise: null})
        throw error
      }
    }

    const initPromise = performInit()
    updateState({initPromise})
    return initPromise
  }

  const cleanup = (): void => {
    if (!state.initialized) {
      return
    }

    logger.log('Cleaning up all services', {origin: 'p2p-communication'})

    if (state.peerConnection) {
      state.peerConnection.destroy()
    }

    updateState(createInitialState())
  }

  const getPeerConnection = (): PeerConnection | null => state.peerConnection

  const getWalletCommunication = (): WalletCommunication | null =>
    state.walletCommunication

  const isInitialized = (): boolean => state.initialized

  return freeze(
    {
      initialize,
      cleanup,
      getPeerConnection,
      getWalletCommunication,
      isInitialized,
    } as const,
    true,
  )
}
