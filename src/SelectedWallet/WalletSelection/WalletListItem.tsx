import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../components'
import {CONFIG, isByron, isHaskellShelley, isJormun, isNightly} from '../../legacy/config'
import {WalletMeta} from '../../legacy/state'
import {brand, COLORS} from '../../theme'
type Props = {
  wallet: WalletMeta
  onPress: (walletMeta: WalletMeta) => void
}

export const WalletListItem = ({wallet, onPress}: Props) => {
  const {type} = getWalletItemMeta(wallet)

  return (
    <View style={styles.itemContainer}>
      <View style={styles.item}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => onPress(wallet)} style={styles.leftSide}>
          <Icon.WalletAccount iconSeed={wallet.checksum.ImagePart} style={styles.walletAvatar} />
          <View style={styles.walletDetails}>
            <Text style={styles.walletName}>{wallet.name}</Text>
            <Text style={styles.walletMeta}>{wallet.checksum ? `${wallet.checksum.TextPart} | ${type}` : type}</Text>
          </View>

          {(isNightly() || CONFIG.IS_TESTNET_BUILD) && (
            <View style={styles.providerContainer}>
              <Text style={[styles.walletMeta, styles.providerText]}>{wallet.provider}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

type WalletItemMeta = {
  type: string
  icon: React.ReactElement
}
const getWalletItemMeta = (walletMeta: WalletMeta): WalletItemMeta => {
  if (isByron(walletMeta.walletImplementationId)) {
    return {
      type: 'Byron',
      icon: <Icon.Ada height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  if (isHaskellShelley(walletMeta.walletImplementationId)) {
    return {
      type: 'Shelley',
      icon: <Icon.Ada height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  if (isJormun(walletMeta.walletImplementationId)) {
    return {
      type: 'Jormungandr',
      icon: <Icon.Ada height={18} width={18} color={COLORS.WHITE} />,
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
    fontFamily: brand.defaultFont,
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
