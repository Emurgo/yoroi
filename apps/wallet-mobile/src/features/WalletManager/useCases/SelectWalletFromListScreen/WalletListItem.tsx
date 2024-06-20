import {useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components'
import {Loading} from '../../../../components/Loading/Loading'
import {Space} from '../../../../components/Space/Space'
import {isByron, isShelley} from '../../../../yoroi-wallets/cardano/utils'
import {features} from '../../..'
import {
  ChevronRightDarkIllustration,
  ChevronRightGrayIllustration,
} from '../../../SetupWallet/illustrations/ChevronRight'
import {useSelectedNetwork} from '../../common/hooks/useSelectedNetwork'
import {useSyncWalletInfo} from '../../common/hooks/useSyncWalletInfo'
import {useWalletManager} from '../../context/WalletManagerProvider'

type Props = {
  walletMeta: Wallet.Meta
  onPress: (walletMeta: Wallet.Meta) => void
}

export const WalletListItem = ({walletMeta, onPress}: Props) => {
  const {styles} = useStyles()
  const [isButtonPressed, setIsButtonPressed] = React.useState(false)
  const implementationName = React.useMemo(() => getImplementationName(walletMeta), [walletMeta])

  const {network} = useSelectedNetwork()
  const syncWalletInfo = useSyncWalletInfo(walletMeta.id)
  const hasSyncedLastSelectedNetwork = network === syncWalletInfo?.network

  const {
    selected: {meta},
  } = useWalletManager()
  const isSelected = meta?.id === walletMeta.id

  return (
    <View style={styles.item}>
      <TouchableOpacity
        activeOpacity={1}
        disabled={!hasSyncedLastSelectedNetwork}
        onPress={() => onPress(walletMeta)}
        style={[styles.leftSide, !hasSyncedLastSelectedNetwork && styles.disabled]}
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
            {`${walletMeta.plate} | ${implementationName}`}
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

const getImplementationName = (walletMeta: Wallet.Meta) => {
  if (isByron(walletMeta.implementation)) return 'Byron'
  if (isShelley(walletMeta.implementation)) return 'Shelley'
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
    disabled: {
      opacity: 0.5,
    },
  })

  const colors = {
    white: color.white_static,
  }

  return {styles, colors} as const
}
