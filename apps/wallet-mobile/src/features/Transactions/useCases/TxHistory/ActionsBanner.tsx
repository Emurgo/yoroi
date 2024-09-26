import {useNavigation} from '@react-navigation/native'
import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Chain} from '@yoroi/types'
import React from 'react'
import {GestureResponderEvent, StyleSheet, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/NewButton'
import {useCopy} from '../../../../components/Clipboard/ClipboardProvider'
import {Icon} from '../../../../components/Icon'
import {Text} from '../../../../components/Text'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../kernel/navigation'
import {useReceive} from '../../../Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '../../../Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '../../../Receive/common/useReceiveAddressesStatus'
import {useSwapForm} from '../../../Swap/common/SwapFormProvider'
import {useAddressMode} from '../../../WalletManager/common/hooks/useAddressMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../common/strings'

export const ActionsBanner = ({disabled = false}: {disabled: boolean}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const {isSingle, addressMode} = useAddressMode()
  const {next: nextReceiveAddress, used: usedAddresses} = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const {copy} = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} = useMultipleAddressesInfo()

  const {reset: resetSendState} = useTransfer()
  const {orderData} = useSwap()
  const {resetSwapForm} = useSwapForm()

  const {track} = useMetrics()

  const {
    selected: {network},
  } = useWalletManager()

  const {
    meta,
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()

  const handleOnSend = () => {
    navigateTo.send()
    resetSendState()
  }

  const handleOnSwap = () => {
    if (network === Chain.Network.Preprod) {
      navigateTo.swapPreprodNotice()
      return
    }

    if (network === Chain.Network.Sancho) {
      navigateTo.swapSanchoNotice()
      return
    }

    resetSwapForm()

    track.swapInitiated({
      from_asset: [
        {asset_name: portfolioPrimaryTokenInfo.name, asset_ticker: portfolioPrimaryTokenInfo.ticker, policy_id: ''},
      ],
      to_asset: [{asset_name: '', asset_ticker: '', policy_id: ''}],
      order_type: orderData.type,
      slippage_tolerance: orderData.slippage,
    })

    navigateTo.swap()
  }

  const handleOnExchange = () => {
    track.walletPageExchangeClicked()
    navigateTo.exchange()
  }

  const handleOnPressReceive = () => {
    if (!isSingle) {
      navigateTo.receiveMultipleAddresses()
      return
    }

    if (usedAddresses.length <= 1 && isShowingMultipleAddressInfo) {
      hideMultipleAddressesInfo({
        onSuccess: () => {
          selectedAddressChanged(nextReceiveAddress)
          navigateTo.receiveSingleAddress()
        },
      })
      return
    }
    selectedAddressChanged(nextReceiveAddress)
    navigateTo.receiveSingleAddress()
  }

  const handleOnLongPressReceive = (event: GestureResponderEvent) => {
    track.receiveCopyAddressClicked({copy_address_location: 'Long Press wallet Address'})
    copy({text: nextReceiveAddress, event})
  }

  return (
    <View style={styles.container}>
      <View style={styles.centralized}>
        <Button
          type={ButtonType.Circle}
          icon={Icon.Received}
          onPress={handleOnPressReceive}
          testID="receiveButton"
          disabled={disabled}
          onLongPress={handleOnLongPressReceive}
        />

        <Text style={styles.actionLabel}>{strings.receiveLabel}</Text>
      </View>

      {!meta.isReadOnly && (
        <>
          <View style={styles.centralized}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Send}
              onPress={handleOnSend}
              testID="sendButton"
              disabled={disabled}
            />

            <Text style={styles.actionLabel}>{strings.sendLabel}</Text>
          </View>

          <View style={styles.centralized}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Swap}
              onPress={handleOnSwap}
              testID="swapButton"
              disabled={disabled}
            />

            <Text style={styles.actionLabel}>{strings.swapLabel}</Text>
          </View>

          <View style={styles.centralized}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Exchange}
              onPress={handleOnExchange}
              testID="buyButton"
              disabled={disabled}
            />

            <Text style={styles.actionLabel}>{strings.exchange}</Text>
          </View>
        </>
      )}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.py_xl,
      ...atoms.flex_row,
      ...atoms.justify_center,
      ...atoms.gap_lg,
    },
    centralized: {
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    actionLabel: {
      ...atoms.pt_sm,
      ...atoms.body_3_sm_medium,
      color: color.gray_max,
    },
  })

  return {styles}
}

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    send: () => navigation.navigate('send-start-tx'),
    receiveSingleAddress: () => navigation.navigate('receive-single'),
    receiveMultipleAddresses: () => navigation.navigate('receive-multiple'),
    swap: () => navigation.navigate('swap-start-swap', {screen: 'token-swap'}),
    swapPreprodNotice: () => navigation.navigate('swap-preprod-notice'),
    swapSanchoNotice: () => navigation.navigate('swap-sancho-notice'),
    exchange: () => navigation.navigate('exchange-create-order'),
  }
}
