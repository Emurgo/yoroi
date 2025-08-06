import {createStackNavigator} from '@react-navigation/stack'
import {
  resolverApiMaker,
  resolverManagerMaker,
  ResolverProvider,
  resolverStorageMaker,
} from '@yoroi/resolver'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Resolver} from '@yoroi/types'
import * as React from 'react'

import {ReceiveProvider} from '~/features/Receive/common/ReceiveProvider'
import {DescribeSelectedAddressScreen} from '~/features/Receive/useCases/DescribeSelectedAddressScreen'
import {ListMultipleAddressesScreen} from '~/features/Receive/useCases/ListMultipleAddressesScreen'
import {RequestSpecificAmountScreen} from '~/features/Receive/useCases/RequestSpecificAmountScreen'
import {ScanCodeScreen} from '~/features/Scan/useCases/ScanCodeScreen'
import {ShowCameraPermissionDeniedScreen} from '~/features/Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen'
import {SelectTokenFromListScreen} from '~/features/Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '~/features/Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen'
import {ListAmountsToSendScreen} from '~/features/Send/useCases/ListAmountsToSend/ListAmountsToSendScreen'
import {FailedTxScreen as SendFailedTxScreen} from '~/features/Send/useCases/ShowFailedTxScreen/FailedTxScreen'
import {SubmittedTxScreen as SendSubmittedTxScreen} from '~/features/Send/useCases/ShowSubmittedTxScreen/SubmittedTxScreen'
import {StartMultiTokenTxScreen} from '~/features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {UtxoConsolidation} from '~/features/Transactions/useCases/UtxoConsolidation/UtxoConsolidation/UtxoConsolidation'
import {UtxoList} from '~/features/Transactions/useCases/UtxoList/UtxoList'
import {unstoppableApiKey} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {TxHistoryRoutes} from '~/kernel/navigation/types'
import {Boundary} from '~/ui/Boundary/Boundary'
import {HeaderRightHistory} from './common/HeaderRightHistory'
import {TxDetails} from './useCases/TxDetails/TxDetails'
import {TxHistory} from './useCases/TxHistory/TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()

export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(a, p),
    [p],
  )

  // Setup resolver manager
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
      isMainnet: true, // Default to mainnet
    })
  }, [])

  const resolverManager = React.useMemo(() => {
    return resolverManagerMaker(resolverStorage, resolverApi)
  }, [resolverStorage, resolverApi])

  return (
    <ResolverProvider resolverManager={resolverManager}>
      <ReceiveProvider>
        <Stack.Navigator
          screenOptions={{
            ...navigationOptions,
            headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
          }}
        >
          <Stack.Screen
            name="history-list"
            options={{
              title: strings.transactions.history.historyTitle,
              headerRight: () => <HeaderRightHistory />,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <TxHistory />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="tx-details"
            options={{
              title: strings.transactions.history.txDetailsTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <TxDetails />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="utxo-list"
            options={{
              title: strings.transactions.utxo.utxoListTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <UtxoList />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="utxo-consolidation"
            options={{
              title: strings.transactions.utxo.utxoConsolidationTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <UtxoConsolidation />
              </Boundary>
            )}
          </Stack.Screen>

          {/* Send Screens */}
          <Stack.Screen
            name="send-start-tx"
            options={{
              title: strings.send.sendTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <StartMultiTokenTxScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="send-list-amounts-to-send"
            options={{
              title: strings.send.listAmountsToSendTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <ListAmountsToSendScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="send-edit-amount"
            options={{
              title: strings.send.editAmountTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <EditAmountScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="send-select-token-from-list"
            options={{
              title: strings.send.selectTokenTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <SelectTokenFromListScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="send-submitted-tx"
            options={{
              title: strings.send.sendTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <SendSubmittedTxScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="send-failed-tx"
            options={{
              title: strings.send.sendTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <SendFailedTxScreen />
              </Boundary>
            )}
          </Stack.Screen>

          {/* Receive Screens */}
          <Stack.Screen
            name="receive-single"
            options={{
              title: strings.receive.receiveTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <DescribeSelectedAddressScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="receive-multiple"
            options={{
              title: strings.receive.multipleAddress,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <ListMultipleAddressesScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="receive-specific-amount"
            options={{
              title: strings.receive.specificAmount,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <RequestSpecificAmountScreen />
              </Boundary>
            )}
          </Stack.Screen>

          {/* Scan Screens */}
          <Stack.Screen
            name="scan-start"
            options={{
              title: strings.scan.scanTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <ScanCodeScreen />
              </Boundary>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="scan-show-camera-permission-denied"
            options={{
              title: strings.scan.cameraPermissionDeniedTitle,
            }}
          >
            {() => (
              <Boundary loading={{size: 'full'}}>
                <ShowCameraPermissionDeniedScreen />
              </Boundary>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </ReceiveProvider>
    </ResolverProvider>
  )
}
