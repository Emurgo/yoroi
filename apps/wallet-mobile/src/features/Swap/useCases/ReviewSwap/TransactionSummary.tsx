import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Divider} from '../../../../components/Divider/Divider'
import {Icon} from '../../../../components/Icon'
import {Space} from '../../../../components/Space/Space'
import {TokenAmountItem} from '../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK, undefinedToken} from '../../common/constants'
import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../../common/helpers'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {useStrings} from '../../common/strings'
import {SwapContext} from '../../common/SwapProvider'
import {ShowPriceImpact} from '../CreateOrder/ShowPriceImpact'

export const TransactionSummary = ({swapForm}: {swapForm: SwapContext}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const {orderType} = swapForm

  const tokenInInfo = swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken)
  const tokenOutInfo = swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken)

  if (tokenInInfo === undefined || tokenOutInfo === undefined) throw new Error('Missing tokenInfos')
  const amountIn = {
    info: tokenInInfo,
    quantity: BigInt(Number(swapForm.createTx?.totalInput ?? 0) * 10 ** tokenInInfo.decimals),
  }
  const amountOut = {
    info: tokenOutInfo,
    quantity: BigInt(Number(swapForm.createTx?.totalOutputWithoutSlippage ?? 0) * 10 ** tokenOutInfo.decimals),
  }

  const priceImpactRisk = getPriceImpactRisk(Number(swapForm.createTx?.priceImpact))
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const priceImpactRiskTextColor = orderType === 'market' ? priceImpactRiskTheme.text : styles.text.color

  const tokenInTicker = tokenInInfo.ticker ?? tokenInInfo.name
  const tokenOutTicker = tokenOutInfo.ticker ?? tokenOutInfo.name

  const priceInfoValue = `1 ${tokenInTicker} = ${(
    swapForm.createTx?.netPrice ??
    swapForm.createTx?.splits[0].initialPrice ??
    0
  ).toFixed(tokenOutInfo?.decimals ?? 0)} ${tokenOutTicker}`
  const minAdaInfoValue = `${swapForm.createTx?.deposits} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const totalFee = `${swapForm.createTx?.totalFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const minReceivedInfoValue = `${swapForm.createTx?.totalOutput} ${tokenOutTicker}`

  const protocol = swapForm.createTx?.splits[0]?.protocol

  const feesInfo = [
    {
      label: strings.aggregator,
      value: <Text style={styles.text}>{swapForm.createTx?.aggregator ?? ''}</Text>,
    },
    {
      label: strings.dex.toUpperCase(),
      value: protocol !== undefined ? <ProtocolAvatar protocol={protocol} /> : '',
    },
    {
      label: orderType === 'market' ? strings.marketPrice : strings.limitPriceWarningTitle,
      value: <Text style={[styles.text, styles.alignRight]}>{priceInfoValue}</Text>,
    },
    {
      label: strings.priceImpact,
      value: <ShowPriceImpact priceImpact={swapForm.createTx?.priceImpact} />,
      hidden: orderType === 'limit',
    },
    {
      label: strings.swapMinAdaTitle,
      value: <Text style={styles.text}>{minAdaInfoValue}</Text>,
    },
    {
      label: strings.swapFeesTitle,
      value: <Text style={styles.text}>{totalFee}</Text>,
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
      {(priceImpactRisk === 'moderate' || priceImpactRisk === 'high') && orderType === 'market' && (
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

      <Space height="lg" />

      <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

      <TokenAmountItem amount={amountIn} orderType={orderType} />

      <Space height="lg" />

      <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

      <TokenAmountItem amount={amountOut} priceImpactRisk={priceImpactRisk} orderType={orderType} />

      <Divider verticalSpace="lg" />

      <Text style={styles.detailsTitle}>{strings.swapDetailsTitle}</Text>

      {feesInfo.map((orderInfo) => {
        if (orderInfo?.hidden) {
          return null
        }

        return (
          <View key={orderInfo.label}>
            <Space height="sm" />

            <View style={styles.flexBetween}>
              <View style={styles.flex}>
                <Text style={[styles.text, styles.gray]}>{orderInfo.label}</Text>
              </View>

              <View style={styles.orderValueContainer}>{orderInfo.value}</View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
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
      ...atoms.body_2_md_regular,
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
