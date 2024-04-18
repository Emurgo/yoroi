import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {WalletMeta} from '../../../../wallet-manager/types'
import {isByron, isHaskellShelley, isJormun} from '../../../../yoroi-wallets/cardano/utils'
import {ChevronRightDarkIllustration, ChevronRightGrayIllustration} from '../../illustrations/ChevronRightIllustration'

type Props = {
  wallet: WalletMeta
  onPress: (walletMeta: WalletMeta) => void
}

export const WalletListItem = ({wallet, onPress}: Props) => {
  const {styles, colors} = useStyles()
  const {type} = getWalletItemMeta(wallet, colors)

  const [isButtonPressed, setIsButtonPressed] = React.useState(false)

  return (
    <View style={styles.item}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(wallet)}
        style={styles.leftSide}
        onPressIn={() => setIsButtonPressed(true)}
        onPressOut={() => setIsButtonPressed(false)}
      >
        <Icon.WalletAccount iconSeed={wallet.checksum.ImagePart} />

        <Space height="m" />

        <View style={styles.walletDetails}>
          <Text style={styles.walletName} numberOfLines={1}>
            {wallet.name}
          </Text>

          <Text style={[styles.walletMeta, isButtonPressed && styles.walletMetaPressed]}>
            {wallet.checksum != null ? `${wallet.checksum.TextPart} | ${type}` : type}
          </Text>
        </View>

        {isButtonPressed ? <ChevronRightDarkIllustration /> : <ChevronRightGrayIllustration />}
      </TouchableOpacity>
    </View>
  )
}

type WalletItemMeta = {
  type: string
  icon: React.ReactElement
}
const getWalletItemMeta = (walletMeta: WalletMeta, colors: {white: string}): WalletItemMeta => {
  if (isByron(walletMeta.walletImplementationId)) {
    return {
      type: 'Byron',
      icon: <Icon.Ada size={18} color={colors.white} />,
    }
  }
  if (isHaskellShelley(walletMeta.walletImplementationId)) {
    return {
      type: 'Shelley',
      icon: <Icon.Ada size={18} color={colors.white} />,
    }
  }
  if (isJormun(walletMeta.walletImplementationId)) {
    return {
      type: 'Jormungandr',
      icon: <Icon.Ada size={18} color={colors.white} />,
    }
  }
  throw new Error('getWalletItemMeta:: invalid wallet implementation id')
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    leftSide: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    walletDetails: {
      justifyContent: 'space-between',
      flex: 1,
    },
    walletName: {
      ...(theme.atoms.body - 1 - lg - medium),
      color: theme.color.gray_cmax,
      flex: 1,
    },
    walletMeta: {
      color: theme.color.gray_c600,
      ...theme.atoms.body_3_sm_regular,
      opacity: 0.5,
    },
    walletMetaPressed: {
      color: theme.color.gray_cmax,
      ...theme.atoms.body_3_sm_regular,
      opacity: 1,
    },
  })

  const colors = {
    white: theme.color.white_static,
  }

  return {styles, colors} as const
}
