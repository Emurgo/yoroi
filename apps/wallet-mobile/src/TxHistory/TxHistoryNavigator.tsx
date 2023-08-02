import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {Boundary, Icon} from '../components'
import {SendProvider} from '../features/Send/common/SendContext'
import {ConfirmTxScreen} from '../features/Send/useCases/ConfirmTx/ConfirmTxScreen'
import {FailedTxScreen} from '../features/Send/useCases/ConfirmTx/FailedTx/FailedTxScreen'
import {SubmittedTxScreen} from '../features/Send/useCases/ConfirmTx/SubmittedTx/SubmittedTxScreen'
import {ListAmountsToSendScreen} from '../features/Send/useCases/ListAmountsToSend'
import {SelectTokenFromListScreen} from '../features/Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '../features/Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen'
import {ReadQRCodeScreen} from '../features/Send/useCases/StartMultiTokenTx/InputReceiver/ReadQRCodeScreen'
import {StartMultiTokenTxScreen} from '../features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen'
import {SwapProvider} from '../features/Swap/common/SwapContext'
import {ConfirmationOrderScreen, StartSwapScreen} from '../features/Swap/useCases'
import {InputSlippageToleranceScreen} from '../features/Swap/useCases/InputSlippageToleranceScreen'
import {SelectPoolScreen} from '../features/Swap/useCases/SelectPoolScreen'
import {SelectTokenFromListScreen as SwapSelectTokenFromListScreen} from '../features/Swap/useCases/TokenSwap/AddTokens/SelectTokenFromListScreen'
import {SelectTokenToListScreen as SwapSelectTokenToListScreen} from '../features/Swap/useCases/TokenSwap/AddTokens/SelectTokenToListScreen'
import {
  BackButton,
  defaultStackNavigationOptions,
  defaultStackNavigationOptionsV2,
  TxHistoryRoutes,
  useWalletNavigation,
} from '../navigation'
import {ReceiveScreen} from '../Receive/ReceiveScreen'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {useWalletName} from '../yoroi-wallets/hooks'
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
      <SwapProvider key={wallet.id}>
        <Stack.Navigator
          screenListeners={{}}
          screenOptions={{
            ...defaultStackNavigationOptions,
            detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
            gestureEnabled: true,
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

              headerRight: () => <ModalInfoIconButton onPress={showModalInfo} />,
              headerStyle: {
                elevation: 0,
                shadowOpacity: 0,
                backgroundColor: '#fff',
              },
            }}
          />

          <Stack.Screen
            name="swap-start-order"
            component={StartSwapScreen}
            options={{
              ...defaultStackNavigationOptionsV2,
              title: strings.swapTitle,
            }}
          />

          <Stack.Screen
            name="swap-confirmation-order"
            component={ConfirmationOrderScreen}
            options={{
              ...defaultStackNavigationOptionsV2,
              title: strings.confirmationTransaction,
            }}
          />

          <Stack.Screen
            name="swap-select-token-from"
            component={SwapSelectTokenFromListScreen}
            options={{
              ...defaultStackNavigationOptionsV2,
              title: strings.swapFromTitle,
            }}
          />

          <Stack.Screen
            name="swap-select-token-to"
            component={SwapSelectTokenToListScreen}
            options={{
              ...defaultStackNavigationOptionsV2,
              title: strings.swapToTitle,
            }}
          />

          <Stack.Screen
            name="swap-set-slippage"
            component={InputSlippageToleranceScreen}
            options={{
              ...defaultStackNavigationOptionsV2,
              title: strings.slippageTolerance,
            }}
          />

          <Stack.Screen
            name="swap-select-pool"
            component={SelectPoolScreen}
            options={{
              ...defaultStackNavigationOptionsV2,
              title: strings.selectPool,
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
                <StartMultiTokenTxScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
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
            name="send-list-amounts-to-send"
            options={{
              title: strings.listAmountsToSendTitle,
              ...sendOptions,
            }}
          >
            {() => (
              <Boundary>
                <ListAmountsToSendScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen //
            name="send-edit-amount"
            options={{
              title: strings.editAmountTitle,
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
              ...sendOptions,
              headerTransparent: true,
              title: strings.qrScannerTitle,
              headerTintColor: '#fff',
              headerLeft: (props) => <BackButton color="#fff" {...props} />,
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

          <Stack.Screen
            name="send-submitted-tx"
            component={SubmittedTxScreen}
            options={{headerShown: false, gestureEnabled: false}}
          />

          <Stack.Screen
            name="send-failed-tx"
            component={FailedTxScreen}
            options={{headerShown: false, gestureEnabled: false}}
          />
        </Stack.Navigator>

        <ModalInfo hideModalInfo={hideModalInfo} visible={modalInfoState}>
          <Text style={styles.receiveInfoText}>{strings.receiveInfoText}</Text>
        </ModalInfo>
      </SwapProvider>
    </SendProvider>
  )
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
  swapTitle: {
    id: 'swap.swapScreen.swapTitle',
    defaultMessage: '!!!Swap',
  },
  swapFromTitle: {
    id: 'swap.swapScreen.swapFrom',
    defaultMessage: '!!!Swap from',
  },
  swapToTitle: {
    id: 'swap.swapScreen.swapTo',
    defaultMessage: '!!!Swap to',
  },
  slippageTolerance: {
    id: 'swap.swapScreen.slippageTolerance',
    defaultMessage: '!!!Slippage Tolerance',
  },
  selectPool: {
    id: 'swap.swapScreen.selectPool',
    defaultMessage: '!!!Select pool',
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
  listAmountsToSendTitle: {
    id: 'components.send.listamountstosendscreen.title',
    defaultMessage: '!!!Selected tokens',
  },
  editAmountTitle: {
    id: 'components.send.editamountscreen.title',
    defaultMessage: '!!!Edit amount',
  },
  confirmTitle: {
    id: 'components.send.confirmscreen.title',
    defaultMessage: '!!!Confirm',
  },
  receiveInfoText: {
    id: 'components.receive.receivescreen.infoText',
    defaultMessage:
      '!!!Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
  },
  confirmationTransaction: {
    id: 'global.confirmationTransaction',
    defaultMessage: '!!!Confirmation transaction',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    receiveTitle: intl.formatMessage(messages.receiveTitle),
    swapTitle: intl.formatMessage(messages.swapTitle),
    swapFromTitle: intl.formatMessage(messages.swapFromTitle),
    swapToTitle: intl.formatMessage(messages.swapToTitle),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    selectPool: intl.formatMessage(messages.selectPool),
    sendTitle: intl.formatMessage(messages.sendTitle),
    qrScannerTitle: intl.formatMessage(messages.qrScannerTitle),
    selectAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    confirmTitle: intl.formatMessage(messages.confirmTitle),
    receiveInfoText: intl.formatMessage(messages.receiveInfoText),
    editAmountTitle: intl.formatMessage(messages.editAmountTitle),
    listAmountsToSendTitle: intl.formatMessage(messages.listAmountsToSendTitle),
    confirmationTransaction: intl.formatMessage(messages.confirmationTransaction),
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
})

const sendOptions = {
  ...defaultStackNavigationOptionsV2,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#fff',
  },
}
