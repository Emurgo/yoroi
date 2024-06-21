import {useExplorers} from '@yoroi/explorers'
import React from 'react'
import {Linking, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'

import {CopyButton, Text} from '../../../../components'
import {useSelectedNetwork} from '../../../WalletManager/common/hooks/useSelectedNetwork'

export const WalletAddress = ({addressHash, style}: {addressHash: string; style?: ViewStyle}) => {
  const {network} = useSelectedNetwork()
  const explorers = useExplorers(network)
  const handleOnPress = () => {
    Linking.openURL(explorers.cardanoscan.address(addressHash))
  }

  return (
    <View style={[styles.addressRowStyles, style]}>
      <TouchableOpacity activeOpacity={0.5} onPress={handleOnPress}>
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
