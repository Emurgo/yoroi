import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {NetworkError} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {InteractionManager, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button'
import {ScrollView, useScrollView} from '../../../../components/ScrollView/ScrollView'
import {Space} from '../../../../components/Space/Space'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {isNightly} from '../../../../legacy/config'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import {WalletMeta} from '../../../../wallet-manager/types'
import {useWalletManager} from '../../../../wallet-manager/WalletManagerContext'
import * as HASKELL_SHELLEY from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as HASKELL_SHELLEY_TESTNET from '../../../../yoroi-wallets/cardano/constants/testnet/constants'
import {InvalidState} from '../../../../yoroi-wallets/cardano/errors'
import {isJormungandr} from '../../../../yoroi-wallets/cardano/networks'
import {useOpenWallet, useWalletMetas} from '../../../../yoroi-wallets/hooks'
import {useLinksRequestWallet} from '../../../Links/common/useLinksRequestWallet'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../common/Context'
import {useWalletSetup} from '../../common/translators/reactjs/hooks/useWalletSetup'
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
  const intl = useIntl()
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

  const {openWallet} = useOpenWallet({
    onSuccess: ([wallet, walletMeta]) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      navigateToTxHistory()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof InvalidState
          ? showErrorDialog(errorMessages.walletStateInvalid, intl)
          : error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const onSelect = React.useCallback(
    async (walletMeta: WalletMeta) => {
      if (walletMeta.isShelley || isJormungandr(walletMeta.networkId)) {
        await showErrorDialog(errorMessages.itnNotSupported, intl)
        return
      }

      return openWallet(walletMeta)
    },
    [intl, openWallet],
  )

  const data = React.useMemo(
    () =>
      walletMetas?.map((walletMeta, index, allData) => (
        <React.Fragment key={walletMeta.id}>
          <WalletListItem wallet={walletMeta} onPress={onSelect} />

          {index < allData.length - 1 && <Space height="l" />}
        </React.Fragment>
      )),
    [onSelect, walletMetas],
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
      >
        {data}
      </ScrollView>

      <View
        style={[
          styles.actions,
          (showLine || isScrollBarShown) && {borderTopWidth: 1, borderTopColor: colors.lightGray},
        ]}
      >
        <Space height="l" />

        <SupportTicketLink />

        <Space height="l" />

        <ShelleyButton />

        <Space height="m" />

        <OnlyNightlyShelleyTestnetButton />

        <Space height="m" />

        <OnlyNightlyShelleySanchonetButton />

        <Space height="m" />

        <OnlyDevButton />
      </View>
    </SafeAreaView>
  )
}

const SUPPORT_TICKET_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'

const SupportTicketLink = () => {
  const onPress = () => Linking.openURL(SUPPORT_TICKET_LINK)
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.link} onPress={onPress}>
      <SupportIllustration />

      <Space width="s" />

      <Text style={styles.linkText}>{strings.supportTicketLink.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const ShelleyButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {styles} = useStyles()
  const {networkIdChanged, walletImplementationIdChanged, reset: resetWalletSetup} = useWalletSetup()

  return (
    <Button
      onPress={() => {
        resetWalletSetup()

        networkIdChanged(HASKELL_SHELLEY.NETWORK_ID)
        walletImplementationIdChanged(HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID)

        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
        })
      }}
      title={strings.addWalletButton}
      style={styles.topButton}
    />
  )
}

const OnlyNightlyShelleyTestnetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {styles} = useStyles()
  const {networkIdChanged, walletImplementationIdChanged, reset: resetWalletSetup} = useWalletSetup()

  if (!isNightly() && !__DEV__) return null

  return (
    <Button
      onPress={() => {
        resetWalletSetup()

        networkIdChanged(HASKELL_SHELLEY_TESTNET.NETWORK_ID)
        walletImplementationIdChanged(HASKELL_SHELLEY_TESTNET.WALLET_IMPLEMENTATION_ID)

        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
        })
      }}
      title={`${strings.addWalletButton} (preprod)`}
      style={styles.button}
      testID="addWalletPreprodShelleyButton"
    />
  )
}

const OnlyNightlyShelleySanchonetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()
  const {styles} = useStyles()
  const {networkIdChanged, walletImplementationIdChanged, reset: resetWalletSetup} = useWalletSetup()

  if (!isNightly() && !__DEV__) return null

  const handleOnPress = () => {
    resetWalletSetup()

    networkIdChanged(SANCHONET.NETWORK_ID)
    walletImplementationIdChanged(SANCHONET.WALLET_IMPLEMENTATION_ID)

    navigation.navigate('new-wallet', {
      screen: 'choose-create-restore',
    })
  }

  return <Button onPress={handleOnPress} title={`${strings.addWalletButton} (sanchonet)`} style={styles.button} />
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
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
    topButton: {
      backgroundColor: theme.color.primary[500],
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
    linkText: {
      color: theme.color.primary[500],
    },
    link: {
      ...theme.typography['button-2-m'],
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      ...theme.padding['l'],
    },
    actions: {
      ...theme.padding['x-l'],
    },
  })

  const colors = {
    gray: theme.color.gray[600],
    lightGray: theme.color.gray[200],
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
