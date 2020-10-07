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
import {Modal, Button, StatusBar, ScreenBackground} from '../UiKit'
import ExapandableItem from '../Common/ExpandableItem'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {walletIsInitializedSelector} from '../../selectors'
import {isJormungandr} from '../../config/networks'
import {CONFIG, isHaskellShelley} from '../../config/config'
import globalMessages from '../../i18n/global-messages'

import styles from './styles/WalletInitScreen.style'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {NetworkId, WalletImplementationId} from '../../config/types'

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
  restoreNormalWalletLabel: {
    id: 'components.walletinit.walletinitscreen.restoreNormalWalletLabel',
    defaultMessage: '!!!15-word Wallet',
  },
  restoreNormalWalletExplanation: {
    id: 'components.walletinit.walletinitscreen.restoreNormalWalletExplanation',
    defaultMessage:
      '!!!If you have a Yoroi recovery phrase consisting of 15 ' +
      'words generated when you created a Yoroi Wallet, choose this option ' +
      'to restore your wallet.',
  },
  restore24WordWalletLabel: {
    id: 'components.walletinit.walletinitscreen.restore24WordWalletLabel',
    defaultMessage: '!!!24-word Wallet',
  },
  restore24WordWalletExplanation: {
    id: 'components.walletinit.walletinitscreen.restore24WordWalletExplanation',
    defaultMessage:
      '!!!If you have a recovery phrase consisting of 24 ' +
      'words, choose this option to restore your wallet.',
  },
  createWalletWithLedgerButton: {
    id: 'components.walletinit.walletinitscreen.createWalletWithLedgerButton',
    defaultMessage: '!!!Connect to Ledger Nano',
  },
})

const MODAL_STATES = {
  CLOSED: 'CLOSED',
  CHOOSE_MNEMONICS_LEN: 'CHOOSE_MNEMONICS_LEN',
  LEDGER_TRANSPORT_SWITCH: 'LEDGER_TRANSPORT_SWITCH',
}
type ModalState = $Values<typeof MODAL_STATES>

type Props = {
  navigateRestoreWallet: (Object, NetworkId, WalletImplementationId) => mixed,
  navigateCreateWallet: (Object, NetworkId, WalletImplementationId) => mixed,
  navigateCheckNanoX: (
    Object,
    NetworkId,
    WalletImplementationId,
    boolean,
  ) => mixed,
  intl: any,
  walletIsInitialized: boolean,
  navigation: Navigation,
  modalState: ModalState,
  setModalState: (Object, ModalState) => void,
}

const WalletInitScreen = ({
  navigateCreateWallet,
  navigateRestoreWallet,
  navigateCheckNanoX,
  intl,
  walletIsInitialized,
  navigation,
  modalState,
  setModalState,
}: Props) => {
  const networkId = navigation.getParam('networkId')
  const implementationId = navigation.getParam('walletImplementationId')
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
            onPress={(event) =>
              navigateCreateWallet(event, networkId, implementationId)
            }
            title={createWalletLabel}
            style={styles.createButton}
            testID="createWalletButton"
          />
          <Button
            outline
            onPress={(event) => {
              isHaskellShelley(implementationId)
                ? setModalState(event, MODAL_STATES.CHOOSE_MNEMONICS_LEN)
                : navigateRestoreWallet(event, networkId, implementationId)
            }}
            title={restoreWalletLabel}
            style={styles.createButton}
            testID="restoreWalletButton"
          />
          {!isJormungandr(networkId) && (
            <>
              <Button
                disabled={!CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLED}
                outline
                onPress={(event) =>
                  setModalState(event, MODAL_STATES.LEDGER_TRANSPORT_SWITCH)
                }
                title={createWalletWithLedgerLabel}
                style={styles.createButton}
              />
              <LedgerTransportSwitchModal
                visible={modalState === MODAL_STATES.LEDGER_TRANSPORT_SWITCH}
                onRequestClose={(event) =>
                  setModalState(event, MODAL_STATES.CLOSED)
                }
                onSelectUSB={(event) =>
                  navigateCheckNanoX(event, networkId, implementationId, true)
                }
                onSelectBLE={(event) =>
                  navigateCheckNanoX(event, networkId, implementationId, false)
                }
                showCloseIcon
              />
            </>
          )}
          {isHaskellShelley(implementationId) && (
            <Modal
              visible={modalState === MODAL_STATES.CHOOSE_MNEMONICS_LEN}
              onRequestClose={(event) =>
                setModalState(event, MODAL_STATES.CLOSED)
              }
              showCloseIcon
            >
              <Button
                onPress={(event) =>
                  navigateRestoreWallet(event, networkId, implementationId)
                }
                title={intl.formatMessage(messages.restoreNormalWalletLabel)}
                style={styles.mnemonicDialogButton}
              />
              <ExapandableItem
                label={intl.formatMessage(globalMessages.learnMore)}
                content={intl.formatMessage(
                  messages.restoreNormalWalletExplanation,
                )}
              />
              <Button
                outlineOnLight
                onPress={(event) =>
                  navigateRestoreWallet(
                    event,
                    networkId,
                    CONFIG.WALLETS.DAEDALUS_HASKELL_SHELLEY
                      .WALLET_IMPLEMENTATION_ID,
                  )
                }
                title={intl.formatMessage(messages.restore24WordWalletLabel)}
                style={styles.mnemonicDialogButton}
              />
              <ExapandableItem
                label={intl.formatMessage(globalMessages.learnMore)}
                content={intl.formatMessage(
                  messages.restore24WordWalletExplanation,
                )}
              />
            </Modal>
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
        modalState: MODAL_STATES.CLOSED,
      },
      {
        setModalState: (state) => (event: Object, modalState: ModalState) => ({
          modalState,
        }),
      },
    ),
    withHandlers({
      navigateRestoreWallet: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
        walletImplementationId: WalletImplementationId,
      ) =>
        navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET, {
          networkId,
          walletImplementationId,
        }),
      navigateCreateWallet: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
        walletImplementationId: WalletImplementationId,
      ) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET, {
          networkId,
          walletImplementationId,
        }),
      navigateCheckNanoX: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
        walletImplementationId: WalletImplementationId,
        useUSB: boolean,
      ) =>
        navigation.navigate(WALLET_INIT_ROUTES.CHECK_NANO_X, {
          networkId,
          walletImplementationId,
          useUSB,
        }),
    }),
  )(WalletInitScreen),
)
