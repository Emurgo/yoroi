// @flow

import React from 'react'
import {Text, ScrollView, ActivityIndicator} from 'react-native'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import _ from 'lodash'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl'

import walletManager, {
  SystemAuthDisabled,
  KeysAreInvalid,
} from '../../crypto/wallet'
import WalletListItem from './WalletListItem'
import Screen from '../Screen'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import {ROOT_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {showErrorDialog} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'

import styles from './styles/WalletSelectionScreen.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const messages = defineMessages({
  header: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: '!!!Your wallets',
  },
  balanceCheckButton: {
    id: 'components.walletselection.walletselectionscreen.balanceCheckButton',
    defaultMessage: '!!!Balance check (Shelley Testnet)',
    description: 'some ddesc',
  },
  addWalletButton: {
    id: 'components.walletselection.walletselectionscreen.addWalletButton',
    defaultMessage: '!!!Add wallet',
  },
})

const snapshotEndMsg = defineMessages({
  title: {
    id:
      'components.walletinit.balancecheck.balancecheckscreen.snapshotend.title',
    defaultMessage: '!!!Snapshot has ended',
  },
  message: {
    id:
      'components.walletinit.balancecheck.balancecheckscreen.snapshotend.message',
    defaultMessage:
      '!!!The snapshot period has ended. You can start delegating now using ' +
      'the Yoroi extension, and soon you will be able to do it from the mobile ' +
      'app as well.',
  },
})

const WalletListScreen = ({
  navigation,
  wallets,
  navigateInitWallet,
  showDialog,
  openWallet,
  intl,
}) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <Screen style={styles.container}>
      <ScreenBackground>
        <Text style={styles.title}>{intl.formatMessage(messages.header)}</Text>

        <ScrollView style={styles.wallets}>
          {wallets ? (
            _.sortBy(wallets, ({name}) => name).map((wallet) => (
              <WalletListItem
                key={wallet.id}
                wallet={wallet}
                onPress={openWallet}
              />
            ))
          ) : (
            <ActivityIndicator />
          )}
        </ScrollView>

        <Button
          onPress={navigateInitWallet}
          title={intl.formatMessage(messages.addWalletButton)}
          style={styles.addWalletButton}
        />

        <Button
          outline
          onPress={showDialog}
          title={intl.formatMessage(messages.balanceCheckButton)}
          style={styles.balanceCheckButton}
        />
      </ScreenBackground>
    </Screen>
  </SafeAreaView>
)

const walletsListSelector = (state) => Object.values(state.wallets)

export default injectIntl(
  (compose(
    connect((state: State) => ({
      wallets: walletsListSelector(state),
    })),
    withHandlers({
      navigateInitWallet: ({navigation}) => (event) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH),
      showDialog: ({intl}) => async (event) =>
        await showErrorDialog(snapshotEndMsg, intl),
      openWallet: ({navigation, intl}) => async (wallet) => {
        try {
          await walletManager.openWallet(wallet.id)
          navigation.navigate(ROOT_ROUTES.WALLET)
        } catch (e) {
          if (e instanceof SystemAuthDisabled) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
          } else if (e instanceof KeysAreInvalid) {
            await walletManager.cleanupInvalidKeys()
            await showErrorDialog(errorMessages.walletKeysInvalidated, intl)
          } else {
            throw e
          }
        }
      },
    }),
  )(WalletListScreen): ComponentType<{
    intl: IntlShape,
    navigation: NavigationScreenProp<NavigationState>,
  }>),
)
