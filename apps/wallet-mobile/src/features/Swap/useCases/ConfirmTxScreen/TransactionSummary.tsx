import {getPoolUrlByProvider, useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {capitalize} from 'lodash'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Divider} from '../../../../components/Divider/Divider'
import {Icon} from '../../../../components/Icon'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Text} from '../../../../components/Text'
import {asQuantity, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {TokenAmountItem} from '../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK, PRICE_PRECISION} from '../../common/constants'
import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../../common/helpers'
import {LiquidityPool} from '../../common/LiquidityPool/LiquidityPool'
import {PoolIcon} from '../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../common/strings'
import {useSwapForm} from '../../common/SwapFormProvider'

export const TransactionSummary = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const {orderData} = useSwap()
  const {
    limitPrice: {displayValue: limitDisplayValue},
  } = useSwapForm()
  const {amounts, selectedPoolCalculation: calculation, type} = orderData

  // should never happen
  if (!calculation || !amounts.buy || !amounts.sell) throw new Error('No selected pool calculation/amounts found')
  const {pool, cost, prices} = calculation

  const priceImpact = prices.priceImpact
  const formattedActualPrice = Quantities.format(
    asQuantity(prices.actualPrice),
    orderData.tokens.priceDenomination,
    PRICE_PRECISION,
  )

  const priceImpactRisk = getPriceImpactRisk(Number(priceImpact))
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const priceImpactRiskTextColor = type === 'market' ? priceImpactRiskTheme.text : styles.text.color

  const sellTokenInfo = amounts.sell.info
  const buyTokenInfo = amounts.buy.info

  const tokenToSellName = sellTokenInfo.ticker ?? sellTokenInfo.name
  const tokenToBuyName = buyTokenInfo.ticker ?? buyTokenInfo.name

  const formattedFeeText = `${Quantities.format(
    asQuantity((cost.batcherFee.quantity + cost.frontendFeeInfo.fee.quantity).toString()),
    wallet.portfolioPrimaryTokenInfo.decimals,
  )} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const poolProviderFormatted = capitalize(pool.provider)
  const poolUrl = getPoolUrlByProvider(pool.provider)

  const liqFeeQuantity = Quantities.format(asQuantity(cost.liquidityFee.quantity.toString()), sellTokenInfo.decimals)
  const liqFeeQuantityFormatted = `${liqFeeQuantity} ${tokenToSellName}`

  const poolIcon = <PoolIcon providerId={pool.provider} size={18} />

  const priceInfoValue = `${limitDisplayValue} ${tokenToSellName}/${tokenToBuyName}`
  const minAdaInfoValue = `${Quantities.format(
    asQuantity(cost.deposit.quantity.toString()),
    wallet.portfolioPrimaryTokenInfo.decimals,
  )} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const minReceivedInfoValue = `${Quantities.format(
    asQuantity(calculation.buyAmountWithSlippage.quantity.toString()),
    buyTokenInfo.decimals,
  )} ${tokenToBuyName}`

  const feesInfo = [
    {
      label: strings.dex.toUpperCase(),
      value: <LiquidityPool liquidityPoolIcon={poolIcon} liquidityPoolName={poolProviderFormatted} poolUrl={poolUrl} />,
    },
    {
      label: `${capitalize(type)} ${strings.price}`,
      value: <Text style={[styles.text, styles.alignRight]}>{priceInfoValue}</Text>,
    },
    {
      label: strings.priceImpact,
      value:
        priceImpactRisk === 'none' ? (
          <Text style={[styles.priceImpactRiskText, styles.priceImpactLowRiskText]}>&lt;1%</Text>
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
      warning: priceImpactRisk === 'high',
      hidden: orderData.type === 'limit',
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
  ]

  return (
    <View>
      <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

      <TokenAmountItem amount={amounts.sell} orderType={type} />

      <Spacer height={16} />

      <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

      <TokenAmountItem amount={amounts.buy} priceImpactRisk={priceImpactRisk} orderType={type} />

      <Divider verticalSpace="lg" />

      <Text style={styles.detailsTitle}>Swap details</Text>

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
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    priceImpactRiskContainer: {
      ...atoms.flex_1,
      ...atoms.justify_end,
      ...atoms.align_end,
    },
    priceImpactRiskText: {
      ...atoms.body_2_md_regular,
    },
    priceImpactLowRiskText: {
      color: color.secondary_600,
    },
    alignRight: {
      ...atoms.text_right,
    },
    flexBetween: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_start,
    },
    flex: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    text: {
      ...atoms.text_left,
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    gray: {
      color: color.gray_700,
    },
    amountItemLabel: {
      fontSize: 12,
      color: color.gray_900,
      ...atoms.pb_sm,
    },
    orderValueContainer: {
      ...atoms.flex_row,
      ...atoms.align_end,
      ...atoms.justify_end,
      ...atoms.pl_sm,
      ...atoms.flex_1,
    },
    banner: {
      ...atoms.py_md,
      ...atoms.px_lg,
      ...atoms.rounded_sm,
      ...atoms.gap_sm,
    },
    bannerText: {
      fontSize: 14,
      lineHeight: 22,
      color: color.gray_900,
    },
    bold: {
      ...atoms.body_2_md_medium,
    },
    detailsTitle: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
  })

  const colors = {
    icon: color.gray_max,
    gradientColor: color.bg_gradient_3,
  }

  return {styles, colors} as const
}
