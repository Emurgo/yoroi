import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack'
import {atoms as a, ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {
  defaultStackNavigationOptions,
  TxHistoryRoutes,
} from '~/kernel/navigation/navigation'
import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {HeaderRightHistory} from './common/HeaderRightHistory'
import {TxHistory} from './useCases/TxHistory/TxHistory'

const Stack = createStackNavigator<TxHistoryRoutes>()
export const TxHistoryNavigator = () => {
  const {track} = useMetrics()

  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  // const storage = useAsyncStorage()
  const {atoms, palette: p} = useTheme()
  // const manager = useGovernanceManagerMaker()

  const trackNotificationCenter = React.useCallback(() => {
    return {
      focus: () => {
        track.notificationCenterPageViewed({tab: 'all'})
      },
    }
  }, [track])

  /* // resolver
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
  }, [
    wallet.externalAddresses,
    wallet.networkManager.tokenManager,
    wallet.portfolioPrimaryTokenInfo,
  ])

  // exchange
  const exchangeManager = React.useMemo(() => {
    const api = exchangeApiMaker({
      // TODO: update exchange with isMainnet
      isProduction: wallet.isMainnet,
      partner: 'yoroi',
    })

    const manager = exchangeManagerMaker({api})
    return manager
  }, [wallet.isMainnet]) */

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(a, p),
    [atoms, p],
  )

  return (
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
          ...(!meta.isReadOnly && {
            headerRight: () => <HeaderRightHistory />,
          }),
        }}
      />
    </Stack.Navigator>
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
  orderSwap: {
    id: 'swap.swapScreen.ordersSwapTab',
    defaultMessage: '!!!Orders',
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
  settings: {
    id: 'menu.settings',
    defaultMessage: '!!!Settings',
  },
  notificationsTitle: {
    id: 'components.txhistory.notifications.title',
    defaultMessage: '!!!Notifications',
  },
  utxoList: {
    id: 'components.utxoList',
    defaultMessage: '!!!UTxO List',
  },
  organizeWallet: {
    id: 'components.organizeWallet.title',
    defaultMessage: '!!!Organize Wallet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    claimShowSuccess: intl.formatMessage(messages.claimShowSuccessTitle),
    confirmationTransaction: intl.formatMessage(
      messages.confirmationTransaction,
    ),
    reviewSwapTitle: intl.formatMessage(messages.reviewSwapTitle),
    confirmTitle: intl.formatMessage(messages.confirmTitle),
    describeSelectedAddressTitle: intl.formatMessage(
      messages.describeSelectedAddressTitle,
    ),
    editAmountTitle: intl.formatMessage(messages.editAmountTitle),
    exchangeCreateOrderTitle: intl.formatMessage(
      messages.exchangeCreateOrderTitle,
    ),
    exchangeSelectBuyProvider: intl.formatMessage(
      messages.exchangeSelectBuyProvider,
    ),
    exchangeSelectSellProvider: intl.formatMessage(
      messages.exchangeSelectSellProvider,
    ),
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
    orderSwap: intl.formatMessage(messages.orderSwap),
    swapToTitle: intl.formatMessage(messages.swapToTitle),
    txDetailsTitle: intl.formatMessage(messages.txDetailsTitle),
    settings: intl.formatMessage(messages.settings),
    notificationsTitle: intl.formatMessage(messages.notificationsTitle),
    utxoList: intl.formatMessage(messages.utxoList),
    organizeWallet: intl.formatMessage(messages.organizeWallet),
  }
}

const sendOptions = (
  navigationOptions: StackNavigationOptions,
  color: ThemedPalette,
) => ({
  ...navigationOptions,
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: color.bg_color_max,
  },
})
