import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {delay} from 'bluebird'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useMutation, UseMutationOptions} from 'react-query'
import {useDispatch} from 'react-redux'

import {checkBiometricStatus, logout, showErrorDialog} from '../../../legacy/actions'
import Screen from '../../../legacy/components/Screen'
import {Button, PleaseWaitModal, ScreenBackground, StatusBar} from '../../../legacy/components/UiKit'
import {CONFIG, isNightly} from '../../../legacy/config/config'
import {isJormungandr} from '../../../legacy/config/networks'
import {InvalidState} from '../../../legacy/crypto/errors'
import walletManager, {KeysAreInvalid, SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import globalMessages, {errorMessages} from '../../../legacy/i18n/global-messages'
import {WalletMeta} from '../../../legacy/state'
import {COLORS} from '../../../legacy/styles/config'
import {useWalletMetas} from '../../hooks'
import {useWalletNavigation, WalletStackRouteNavigation, WalletStackRoutes} from '../../navigation'
import {WalletInterface} from '../../types'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '..'
import {useSelectedWalletContext} from '../Context'
import {WalletListItem} from './WalletListItem'

export const WalletSelectionScreen = () => {
  const strings = useStrings()
  const {resetToWalletSelection, navigateToTxHistory} = useWalletNavigation()
  const navigation = useNavigation<WalletStackRouteNavigation>()
  const walletMetas = useWalletMetas()
  const dispatch = useDispatch()
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()
  const intl = useIntl()
  const [wallet] = useSelectedWalletContext()
  const params = useRoute<RouteProp<WalletStackRoutes, 'wallet-selection'>>().params

  const {openWallet, isLoading} = useOpenWallet({
    onSuccess: ({wallet, walletMeta}) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      navigateToTxHistory()
    },
    onError: async (error) => {
      navigation.setParams({reopen: true})
      if (error instanceof SystemAuthDisabled) {
        await walletManager.closeWallet()
        await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
        resetToWalletSelection()
      } else if (error instanceof InvalidState) {
        await walletManager.closeWallet()
        await showErrorDialog(errorMessages.walletStateInvalid, intl)
        resetToWalletSelection()
      } else if (error instanceof KeysAreInvalid) {
        await showErrorDialog(errorMessages.walletKeysInvalidated, intl)
        await dispatch(checkBiometricStatus())
        await dispatch(logout())
      } else {
        throw error
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
      return openWallet(walletMeta)
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
              <ActivityIndicator />
            )}
          </ScrollView>

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
  }
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

  return <Button onPress={() => navigation.navigate('screens-index')} title="Dev options" style={styles.button} />
}

const useOpenWallet = (
  options?: UseMutationOptions<
    {
      wallet: WalletInterface
      walletMeta: WalletMeta
    },
    Error,
    WalletMeta
  >,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: async (walletMeta) => {
      await walletManager.closeWallet()
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
