import {getPoolUrlByProvider, useSwap} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import {capitalize} from 'lodash'
import React from 'react'
import {Linking, Pressable, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Spacer, Text} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {BottomSheetModal} from '../../../../legacy/BottomSheetModal'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {PoolIcon} from '../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../common/strings'

export const TransactionSummary = () => {
  const [bottomSheetState, setBottomSheetSate] = React.useState<{isOpen: boolean; title: string; content?: string}>({
    isOpen: false,
    title: '',
    content: '',
  })
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {orderData} = useSwap()
  const {amounts, selectedPoolCalculation} = orderData

  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const label = `${Quantities.format(amounts.buy.quantity, buyTokenInfo.decimals ?? 0)} ${tokenToBuyName}`
  const poolProviderFormatted = capitalize(selectedPoolCalculation?.pool.provider)
  const poolUrl = getPoolUrlByProvider(selectedPoolCalculation?.pool.provider as Swap.SupportedProvider)

  const feesInfo = [
    {
      label: strings.dex.toUpperCase(),
      value: (
        <Pressable style={styles.flex} onPress={() => Linking.openURL(poolUrl)}>
          <PoolIcon providerId={selectedPoolCalculation?.pool.provider as Swap.SupportedProvider} size={18} />

          <Spacer width={8} />

          <Text style={[styles.text, styles.poolText]}>{poolProviderFormatted}</Text>
        </Pressable>
      ),
    },
    {
      label: strings.swapMinAdaTitle,
      value: `${Quantities.format(
        selectedPoolCalculation?.cost?.deposit?.quantity ?? Quantities.zero,
        Number(wallet.primaryTokenInfo.decimals),
      )} ${wallet.primaryTokenInfo.ticker}`,
      info: strings.swapMinAda,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: `${Quantities.format(
        selectedPoolCalculation?.buyAmountWithSlippage?.quantity ?? Quantities.zero,
        buyTokenInfo.decimals ?? 0,
      )} ${tokenToBuyName}`,
      info: strings.swapMinReceived,
    },
    {
      label: strings.swapFeesTitle,
      value: `${Quantities.format(
        selectedPoolCalculation?.cost?.batcherFee?.quantity ?? Quantities.zero, // TODO: Show all fees
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

                  {orderInfo.info != undefined && (
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
                  )}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  gray: {
    color: COLORS.GRAY,
  },
  amountItemLabel: {
    fontSize: 12,
    color: '#242838',
    paddingBottom: 8,
  },
  poolText: {
    color: COLORS.PRIMARY_GRADIENT_END,
  },
})
