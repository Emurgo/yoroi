import {getLogger} from '@yoroi/common'
import {BaseStorage} from '@yoroi/types'

import {freeze} from 'immer'

import {PEER_CONFIG} from '../constants'
import {
  ConnectionStatus,
  EventCallback,
  EventListener,
  PeerConnectionConfig,
  WebRTCAdapter,
} from '../types'
import {getPersistentDappId, getPersistentWalletId} from '../utils/id-utils'
import {
  type SignalingClient,
  type SignalingMessage,
  signalingClientMaker,
} from './signaling-client'

/**
 * Peer Connection State
 */
type PeerConnectionState = {
  readonly peer: RTCPeerConnection | null
  readonly dataChannel: RTCDataChannel | null
  readonly signaling: SignalingClient | null
  readonly connection: RTCDataChannel | null
  readonly isInitializing: boolean
  readonly initPromise: Promise<string> | null
  readonly listeners: EventListener
  readonly peerId: string
  readonly status: ConnectionStatus
  readonly connectedPeerId: string | null // Track which peer we're connected to
  readonly isInitiator: boolean // Track if we initiated this connection
}

/**
 * Peer Connection API
 */
export type PeerConnection = {
  readonly init: () => Promise<string>
  readonly connectToPeer: (targetPeerId: string) => Promise<void>
  readonly send: (data: unknown) => boolean
  readonly reconnect: () => void
  readonly destroy: () => void
  readonly on: (event: keyof EventListener, callback: EventCallback) => void
  readonly off: (event: keyof EventListener, callback: EventCallback) => void
  readonly getPeerId: () => string
  readonly getStatus: () => ConnectionStatus
  readonly isReady: () => boolean
  readonly getConnectedPeerId: () => string | null
}

type PeerConnectionDeps = {
  readonly storage: BaseStorage
  readonly webrtcAdapter: WebRTCAdapter
  readonly config?: PeerConnectionConfig
  readonly isWallet?: boolean
}

const createInitialState = (peerId: string): PeerConnectionState =>
  freeze({
    peer: null,
    dataChannel: null,
    signaling: null,
    connection: null,
    isInitializing: false,
    initPromise: null,
    listeners: {
      open: [],
      error: [],
      close: [],
      disconnected: [],
      connection: [],
      data: [],
      connectionClosed: [],
      peerConnected: [],
    },
    peerId,
    status: 'initializing',
    connectedPeerId: null,
    isInitiator: false,
  } as const)

export const peerConnectionMaker = (
  deps: PeerConnectionDeps,
): PeerConnection => {
  let state = createInitialState('')
  const logger = getLogger()

  const updateState = (updates: Partial<PeerConnectionState>): void => {
    state = freeze({...state, ...updates} as const)
  }

  const notifyListeners = <T>(event: keyof EventListener, data: T): void => {
    state.listeners[event].forEach((callback) => {
      try {
        ;(callback as EventCallback<T>)(data)
      } catch (error) {
        logger.error(
          error instanceof Error ? error : new Error(String(error)),
          {origin: 'p2p-communication', event: String(event)},
        )
      }
    })
  }

  const createPeerConnection = (): RTCPeerConnection | null => {
    try {
      const iceServers =
        deps.config?.iceServers ??
        PEER_CONFIG.iceServers.map((server) => ({
          urls: server.urls,
        }))

      return new deps.webrtcAdapter.RTCPeerConnection({
        iceServers: [...iceServers] as RTCIceServer[],
      })
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), {
        origin: 'p2p-communication',
        operation: 'createPeerConnection',
      })
      notifyListeners('error', new Error(`Failed to create peer: ${error}`))
      return null
    }
  }

  const setupDataChannel = (channel: RTCDataChannel): void => {
    channel.onopen = () => {
      logger.log('Data channel opened', {origin: 'p2p-communication'})
      updateState({connection: channel})
      notifyListeners('connection', channel)
    }

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        notifyListeners('data', data)
      } catch (error) {
        notifyListeners('data', event.data)
      }
    }

    channel.onclose = () => {
      logger.log('Data channel closed', {origin: 'p2p-communication'})
      updateState({connection: null})
      notifyListeners('connectionClosed', undefined)
    }

    channel.onerror = (error) => {
      logger.error(error instanceof Error ? error : new Error(String(error)), {
        origin: 'p2p-communication',
        operation: 'dataChannel',
      })
      notifyListeners('error', new Error(`Data channel error: ${error}`))
    }
  }

  const init = async (): Promise<string> => {
    // Check if peer is already connected and ready
    if (
      state.peer &&
      (state.peer.connectionState === 'connected' ||
        state.dataChannel?.readyState === 'open' ||
        state.connection?.readyState === 'open')
    ) {
      return state.peerId
    }

    if (state.isInitializing && state.initPromise) {
      return state.initPromise
    }

    updateState({isInitializing: true, status: 'initializing'})

    const performInit = async (): Promise<string> => {
      try {
        // Clean up existing connection
        if (state.peer) {
          state.peer.close()
          updateState({peer: null})
        }

        // Get persistent ID
        const persistentId = deps.isWallet
          ? await getPersistentWalletId(deps.storage)
          : await getPersistentDappId(deps.storage)

        updateState({peerId: persistentId})

        // Create peer connection
        const peer = createPeerConnection()
        if (!peer) {
          throw new Error('Failed to create RTCPeerConnection')
        }

        // Store signaling reference for ICE candidate callback
        let signalingRef: SignalingClient | null = null

        // Setup ICE candidate handling
        peer.onicecandidate = (event) => {
          if (event.candidate && signalingRef) {
            signalingRef.send({
              type: 'ice-candidate',
              candidate: event.candidate.toJSON(),
              peerId: persistentId,
              targetPeerId: state.connectedPeerId ?? undefined,
            })
          }
        }

        // Setup connection state changes
        peer.onconnectionstatechange = () => {
          const connectionState = peer.connectionState
          if (connectionState === 'connected') {
            updateState({status: 'connected'})
            notifyListeners('open', persistentId)
          } else if (connectionState === 'disconnected') {
            updateState({status: 'disconnected'})
            notifyListeners('disconnected', undefined)
          } else if (connectionState === 'failed') {
            updateState({status: 'error'})
            notifyListeners('error', new Error('Connection failed'))
          } else if (connectionState === 'closed') {
            updateState({status: 'closed'})
            notifyListeners('close', undefined)
          } else if (connectionState === 'connecting') {
            updateState({status: 'connecting'})
          }
        }

        // Create data channel (for dApp side OR wallet-initiated connections)
        // For backward compatibility: dApp always creates, wallet waits UNLESS connecting to specific peer
        if (!deps.isWallet || deps.config?.targetPeerId) {
          // dApp or wallet initiating connection - create data channel
          const dataChannel = peer.createDataChannel('messages', {
            ordered: true,
          })
          setupDataChannel(dataChannel)
          updateState({dataChannel})
        } else {
          // Wallet side: wait for data channel from remote (backward compatible)
          peer.ondatachannel = (event) => {
            const channel = event.channel
            setupDataChannel(channel)
          }
        }

        // Setup signaling if URL provided
        if (deps.config?.signalingUrl) {
          const signaling = signalingClientMaker({
            signalingUrl: deps.config.signalingUrl,
            peerId: persistentId,
            onMessage: (message) => {
              handleSignalingMessage(message, peer)
            },
            onError: (error) => {
              notifyListeners('error', error)
            },
            onOpen: () => {
              logger.log('Signaling connected', {origin: 'p2p-communication'})
              updateState({signaling})
            },
            onClose: () => {
              logger.log('Signaling disconnected', {
                origin: 'p2p-communication',
              })
            },
          })
          // Store reference for ICE candidate handler
          signalingRef = signaling
          updateState({signaling})
        }

        updateState({peer, isInitializing: false, status: 'ready'})

        return persistentId
      } catch (error) {
        updateState({isInitializing: false, status: 'error'})
        notifyListeners('error', error as Error)
        throw error
      }
    }

    const initPromise = performInit()
    updateState({initPromise})
    return initPromise
  }

  const connectToPeer = async (targetPeerId: string): Promise<void> => {
    if (!state.signaling || !state.signaling.isConnected()) {
      throw new Error('Signaling not connected. Call init() first.')
    }

    if (!state.peer) {
      throw new Error('Peer connection not initialized. Call init() first.')
    }

    if (state.connectedPeerId === targetPeerId) {
      logger.log('Already connected to peer', {
        origin: 'p2p-communication',
        peerId: targetPeerId,
      })
      return
    }

    // If we're a wallet and want to initiate, we need to create a data channel
    // and create an offer
    if (deps.isWallet) {
      try {
        updateState({
          isInitiator: true,
          connectedPeerId: targetPeerId,
          status: 'connecting',
        })

        // Create data channel for wallet-initiated connection
        const dataChannel = state.peer.createDataChannel('messages', {
          ordered: true,
        })
        setupDataChannel(dataChannel)
        updateState({dataChannel})

        // Create offer
        const offer = await state.peer.createOffer()
        await state.peer.setLocalDescription(offer)

        // Send offer through signaling
        if (state.signaling && state.peer.localDescription) {
          state.signaling.send({
            type: 'offer',
            sdp: state.peer.localDescription.sdp,
            peerId: state.peerId,
            targetPeerId: targetPeerId,
          })
        }
      } catch (error) {
        updateState({
          status: 'error',
          isInitiator: false,
          connectedPeerId: null,
        })
        notifyListeners(
          'error',
          new Error(`Failed to connect to peer: ${error}`),
        )
        throw error
      }
    } else {
      // dApp side - similar logic but already has data channel
      try {
        updateState({
          isInitiator: true,
          connectedPeerId: targetPeerId,
          status: 'connecting',
        })

        const offer = await state.peer.createOffer()
        await state.peer.setLocalDescription(offer)

        if (state.signaling && state.peer.localDescription) {
          state.signaling.send({
            type: 'offer',
            sdp: state.peer.localDescription.sdp,
            peerId: state.peerId,
            targetPeerId: targetPeerId,
          })
        }
      } catch (error) {
        updateState({
          status: 'error',
          isInitiator: false,
          connectedPeerId: null,
        })
        notifyListeners(
          'error',
          new Error(`Failed to connect to peer: ${error}`),
        )
        throw error
      }
    }
  }

  const handleSignalingMessage = (
    message: SignalingMessage,
    peer: RTCPeerConnection,
  ): void => {
    // Filter messages: if targetPeerId is set, only process if it matches our peerId
    // If no targetPeerId, it's a broadcast (backward compatible)
    const targetPeerId =
      'targetPeerId' in message ? message.targetPeerId : undefined
    if (targetPeerId && targetPeerId !== state.peerId) {
      // Message not for us, ignore
      return
    }

    if (message.type === 'offer') {
      // Only handle offer if we're not already connected or if it's from the peer we're waiting for
      if (state.connectedPeerId && state.connectedPeerId !== message.peerId) {
        logger.debug('Ignoring offer from different peer', {
          origin: 'p2p-communication',
          expectedPeerId: state.connectedPeerId,
          receivedPeerId: message.peerId,
        })
        return
      }

      peer
        .setRemoteDescription(
          new deps.webrtcAdapter.RTCSessionDescription({
            type: 'offer',
            sdp: message.sdp,
          }),
        )
        .then(() => peer.createAnswer())
        .then((answer) => peer.setLocalDescription(answer))
        .then(() => {
          if (state.signaling && peer.localDescription) {
            updateState({connectedPeerId: message.peerId, isInitiator: false})
            state.signaling.send({
              type: 'answer',
              sdp: peer.localDescription.sdp,
              peerId: state.peerId,
              targetPeerId: message.peerId, // Send answer back to the offerer
            })
            notifyListeners('peerConnected', message.peerId)
          }
        })
        .catch((error) => {
          notifyListeners(
            'error',
            new Error(`Failed to handle offer: ${error}`),
          )
        })
    } else if (message.type === 'answer') {
      // Only handle answer if we initiated and it's from the peer we're connecting to
      if (!state.isInitiator || state.connectedPeerId !== message.peerId) {
        logger.debug(
          'Ignoring answer - not from expected peer or not initiator',
          {
            origin: 'p2p-communication',
            isInitiator: state.isInitiator,
            expectedPeerId: state.connectedPeerId,
            receivedPeerId: message.peerId,
          },
        )
        return
      }

      peer
        .setRemoteDescription(
          new deps.webrtcAdapter.RTCSessionDescription({
            type: 'answer',
            sdp: message.sdp,
          }),
        )
        .then(() => {
          updateState({status: 'connected'})
          notifyListeners('peerConnected', message.peerId)
        })
        .catch((error) => {
          notifyListeners(
            'error',
            new Error(`Failed to handle answer: ${error}`),
          )
        })
    } else if (message.type === 'ice-candidate') {
      // Filter ICE candidates by targetPeerId if set
      const candidateTargetPeerId =
        'targetPeerId' in message ? message.targetPeerId : undefined
      if (candidateTargetPeerId && candidateTargetPeerId !== state.peerId) {
        return
      }

      if (message.candidate) {
        peer
          .addIceCandidate(
            new deps.webrtcAdapter.RTCIceCandidate(
              message.candidate as RTCIceCandidateInit,
            ),
          )
          .catch((error) => {
            notifyListeners(
              'error',
              new Error(`Failed to add ICE candidate: ${error}`),
            )
          })
      }
    }
  }

  const send = (data: unknown): boolean => {
    const channel = state.connection ?? state.dataChannel
    if (!channel || channel.readyState !== 'open') {
      logger.warn('Cannot send: No open data channel', {
        origin: 'p2p-communication',
      })
      return false
    }

    try {
      const serializedData =
        typeof data === 'string' ? data : JSON.stringify(data)
      channel.send(serializedData)
      return true
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), {
        origin: 'p2p-communication',
        operation: 'send',
      })
      return false
    }
  }

  const reconnect = (): void => {
    if (state.peer && state.peer.connectionState !== 'closed') {
      logger.log('Reconnecting peer connection...', {
        origin: 'p2p-communication',
      })
      updateState({status: 'reconnecting'})
      // Restart ICE
      try {
        state.peer.restartIce()
      } catch (error) {
        logger.error(
          error instanceof Error ? error : new Error(String(error)),
          {origin: 'p2p-communication', operation: 'restartIce'},
        )
        // If restart fails, create new connection
        destroy()
        init().catch((err) => {
          notifyListeners('error', err)
        })
      }
    } else {
      logger.log('Creating new peer connection...', {
        origin: 'p2p-communication',
      })
      updateState({status: 'reconnecting'})
      init().catch((error) => {
        notifyListeners('error', error)
      })
    }
  }

  const destroy = (): void => {
    if (state.connection) {
      state.connection.close()
    }
    if (state.dataChannel) {
      state.dataChannel.close()
    }
    if (state.signaling) {
      state.signaling.close()
    }
    if (state.peer) {
      state.peer.close()
    }

    updateState(createInitialState(''))
  }

  const on = (event: keyof EventListener, callback: EventCallback): void => {
    const currentListeners = state.listeners[event]
    updateState({
      listeners: {
        ...state.listeners,

        [event]: [...currentListeners, callback],
      },
    })
  }

  const off = (event: keyof EventListener, callback: EventCallback): void => {
    const currentListeners = state.listeners[event]
    updateState({
      listeners: {
        ...state.listeners,

        [event]: currentListeners.filter((cb) => cb !== callback),
      },
    })
  }

  const getPeerId = (): string => state.peerId

  const getStatus = (): ConnectionStatus => state.status

  const getConnectedPeerId = (): string | null => state.connectedPeerId

  const isReady = (): boolean => {
    return (
      (state.status === 'ready' || state.status === 'connected') &&
      state.peer !== null &&
      (state.peer.connectionState === 'connected' ||
        state.peer.connectionState === 'connecting' ||
        state.dataChannel?.readyState === 'open' ||
        state.connection?.readyState === 'open')
    )
  }

  return freeze(
    {
      init,
      connectToPeer,
      send,
      reconnect,
      destroy,
      on,
      off,
      getPeerId,
      getStatus,
      isReady,
      getConnectedPeerId,
    } as const,
    true,
  )
}
