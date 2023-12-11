import {useNavigation} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {
  milkTokenId,
  supportedProviders,
  swapApiMaker,
  swapManagerMaker,
  SwapProvider,
  swapStorageMaker,
} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View, ViewProps} from 'react-native'

import {Boundary, Icon, Spacer} from '../components'
import {claimApiMaker} from '../features/Claim/module/api'
import {ClaimProvider} from '../features/Claim/module/ClaimProvider'
import {ShowSuccessScreen} from '../features/Claim/useCases/ShowSuccessScreen'
import {CodeScannerButton} from '../features/Scan/common/CodeScannerButton'
import {ScanCodeScreen} from '../features/Scan/useCases/ScanCodeScreen'
import {ShowCameraPermissionDeniedScreen} from '../features/Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen'
import {SendProvider} from '../features/Send/common/SendContext'
import {ConfirmTxScreen} from '../features/Send/useCases/ConfirmTx/ConfirmTxScreen'
import {FailedTxScreen} from '../features/Send/useCases/ConfirmTx/FailedTx/FailedTxScreen'
import {SubmittedTxScreen} from '../features/Send/useCases/ConfirmTx/SubmittedTx/SubmittedTxScreen'
import {ListAmountsToSendScreen} from '../features/Send/useCases/ListAmountsToSend'
import {SelectTokenFromListScreen} from '../features/Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '../features/Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen'
import {StartMultiTokenTxScreen} from '../features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen'
import {SwapFormProvider} from '../features/Swap/common/SwapFormProvider'
import {SwapTabNavigator} from '../features/Swap/SwapNavigator'
import {
  ConfirmTxScreen as ConfirmTxSwapScreen,
  EditSlippageScreen,
  SelectPoolFromListScreen,
  ShowFailedTxScreen as FailedTxSwapScreen,
  ShowSubmittedTxScreen as SubmittedTxSwapScreen,
} from '../features/Swap/useCases'
import {SelectBuyTokenFromListScreen} from '../features/Swap/useCases/StartSwapScreen/CreateOrder/EditBuyAmount/SelectBuyTokenFromListScreen/SelectBuyTokenFromListScreen'
import {SelectSellTokenFromListScreen} from '../features/Swap/useCases/StartSwapScreen/CreateOrder/EditSellAmount/SelectSellTokenFromListScreen/SelectSellTokenFromListScreen'
import {
  BackButton,
  defaultStackNavigationOptions,
  TxHistoryRouteNavigation,
  TxHistoryRoutes,
  useWalletNavigation,
} from '../navigation'
import {ReceiveScreen} from '../Receive/ReceiveScreen'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {useFrontendFees, useStakingKey, useWalletName} from '../yoroi-wallets/hooks'
import {ModalInfo} from './ModalInfo'
import {TxDetails} from './TxDetails'
import {TxHistory} from './TxHistory'

const aggregator: Swap.Aggregator = 'muesliswap'

const Stack = createStackNavigator<TxHistoryRoutes>()
export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const walletName = useWalletName(wallet)

  // modal
  const [isModalInfoVisible, setIsModalInfoVisible] = React.useState(false)
  const showModalInfo = React.useCallback(() => setIsModalInfoVisible(true), [])
  const hideModalInfo = React.useCallback(() => setIsModalInfoVisible(false), [])

  // swap
  const {frontendFees} = useFrontendFees(wallet)
  const aggregatorTokenId = wallet.networkId !== 300 ? milkTokenId.mainnet : milkTokenId.preprod
  const stakingKey = useStakingKey(wallet)
  const swapManager = React.useMemo(() => {
    const swapStorage = swapStorageMaker()
    const swapApi = swapApiMaker({
      isMainnet: wallet.networkId !== 300,
      stakingKey,
      primaryTokenId: wallet.primaryTokenInfo.id,
      supportedProviders,
    })
    const frontendFeeTiers = frontendFees?.[aggregator] ?? ([] as const)
    return swapManagerMaker({swapStorage, swapApi, frontendFeeTiers, aggregator, aggregatorTokenId})
  }, [wallet.networkId, wallet.primaryTokenInfo.id, stakingKey, frontendFees, aggregatorTokenId])

  // claim
  const claimApi = React.useMemo(() => {
    return claimApiMaker({
      address: wallet.externalAddresses[0],
      primaryTokenId: wallet.primaryTokenInfo.id,
    })
  }, [wallet.externalAddresses, wallet.primaryTokenInfo.id])

  // navigator components
  const headerRightHistory = React.useCallback(() => <HeaderRightHistory />, [])

  return (
    <SendProvider key={wallet.id}>
      <SwapProvider key={wallet.id} swapManager={swapManager}>
        <ClaimProvider key={wallet.id} claimApi={claimApi}>
          <SwapFormProvider>
            <Stack.Navigator
              screenListeners={{}}
              screenOptions={{
                ...defaultStackNavigationOptions,
                detachPreviousScreen: true /* https://github.com/react-navigation/react-navigation/issues/9883 */,
                gestureEnabled: true,
              }}
            >
              <Stack.Screen
                name="history-list"
                component={TxHistory}
                options={{
                  title: walletName ?? '',
                  headerRight: headerRightHistory,
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
                name="swap-start-swap"
                component={SwapTabNavigator}
                options={{
                  title: strings.swapTitle,
                }}
              />

              <Stack.Screen
                name="swap-confirm-tx"
                component={ConfirmTxSwapScreen}
                options={{
                  title: strings.confirmationTransaction,
                }}
              />

              <Stack.Screen
                name="swap-select-sell-token"
                component={SelectSellTokenFromListScreen}
                options={{
                  title: strings.swapFromTitle,
                }}
              />

              <Stack.Screen
                name="swap-select-buy-token"
                component={SelectBuyTokenFromListScreen}
                options={{
                  title: strings.swapToTitle,
                }}
              />

              <Stack.Screen
                name="swap-edit-slippage"
                component={EditSlippageScreen}
                options={{
                  title: strings.slippageTolerance,
                }}
              />

              <Stack.Screen
                name="swap-select-pool"
                component={SelectPoolFromListScreen}
                options={{
                  title: strings.selectPool,
                }}
              />

              <Stack.Screen
                name="swap-submitted-tx"
                component={SubmittedTxSwapScreen}
                options={{headerShown: false, gestureEnabled: false}}
              />

              <Stack.Screen
                name="swap-failed-tx"
                component={FailedTxSwapScreen}
                options={{headerShown: false, gestureEnabled: false}}
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

              <Stack.Screen //
                name="scan-start"
                component={ScanCodeScreen}
                options={{
                  ...sendOptions,
                  headerTransparent: true,
                  title: strings.scanTitle,
                  headerTintColor: COLORS.WHITE,
                  headerLeft: (props) => <BackButton color={COLORS.WHITE} {...props} />,
                }}
              />

              <Stack.Screen //
                name="scan-show-camera-permission-denied"
                component={ShowCameraPermissionDeniedScreen}
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />

              <Stack.Screen
                name="claim-show-success"
                component={ShowSuccessScreen}
                options={{title: strings.claimShowSuccess, headerLeft: () => null}}
              />
            </Stack.Navigator>

            <ModalInfo hideModalInfo={hideModalInfo} visible={isModalInfoVisible}>
              <Text style={styles.receiveInfoText}>{strings.receiveInfoText}</Text>
            </ModalInfo>
          </SwapFormProvider>
        </ClaimProvider>
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
    defaultMessage: '!!!Confirm transaction',
  },
  scanTitle: {
    id: 'scan.title',
    defaultMessage: '!!!Please scan a QR code',
  },
  claimShowSuccessTitle: {
    id: 'claim.showSuccess.title',
    defaultMessage: '!!!Success',
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
    scanTitle: intl.formatMessage(messages.scanTitle),
    claimShowSuccess: intl.formatMessage(messages.claimShowSuccessTitle),
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

const HeaderRightHistory = React.memo(() => {
  const wallet = useSelectedWallet()
  const {navigateToSettings} = useWalletNavigation()
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return (
    <Row>
      {!wallet.isReadOnly && (
        <>
          <CodeScannerButton
            onPress={() => navigation.navigate('scan-start', {insideFeature: 'scan'})}
            color={COLORS.ACTION_GRAY}
          />

          <Spacer width={10} />
        </>
      )}

      <SettingsIconButton style={styles.settingIconButton} onPress={navigateToSettings} />
    </Row>
  )
})
const Row = ({children, style, ...rest}: ViewProps) => (
  <View style={[style, {flexDirection: 'row'}]} {...rest}>
    {children}
  </View>
)

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
  ...defaultStackNavigationOptions,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#fff',
  },
}
