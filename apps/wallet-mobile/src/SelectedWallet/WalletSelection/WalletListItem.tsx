import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../components'
import {brand, COLORS} from '../../theme'
import {isByron, isHaskellShelley, isJormun} from '../../yoroi-wallets/cardano/utils'
import {WalletMeta} from '../../yoroi-wallets/walletManager'

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
            <Text style={styles.walletName} numberOfLines={1}>
              {wallet.name}
            </Text>

            <Text style={styles.walletMeta}>
              {wallet.checksum != null ? `${wallet.checksum.TextPart} | ${type}` : type}
            </Text>
          </View>
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
      icon: <Icon.Ada size={18} color={COLORS.WHITE} />,
    }
  }
  if (isHaskellShelley(walletMeta.walletImplementationId)) {
    return {
      type: 'Shelley',
      icon: <Icon.Ada size={18} color={COLORS.WHITE} />,
    }
  }
  if (isJormun(walletMeta.walletImplementationId)) {
    return {
      type: 'Jormungandr',
      icon: <Icon.Ada size={18} color={COLORS.WHITE} />,
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
    flex: 1,
  },
  walletName: {
    fontFamily: brand.defaultFont,
    fontSize: 16,
    color: COLORS.WHITE,
    flex: 1,
  },
  walletMeta: {
    color: COLORS.WHITE,
    opacity: 0.5,
    fontSize: 10,
  },
})
