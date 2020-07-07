// @flow
import React from 'react'
import {TouchableOpacity, Text, View, Image} from 'react-native'
import {compose, withHandlers} from 'recompose'
import LinearGradient from 'react-native-linear-gradient'

import {isJormungandr} from '../../config/networks'

import styles from './styles/WalletListItem.style'

import type {WalletMeta} from '../../state'
import type {Node, ComponentType} from 'react'

type ExternalProps = {
  wallet: WalletMeta,
  onPress: (WalletMeta) => any,
}

type CustomIconProps = {
  isJormungandr: boolean,
  icon: Node,
}

const getWalletTitle = (walletMeta: WalletMeta): string => {
  // TODO: add label for shelley/byron era wallets
  if (isJormungandr(walletMeta.networkId)) {
    return `${walletMeta.name} (ITN)`
  }
  return walletMeta.name
}

const CustomCardanoIcon = ({isJormungandr, icon}: CustomIconProps) =>
  isJormungandr ? (
    <LinearGradient
      start={{x: 0, y: 1}}
      end={{x: 1, y: 0}}
      colors={['#1A44B7', '#F14D78']}
      style={styles.iconWrapper}
    >
      {icon}
    </LinearGradient>
  ) : (
    <View style={[styles.iconWrapper, styles.blueBackground]}>{icon}</View>
  )

const WalletListItem = ({wallet, onPress}) => (
  <TouchableOpacity activeOpacity={0.5} onPress={onPress} style={styles.item}>
    <View style={styles.leftSide}>
      <Image source={wallet.avatar} style={styles.walletAvatar} />
      <View>
        <Text style={styles.walletName}>{getWalletTitle(wallet)}</Text>
        <Text style={styles.walletChecksum}>{wallet.checksum}</Text>
      </View>
    </View>
    <View style={styles.rightSide}>
      <CustomCardanoIcon isJormungandr={isJormungandr(wallet.networkId)} icon={wallet.icon} />
      <Text style={styles.iconText}>{wallet.iconName}</Text>
    </View>
  </TouchableOpacity>
)

export default (compose(
  withHandlers({
    onPress: ({onPress, wallet}) => () => onPress(wallet),
  }),
)(WalletListItem): ComponentType<ExternalProps>)
