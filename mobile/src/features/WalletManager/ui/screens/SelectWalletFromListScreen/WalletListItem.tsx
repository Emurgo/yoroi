import {isByron, isShelley} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {
  useAutomaticWalletOpener,
  useSelectedNetwork,
  useSyncWalletInfo,
  useWalletManagerSelector,
} from '@yoroi/wallet-manager'

import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'
import {Alert, Text, TouchableOpacity, View} from 'react-native'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {
  ChevronRightDarkIllustration,
  ChevronRightGrayIllustration,
} from '~/features/SetupWallet/illustrations/ChevronRight'
import {Icon} from '~/ui/Icon'
import {Loading} from '~/ui/Loading/Loading'
import {Space} from '~/ui/Space/Space'

type Props = {
  walletMeta: Wallet.Meta
  onPress: (walletMeta: Wallet.Meta) => void
  isLoading?: boolean
}

export const WalletListItem = ({
  walletMeta,
  onPress,
  isLoading = false,
}: Props) => {
  const {palette: p, atoms: ta} = useTheme()
  const {isAuthDev} = useAuth()

  const [isButtonPressed, setIsButtonPressed] = React.useState(false)
  const implementationName = React.useMemo(
    () => getImplementationName(walletMeta),
    [walletMeta],
  )
  // Use selectors to prevent re-renders when unrelated context values change
  const meta = useWalletManagerSelector((ctx) => ctx.selected.meta)
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
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
            if (!walletManager) {
              throw new Error('WalletManager not available')
            }
            walletManager.removeWallet(walletMeta.id)
          },
        },
      ],
    )
  }

  const renderRightActions = (progress: SharedValue<number>) => {
    return (
      <RightActions
        progress={progress}
        onDelete={handleOnDeleteWallet}
        palette={p}
      />
    )
  }

  return (
    <ReanimatedSwipeable
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

          {walletMeta.multisigMeta && (
            <>
              <View
                style={[
                  a.px_xs,
                  a.py_xs,
                  {backgroundColor: p.primary_100},
                  a.rounded_xs,
                ]}
              >
                <Text style={[a.body_2_md_medium, {color: p.primary_600}]}>
                  {walletMeta.multisigMeta.coSigners.length}-of-
                  {walletMeta.multisigMeta.quorumRules.kind === 'RequireNOf'
                    ? walletMeta.multisigMeta.quorumRules.required ||
                      walletMeta.multisigMeta.coSigners.length
                    : walletMeta.multisigMeta.quorumRules.kind ===
                        'RequireAllOf'
                      ? walletMeta.multisigMeta.coSigners.length
                      : 1}
                </Text>
              </View>
              <Space.Width.md />
            </>
          )}

          {walletMeta.isReadOnly && (
            <>
              <Icon.EyeOn size={24} color={p.el_gray_min} />
              <Space.Width.md />
            </>
          )}

          {(syncWalletInfo?.status === 'syncing' || isLoading) && <Loading />}

          <Space.Width.md />

          {isSelected && <Icon.Check size={20} color={p.primary_600} />}

          <Space.Width.xl />

          <Chevron pressed={isButtonPressed} />
        </TouchableOpacity>
      </View>
    </ReanimatedSwipeable>
  )
}

const RightActions = ({
  progress,
  onDelete,
  palette,
}: {
  progress: SharedValue<number>
  onDelete: () => void
  palette: ReturnType<typeof useTheme>['palette']
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [80, 0])
    return {
      transform: [{translateX}],
    }
  })

  return (
    <Animated.View
      style={[a.justify_center, a.align_center, {width: 100}, animatedStyle]}
    >
      <TouchableOpacity
        style={[a.justify_center, a.align_center, a.px_md]}
        onPress={onDelete}
      >
        <Text
          style={[
            a.body_2_md_medium,
            a.p_sm,
            {
              backgroundColor: palette.sys_magenta_100,
              color: palette.sys_magenta_500,
            },
          ]}
        >
          DELETE
        </Text>
      </TouchableOpacity>
    </Animated.View>
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
  if (walletMeta.implementation === 'cardano-multisig') return 'Multisig'
  if (isByron(walletMeta.implementation)) return 'Byron'
  if (isShelley(walletMeta.implementation)) return 'Shelley'
  return 'Unknown'
}
