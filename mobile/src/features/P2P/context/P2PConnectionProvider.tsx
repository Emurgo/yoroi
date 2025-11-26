import {
  type ConnectionManager,
  type WalletMessage,
} from '@yoroi/p2p-communication'

import * as React from 'react'

type P2PConnectionContextValue = {
  connectionManager: ConnectionManager | null
  connectedPeerId: string | null
  isConnected: boolean
  registerConnection: (manager: ConnectionManager, peerId: string) => void
  unregisterConnection: () => void
}

const P2PConnectionContext =
  React.createContext<P2PConnectionContextValue | null>(null)

export const useP2PConnection = () => {
  const context = React.useContext(P2PConnectionContext)
  if (!context) {
    throw new Error(
      'useP2PConnection must be used within P2PConnectionProvider',
    )
  }
  return context
}

type P2PConnectionProviderProps = {
  children: React.ReactNode
  onMessage?: (message: WalletMessage) => void
}

export const P2PConnectionProvider = ({
  children,
  onMessage,
}: P2PConnectionProviderProps) => {
  const [connectionManager, setConnectionManager] =
    React.useState<ConnectionManager | null>(null)
  const [connectedPeerId, setConnectedPeerId] = React.useState<string | null>(
    null,
  )
  const cleanupRef = React.useRef<(() => void) | null>(null)
  const onMessageRef = React.useRef(onMessage)

  // Keep onMessage ref updated
  React.useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const registerConnection = React.useCallback(
    (manager: ConnectionManager, peerId: string) => {
      // Clean up previous connection if any
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }

      setConnectionManager(manager)
      setConnectedPeerId(peerId)

      // Set up message listener via wallet communication
      const walletCommunication = manager.getWalletCommunication()
      const peerConnection = manager.getPeerConnection()

      if (walletCommunication && peerConnection) {
        const handleMessage = (message?: unknown) => {
          if (onMessageRef.current && message) {
            // WalletCommunication already parses messages, so message should be WalletMessage
            if (typeof message === 'object' && message !== null) {
              onMessageRef.current(message as WalletMessage)
            }
          }
        }

        const handlePeerConnected = (peerId?: unknown) => {
          if (typeof peerId === 'string') {
            setConnectedPeerId(peerId)
          }
        }

        const handleDisconnected = () => {
          setConnectedPeerId(null)
        }

        walletCommunication.on('message', handleMessage)
        peerConnection.on('peerConnected', handlePeerConnected)
        peerConnection.on('disconnected', handleDisconnected)

        // Store cleanup function
        cleanupRef.current = () => {
          walletCommunication.off('message', handleMessage)
          peerConnection.off('peerConnected', handlePeerConnected)
          peerConnection.off('disconnected', handleDisconnected)
        }
      }
    },
    [],
  )

  const unregisterConnection = React.useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    if (connectionManager) {
      connectionManager.cleanup()
    }
    setConnectionManager(null)
    setConnectedPeerId(null)
  }, [connectionManager])

  const value = React.useMemo<P2PConnectionContextValue>(
    () => ({
      connectionManager,
      connectedPeerId,
      isConnected: connectedPeerId !== null,
      registerConnection,
      unregisterConnection,
    }),
    [
      connectionManager,
      connectedPeerId,
      registerConnection,
      unregisterConnection,
    ],
  )

  return (
    <P2PConnectionContext.Provider value={value}>
      {children}
    </P2PConnectionContext.Provider>
  )
}
