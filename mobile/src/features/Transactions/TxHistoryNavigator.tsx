import {
  ExchangeProvider,
  exchangeApiMaker,
  exchangeManagerMaker,
} from '@yoroi/exchange'
import {
  ResolverProvider,
  resolverApiMaker,
  resolverManagerMaker,
  resolverStorageMaker,
} from '@yoroi/resolver'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Resolver} from '@yoroi/types'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {ReceiveProvider} from '~/features/Receive/common/ReceiveProvider'
import {DescribeSelectedAddressScreen} from '~/features/Receive/useCases/DescribeSelectedAddressScreen'
import {ListMultipleAddressesScreen} from '~/features/Receive/useCases/ListMultipleAddressesScreen'
import {RequestSpecificAmountScreen} from '~/features/Receive/useCases/RequestSpecificAmountScreen'
import {FailedTxScreen as SendFailedTxScreen} from '~/features/ReviewTx/useCases/ShowFailedTxScreen/FailedTxScreen'
import {SubmittedTxScreen as SendSubmittedTxScreen} from '~/features/ReviewTx/useCases/ShowSubmittedTxScreen/SubmittedTxScreen'
import {ScanCodeScreen} from '~/features/Scan/useCases/ScanCodeScreen'
import {ShowCameraPermissionDeniedScreen} from '~/features/Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen'
import {SelectTokenFromListScreen} from '~/features/Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '~/features/Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen'
import {ListAmountsToSendScreen} from '~/features/Send/useCases/ListAmountsToSend/ListAmountsToSendScreen'
import {StartMultiTokenTxScreen} from '~/features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {UtxoConsolidation} from '~/features/Transactions/useCases/UtxoConsolidation/UtxoConsolidation/UtxoConsolidation'
import {UtxoList} from '~/features/Transactions/useCases/UtxoList/UtxoList'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {unstoppableApiKey} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {TxHistoryRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'

import {ShowSuccessScreen} from '../Claim/useCases/ShowSuccessScreen'
import {CreateExchangeOrderScreen} from '../Exchange/useCases/CreateExchangeOrderScreen/CreateExchangeOrderScreen'
import {SelectProviderFromListScreen} from '../Exchange/useCases/SelectProviderFromListScreen/SelectProviderFromListScreen'
import {ShowExchangeResultOrderScreen} from '../Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen'
import {ViewNotificationHistoryScreen} from '../Notifications/useCases/ViewNotificationHistory/ViewNotificationHistoryScreen'
import {SwapNavigator} from '../Swap/navigator'
import {useSelectedNetwork} from '../WalletManager/hooks/useSelectedNetwork'
import {HeaderRightHistory} from './common/HeaderRightHistory'
import {TxDetails} from './useCases/TxDetails/TxDetails'
import {TxHistory} from './useCases/TxHistory/TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()

export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {
    networkManager: {isMainnet},
  } = useSelectedNetwork()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(p),
    [p],
  )

  const resolverStorage = React.useMemo(() => {
    return resolverStorageMaker()
  }, [])

  const resolverApi = React.useMemo(() => {
    return resolverApiMaker({
      apiConfig: {
        [Resolver.NameServer.Unstoppable]: {
          apiKey: unstoppableApiKey,
        },
      },
      cslFactory: () => require('@emurgo/cross-csl-core'),
      isMainnet,
    })
  }, [isMainnet])

  const resolverManager = React.useMemo(() => {
    return resolverManagerMaker(resolverStorage, resolverApi)
  }, [resolverStorage, resolverApi])

  const exchangeManager = React.useMemo(() => {
    const api = exchangeApiMaker({
      isProduction: isMainnet,
      partner: 'yoroi',
    })
    return exchangeManagerMaker({api})
  }, [isMainnet])

  const {meta} = useSelectedWallet()

  return (
    <ResolverProvider resolverManager={resolverManager}>
      <ReceiveProvider>
        <ExchangeProvider
          manager={exchangeManager}
          initialState={{
            providerId: 'banxa',
            providerSuggestedByOrderType: {
              buy: 'banxa',
              sell: 'encryptus',
            },
          }}
        >
          <Boundary loading={{size: 'full'}}>
            <Stack.Navigator
              screenOptions={{
                ...navigationOptions,
                headerTitle: ({children}) => (
                  <NetworkTag>{children}</NetworkTag>
                ),
              }}
            >
              <Stack.Screen
                name="history-list"
                options={{
                  title: meta.name,
                  headerRight: () => <HeaderRightHistory />,
                  headerTransparent: true,
                  headerStyle: {
                    ...a.bg_transparent,
                    elevation: 0,
                    shadowOpacity: 0,
                  },
                  headerTitleStyle: {
                    color: p.gray_max,
                  },
                  headerTintColor: p.gray_max,
                }}
                getComponent={() => TxHistory}
              />

              <Stack.Screen
                name="tx-details"
                options={{
                  title: strings.transactions.history.txDetailsTitle,
                }}
                getComponent={() => TxDetails}
              />

              <Stack.Screen
                name="utxo-list"
                options={{
                  title: strings.transactions.utxo.utxoListTitle,
                }}
                getComponent={() => UtxoList}
              />

              <Stack.Screen
                name="utxo-consolidation"
                options={{
                  title: strings.transactions.utxo.utxoConsolidationTitle,
                }}
                getComponent={() => UtxoConsolidation}
              />

              {/* Send Screens */}
              <Stack.Screen
                name="send-start-tx"
                options={{
                  title: strings.send.sendTitle,
                }}
                getComponent={() => StartMultiTokenTxScreen}
              />

              <Stack.Screen
                name="send-list-amounts-to-send"
                options={{
                  title: strings.send.listAmountsToSendTitle,
                }}
                getComponent={() => ListAmountsToSendScreen}
              />

              <Stack.Screen
                name="send-edit-amount"
                options={{
                  title: strings.send.editAmountTitle,
                }}
                getComponent={() => EditAmountScreen}
              />

              <Stack.Screen
                name="send-select-token-from-list"
                options={{
                  title: strings.send.selectTokenTitle,
                }}
                getComponent={() => SelectTokenFromListScreen}
              />

              <Stack.Screen
                name="send-submitted-tx"
                options={{
                  headerShown: false,
                }}
                getComponent={() => SendSubmittedTxScreen}
              />

              <Stack.Screen
                name="send-failed-tx"
                options={{
                  headerShown: false,
                }}
                getComponent={() => SendFailedTxScreen}
              />

              {/* Receive Screens */}
              <Stack.Screen
                name="receive-single"
                options={{
                  title: strings.receive.receiveTitle,
                }}
                getComponent={() => DescribeSelectedAddressScreen}
              />

              <Stack.Screen
                name="receive-multiple"
                options={{
                  title: strings.receive.multipleAddress,
                }}
                getComponent={() => ListMultipleAddressesScreen}
              />

              <Stack.Screen
                name="receive-specific-amount"
                options={{
                  title: strings.receive.specificAmount,
                }}
                getComponent={() => RequestSpecificAmountScreen}
              />

              {/* Scan Screens */}
              <Stack.Screen
                name="scan-start"
                options={{
                  title: strings.scan.scanTitle,
                }}
                getComponent={() => ScanCodeScreen}
              />

              <Stack.Screen
                name="scan-show-camera-permission-denied"
                options={{
                  title: strings.scan.cameraPermissionDeniedTitle,
                }}
                getComponent={() => ShowCameraPermissionDeniedScreen}
              />

              <Stack.Screen
                name="swap"
                options={{
                  headerShown: false,
                }}
                getComponent={() => SwapNavigator}
              />

              {/* Notification Center */}
              <Stack.Screen
                name="notification-center-history"
                options={{
                  title: strings.notifications.notificationCenter,
                }}
                getComponent={() => ViewNotificationHistoryScreen}
              />

              {/* Claim Screens */}
              <Stack.Screen
                name="claim-show-success"
                options={{
                  title: strings.claim.showSuccessTitle,
                }}
                getComponent={() => ShowSuccessScreen}
              />

              {/* Exchange Screens */}
              <Stack.Screen
                name="exchange-create-order"
                options={{
                  title: strings.exchange.buyCrypto,
                }}
                getComponent={() => CreateExchangeOrderScreen}
              />

              <Stack.Screen
                name="exchange-result"
                options={{
                  title: strings.exchange.title,
                }}
                getComponent={() => ShowExchangeResultOrderScreen}
              />

              <Stack.Screen
                name="exchange-select-buy-provider"
                options={{
                  title: strings.exchange.provider,
                }}
                getComponent={() => SelectProviderFromListScreen}
              />

              <Stack.Screen
                name="exchange-select-sell-provider"
                options={{
                  title: strings.exchange.provider,
                }}
                getComponent={() => SelectProviderFromListScreen}
              />
            </Stack.Navigator>
          </Boundary>
        </ExchangeProvider>
      </ReceiveProvider>
    </ResolverProvider>
  )
}
