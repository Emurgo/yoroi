import {init} from '@emurgo/cross-csl-mobile'
import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, StackNavigationOptions} from '@react-navigation/stack'
import {useAsyncStorage} from '@yoroi/common'
import {exchangeApiMaker, exchangeManagerMaker, ExchangeProvider} from '@yoroi/exchange'
import {resolverApiMaker, resolverManagerMaker, ResolverProvider, resolverStorageMaker} from '@yoroi/resolver'
import {
  milkTokenId,
  supportedProviders,
  swapApiMaker,
  swapManagerMaker,
  SwapProvider,
  swapStorageMaker,
} from '@yoroi/swap'
import {ThemedPalette, useTheme} from '@yoroi/theme'
import {Resolver, Swap} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewProps} from 'react-native'

import {Boundary, Icon, Spacer} from '../../components'
import {unstoppableApiKey} from '../../kernel/env'
import {
  BackButton,
  defaultStackNavigationOptions,
  TxHistoryRouteNavigation,
  TxHistoryRoutes,
  useWalletNavigation,
} from '../../kernel/navigation'
import {useFrontendFees, useStakingKey} from '../../yoroi-wallets/hooks'
import {claimApiMaker} from '../Claim/module/api'
import {ClaimProvider} from '../Claim/module/ClaimProvider'
import {ShowSuccessScreen} from '../Claim/useCases/ShowSuccessScreen'
import {CreateExchangeOrderScreen} from '../Exchange/useCases/CreateExchangeOrderScreen/CreateExchangeOrderScreen'
import {SelectProviderFromListScreen} from '../Exchange/useCases/SelectProviderFromListScreen/SelectProviderFromListScreen'
import {ShowExchangeResultOrderScreen} from '../Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen'
import {ReceiveProvider} from '../Receive/common/ReceiveProvider'
import {DescribeSelectedAddressScreen} from '../Receive/useCases/DescribeSelectedAddressScreen'
import {ListMultipleAddressesScreen} from '../Receive/useCases/ListMultipleAddressesScreen'
import {RequestSpecificAmountScreen} from '../Receive/useCases/RequestSpecificAmountScreen'
import {CodeScannerButton} from '../Scan/common/CodeScannerButton'
import {ScanCodeScreen} from '../Scan/useCases/ScanCodeScreen'
import {ShowCameraPermissionDeniedScreen} from '../Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen'
import {ConfirmTxScreen} from '../Send/useCases/ConfirmTx/ConfirmTxScreen'
import {FailedTxScreen} from '../Send/useCases/ConfirmTx/FailedTx/FailedTxScreen'
import {SubmittedTxScreen} from '../Send/useCases/ConfirmTx/SubmittedTx/SubmittedTxScreen'
import {ListAmountsToSendScreen} from '../Send/useCases/ListAmountsToSend'
import {SelectTokenFromListScreen} from '../Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '../Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen'
import {StartMultiTokenTxScreen} from '../Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen'
import {NetworkTag} from '../Settings/ChangeNetwork/NetworkTag'
import {SwapFormProvider} from '../Swap/common/SwapFormProvider'
import {SwapTabNavigator} from '../Swap/SwapNavigator'
import {
  ConfirmTxScreen as ConfirmTxSwapScreen,
  EditSlippageScreen,
  SelectPoolFromListScreen,
  ShowFailedTxScreen as FailedTxSwapScreen,
  ShowSubmittedTxScreen as SubmittedTxSwapScreen,
} from '../Swap/useCases'
import {ShowPreprodNoticeScreen} from '../Swap/useCases/ShowPreprodNoticeScreen/ShowPreprodNoticeScreen'
import {ShowSanchoNoticeScreen} from '../Swap/useCases/ShowSanchoNoticeScreen/ShowSanchoNoticeScreen'
import {SelectBuyTokenFromListScreen} from '../Swap/useCases/StartOrderSwapScreen/CreateOrder/EditBuyAmount/SelectBuyTokenFromListScreen/SelectBuyTokenFromListScreen'
import {SelectSellTokenFromListScreen} from '../Swap/useCases/StartOrderSwapScreen/CreateOrder/EditSellAmount/SelectSellTokenFromListScreen/SelectSellTokenFromListScreen'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {TxDetails} from './useCases/TxDetails'
import {TxHistory} from './useCases/TxHistory/TxHistory'

const aggregator: Swap.Aggregator = 'muesliswap'

const Stack = createStackNavigator<TxHistoryRoutes>()
export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const storage = useAsyncStorage()
  const {atoms, color} = useTheme()

  // swap
  const {frontendFees} = useFrontendFees(wallet)
  const stakingKey = useStakingKey(wallet)
  const swapManager = React.useMemo(() => {
    const aggregatorTokenId = wallet.isMainnet ? milkTokenId.mainnet : milkTokenId.preprod
    const swapStorage = swapStorageMaker()
    const swapApi = swapApiMaker({
      isMainnet: wallet.isMainnet,
      stakingKey,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      supportedProviders,
    })
    const frontendFeeTiers = frontendFees?.[aggregator] ?? ([] as const)
    return swapManagerMaker({swapStorage, swapApi, frontendFeeTiers, aggregator, aggregatorTokenId})
  }, [wallet.isMainnet, wallet.portfolioPrimaryTokenInfo, stakingKey, frontendFees])

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
  const claimApi = React.useMemo(() => {
    return claimApiMaker({
      address: wallet.externalAddresses[0],
      primaryTokenId: wallet.primaryTokenInfo.id,
    })
  }, [wallet.externalAddresses, wallet.primaryTokenInfo.id])

  // navigator components
  const headerRightHistory = React.useCallback(() => <HeaderRightHistory />, [])

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
      <SwapProvider key={wallet.id} swapManager={swapManager}>
        <SwapFormProvider>
          <ResolverProvider resolverManager={resolverManager}>
            <ClaimProvider key={wallet.id} claimApi={claimApi}>
              <ExchangeProvider
                key={wallet.id}
                manager={exchangeManager}
                initialState={{
                  providerId: 'banxa',
                  providerSuggestedByOrderType: exchangeManager.provider.suggested.byOrderType(),
                }}
              >
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
                      headerRight: headerRightHistory,
                      // marginRight override to compensate for the headerRight
                      headerTitle: ({children}) => <NetworkTag style={{marginRight: 40}}>{children}</NetworkTag>,
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
                    name="swap-sancho-notice"
                    component={ShowSanchoNoticeScreen}
                    options={{
                      ...sendOptions(navigationOptions, color),
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
                    name="send-confirm-tx"
                    component={ConfirmTxScreen}
                    options={{
                      title: strings.confirmTitle,
                      ...sendOptions(navigationOptions, color),
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
                      ...sendOptions(navigationOptions, color),
                      headerTransparent: true,
                      title: strings.scanTitle,
                      headerTintColor: color.white_static,
                      headerLeft: (props) => <BackButton color={color.gray_cmax} {...props} />,
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
              </ExchangeProvider>
            </ClaimProvider>
          </ResolverProvider>
        </SwapFormProvider>
      </SwapProvider>
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
})

const useStrings = () => {
  const intl = useIntl()

  return {
    claimShowSuccess: intl.formatMessage(messages.claimShowSuccessTitle),
    confirmationTransaction: intl.formatMessage(messages.confirmationTransaction),
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
  }
}

const SettingsIconButton = (props: TouchableOpacityProps) => {
  const {color} = useTheme()
  return (
    <TouchableOpacity {...props}>
      <Icon.Settings size={30} color={color.gray_cmax} />
    </TouchableOpacity>
  )
}

const HeaderRightHistory = React.memo(() => {
  const {meta} = useSelectedWallet()
  const {navigateToSettings} = useWalletNavigation()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {styles, colors} = useStyles()

  return (
    <Row style={styles.row}>
      {!meta.isReadOnly && (
        <>
          <CodeScannerButton
            onPress={() => navigation.navigate('scan-start', {insideFeature: 'scan'})}
            color={colors.gray}
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

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    settingIconButton: {
      width: 40,
    },
    row: {
      paddingStart: 8,
    },
  })

  return {
    styles,
    colors: {gray: color.gray_cmax},
  } as const
}

const sendOptions = (navigationOptions: StackNavigationOptions, color: ThemedPalette) => ({
  ...navigationOptions,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: color.bg_color_high,
  },
})
