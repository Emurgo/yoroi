import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {Divider} from '../../../ui/Divider/Divider'
import {Icon} from '../../../ui/Icon'
import {ProtocolAvatar} from '../../../ui/ProtocolAvatar/ProtocolAvatar'
import {Space} from '../../../ui/Space/Space'
import {TokenAmountItem} from '../../../ui/TokenAmountItem/TokenAmountItem'
import {
  PRICE_IMPACT_HIGH_RISK,
  PRICE_IMPACT_MODERATE_RISK,
  undefinedToken,
} from '../../common/constants'
import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../../common/helpers'
import {useStrings} from '../../common/strings'
import {SwapContext} from '../../common/SwapProvider'
import {Splits} from '../CreateOrder/EstimateSummary'
import {ShowPriceImpact} from '../CreateOrder/ShowPriceImpact'

export const TransactionSummary = ({swapForm}: {swapForm: SwapContext}) => {
  const strings = useStrings()
  const {color, atoms} = useTheme()
  const {wallet} = useSelectedWallet()
  const {orderType} = swapForm
  const [showSplits, setShowSplits] = React.useState(false)

  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos.get(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

  if (tokenInInfo === undefined || tokenOutInfo === undefined)
    throw new Error('Missing tokenInfos')
  const amountIn = {
    info: tokenInInfo,
    quantity: BigInt(
      Math.floor(
        Number(swapForm.createTx?.totalInput ?? 0) * 10 ** tokenInInfo.decimals,
      ),
    ),
  }
  const amountOut = {
    info: tokenOutInfo,
    quantity: BigInt(
      Math.floor(
        Number(swapForm.createTx?.totalOutputWithoutSlippage ?? 0) *
          10 ** tokenOutInfo.decimals,
      ),
    ),
  }

  const priceImpactRisk = getPriceImpactRisk(
    Number(swapForm.createTx?.priceImpact),
  )
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const priceImpactRiskTextColor =
    orderType === 'market' ? priceImpactRiskTheme.text : color.gray_900

  const tokenInTicker = tokenInInfo.ticker ?? tokenInInfo.name
  const tokenOutTicker = tokenOutInfo.ticker ?? tokenOutInfo.name

  const netPrice =
    swapForm.createTx?.netPrice ??
    swapForm.createTx?.splits[0].initialPrice ??
    0
  const roundedPrice = netPrice
    .toFixed(tokenOutInfo?.decimals ?? 0)
    .replace(/\.0+$/, '')
  const price = roundedPrice !== '0' ? roundedPrice : netPrice.toFixed(6)
  const priceInfoValue = `1 ${tokenInTicker} = ${price} ${tokenOutTicker}`
  const minAdaInfoValue = `${swapForm.createTx?.deposits} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const totalFee = `${swapForm.createTx?.totalFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const minReceivedInfoValue = `${swapForm.createTx?.totalOutput} ${tokenOutTicker}`

  const protocol = swapForm.createTx?.splits[0]?.protocol

  const feesInfo = [
    {
      label: strings.route,
      value:
        protocol !== undefined ? (
          <ProtocolAvatar
            protocol={protocol}
            append={
              swapForm.createTx?.aggregator != null
                ? ` ${strings.via} ${_.upperFirst(swapForm.createTx.aggregator)}${
                    swapForm.createTx.splits.length > 1 ? '...' : ''
                  }`
                : ''
            }
            onPress={() => setShowSplits(!showSplits)}
          />
        ) : null,
    },
    {
      label: '',
      value:
        swapForm.createTx != null ? (
          <Splits data={swapForm.createTx.splits} />
        ) : null,
      hidden: !showSplits,
    },
    {
      label:
        orderType === 'market'
          ? strings.marketPrice
          : strings.limitPriceWarningTitle,
      value: (
        <Text style={[styles.text, styles.alignRight, {color: color.gray_900}]}>
          {priceInfoValue}
        </Text>
      ),
    },
    {
      label: strings.priceImpact,
      value: <ShowPriceImpact priceImpact={swapForm.createTx?.priceImpact} />,
      hidden: priceImpactRisk === 'none' || orderType === 'limit',
    },
    {
      label: strings.swapMinAdaTitle,
      value: (
        <Text style={[styles.text, {color: color.gray_900}]}>
          {minAdaInfoValue}
        </Text>
      ),
    },
    {
      label: strings.swapFeesTitle,
      value: (
        <Text style={[styles.text, {color: color.gray_900}]}>{totalFee}</Text>
      ),
    },
    {
      label: strings.swapMinReceivedTitle,
      value: (
        <View style={styles.flex}>
          <Text
            style={[styles.text, styles.alignRight, {color: color.gray_900}]}
          >
            {minReceivedInfoValue}
          </Text>
        </View>
      ),
    },
  ]

  return (
    <View>
      {(priceImpactRisk === 'moderate' || priceImpactRisk === 'high') &&
        orderType === 'market' && (
          <View
            style={[
              styles.banner,
              atoms.py_md,
              atoms.px_lg,
              atoms.rounded_sm,
              atoms.gap_sm,
              {backgroundColor: priceImpactRiskTheme.background},
            ]}
          >
            {priceImpactRisk === 'moderate' && (
              <Icon.Info size={24} color={priceImpactRiskTextColor} />
            )}

            {priceImpactRisk === 'high' && (
              <Icon.Warning size={24} color={priceImpactRiskTextColor} />
            )}

            <Text style={[styles.bannerText, {color: color.gray_900}]}>
              <Text
                style={[styles.bannerText, styles.bold, atoms.body_2_md_medium]}
              >
                {strings.priceImpactRiskHigh({
                  riskValue:
                    priceImpactRisk === 'moderate'
                      ? PRICE_IMPACT_MODERATE_RISK
                      : PRICE_IMPACT_HIGH_RISK,
                })}
              </Text>

              <Text style={[styles.bannerText, {color: color.gray_900}]}>
                {' '}
                {strings.priceImpactDescription(priceImpactRisk)}
              </Text>
            </Text>
          </View>
        )}

      <Space height="lg" />

      <Text style={[styles.amountItemLabel, {color: color.gray_900}]}>
        {strings.swapFrom}
      </Text>

      <TokenAmountItem amount={amountIn} orderType={orderType} />

      <Space height="lg" />

      <Text style={[styles.amountItemLabel, {color: color.gray_900}]}>
        {strings.swapTo}
      </Text>

      <TokenAmountItem
        amount={amountOut}
        priceImpactRisk={priceImpactRisk}
        orderType={orderType}
      />

      <Divider verticalSpace="lg" />

      <Text style={[styles.detailsTitle, {color: color.text_gray_medium}]}>
        {strings.swapDetailsTitle}
      </Text>

      {feesInfo.map((orderInfo) => {
        if (orderInfo?.hidden) {
          return null
        }

        return (
          <View key={orderInfo.label}>
            <Space height="sm" />

            <View
              style={[
                styles.flexBetween,
                atoms.flex_row,
                atoms.justify_between,
                atoms.align_start,
              ]}
            >
              <View style={[styles.flex, atoms.flex_row, atoms.align_center]}>
                <Text
                  style={[styles.text, styles.gray, {color: color.gray_700}]}
                >
                  {orderInfo.label}
                </Text>
              </View>

              <View
                style={[
                  styles.orderValueContainer,
                  atoms.flex_row,
                  atoms.align_end,
                  atoms.justify_end,
                  atoms.pl_sm,
                  atoms.flex_1,
                ]}
              >
                {orderInfo.value}
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  alignRight: {
    ...a.text_right,
  },
  flexBetween: {},
  flex: {},
  text: {
    ...a.text_left,
    ...a.body_1_lg_regular,
  },
  gray: {},
  amountItemLabel: {
    fontSize: 12,
    ...a.pb_sm,
  },
  orderValueContainer: {},
  banner: {},
  bannerText: {
    ...a.body_2_md_regular,
  },
  bold: {},
  detailsTitle: {
    ...a.body_1_lg_medium,
  },
})
