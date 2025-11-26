import {type WalletMessage} from '@yoroi/p2p-communication'

import * as React from 'react'

import {
  P2PConnectionProvider,
  useP2PConnection,
} from '../context/P2PConnectionProvider'
import {useP2PCIP30Handler} from '../hooks/useP2PCIP30Handler'

type P2PConnectionProviderWrapperProps = {
  children: React.ReactNode
}

// Inner component that uses the context to handle CIP-30 messages
const P2PCIP30Handler = () => {
  const {connectionManager} = useP2PConnection()
  const {handleMessage} = useP2PCIP30Handler({connectionManager})

  // Set up message handler when connection manager changes
  const walletCommunication = connectionManager?.getWalletCommunication()

  React.useEffect(() => {
    if (!walletCommunication) return

    const handleMessageEvent = (message?: unknown) => {
      if (message && typeof message === 'object') {
        handleMessage(message as WalletMessage)
      }
    }

    walletCommunication.on('message', handleMessageEvent)

    return () => {
      walletCommunication.off('message', handleMessageEvent)
    }
  }, [walletCommunication, handleMessage])

  return null
}

export const P2PConnectionProviderWrapper = ({
  children,
}: P2PConnectionProviderWrapperProps) => {
  return (
    <P2PConnectionProvider>
      <P2PCIP30Handler />
      {children}
    </P2PConnectionProvider>
  )
}
