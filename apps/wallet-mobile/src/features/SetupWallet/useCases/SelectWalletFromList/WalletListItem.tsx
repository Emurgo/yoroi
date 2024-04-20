import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components'
import {Loading} from '../../../../components/Loading/Loading'
import {Space} from '../../../../components/Space/Space'
import {WalletInfo, WalletMeta} from '../../../../wallet-manager/types'
import {useWalletManager} from '../../../../wallet-manager/WalletManagerContext'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {isByron, isHaskellShelley, isJormun} from '../../../../yoroi-wallets/cardano/utils'
import {features} from '../../..'
import {ChevronRightDarkIllustration, ChevronRightGrayIllustration} from '../../illustrations/ChevronRightIllustration'

type Props = {
  wallet: WalletMeta
  onPress: (walletMeta: WalletMeta) => void
}

export const WalletListItem = ({wallet, onPress}: Props) => {
  const {styles, colors} = useStyles()
  const {type} = getWalletItemMeta(wallet, colors)
  const walletManager = useWalletManager()

  const [selectedWalledId, setSelectedWalletId] = React.useState<YoroiWallet['id'] | null>(
    walletManager.selectedWalledId,
  )
  React.useEffect(() => {
    return walletManager.subscribe((event) => {
      if (event.type === 'selected-wallet-id') {
        setSelectedWalletId(event.id)
      }
    })
  }, [walletManager])
  const isSelected = selectedWalledId === wallet.id

  const [walletInfo, setWalletInfo] = React.useState<WalletInfo>()
  React.useEffect(() => {
    const subscription = walletManager.walletInfos$.subscribe((walletInfos) => {
      const newWalletInfo = walletInfos.get(wallet.id)
      if (newWalletInfo) setWalletInfo(newWalletInfo)
    })
    return () => subscription.unsubscribe()
  })

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

        {features.walletListFeedback && (
          <>
            {walletInfo?.sync.status === 'syncing' && <Loading />}

            <Space width="m" />

            {isSelected && <Icon.Check size={20} />}

            <Space width="m" />
          </>
        )}

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
      ...theme.typography['body-1-l-medium'],
      color: theme.color.gray.max,
      flex: 1,
    },
    walletMeta: {
      color: theme.color.gray[600],
      ...theme.typography['body-3-s-regular'],
      opacity: 0.5,
    },
    walletMetaPressed: {
      color: theme.color.gray.max,
      ...theme.typography['body-3-s-regular'],
      opacity: 1,
    },
  })

  const colors = {
    white: theme.color['white-static'],
  }

  return {styles, colors} as const
}
