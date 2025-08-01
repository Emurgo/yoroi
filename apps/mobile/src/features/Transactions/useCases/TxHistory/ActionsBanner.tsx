import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, View} from 'react-native'

// import {useSwap} from '~/features/Swap/common/SwapProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

export const ActionsBanner = (_props: {disabled: boolean}) => {
  const strings = useStrings()
  // const swapForm = useSwap()
  // const {tokenOutId, isLoading} = useSwapConfig()
  // const disabled = props.disabled || isLoading
  // const navigateTo = useNavigateTo()
  const {palette: p} = useTheme()

  // const {isSingle, addressMode} = useAddressMode()
  // const {next: nextReceiveAddress, used: usedAddresses} =
  //   useReceiveAddressesStatus(addressMode)
  // const {selectedAddressChanged} = useReceive()
  // const {copy} = useCopy()
  // const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} =
  //   useMultipleAddressesInfo()

  const {meta} = useSelectedWallet()
  /*
  const {reset: resetSendState} = useTransfer()

  const {track} = useMetrics()

  const {
    selected: {network},
  } = useWalletManager()



  const handleOnSend = () => {
    navigateTo.send()
    resetSendState()
  }
 */
  /* const handleOnSwap = () => {
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
 */
  /* const handleOnExchange = () => {
    track.walletPageExchangeClicked()
    navigateTo.exchange()
  }
 */
  /* const handleOnPressReceive = () => {
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
  } */

  return (
    <View style={[a.py_xl, a.flex_row, a.justify_center, a.gap_lg]}>
      <View style={[a.align_center, a.justify_center]}>
        <Button
          type={ButtonType.Circle}
          icon={Icon.Received}
          onPress={() => Alert.alert('Receive Feature not implemented')}
          testID="receiveButton"
          // disabled={disabled}
          // onLongPress={handleOnLongPressReceive}
        />

        <Text
          style={[
            a.pt_sm,
            a.body_3_sm_medium,
            {color: p.text_gray_medium},
            // disabled && {color: p.text_gray_low},
          ]}
        >
          {strings.transactions.receiveLabel}
        </Text>
      </View>

      {!meta.isReadOnly && (
        <>
          <View style={[a.align_center, a.justify_center]}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Send}
              onPress={() => Alert.alert('Send Feature not implemented')}
              testID="sendButton"
              // disabled={disabled}
            />

            <Text
              style={[
                a.pt_sm,
                a.body_3_sm_medium,
                {color: p.text_gray_medium},
                // disabled && {color: p.text_gray_low},
              ]}
            >
              {strings.transactions.sendLabel}
            </Text>
          </View>

          <View style={[a.align_center, a.justify_center]}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Swap}
              onPress={() => Alert.alert('Swap Feature not implemented')}
              testID="swapButton"
              // disabled={disabled}
            />

            <Text
              style={[
                a.pt_sm,
                a.body_3_sm_medium,
                {color: p.text_gray_medium},
                // disabled && {color: p.text_gray_low},
              ]}
            >
              {strings.transactions.swapLabel}
            </Text>
          </View>

          <View style={[a.align_center, a.justify_center]}>
            <Button
              type={ButtonType.Circle}
              icon={Icon.Exchange}
              onPress={() => Alert.alert('Exchange Feature not implemented')}
              testID="buyButton"
              // disabled={disabled}
            />

            <Text
              style={[
                a.pt_sm,
                a.body_3_sm_medium,
                {color: p.text_gray_medium},
                // disabled && {color: p.text_gray_low},
              ]}
            >
              {strings.transactions.exchange}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

/* const useNavigateTo = () => {
  const navigation = useNavigation<any>()

  return {
    send: () => navigation.navigate('send-start-tx'),
    receiveSingleAddress: () => navigation.navigate('receive-single'),
    receiveMultipleAddresses: () => navigation.navigate('receive-multiple'),
    swap: () => navigation.navigate('swap-main'),
    swapPreprodNotice: () => navigation.navigate('swap-preprod-notice'),
    exchange: () => navigation.navigate('exchange-create-order'),
  }
} */
