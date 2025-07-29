import {
  amountFormatter,
  infoExtractName,
  isNft,
  isPrimaryToken,
} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {useWindowDimensions, View, ViewProps} from 'react-native'

import {useStrings} from '../../features/ReviewTx/common/hooks/useStrings'
import {usePrivacyMode} from '../../features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {usePriceImpactRiskTheme} from '../../features/Swap/common/helpers'
import {SwapPriceImpactRisk} from '../../features/Swap/common/types'
import {features} from '../../kernel/features'
import {Button, ButtonType} from '../Button/Button'
import {Icon} from '../Icon'
import {useModal} from '../Modal/ModalContext'
import {PairedBalance} from '../PairedBalance/PairedBalance'
import {TokenDetails} from '../TokenDetails/TokenDetails'
import {TokenInfoIcon} from '../TokenInfoIcon/TokenInfoIcon'

type TokenAmountItemProps = {
  amount: Portfolio.Token.Amount
  ignorePrivacy?: boolean

  style?: ViewProps['style']
  variant?: 'swap'
  priceImpactRisk?: SwapPriceImpactRisk
  orderType?: 'limit' | 'market'
}

export const TokenAmountItem = ({
  ignorePrivacy = false,
  style,
  amount,
  variant,
  priceImpactRisk,
  orderType,
}: TokenAmountItemProps) => {
  const strings = useStrings()
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const {palette: p} = useTheme()
  const {privacyPlaceholder, isPrivacyActive} = usePrivacyMode()
  const priceImpactRiskTheme = usePriceImpactRiskTheme(
    priceImpactRisk ?? 'none',
  )

  const {info} = amount
  const isPrimary = isPrimaryToken(info)
  const detail = isPrimary ? info.description : info.fingerprint
  const name = infoExtractName(info)

  const formattedQuantity =
    !isPrivacyActive || ignorePrivacy === true
      ? amountFormatter({dropTraillingZeros: true})(amount)
      : privacyPlaceholder

  const priceImpactRiskTextColor =
    orderType === 'market' ? priceImpactRiskTheme.text : p.gray_900

  const handleShowTokenDetails = () => {
    openModal({
      title: strings.tokenDetailsTitle,
      content: <TokenDetails tokenInfo={info} />,
      height: isPrimary ? 450 : windowHeight * 0.8,
    })
  }

  return (
    <View
      style={[style, {flexDirection: 'row', alignItems: 'center'}]}
      testID="assetItem"
    >
      <Left>
        <TokenInfoIcon
          info={amount.info}
          size={variant === 'swap' ? 'md' : 'lg'}
        />
      </Left>

      <Middle>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[a.body_1_lg_medium, {color: p.gray_900}]}
          testID="tokenInfoText"
        >
          {name}
        </Text>

        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[{maxWidth: 140}, a.body_3_sm_regular, {color: p.gray_600}]}
          testID="tokenFingerprintText"
        >
          {detail}
        </Text>
      </Middle>

      <Right style={[a.align_end]}>
        {!isNft(info) && variant !== 'swap' && (
          <View
            testID="tokenAmountText"
            style={[
              {width: 150},
              a.flex_wrap,
              a.flex_row,
              a.gap_sm,
              a.justify_end,
            ]}
          >
            {priceImpactRisk === 'moderate' && (
              <Icon.Info size={24} color={priceImpactRiskTextColor} />
            )}

            {priceImpactRisk === 'high' && (
              <Icon.Warning size={24} color={priceImpactRiskTextColor} />
            )}

            <Text
              style={[a.body_1_lg_regular, {color: priceImpactRiskTextColor}]}
            >
              {formattedQuantity}
            </Text>
          </View>
        )}

        {variant !== 'swap' && (
          <PairedBalance
            textStyle={[{textAlign: 'right'}]}
            amount={amount}
            ignorePrivacy={ignorePrivacy}
          />
        )}

        {variant === 'swap' && (
          <View style={[a.flex, a.flex_row, a.align_center, a.gap_sm]}>
            {amount.quantity > 0n && (
              <View>
                <Text style={[a.body_1_lg_regular, {textAlign: 'right'}]}>
                  {formattedQuantity}
                </Text>

                <PairedBalance
                  textStyle={[{textAlign: 'right'}]}
                  amount={amount}
                  ignorePrivacy={ignorePrivacy}
                />
              </View>
            )}

            {features.swapTokenLinks && (
              <Button
                type={ButtonType.SecondaryText}
                fgColorsOverride={{
                  disabled: p.text_gray_low,
                  idle: p.text_gray_low,
                  pressed: p.text_gray_low,
                }}
                style={[a.pr_2xs, a.pl_2xs]}
                size="S"
                icon={Icon.InfoCircle}
                onPress={handleShowTokenDetails}
              />
            )}
          </View>
        )}
      </Right>
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={style} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View
    style={[style, {flex: 1, justifyContent: 'center', paddingHorizontal: 8}]}
    {...props}
  />
)
const Right = ({style, ...props}: ViewProps) => (
  <View style={style} {...props} />
)

export const AmountItemPlaceholder = ({style}: ViewProps) => {
  const {palette: p} = useTheme()
  return (
    <View
      style={[
        style,
        {display: 'flex', flexDirection: 'row', gap: 12, height: 56},
      ]}
    >
      <View
        style={[{borderRadius: 8, flexGrow: 3, backgroundColor: p.gray_200}]}
      />
      <View
        style={[{borderRadius: 8, flexGrow: 1, backgroundColor: p.gray_200}]}
      />
    </View>
  )
}
