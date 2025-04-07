import {amountFormatter, infoExtractName, isNft, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, useWindowDimensions, View, ViewProps} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {Text} from '../../../../components/Text'
import {features} from '../../../../kernel/features'
import {useStrings} from '../../../ReviewTx/common/hooks/useStrings'
import {TokenDetails} from '../../../ReviewTx/common/TokenDetails'
import {usePrivacyMode} from '../../../Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {usePriceImpactRiskTheme} from '../../../Swap/common/helpers'
import {SwapPriceImpactRisk} from '../../../Swap/common/types'
import {TokenInfoIcon} from './TokenInfoIcon'

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
  const {styles, colors} = useStyles()
  const {privacyPlaceholder, isPrivacyActive} = usePrivacyMode()
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk ?? 'none')

  const {info} = amount
  const isPrimary = isPrimaryToken(info)
  const detail = isPrimary ? info.description : info.fingerprint
  const name = infoExtractName(info)

  const formattedQuantity =
    !isPrivacyActive || ignorePrivacy === true
      ? amountFormatter({dropTraillingZeros: true})(amount)
      : privacyPlaceholder

  const priceImpactRiskTextColor = orderType === 'market' ? priceImpactRiskTheme.text : colors.text

  const handleShowTokenDetails = () => {
    openModal({
      title: strings.tokenDetailsTitle,
      content: <TokenDetails tokenInfo={info} />,
      height: isPrimary ? 450 : windowHeight * 0.8,
    })
  }

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <TokenInfoIcon info={amount.info} size={variant === 'swap' ? 'md' : 'lg'} />
      </Left>

      <Middle>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
          {name}
        </Text>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
          {detail}
        </Text>
      </Middle>

      <Right style={styles.end}>
        {!isNft(info) && variant !== 'swap' && (
          <View testID="tokenAmountText" style={styles.quantityWrapper}>
            {priceImpactRisk === 'moderate' && <Icon.Info size={24} color={priceImpactRiskTextColor} />}

            {priceImpactRisk === 'high' && <Icon.Warning size={24} color={priceImpactRiskTextColor} />}

            <Text style={[styles.quantity, {color: priceImpactRiskTextColor}]}>{formattedQuantity}</Text>
          </View>
        )}

        {variant !== 'swap' && (
          <PairedBalance textStyle={styles.pairedBalance} amount={amount} ignorePrivacy={ignorePrivacy} />
        )}

        {variant === 'swap' && (
          <View style={styles.row}>
            {amount.quantity > 0n && (
              <View>
                <Text style={[styles.quantity, {textAlign: 'right'}]}>{formattedQuantity}</Text>

                <PairedBalance textStyle={styles.pairedBalance} amount={amount} ignorePrivacy={ignorePrivacy} />
              </View>
            )}

            {features.swapTokenLinks && (
              <Button
                type={ButtonType.SecondaryText}
                fgColorsOverride={{disabled: colors.info, idle: colors.info, pressed: colors.info}}
                style={styles.info}
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
  <View style={[style, {flex: 1, justifyContent: 'center', paddingHorizontal: 8}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={style} {...props} />

export const AmountItemPlaceholder = ({style}: ViewProps) => {
  const {styles} = useStyles()
  return (
    <View style={[style, styles.skeletonLogo]}>
      <View style={styles.skeletonTitle} />

      <View style={styles.skeletonBorder} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
    detail: {
      color: color.gray_600,
      maxWidth: 140,
      ...atoms.body_3_sm_regular,
    },
    quantity: {
      color: color.gray_900,
      ...atoms.body_1_lg_regular,
    },
    quantityWrapper: {
      width: 150,
      ...atoms.flex_wrap,
      ...atoms.flex_row,
      ...atoms.gap_sm,
      ...atoms.justify_end,
    },
    skeletonLogo: {
      display: 'flex',
      flexDirection: 'row',
      gap: 12,
      height: 56,
    },
    skeletonTitle: {
      backgroundColor: color.gray_200,
      borderRadius: 8,
      flexGrow: 3,
    },
    skeletonBorder: {
      backgroundColor: color.gray_200,
      borderRadius: 8,
      flexGrow: 1,
    },
    pairedBalance: {
      textAlign: 'right',
    },
    end: {
      ...atoms.align_end,
    },
    row: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    info: {
      ...atoms.pr_2xs,
      ...atoms.pl_2xs,
    },
  })

  const colors = {
    text: color.gray_900,
    icon: color.secondary_600,
    info: color.text_gray_low,
  }

  return {styles, colors}
}
