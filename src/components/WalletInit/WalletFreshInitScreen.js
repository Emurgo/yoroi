// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import WalletDescription from './WalletDescription'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
// uses same styles as WalletInitScreen
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {CONFIG, isNightly} from '../../config/config'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {NetworkId, WalletImplementationId} from '../../config/types'

const messages = defineMessages({
  addWalletButton: {
    id: 'components.walletinit.walletfreshinitscreen.addWalletButton',
    defaultMessage: '!!!Add wallet',
  },
  addWalletOnShelleyButton: {
    id: 'components.walletinit.walletfreshinitscreen.addWalletOnShelleyButton',
    defaultMessage: '!!!Add wallet (Shelley Testnet)',
  },
})

type Props = {|
  intl: IntlShape,
  navigation: Navigation,
  navigateInitWallet: (Object, NetworkId, WalletImplementationId) => mixed,
|}

const WalletInitScreen = ({intl, navigateInitWallet}: Props) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScreenBackground>
        <View style={styles.container}>
          <View style={styles.content}>
            <WalletDescription />
          </View>
          <Button
            onPress={(event) =>
              // assume regular haskell shelley wallet. In next screen, user
              // may choose to use a 24-word mnemonic (-> diffferent impl id)
              navigateInitWallet(
                event,
                CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
                CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
              )
            }
            title={`${intl.formatMessage(
              messages.addWalletButton,
            )} (Shelley-era)`}
            style={styles.createButton}
            testID="addWalletOnHaskellShelleyButton"
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
              title={`${intl.formatMessage(
                messages.addWalletButton,
              )} on TESTNET (Shelley-era)`}
              style={styles.createButton}
            />
          )}

          <Button
            onPress={(event) =>
              navigateInitWallet(
                event,
                CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
                CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
              )
            }
            title={`${intl.formatMessage(
              messages.addWalletButton,
            )} (Byron-era)`}
            outline
            style={styles.createButton}
            testID="addWalletOnByronButton"
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
              testID="addWalletOnShelleyButton"
            />
          )}
        </View>
      </ScreenBackground>
    </SafeAreaView>
  )
}
export default injectIntl(
  compose(
    connect((_state: State) => ({})),
    withHandlers({
      navigateInitWallet:
        ({navigation}) =>
        (
          event: Object,
          networkId: NetworkId,
          walletImplementationId: WalletImplementationId,
        ) =>
          navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH, {
            networkId,
            walletImplementationId,
          }),
    }),
  )(WalletInitScreen),
)
