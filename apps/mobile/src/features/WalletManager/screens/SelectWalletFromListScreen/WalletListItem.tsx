import {useFocusEffect} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {Alert, Animated, Text, TouchableOpacity, View} from 'react-native'
import {Swipeable} from 'react-native-gesture-handler'

import {features} from '../../../../kernel/features'
import {Icon} from '../../../../ui/Icon'
import {Loading} from '../../../../ui/Loading/Loading'
import {Space, SpaceHeight} from '../../../../ui/Space/Space'
import {isByron, isShelley} from '../../../../wallets/cardano/utils'
import {
  ChevronRightDarkIllustration,
  ChevronRightGrayIllustration,
} from '../../../SetupWallet/illustrations/ChevronRight'
import {useAutomaticWalletOpener} from '../../context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {useSelectedNetwork} from '../../hooks/useSelectedNetwork'
import {useSyncWalletInfo} from '../../hooks/useSyncWalletInfo'

type Props = {
  walletMeta: Wallet.Meta
  onPress: (walletMeta: Wallet.Meta) => void
}

export const WalletListItem = ({walletMeta, onPress}: Props) => {
  const {palette: p, atoms: ta} = useTheme()

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
  const hasSyncedLastSelectedNetwork = network === syncWalletInfo?.network

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

  // NOTE: dev only - temporary to show Product
  const handleOnDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete this wallet?',
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
      enabled={features.walletListSwipeableActions}
    >
      <View
        style={[a.flex_row, a.justify_between, a.align_center, a.flex_wrap]}
      >
        <TouchableOpacity
          activeOpacity={1}
          disabled={!hasSyncedLastSelectedNetwork}
          onPress={() => onPress(walletMeta)}
          style={[
            a.flex_row,
            a.align_center,
            !hasSyncedLastSelectedNetwork && {opacity: 0.5},
          ]}
          onPressIn={() => setIsButtonPressed(true)}
          onPressOut={() => setIsButtonPressed(false)}
        >
          <Icon.WalletAvatar image={walletMeta.avatar} />

          <Space.Height.md />

          <View style={[a.justify_between, a.flex_1]}>
            <Text
              style={[a.flex_1, a.body_1_lg_medium, ta.text_gray_medium]}
              numberOfLines={1}
            >
              {walletMeta.name}
            </Text>

            <Text
              style={[ta.text_gray_low, {opacity: isButtonPressed ? 1 : 0.5}]}
            >
              {`${walletMeta.plate} | ${implementationName}`}
            </Text>
          </View>

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

      <SpaceHeight fill size="sm" />
    </View>
  )
}

const getImplementationName = (walletMeta: Wallet.Meta) => {
  if (isByron(walletMeta.implementation)) return 'Byron'
  if (isShelley(walletMeta.implementation)) return 'Shelley'
  return 'Unknown'
}
