import {useNavigation} from '@react-navigation/native'
import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import React, {ReactNode} from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

import {useCopy} from '../../src/legacy/useCopy'
import {Icon, Spacer, Text} from '../components'
import {useReceive} from '../features/Receive/common/ReceiveProvider'
import {useMultipleAddressesInfo} from '../features/Receive/common/useMultipleAddressesInfo'
import {useReceiveAddressesStatus} from '../features/Receive/common/useReceiveAddressesStatus'
import {messages as receiveMessages} from '../features/Receive/common/useStrings'
import {useSwapForm} from '../features/Swap/common/SwapFormProvider'
import {useSelectedWallet} from '../features/WalletManager/Context'
import {actionMessages} from '../i18n/global-messages'
import {useMetrics} from '../metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../navigation'
import {useAddressModeManager} from '../wallet-manager/useAddressModeManager'
import {useTokenInfo} from '../yoroi-wallets/hooks'

export const ActionsBanner = ({disabled = false}: {disabled: boolean}) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const {isSingle, addressMode} = useAddressModeManager()
  const {next: nextReceiveAddress, used: usedAddresses} = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()
  const [isCopying, copy] = useCopy()
  const {hideMultipleAddressesInfo, isShowingMultipleAddressInfo} = useMultipleAddressesInfo()

  const {reset: resetSendState} = useTransfer()
  const {orderData} = useSwap()
  const {resetSwapForm} = useSwapForm()

  const {track} = useMetrics()

  const wallet = useSelectedWallet()
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

          {!wallet.isReadOnly && <Spacer width={18} />}

          {!wallet.isReadOnly && (
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

          {!wallet.isReadOnly && (
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
  const {theme} = useTheme()
  const {color, padding, typography} = theme
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
      backgroundColor: color.primary[500],
    },
    actionLabel: {
      ...padding['t-s'],
      color: color.gray.max,
      ...typography['body-3-s-medium'],
    },
    disabled: {
      opacity: 0.5,
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray.max,
      alignItems: 'center',
      justifyContent: 'center',
      top: -40,
      borderRadius: 4,
      zIndex: 10,
      left: -25,
    },
    textCopy: {
      textAlign: 'center',
      ...padding['s'],
      ...typography['body-2-m-medium'],
      color: color.gray.min,
    },
  })

  const colors = {
    actionColor: theme.color.gray.min,
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    sendLabel: intl.formatMessage(actionMessages.send),
    receiveLabel: intl.formatMessage(actionMessages.receive),
    buyLabel: intl.formatMessage(actionMessages.buy),
    buyTitle: intl.formatMessage(actionMessages.buyTitle),
    buyInfo: (options: BuyInfoFormattingOptions) => intl.formatMessage(actionMessages.buyInfo, options),
    proceed: intl.formatMessage(actionMessages.proceed),
    swapLabel: intl.formatMessage(actionMessages.swap),
    messageBuy: intl.formatMessage(actionMessages.soon),
    exchange: intl.formatMessage(actionMessages.exchange),
    addressCopiedMsg: intl.formatMessage(receiveMessages.addressCopiedMsg),
  }
}

type BuyInfoFormattingOptions = Record<'b' | 'textComponent', (text: ReactNode[]) => ReactNode>

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    send: () => navigation.navigate('send-start-tx'),
    receiveSingleAddress: () => navigation.navigate('receive-single'),
    receiveMultipleAddresses: () => navigation.navigate('receive-multiple'),
    swap: () => navigation.navigate('swap-start-swap'),
    exchange: () => navigation.navigate('exchange-create-order'),
  }
}
