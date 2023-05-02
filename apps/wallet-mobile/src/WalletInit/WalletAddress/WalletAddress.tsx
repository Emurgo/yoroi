import React from 'react'
import {Linking, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'

import {CopyButton, Text} from '../../components'
import {getNetworkConfigById} from '../../yoroi-wallets/cardano/networks'
import {NetworkId} from '../../yoroi-wallets/types'

export const WalletAddress = ({
  addressHash,
  networkId,
  style,
}: {
  addressHash: string
  networkId: NetworkId
  style?: ViewStyle
}) => {
  const onTapAddress = () => {
    const config = getNetworkConfigById(networkId)
    Linking.openURL(config.EXPLORER_URL_FOR_ADDRESS(addressHash))
  }

  return (
    <View style={[styles.addressRowStyles, style]}>
      <TouchableOpacity activeOpacity={0.5} onPress={onTapAddress}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.addressHash}>
          {addressHash}
        </Text>
      </TouchableOpacity>

      <CopyButton value={addressHash} />
    </View>
  )
}

const styles = StyleSheet.create({
  addressRowStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addressHash: {
    width: 280,
    color: '#9B9B9B',
    lineHeight: 30,
  },
})
