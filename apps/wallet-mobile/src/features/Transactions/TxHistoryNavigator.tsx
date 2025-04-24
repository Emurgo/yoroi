import {init} from '@emurgo/cross-csl-mobile'
import {createStackNavigator, StackNavigationOptions} from '@react-navigation/stack'
import {claimManagerMaker, ClaimProvider} from '@yoroi/claim'
import {useAsyncStorage} from '@yoroi/common'
import {exchangeApiMaker, exchangeManagerMaker, ExchangeProvider} from '@yoroi/exchange'
import {resolverApiMaker, resolverManagerMaker, ResolverProvider, resolverStorageMaker} from '@yoroi/resolver'
import {GovernanceProvider} from '@yoroi/staking'
import {ThemedPalette, useTheme} from '@yoroi/theme'
import {Resolver} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {Boundary} from '../../components/Boundary/Boundary'
import {unstoppableApiKey} from '../../kernel/env'
import {useMetrics} from '../../kernel/metrics/metricsManager'
import {BackButton, defaultStackNavigationOptions, TxHistoryRoutes} from '../../kernel/navigation'
import {ShowSuccessScreen} from '../Claim/useCases/ShowSuccessScreen'
import {CreateExchangeOrderScreen} from '../Exchange/useCases/CreateExchangeOrderScreen/CreateExchangeOrderScreen'
import {SelectProviderFromListScreen} from '../Exchange/useCases/SelectProviderFromListScreen/SelectProviderFromListScreen'
import {ShowExchangeResultOrderScreen} from '../Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen'
import {ViewNotificationHistoryScreen} from '../Notifications/useCases/ViewNotificationHistory/ViewNotificationHistoryScreen'
import {ReceiveProvider} from '../Receive/common/ReceiveProvider'
import {DescribeSelectedAddressScreen} from '../Receive/useCases/DescribeSelectedAddressScreen'
import {ListMultipleAddressesScreen} from '../Receive/useCases/ListMultipleAddressesScreen'
import {RequestSpecificAmountScreen} from '../Receive/useCases/RequestSpecificAmountScreen'
import {ScanCodeScreen} from '../Scan/useCases/ScanCodeScreen'
import {ShowCameraPermissionDeniedScreen} from '../Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen'
import {SelectTokenFromListScreen} from '../Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '../Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen'
import {ListAmountsToSendScreen} from '../Send/useCases/ListAmountsToSend/ListAmountsToSendScreen'
import {FailedTxScreen as SendFailedTxScreen} from '../Send/useCases/ShowFailedTxScreen/FailedTxScreen'
import {SubmittedTxScreen as SendSubmittedTxScreen} from '../Send/useCases/ShowSubmittedTxScreen/SubmittedTxScreen'
import {StartMultiTokenTxScreen} from '../Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen'
import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useGovernanceManagerMaker} from '../Staking/Governance/common/helpers'
import {SwapTabNavigator} from '../Swap/SwapNavigator'
import {EditSlippageScreen, SelectPoolFromListScreen} from '../Swap/useCases'
import {ReviewSwap} from '../Swap/useCases/ReviewSwap/ReviewSwap'
import {FailedTxScreen as SwapFailedTxScreen} from '../Swap/useCases/ShowFailedTxScreen/FailedTxScreen'
import {ShowPreprodNoticeScreen} from '../Swap/useCases/ShowPreprodNoticeScreen/ShowPreprodNoticeScreen'
import {SubmittedTxScreen as SwapSubmittedTxScreen} from '../Swap/useCases/ShowSubmittedTxScreen/SubmittedTxScreen'
import {SelectBuyTokenFromListScreen} from '../Swap/useCases/StartOrderSwapScreen/CreateOrder/EditBuyAmount/SelectBuyTokenFromListScreen/SelectBuyTokenFromListScreen'
import {SelectSellTokenFromListScreen} from '../Swap/useCases/StartOrderSwapScreen/CreateOrder/EditSellAmount/SelectSellTokenFromListScreen/SelectSellTokenFromListScreen'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {HeaderRightHistory} from './common/HeaderRightHistory'
import {TxDetails} from './useCases/TxDetails/TxDetails'
import {TxHistory} from './useCases/TxHistory/TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()
export const TxHistoryNavigator = () => {
  const {track} = useMetrics()

  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const storage = useAsyncStorage()
  const {atoms, color} = useTheme()
  const manager = useGovernanceManagerMaker()

  const trackNotificationCenter = React.useCallback(() => {
    return {
      focus: () => {
        track.notificationCenterPageViewed({tab: 'all'})
      },
    }
  }, [track])

  // resolver
  const resolverManager = React.useMemo(() => {
    const resolverApi = resolverApiMaker({
      apiConfig: {
        [Resolver.NameServer.Unstoppable]: {
          apiKey: unstoppableApiKey,
        },
      },
      cslFactory: init,
      isMainnet: wallet.isMainnet,
    })
    const walletStorage = storage.join(`wallet/${wallet.id}/`)
    const resolverStorage = resolverStorageMaker({storage: walletStorage})
    return resolverManagerMaker(resolverStorage, resolverApi)
  }, [storage, wallet.id, wallet.isMainnet])

  // claim
  const claimManager = React.useMemo(() => {
    return claimManagerMaker({
      address: wallet.externalAddresses[0],
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      tokenManager: wallet.networkManager.tokenManager,
    })
  }, [wallet.externalAddresses, wallet.networkManager.tokenManager, wallet.portfolioPrimaryTokenInfo])

  // exchange
  const exchangeManager = React.useMemo(() => {
    const api = exchangeApiMaker({
      // TODO: update exchange with isMainnet
      isProduction: wallet.isMainnet,
      partner: 'yoroi',
    })

    const manager = exchangeManagerMaker({api})
    return manager
  }, [wallet.isMainnet])

  const navigationOptions = React.useMemo(() => defaultStackNavigationOptions(atoms, color), [atoms, color])

  return (
    <ReceiveProvider key={wallet.id}>
      <ResolverProvider resolverManager={resolverManager}>
        <ClaimProvider key={wallet.id} manager={claimManager}>
          <ExchangeProvider
            key={wallet.id}
            manager={exchangeManager}
            initialState={{
              providerId: 'banxa',
              providerSuggestedByOrderType: exchangeManager.provider.suggested.byOrderType(),
            }}
          >
            <GovernanceProvider manager={manager}>
              <Stack.Navigator
                screenListeners={{}}
                screenOptions={{
                  ...navigationOptions,
                  gestureEnabled: true,
                  headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
                }}
              >
                <Stack.Screen
                  name="history-list"
                  component={TxHistory}
                  options={{
                    title: meta.name,
                    headerTransparent: true,
                    ...(!meta.isReadOnly && {headerRight: () => <HeaderRightHistory />}),
                  }}
                />

                <Stack.Screen
                  name="tx-details"
                  options={{
                    title: strings.txDetailsTitle,
                  }}
                >
                  {() => (
                    <Boundary loading={{size: 'full'}}>
                      <TxDetails />
                    </Boundary>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="receive-single"
                  component={DescribeSelectedAddressScreen}
                  options={{
                    title: strings.describeSelectedAddressTitle,
                    gestureEnabled: false,
                  }}
                />

                <Stack.Screen
                  name="receive-multiple"
                  component={ListMultipleAddressesScreen}
                  options={{
                    title: strings.receiveTitle,
                  }}
                />

                <Stack.Screen
                  name="receive-specific-amount"
                  component={RequestSpecificAmountScreen}
                  options={{
                    title: strings.specificAmount,
                  }}
                />

                <Stack.Screen
                  name="exchange-create-order"
                  options={{
                    title: strings.exchangeCreateOrderTitle,
                  }}
                >
                  {() => (
                    <Boundary>
                      <CreateExchangeOrderScreen />
                    </Boundary>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="exchange-select-buy-provider"
                  options={{
                    title: strings.exchangeSelectBuyProvider,
                  }}
                >
                  {() => (
                    <Boundary>
                      <SelectProviderFromListScreen />
                    </Boundary>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="exchange-select-sell-provider"
                  options={{
                    title: strings.exchangeSelectSellProvider,
                  }}
                >
                  {() => (
                    <Boundary>
                      <SelectProviderFromListScreen />
                    </Boundary>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  options={{
                    headerShown: false,
                  }}
                  name="exchange-result"
                  component={ShowExchangeResultOrderScreen}
                />

                <Stack.Screen
                  name="swap-start-swap"
                  component={SwapTabNavigator}
                  options={{
                    ...sendOptions(navigationOptions, color),
                    title: strings.swapTitle,
                  }}
                />

                <Stack.Screen
                  name="swap-preprod-notice"
                  component={ShowPreprodNoticeScreen}
                  options={{
                    ...sendOptions(navigationOptions, color),
                    title: strings.swapTitle,
                  }}
                />

                <Stack.Screen
                  name="swap-review"
                  component={ReviewSwap}
                  options={{
                    title: strings.reviewSwapTitle,
                  }}
                />

                <Stack.Screen
                  name="swap-select-sell-token"
                  component={SelectSellTokenFromListScreen}
                  options={{
                    ...sendOptions(navigationOptions, color),
                    title: strings.swapFromTitle,
                  }}
                />

                <Stack.Screen
                  name="swap-select-buy-token"
                  component={SelectBuyTokenFromListScreen}
                  options={{
                    ...sendOptions(navigationOptions, color),
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
                  component={SwapSubmittedTxScreen}
                  options={{
                    headerShown: false,
                  }}
                />

                <Stack.Screen
                  name="swap-failed-tx"
                  component={SwapFailedTxScreen}
                  options={{
                    headerShown: false,
                  }}
                />

                <Stack.Screen
                  name="send-start-tx"
                  options={{
                    title: strings.sendTitle,
                    ...sendOptions(navigationOptions, color),
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
                    ...sendOptions(navigationOptions, color),
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
                    ...sendOptions(navigationOptions, color),
                    title: strings.listAmountsToSendTitle,
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
                    ...sendOptions(navigationOptions, color),
                  }}
                >
                  {() => (
                    <Boundary>
                      <EditAmountScreen />
                    </Boundary>
                  )}
                </Stack.Screen>

                <Stack.Screen //
                  name="send-submitted-tx"
                  options={{
                    headerShown: false,
                    ...sendOptions(navigationOptions, color),
                  }}
                  component={SendSubmittedTxScreen}
                />

                <Stack.Screen //
                  name="send-failed-tx"
                  options={{
                    headerShown: false,
                    ...sendOptions(navigationOptions, color),
                  }}
                  component={SendFailedTxScreen}
                />

                <Stack.Screen //
                  name="scan-start"
                  component={ScanCodeScreen}
                  options={{
                    ...sendOptions(navigationOptions, color),
                    headerTransparent: true,
                    title: strings.scanTitle,
                    headerTintColor: color.white_static,
                    headerLeft: (props) => <BackButton color={color.white_static} {...props} />,
                    headerTitle: ({children}) => (
                      <NetworkTag textStyle={{color: color.white_static}}>{children}</NetworkTag>
                    ),
                  }}
                />

                <Stack.Screen //
                  name="notification-center-history"
                  component={ViewNotificationHistoryScreen}
                  options={{title: strings.notificationsTitle}}
                  listeners={trackNotificationCenter}
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
            </GovernanceProvider>
          </ExchangeProvider>
        </ClaimProvider>
      </ResolverProvider>
    </ReceiveProvider>
  )
}

const messages = defineMessages({
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
  describeSelectedAddressTitle: {
    id: 'components.receive.describeselectedaddressscreen.title',
    defaultMessage: '!!!Address details',
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
  reviewSwapTitle: {
    id: 'swap.review.title',
    defaultMessage: '!!!Swap review',
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
    defaultMessage: '!!!Assets added',
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
  specificAmount: {
    id: 'components.receive.receivescreen.specificAmount',
    defaultMessage: '!!!Request specific amount',
  },
  exchangeCreateOrderTitle: {
    id: 'rampOnOff.rampOnOffScreen.rampOnOffTitle',
    defaultMessage: '!!!Buy/Sell ADA',
  },
  exchangeSelectBuyProvider: {
    id: 'rampOnOff.rampOnOffScreen.exchangeSelectProvider.buy',
    defaultMessage: '!!!Buy provider',
  },
  exchangeSelectSellProvider: {
    id: 'rampOnOff.rampOnOffScreen.exchangeSelectProvider.sell',
    defaultMessage: '!!!Sell provider',
  },
  txDetailsTitle: {
    id: 'components.txhistory.txdetails.txDetails',
    defaultMessage: '!!!Tx Details',
  },
  notificationsTitle: {
    id: 'components.txhistory.notifications.title',
    defaultMessage: '!!!Notifications',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    claimShowSuccess: intl.formatMessage(messages.claimShowSuccessTitle),
    confirmationTransaction: intl.formatMessage(messages.confirmationTransaction),
    reviewSwapTitle: intl.formatMessage(messages.reviewSwapTitle),
    confirmTitle: intl.formatMessage(messages.confirmTitle),
    describeSelectedAddressTitle: intl.formatMessage(messages.describeSelectedAddressTitle),
    editAmountTitle: intl.formatMessage(messages.editAmountTitle),
    exchangeCreateOrderTitle: intl.formatMessage(messages.exchangeCreateOrderTitle),
    exchangeSelectBuyProvider: intl.formatMessage(messages.exchangeSelectBuyProvider),
    exchangeSelectSellProvider: intl.formatMessage(messages.exchangeSelectSellProvider),
    listAmountsToSendTitle: intl.formatMessage(messages.listAmountsToSendTitle),
    qrScannerTitle: intl.formatMessage(messages.qrScannerTitle),
    receiveInfoText: intl.formatMessage(messages.receiveInfoText),
    receiveTitle: intl.formatMessage(messages.receiveTitle),
    scanTitle: intl.formatMessage(messages.scanTitle),
    selectAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    selectPool: intl.formatMessage(messages.selectPool),
    sendTitle: intl.formatMessage(messages.sendTitle),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    specificAmount: intl.formatMessage(messages.specificAmount),
    swapFromTitle: intl.formatMessage(messages.swapFromTitle),
    swapTitle: intl.formatMessage(messages.swapTitle),
    swapToTitle: intl.formatMessage(messages.swapToTitle),
    txDetailsTitle: intl.formatMessage(messages.txDetailsTitle),
    notificationsTitle: intl.formatMessage(messages.notificationsTitle),
  }
}

const sendOptions = (navigationOptions: StackNavigationOptions, color: ThemedPalette) => ({
  ...navigationOptions,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: color.bg_color_max,
  },
})
