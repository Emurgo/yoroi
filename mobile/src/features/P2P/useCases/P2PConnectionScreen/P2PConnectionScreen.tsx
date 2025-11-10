import {
  WebRTCAdapter,
  connectionManagerMaker,
  generateCIP158P2PDeeplink,
} from '@yoroi/p2p-communication'
import {atoms as a, useTheme} from '@yoroi/theme'
import {BaseStorage} from '@yoroi/types'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {GestureResponderEvent, Text, View} from 'react-native'

import {useInfoModal} from '~/features/Scan/common/modals/InfoModal'
import {logger} from '~/kernel/logger/logger'
import {rootStorage} from '~/kernel/storage/storages'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'

type Params = {
  peerId: string
  signalingUrl?: string
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

// Try to import react-native-webrtc, fallback gracefully if not available
let RTCPeerConnection: any
let RTCSessionDescription: any
let RTCIceCandidate: any
let webrtcAvailable = false

try {
  const webrtc = require('react-native-webrtc')
  RTCPeerConnection = webrtc.RTCPeerConnection
  RTCSessionDescription = webrtc.RTCSessionDescription
  RTCIceCandidate = webrtc.RTCIceCandidate
  webrtcAvailable = true
} catch (error) {
  logger.warn('react-native-webrtc not available', {error})
  webrtcAvailable = false
}

const createWebRTCAdapter = (): WebRTCAdapter | null => {
  if (!webrtcAvailable) {
    return null
  }
  return {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
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
  const {peerId: targetPeerId, signalingUrl} = useRoute().params as Params
  const {scrollViewRef} = useScrollView()
  const {openInfoModal} = useInfoModal()

  const [myPeerId, setMyPeerId] = React.useState<string>('')
  const [connectionStatus, setConnectionStatus] =
    React.useState<string>('Not connected')
  const [connectedPeerId, setConnectedPeerId] = React.useState<string | null>(
    null,
  )
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [connectionManager, setConnectionManager] = React.useState<any>(null)

  const webrtcAdapter = React.useMemo(() => createWebRTCAdapter(), [])
  const storageAdapter = React.useMemo(() => createStorageAdapter(), [])

  React.useEffect(() => {
    if (!webrtcAdapter) {
      openInfoModal({
        title: 'WebRTC Not Available',
        message:
          'react-native-webrtc is not installed. Please install it to use P2P connections.',
      })
      return
    }

    const manager = connectionManagerMaker({
      storage: storageAdapter,
      webrtcAdapter,
      peerConfig: {
        signalingUrl:
          signalingUrl ||
          process.env.EXPO_PUBLIC_P2P_SIGNALING_URL ||
          'wss://signaling-server.example.com',
        targetPeerId,
      },
      isWallet: true,
      logger,
    })

    setConnectionManager(manager)

    const initializeConnection = async () => {
      try {
        setIsConnecting(true)
        await manager.initialize()
        const peerConnection = manager.getPeerConnection()
        if (peerConnection) {
          const id = peerConnection.getPeerId()
          setMyPeerId(id)

          // Listen for connection events
          peerConnection.on('open', (id: unknown) => {
            setConnectionStatus('Ready')
            setMyPeerId(id as string)
          })

          peerConnection.on('peerConnected', (peerId: unknown) => {
            setConnectionStatus('Connected')
            setConnectedPeerId(peerId as string)
            setIsConnecting(false)
          })

          peerConnection.on('error', (error: unknown) => {
            const err =
              error instanceof Error ? error : new Error(String(error))
            setConnectionStatus(`Error: ${err.message}`)
            setIsConnecting(false)
          })

          peerConnection.on('close', () => {
            setConnectionStatus('Closed')
            setConnectedPeerId(null)
          })

          // Connect to target peer if provided
          if (targetPeerId) {
            await peerConnection.connectToPeer(targetPeerId)
          }
        }
      } catch (error) {
        logger.error(
          error instanceof Error ? error : new Error(String(error)),
          {
            origin: 'P2PConnectionScreen',
          },
        )
        openInfoModal({
          title: 'Connection Error',
          message: String(error),
        })
        setIsConnecting(false)
      }
    }

    initializeConnection()

    return () => {
      if (manager) {
        manager.cleanup()
      }
    }
  }, [webrtcAdapter, storageAdapter, targetPeerId, signalingUrl, openInfoModal])

  const handleDisconnect = () => {
    if (connectionManager) {
      connectionManager.cleanup()
      setConnectionStatus('Disconnected')
      setConnectedPeerId(null)
      setConnectionManager(null)
    }
  }

  const handleShareMyPeerId = () => {
    if (!myPeerId) return

    const deeplink = generateCIP158P2PDeeplink({
      peerId: myPeerId,
      signalingUrl: signalingUrl,
    })
    // Share the deeplink (could use Share API or copy to clipboard)
    openInfoModal({
      title: 'Share Peer ID',
      message: `Deeplink: ${deeplink}`,
    })
  }

  if (!webrtcAdapter) {
    return (
      <SafeArea>
        <ScrollView
          contentContainerStyle={[a.px_lg, a.py_lg]}
          ref={scrollViewRef}
        >
          <Text style={[ta.text_gray_medium, a.body_1_lg_regular]}>
            WebRTC is not available. Please install react-native-webrtc to use
            P2P connections.
          </Text>
        </ScrollView>
      </SafeArea>
    )
  }

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={a.px_lg} ref={scrollViewRef}>
        <Label>My Peer ID</Label>
        {myPeerId ? (
          <>
            <Copiable title={myPeerId} text={myPeerId} />
            <View style={[a.pt_md]}>
              <Button
                onPress={handleShareMyPeerId}
                title="Share My Peer ID"
                type={ButtonType.Secondary}
              />
            </View>
          </>
        ) : (
          <Text style={[ta.text_gray_medium]}>Initializing...</Text>
        )}

        <Label>Connection Status</Label>
        <Text style={[ta.text_gray_medium, a.body_2_md_regular]}>
          {connectionStatus}
        </Text>

        {targetPeerId && (
          <>
            <Label>Target Peer ID</Label>
            <Copiable title={targetPeerId} text={targetPeerId} />
          </>
        )}

        {connectedPeerId && (
          <>
            <Label>Connected To</Label>
            <Text style={[ta.text_gray_medium, a.body_2_md_regular]}>
              {connectedPeerId}
            </Text>
          </>
        )}

        {myPeerId && (
          <View style={[a.pt_lg]}>
            <ShareQRCodeCard
              title="Share Connection"
              shareContent={generateCIP158P2PDeeplink({
                peerId: myPeerId,
                signalingUrl: signalingUrl,
              })}
              qrContent={generateCIP158P2PDeeplink({
                peerId: myPeerId,
                signalingUrl: signalingUrl,
              })}
              testID="p2p:share-peer-id"
              shareLabel="Share Peer ID"
              onLongPress={(_event: GestureResponderEvent) => {
                // Handle long press if needed
              }}
            />
          </View>
        )}
      </ScrollView>

      <SafeArea.Footer>
        {connectedPeerId ? (
          <Button onPress={handleDisconnect} title="Disconnect" />
        ) : (
          <Button
            onPress={() => {
              // Reconnect logic
              if (connectionManager && targetPeerId) {
                const peerConnection = connectionManager.getPeerConnection()
                if (peerConnection) {
                  setIsConnecting(true)
                  peerConnection
                    .connectToPeer(targetPeerId)
                    .catch((error: Error) => {
                      openInfoModal({
                        title: 'Connection Error',
                        message: error.message,
                      })
                      setIsConnecting(false)
                    })
                }
              }
            }}
            title={isConnecting ? 'Connecting...' : 'Connect'}
            disabled={isConnecting || !targetPeerId}
          />
        )}
      </SafeArea.Footer>
    </SafeArea>
  )
}
