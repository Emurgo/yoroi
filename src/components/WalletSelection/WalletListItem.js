// @flow
import React from 'react'
import {TouchableOpacity, Text, View} from 'react-native'
import {compose, withHandlers} from 'recompose'
import LinearGradient from 'react-native-linear-gradient'

import {isJormungandr} from '../../config/networks'
import {WALLET_IMPLEMENTATION_REGISTRY} from '../../config/types'
import WalletAccountIcon from '../Common/WalletAccountIcon'

import styles from './styles/WalletListItem.style'
import CardanoIcon from '../../assets/CardanoIcon'
import {COLORS} from '../../styles/config'

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

type WalletItemMeta = {
  type: string,
  iconName: string,
  icon: Node,
}
const getWalletItemMeta = (walletMeta: WalletMeta): WalletItemMeta => {
  switch (walletMeta.walletImplementationId) {
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      return {
        type: 'Byron',
        icon: <CardanoIcon height={16} width={16} color={COLORS.WHITE} />,
        iconName: 'Cardano, ADA',
      }
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24:
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
      return {
        type: 'Shelley',
        icon: <CardanoIcon height={16} width={16} color={COLORS.WHITE} />,
        iconName: 'Cardano, ADA',
      }
    case WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN:
      return {
        type: 'ITN',
        icon: <CardanoIcon height={16} width={16} color={COLORS.WHITE} />,
        iconName: 'Testnet, ADA',
      }
    default:
      throw new Error('getWalletItemMeta:: invalid wallet implementation id')
  }
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

const WalletListItem = ({wallet, onPress}) => {
  const {type, icon, iconName} = getWalletItemMeta(wallet)
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress} style={styles.item}>
      <View style={styles.leftSide}>
        <WalletAccountIcon
          iconSeed={wallet.checksum.ImagePart}
          style={styles.walletAvatar}
        />
        <View>
          <Text style={styles.walletName}>{wallet.name}</Text>
          <Text style={styles.walletMeta}>
            {wallet.checksum ? `${wallet.checksum.TextPart} | ${type}` : type}
          </Text>
        </View>
      </View>
      <View style={styles.rightSide}>
        <CustomCardanoIcon
          isJormungandr={isJormungandr(wallet.networkId)}
          icon={icon}
        />
        <Text style={styles.iconText}>{iconName}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default (compose(
  withHandlers({
    onPress: ({onPress, wallet}) => () => onPress(wallet),
  }),
)(WalletListItem): ComponentType<ExternalProps>)
