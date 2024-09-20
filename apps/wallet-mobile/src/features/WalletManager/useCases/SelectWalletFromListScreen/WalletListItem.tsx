import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {Alert, Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Swipeable} from 'react-native-gesture-handler'

import {Icon} from '../../../../components/Icon'
import {Loading} from '../../../../components/Loading/Loading'
import {Space} from '../../../../components/Space/Space'
import {features} from '../../../../kernel/features'
import {isByron, isShelley} from '../../../../yoroi-wallets/cardano/utils'
import {
  ChevronRightDarkIllustration,
  ChevronRightGrayIllustration,
} from '../../../SetupWallet/illustrations/ChevronRight'
import {useSelectedNetwork} from '../../common/hooks/useSelectedNetwork'
import {useSyncWalletInfo} from '../../common/hooks/useSyncWalletInfo'
import {useAutomaticWalletOpener} from '../../context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '../../context/WalletManagerProvider'

type Props = {
  walletMeta: Wallet.Meta
  onPress: (walletMeta: Wallet.Meta) => void
}

export const WalletListItem = ({walletMeta, onPress}: Props) => {
  const {styles, colors} = useStyles()

  const [isButtonPressed, setIsButtonPressed] = React.useState(false)
  const implementationName = React.useMemo(() => getImplementationName(walletMeta), [walletMeta])
  const {
    selected: {meta},
    walletManager,
  } = useWalletManager()
  const {shouldOpen: shouldAutomaticWalletOpen, setShouldOpen: setShouldAutomaticWalletOpen} =
    useAutomaticWalletOpener()

  const isSelected = meta?.id === walletMeta.id

  const {network} = useSelectedNetwork()
  const syncWalletInfo = useSyncWalletInfo(walletMeta.id)
  const hasSyncedLastSelectedNetwork = network === syncWalletInfo?.network

  useFocusEffect(
    React.useCallback(() => {
      if (shouldAutomaticWalletOpen && isSelected && hasSyncedLastSelectedNetwork) {
        onPress(walletMeta)
        setShouldAutomaticWalletOpen(false)
      }
    }, [
      hasSyncedLastSelectedNetwork,
      isSelected,
      onPress,
      setShouldAutomaticWalletOpen,
      shouldAutomaticWalletOpen,
      walletMeta,
    ]),
  )

  // NOTE: dev only - temporary to show Product
  const handleOnDeleteWallet = () => {
    Alert.alert('Delete Wallet', 'Are you sure you want to delete this wallet?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          walletManager.removeWallet(walletMeta.id)
        },
      },
    ])
  }

  const renderRightActions = (progress: Animated.AnimatedInterpolation<string | number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    })

    return (
      <Animated.View style={[styles.rightContainer, {transform: [{translateX}]}]}>
        <TouchableOpacity style={styles.rigthActionsContainer} onPress={handleOnDeleteWallet}>
          <Text style={styles.actionDangerousText}>DELETE</Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }
  // ____________________________________________________

  return (
    <Swipeable
      renderRightActions={(progress) => renderRightActions(progress)}
      enabled={features.walletListSwipeableActions}
    >
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

              {isSelected && <Icon.Check size={20} color={colors.selected} />}
            </>
          )}

          <Space width="xl" />

          <Chevron pressed={isButtonPressed} />
        </TouchableOpacity>
      </View>
    </Swipeable>
  )
}

const Chevron = ({pressed}: {pressed: boolean}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.chevron}>
      <Space height="sm" />

      {pressed ? <ChevronRightDarkIllustration /> : <ChevronRightGrayIllustration />}

      <Space fill />
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
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
      ...atoms.flex_wrap,
    },
    leftSide: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    walletDetails: {
      ...atoms.justify_between,
      ...atoms.flex_1,
    },
    walletName: {
      ...atoms.flex_1,
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    walletMeta: {
      color: color.text_gray_low,
      opacity: 0.5,
    },
    walletMetaPressed: {
      color: color.gray_max,
      opacity: 1,
    },
    disabled: {
      opacity: 0.5,
    },
    rightContainer: {
      ...atoms.justify_center,
      ...atoms.align_center,
      width: 100,
    },
    rigthActionsContainer: {
      ...atoms.justify_center,
      ...atoms.align_center,
      ...atoms.px_md,
    },
    actionDangerousText: {
      color: color.sys_magenta_500,
      ...atoms.body_2_md_medium,
      ...atoms.p_sm,
      backgroundColor: color.sys_magenta_100,
    },
    chevron: {
      ...atoms.flex_col,
      ...atoms.align_start,
    },
  })

  const colors = {
    white: color.white_static,
    selected: color.primary_600,
    icon: color.gray_600,
  }

  return {styles, colors} as const
}
