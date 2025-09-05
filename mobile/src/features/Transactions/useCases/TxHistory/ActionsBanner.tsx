import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'

import * as React from 'react'
import {GestureResponderEvent, View} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useReceive} from '~/features/Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '~/features/Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '~/features/Receive/common/useReceiveAddressesStatus'
import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

export const ActionsBanner = (props: {disabled: boolean}) => {
  const strings = useStrings()
  const swapForm = useSwap()
  const {config, isLoading} = useRemoteConfig()
  const tokenOutId = config?.swap?.initialPair.tokenOut
  const disabled = props.disabled || isLoading
  const navigateTo = useWalletNavigation()
  const {palette: p} = useTheme()

  const {isSingle, addressMode} = useAddressMode()
  const {next: nextReceiveAddress} = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const {copy} = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} =
    useMultipleAddressesInfo()

  const {meta, wallet} = useSelectedWallet()
  const {track} = useMetrics()
  const {network} = useSelectedNetwork()

  const handleOnSwap = () => {
    if (network === Chain.Network.Preprod) {
      navigateTo.navigateToSwapPreprodNotice()
      return
    }

    track.swapInitiated({
      from_asset: [
        {
          asset_name: wallet.portfolioPrimaryTokenInfo.name,
          asset_ticker: wallet.portfolioPrimaryTokenInfo.ticker,
          policy_id: '',
        },
      ],
      to_asset: [{asset_name: '', asset_ticker: '', policy_id: ''}],
      order_type: 'market',
      slippage_tolerance: 1,
    })

    // Pass the tokenOutId to the navigation function which will handle setting it properly
    navigateTo.navigateToSwap(tokenOutId)
  }

  const handleOnExchange = () => {
    track.walletPageExchangeClicked()
    navigateTo.navigateToExchange()
  }

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
              {strings.transactions.sendLabel}
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
              {strings.transactions.swapLabel}
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
              {strings.transactions.exchange}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}
