import {getPoolUrlByProvider, useSwap} from '@yoroi/swap'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Spacer, Text, useModal} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS, useTheme} from '../../../../theme'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {calculatePriceImpactRisk, priceImpactBannerColorObject, priceImpactColorObject} from '../../common/helpers'
import {LiquidityPool} from '../../common/LiquidityPool/LiquidityPool'
import {PoolIcon} from '../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../common/strings'
import {useSwapForm} from '../../common/SwapFormProvider'
import {SwapInfoLink} from '../../common/SwapInfoLink/SwapInfoLink'

export const TransactionSummary = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {orderData} = useSwap()
  const {theme} = useTheme()
  const {
    limitPrice: {displayValue: limitDisplayValue},
  } = useSwapForm()
  const {amounts, selectedPoolCalculation: calculation, calculations} = orderData
  const {openModal} = useModal()

  const priceImpact = calculations[0]?.prices.priceImpact
  const actualPrice = calculations[0]?.prices.actualPrice

  const priceImpactColor = priceImpactColorObject(theme)
  const priceImpactBannerColorMap = priceImpactBannerColorObject(theme)

  const priceImpactRisk = calculatePriceImpactRisk(Number(priceImpact))
  const warningColorHex = priceImpactColor[priceImpactRisk]

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

  const liqFeeQuantity = Quantities.format(cost.liquidityFee.quantity, sellTokenInfo.decimals ?? 0)
  const liqFeeQuantityFormatted = `${liqFeeQuantity} ${tokenToSellName}`

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
      label: strings.swapFeesTitle,
      value: formattedFeeText,
      info: strings.swapFees,
    },
    {
      label: strings.swapLiqProvFee,
      value: liqFeeQuantityFormatted,
      info: strings.swapFees,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: (
        <View style={styles.flex}>
          {priceImpactRisk === 'negative' && <Icon.Warning size={24} color={warningColorHex} />}

          <Text style={{color: warningColorHex}}>
            {`${Quantities.format(
              calculation.buyAmountWithSlippage.quantity,
              buyTokenInfo.decimals ?? 0,
            )} ${tokenToBuyName}`}
          </Text>
        </View>
      ),
      info: strings.swapMinReceived,
    },
    {
      label: strings.marketPrice,
      value: `${limitDisplayValue} ${tokenToSellName}/${tokenToBuyName}`,
      info: strings.marketPriceInfo,
    },
    {
      label: strings.priceimpact,
      value:
        priceImpactRisk === 'positive' ? (
          <Text style={{color: '#08C29D'}}>&lt;1%</Text>
        ) : (
          <View style={{alignItems: 'flex-end'}}>
            <View style={styles.flex}>
              {priceImpactRisk === 'negative' && <Icon.Warning size={24} color={warningColorHex} />}

              {priceImpactRisk === 'warning' && <Icon.Info size={24} color={warningColorHex} />}

              <Text style={{color: warningColorHex}}>{Math.ceil(Number(priceImpact) * 100) / 100}%</Text>
            </View>

            <Text style={{color: warningColorHex}}>
              {actualPrice}

              <Text style={{color: warningColorHex}}> {`${tokenToSellName}/${tokenToBuyName}`}</Text>
            </Text>
          </View>
        ),
      info: strings.priceImpactInfo,
      warning: priceImpactRisk === 'negative',
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

              <View style={styles.orderValueContainer}>
                <Text style={[styles.text]}>{orderInfo.value}</Text>
              </View>
            </View>
          </View>
        )
      })}

      <Spacer height={12} />

      {(priceImpactRisk === 'warning' || priceImpactRisk === 'negative') && (
        <View style={[styles.banner, {backgroundColor: priceImpactBannerColorMap[priceImpactRisk]}]}>
          {priceImpactRisk === 'warning' && <Icon.Info size={24} color={warningColorHex} />}

          {priceImpactRisk === 'negative' && <Icon.Warning size={24} color={warningColorHex} />}

          <Text>
            <Text style={styles.bold}>{strings.priceImpactOver10}</Text>

            <Text> {strings.priceimpactDescription}</Text>
          </Text>
        </View>
      )}

      <Spacer height={12} />

      <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

      <AmountItem wallet={wallet} amount={{tokenId: amounts.sell.tokenId, quantity: amounts.sell.quantity}} />

      <Spacer height={16} />

      <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

      <AmountItem
        wallet={wallet}
        amount={{tokenId: amounts.buy.tokenId, quantity: amounts.buy.quantity}}
        priceImpactRisk={priceImpactRisk}
      />
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
    alignItems: 'flex-start',
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
  orderValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  banner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  bold: {
    fontWeight: '500',
  },
})
