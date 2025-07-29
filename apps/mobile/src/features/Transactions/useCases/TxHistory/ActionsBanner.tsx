import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {GestureResponderEvent, View} from 'react-native'

import {useStrings} from '~/features/Transactions/common/useStrings'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {TxHistoryRouteNavigation} from '~/kernel/navigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useCopy} from '~/ui/Clipboard/ClipboardProvider'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'
import {useReceive} from '../Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '../Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '../Receive/common/useReceiveAddressesStatus'
import {useSwap} from '../Swap/common/SwapProvider'
import {useSwapConfig} from '../Swap/common/useSwapConfig'

export const ActionsBanner = (props: {disabled: boolean}) => {
  const strings = useStrings()
  const swapForm = useSwap()
  const {tokenOutId, isLoading} = useSwapConfig()
  const disabled = props.disabled || isLoading
  const navigateTo = useNavigateTo()
  const {palette: p} = useTheme()

  const {isSingle, addressMode} = useAddressMode()
  const {next: nextReceiveAddress, used: usedAddresses} =
    useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const {copy} = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} =
    useMultipleAddressesInfo()

  const {reset: resetSendState} = useTransfer()

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

    swapForm.action({type: 'ResetForm'})

    if (tokenOutId !== undefined) {
      swapForm.action({type: 'TokenOutIdChanged', value: tokenOutId})
      swapForm.action({type: 'TokenOutInputTouched'})
    }

    track.swapInitiated({
      from_asset: [
        {
          asset_name: portfolioPrimaryTokenInfo.name,
          asset_ticker: portfolioPrimaryTokenInfo.ticker,
          policy_id: '',
        },
      ],
      to_asset: [{asset_name: '', asset_ticker: '', policy_id: ''}],
      order_type: 'market',
      slippage_tolerance: 1,
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
    track.receiveCopyAddressClicked({
      copy_address_location: 'Long Press wallet Address',
    })
    copy({text: nextReceiveAddress, event, feedback: strings.copiedLabel})
  }

  return (
    <View style={[a.py_xl, a.flex_row, a.justify_center, a.gap_lg]}>
      <View style={[a.align_center, a.justify_center]}>
        <Button
          type={ButtonType.Circle}
          icon={Icon.Received}
          onPress={handleOnPressReceive}
          testID="receiveButton"
          disabled={disabled}
          onLongPress={handleOnLongPressReceive}
        />

        <Text
          style={[
            a.pt_sm,
            a.body_3_sm_medium,
            {color: p.text_gray_medium},
            disabled && {color: p.text_gray_low},
          ]}
        >
          {strings.receiveLabel}
        </Text>
      </View>

      {!meta.isReadOnly && (
        <>
          <View style={[a.align_center, a.justify_center]}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Send}
              onPress={handleOnSend}
              testID="sendButton"
              disabled={disabled}
            />

            <Text
              style={[
                a.pt_sm,
                a.body_3_sm_medium,
                {color: p.text_gray_medium},
                disabled && {color: p.text_gray_low},
              ]}
            >
              {strings.sendLabel}
            </Text>
          </View>

          <View style={[a.align_center, a.justify_center]}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Swap}
              onPress={handleOnSwap}
              testID="swapButton"
              disabled={disabled}
            />

            <Text
              style={[
                a.pt_sm,
                a.body_3_sm_medium,
                {color: p.text_gray_medium},
                disabled && {color: p.text_gray_low},
              ]}
            >
              {strings.swapLabel}
            </Text>
          </View>

          <View style={[a.align_center, a.justify_center]}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Exchange}
              onPress={handleOnExchange}
              testID="buyButton"
              disabled={disabled}
            />

            <Text
              style={[
                a.pt_sm,
                a.body_3_sm_medium,
                {color: p.text_gray_medium},
                disabled && {color: p.text_gray_low},
              ]}
            >
              {strings.exchange}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    send: () => navigation.navigate('send-start-tx'),
    receiveSingleAddress: () => navigation.navigate('receive-single'),
    receiveMultipleAddresses: () => navigation.navigate('receive-multiple'),
    swap: () => navigation.navigate('swap-main'),
    swapPreprodNotice: () => navigation.navigate('swap-preprod-notice'),
    exchange: () => navigation.navigate('exchange-create-order'),
  }
}
