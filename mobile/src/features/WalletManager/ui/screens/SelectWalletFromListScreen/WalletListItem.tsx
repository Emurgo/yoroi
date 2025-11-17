import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'
import {Alert, Animated, Text, TouchableOpacity, View} from 'react-native'
import {Swipeable} from 'react-native-gesture-handler'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {
  ChevronRightDarkIllustration,
  ChevronRightGrayIllustration,
} from '~/features/SetupWallet/illustrations/ChevronRight'
import {useAutomaticWalletOpener} from '~/features/WalletManager/context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSyncWalletInfo} from '~/features/WalletManager/hooks/useSyncWalletInfo'
import {features} from '~/kernel/features'
import {logger} from '~/kernel/logger/logger'
import {Icon} from '~/ui/Icon'
import {Loading} from '~/ui/Loading/Loading'
import {Space} from '~/ui/Space/Space'
import {isByron, isShelley} from '~/wallets/cardano/utils'

type Props = {
  walletMeta: Wallet.Meta
  onPress: (walletMeta: Wallet.Meta) => void
}

export const WalletListItem = ({walletMeta, onPress}: Props) => {
  const {palette: p, atoms: ta} = useTheme()
  const {isAuthDev} = useAuth()

  const [isButtonPressed, setIsButtonPressed] = React.useState(false)
  const implementationName = React.useMemo(
    () => getImplementationName(walletMeta),
    [walletMeta],
  )
  const {
    selected: {meta},
    walletManager,
  } = useWalletManager()
  const {
    shouldOpen: shouldAutomaticWalletOpen,
    setShouldOpen: setShouldAutomaticWalletOpen,
  } = useAutomaticWalletOpener()

  const isSelected = meta?.id === walletMeta.id

  const {network} = useSelectedNetwork()
  const syncWalletInfo = useSyncWalletInfo(walletMeta.id)
  // If syncWalletInfo is null, wallet is not actively syncing - assume it's synced (show full opacity)
  // Only show reduced opacity if syncWalletInfo exists and indicates not synced
  const hasSyncedLastSelectedNetwork =
    !syncWalletInfo || // No sync info = wallet not in sync queue = assume synced
    (syncWalletInfo.status === 'done' && syncWalletInfo.network === network) // Explicitly synced on current network

  React.useEffect(() => {
    logger.debug('WalletListItem: syncWalletInfo changed', {
      walletId: walletMeta.id,
      walletName: walletMeta.name,
      syncWalletInfo: syncWalletInfo
        ? {
            status: syncWalletInfo.status,
            network: syncWalletInfo.network,
            updatedAt: syncWalletInfo.updatedAt,
          }
        : null,
      currentNetwork: network,
      hasSyncedLastSelectedNetwork,
      willShowReducedOpacity: !hasSyncedLastSelectedNetwork,
    })
  }, [
    walletMeta.id,
    walletMeta.name,
    syncWalletInfo,
    network,
    hasSyncedLastSelectedNetwork,
  ])

  useFocusEffect(
    React.useCallback(() => {
      if (
        shouldAutomaticWalletOpen &&
        isSelected &&
        hasSyncedLastSelectedNetwork
      ) {
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

  const handleOnDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${walletMeta.name}"? This action cannot be undone.`,
      [
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
      ],
    )
  }

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<string | number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    })

    return (
      <Animated.View
        style={[
          a.justify_center,
          a.align_center,
          {transform: [{translateX}], width: 100},
        ]}
      >
        <TouchableOpacity
          style={[a.justify_center, a.align_center, a.px_md]}
          onPress={handleOnDeleteWallet}
        >
          <Text
            style={[
              a.body_2_md_medium,
              a.p_sm,
              {backgroundColor: p.sys_magenta_100, color: p.sys_magenta_500},
            ]}
          >
            DELETE
          </Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <Swipeable
      renderRightActions={(progress) => renderRightActions(progress)}
      enabled={isAuthDev}
    >
      <View
        style={[a.flex_row, a.justify_between, a.align_center, a.flex_wrap]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onPress(walletMeta)}
          style={[
            a.flex_row,
            a.align_center,
            // Show reduced opacity if not synced yet, but still allow interaction
            !hasSyncedLastSelectedNetwork && {opacity: 0.7},
          ]}
          onPressIn={() => setIsButtonPressed(true)}
          onPressOut={() => setIsButtonPressed(false)}
        >
          <Icon.WalletAvatar image={walletMeta.avatar} />

          <Space.Width.md />

          <View style={[a.justify_between, a.flex_1]}>
            <View style={[a.flex_row, a.align_center, a.gap_xs]}>
              <Text
                style={[a.flex_1, a.body_1_lg_medium, ta.text_gray_max]}
                numberOfLines={1}
              >
                {walletMeta.name}
              </Text>
            </View>

            <Text
              style={[ta.text_gray_low, {opacity: isButtonPressed ? 1 : 0.5}]}
            >
              {`${walletMeta.plate} | ${implementationName}`}
            </Text>
          </View>

          {walletMeta.isReadOnly && (
            <>
              <Icon.EyeOn size={24} color={p.el_gray_min} />
              <Space.Width.md />
            </>
          )}

          {features.walletListFeedback && (
            <>
              {syncWalletInfo?.status === 'syncing' && <Loading />}

              <Space.Width.md />

              {isSelected && <Icon.Check size={20} color={p.primary_600} />}
            </>
          )}

          <Space.Width.xl />

          <Chevron pressed={isButtonPressed} />
        </TouchableOpacity>
      </View>
    </Swipeable>
  )
}

const Chevron = ({pressed}: {pressed: boolean}) => {
  return (
    <View style={[a.flex_col, a.align_start]}>
      <Space.Height.sm />

      {pressed ? (
        <ChevronRightDarkIllustration />
      ) : (
        <ChevronRightGrayIllustration />
      )}

      <Space.Height.sm fill />
    </View>
  )
}

const getImplementationName = (walletMeta: Wallet.Meta) => {
  if (isByron(walletMeta.implementation)) return 'Byron'
  if (isShelley(walletMeta.implementation)) return 'Shelley'
  return 'Unknown'
}
