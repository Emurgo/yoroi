import {getPoolUrlByProvider, useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Spacer, Text, useModal} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {COLORS} from '../../../../theme'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../../Wallet/common/Context'
import {PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK, PRICE_PRECISION} from '../../common/constants'
import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../../common/helpers'
import {LiquidityPool} from '../../common/LiquidityPool/LiquidityPool'
import {PoolIcon} from '../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../common/strings'
import {useSwapForm} from '../../common/SwapFormProvider'
import {SwapInfoLink} from '../../common/SwapInfoLink/SwapInfoLink'

export const TransactionSummary = () => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const {orderData} = useSwap()
  const {
    limitPrice: {displayValue: limitDisplayValue},
  } = useSwapForm()
  const {amounts, selectedPoolCalculation: calculation, type} = orderData
  const {openModal} = useModal()

  // should never happen
  if (!calculation) throw new Error('No selected pool calculation')
  const {pool, cost, prices} = calculation

  const priceImpact = prices.priceImpact
  const formattedActualPrice = Quantities.format(
    prices.actualPrice ?? Quantities.zero,
    orderData.tokens.priceDenomination,
    PRICE_PRECISION,
  )

  const priceImpactRisk = getPriceImpactRisk(Number(priceImpact))
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const priceImpactRiskTextColor = type === 'market' ? priceImpactRiskTheme.text : styles.text.color

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

  const priceInfoValue = `${limitDisplayValue} ${tokenToSellName}/${tokenToBuyName}`
  const minAdaInfoValue = `${Quantities.format(cost.deposit.quantity, wallet.primaryTokenInfo.decimals ?? 0)} ${
    wallet.primaryTokenInfo.ticker
  }`
  const minReceivedInfoValue = `${Quantities.format(
    calculation.buyAmountWithSlippage.quantity,
    buyTokenInfo.decimals ?? 0,
  )} ${tokenToBuyName}`

  const feesInfo = [
    {
      label: strings.dex.toUpperCase(),
      value: <LiquidityPool liquidityPoolIcon={poolIcon} liquidityPoolName={poolProviderFormatted} poolUrl={poolUrl} />,
    },
    {
      label: strings.swapMinAdaTitle,
      value: <Text style={styles.text}>{minAdaInfoValue}</Text>,
    },
    {
      label: strings.swapFeesTitle,
      value: <Text style={styles.text}>{formattedFeeText}</Text>,
    },
    {
      label: strings.swapLiqProvFee,
      value: <Text style={styles.text}>{liqFeeQuantityFormatted}</Text>,
    },
    {
      label: strings.swapMinReceivedTitle,
      value: (
        <View style={styles.flex}>
          <Text style={[styles.text, styles.alignRight]}>{minReceivedInfoValue}</Text>
        </View>
      ),
    },
    {
      label: `${capitalize(type)} ${strings.price}`,
      value: <Text style={[styles.text, styles.alignRight]}>{priceInfoValue}</Text>,
      info: type === 'market' ? strings.marketPriceInfo : strings.limitPriceInfo,
    },
    {
      label: strings.priceImpact,
      value:
        priceImpactRisk === 'none' ? (
          <Text style={[styles.priceImpactRiskText]}>&lt;1%</Text>
        ) : (
          <View style={styles.priceImpactRiskContainer}>
            <View style={styles.flex}>
              {priceImpactRisk === 'high' && <Icon.Warning size={24} color={priceImpactRiskTextColor} />}

              {priceImpactRisk === 'moderate' && <Icon.Info size={24} color={priceImpactRiskTextColor} />}

              <Text style={[{color: priceImpactRiskTextColor}, styles.priceImpactRiskText]}>
                {Math.ceil(Number(priceImpact) * 100) / 100}%
              </Text>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text style={[{color: priceImpactRiskTextColor}, styles.priceImpactRiskText]}>
                {`(${formattedActualPrice} ${tokenToSellName}/${tokenToBuyName})`}
              </Text>
            </View>
          </View>
        ),
      info: strings.priceImpactInfo,
      warning: priceImpactRisk === 'high',
      hidden: orderData.type === 'limit',
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
        if (orderInfo?.hidden) {
          return null
        }
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

              <View style={styles.orderValueContainer}>{orderInfo.value}</View>
            </View>
          </View>
        )
      })}

      <Spacer height={16} />

      {(priceImpactRisk === 'moderate' || priceImpactRisk === 'high') && type === 'market' && (
        <View style={[styles.banner, {backgroundColor: priceImpactRiskTheme.background}]}>
          {priceImpactRisk === 'moderate' && <Icon.Info size={24} color={priceImpactRiskTextColor} />}

          {priceImpactRisk === 'high' && <Icon.Warning size={24} color={priceImpactRiskTextColor} />}

          <Text style={styles.bannerText}>
            <Text style={[styles.bannerText, styles.bold]}>
              {strings.priceImpactRiskHigh({
                riskValue: priceImpactRisk === 'moderate' ? PRICE_IMPACT_MODERATE_RISK : PRICE_IMPACT_HIGH_RISK,
              })}
            </Text>

            <Text style={styles.bannerText}> {strings.priceImpactDescription(priceImpactRisk)}</Text>
          </Text>
        </View>
      )}

      <Spacer height={16} />

      <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

      <AmountItem
        wallet={wallet}
        amount={{tokenId: amounts.sell.tokenId, quantity: amounts.sell.quantity}}
        orderType={type}
      />

      <Spacer height={16} />

      <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

      <AmountItem
        wallet={wallet}
        amount={{tokenId: amounts.buy.tokenId, quantity: amounts.buy.quantity}}
        priceImpactRisk={priceImpactRisk}
        orderType={type}
      />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    priceImpactRiskContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    priceImpactRiskText: {
      ...typography['body-2-m-regular'],
    },
    alignRight: {
      textAlign: 'right',
    },
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: color.primary[600],
      padding: 16,
      borderRadius: 8,
    },
    cardText: {
      fontSize: 18,
      color: color.gray.min,
    },
    cardTextValue: {
      ...typography['heading-4-medium'],
      lineHeight: 22,
      textAlign: 'right',
    },
    cardTextUSD: {
      fontSize: 14,
      color: color.gray.min,
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
      ...typography['body-1-l-regular'],
      color: color.gray[900],
    },
    gray: {
      color: COLORS.GRAY,
    },
    amountItemLabel: {
      fontSize: 12,
      color: color.gray[900],
      paddingBottom: 8,
    },
    modalContent: {
      justifyContent: 'space-between',
      flex: 1,
    },
    modalText: {
      ...typography['body-1-l-regular'],
      color: color.gray[900],
    },
    orderValueContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      paddingLeft: 8,
      flex: 1,
    },
    banner: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    bannerText: {
      fontSize: 14,
      lineHeight: 22,
      color: color.gray[900],
    },
    bold: {
      ...typography['body-2-m-medium'],
    },
  })

  return styles
}
