import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Linking, Text, TouchableOpacity} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useLinksRequestWallet} from '~/features/Links/hooks/useLinksRequestWallet'
import {pushNotificationsManager} from '~/features/Notifications/common/notification-manager'
import {
  handleNotificationInternalNavigationAction,
  shouldHandleNotificationInternalNavigationAction,
} from '~/features/Notifications/common/tools'
import {features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {Space} from '~/ui/Space/Space'

import {linkToSupportOpenTicket} from '../../../common/constants'
import {useWalletManager} from '../../../context/WalletManagerProvider'
import {useWalletMetas} from '../../../hooks/useWalletMetas'
import {SupportIllustration} from '../../../ui/illustrations/SupportIllustration'
import {AggregatedBalance} from './AggregatedBalance'
import {WalletListItem} from './WalletListItem'

export const SelectWalletFromList = () => {
  const {openModal, closeModal} = useModal()
  const modalFunctions = React.useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [openModal, closeModal],
  )

  useLinksRequestWallet(modalFunctions)
  const {scrollViewRef} = useScrollView()
  const navigation = useNavigation()
  const walletMetas = useWalletMetas()
  const {walletManager, selected} = useWalletManager()
  const walletNavigation = useWalletNavigation()
  const {isAuthDev} = useAuth()

  useFocusEffect(
    React.useCallback(() => {
      const checkPendingNavigation = async () => {
        const shouldHandle =
          await shouldHandleNotificationInternalNavigationAction()
        if (shouldHandle && selected.wallet?.id) {
          await handleNotificationInternalNavigationAction(
            pushNotificationsManager,
            walletNavigation,
          )
        }
      }
      setTimeout(() => checkPendingNavigation(), 300)
    }, [selected.wallet?.id, walletNavigation]),
  )

  const handleOnSelect = React.useCallback(
    async (walletMeta: Wallet.Meta) => {
      walletManager.setSelectedWalletId(walletMeta.id)
      const shouldHandle =
        await shouldHandleNotificationInternalNavigationAction()
      if (shouldHandle) {
        await handleNotificationInternalNavigationAction(
          pushNotificationsManager,
          walletNavigation,
        )
        return
      }
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {screen: 'history', params: {screen: 'history-list'}},
      })
    },
    [walletManager, navigation, walletNavigation],
  )

  const walletList = React.useMemo(
    () =>
      walletMetas?.map((walletMeta) => (
        <React.Fragment key={walletMeta.id}>
          <WalletListItem walletMeta={walletMeta} onPress={handleOnSelect} />

          <Space.Height.lg />
        </React.Fragment>
      )),
    [handleOnSelect, walletMetas],
  )

  return (
    <SafeArea style={[a.gap_md]}>
      {features.walletListAggregatedBalance && <AggregatedBalance />}

      <ScrollView
        ref={scrollViewRef}
        style={[a.px_lg, a.pt_2xl]}
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
