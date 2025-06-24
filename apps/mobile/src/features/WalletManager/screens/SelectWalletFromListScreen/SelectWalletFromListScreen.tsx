import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import * as React from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {isDev} from '../../../../kernel/constants'
import {features} from '../../../../kernel/features'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {Button} from '../../../../ui/Button/Button'
import {ScrollView, useScrollView} from '../../../../ui/ScrollView/ScrollView'
import {Space} from '../../../../ui/Space/Space'
import {useLinksRequestWallet} from '../../../Links/common/useLinksRequestWallet'
import {pushNotificationsManager} from '../../../Notifications/common/notification-manager'
import {
  handleNotificationInternalNavigationAction,
  shouldHandleNotificationInternalNavigationAction,
} from '../../../Notifications/common/tools'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {useStrings} from '../../hooks/useStrings'
import {useWalletMetas} from '../../hooks/useWalletMetas'
import {SupportIllustration} from '../../ui/illustrations/SupportIllustration'
import {AggregatedBalance} from './AggregatedBalance'
import {WalletListItem} from './WalletListItem'

export const SelectWalletFromList = () => {
  useLinksRequestWallet()
  const {palette: p} = useTheme()
  const walletNavigation = useWalletNavigation()
  const {walletManager} = useWalletManager()
  const {navigateToTxHistory} = useWalletNavigation()
  const walletMetas = useWalletMetas()
  const {track} = useMetrics()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  const [showLine, setShowLine] = React.useState(false)

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
      navigateToTxHistory()
    },
    [walletManager, navigateToTxHistory, walletNavigation],
  )

  const data = React.useMemo(
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
        style={[a.px_lg]}
        onScrollBarChange={setIsScrollBarShown}
        onScrollBeginDrag={() => setShowLine(true)}
        onScrollEndDrag={() => setShowLine(false)}
        bounces={true}
      >
        {data}

        <Space.Height.lg />
      </ScrollView>

      <View
        style={[
          a.px_lg,
          (showLine || isScrollBarShown) && {
            borderTopWidth: 1,
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

const linkToSupportOpenTicket =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'

const SupportTicketLink = () => {
  const {palette: p, atoms: ta} = useTheme()
  const onPress = () => Linking.openURL(linkToSupportOpenTicket)
  const strings = useStrings()

  return (
    <TouchableOpacity style={[a.flex_row, a.align_center]} onPress={onPress}>
      <SupportIllustration color={p.text_primary_medium} />

      <Space.Width.sm />

      <Text style={[ta.text_primary_medium, a.button_2_md]}>
        {strings.supportTicketLink.toLocaleUpperCase()}
      </Text>
    </TouchableOpacity>
  )
}

const AddWalletButton = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {reset: resetSetupWalletState} = useSetupWallet()
  const {resetToWalletSetup} = useWalletNavigation()

  return (
    <Button
      onPress={() => {
        resetSetupWalletState()
        resetToWalletSetup()
      }}
      title={strings.addWalletButton}
      style={[ta.bg_color_max]}
    />
  )
}

const OnlyDevButton = () => {
  const navigation = useNavigation()
  const {atoms: ta} = useTheme()

  return (
    <Button
      testID="btnDevOptions"
      onPress={() => navigation.navigate('developer')}
      title="Dev options"
      style={[ta.bg_color_max]}
    />
  )
}
