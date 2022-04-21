import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Modal, ScreenBackground, StatusBar} from '../../components'
import {LedgerTransportSwitchModal} from '../../HW'
import globalMessages from '../../i18n/global-messages'
import {CONFIG, isByron, isHaskellShelley} from '../../legacy/config'
import {isJormungandr} from '../../legacy/networks'
import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {NetworkId, WalletImplementationId, YoroiProvider} from '../../yoroi-wallets'
import {WalletDescription} from '../WalletDescription'
import {ExpandableItem} from './ExpandableItem'

export const WalletInitScreen = () => {
  const strings = useStrings()
  const route = useRoute<RouteProp<WalletInitRoutes, 'choose-create-restore'>>()
  const [modalState, setModalState] = React.useState<ModalState>(MODAL_STATES.CLOSED)

  const {networkId, provider, walletImplementationId: implementationId} = route.params
  const navigateTo = useNavigateTo({networkId})

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
              onPress={() => navigateTo.createWallet(implementationId, provider)}
              title={strings.createWalletButton({networkId})}
              style={styles.createButton}
              testID="createWalletButton"
            />
          )}
          <Button
            outline
            onPress={() => {
              isHaskellShelley(implementationId)
                ? setModalState(MODAL_STATES.CHOOSE_MNEMONICS_LEN)
                : navigateTo.restoreWallet(implementationId, provider)
            }}
            title={strings.restoreWalletButton({networkId})}
            style={styles.createButton}
            testID="restoreWalletButton"
          />

          {!isJormungandr(networkId) && (
            <>
              <Button
                disabled={!CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLED}
                outline
                onPress={() => setModalState(MODAL_STATES.LEDGER_TRANSPORT_SWITCH)}
                title={strings.createWalletWithLedgerButton({networkId})}
                style={styles.createButton}
              />
              <LedgerTransportSwitchModal
                visible={modalState === MODAL_STATES.LEDGER_TRANSPORT_SWITCH}
                onRequestClose={() => setModalState(MODAL_STATES.CLOSED)}
                onSelectUSB={() => navigateTo.checkNanoX(implementationId, true)}
                onSelectBLE={() => navigateTo.checkNanoX(implementationId, false)}
                showCloseIcon
              />
            </>
          )}

          {isHaskellShelley(implementationId) && (
            <Modal
              visible={modalState === MODAL_STATES.CHOOSE_MNEMONICS_LEN}
              onRequestClose={() => setModalState(MODAL_STATES.CLOSED)}
              showCloseIcon
            >
              <Button
                onPress={() => navigateTo.restoreWallet(implementationId, provider)}
                title={strings.restoreNormalWalletLabel}
                style={styles.mnemonicDialogButton}
                testID="restoreNormalWalletButton"
              />

              <ExpandableItem
                label={strings.learnMore}
                content={strings.restoreNWordWalletExplanation({mnemonicLength: 15})}
              />

              <Button
                outlineOnLight
                onPress={() =>
                  navigateTo.restoreWallet(CONFIG.WALLETS.HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID, provider)
                }
                title={strings.restore24WordWalletLabel}
                style={styles.mnemonicDialogButton}
                testID="restore24WordWalletButton"
              />

              <ExpandableItem
                label={strings.learnMore}
                content={strings.restoreNWordWalletExplanation({mnemonicLength: 24})}
              />

              <Button
                outlineOnLight
                onPress={() => navigateTo.importReadOnlyWallet(implementationId)}
                title={strings.importReadOnlyWalletLabel}
                style={styles.mnemonicDialogButton}
                testID="importReadOnlyWalletButton"
              />

              <ExpandableItem label={strings.learnMore} content={strings.importReadOnlyWalletExplanation} />
            </Modal>
          )}
        </View>
      </ScreenBackground>
    </SafeAreaView>
  )
}

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
    id: 'components.walletinit.walletinitscreen.importReadOnlyWalletExplanation',
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
} as const
type ModalState = typeof MODAL_STATES[keyof typeof MODAL_STATES]

const useStrings = () => {
  const intl = useIntl()

  return {
    createWalletButton: ({networkId}) =>
      isJormungandr(networkId)
        ? intl.formatMessage(messages.createWalletButton) + ' (ITN)'
        : intl.formatMessage(messages.createWalletButton),
    restoreWalletButton: ({networkId}) =>
      isJormungandr(networkId)
        ? intl.formatMessage(messages.restoreWalletButton) + ' (ITN)'
        : intl.formatMessage(messages.restoreWalletButton),
    createWalletWithLedgerButton: ({networkId}) =>
      isJormungandr(networkId)
        ? intl.formatMessage(messages.createWalletWithLedgerButton) + ' (ITN)'
        : intl.formatMessage(messages.createWalletWithLedgerButton),
    restoreNormalWalletLabel: intl.formatMessage(messages.restoreNormalWalletLabel),
    learnMore: intl.formatMessage(globalMessages.learnMore),
    restoreNWordWalletExplanation: (options) => intl.formatMessage(messages.restoreNWordWalletExplanation, options),
    restore24WordWalletLabel: intl.formatMessage(messages.restore24WordWalletLabel),
    importReadOnlyWalletLabel: intl.formatMessage(messages.importReadOnlyWalletLabel),
    importReadOnlyWalletExplanation: intl.formatMessage(messages.importReadOnlyWalletExplanation),
  }
}

const useNavigateTo = ({networkId}: {networkId: NetworkId}) => {
  const navigation = useNavigation<WalletInitRouteNavigation>()

  return {
    restoreWallet: (walletImplementationId: WalletImplementationId, provider: YoroiProvider) =>
      navigation.navigate('restore-wallet-form', {
        networkId,
        walletImplementationId,
        provider,
      }),

    createWallet: (walletImplementationId: WalletImplementationId, provider: YoroiProvider) =>
      navigation.navigate('create-wallet-form', {
        networkId,
        walletImplementationId,
        provider,
      }),

    checkNanoX: (walletImplementationId: WalletImplementationId, useUSB: boolean) =>
      navigation.navigate('check-nano-x', {
        networkId,
        walletImplementationId,
        useUSB,
      }),

    importReadOnlyWallet: (walletImplementationId: WalletImplementationId) =>
      navigation.navigate('import-read-only', {
        networkId,
        walletImplementationId,
      }),
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  createButton: {
    marginBottom: 10,
  },
  mnemonicDialogButton: {
    marginTop: 15,
  },
})
