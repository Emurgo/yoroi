import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button'
import {ScrollView, useScrollView} from '../../../../components/ScrollView/ScrollView'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import * as HASKELL_SHELLEY from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import {useWalletMetas} from '../../../../yoroi-wallets/hooks'
import {useLinksRequestWallet} from '../../../Links/common/useLinksRequestWallet'
import {WalletMeta} from '../../../WalletManager/common/types'
import {useSetSelectedWallet} from '../../../WalletManager/context/SelectedWalletContext'
import {useSetSelectedWalletMeta} from '../../../WalletManager/context/SelectedWalletMetaContext'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerContext'
import {useStrings} from '../../common/useStrings'
import {SupportIllustration} from '../../illustrations/SupportIllustration'
import {WalletListItem} from './WalletListItem'

export const SelectWalletFromList = () => {
  useLinksRequestWallet()
  const {styles, colors} = useStyles()
  const walletManager = useWalletManager()
  const {navigateToTxHistory} = useWalletNavigation()
  const {walletMetas, isFetching, refetch} = useWalletMetas(walletManager, {
    select: (walletMetas) => walletMetas.sort(byName),
  })
  const {track} = useMetrics()
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()
  const [showLine, setShowLine] = React.useState(false)

  useFocusEffect(
    React.useCallback(() => {
      track.allWalletsPageViewed()
    }, [track]),
  )

  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()

  const handleOnSelect = React.useCallback(
    (walletMeta: WalletMeta) => {
      selectWalletMeta(walletMeta)
      const wallet = walletManager.getOpenedWalletById(walletMeta.id)
      selectWallet(wallet)
      walletManager.setSelectedWalletId(walletMeta.id)
      navigateToTxHistory()
    },
    [selectWalletMeta, walletManager, selectWallet, navigateToTxHistory],
  )

  const data = React.useMemo(
    () =>
      walletMetas?.map((walletMeta) => (
        <React.Fragment key={walletMeta.id}>
          <WalletListItem wallet={walletMeta} onPress={handleOnSelect} />

          <Space height="lg" />
        </React.Fragment>
      )),
    [handleOnSelect, walletMetas],
  )

  return (
    <SafeAreaView style={styles.safeAreaView} edges={['left', 'right', 'bottom']}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        onScrollBarChange={setIsScrollBarShown}
        onScrollBeginDrag={() => setShowLine(true)}
        onScrollEndDrag={() => setShowLine(false)}
        bounces={false}
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

        <Space height="md" />

        <OnlyDevButton />
      </View>
    </SafeAreaView>
  )
}

const linkToSupportOpenTicket = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'

const SupportTicketLink = () => {
  const onPress = () => Linking.openURL(linkToSupportOpenTicket)
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.link} onPress={onPress}>
      <SupportIllustration />

      <Space width="sm" />

      <Text style={styles.linkText}>{strings.supportTicketLink.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const AddWalletButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {styles} = useStyles()
  const {walletImplementationIdChanged, reset: resetSetupWallet} = useSetupWallet()

  return (
    <Button
      onPress={() => {
        resetSetupWallet()
        walletImplementationIdChanged(HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID)

        navigation.navigate('new-wallet', {
          screen: 'setup-wallet-choose-setup-type',
        })
      }}
      title={strings.addWalletButton}
      style={styles.topButton}
    />
  )
}

const OnlyDevButton = () => {
  const navigation = useNavigation()
  const {styles} = useStyles()

  if (!__DEV__) return null

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
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    topButton: {
      backgroundColor: color.primary_c500,
    },
    button: {
      backgroundColor: color.primary_c500,
    },
    linkText: {
      color: color.primary_c500,
    },
    link: {
      ...atoms.button_2_md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      ...atoms.p_lg,
    },
    actions: {
      ...atoms.px_lg,
    },
  })

  const colors = {
    gray: color.gray_c600,
    lightGray: color.gray_c200,
  }

  return {styles, colors} as const
}

const byName = (a: {name: string}, b: {name: string}) => {
  const nameA = a.name.toUpperCase()
  const nameB = b.name.toUpperCase()

  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }

  return 0
}
