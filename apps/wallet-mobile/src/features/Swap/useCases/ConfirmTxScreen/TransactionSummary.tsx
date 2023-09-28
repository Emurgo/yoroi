import {getMinAdaReceiveAfterSlippage, useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Spacer, Text} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {BottomSheetModal} from '../../../../components/BottomSheetModal'
import {useLanguage} from '../../../../i18n'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useStrings} from '../../common/strings'

export const TransactionSummary = () => {
  const [bottomSheetState, setBottomSheetSate] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()
  const {createOrder} = useSwap()
  const {amounts, selectedPool} = createOrder

  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const label = `${Quantities.format(amounts.buy.quantity, buyTokenInfo.decimals ?? 0)} ${tokenToBuyName}`

  const feesInfo = [
    {
      label: strings.swapMinAdaTitle,
      value: `${Quantities.format(
        selectedPool?.deposit?.quantity ?? Quantities.zero,
        Number(wallet.primaryTokenInfo.decimals),
      )} ${wallet.primaryTokenInfo.ticker}`,
      info: strings.swapMinAda,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: `${getMinAdaReceiveAfterSlippage(
        amounts.buy.quantity,
        createOrder.slippage,
        buyTokenInfo.decimals ?? 0,
        numberLocale,
      )} ${tokenToBuyName}`,
      info: strings.swapMinReceived,
    },
    {
      label: strings.swapFeesTitle,
      value: `${Quantities.format(
        createOrder.selectedPool?.batcherFee?.quantity ?? Quantities.zero,
        Number(wallet.primaryTokenInfo.decimals),
      )} ${wallet.primaryTokenInfo.ticker}`,
      info: strings.swapFees,
    },
  ]

  return (
    <View>
      <View>
        <View style={styles.card}>
          <Text style={styles.cardText}>{strings.total}</Text>

          <View>
            <Text style={[styles.cardText, styles.cardTextValue]}>{label}</Text>

            <Spacer height={6} />

            <Text style={styles.cardTextUSD}></Text>
          </View>
        </View>

        <Spacer height={24} />

        {feesInfo.map((orderInfo) => {
          return (
            <View key={orderInfo.label}>
              <Spacer height={8} />

              <View style={styles.flexBetween}>
                <View style={styles.flex}>
                  <Text style={[styles.text, styles.gray]}>{orderInfo.label}</Text>

                  <Spacer width={8} />

                  <TouchableOpacity
                    onPress={() => {
                      setBottomSheetSate({
                        isOpen: true,
                        title: orderInfo.label,
                        content: orderInfo.info,
                      })
                    }}
                  >
                    <Icon.Info size={24} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.text}>{orderInfo.value}</Text>
              </View>
            </View>
          )
        })}

        <Spacer height={24} />

        <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

        <AmountItem wallet={wallet} amount={{tokenId: amounts.sell.tokenId, quantity: amounts.sell.quantity}} />

        <Spacer height={16} />

        <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

        <AmountItem wallet={wallet} amount={{tokenId: amounts.buy.tokenId, quantity: amounts.buy.quantity}} />
      </View>

      <BottomSheetModal
        isOpen={bottomSheetState.isOpen}
        title={bottomSheetState.title}
        onClose={() => {
          setBottomSheetSate({isOpen: false, title: '', content: ''})
        }}
      >
        <Text style={styles.text}>{bottomSheetState.content}</Text>
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: COLORS.SHELLEY_BLUE,
    padding: 16,
    borderRadius: 8,
  },
  cardText: {
    fontSize: 18,
    color: COLORS.WHITE,
  },
  cardTextValue: {
    fontWeight: '500',
  },
  cardTextUSD: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.5,
  },
  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#242838',
  },
  gray: {
    color: COLORS.GRAY,
  },
  amountItemLabel: {
    fontSize: 12,
    color: '#242838',
    paddingBottom: 8,
  },
})
