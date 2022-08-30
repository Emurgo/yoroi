import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {delay} from 'bluebird'
import React from 'react'
import {defineMessages, IntlShape, useIntl} from 'react-intl'
import {ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useMutation, UseMutationOptions, useQueryClient} from 'react-query'
import {useDispatch} from 'react-redux'

import {Button, Icon, PleaseWaitModal, ScreenBackground, StatusBar} from '../../components'
import {useLogout, useWalletMetas} from '../../hooks'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {clearAccountState} from '../../legacy/account'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG, isNightly} from '../../legacy/config'
import {InvalidState} from '../../legacy/errors'
import {isJormungandr} from '../../legacy/networks'
import {WalletMeta} from '../../legacy/state'
import {useCloseWallet} from '../../legacy/useCloseWallet'
import {clearUTXOs} from '../../legacy/utxo'
import {useWalletNavigation, WalletStackRouteNavigation, WalletStackRoutes} from '../../navigation'
import Screen from '../../Screen'
import {COLORS} from '../../theme'
import {KeysAreInvalid, walletManager, YoroiWallet} from '../../yoroi-wallets'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '..'
import {useSelectedWalletContext} from '../Context'
import {WalletListItem} from './WalletListItem'

export const WalletSelectionScreen = () => {
  const strings = useStrings()
  const {resetToWalletSelection, navigateToTxHistory} = useWalletNavigation()
  const navigation = useNavigation<WalletStackRouteNavigation>()
  const walletMetas = useWalletMetas()
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()
  const intl = useIntl()
  const params = useRoute<RouteProp<WalletStackRoutes, 'wallet-selection'>>().params
  const [wallet] = useSelectedWalletContext()
  const queryClient = useQueryClient()
  const logout = useLogout()
  const closeWalletWhenInvalidStateError = useCloseWalletWhenInvalidStateError(intl, resetToWalletSelection)

  const {openWallet, isLoading} = useOpenWallet({
    onSuccess: ({wallet, walletMeta}) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      wallet.subscribeOnTxHistoryUpdate(() => queryClient.invalidateQueries([wallet.id, 'lockedAmount']))
      navigateToTxHistory()
    },
    onError: async (error) => {
      navigation.setParams({reopen: true})
      if (error instanceof InvalidState) {
        closeWalletWhenInvalidStateError()
      } else if (error instanceof KeysAreInvalid) {
        await showErrorDialog(errorMessages.walletKeysInvalidated, intl)
        logout()
      } else {
        await showErrorDialog(errorMessages.walletStateInvalid, intl)
      }
    },
  })

  const onSelect = async (walletMeta: WalletMeta) => {
    if (walletMeta.isShelley || isJormungandr(walletMeta.networkId)) {
      await showErrorDialog(errorMessages.itnNotSupported, intl)
      return
    }

    if (params?.reopen || wallet?.id !== walletMeta.id) {
      navigation.setParams({reopen: false})

      return openWallet({wallet, walletMeta})
    }
    return navigateToTxHistory()
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Screen style={styles.container}>
        <ScreenBackground>
          <Text style={styles.title}>{strings.header}</Text>

          <ScrollView style={styles.wallets}>
            {walletMetas ? (
              walletMetas
                .sort(byName)
                .map((walletMeta) => <WalletListItem key={walletMeta.id} wallet={walletMeta} onPress={onSelect} />)
            ) : (
              <ActivityIndicator color="black" />
            )}
          </ScrollView>

          <SupportTicketLink />
          <ShelleyButton />
          <OnlyNightlyShelleyTestnetButton />
          <ByronButton />
          <OnlyDevButton />
        </ScreenBackground>
      </Screen>
      <PleaseWaitModal title={strings.loadingWallet} spinnerText={strings.pleaseWait} visible={isLoading} />
    </SafeAreaView>
  )
}

const useCloseWalletWhenInvalidStateError = (
  intl: IntlShape | null | undefined,
  resetToWalletSelection: () => void,
) => {
  const {closeWallet: closeWalletWhenInvalidStateError} = useCloseWallet({
    onSuccess: async () => {
      await showErrorDialog(errorMessages.walletStateInvalid, intl)
      resetToWalletSelection()
    },
  })

  return closeWalletWhenInvalidStateError
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
            networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
            walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
            provider: '',
          },
        })
      }
      title={`${strings.addWalletButton}`}
      style={styles.topButton}
    />
  )
}

const OnlyNightlyShelleyTestnetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  if (!isNightly()) return null

  return (
    <Button
      onPress={() =>
        // note: assume wallet implementation = yoroi haskell shelley
        // (15 words), but user may choose 24 words in next screen
        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
          params: {
            networkId: CONFIG.NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID,
            walletImplementationId: CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
            provider: '',
          },
        })
      }
      title={`${strings.addWalletButton} on TESTNET (Shelley-era)`}
      style={styles.button}
    />
  )
}

const ByronButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  return (
    <Button
      outline
      onPress={() =>
        navigation.navigate('new-wallet', {
          screen: 'choose-create-restore',
          params: {
            networkId: CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
            walletImplementationId: CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
            provider: '',
          },
        })
      }
      title={`${strings.addWalletButton} (Byron-era - ${strings.deprecated})`}
      style={styles.button}
    />
  )
}

const OnlyDevButton = () => {
  const navigation = useNavigation()

  if (!__DEV__) return null

  return <Button onPress={() => navigation.navigate('developer')} title="Dev options" style={styles.button} />
}

const useOpenWallet = (
  options?: UseMutationOptions<
    {
      wallet: YoroiWallet
      walletMeta: WalletMeta
    },
    Error,
    {walletMeta: WalletMeta; wallet: YoroiWallet | undefined}
  >,
) => {
  const dispatch = useDispatch()

  const mutation = useMutation({
    ...options,
    mutationFn: async ({wallet, walletMeta}) => {
      if (wallet !== undefined) {
        await walletManager.closeWallet()
        dispatch(clearUTXOs())
        dispatch(clearAccountState())
      }

      await delay(500)

      const [newWallet, newWalletMeta] = await walletManager.openWallet(walletMeta)

      return {
        wallet: newWallet,
        walletMeta: newWalletMeta,
      }
    },
  })

  return {openWallet: mutation.mutate, ...mutation}
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    color: '#fff',
    paddingVertical: 16,
  },
  wallets: {
    margin: 16,
    flex: 1,
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
