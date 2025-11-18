import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Chain} from '@yoroi/types'

import * as React from 'react'
import {GestureResponderEvent, View} from 'react-native'

import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'
import {AnalyticsEventEnum} from '~/features/Analytics/types/analytics-event-enum'
import {useCopy} from '~/features/Copy/context/CopyProvider'
import {setPendingSwapToken} from '~/features/Notifications/common/tools'
import {useReceive} from '~/features/Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '~/features/Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '~/features/Receive/common/useReceiveAddressesStatus'
import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

export const ActionsBanner = (props: {disabled: boolean}) => {
  const strings = useStrings()
  const {config, isLoading} = useRemoteConfig()
  const tokenOutId = config?.swap?.initialPair.tokenOut
  const disabled = props.disabled || isLoading
  const navigateTo = useWalletNavigation()
  const {atoms: ta} = useTheme()
  const {reset: resetTransfer} = useTransfer()
  const {trackEvent} = useAnalyticsTracking()
  const {isSingle, addressMode} = useAddressMode()
  const {next: nextReceiveAddress} = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const {copy} = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} =
    useMultipleAddressesInfo()

  const {meta} = useSelectedWallet()
  const {network} = useSelectedNetwork()

  const handleOnSwap = async () => {
    if (network === Chain.Network.Preprod) {
      navigateTo.navigateToSwapPreprodNotice()
      return
    }

    if (tokenOutId) {
      await setPendingSwapToken(tokenOutId)
    }

    navigateTo.navigateToSwap()
  }

  const handleOnExchange = () => {
    trackEvent(AnalyticsEventEnum.WalletPageExchangeClicked)
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
    copy({
      text: nextReceiveAddress,
      event,
      feedback: strings.transactions.copiedLabel,
    })
  }

  const handleOnPressTransfer = () => {
    resetTransfer()
    navigateTo.navigateToSendStartTx()
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
            ta.text_gray_medium,
            disabled && ta.text_gray_low,
          ]}
        >
          {strings.transactions.receiveLabel}
        </Text>
      </View>

      <View style={[a.align_center, a.justify_center]}>
        <Button
          type={ButtonType.Circle}
          icon={Icon.Send}
          onPress={handleOnPressTransfer}
          testID="sendButton"
          disabled={disabled}
        />

        <Text
          style={[
            a.pt_sm,
            a.body_3_sm_medium,
            ta.text_gray_medium,
            disabled && ta.text_gray_low,
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
            ta.text_gray_medium,
            disabled && ta.text_gray_low,
          ]}
        >
          {strings.transactions.swapLabel}
        </Text>
      </View>

      {!meta.isReadOnly && (
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
              ta.text_gray_medium,
              disabled && ta.text_gray_low,
            ]}
          >
            {strings.transactions.exchange}
          </Text>
        </View>
      )}
    </View>
  )
}
