/**
 * P2P Connection Screen
 *
 * IMPORTANT: This is the ONLY screen in the app where P2P connections are established.
 * All P2P connection logic is isolated here to prevent unwanted connections elsewhere.
 * When this screen unmounts, all connections are cleaned up.
 */
import {
  type ConnectionManager,
  type ConnectionStatus,
  type WebRTCAdapter,
  buildSignalingUrl,
  connectionManagerMaker,
  generateCIP158P2PDeeplink,
  parseSignalingUrl,
} from '@yoroi/p2p-communication'
import {atoms as a, useTheme} from '@yoroi/theme'
import {type BaseStorage} from '@yoroi/types'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {
  GestureResponderEvent,
  KeyboardAvoidingView,
  Platform,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc'

import {useP2PConnection} from '~/features/P2P/context/P2PConnectionProvider'
import {logger} from '~/kernel/logger/logger'
import {rootStorage} from '~/kernel/storage/storages'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Icon} from '~/ui/Icon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
import {Tab, TabPanel, TabPanels, Tabs} from '~/ui/Tabs/Tabs'

type Params = {
  dappPeer?: string
  host?: string
  port?: string
  path?: string
  secure?: boolean
}

type ConnectionState = {
  status: ConnectionStatus
  error: string | null
  isReconnecting: boolean
  lastStatusUpdate: number
  signalingServerFailed: boolean
  signalingConnected: boolean
}

const Label = ({children}: {children: string}) => {
  const {atoms: ta} = useTheme()

  return (
    <Text
      style={[
        a.pt_lg,
        a.body_2_md_regular,
        ta.text_gray_medium,
        {marginBottom: 8},
      ]}
    >
      {children}
    </Text>
  )
}

const createWebRTCAdapter = (): WebRTCAdapter => {
  return {
    RTCPeerConnection:
      RTCPeerConnection as unknown as WebRTCAdapter['RTCPeerConnection'],
    RTCSessionDescription:
      RTCSessionDescription as unknown as WebRTCAdapter['RTCSessionDescription'],
    RTCIceCandidate:
      RTCIceCandidate as unknown as WebRTCAdapter['RTCIceCandidate'],
  }
}

const createStorageAdapter = (): BaseStorage => {
  return {
    getItem: async (key: string) => {
      const value = await rootStorage.getItem(key)
      return typeof value === 'string' ? value : null
    },
    setItem: async (key: string, value: string) => {
      await rootStorage.setItem(key, value)
    },
    removeItem: async (key: string) => {
      await rootStorage.removeItem(key)
    },
  }
}

type ChatInputProps = {
  chatInput: string
  setChatInput: (text: string) => void
  handleSendMessage: () => void
}

const ChatInput = React.memo<ChatInputProps>(
  ({chatInput, setChatInput, handleSendMessage}) => {
    const {palette: p} = useTheme()
    const hasText = React.useMemo(
      () => chatInput.trim().length > 0,
      [chatInput],
    )

    return (
      <View
        style={[
          a.flex_row,
          a.align_center,
          a.px_lg,
          a.py_md,
          {
            backgroundColor: p.bg_color_max,
            borderTopWidth: 1,
            borderTopColor: p.gray_200,
            gap: 12,
          },
        ]}
      >
        <View
          style={[
            a.flex_1,
            a.flex_row,
            a.align_center,
            {
              backgroundColor: p.gray_100,
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 10 : 8,
              minHeight: 48,
              maxHeight: 100,
            },
          ]}
        >
          <RNTextInput
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Type a message..."
            placeholderTextColor={p.gray_600}
            multiline
            style={[
              a.flex_1,
              a.body_2_md_regular,
              {
                color: p.gray_max,
                paddingVertical: 0,
                paddingRight: 8,
                maxHeight: 84,
              },
            ]}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
        </View>
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={!hasText}
          style={[
            {
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: hasText ? p.primary_600 : p.gray_300,
              alignItems: 'center',
              justifyContent: 'center',
            },
            !hasText && {
              opacity: 0.5,
            },
          ]}
          activeOpacity={0.7}
        >
          <Icon.Send size={20} color={hasText ? p.white_static : p.gray_600} />
        </TouchableOpacity>
      </View>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if chatInput or handleSendMessage changes
    return (
      prevProps.chatInput === nextProps.chatInput &&
      prevProps.handleSendMessage === nextProps.handleSendMessage
    )
  },
)

export const P2PConnectionScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const params = useRoute().params as Params
  const {scrollViewRef} = useScrollView()
  const {registerConnection, unregisterConnection} = useP2PConnection()

  // Extract and normalize parameters
  const targetPeerId = React.useMemo(() => {
    return params.dappPeer || ''
  }, [params.dappPeer])

  const signalingUrl = React.useMemo(() => {
    // Build signaling URL from host/port/path/secure
    if (params.host) {
      return buildSignalingUrl({
        host: params.host,
        port: params.port,
        path: params.path,
        secure: params.secure !== false, // Default to true if not specified
      })
    }
    return undefined
  }, [params.host, params.port, params.path, params.secure])

  const [myPeerId, setMyPeerId] = React.useState<string>('')
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    {
      status: 'initializing',
      error: null,
      isReconnecting: false,
      lastStatusUpdate: Date.now(),
      signalingServerFailed: false,
      signalingConnected: false,
    },
  )
  const [connectedPeerId, setConnectedPeerId] = React.useState<string | null>(
    null,
  )
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [connectionManager, setConnectionManager] =
    React.useState<ConnectionManager | null>(null)
  const [activeTab, setActiveTab] = React.useState<
    'connection' | 'share' | 'chat'
  >('connection')
  const [chatMessages, setChatMessages] = React.useState<
    Array<{id: string; text: string; isSent: boolean; timestamp: number}>
  >([])
  const [chatInput, setChatInput] = React.useState('')
  const chatScrollViewRef = React.useRef<RNScrollView>(null)
  const scrollToEndTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const webrtcAdapter = React.useMemo(() => createWebRTCAdapter(), [])
  const storageAdapter = React.useMemo(() => createStorageAdapter(), [])

  // Track if we should recreate the manager (for retry)
  const shouldRecreateManager = React.useRef(false)

  // IMPORTANT: This is the ONLY place in the app where P2P connections are established.
  // All P2P connection logic is isolated to this screen to prevent unwanted connections.
  React.useEffect(() => {
    // Only create manager if we don't have one OR if retry was requested
    if (connectionManager && !shouldRecreateManager.current) {
      return
    }

    // Reset retry flag
    shouldRecreateManager.current = false

    logger.log('P2P: Creating new connection manager', {
      origin: 'P2PConnectionScreen',
      targetPeerId,
      signalingUrl: signalingUrl || 'default',
      isRetry: !connectionManager,
    })

    const manager = connectionManagerMaker({
      storage: storageAdapter,
      webrtcAdapter,
      peerConfig: {
        signalingUrl:
          signalingUrl ||
          process.env.EXPO_PUBLIC_P2P_SIGNALING_URL ||
          'wss://0.peerjs.com/peerjs',
        targetPeerId,
      },
      isWallet: true,
    })

    setConnectionManager(manager)

    let cleanupEventListeners: (() => void) | null = null

    const initializeConnection = async (): Promise<void> => {
      try {
        setIsConnecting(true)
        logger.log('P2P: Initializing connection', {
          origin: 'P2PConnectionScreen',
          targetPeerId,
          signalingUrl: signalingUrl || 'default',
        })
        setConnectionState({
          status: 'initializing',
          error: null,
          isReconnecting: false,
          lastStatusUpdate: Date.now(),
          signalingServerFailed: false,
          signalingConnected: false,
        })
        await manager.initialize()
        const peerConnection = manager.getPeerConnection()
        if (peerConnection) {
          const id = peerConnection.getPeerId()
          logger.log('P2P: Connection initialized', {
            origin: 'P2PConnectionScreen',
            myPeerId: id,
            targetPeerId,
          })
          setMyPeerId(id)

          // Listen for connection events
          const handleOpen = (data?: unknown) => {
            const peerId = typeof data === 'string' ? data : ''
            logger.log('P2P: Peer connection opened', {
              origin: 'P2PConnectionScreen',
              myPeerId: peerId || id,
            })
            setConnectionState((prev) => ({
              ...prev,
              status: 'ready',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
              signalingConnected: prev.signalingConnected,
            }))
            setMyPeerId(peerId || id)
            setIsConnecting(false)
          }

          const handlePeerConnected = (data?: unknown) => {
            const peerId = typeof data === 'string' ? data : ''
            logger.log('P2P: Peer connected', {
              origin: 'P2PConnectionScreen',
              myPeerId: id,
              connectedPeerId: peerId,
            })
            setConnectionState((prev) => ({
              ...prev,
              status: 'connected',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
              signalingConnected: prev.signalingConnected,
            }))
            setConnectedPeerId(peerId)
            setIsConnecting(false)
            // Register connection with global provider
            registerConnection(manager, peerId)
          }

          const handleError = (data?: unknown) => {
            logger.warn('P2P: Connection error received', {
              origin: 'P2PConnectionScreen',
              myPeerId: id,
              error: data,
            })
            let errorMessage = 'Unknown error'
            let isSignalingError = false

            if (data instanceof Error) {
              errorMessage = data.message || String(data)
              // Check if the error message contains [object Object] - this means
              // the original error was an object that was stringified incorrectly
              if (errorMessage.includes('[object Object]')) {
                // If it's a WebSocket error, provide a more specific message
                if (errorMessage.includes('WebSocket error')) {
                  errorMessage = 'WebSocket connection error'
                  isSignalingError = true
                } else {
                  // Try to extract more info from the error object itself
                  const errorObj = data as Error & Record<string, unknown>
                  const keys = Object.keys(errorObj).filter(
                    (key) =>
                      key !== 'message' && key !== 'stack' && key !== 'name',
                  )
                  if (keys.length > 0) {
                    const extraInfo = keys
                      .map((key) => {
                        const value = errorObj[key]
                        if (typeof value === 'string') {
                          return `${key}: ${value}`
                        }
                        return key
                      })
                      .join(', ')
                    errorMessage = errorMessage.replace(
                      '[object Object]',
                      extraInfo || 'Unknown error',
                    )
                  } else {
                    // Replace [object Object] with a more meaningful message
                    errorMessage = errorMessage.replace(
                      '[object Object]',
                      'Connection error',
                    )
                  }
                }
              } else if (
                errorMessage.includes('WebSocket') ||
                errorMessage.includes('signaling') ||
                errorMessage.includes('Failed to create WebSocket')
              ) {
                isSignalingError = true
              }
            } else if (data && typeof data === 'object') {
              // Handle error objects that might have message, error, or other properties
              const errorObj = data as Record<string, unknown>
              if (typeof errorObj.message === 'string') {
                errorMessage = errorObj.message
                // Check if message contains [object Object]
                if (errorMessage.includes('[object Object]')) {
                  const keys = Object.keys(errorObj).filter(
                    (key) => key !== 'message',
                  )
                  if (keys.length > 0) {
                    errorMessage = `Error: ${keys.join(', ')}`
                  } else {
                    errorMessage = 'Connection error'
                  }
                }
                if (
                  errorMessage.includes('WebSocket') ||
                  errorMessage.includes('signaling')
                ) {
                  isSignalingError = true
                }
              } else if (typeof errorObj.error === 'string') {
                errorMessage = errorObj.error
                if (
                  errorMessage.includes('WebSocket') ||
                  errorMessage.includes('signaling')
                ) {
                  isSignalingError = true
                }
              } else {
                // Try to extract meaningful info from the object
                const keys = Object.keys(errorObj)
                if (keys.length > 0) {
                  const info = keys
                    .map((key) => {
                      const value = errorObj[key]
                      if (typeof value === 'string') {
                        return `${key}: ${value}`
                      } else if (value !== null && value !== undefined) {
                        return key
                      }
                      return null
                    })
                    .filter((v) => v !== null)
                    .join(', ')
                  errorMessage = info || 'Connection error'
                } else {
                  errorMessage = 'Connection error'
                }
              }
            } else if (typeof data === 'string') {
              errorMessage = data
              // Check if string contains [object Object]
              if (errorMessage.includes('[object Object]')) {
                if (errorMessage.includes('WebSocket error')) {
                  errorMessage = 'WebSocket connection error'
                  isSignalingError = true
                } else {
                  errorMessage = 'Connection error'
                }
              } else if (
                errorMessage.includes('WebSocket') ||
                errorMessage.includes('signaling')
              ) {
                isSignalingError = true
              }
            } else if (data !== null && data !== undefined) {
              const stringified = String(data)
              if (stringified === '[object Object]') {
                errorMessage = 'Connection error'
              } else {
                errorMessage = stringified
              }
            }

            const error = data instanceof Error ? data : new Error(errorMessage)
            setConnectionState((prev) => ({
              ...prev,
              status: 'error',
              error: errorMessage,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: isSignalingError,
              signalingConnected: isSignalingError
                ? false
                : prev.signalingConnected,
            }))
            setIsConnecting(false)
            // Log handled/recoverable errors as warnings
            const isHandledError =
              errorMessage.includes('Signaling not connected') ||
              errorMessage.includes('WebSocket error') ||
              isSignalingError
            if (isHandledError) {
              logger.warn('P2P: Handled error', {
                origin: 'P2PConnectionScreen',
                myPeerId: id,
                error: errorMessage,
                isSignalingError,
              })
            } else {
              logger.warn('P2P: Connection error', {
                origin: 'P2PConnectionScreen',
                myPeerId: id,
                error,
              })
            }
          }

          const handleClose = () => {
            logger.log('P2P: Connection closed', {
              origin: 'P2PConnectionScreen',
              myPeerId: id,
            })
            setConnectionState((prev) => ({
              ...prev,
              status: 'closed',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
              signalingConnected: false,
            }))
            setConnectedPeerId(null)
          }

          const handleDisconnected = () => {
            logger.log('P2P: Disconnected', {
              origin: 'P2PConnectionScreen',
              myPeerId: id,
              connectedPeerId,
            })
            setConnectionState((prev) => ({
              ...prev,
              status: 'disconnected',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
              signalingConnected: false,
            }))
            setConnectedPeerId(null)
          }

          const handleConnectionClosed = () => {
            logger.log('P2P: Connection closed event', {
              origin: 'P2PConnectionScreen',
              myPeerId: id,
            })
            setConnectionState((prev) => ({
              ...prev,
              status: 'disconnected',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
              signalingConnected: false,
            }))
          }

          peerConnection.on('open', handleOpen)
          peerConnection.on('peerConnected', handlePeerConnected)
          peerConnection.on('error', handleError)
          peerConnection.on('close', handleClose)
          peerConnection.on('disconnected', handleDisconnected)
          peerConnection.on('connectionClosed', handleConnectionClosed)

          // Store cleanup function
          cleanupEventListeners = () => {
            peerConnection.off('open', handleOpen)
            peerConnection.off('peerConnected', handlePeerConnected)
            peerConnection.off('error', handleError)
            peerConnection.off('close', handleClose)
            peerConnection.off('disconnected', handleDisconnected)
            peerConnection.off('connectionClosed', handleConnectionClosed)
          }

          // Connect to target peer if provided
          // But only if signaling is connected (if signaling URL is configured)
          if (targetPeerId) {
            const hasSignaling = !!(
              signalingUrl ||
              process.env.EXPO_PUBLIC_P2P_SIGNALING_URL ||
              'wss://0.peerjs.com/peerjs'
            )
            logger.log('P2P: Target peer ID provided', {
              origin: 'P2PConnectionScreen',
              myPeerId: id,
              targetPeerId,
              hasSignaling,
            })
            // Wait a bit for signaling to connect if needed
            if (hasSignaling) {
              // Don't auto-connect, wait for user to click Connect button
              // This ensures signaling is connected first
              logger.log(
                'P2P: Waiting for signaling connection before auto-connecting',
                {
                  origin: 'P2PConnectionScreen',
                  myPeerId: id,
                },
              )
            } else {
              // No signaling server, can connect immediately
              logger.log('P2P: Auto-connecting to peer (no signaling)', {
                origin: 'P2PConnectionScreen',
                myPeerId: id,
                targetPeerId,
              })
              setConnectionState((prev) => ({
                ...prev,
                status: 'connecting',
                error: null,
                isReconnecting: false,
                lastStatusUpdate: Date.now(),
                signalingServerFailed: false,
              }))
              await peerConnection.connectToPeer(targetPeerId)
            }
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        const isSignalingError =
          err.message.includes('WebSocket') ||
          err.message.includes('signaling') ||
          err.message.includes('Failed to create WebSocket') ||
          err.message.includes('Signaling not connected')
        // Log handled/recoverable errors as warnings
        if (isSignalingError) {
          logger.warn('P2P: Signaling error during initialization', {
            origin: 'P2PConnectionScreen',
            myPeerId: myPeerId || 'unknown',
            error: err.message,
            targetPeerId,
          })
        } else {
          logger.error('P2P: Initialization error', {
            origin: 'P2PConnectionScreen',
            myPeerId: myPeerId || 'unknown',
            error: err,
            targetPeerId,
          })
        }
        setConnectionState({
          status: 'error',
          error: err.message,
          isReconnecting: false,
          lastStatusUpdate: Date.now(),
          signalingServerFailed: isSignalingError,
          signalingConnected: false,
        })
        setIsConnecting(false)
      }
    }

    initializeConnection()

    // Cleanup: Ensure all connections are properly closed when leaving this screen
    return () => {
      if (cleanupEventListeners) {
        cleanupEventListeners()
      }
      if (manager) {
        manager.cleanup()
        // Unregister from global provider
        unregisterConnection()
        // Clear the connection manager reference to prevent any lingering connections
        setConnectionManager(null)
      }
    }
    // Note: myPeerId and connectedPeerId are state variables set inside this effect,
    // they don't need to be dependencies as they're not used to determine when to run the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    webrtcAdapter,
    storageAdapter,
    targetPeerId,
    signalingUrl,
    registerConnection,
    unregisterConnection,
    // connectionManager is NOT in dependencies to prevent infinite loops
    // Retry is handled via shouldRecreateManager ref
  ])

  // Set up chat message listener
  React.useEffect(() => {
    if (!connectionManager || !connectedPeerId) return

    const walletCommunication = connectionManager.getWalletCommunication()
    if (!walletCommunication) return

    const handleMessage = (message?: unknown) => {
      const currentPeerId = myPeerId
      const currentConnectedPeerId = connectedPeerId
      if (!message || typeof message !== 'object') return

      logger.log('P2P: Message received', {
        origin: 'P2PConnectionScreen',
        myPeerId: currentPeerId,
        connectedPeerId: currentConnectedPeerId,
        messageType:
          typeof message === 'object' && 'type' in message
            ? (message as {type?: unknown}).type
            : 'unknown',
      })

      // Handle different message formats
      const messageObj = message as Record<string, unknown>

      // Check if it's a simple chat message
      if ('message' in messageObj && typeof messageObj.message === 'string') {
        logger.log('P2P: Chat message received', {
          origin: 'P2PConnectionScreen',
          myPeerId: currentPeerId,
          connectedPeerId: currentConnectedPeerId,
          messageLength: messageObj.message.length,
        })
        const newMessage = {
          id: `${Date.now()}-${Math.random()}`,
          text: messageObj.message,
          isSent: false,
          timestamp: Date.now(),
        }
        setChatMessages((prev) => [...prev, newMessage])

        // Scroll to bottom when new message arrives
        if (scrollToEndTimeoutRef.current) {
          clearTimeout(scrollToEndTimeoutRef.current)
        }
        scrollToEndTimeoutRef.current = setTimeout(() => {
          chatScrollViewRef.current?.scrollToEnd({animated: true})
        }, 100)
        return
      }

      // Handle WalletMessage types that might contain chat data
      if ('type' in messageObj && messageObj.type === 'request') {
        const request = messageObj as {method?: string; data?: unknown}
        if (request.method === 'chat' && request.data) {
          const data = request.data as Record<string, unknown>
          if (typeof data.message === 'string') {
            logger.log('P2P: Chat request message received', {
              origin: 'P2PConnectionScreen',
              myPeerId: currentPeerId,
              connectedPeerId: currentConnectedPeerId,
              messageLength: data.message.length,
            })
            const newMessage = {
              id: `${Date.now()}-${Math.random()}`,
              text: data.message,
              isSent: false,
              timestamp: Date.now(),
            }
            setChatMessages((prev) => [...prev, newMessage])
            if (scrollToEndTimeoutRef.current) {
              clearTimeout(scrollToEndTimeoutRef.current)
            }
            scrollToEndTimeoutRef.current = setTimeout(() => {
              chatScrollViewRef.current?.scrollToEnd({animated: true})
            }, 100)
          }
        }
      }
    }

    walletCommunication.on('message', handleMessage)

    return () => {
      walletCommunication.off('message', handleMessage)
    }
  }, [connectionManager, connectedPeerId, myPeerId])

  // Poll connection status and signaling status for real-time updates
  React.useEffect(() => {
    if (!connectionManager) return

    const peerConnection = connectionManager.getPeerConnection()
    if (!peerConnection) return

    // Stop polling if signaling server has failed
    if (connectionState.signalingServerFailed) {
      return
    }

    let intervalId: ReturnType<typeof setInterval> | null = null

    const pollStatus = () => {
      // Get current status without triggering re-render if unchanged
      const status = peerConnection.getStatus()
      const currentConnectedId = peerConnection.getConnectedPeerId()

      // Check signaling connection status
      const hasSignaling = !!(
        signalingUrl ||
        process.env.EXPO_PUBLIC_P2P_SIGNALING_URL ||
        'wss://0.peerjs.com/peerjs'
      )

      const signalingConnected = hasSignaling
        ? status === 'ready' || status === 'connected'
        : true

      // Use functional update to check if we actually need to update
      setConnectionState((prev) => {
        // Stop polling if signaling server failed - clear interval and don't update
        if (prev.signalingServerFailed) {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          return prev
        }

        // Only update if something actually changed
        const statusChanged = prev.status !== status
        const signalingChanged = prev.signalingConnected !== signalingConnected
        const isReconnecting =
          prev.status === 'disconnected' && status === 'connecting'

        if (
          statusChanged ||
          signalingChanged ||
          isReconnecting !== prev.isReconnecting
        ) {
          return {
            ...prev,
            status,
            signalingConnected,
            isReconnecting,
            lastStatusUpdate: Date.now(),
          }
        }
        // Return prev to prevent re-render if nothing changed
        return prev
      })

      // Only update connectedPeerId if it actually changed
      if (currentConnectedId !== connectedPeerId) {
        setConnectedPeerId(currentConnectedId)
      }
    }

    intervalId = setInterval(pollStatus, 2000) // Poll every 2 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionManager, connectionState.signalingServerFailed, signalingUrl])

  const handleDisconnect = React.useCallback(() => {
    if (connectionManager) {
      logger.log('P2P: Disconnecting', {
        origin: 'P2PConnectionScreen',
        myPeerId,
        connectedPeerId,
      })
      connectionManager.cleanup()
      unregisterConnection()
      setConnectionState({
        status: 'disconnected',
        error: null,
        isReconnecting: false,
        lastStatusUpdate: Date.now(),
        signalingServerFailed: false,
        signalingConnected: false,
      })
      setConnectedPeerId(null)
      setConnectionManager(null)
    }
  }, [connectionManager, myPeerId, connectedPeerId, unregisterConnection])

  // Retry connection initialization
  const handleRetry = React.useCallback(() => {
    logger.log('P2P: Retrying connection', {
      origin: 'P2PConnectionScreen',
      myPeerId,
      targetPeerId,
    })

    // Clean up existing connection if any
    if (connectionManager) {
      try {
        connectionManager.cleanup()
      } catch (error) {
        logger.warn('P2P: Error during cleanup on retry', {
          origin: 'P2PConnectionScreen',
          error,
        })
      }
      unregisterConnection()
    }

    // Reset all state
    setMyPeerId('')
    setConnectedPeerId(null)
    setIsConnecting(false)
    setConnectionState({
      status: 'initializing',
      error: null,
      isReconnecting: false,
      lastStatusUpdate: Date.now(),
      signalingServerFailed: false,
      signalingConnected: false,
    })

    // Set flag to recreate manager and clear current one
    shouldRecreateManager.current = true
    setConnectionManager(null)
  }, [connectionManager, myPeerId, targetPeerId, unregisterConnection])

  const getStatusDisplayText = (): string => {
    const {status, error, isReconnecting} = connectionState
    if (isReconnecting) {
      return 'Reconnecting...'
    }
    if (error) {
      return `${status.charAt(0).toUpperCase() + status.slice(1)}: ${error}`
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getStatusColor = (): string => {
    const {status} = connectionState
    switch (status) {
      case 'connected':
        return '#4CAF50' // Green
      case 'ready':
        return '#2196F3' // Blue
      case 'connecting':
      case 'initializing':
        return '#FF9800' // Orange
      case 'error':
        return '#F44336' // Red
      case 'disconnected':
      case 'closed':
        return '#9E9E9E' // Gray
      case 'reconnecting':
        return '#FF9800' // Orange
      default:
        return '#9E9E9E' // Gray
    }
  }

  const handleSendMessage = React.useCallback(() => {
    if (!chatInput.trim() || !connectionManager || !connectedPeerId) return

    const walletCommunication = connectionManager.getWalletCommunication()
    if (!walletCommunication) {
      logger.warn(
        'P2P: Cannot send message - wallet communication not available',
        {
          origin: 'P2PConnectionScreen',
          myPeerId,
          connectedPeerId,
        },
      )
      return
    }

    const messageText = chatInput.trim()
    logger.log('P2P: Sending chat message', {
      origin: 'P2PConnectionScreen',
      myPeerId,
      connectedPeerId,
      messageLength: messageText.length,
    })

    // Send message
    const success = walletCommunication.sendMessage(messageText)

    if (success) {
      logger.log('P2P: Message sent successfully', {
        origin: 'P2PConnectionScreen',
        myPeerId,
        connectedPeerId,
        messageLength: messageText.length,
      })
      // Add message to local state
      const newMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text: messageText,
        isSent: true,
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev, newMessage])
      setChatInput('')

      // Scroll to bottom with debounce
      if (scrollToEndTimeoutRef.current) {
        clearTimeout(scrollToEndTimeoutRef.current)
      }
      scrollToEndTimeoutRef.current = setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({animated: true})
      }, 100)
    } else {
      logger.warn('P2P: Failed to send message', {
        origin: 'P2PConnectionScreen',
        myPeerId,
        connectedPeerId,
        messageLength: messageText.length,
      })
    }
  }, [chatInput, connectionManager, connectedPeerId, myPeerId])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollToEndTimeoutRef.current) {
        clearTimeout(scrollToEndTimeoutRef.current)
      }
    }
  }, [])

  return (
    <SafeArea>
      <View style={[a.flex_1]}>
        <Tabs style={[a.px_lg, a.pt_md]}>
          <Tab
            active={activeTab === 'connection'}
            label="Connection"
            onPress={() => setActiveTab('connection')}
            testID="p2p:tab-connection"
          />
          <Tab
            active={activeTab === 'share'}
            label="Share Peer ID"
            onPress={() => setActiveTab('share')}
            testID="p2p:tab-share"
          />
          <Tab
            active={activeTab === 'chat'}
            label="Chat"
            onPress={() => setActiveTab('chat')}
            testID="p2p:tab-chat"
          />
        </Tabs>

        <TabPanels>
          <TabPanel active={activeTab === 'connection'}>
            <ScrollView contentContainerStyle={a.px_lg} ref={scrollViewRef}>
              <Label>Connection Parameters</Label>
              <View style={[a.pb_md]}>
                {signalingUrl && (
                  <>
                    <Text
                      style={[
                        ta.text_gray_medium,
                        a.body_2_md_regular,
                        a.pb_xs,
                      ]}
                    >
                      Signaling URL:
                    </Text>
                    <Copiable title={signalingUrl} text={signalingUrl} />
                  </>
                )}
                {targetPeerId && (
                  <>
                    <Text
                      style={[
                        ta.text_gray_medium,
                        a.body_2_md_regular,
                        a.pt_md,
                        a.pb_xs,
                      ]}
                    >
                      Target Peer ID:
                    </Text>
                    <Copiable title={targetPeerId} text={targetPeerId} />
                  </>
                )}
              </View>

              <Label>My Peer ID</Label>
              {myPeerId ? (
                <Copiable title={myPeerId} text={myPeerId} />
              ) : (
                <Text style={[ta.text_gray_medium]}>Initializing...</Text>
              )}

              <Label>Connection Status</Label>
              <View style={[a.pb_md]}>
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    },
                  ]}
                >
                  <View
                    style={[
                      {
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: getStatusColor(),
                        marginRight: 8,
                      },
                    ]}
                  />
                  <Text style={[ta.text_gray_medium, a.body_2_md_regular]}>
                    {getStatusDisplayText()}
                  </Text>
                </View>
                {connectionState.lastStatusUpdate &&
                  !connectionState.signalingServerFailed && (
                    <Text
                      style={[
                        ta.text_gray_low,
                        a.body_3_sm_regular,
                        {marginTop: 4},
                      ]}
                    >
                      Last update:{' '}
                      {new Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      }).format(new Date(connectionState.lastStatusUpdate))}
                    </Text>
                  )}
              </View>

              {connectedPeerId && (
                <>
                  <Label>Connected To</Label>
                  <Copiable title={connectedPeerId} text={connectedPeerId} />
                </>
              )}
            </ScrollView>
          </TabPanel>

          <TabPanel active={activeTab === 'share'}>
            <ScrollView contentContainerStyle={a.px_lg}>
              <Label>My Peer ID</Label>
              {myPeerId ? (
                <>
                  <Copiable title={myPeerId} text={myPeerId} />
                  <View style={[a.pt_lg]}>
                    <ShareQRCodeCard
                      title="Share Connection"
                      shareContent={generateCIP158P2PDeeplink({
                        dappPeer: myPeerId,
                        ...(signalingUrl
                          ? parseSignalingUrl(signalingUrl)
                          : {
                              host: params.host,
                              port: params.port,
                              path: params.path,
                              secure: params.secure !== false,
                            }),
                      })}
                      qrContent={generateCIP158P2PDeeplink({
                        dappPeer: myPeerId,
                        ...(signalingUrl
                          ? parseSignalingUrl(signalingUrl)
                          : {
                              host: params.host,
                              port: params.port,
                              path: params.path,
                              secure: params.secure !== false,
                            }),
                      })}
                      testID="p2p:share-peer-id"
                      shareLabel="Share Peer ID"
                      onLongPress={(_event: GestureResponderEvent) => {
                        // Handle long press if needed
                      }}
                    />
                  </View>
                </>
              ) : (
                <Text style={[ta.text_gray_medium]}>Initializing...</Text>
              )}
            </ScrollView>
          </TabPanel>

          <TabPanel active={activeTab === 'chat'}>
            <KeyboardAvoidingView
              style={[a.flex_1]}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <ScrollView
                ref={chatScrollViewRef}
                contentContainerStyle={[a.px_lg, a.py_md, {flexGrow: 1}]}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => {
                  // Debounce scroll to prevent continuous re-renders
                  if (scrollToEndTimeoutRef.current) {
                    clearTimeout(scrollToEndTimeoutRef.current)
                  }
                  scrollToEndTimeoutRef.current = setTimeout(() => {
                    chatScrollViewRef.current?.scrollToEnd({animated: false})
                  }, 50)
                }}
              >
                {chatMessages.length === 0 ? (
                  <View
                    style={[
                      a.flex_1,
                      a.justify_center,
                      a.align_center,
                      {minHeight: 200},
                    ]}
                  >
                    <Text style={[ta.text_gray_medium, a.body_2_md_regular]}>
                      {connectedPeerId
                        ? 'No messages yet. Start a conversation!'
                        : 'Connect to a peer to start chatting'}
                    </Text>
                  </View>
                ) : (
                  chatMessages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        a.pb_md,
                        a.flex_row,
                        msg.isSent ? a.justify_end : a.justify_start,
                      ]}
                    >
                      <View
                        style={[
                          {
                            maxWidth: '75%',
                          },
                          a.px_md,
                          a.py_sm,
                          a.rounded_sm,
                          {
                            backgroundColor: msg.isSent
                              ? p.primary_600
                              : p.gray_200,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            a.body_2_md_regular,
                            {
                              color: msg.isSent ? p.white_static : p.gray_max,
                            },
                          ]}
                        >
                          {msg.text}
                        </Text>
                        <Text
                          style={[
                            a.body_3_sm_regular,
                            {
                              color: msg.isSent
                                ? 'rgba(255,255,255,0.7)'
                                : p.gray_600,
                              paddingTop: 4,
                            },
                          ]}
                        >
                          {new Intl.DateTimeFormat('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          }).format(new Date(msg.timestamp))}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              {connectedPeerId && (
                <ChatInput
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  handleSendMessage={handleSendMessage}
                />
              )}
            </KeyboardAvoidingView>
          </TabPanel>
        </TabPanels>
      </View>

      <SafeArea.Footer>
        {connectionState.error && (
          <Text
            style={[ta.text_error, a.body_3_sm_regular, a.text_center, a.p_lg]}
          >
            {connectionState.error}
          </Text>
        )}
        {connectedPeerId ? (
          <Button onPress={handleDisconnect} title="Disconnect" />
        ) : connectionState.signalingServerFailed ? (
          <View style={[a.gap_sm]}>
            <Button
              onPress={handleRetry}
              title="Retry Connection"
              type={ButtonType.Primary}
            />
          </View>
        ) : (
          <Button
            onPress={() => {
              if (connectionManager && targetPeerId) {
                const peerConnection = connectionManager.getPeerConnection()
                if (peerConnection) {
                  const currentPeerId = peerConnection.getPeerId()
                  logger.log('P2P: Connecting to peer', {
                    origin: 'P2PConnectionScreen',
                    myPeerId: currentPeerId,
                    targetPeerId,
                  })
                  setIsConnecting(true)
                  setConnectionState((prev) => ({
                    ...prev,
                    status: 'connecting',
                    error: null,
                    isReconnecting: false,
                    lastStatusUpdate: Date.now(),
                    signalingServerFailed: false,
                  }))
                  peerConnection
                    .connectToPeer(targetPeerId)
                    .then(() => {
                      logger.log('P2P: Successfully initiated connection', {
                        origin: 'P2PConnectionScreen',
                        myPeerId: currentPeerId,
                        targetPeerId,
                      })
                    })
                    .catch((error: Error) => {
                      const isSignalingError =
                        error.message.includes('WebSocket') ||
                        error.message.includes('signaling') ||
                        error.message.includes('Failed to create WebSocket') ||
                        error.message.includes('Signaling not connected')
                      logger.warn('P2P: Failed to connect to peer', {
                        origin: 'P2PConnectionScreen',
                        myPeerId: currentPeerId,
                        targetPeerId,
                        error: error.message,
                        isSignalingError,
                      })
                      setConnectionState((prev) => ({
                        ...prev,
                        status: 'error',
                        error: error.message,
                        isReconnecting: false,
                        lastStatusUpdate: Date.now(),
                        signalingServerFailed: isSignalingError,
                        signalingConnected: isSignalingError
                          ? false
                          : prev.signalingConnected,
                      }))
                      setIsConnecting(false)
                    })
                }
              }
            }}
            title={
              isConnecting
                ? 'Connecting...'
                : connectionState.isReconnecting
                  ? 'Reconnecting...'
                  : 'Connect'
            }
            disabled={
              isConnecting ||
              !targetPeerId ||
              (!connectionState.signalingConnected &&
                !!(
                  signalingUrl ||
                  process.env.EXPO_PUBLIC_P2P_SIGNALING_URL ||
                  'wss://0.peerjs.com/peerjs'
                ))
            }
          />
        )}
      </SafeArea.Footer>
    </SafeArea>
  )
}
