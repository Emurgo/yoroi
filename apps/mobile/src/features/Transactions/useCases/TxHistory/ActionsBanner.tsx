import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, GestureResponderEvent, View} from 'react-native'

// import {useSwap} from '~/features/Swap/common/SwapProvider'
import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useReceive} from '~/features/Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '~/features/Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '~/features/Receive/common/useReceiveAddressesStatus'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

export const ActionsBanner = (_props: {disabled: boolean}) => {
  const strings = useStrings()
  // TODO: REVISIT when wallet hooks are fixed
  // const swapForm = useSwap()
  // const {tokenOutId, isLoading} = useSwapConfig()
  // const disabled = props.disabled || isLoading
  const navigateTo = useWalletNavigation()
  const {palette: p} = useTheme()

  const {isSingle, addressMode} = useAddressMode()
  const {next: nextReceiveAddress, used: usedAddresses} =
    useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const {copy} = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} =
    useMultipleAddressesInfo()

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
  const {track} = useMetrics()

  const handleOnPressReceive = () => {
    if (!isSingle) {
      navigateTo.navigateToReceiveMultiple()
      return
    }

    if (isShowingMultipleAddressInfo) {
      hideMultipleAddressesInfo()
      return
    }

    selectedAddressChanged(nextReceiveAddress)
    navigateTo.navigateToReceiveSingle()
  }

  const handleOnLongPressReceive = (event: GestureResponderEvent) => {
    track.receiveCopyAddressClicked({
      copy_address_location: 'Long Press wallet Address',
    })
    copy({
      text: nextReceiveAddress,
      event,
      feedback: strings.transactions.copiedLabel,
    })
  }

  return (
    <View style={[a.py_xl, a.flex_row, a.justify_center, a.gap_lg]}>
      <View style={[a.align_center, a.justify_center]}>
        <Button
          type={ButtonType.Circle}
          icon={Icon.Received}
          onPress={handleOnPressReceive}
          testID="receiveButton"
          // disabled={disabled}
          onLongPress={handleOnLongPressReceive}
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
              onPress={() => navigateTo.navigateToSendStartTx()}
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
