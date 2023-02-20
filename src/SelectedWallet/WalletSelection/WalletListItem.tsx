import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../components'
import {isByron, isHaskellShelley} from '../../legacy/config'
import {brand, COLORS} from '../../theme'
import {WalletMeta} from '../../yoroi-wallets'

export const WalletListItem = ({walletMeta, onPress}: {walletMeta: WalletMeta; onPress: (walletMeta: WalletMeta) => void}) => {
  const era = getWalletEra(walletMeta)

  return (
    <View style={styles.itemContainer}>
      <View style={styles.item}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => onPress(walletMeta)} style={styles.leftSide}>
          <Icon.WalletAccount iconSeed={walletMeta.checksum.ImagePart} style={styles.walletAvatar} />

          <View style={styles.walletDetails}>
            <Text style={styles.walletName} numberOfLines={1}>
              {walletMeta.name}
            </Text>

            <Text style={styles.walletMeta}>
              {walletMeta.checksum != null ? `${walletMeta.checksum.TextPart} | ${era}` : era}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const getWalletEra = (walletMeta: WalletMeta): 'Byron' | 'Shelley' => {
  if (isByron(walletMeta.walletImplementationId)) {
    return 'Byron'
  }
  if (isHaskellShelley(walletMeta.walletImplementationId)) {
    return 'Shelley'
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
