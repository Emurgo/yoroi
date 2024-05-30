import {amountFormatter, infoExtractName, isNft, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {Icon, Spacer, Text} from '../../../../components'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {usePrivacyMode} from '../../../Settings/PrivacyMode/PrivacyMode'
import {usePriceImpactRiskTheme} from '../../../Swap/common/helpers'
import {SwapPriceImpactRisk} from '../../../Swap/common/types'
import {TokenInfoIcon} from './TokenInfoIcon'

export type TokenAmountItemProps = {
  amount: Portfolio.Token.Amount
  ignorePrivacy?: boolean

  style?: ViewProps['style']
  inWallet?: boolean
  variant?: 'swap'
  priceImpactRisk?: SwapPriceImpactRisk
  orderType?: Swap.OrderType
}

export const TokenAmountItem = ({
  ignorePrivacy = false,
  style,
  amount,
  inWallet,
  variant,
  priceImpactRisk,
  orderType,
}: TokenAmountItemProps) => {
  const {styles, colors} = useStyles()
  const {privacyPlaceholder, isPrivacyActive} = usePrivacyMode()
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk ?? 'none')

  const {info} = amount
  const isPrimary = isPrimaryToken(info)
  const detail = isPrimary ? info.description : info.fingerprint
  const name = infoExtractName(info)

  const formattedQuantity = !isPrivacyActive || ignorePrivacy === true ? amountFormatter()(amount) : privacyPlaceholder

  const showSwapDetails = !isPrimary && variant === 'swap'
  const priceImpactRiskTextColor = orderType === 'market' ? priceImpactRiskTheme.text : colors.text

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <TokenInfoIcon info={amount.info} size={variant === 'swap' ? 'sm' : 'md'} />
      </Left>

      <Middle>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
          {name}
        </Text>

        {showSwapDetails && (
          <>
            <Spacer width={4} />

            {inWallet && <Icon.Portfolio size={22} color={colors.icon} />}
          </>
        )}

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
          {detail}
        </Text>
      </Middle>

      <Right>
        {!isNft(info) && variant !== 'swap' && (
          <View testID="tokenAmountText">
            {priceImpactRisk === 'moderate' && <Icon.Info size={24} color={priceImpactRiskTextColor} />}

            {priceImpactRisk === 'high' && <Icon.Warning size={24} color={priceImpactRiskTextColor} />}

            <Text style={[styles.quantity, {color: priceImpactRiskTextColor}]}>{formattedQuantity}</Text>
          </View>
        )}

        {isPrimary && variant !== 'swap' && <PairedBalance amount={amount} ignorePrivacy={ignorePrivacy} />}
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
      color: color.gray_c900,
      ...atoms.body_1_lg_medium,
    },
    detail: {
      color: color.gray_c600,
      maxWidth: 140,
      ...atoms.body_3_sm_regular,
    },
    quantity: {
      color: color.gray_c900,
      ...atoms.body_1_lg_regular,
    },
    skeletonLogo: {
      display: 'flex',
      flexDirection: 'row',
      gap: 12,
      height: 56,
    },
    skeletonTitle: {
      backgroundColor: color.gray_c200,
      borderRadius: 8,
      flexGrow: 3,
    },
    skeletonBorder: {
      backgroundColor: color.gray_c200,
      borderRadius: 8,
      flexGrow: 1,
    },
  })

  const colors = {
    text: color.gray_c900,
    icon: color.secondary_c600,
  }

  return {styles, colors}
}
