import {parseNumberFromText} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'

import _ from 'lodash'
import * as React from 'react'
import {Text, View} from 'react-native'

import {Splits} from '~/features/Swap/common/EstimateSummary/EstimateSummary'
import {SwapContextInstance} from '~/features/Swap/common/SwapProvider'
import {
  PRICE_IMPACT_HIGH_RISK,
  PRICE_IMPACT_MODERATE_RISK,
  undefinedToken,
} from '~/features/Swap/common/constants'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Divider} from '~/ui/Divider/Divider'
import {Icon} from '~/ui/Icon'
import {ProtocolAvatar} from '~/ui/ProtocolAvatar/ProtocolAvatar'
import {ShowPriceImpact} from '~/ui/ShowPriceImpact/ShowPriceImpact'
import {Space} from '~/ui/Space/Space'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'

import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../../common/helpers'

export const TransactionSummary = ({
  swapForm,
}: {
  swapForm: React.ContextType<typeof SwapContextInstance>
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const {orderType} = swapForm
  const [showSplits, setShowSplits] = React.useState(false)
  const {numberLocale} = useLanguage()
  const localFormat = (v: number | string, precision?: number) =>
    parseNumberFromText({text: String(v), format: numberLocale, precision})
      .formattedValue
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
    orderType === 'market' ? priceImpactRiskTheme.text : p.gray_900

  const tokenInTicker = tokenInInfo.ticker ?? tokenInInfo.name
  const tokenOutTicker = tokenOutInfo.ticker ?? tokenOutInfo.name

  const netPrice =
    swapForm.createTx?.netPrice ??
    swapForm.createTx?.splits[0]?.initialPrice ??
    0

  const priceInfoValue = `1 ${tokenInTicker} = ${localFormat(netPrice, Math.max(tokenOutInfo?.decimals ?? 0, tokenInInfo?.decimals ?? 0, 3))} ${tokenOutTicker}`
  const minAdaInfoValue = `${swapForm.createTx?.deposits} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const totalFee = `${localFormat(swapForm.createTx?.totalFee ?? 0)} ${wallet.portfolioPrimaryTokenInfo.ticker}`
  const minReceivedInfoValue = `${localFormat(swapForm.createTx?.totalOutputWithoutSlippage ?? 0)} ${tokenOutTicker}`

  const protocol = swapForm.createTx?.splits[0]?.protocol
  const fallbackImageUrl = swapForm.createTx?.splits[0]?.aggregatorImageUrl
  const nameOverride =
    protocol === Swap.Protocol.Unsupported
      ? swapForm.createTx?.splits[0]?.aggregatorDexKey
      : undefined

  const feesInfo = [
    {
      label: strings.swap.route,
      value:
        protocol !== undefined ? (
          <ProtocolAvatar
            protocol={protocol}
            fallbackImageUrl={fallbackImageUrl}
            nameOverride={nameOverride}
            append={
              swapForm.createTx?.aggregator != null
                ? ` ${strings.swap.via} ${_.upperFirst(swapForm.createTx.aggregator)}${
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
          ? strings.swap.marketPrice
          : strings.swap.limitPriceWarningTitle,
      value: (
        <Text
          style={[
            a.text_left,
            a.body_1_lg_regular,
            a.text_right,
            {color: p.gray_900},
          ]}
        >
          {priceInfoValue}
        </Text>
      ),
    },
    {
      label: strings.swap.priceImpact,
      value: <ShowPriceImpact priceImpact={swapForm.createTx?.priceImpact} />,
      hidden: priceImpactRisk === 'none' || orderType === 'limit',
    },
    {
      label: strings.swap.swapMinAdaTitle,
      value: (
        <Text style={[a.text_left, a.body_1_lg_regular, {color: p.gray_900}]}>
          {minAdaInfoValue}
        </Text>
      ),
    },
    {
      label: strings.swap.swapFeesTitle,
      value: (
        <Text style={[a.text_left, a.body_1_lg_regular, {color: p.gray_900}]}>
          {totalFee}
        </Text>
      ),
    },
    {
      label: strings.swap.swapMinReceivedTitle,
      value: (
        <View>
          <Text
            style={[
              a.text_left,
              a.body_1_lg_regular,
              a.text_right,
              {color: p.gray_900},
            ]}
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
              a.py_md,
              a.px_lg,
              a.rounded_sm,
              a.gap_sm,
              {backgroundColor: priceImpactRiskTheme.background},
            ]}
          >
            {priceImpactRisk === 'moderate' && (
              <Icon.Info size={24} color={priceImpactRiskTextColor} />
            )}

            {priceImpactRisk === 'high' && (
              <Icon.Warning size={24} color={priceImpactRiskTextColor} />
            )}

            <Text style={[a.body_2_md_regular, {color: p.gray_900}]}>
              <Text style={[a.body_2_md_regular, a.body_2_md_medium]}>
                {strings.swap.priceImpactRiskHigh({
                  riskValue:
                    priceImpactRisk === 'moderate'
                      ? PRICE_IMPACT_MODERATE_RISK
                      : PRICE_IMPACT_HIGH_RISK,
                })}
              </Text>

              <Text style={[a.body_2_md_regular, {color: p.gray_900}]}>
                {strings.swap.priceImpactDescription(priceImpactRisk)}
              </Text>
            </Text>
          </View>
        )}

      <Space.Height.lg />

      <Text style={[{fontSize: 12}, a.pb_sm, {color: p.gray_900}]}>
        {strings.swap.swapFrom}
      </Text>

      <TokenAmountItem amount={amountIn} orderType={orderType} />

      <Space.Height.lg />

      <Text style={[{fontSize: 12}, a.pb_sm, {color: p.gray_900}]}>
        {strings.swap.swapTo}
      </Text>

      <TokenAmountItem
        amount={amountOut}
        priceImpactRisk={priceImpactRisk}
        orderType={orderType}
      />

      <Divider verticalSpace="lg" />

      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {strings.swap.swapDetailsTitle}
      </Text>

      {feesInfo.map((orderInfo) => {
        if (orderInfo?.hidden) {
          return null
        }

        return (
          <View key={orderInfo.label}>
            <Space.Height.sm />

            <View style={[a.flex_row, a.justify_between, a.align_start]}>
              <View style={[a.flex_row, a.align_center]}>
                <Text
                  style={[
                    a.text_left,
                    a.body_1_lg_regular,
                    {color: p.gray_700},
                  ]}
                >
                  {orderInfo.label}
                </Text>
              </View>

              <View
                style={[
                  a.flex_row,
                  a.align_end,
                  a.justify_end,
                  a.pl_sm,
                  a.flex_1,
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
