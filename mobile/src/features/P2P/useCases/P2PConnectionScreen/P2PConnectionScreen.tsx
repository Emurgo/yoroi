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
import {GestureResponderEvent, Text, View} from 'react-native'
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc'

import {useP2PConnection} from '~/features/P2P/context/P2PConnectionProvider'
import {logger} from '~/kernel/logger/logger'
import {rootStorage} from '~/kernel/storage/storages'
import {Button} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
import {Tab, TabPanel, TabPanels, Tabs} from '~/ui/Tabs/Tabs'

type Params = {
  // New format
  dappPeer?: string
  host?: string
  port?: string
  path?: string
  secure?: boolean
  // Legacy format (for backward compatibility)
  peerId?: string
  signalingUrl?: string
}

type ConnectionState = {
  status: ConnectionStatus
  error: string | null
  isReconnecting: boolean
  lastStatusUpdate: number
  signalingServerFailed: boolean
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

export const P2PConnectionScreen = () => {
  const {atoms: ta} = useTheme()
  const params = useRoute().params as Params
  const {scrollViewRef} = useScrollView()
  const {registerConnection, unregisterConnection} = useP2PConnection()

  // Extract and normalize parameters (support both new and legacy formats)
  const targetPeerId = React.useMemo(() => {
    return params.dappPeer || params.peerId || ''
  }, [params.dappPeer, params.peerId])

  const signalingUrl = React.useMemo(() => {
    // New format: build from host/port/path/secure
    if (params.host) {
      return buildSignalingUrl({
        host: params.host,
        port: params.port,
        path: params.path,
        secure: params.secure !== false, // Default to true if not specified
      })
    }
    // Legacy format: use signalingUrl directly
    return params.signalingUrl
  }, [
    params.host,
    params.port,
    params.path,
    params.secure,
    params.signalingUrl,
  ])

  const [myPeerId, setMyPeerId] = React.useState<string>('')
  const [connectionState, setConnectionState] = React.useState<ConnectionState>(
    {
      status: 'initializing',
      error: null,
      isReconnecting: false,
      lastStatusUpdate: Date.now(),
      signalingServerFailed: false,
    },
  )
  const [connectedPeerId, setConnectedPeerId] = React.useState<string | null>(
    null,
  )
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [connectionManager, setConnectionManager] =
    React.useState<ConnectionManager | null>(null)
  const [activeTab, setActiveTab] = React.useState<'connection' | 'share'>(
    'connection',
  )

  const webrtcAdapter = React.useMemo(() => createWebRTCAdapter(), [])
  const storageAdapter = React.useMemo(() => createStorageAdapter(), [])

  // IMPORTANT: This is the ONLY place in the app where P2P connections are established.
  // All P2P connection logic is isolated to this screen to prevent unwanted connections.
  React.useEffect(() => {
    const manager = connectionManagerMaker({
      storage: storageAdapter,
      webrtcAdapter,
      peerConfig: {
        signalingUrl:
          signalingUrl ||
          process.env.EXPO_PUBLIC_P2P_SIGNALING_URL ||
          'wss://0.peerjs.com',
        targetPeerId,
      },
      isWallet: true,
    })

    setConnectionManager(manager)

    let cleanupEventListeners: (() => void) | null = null

    const initializeConnection = async (): Promise<void> => {
      try {
        setIsConnecting(true)
        setConnectionState({
          status: 'initializing',
          error: null,
          isReconnecting: false,
          lastStatusUpdate: Date.now(),
          signalingServerFailed: false,
        })
        await manager.initialize()
        const peerConnection = manager.getPeerConnection()
        if (peerConnection) {
          const id = peerConnection.getPeerId()
          setMyPeerId(id)

          // Listen for connection events
          const handleOpen = (data?: unknown) => {
            const peerId = typeof data === 'string' ? data : ''
            setConnectionState({
              status: 'ready',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
            })
            setMyPeerId(peerId)
            setIsConnecting(false)
          }

          const handlePeerConnected = (data?: unknown) => {
            const peerId = typeof data === 'string' ? data : ''
            setConnectionState({
              status: 'connected',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
            })
            setConnectedPeerId(peerId)
            setIsConnecting(false)
            // Register connection with global provider
            registerConnection(manager, peerId)
          }

          const handleError = (data?: unknown) => {
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
            setConnectionState({
              status: 'error',
              error: errorMessage,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: isSignalingError,
            })
            setIsConnecting(false)
            // Log handled/recoverable errors as warnings
            const isHandledError =
              errorMessage.includes('Signaling not connected') ||
              errorMessage.includes('WebSocket error') ||
              isSignalingError
            if (isHandledError) {
              logger.warn(errorMessage, {origin: 'P2PConnectionScreen'})
            } else {
              logger.error(error, {origin: 'P2PConnectionScreen'})
            }
          }

          const handleClose = () => {
            setConnectionState({
              status: 'closed',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
            })
            setConnectedPeerId(null)
          }

          const handleDisconnected = () => {
            setConnectionState({
              status: 'disconnected',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
            })
            setConnectedPeerId(null)
          }

          const handleConnectionClosed = () => {
            setConnectionState({
              status: 'disconnected',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
            })
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
          if (targetPeerId) {
            setConnectionState({
              status: 'connecting',
              error: null,
              isReconnecting: false,
              lastStatusUpdate: Date.now(),
              signalingServerFailed: false,
            })
            await peerConnection.connectToPeer(targetPeerId)
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
          logger.warn(err.message, {origin: 'P2PConnectionScreen'})
        } else {
          logger.error(err, {origin: 'P2PConnectionScreen'})
        }
        setConnectionState({
          status: 'error',
          error: err.message,
          isReconnecting: false,
          lastStatusUpdate: Date.now(),
          signalingServerFailed: isSignalingError,
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
  }, [
    webrtcAdapter,
    storageAdapter,
    targetPeerId,
    signalingUrl,
    registerConnection,
    unregisterConnection,
  ])

  // Poll connection status for real-time updates (reduced frequency)
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
      setConnectionState((prev) => {
        // Stop polling if signaling server failed - clear interval and don't update
        if (prev.signalingServerFailed) {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          return prev
        }

        const status = peerConnection.getStatus()

        // Only update if status changed or it's been more than 2 seconds
        if (
          prev.status !== status ||
          Date.now() - prev.lastStatusUpdate > 2000
        ) {
          return {
            ...prev,
            status,
            isReconnecting:
              prev.status === 'disconnected' && status === 'connecting',
            lastStatusUpdate: Date.now(),
          }
        }
        return prev
      })

      const currentConnectedId = peerConnection.getConnectedPeerId()
      if (currentConnectedId !== connectedPeerId) {
        setConnectedPeerId(currentConnectedId)
      }
    }

    intervalId = setInterval(pollStatus, 3000) // Poll every 3 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [
    connectionManager,
    connectedPeerId,
    connectionState.signalingServerFailed,
  ])

  const handleDisconnect = () => {
    if (connectionManager) {
      connectionManager.cleanup()
      unregisterConnection()
      setConnectionState({
        status: 'disconnected',
        error: null,
        isReconnecting: false,
        lastStatusUpdate: Date.now(),
        signalingServerFailed: false,
      })
      setConnectedPeerId(null)
      setConnectionManager(null)
    }
  }

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
        </TabPanels>
      </View>

      <SafeArea.Footer>
        {connectedPeerId ? (
          <Button onPress={handleDisconnect} title="Disconnect" />
        ) : (
          <Button
            onPress={() => {
              if (connectionManager && targetPeerId) {
                const peerConnection = connectionManager.getPeerConnection()
                if (peerConnection) {
                  setIsConnecting(true)
                  setConnectionState({
                    status: 'connecting',
                    error: null,
                    isReconnecting: false,
                    lastStatusUpdate: Date.now(),
                    signalingServerFailed: false,
                  })
                  peerConnection
                    .connectToPeer(targetPeerId)
                    .catch((error: Error) => {
                      const isSignalingError =
                        error.message.includes('WebSocket') ||
                        error.message.includes('signaling') ||
                        error.message.includes('Failed to create WebSocket')
                      setConnectionState({
                        status: 'error',
                        error: error.message,
                        isReconnecting: false,
                        lastStatusUpdate: Date.now(),
                        signalingServerFailed: isSignalingError,
                      })
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
            disabled={isConnecting || !targetPeerId}
          />
        )}
      </SafeArea.Footer>
    </SafeArea>
  )
}
