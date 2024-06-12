import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components'
import {Loading} from '../../../../components/Loading/Loading'
import {Space} from '../../../../components/Space/Space'
import {isByron, isHaskellShelley} from '../../../../yoroi-wallets/cardano/utils'
import {features} from '../../..'
import {
  ChevronRightDarkIllustration,
  ChevronRightGrayIllustration,
} from '../../../SetupWallet/illustrations/ChevronRight'
import {useSyncWalletInfo} from '../../common/hooks/useSyncWalletInfo'
import {WalletMeta} from '../../common/types'
import {useWalletManager} from '../../context/WalletManagerProvider'

type Props = {
  walletMeta: WalletMeta
  onPress: (walletMeta: WalletMeta) => void
}

export const WalletListItem = ({walletMeta, onPress}: Props) => {
  const {styles} = useStyles()
  const era = useEra(walletMeta)
  const syncWalletInfo = useSyncWalletInfo(walletMeta.id)
  const {
    selected: {meta},
  } = useWalletManager()
  const isSelected = meta?.id === walletMeta.id

  const [isButtonPressed, setIsButtonPressed] = React.useState(false)

  return (
    <View style={styles.item}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(walletMeta)}
        style={styles.leftSide}
        onPressIn={() => setIsButtonPressed(true)}
        onPressOut={() => setIsButtonPressed(false)}
      >
        <Icon.WalletAvatar image={walletMeta.avatar} />

        <Space height="md" />

        <View style={styles.walletDetails}>
          <Text style={styles.walletName} numberOfLines={1}>
            {walletMeta.name}
          </Text>

          <Text style={[styles.walletMeta, isButtonPressed && styles.walletMetaPressed]}>
            {`${walletMeta.plate} | ${era}`}
          </Text>
        </View>

        {features.walletListFeedback && (
          <>
            {syncWalletInfo?.status === 'syncing' && <Loading />}

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
      opacity: 0.5,
    },
    walletMetaPressed: {
      color: color.gray_cmax,
      opacity: 1,
    },
  })

  const colors = {
    white: color.white_static,
  }

  return {styles, colors} as const
}
