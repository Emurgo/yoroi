import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Pressable, Text, View} from 'react-native'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'

import {useP2PConnection} from '../context/P2PConnectionProvider'

export const P2PConnectionStatusBar = () => {
  const {atoms: ta} = useTheme()
  const {
    connectionManager,
    connectedPeerId,
    isConnected,
    unregisterConnection,
  } = useP2PConnection()
  const walletNavigation = useWalletNavigation()

  const handlePress = () => {
    // Navigate to P2P connection screen
    // Get current connection params from the manager
    const peerConnection = connectionManager?.getPeerConnection()
    if (peerConnection) {
      const myPeerId = peerConnection.getPeerId()
      walletNavigation.navigateToP2PConnection({
        dappPeer: myPeerId,
      })
    }
  }

  const handleDisconnect = () => {
    unregisterConnection()
  }

  if (!isConnected && !connectionManager) {
    return null
  }

  return (
    <View
      style={[
        {
          backgroundColor: '#2196F3',
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={[{flex: 1, flexDirection: 'row', alignItems: 'center'}]}
      >
        <View
          style={[
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#4CAF50',
              marginRight: 8,
            },
          ]}
        />
        <Text style={[ta.el_primary_max, a.body_2_md_regular]}>
          P2P Connected
          {connectedPeerId ? `: ${connectedPeerId.slice(0, 8)}...` : ''}
        </Text>
      </Pressable>
      {isConnected && (
        <Button
          onPress={handleDisconnect}
          title="Disconnect"
          type={ButtonType.Secondary}
          style={[{marginLeft: 8, minWidth: 100}]}
        />
      )}
    </View>
  )
}
