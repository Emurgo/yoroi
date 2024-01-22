import { useNavigation } from '@react-navigation/native'
import { useSwap } from '@yoroi/swap'
import React, { ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown, Layout } from 'react-native-reanimated'

import { useCopy } from '../../src/legacy/useCopy'
import { Icon, Spacer, Text } from '../components'
import { useSend } from '../features/Send/common/SendContext'
import { useSwapForm } from '../features/Swap/common/SwapFormProvider'
import { actionMessages } from '../i18n/global-messages'
import { useMetrics } from '../metrics/metricsManager'
import { TxHistoryRouteNavigation } from '../navigation'
import { useSelectedWallet } from '../SelectedWallet'
import { COLORS } from '../theme'
import { useTokenInfo } from '../yoroi-wallets/hooks'

const ACTION_PROPS = {
  size: 24,
  color: COLORS.WHITE,
}

export const ActionsBanner = ({ disabled = false }: { disabled: boolean }) => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const wallet = useSelectedWallet()
  const { reset: resetSendState } = useSend()
  const { orderData } = useSwap()
  const { resetSwapForm } = useSwapForm()
  const { track } = useMetrics()
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
        { asset_name: sellTokenInfo.name, asset_ticker: sellTokenInfo.ticker, policy_id: sellTokenInfo.group },
      ],
      to_asset: [{ asset_name: buyTokenInfo.name, asset_ticker: buyTokenInfo.ticker, policy_id: buyTokenInfo.group }],
      order_type: orderData.type,
      slippage_tolerance: orderData.slippage,
    })

    navigateTo.swap()
  }

  const handleExchange = () => {
    track.walletPageExchangeClicked()
    navigateTo.exchange()
  }

  const [isCopying, copy] = useCopy()

  return (
    <View style={styles.banner}>
      <Spacer height={16} />

      <View style={styles.centralized}>
        <View style={[styles.row, disabled && styles.disabled]}>
          {isCopying && (
            <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
              <Text style={styles.textCopy}>Copied</Text>
            </Animated.View>
          )}

          {!wallet.isReadOnly && (
            <View style={styles.centralized}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={navigateTo.receive}
                testID="receiveButton"
                disabled={disabled}
                onLongPress={() => copy('[PUT ADDRESS VALUE HERE]')}
              >
                <Icon.Received {...ACTION_PROPS} />
              </TouchableOpacity>

              <Text style={styles.actionLabel}>{strings.receiveLabel}</Text>
            </View>
          )}

          {!wallet.isReadOnly && <Spacer width={18} />}

          <View style={styles.centralized}>
            <TouchableOpacity style={styles.actionIcon} onPress={handleOnSend} testID="sendButton" disabled={disabled}>
              <Icon.Send {...ACTION_PROPS} />
            </TouchableOpacity>

            <Text style={styles.actionLabel}>{strings.sendLabel}</Text>
          </View>

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
                  <Icon.Swap {...ACTION_PROPS} />
                </TouchableOpacity>

                <Text style={styles.actionLabel}>{strings.swapLabel}</Text>
              </View>

              <Spacer width={18} />

              <View style={styles.centralized}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={handleExchange}
                  testID="buyButton"
                  disabled={disabled}
                >
                  <Icon.Exchange {...ACTION_PROPS} />
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

const styles = StyleSheet.create({
  banner: {},
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
    backgroundColor: '#4B6DDE',
  },
  actionLabel: {
    paddingTop: 8,
    fontSize: 12,
    color: '#000000',
    fontFamily: 'Rubik-Regular',
    fontWeight: '500',
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.5,
  },
  isCopying: {
    position: 'absolute',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    top: -40,
    borderRadius: 4,
    zIndex: 10,
    left: 0
  },
  textCopy: {
    color: 'white',
    textAlign: 'center',
    padding: 8,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
  }
})

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
  }
}

type BuyInfoFormattingOptions = Record<'b' | 'textComponent', (text: ReactNode[]) => ReactNode>

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    send: () => navigation.navigate('send-start-tx'),
    receive: () => navigation.navigate('receive'),
    swap: () => navigation.navigate('swap-start-swap'),
    exchange: () => navigation.navigate('rampOnOff-start-rampOnOff'),
  }
}
