import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {ScrollView, useScrollView} from '../../../../components/ScrollView/ScrollView'
import {Space} from '../../../../components/Space/Space'
import {isDev} from '../../../../kernel/env'
import {features} from '../../../../kernel/features'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useLinksRequestWallet} from '../../../Links/common/useLinksRequestWallet'
import {useWalletMetas} from '../../common/hooks/useWalletMetas'
import {useStrings} from '../../common/useStrings'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {SupportIllustration} from '../../illustrations/SupportIllustration'
import {AggregatedBalance} from './AggregatedBalance'
import {WalletListItem} from './WalletListItem'

export const SelectWalletFromList = () => {
  useLinksRequestWallet()
  const {styles, colors} = useStyles()
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
    (walletMeta: Wallet.Meta) => {
      walletManager.setSelectedWalletId(walletMeta.id)
      navigateToTxHistory()
    },
    [walletManager, navigateToTxHistory],
  )

  const data = React.useMemo(
    () =>
      walletMetas?.map((walletMeta) => (
        <React.Fragment key={walletMeta.id}>
          <WalletListItem walletMeta={walletMeta} onPress={handleOnSelect} />

          <Space height="lg" />
        </React.Fragment>
      )),
    [handleOnSelect, walletMetas],
  )

  return (
    <SafeAreaView style={styles.safeAreaView} edges={['left', 'right', 'bottom']}>
      {features.walletListAggregatedBalance && <AggregatedBalance />}

      <ScrollView
        ref={scrollViewRef}
        style={styles.list}
        onScrollBarChange={setIsScrollBarShown}
        onScrollBeginDrag={() => setShowLine(true)}
        onScrollEndDrag={() => setShowLine(false)}
        bounces={true}
      >
        {data}

        <Space height="lg" />
      </ScrollView>

      <View
        style={[
          styles.actions,
          (showLine || isScrollBarShown) && {borderTopWidth: 1, borderTopColor: colors.lightGray},
        ]}
      >
        <Space height="lg" />

        <SupportTicketLink />

        <Space height="lg" />

        <AddWalletButton />

        {isDev && (
          <>
            <Space height="md" />

            <OnlyDevButton />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const linkToSupportOpenTicket = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'

const SupportTicketLink = () => {
  const onPress = () => Linking.openURL(linkToSupportOpenTicket)
  const strings = useStrings()
  const {styles, colors} = useStyles()

  return (
    <TouchableOpacity style={styles.link} onPress={onPress}>
      <SupportIllustration color={colors.blue} />

      <Space width="sm" />

      <Text style={styles.linkText}>{strings.supportTicketLink.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const AddWalletButton = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {reset: resetSetupWalletState} = useSetupWallet()
  const {resetToWalletSetup} = useWalletNavigation()

  return (
    <Button
      onPress={() => {
        resetSetupWalletState()
        resetToWalletSetup()
      }}
      title={strings.addWalletButton}
      style={styles.topButton}
    />
  )
}

const OnlyDevButton = () => {
  const navigation = useNavigation()
  const {styles} = useStyles()

  return (
    <Button
      testID="btnDevOptions"
      onPress={() => navigation.navigate('developer')}
      title="Dev options"
      style={styles.button}
    />
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.py_lg,
    },
    topButton: {
      backgroundColor: color.primary_500,
    },
    button: {
      backgroundColor: color.primary_500,
    },
    linkText: {
      ...atoms.button_2_md,
      color: color.text_primary_medium,
    },
    link: {
      ...atoms.button_2_md,
      ...atoms.flex_row,
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    list: {
      ...atoms.px_lg,
    },
    actions: {
      ...atoms.px_lg,
    },
  })

  const colors = {
    blue: color.text_primary_medium,
    gray: color.gray_600,
    lightGray: color.gray_200,
  }

  return {styles, colors} as const
}
