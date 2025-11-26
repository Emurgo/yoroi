import {atoms as a, useTheme} from '@yoroi/theme'

import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack'
import * as React from 'react'

import {ClaimScreen} from '~/features/Claim/useCases/ClaimScreen'
import {ShowSuccessScreen} from '~/features/Claim/useCases/ShowSuccessScreen'
import {CreateExchangeOrderScreen} from '~/features/Exchange/useCases/CreateExchangeOrderScreen/CreateExchangeOrderScreen'
import {SelectProviderFromListScreen} from '~/features/Exchange/useCases/SelectProviderFromListScreen/SelectProviderFromListScreen'
import {ViewNotificationHistoryScreen} from '~/features/Notifications/useCases/ViewNotificationHistory/ViewNotificationHistoryScreen'
import {P2PConnectionScreen} from '~/features/P2P/useCases/P2PConnectionScreen/P2PConnectionScreen'
import {DescribeSelectedAddressScreen} from '~/features/Receive/useCases/DescribeSelectedAddressScreen'
import {ListMultipleAddressesScreen} from '~/features/Receive/useCases/ListMultipleAddressesScreen'
import {RequestSpecificAmountScreen} from '~/features/Receive/useCases/RequestSpecificAmountScreen'
import {ScanCodeScreen} from '~/features/Scan/useCases/ScanCodeScreen'
import {ShowCameraPermissionDeniedScreen} from '~/features/Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen'
import {SelectTokenFromListScreen} from '~/features/Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen'
import {EditAmountScreen} from '~/features/Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen'
import {ListAmountsToSendScreen} from '~/features/Send/useCases/ListAmountsToSend/ListAmountsToSendScreen'
import {StartMultiTokenTxScreen} from '~/features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen'
import {NetworkTag} from '~/features/Settings/ui/shared/NetworkTag'
import {SwapNavigator} from '~/features/Swap/navigator'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {WithWalletOpened} from '~/features/WalletManager/ui/shared/WithWalletOpened'
import {useStrings} from '~/kernel/i18n/useStrings'
import {
  BackButton,
  defaultStackNavigationOptions,
} from '~/kernel/navigation/common/helpers'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {TxHistoryRoutes} from '~/kernel/navigation/types'

import {AddressDetails} from '../Transactions/useCases/AddressDetails/AddressDetails'
import {BlockDetails} from '../Transactions/useCases/BlockDetails/BlockDetails'
import {MessageSigningResultScreen} from '../Transactions/useCases/MessageSigning/MessageSigningResultScreen'
import {MessageSigningScreen} from '../Transactions/useCases/MessageSigning/MessageSigningScreen'
import {UtxoConsolidation} from '../Transactions/useCases/UtxoConsolidation/UtxoConsolidation/UtxoConsolidation'
import {UtxoList} from '../Transactions/useCases/UtxoList/UtxoList'
import {HeaderRightHistory} from './common/HeaderRightHistory'
import {TxDetails} from './useCases/TxDetails/TxDetails'
import {TxHistory} from './useCases/TxHistory/TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()

export const TxHistoryNavigator = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const {meta} = useSelectedWallet()
  const walletNavigation = useWalletNavigation()

  // Memoize headerTitle component to prevent recreation on every render
  const headerTitle = React.useCallback(
    ({children}: {children: React.ReactNode}) => (
      <NetworkTag>{children}</NetworkTag>
    ),
    [],
  )

  const screenOptions: StackNavigationOptions = React.useMemo(
    () => ({
      ...defaultStackNavigationOptions(p),
      headerTitle,
    }),
    [p, headerTitle],
  )

  // Memoize header components to prevent recreation on every render
  const headerRight = React.useCallback(() => <HeaderRightHistory />, [])
  const headerLeft = React.useCallback(
    () => (
      <BackButton
        onPress={() => walletNavigation.resetToWalletSelection()}
        color={ta.text_gray_max.color}
      />
    ),
    [walletNavigation, ta.text_gray_max.color],
  )

  const stackOptions: StackNavigationOptions = React.useMemo(
    () => ({
      title: meta.name,
      headerRight,
      headerLeft,
      headerTransparent: true,
      headerStyle: {
        ...a.bg_transparent,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        color: ta.text_gray_max.color,
      },
      headerTintColor: ta.text_gray_max.color,
    }),
    [meta.name, headerRight, headerLeft, ta.text_gray_max.color],
  )

  return (
    <WithWalletOpened>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="history-list"
          options={stackOptions}
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
          name="address-details"
          options={{
            title: strings.transactions.addressDetailsTitle,
          }}
          getComponent={() => AddressDetails}
        />

        <Stack.Screen
          name="block-details"
          options={{
            title: strings.transactions.blockDetailsTitle,
          }}
          getComponent={() => BlockDetails}
        />

        <Stack.Screen
          name="p2p-connection"
          options={{
            title: strings.scan.p2pConnectionTitle,
          }}
          getComponent={() => P2PConnectionScreen}
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

        <Stack.Screen
          name="message-signing"
          options={{
            title: strings.transactions.messageSigning.messageSigningTitle,
          }}
          getComponent={() => MessageSigningScreen}
        />

        <Stack.Screen
          name="message-signing-result"
          options={{
            title:
              strings.transactions.messageSigning.messageSigningResultTitle,
          }}
          getComponent={() => MessageSigningResultScreen}
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
          name="claim"
          options={{
            title: strings.claim.askConfirmationTitle,
          }}
          getComponent={() => ClaimScreen}
        />
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
            title: strings.exchange.title,
          }}
          getComponent={() => CreateExchangeOrderScreen}
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
    </WithWalletOpened>
  )
}
