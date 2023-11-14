import {getPoolUrlByProvider, useSwap} from '@yoroi/swap'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Spacer, Text, useModal} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {LiquidityPool} from '../../common/LiquidityPool/LiquidityPool'
import {PoolIcon} from '../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../common/strings'
import {SwapInfoLink} from '../../common/SwapInfoLink/SwapInfoLink'

export const TransactionSummary = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {orderData} = useSwap()
  const {amounts, selectedPoolCalculation: calculation} = orderData
  const {openModal} = useModal()

  // should never happen
  if (!calculation) throw new Error('No selected pool calculation')
  const {pool, cost} = calculation

  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const buyTokenInfo = useTokenInfo({wallet, tokenId: amounts.buy.tokenId})
  const tokenToSellName = sellTokenInfo.ticker ?? sellTokenInfo.name
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name
  const isSellPrimary = amounts.sell.tokenId === wallet.primaryTokenInfo.id
  // Quantities.zero case would only happen on an API error where the price in Ada of Ada were missing
  const total = isSellPrimary ? calculation.ptTotalValueSpent?.quantity ?? Quantities.zero : amounts.sell.quantity
  const formattedSellText = `${Quantities.format(total, sellTokenInfo.decimals ?? 0)} ${tokenToSellName}`
  const formattedFeeText = `${Quantities.format(
    Quantities.sum([cost.batcherFee.quantity, cost.frontendFeeInfo.fee.quantity]),
    wallet.primaryTokenInfo.decimals ?? 0,
  )} ${wallet.primaryTokenInfo.ticker}`
  const poolProviderFormatted = capitalize(pool.provider)
  const poolUrl = getPoolUrlByProvider(pool.provider)

  const poolIcon = <PoolIcon providerId={pool.provider} size={18} />

  const feesInfo = [
    {
      label: strings.dex.toUpperCase(),
      value: <LiquidityPool liquidityPoolIcon={poolIcon} liquidityPoolName={poolProviderFormatted} poolUrl={poolUrl} />,
    },
    {
      label: strings.swapMinAdaTitle,
      value: `${Quantities.format(cost.deposit.quantity, wallet.primaryTokenInfo.decimals ?? 0)} ${
        wallet.primaryTokenInfo.ticker
      }`,
      info: strings.swapMinAda,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: `${Quantities.format(
        calculation.buyAmountWithSlippage.quantity,
        buyTokenInfo.decimals ?? 0,
      )} ${tokenToBuyName}`,
      info: strings.swapMinReceived,
    },
    {
      label: strings.swapFeesTitle,
      value: formattedFeeText,
      info: strings.swapFees,
    },
  ]

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardText}>{strings.total}</Text>

        <View>
          <Text style={[styles.cardText, styles.cardTextValue]}>{formattedSellText}</Text>

          {!isSellPrimary && (
            <>
              <Spacer height={6} />

              <Text style={[styles.cardText, styles.cardTextValue]}>{formattedFeeText}</Text>
            </>
          )}

          {!!calculation.ptTotalValueSpent && (
            <>
              <Spacer height={6} />

              <PairedBalance amount={calculation.ptTotalValueSpent} textStyle={styles.cardTextUSD} />
            </>
          )}
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
                      openModal(
                        orderInfo.label,
                        <View style={styles.modalContent}>
                          <Text style={styles.modalText}>{orderInfo.info}</Text>

                          <Spacer fill />

                          <SwapInfoLink />

                          <Spacer height={24} />
                        </View>,
                      )
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
    textAlign: 'right',
  },
  cardTextUSD: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.75,
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
  modalContent: {
    justifyContent: 'space-between',
    flex: 1,
  },
  modalText: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
  },
})
