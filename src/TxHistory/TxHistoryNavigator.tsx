import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Boundary, Icon} from '../components'
import {
  defaultStackNavigationOptions,
  defaultStackNavigationOptionsV2,
  TxHistoryRoutes,
  useWalletNavigation,
} from '../navigation'
import {ReceiveScreen} from '../Receive/ReceiveScreen'
import {useSelectedWallet} from '../SelectedWallet'
import {SendProvider} from '../Send/shared/SendContext'
import {ConfirmTxScreen} from '../Send/useCases/ConfirmTx/ConfirmTxScreen'
import {SelectTokenFromListScreen} from '../Send/useCases/ListSelectedTokens/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '../Send/useCases/ListSelectedTokens/EditAmountScreen'
import {ListSelectedTokensScreen} from '../Send/useCases/ListSelectedTokens/ListSelectedTokensScreen'
import {ReadQRCodeScreen} from '../Send/useCases/StartTx/InputReceiver/ReadQRCodeScreen'
import {StartTxScreen} from '../Send/useCases/StartTx/StartTxScreen'
import {COLORS} from '../theme'
import {useWalletName} from '../yoroi-wallets'
import {ModalInfo} from './ModalInfo'
import {TxDetails} from './TxDetails'
import {TxHistory} from './TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()
export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const walletName = useWalletName(wallet)
  const [modalInfoState, setModalInfoState] = React.useState(false)
  const showModalInfo = () => setModalInfoState(true)
  const hideModalInfo = () => setModalInfoState(false)

  return (
    <SendProvider key={wallet.id}>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions,
          detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        }}
      >
        <Stack.Screen
          name="history-list"
          component={TxHistory}
          options={{
            ...defaultStackNavigationOptionsV2,
            title: walletName ?? '',
            headerRight: () => <HeaderRightHistory />,
          }}
        />

        <Stack.Screen name="history-details" options={{title: ''}}>
          {() => (
            <Boundary loading={{size: 'full'}}>
              <TxDetails />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen
          name="receive"
          component={ReceiveScreen}
          options={{
            ...defaultStackNavigationOptionsV2,
            title: strings.receiveTitle,
            headerRight: () => <ModalInfoIconButton onPress={showModalInfo} style={styles.modalInfo} />,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0,
              backgroundColor: '#fff',
            },
          }}
        />

        <Stack.Screen
          name="send-start-tx"
          options={{
            title: strings.sendTitle,
            ...sendOptions,
          }}
        >
          {() => (
            <Boundary>
              <StartTxScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen //
          name="send-select-token-from-list"
          options={{
            title: strings.selectAssetTitle,
            ...sendOptions,
          }}
        >
          {() => (
            <Boundary>
              <SelectTokenFromListScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen //
          name="send-list-selected-tokens"
          options={{
            title: strings.selectedTokensTitle,
            ...sendOptions,
          }}
        >
          {() => (
            <Boundary>
              <ListSelectedTokensScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen //
          name="send-edit-amount"
          options={{
            title: strings.editTokenAmountTitle,
            ...sendOptions,
          }}
        >
          {() => (
            <Boundary>
              <EditAmountScreen />
            </Boundary>
          )}
        </Stack.Screen>

        <Stack.Screen //
          name="send-read-qr-code"
          component={ReadQRCodeScreen}
          options={{
            title: strings.qrScannerTitle,
            ...sendOptions,
          }}
        />

        <Stack.Screen //
          name="send-confirm-tx"
          component={ConfirmTxScreen}
          options={{
            title: strings.confirmTitle,
            ...sendOptions,
          }}
        />
      </Stack.Navigator>

      <ModalInfo hideModalInfo={hideModalInfo} visible={modalInfoState}>
        <Text style={styles.receiveInfoText}>{strings.receiveInfoText}</Text>
      </ModalInfo>
    </SendProvider>
  )
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
  sendTitle: {
    id: 'components.send.sendscreen.title',
    defaultMessage: '!!!Send',
  },
  qrScannerTitle: {
    id: 'components.send.addressreaderqr.title',
    defaultMessage: '!!!Scan QR code address',
  },
  selectAssetTitle: {
    id: 'components.send.selectasset.title',
    defaultMessage: '!!!Select asset',
  },
  selectedTokensTitle: {
    id: 'components.send.selectedtokensscreen.title',
    defaultMessage: '!!!Selected tokens',
  },
  editTokenAmountTitle: {
    id: 'components.send.edittokenamountscreen.title',
    defaultMessage: '!!!Selected tokens',
  },
  confirmTitle: {
    id: 'components.send.confirmscreen.title',
    defaultMessage: '!!!Send',
  },
  receiveInfoText: {
    id: 'components.receive.receivescreen.infoText',
    defaultMessage:
      '!!!Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    receiveTitle: intl.formatMessage(messages.receiveTitle),
    sendTitle: intl.formatMessage(messages.sendTitle),
    qrScannerTitle: intl.formatMessage(messages.qrScannerTitle),
    selectAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    confirmTitle: intl.formatMessage(messages.confirmTitle),
    receiveInfoText: intl.formatMessage(messages.receiveInfoText),
    editTokenAmountTitle: intl.formatMessage(messages.editTokenAmountTitle),
    selectedTokensTitle: intl.formatMessage(messages.selectedTokensTitle),
  }
}

const ModalInfoIconButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Info size={25} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
}

const SettingsIconButton = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity {...props}>
      <Icon.Settings size={30} color={COLORS.ACTION_GRAY} />
    </TouchableOpacity>
  )
}

const HeaderRightHistory = () => {
  const {navigateToSettings} = useWalletNavigation()

  return <SettingsIconButton style={styles.settingIconButton} onPress={() => navigateToSettings()} />
}

const styles = StyleSheet.create({
  receiveInfoText: {
    lineHeight: 24,
    fontSize: 16,
  },
  settingIconButton: {
    width: 40,
  },
  modalInfo: {
    paddingRight: 12,
  },
})

const sendOptions = {
  ...defaultStackNavigationOptionsV2,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#fff',
  },
}
