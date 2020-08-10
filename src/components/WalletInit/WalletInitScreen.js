// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import WalletDescription from './WalletDescription'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {walletIsInitializedSelector} from '../../selectors'
import {isJormungandr} from '../../config/networks'
import {CONFIG} from '../../config/config'

import styles from './styles/WalletInitScreen.style'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {NetworkId} from '../../config/types'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.walletinitscreen.title',
    defaultMessage: '!!!Add wallet',
  },
  createWalletButton: {
    id: 'components.walletinit.walletinitscreen.createWalletButton',
    defaultMessage: '!!!Create wallet',
  },
  restoreWalletButton: {
    id: 'components.walletinit.walletinitscreen.restoreWalletButton',
    defaultMessage: '!!!Restore wallet',
  },
  createWalletWithLedgerButton: {
    id: 'components.walletinit.walletinitscreen.createWalletWithLedgerButton',
    defaultMessage: '!!!Connect to Ledger Nano',
  },
})

type Props = {
  navigateRestoreWallet: (Object, boolean) => mixed,
  navigateCreateWallet: (Object, boolean) => mixed,
  navigateCheckNanoX: (Object, boolean, boolean) => mixed,
  intl: any,
  walletIsInitialized: boolean,
  navigation: Navigation,
  showModal: boolean,
  setShowModal: (Object, boolean) => void,
}

const WalletInitScreen = ({
  navigateCreateWallet,
  navigateRestoreWallet,
  navigateCheckNanoX,
  intl,
  walletIsInitialized,
  navigation,
  showModal,
  setShowModal,
}: Props) => {
  const networkId = navigation.getParam('networkId')
  let createWalletLabel = intl.formatMessage(messages.createWalletButton)
  let restoreWalletLabel = intl.formatMessage(messages.restoreWalletButton)
  let createWalletWithLedgerLabel = intl.formatMessage(
    messages.createWalletWithLedgerButton,
  )
  if (isJormungandr(networkId)) {
    createWalletLabel += ' (ITN)'
    restoreWalletLabel += ' (ITN)'
    createWalletWithLedgerLabel += ' (ITN)'
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScreenBackground>
        <View style={styles.container}>
          <View style={styles.content}>
            <WalletDescription />
          </View>
          <Button
            onPress={(event) => navigateCreateWallet(event, networkId)}
            title={createWalletLabel}
            style={styles.createButton}
            testID="createWalletButton"
          />
          <Button
            outline
            onPress={(event) => navigateRestoreWallet(event, networkId)}
            title={restoreWalletLabel}
            style={styles.createButton}
            testID="restoreWalletButton"
          />
          {!isJormungandr(networkId) && (
            <>
              <Button
                disabled={!CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLED}
                outline
                onPress={(event) => setShowModal(event, true)}
                title={createWalletWithLedgerLabel}
                style={styles.createButton}
              />
              <LedgerTransportSwitchModal
                visible={showModal}
                onRequestClose={(event) => setShowModal(event, false)}
                onSelectUSB={(event) =>
                  navigateCheckNanoX(event, networkId, true)
                }
                onSelectBLE={(event) =>
                  navigateCheckNanoX(event, networkId, false)
                }
                showCloseIcon
              />
            </>
          )}
        </View>
      </ScreenBackground>
    </SafeAreaView>
  )
}
export default injectIntl(
  compose(
    connect((state: State) => ({
      walletIsInitialized: walletIsInitializedSelector(state),
    })),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withStateHandlers(
      {
        showModal: false,
      },
      {
        setShowModal: (state) => (event, showModal) => ({showModal}),
      },
    ),
    withHandlers({
      navigateRestoreWallet: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
      ) =>
        navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET, {
          networkId,
        }),
      navigateCreateWallet: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
      ) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET, {
          networkId,
        }),
      navigateCheckNanoX: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
        useUSB: boolean,
      ) =>
        navigation.navigate(WALLET_INIT_ROUTES.CHECK_NANO_X, {
          networkId,
          useUSB,
        }),
    }),
  )(WalletInitScreen),
)
