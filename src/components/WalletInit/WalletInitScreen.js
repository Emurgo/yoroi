// @flow

import React from 'react'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import WalletDescription from './WalletDescription'
import LedgerTransportSwitchModal from '../Ledger/LedgerTransportSwitchModal'
import {Modal, Button, StatusBar, ScreenBackground} from '../UiKit'
import ExapandableItem from '../Common/ExpandableItem'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {isJormungandr} from '../../config/networks'
import {CONFIG, isHaskellShelley, isByron} from '../../config/config'
import globalMessages from '../../i18n/global-messages'

import styles from './styles/WalletInitScreen.style'

import type {NetworkId, WalletImplementationId} from '../../config/types'

const messages = defineMessages({
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
  restore24WordWalletLabel: {
    id: 'components.walletinit.walletinitscreen.restore24WordWalletLabel',
    defaultMessage: '!!!24-word Wallet',
  },
  restoreNWordWalletExplanation: {
    id: 'components.walletinit.walletinitscreen.restoreNWordWalletExplanation',
    defaultMessage:
      '!!!If you have a recovery phrase consisting of {mnemonicLength} ' +
      'words, choose this option to restore your wallet.',
  },
  importReadOnlyWalletLabel: {
    id: 'components.walletinit.walletinitscreen.importReadOnlyWalletLabel',
    defaultMessage: '!!!Read-only wallet',
  },
  importReadOnlyWalletExplanation: {
    id:
      'components.walletinit.walletinitscreen.importReadOnlyWalletExplanation',
    defaultMessage:
      "!!!The Yoroi extension allows you to export any of your wallets' " +
      'public keys in a QR code. Choose this option to import a wallet from ' +
      ' a QR code in read-only mode.',
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
  intl: IntlShape,
  route: Object, // TODO(navigation): type
  navigation: Object, // TODO(navigation): type
}

const WalletInitScreen = ({intl, route, navigation}: Props) => {
  const [modalState, _setModalState] = React.useState(MODAL_STATES.CLOSED)
  const setModalState = (event: Object, modalState: ModalState) =>
    _setModalState(modalState)

  const navigateRestoreWallet = (
    event: Object,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
  ) =>
    navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET, {
      networkId,
      walletImplementationId,
    })
  const navigateCreateWallet = (
    event: Object,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
  ) =>
    navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET, {
      networkId,
      walletImplementationId,
    })
  const navigateCheckNanoX = (
    event: Object,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
    useUSB: boolean,
  ) =>
    navigation.navigate(WALLET_INIT_ROUTES.CHECK_NANO_X, {
      networkId,
      walletImplementationId,
      useUSB,
    })
  const navigateImportReadOnlyWallet = (
    _event: Object,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
  ) =>
    navigation.navigate(WALLET_INIT_ROUTES.IMPORT_READ_ONLY_WALLET, {
      networkId,
      walletImplementationId,
    })

  const networkId: NetworkId = route.params.networkId
  const implementationId: WalletImplementationId =
    route.params.walletImplementationId
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
          {!isByron(implementationId) && (
            <Button
              onPress={(event) =>
                navigateCreateWallet(event, networkId, implementationId)
              }
              title={createWalletLabel}
              style={styles.createButton}
              testID="createWalletButton"
            />
          )}
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
                  messages.restoreNWordWalletExplanation,
                  {mnemonicLength: 15},
                )}
              />
              <Button
                outlineOnLight
                onPress={(event) =>
                  navigateRestoreWallet(
                    event,
                    networkId,
                    CONFIG.WALLETS.HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID,
                  )
                }
                title={intl.formatMessage(messages.restore24WordWalletLabel)}
                style={styles.mnemonicDialogButton}
              />
              <ExapandableItem
                label={intl.formatMessage(globalMessages.learnMore)}
                content={intl.formatMessage(
                  messages.restoreNWordWalletExplanation,
                  {mnemonicLength: 24},
                )}
              />
              <Button
                outlineOnLight
                onPress={(event) =>
                  navigateImportReadOnlyWallet(
                    event,
                    networkId,
                    implementationId,
                  )
                }
                title={intl.formatMessage(messages.importReadOnlyWalletLabel)}
                style={styles.mnemonicDialogButton}
                testID="importReadOnlyWalletButton"
              />
              <ExapandableItem
                label={intl.formatMessage(globalMessages.learnMore)}
                content={intl.formatMessage(
                  messages.importReadOnlyWalletExplanation,
                )}
              />
            </Modal>
          )}
        </View>
      </ScreenBackground>
    </SafeAreaView>
  )
}
export default injectIntl(WalletInitScreen)
