import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import ExapandableItem from '../../legacy/components/Common/ExpandableItem'
import LedgerTransportSwitchModal from '../../legacy/components/Ledger/LedgerTransportSwitchModal'
import {Button, Modal, ScreenBackground, StatusBar} from '../../legacy/components/UiKit'
import styles from '../../legacy/components/WalletInit/styles/WalletInitScreen.style'
import WalletDescription from '../../legacy/components/WalletInit/WalletDescription'
import {CONFIG, isByron, isHaskellShelley} from '../../legacy/config/config'
import {isJormungandr} from '../../legacy/config/networks'
import type {NetworkId, WalletImplementationId, YoroiProvider} from '../../legacy/config/types'
import globalMessages from '../../legacy/i18n/global-messages'
import {WALLET_INIT_ROUTES} from '../../legacy/RoutesList'

export const WalletInitScreen = () => {
  const strings = useStrings()
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const route: any = useRoute()
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const [modalState, setModalState] = React.useState<ModalState>(MODAL_STATES.CLOSED)

  const networkId: NetworkId = route.params.networkId
  const provider = route.params.provider
  const implementationId: WalletImplementationId = route.params.walletImplementationId
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
              />

              <ExapandableItem
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
              />

              <ExapandableItem
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

              <ExapandableItem label={strings.learnMore} content={strings.importReadOnlyWalletExplanation} />
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
  const navigation = useNavigation()

  return {
    restoreWallet: (walletImplementationId: WalletImplementationId, provider?: YoroiProvider) =>
      navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET, {
        networkId,
        walletImplementationId,
        provider,
      }),

    createWallet: (walletImplementationId: WalletImplementationId, provider?: YoroiProvider) =>
      navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET, {
        networkId,
        walletImplementationId,
        provider,
      }),

    checkNanoX: (walletImplementationId: WalletImplementationId, useUSB: boolean) =>
      navigation.navigate(WALLET_INIT_ROUTES.CHECK_NANO_X, {
        networkId,
        walletImplementationId,
        useUSB,
      }),

    importReadOnlyWallet: (walletImplementationId: WalletImplementationId) =>
      navigation.navigate(WALLET_INIT_ROUTES.IMPORT_READ_ONLY_WALLET, {
        networkId,
        walletImplementationId,
      }),
  }
}
