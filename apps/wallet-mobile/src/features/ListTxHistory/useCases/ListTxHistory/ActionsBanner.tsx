import {useNavigation} from '@react-navigation/native'
import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

import {Icon, Spacer, Text} from '../../../../components'
import {useCopy} from '../../../../hooks/useCopy'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../kernel/navigation'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {useReceive} from '../../../Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '../../../Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '../../../Receive/common/useReceiveAddressesStatus'
import {useSwapForm} from '../../../Swap/common/SwapFormProvider'
import {useAddressMode} from '../../../WalletManager/common/hooks/useAddressMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../common/strings'

export const ActionsBanner = ({disabled = false}: {disabled: boolean}) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const {isSingle, addressMode} = useAddressMode()
  const {next: nextReceiveAddress, used: usedAddresses} = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const [isCopying, copy] = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} = useMultipleAddressesInfo()

  const {reset: resetSendState} = useTransfer()
  const {orderData} = useSwap()
  const {resetSwapForm} = useSwapForm()

  const {track} = useMetrics()

  const {meta, wallet} = useSelectedWallet()
  const sellTokenInfo = useTokenInfo({
    wallet,
    tokenId: orderData.amounts.sell.tokenId,
  })
  const buyTokenInfo = useTokenInfo({
    wallet,
    tokenId: orderData.amounts.buy.tokenId,
  })

  const handleOnSend = () => {
    navigateTo.send()
    resetSendState()
  }

  const handleOnSwap = () => {
    resetSwapForm()

    track.swapInitiated({
      from_asset: [
        {asset_name: sellTokenInfo.name, asset_ticker: sellTokenInfo.ticker, policy_id: sellTokenInfo.group},
      ],
      to_asset: [{asset_name: buyTokenInfo.name, asset_ticker: buyTokenInfo.ticker, policy_id: buyTokenInfo.group}],
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

  const handleOnLongPressReceive = () => {
    track.receiveCopyAddressClicked({copy_address_location: 'Long Press wallet Address'})
    copy(nextReceiveAddress)
  }

  const iconProps = {
    size: 24,
    color: colors.actionColor,
  }

  return (
    <View>
      <Spacer height={16} />

      <View style={styles.centralized}>
        <View style={[styles.row, disabled && styles.disabled]}>
          {isCopying && (
            <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
              <Text style={styles.textCopy}>{strings.addressCopiedMsg}</Text>
            </Animated.View>
          )}

          <View style={styles.centralized}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={handleOnPressReceive}
              testID="receiveButton"
              disabled={disabled}
              onLongPress={handleOnLongPressReceive}
            >
              <Icon.Received {...iconProps} />
            </TouchableOpacity>

            <Text style={styles.actionLabel}>{strings.receiveLabel}</Text>
          </View>

          {!meta.isReadOnly && <Spacer width={18} />}

          {!meta.isReadOnly && (
            <View style={styles.centralized}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={handleOnSend}
                testID="sendButton"
                disabled={disabled}
              >
                <Icon.Send {...iconProps} />
              </TouchableOpacity>

              <Text style={styles.actionLabel}>{strings.sendLabel}</Text>
            </View>
          )}

          {!meta.isReadOnly && (
            <>
              <Spacer width={18} />

              <View style={styles.centralized}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={handleOnSwap}
                  testID="swapButton"
                  disabled={disabled}
                >
                  <Icon.Swap {...iconProps} />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>{strings.swapLabel}</Text>
              </View>

              <Spacer width={18} />

              <View style={styles.centralized}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={handleOnExchange}
                  testID="buyButton"
                  disabled={disabled}
                >
                  <Icon.Exchange {...iconProps} />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>{strings.exchange}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <Spacer height={21} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    centralized: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    actionIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 56,
      width: 56,
      borderRadius: 28,
      backgroundColor: color.primary_c500,
    },
    actionLabel: {
      ...atoms.pt_sm,
      ...atoms.body_3_sm_medium,
      color: color.gray_cmax,
    },
    disabled: {
      opacity: 0.5,
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray_cmax,
      alignItems: 'center',
      justifyContent: 'center',
      top: -40,
      borderRadius: 4,
      zIndex: 10,
      left: -25,
    },
    textCopy: {
      textAlign: 'center',
      ...atoms.p_sm,
      ...atoms.body_2_md_medium,
      color: color.gray_cmin,
    },
  })

  const colors = {
    actionColor: color.white_static,
  }
  return {styles, colors}
}

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    send: () => navigation.navigate('send-start-tx'),
    receiveSingleAddress: () => navigation.navigate('receive-single'),
    receiveMultipleAddresses: () => navigation.navigate('receive-multiple'),
    swap: () => navigation.navigate('swap-start-swap', {screen: 'token-swap'}),
    exchange: () => navigation.navigate('exchange-create-order'),
  }
}
