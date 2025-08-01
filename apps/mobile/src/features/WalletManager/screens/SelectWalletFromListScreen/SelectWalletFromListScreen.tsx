import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletMetas} from '~/features/WalletManager/hooks/useWalletMetas'
import {SupportIllustration} from '~/features/WalletManager/ui/illustrations/SupportIllustration'
import {isDev} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {ScrollView, useScrollView} from '~/ui/ScrollView/ScrollView'
import {Space} from '~/ui/Space/Space'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {WalletListItem} from './WalletListItem'

export const SelectWalletFromList = () => {
  // useLinksRequestWallet()
  const {palette: p} = useTheme()
  const walletMetas = useWalletMetas()
  const {track} = useMetrics()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  const [showLine, setShowLine] = React.useState(false)
  const {walletManager} = useWalletManager()
  const navigation = useNavigation<any>()

  useFocusEffect(
    React.useCallback(() => {
      track.allWalletsPageViewed()
    }, [track]),
  )

  const handleOnSelect = React.useCallback(
    async (walletMeta: Wallet.Meta) => {
      walletManager.setSelectedWalletId(walletMeta.id)
      /* if (await shouldHandleNotificationInternalNavigationAction()) {
        await handleNotificationInternalNavigationAction(pushNotificationsManager, walletNavigation)
        return
      } */
      navigation.navigate('manage-wallets', {
        screen: 'main-wallet-routes',
        params: {screen: 'history', params: {screen: 'history-list'}},
      })
    },
    [walletManager, navigation],
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
      {/* {features.walletListAggregatedBalance && <AggregatedBalance />} */}

      <ScrollView
        ref={scrollViewRef}
        style={[a.px_lg, a.pt_2xl]}
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
    <TouchableOpacity
      style={[a.flex_1, a.flex_row, a.justify_center]}
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
  const navigation = useNavigation<any>()
  const goToSetupWallet = React.useCallback(() => {
    navigation.navigate('wallet-setup')
  }, [navigation])

  return (
    <Button
      onPress={() => {
        resetSetupWalletState()
        goToSetupWallet()
      }}
      title={strings.walletManager.addWalletButton}
    />
  )
}

const OnlyDevButton = () => {
  const navigation = useNavigation<any>()
  const openDevMenu = React.useCallback(() => {
    navigation.navigate('dev')
  }, [navigation])

  return (
    <Button testID="btnDevOptions" onPress={openDevMenu} title="Dev options" />
  )
}
