import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {BackHandler, LayoutAnimation, Platform, Text, View} from 'react-native'

import infoIcon from '~/assets/img/icon/info-light-green.png'
import {useBuyCryptoBanner} from '~/features/Exchange/common/useBuyCryptoBanner'
import {useGetImportantAlertsModal} from '~/features/Notifications/common/GetImportantAlertsModal'
import {useGovernanceBanner} from '~/features/Staking/Governance/useCases/useGovernanceBanner'
import {usePoolTransitionModal} from '~/features/Staking/Staking/PoolTransition/usePoolTransitionModal'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useSync} from '~/features/WalletManager/hooks/useSync'
import {features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Space, SpaceHeight} from '~/ui/Space/Space'

import {TxList} from '../TxList/TxList'
import {useUtxoConsolidationBanner} from '../UtxoConsolidation/UtxoConsolidation/useUtxoConsolidationBanner'
import {ActionsBanner} from './ActionsBanner'
import {BalanceBanner} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {WarningBanner} from './WarningBanner'
import {useOnScroll} from './useOnScroll'

export const TxHistory = () => {
  useGovernanceBanner()
  useBuyCryptoBanner()
  useUtxoConsolidationBanner()

  const strings = useStrings()
  const {atoms: ta, palette: p, isDark} = useTheme()
  const navigation = useNavigation()
  const walletNavigation = useWalletNavigation()

  useGetImportantAlertsModal({enabled: features.pushNotifications})

  const {wallet, meta} = useSelectedWallet()
  const [showWarning, setShowWarning] = React.useState(
    meta.implementation === 'cardano-bip44',
  )

  const {sync, isPending: isLoadingWallet} = useSync(wallet)
  const {isLoading: isLoadingPoolTransition} = usePoolTransitionModal()
  const isLoading = isLoadingWallet || isLoadingPoolTransition

  const [expanded, setExpanded] = React.useState(true)
  const onScroll = useOnScroll({
    onScrollUp: () => setExpanded(true),
    onScrollDown: () => setExpanded(false),
  })

  const handleOnRefresh = () => sync()

  // Handle back navigation - always reset to wallet selection when on history-list
  React.useEffect(() => {
    // Handle OS back button (Android) - only when on history-list screen
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // Check if we can go back in the current stack
          // If not, we're at the root (history-list) and should reset to wallet selection
          if (!navigation.canGoBack()) {
            walletNavigation.resetToWalletSelection()
            return true // Prevent default back behavior
          }
          // Otherwise, let normal navigation handle it (go back to previous screen in stack)
          return false
        },
      )

      return () => backHandler.remove()
    }
    return undefined
  }, [navigation, walletNavigation])

  // Handle navigation back button (header button and gesture)
  // This only fires when trying to remove history-list from the stack
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior
      e.preventDefault()

      // Reset to wallet selection
      walletNavigation.resetToWalletSelection()
    })

    return unsubscribe
  }, [navigation, walletNavigation])

  return (
    <LinearGradient
      colors={
        isDark
          ? [
              'rgba(19, 57, 54, 1)',
              'rgba(20, 24, 58, 1)',
              'rgba(22, 25, 45, 1)',
            ]
          : p.bg_gradient_1
      } // it fixes a weird bug
      start={{x: isDark ? 0.5 : 0.5, y: isDark ? 0 : 0.5}}
      end={{x: isDark ? 0 : 0, y: isDark ? 0.5 : 0}}
      style={{flex: 1}}
    >
      <SpaceHeight size={100} />

      <CollapsibleHeader expanded={expanded}>
        <BalanceBanner />

        <ActionsBanner disabled={isLoading} />
      </CollapsibleHeader>

      <View
        style={[
          a.flex_1,
          ta.bg_color_max,
          {
            paddingTop: 8,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
        ]}
      >
        <Space.Height.lg />

        <Text
          style={[a.body_1_lg_medium, {color: p.gray_900, textAlign: 'center'}]}
        >
          {strings.transactions.title}
        </Text>

        <Space.Height.xl />

        <LockedDeposit />

        <Space.Height.md />

        {meta.implementation === 'cardano-bip44' && showWarning && (
          <WarningBanner
            title={strings.transactions.warningTitle.toUpperCase()}
            icon={infoIcon}
            message={strings.transactions.warningMessage}
            showCloseIcon
            onRequestClose={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              )
              setShowWarning(false)
            }}
            style={{position: 'absolute', zIndex: 2, bottom: 0}}
          />
        )}

        <TxList
          onScroll={onScroll}
          refreshing={isLoading}
          onRefresh={handleOnRefresh}
        />
      </View>
    </LinearGradient>
  )
}
