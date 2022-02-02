import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {setEasyConfirmation, showErrorDialog, updateVersion} from '../../../legacy/actions'
import Screen from '../../../legacy/components/Screen'
import {Button, ScreenBackground, StatusBar} from '../../../legacy/components/UiKit'
import {CONFIG, isNightly} from '../../../legacy/config/config'
import {isJormungandr} from '../../../legacy/config/networks'
import {InvalidState} from '../../../legacy/crypto/errors'
import walletManager, {KeysAreInvalid, SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import globalMessages, {errorMessages} from '../../../legacy/i18n/global-messages'
import {ROOT_ROUTES, WALLET_INIT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import {walletsListSelector} from '../../../legacy/selectors'
import {WalletMeta} from '../../../legacy/state'
import {COLORS} from '../../../legacy/styles/config'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '..'
import {WalletListItem} from './WalletListItem'

export const WalletSelectionScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const wallets = useSelector(walletsListSelector)
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()
  const dispatch = useDispatch()

  const openWallet = async (walletMeta: WalletMeta, isRetry?: boolean) => {
    try {
      if (walletMeta.isShelley || isJormungandr(walletMeta.networkId)) {
        await showErrorDialog(errorMessages.itnNotSupported, intl)
        return
      }
      const [wallet, newWalletMeta] = await walletManager.openWallet(walletMeta)
      selectWalletMeta(newWalletMeta)
      selectWallet(wallet)

      const route = WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES
      navigation.navigate(route)
    } catch (e) {
      if (e instanceof SystemAuthDisabled) {
        await walletManager.closeWallet()
        await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
        navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
      } else if (e instanceof InvalidState) {
        await walletManager.closeWallet()
        await showErrorDialog(errorMessages.walletStateInvalid, intl)
        navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
      } else if (e instanceof KeysAreInvalid) {
        await walletManager.cleanupInvalidKeys()
        await walletManager.disableEasyConfirmation()
        await dispatch(setEasyConfirmation(false))
        await showErrorDialog(errorMessages.walletKeysInvalidated, intl)
        if (!isRetry) {
          await openWallet(walletMeta, true)
        }
      } else {
        throw e
      }
    }
  }

  React.useEffect(() => {
    dispatch(updateVersion())
  }, [dispatch])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Screen style={styles.container}>
        <ScreenBackground>
          <Text style={styles.title}>{strings.header}</Text>

          <ScrollView style={styles.wallets}>
            {wallets ? (
              wallets
                .sort(byName)
                .map((wallet) => <WalletListItem key={wallet.id} wallet={wallet} onPress={openWallet} />)
            ) : (
              <ActivityIndicator />
            )}
          </ScrollView>

          <ShelleyButton />

          {isNightly() && <ShelleyTestnetButton />}

          <ByronButton />

          {CONFIG.NETWORKS.JORMUNGANDR.ENABLED && <JormungandrButton />}
        </ScreenBackground>
      </Screen>
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
})

const useStrings = () => {
  const intl = useIntl()

  return {
    header: intl.formatMessage(messages.header),
    addWalletButton: intl.formatMessage(messages.addWalletButton),
    addWalletOnShelleyButton: intl.formatMessage(messages.addWalletOnShelleyButton),
    deprecated: intl.formatMessage(globalMessages.deprecated),
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
        navigation.navigate(ROOT_ROUTES.NEW_WALLET, {
          screen: WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH,
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

const ShelleyTestnetButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  return (
    <Button
      onPress={() =>
        // note: assume wallet implementation = yoroi haskell shelley
        // (15 words), but user may choose 24 words in next screen
        navigation.navigate(ROOT_ROUTES.NEW_WALLET, {
          screen: WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH,
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
        navigation.navigate(ROOT_ROUTES.NEW_WALLET, {
          screen: WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH,
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

const JormungandrButton = () => {
  const navigation = useNavigation()
  const strings = useStrings()

  return (
    <Button
      outline
      onPress={() =>
        navigation.navigate(ROOT_ROUTES.NEW_WALLET, {
          screen: WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH,
          params: {
            networkId: CONFIG.NETWORKS.JORMUNGANDR.NETWORK_ID,
            walletImplementationId: CONFIG.WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
          },
        })
      }
      title={strings.addWalletOnShelleyButton}
      style={styles.button}
    />
  )
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
