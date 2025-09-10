import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLinksRequestWallet} from '~/features/Links/hooks/useLinksRequestWallet'
import {pushNotificationsManager} from '~/features/Notifications/common/notification-manager'
import {
  handleNotificationInternalNavigationAction,
  shouldHandleNotificationInternalNavigationAction,
} from '~/features/Notifications/common/tools'
import {isDev} from '~/kernel/constants'
import {features} from '~/kernel/features'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {ScrollView, useScrollView} from '~/ui/ScrollView/ScrollView'
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
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  const [showLine, setShowLine] = React.useState(false)
  const navigation = useNavigation()
  const {palette: p} = useTheme()
  const {track} = useMetrics()
  const walletMetas = useWalletMetas()
  const {walletManager} = useWalletManager()
  const walletNavigation = useWalletNavigation()

  useFocusEffect(
    React.useCallback(() => {
      track.allWalletsPageViewed()
    }, [track]),
  )

  const handleOnSelect = React.useCallback(
    async (walletMeta: Wallet.Meta) => {
      walletManager.setSelectedWalletId(walletMeta.id)
      if (await shouldHandleNotificationInternalNavigationAction()) {
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
    <SafeAreaView
      style={[a.flex_1, a.py_lg]}
      edges={['left', 'right', 'bottom']}
    >
      {features.walletListAggregatedBalance && <AggregatedBalance />}

      <ScrollView
        ref={scrollViewRef}
        style={[a.px_lg, a.pt_2xl]}
        onScrollBarChange={setIsScrollBarShown}
        onScrollBeginDrag={() => setShowLine(true)}
        onScrollEndDrag={() => setShowLine(false)}
        bounces={true}
      >
        {walletList}

        <Space.Height.lg />
      </ScrollView>

      <View
        style={[
          a.px_lg,
          (showLine || isScrollBarShown) && {
            ...a.border_t,
            borderTopColor: p.gray_200,
          },
        ]}
      >
        <Space.Height.lg />

        <SupportTicketLink />

        <Space.Height.lg />

        <AddWalletButton />

        {isDev && (
          <>
            <Space.Height.md />

            <OnlyDevButton />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const SupportTicketLink = () => {
  const {palette: p, atoms: ta} = useTheme()
  const onPress = () => Linking.openURL(linkToSupportOpenTicket)
  const strings = useStrings()

  return (
    <TouchableOpacity
      style={[a.flex_row, a.align_center, a.justify_center]}
      onPress={onPress}
    >
      <SupportIllustration color={p.text_primary_medium} />
      <Space.Width.sm />
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
