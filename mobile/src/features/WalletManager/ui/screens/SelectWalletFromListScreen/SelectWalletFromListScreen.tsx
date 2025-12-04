import {getLogger} from '@yoroi/common'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {
  linkToSupportOpenTicket,
  useWalletManagerSelector,
  useWalletMetas,
} from '@yoroi/wallet-manager'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Linking, Text, TouchableOpacity} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {PendingActionBanner} from '~/features/Links/components/PendingActionBanner'
import {pushNotificationsManager} from '~/features/Notifications/common/notification-manager'
import {
  handleNotificationInternalNavigationAction,
  shouldHandleNotificationInternalNavigationAction,
} from '~/features/Notifications/common/tools'
import {features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {Space} from '~/ui/Space/Space'

import {SupportIllustration} from '../../../ui/illustrations/SupportIllustration'
import {AggregatedBalance} from './AggregatedBalance'
import {WalletListItem} from './WalletListItem'

export const SelectWalletFromList = () => {
  const {scrollViewRef} = useScrollView()
  const navigation = useNavigation()
  const walletMetas = useWalletMetas()
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const walletNavigation = useWalletNavigation()
  const {isAuthDev} = useAuth()
  const [loadingWalletId, setLoadingWalletId] = React.useState<
    Wallet.Meta['id'] | null
  >(null)

  // Clear loading state when screen loads (navigated to)
  useFocusEffect(
    React.useCallback(() => {
      setLoadingWalletId(null)
    }, []),
  )

  // Preload wallets in background to reduce hydration time when selecting
  // This improves perceived performance, especially on iOS
  React.useEffect(() => {
    if (walletManager && walletMetas && walletMetas.length > 0) {
      // Preload wallets asynchronously - don't block UI
      walletManager.hydrate({isForced: false}).catch((error) => {
        // Ignore errors - this is just preloading for performance
        // If preload fails, wallet will be loaded on-demand when selected
        getLogger().warn('SelectWalletFromList: Wallet preload failed', {
          error: error instanceof Error ? error.message : String(error),
        })
      })
    }
  }, [walletManager, walletMetas])

  const handleOnSelect = React.useCallback(
    async (walletMeta: Wallet.Meta) => {
      if (!walletManager) {
        getLogger().error('SelectWalletFromList: WalletManager not available')
        throw new Error('WalletManager not available')
      }

      // Show loading state immediately
      setLoadingWalletId(walletMeta.id)

      try {
        walletManager.setSelectedWalletId(walletMeta.id)

        // Navigate immediately - don't wait for notification check
        // This prevents blocking the UI with async storage operations
        try {
          navigation.navigate('manage-wallets', {
            screen: 'main-wallet-routes',
            params: {screen: 'history', params: {screen: 'history-list'}},
          })
        } catch (navError) {
          getLogger().error('SelectWalletFromList: Navigation failed', {
            walletId: walletMeta.id,
            error:
              navError instanceof Error ? navError.message : String(navError),
          })
          throw navError
        }

        // Check notifications in parallel (non-blocking)
        // This allows navigation to happen immediately while notification check runs in background
        const shouldHandle =
          await shouldHandleNotificationInternalNavigationAction()
        if (shouldHandle) {
          await handleNotificationInternalNavigationAction(
            pushNotificationsManager,
            walletNavigation,
          )
        }
      } catch (error) {
        getLogger().error('SelectWalletFromList: Wallet selection failed', {
          walletId: walletMeta.id,
          error: error instanceof Error ? error.message : String(error),
        })
        // If navigation fails, clear loading state
        setLoadingWalletId(null)
        throw error
      }
    },
    [walletManager, navigation, walletNavigation],
  )

  const walletList = React.useMemo(
    () =>
      walletMetas?.map((walletMeta) => (
        <React.Fragment key={walletMeta.id}>
          <WalletListItem
            walletMeta={walletMeta}
            onPress={handleOnSelect}
            isLoading={loadingWalletId === walletMeta.id}
          />

          <Space.Height.lg />
        </React.Fragment>
      )),
    [handleOnSelect, walletMetas, loadingWalletId],
  )

  return (
    <SafeArea style={[a.gap_md]}>
      <PendingActionBanner />
      {features.walletListAggregatedBalance && <AggregatedBalance />}

      <ScrollView
        ref={scrollViewRef}
        style={[a.px_lg, a.pt_2xl]}
        contentContainerStyle={[a.pb_2xl]}
        bounces={true}
      >
        {walletList}
      </ScrollView>

      <SafeArea.Footer style={[a.gap_lg]}>
        <SupportTicketLink />

        <AddWalletButton />

        {isAuthDev && <OnlyDevButton />}
      </SafeArea.Footer>
    </SafeArea>
  )
}

const SupportTicketLink = () => {
  const {atoms: ta} = useTheme()
  const onPress = () => Linking.openURL(linkToSupportOpenTicket)
  const strings = useStrings()

  return (
    <TouchableOpacity
      style={[a.flex_row, a.align_center, a.justify_center, a.gap_sm]}
      onPress={onPress}
    >
      <SupportIllustration color={ta.text_primary_medium.color} />

      <Text style={[ta.text_primary_medium, a.button_2_md]}>
        {strings.walletManager.supportTicketLink.toLocaleUpperCase()}
      </Text>
    </TouchableOpacity>
  )
}

const AddWalletButton = () => {
  const strings = useStrings()
  const {reset: resetSetupWalletState} = useSetupWallet()
  const {resetToWalletSetup} = useWalletNavigation()
  const handleOnPress = React.useCallback(() => {
    resetSetupWalletState()
    resetToWalletSetup()
  }, [resetSetupWalletState, resetToWalletSetup])

  return (
    <Button
      onPress={handleOnPress}
      title={strings.walletManager.addWalletButton}
    />
  )
}

const OnlyDevButton = () => {
  const navigation = useNavigation()
  const handleOnPress = React.useCallback(() => {
    navigation.navigate('developer')
  }, [navigation])

  return (
    <Button
      testID="btnDevOptions"
      onPress={handleOnPress}
      title="Dev options"
    />
  )
}
