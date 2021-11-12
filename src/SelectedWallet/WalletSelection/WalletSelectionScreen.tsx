import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog, updateVersion} from '../../../legacy/actions'
import Screen from '../../../legacy/components/Screen'
import {Button, ScreenBackground, StatusBar} from '../../../legacy/components/UiKit'
import {CONFIG, isNightly} from '../../../legacy/config/config'
import {isJormungandr} from '../../../legacy/config/networks'
import type {NetworkId, WalletImplementationId, YoroiProvider} from '../../../legacy/config/types'
import {InvalidState} from '../../../legacy/crypto/errors'
import walletManager, {KeysAreInvalid, SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import globalMessages, {errorMessages} from '../../../legacy/i18n/global-messages'
import {ROOT_ROUTES, WALLET_INIT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import {walletsListSelector} from '../../../legacy/selectors'
import {WalletMeta} from '../../../legacy/state'
import {useSetSelectedWalletMeta} from '..'
import styles from './styles/WalletSelectionScreen.style'
import WalletListItem from './WalletListItem'

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

export const WalletSelectionScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const wallets = useSelector(walletsListSelector)
  const selectWalletMeta = useSetSelectedWalletMeta()

  const openWallet = async (walletMeta: WalletMeta) => {
    try {
      if (walletMeta.isShelley || isJormungandr(walletMeta.networkId)) {
        await showErrorDialog(errorMessages.itnNotSupported, intl)
        return
      }
      await walletManager.openWallet(walletMeta)
      selectWalletMeta(walletMeta)
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
        await showErrorDialog(errorMessages.walletKeysInvalidated, intl)
      } else {
        throw e
      }
    }
  }

  const navigateInitWallet = (
    event: Record<string, unknown>,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
    provider?: YoroiProvider | null | void,
  ) =>
    navigation.navigate(ROOT_ROUTES.NEW_WALLET, {
      screen: WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH,
      params: {
        networkId,
        walletImplementationId,
        provider,
      },
    })

  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(updateVersion())
  }, [dispatch])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Screen style={styles.container}>
        <ScreenBackground>
          <Text style={styles.title}>{intl.formatMessage(messages.header)}</Text>

          <ScrollView style={styles.wallets}>
            {wallets ? (
              _.sortBy(wallets, ({name}) => name).map((wallet) => (
                <WalletListItem key={wallet.id} wallet={wallet} onPress={openWallet} />
              ))
            ) : (
              <ActivityIndicator />
            )}
          </ScrollView>

          <Button
            onPress={(event) =>
              // note: assume wallet implementation = yoroi haskell shelley
              // (15 words), but user may choose 24 words in next screen
              navigateInitWallet(
                event,
                CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
                CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
              )
            }
            title={`${intl.formatMessage(messages.addWalletButton)}`}
            style={styles.topButton}
          />

          {isNightly() && (
            <Button
              onPress={(event) =>
                // note: assume wallet implementation = yoroi haskell shelley
                // (15 words), but user may choose 24 words in next screen
                navigateInitWallet(
                  event,
                  CONFIG.NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID,
                  CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
                )
              }
              title={`${intl.formatMessage(messages.addWalletButton)} on TESTNET (Shelley-era)`}
              style={styles.button}
            />
          )}

          <Button
            outline
            onPress={(event) =>
              navigateInitWallet(
                event,
                CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
                CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
              )
            }
            title={`${intl.formatMessage(messages.addWalletButton)} (Byron-era - ${intl.formatMessage(
              globalMessages.deprecated,
            )})`}
            style={styles.button}
          />

          {CONFIG.NETWORKS.JORMUNGANDR.ENABLED && (
            <Button
              outline
              onPress={(event) =>
                navigateInitWallet(
                  event,
                  CONFIG.NETWORKS.JORMUNGANDR.NETWORK_ID,
                  CONFIG.WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
                )
              }
              title={intl.formatMessage(messages.addWalletOnShelleyButton)}
              style={styles.button}
            />
          )}
        </ScreenBackground>
      </Screen>
    </SafeAreaView>
  )
}
