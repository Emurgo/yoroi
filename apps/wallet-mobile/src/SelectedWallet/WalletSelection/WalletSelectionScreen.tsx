import {useFocusEffect, useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, InteractionManager, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../components/Button'
import {useStatusBar} from '../../components/hooks/useStatusBar'
import {Icon} from '../../components/Icon'
import {PleaseWaitModal} from '../../components/PleaseWaitModal'
import {showErrorDialog} from '../../dialogs'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {isNightly} from '../../legacy/config'
import {useMetrics} from '../../metrics/metricsManager'
import {useWalletNavigation} from '../../navigation'
import {COLORS} from '../../theme'
import {HexColor} from '../../theme/types'
import {WalletMeta} from '../../wallet-manager/types'
import {useWalletManager} from '../../wallet-manager/WalletManagerContext'
import * as HASKELL_SHELLEY from '../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as SANCHONET from '../../yoroi-wallets/cardano/constants/sanchonet/constants'
import * as HASKELL_SHELLEY_TESTNET from '../../yoroi-wallets/cardano/constants/testnet/constants'
import {InvalidState, NetworkError} from '../../yoroi-wallets/cardano/errors'
import {isJormungandr} from '../../yoroi-wallets/cardano/networks'
import {useOpenWallet, useWalletMetas} from '../../yoroi-wallets/hooks'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../Context'
import {WalletListItem} from './WalletListItem'

export const WalletSelectionScreen = () => {
  const strings = useStrings()
  const {navigateToTxHistory} = useWalletNavigation()
  const walletManager = useWalletManager()
  const {walletMetas, isFetching, refetch} = useWalletMetas(walletManager, {
    select: (walletMetas) => walletMetas.sort(byName),
  })
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()
  const intl = useIntl()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.allWalletsPageViewed()
    }, [track]),
  )

  const {openWallet, isLoading} = useOpenWallet({
    onSuccess: ([wallet, walletMeta]) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)

      // fixes modal issue
      // https://github.com/facebook/react-native/issues/32329
      // https://github.com/facebook/react-native/issues/33733
      // https://github.com/facebook/react-native/issues/29319
      InteractionManager.runAfterInteractions(() => {
        navigateToTxHistory()
      })
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

  useStatusBar(COLORS.BACKGROUND_BLUE as HexColor, isLoading)

  const onSelect = async (walletMeta: WalletMeta) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (walletMeta.isShelley || isJormungandr(walletMeta.networkId)) {
      await showErrorDialog(errorMessages.itnNotSupported, intl)
      return
    }

    return openWallet(walletMeta)
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.title}>{strings.header}</Text>

      <FlatList
        contentContainerStyle={{padding: 16}}
        data={walletMetas}
        keyExtractor={(item) => item.id}
        renderItem={({item: walletMeta}) => <WalletListItem wallet={walletMeta} onPress={onSelect} />}
        ListEmptyComponent={null}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      />

      <SupportTicketLink />

      <ShelleyButton />

      <OnlyNightlyShelleyTestnetButton />

      <OnlyNightlyShelleySanchonetButton />

      <OnlyDevButton />

      <PleaseWaitModal title={strings.loadingWallet} spinnerText={strings.pleaseWait} visible={isLoading} />
    </SafeAreaView>
  )
}

const messages = defineMessages({
  header: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: '!!!My wallets',
  },
  addWalletButton: {
    id: 'components.walletselection.walletselectionscreen.addWalletButton',
    defaultMessage: '!!!Add wallet',
  },
  addWalletOnShelleyButton: {
    id: 'components.walletselection.walletselectionscreen.addWalletOnShelleyButton',
    defaultMessage: '!!!Add wallet (Jormungandr ITN)',
  },
  loadingWallet: {
    id: 'components.walletselection.walletselectionscreen.loadingWallet',
    defaultMessage: '!!!Loading wallet',
  },
  supportTicketLink: {
    id: 'components.walletselection.walletselectionscreen.supportTicketLink',
    defaultMessage: '!!!Ask our support team',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    header: intl.formatMessage(messages.header),
    addWalletButton: intl.formatMessage(messages.addWalletButton),
    addWalletOnShelleyButton: intl.formatMessage(messages.addWalletOnShelleyButton),
    deprecated: intl.formatMessage(globalMessages.deprecated),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    loadingWallet: intl.formatMessage(messages.loadingWallet),
    supportTicketLink: intl.formatMessage(messages.supportTicketLink),
  }
}

const SUPPORT_TICKET_LINK = 'https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'

const SupportTicketLink = () => {
  const onPress = () => Linking.openURL(SUPPORT_TICKET_LINK)
  const strings = useStrings()

  return (
    <TouchableOpacity style={styles.link} onPress={() => onPress()}>
      <Icon.QuestionMark size={22} color="#fff" />

      <Text style={styles.linkText}>{strings.supportTicketLink.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const ShelleyButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  return (
    <Button
      onPress={() =>
        // note: assume wallet implementation = yoroi haskell shelley
        // (15 words), but user may choose 24 words in next screen
        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
          params: {
            networkId: HASKELL_SHELLEY.NETWORK_ID,
            walletImplementationId: HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
          },
        })
      }
      title={strings.addWalletButton}
      style={styles.topButton}
    />
  )
}

const OnlyNightlyShelleyTestnetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  if (!isNightly() && !__DEV__) return null

  return (
    <Button
      onPress={() =>
        // note: assume wallet implementation = yoroi haskell shelley
        // (15 words), but user may choose 24 words in next screen
        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
          params: {
            networkId: HASKELL_SHELLEY_TESTNET.NETWORK_ID,
            walletImplementationId: HASKELL_SHELLEY_TESTNET.WALLET_IMPLEMENTATION_ID,
          },
        })
      }
      title={`${strings.addWalletButton} (preprod)`}
      style={styles.button}
      testID="addWalletPreprodShelleyButton"
    />
  )
}

const OnlyNightlyShelleySanchonetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  if (!isNightly() && !__DEV__) return null

  const handleOnPress = () => {
    navigation.navigate('new-wallet', {
      screen: 'choose-create-restore',
      params: {
        networkId: SANCHONET.NETWORK_ID,
        walletImplementationId: SANCHONET.WALLET_IMPLEMENTATION_ID,
      },
    })
  }

  return <Button onPress={handleOnPress} title={`${strings.addWalletButton} (sanchonet)`} style={styles.button} />
}

const OnlyDevButton = () => {
  const navigation = useNavigation()

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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    color: '#fff',
    paddingVertical: 16,
  },
  topButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  button: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  linkText: {
    color: '#fff',
    marginLeft: 8,
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

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
