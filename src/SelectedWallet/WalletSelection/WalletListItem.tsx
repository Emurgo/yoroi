import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import AdaIcon from '../../../legacy/assets/AdaIcon'
import {CONFIG, isByron, isHaskellShelley, isJormun, isNightly} from '../../../legacy/config/config'
import stylesConfig, {COLORS} from '../../../legacy/styles/config'
import {WalletAccountIcon} from '../../components'
import {WalletMeta} from '../../types'

type Props = {
  walletMeta: WalletMeta
  onPress: (walletMeta: WalletMeta) => void
}

export const WalletListItem = ({walletMeta, onPress}: Props) => {
  const {type} = getWalletItemMeta(walletMeta)

  return (
    <View style={styles.itemContainer}>
      <View style={styles.item}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => onPress(walletMeta)} style={styles.leftSide}>
          <WalletAccountIcon iconSeed={walletMeta.checksum.ImagePart} style={styles.walletAvatar} />

          <View style={styles.walletDetails}>
            <Text style={styles.walletName}>{walletMeta.name}</Text>
            <Text style={styles.walletMeta}>
              {walletMeta.checksum ? `${walletMeta.checksum.TextPart} | ${type}` : type}
            </Text>
          </View>

          {(isNightly() || CONFIG.IS_TESTNET_BUILD) && (
            <View style={styles.providerContainer}>
              <Text style={[styles.walletMeta, styles.providerText]}>{walletMeta.provider}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

type WalletItemMeta = {
  type: string
  icon: React.ReactNode
}
const getWalletItemMeta = (walletMeta: WalletMeta): WalletItemMeta => {
  if (isByron(walletMeta.walletImplementationId)) {
    return {
      type: 'Byron',
      icon: <AdaIcon height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  if (isHaskellShelley(walletMeta.walletImplementationId)) {
    return {
      type: 'Shelley',
      icon: <AdaIcon height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  if (isJormun(walletMeta.walletImplementationId)) {
    return {
      type: 'Jormungandr',
      icon: <AdaIcon height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  throw new Error('getWalletItemMeta:: invalid wallet implementation id')
}

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  leftSide: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
  },
  walletAvatar: {
    marginRight: 12,
  },
  walletDetails: {
    justifyContent: 'space-between',
  },
  walletName: {
    fontFamily: stylesConfig.defaultFont,
    fontSize: 16,
    color: COLORS.WHITE,
  },
  walletMeta: {
    color: COLORS.WHITE,
    opacity: 0.5,
    fontSize: 10,
  },
  providerContainer: {
    flex: 1,
  },
  providerText: {
    alignSelf: 'flex-end',
  },
})
