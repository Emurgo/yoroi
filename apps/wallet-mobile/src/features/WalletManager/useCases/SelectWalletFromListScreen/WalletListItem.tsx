import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components'
import {Loading} from '../../../../components/Loading/Loading'
import {Space} from '../../../../components/Space/Space'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {isByron, isHaskellShelley} from '../../../../yoroi-wallets/cardano/utils'
import {features} from '../../..'
import {
  ChevronRightDarkIllustration,
  ChevronRightGrayIllustration,
} from '../../../SetupWallet/illustrations/ChevronRight'
import {WalletInfo, WalletMeta} from '../../common/types'
import {useWalletManager} from '../../context/WalletManagerContext'

type Props = {
  wallet: WalletMeta
  onPress: (walletMeta: WalletMeta) => void
}

export const WalletListItem = ({wallet, onPress}: Props) => {
  const {styles} = useStyles()
  const era = useEra(wallet)
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

        <Space height="md" />

        <View style={styles.walletDetails}>
          <Text style={styles.walletName} numberOfLines={1}>
            {wallet.name}
          </Text>

          <Text style={[styles.walletMeta, isButtonPressed && styles.walletMetaPressed]}>
            {wallet.checksum != null ? `${wallet.checksum.TextPart} | ${era}` : era}
          </Text>
        </View>

        {features.walletListFeedback && (
          <>
            {walletInfo?.sync.status === 'syncing' && <Loading />}

            <Space width="md" />

            {isSelected && <Icon.Check size={20} />}

            <Space width="md" />
          </>
        )}

        {isButtonPressed ? <ChevronRightDarkIllustration /> : <ChevronRightGrayIllustration />}
      </TouchableOpacity>
    </View>
  )
}

const useEra = (walletMeta: WalletMeta) => {
  if (isByron(walletMeta.walletImplementationId)) {
    return 'Byron'
  }
  if (isHaskellShelley(walletMeta.walletImplementationId)) {
    return 'Shelley'
  }
  return 'Unknown'
}

const useStyles = () => {
  const {atoms, color} = useTheme()
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
      ...atoms.body_1_lg_medium,
      color: color.gray_cmax,
      flex: 1,
    },
    walletMeta: {
      color: color.gray_c600,
      ...atoms.body_3_sm_regular,
      opacity: 0.5,
    },
    walletMetaPressed: {
      color: color.gray_cmax,
      ...atoms.body_3_sm_regular,
      opacity: 1,
    },
  })

  const colors = {
    white: color.white_static,
  }

  return {styles, colors} as const
}
