import {amountFormatter, infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {usePriceImpactRiskTheme} from '../../features/Swap/common/helpers'
import {SwapPriceImpactRisk} from '../../features/Swap/common/types'
import {Icon, Spacer, Text} from '..'
import {PairedBalance} from '../PairedBalance/PairedBalance'
import {TokenInfoIcon} from './TokenInfoIcon'

export type TokenAmountItemProps = {
  amount: Portfolio.Token.Amount
  privacyPlaceholder: string
  isMainnet: boolean
  isPrivacyOff: boolean

  style?: ViewProps['style']
  inWallet?: boolean
  variant?: 'swap'
  priceImpactRisk?: SwapPriceImpactRisk
  orderType?: Swap.OrderType
}

export const TokenAmountItem = ({
  isMainnet,
  isPrivacyOff,
  privacyPlaceholder,
  style,
  amount,
  inWallet,
  variant,
  priceImpactRisk,
  orderType,
}: TokenAmountItemProps) => {
  const {styles, colors} = useStyles()
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk ?? 'none')

  const {info} = amount
  const isPrimary = info.nature === 'primary'
  const name = infoExtractName(info)
  const detail = isPrimary ? info.description : info.fingerprint

  const formattedQuantity = !isPrivacyOff ? amountFormatter()(amount) : privacyPlaceholder

  const showSwapDetails = !isPrimary && variant === 'swap'
  const priceImpactRiskTextColor = orderType === 'market' ? priceImpactRiskTheme.text : colors.text

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <TokenInfoIcon info={amount.info} size={variant === 'swap' ? 'sm' : 'md'} isMainnet={isMainnet} />
      </Left>

      <Middle>
        <View style={styles.row}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
            {name}
          </Text>

          {showSwapDetails && (
            <>
              <Spacer width={4} />

              {inWallet && <Icon.Portfolio size={22} color={colors.icon} />}
            </>
          )}
        </View>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
          {detail}
        </Text>
      </Middle>

      <Right>
        {info.type !== Portfolio.Token.Type.NFT && variant !== 'swap' && (
          <View style={styles.row} testID="tokenAmountText">
            {priceImpactRisk === 'moderate' && <Icon.Info size={24} color={priceImpactRiskTextColor} />}

            {priceImpactRisk === 'high' && <Icon.Warning size={24} color={priceImpactRiskTextColor} />}

            <Text style={[styles.quantity, {color: priceImpactRiskTextColor}]}>{formattedQuantity}</Text>
          </View>
        )}

        {isPrimary && variant !== 'swap' && (
          <PairedBalance isPrivacyOff={isPrivacyOff} amount={amount} privacyPlaceholder={privacyPlaceholder} />
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
  const {colors} = useStyles()
  return (
    <View
      style={[
        style,
        {
          display: 'flex',
          flexDirection: 'row',
          gap: 12,
          height: 56,
        },
      ]}
    >
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          flexGrow: 3,
        }}
      />

      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          flexGrow: 1,
        }}
      />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      color: color.gray[900],
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
    },
    detail: {
      color: color.gray[600],
      fontSize: 12,
      lineHeight: 18,
      maxWidth: 140,
    },
    quantity: {
      color: color.gray[900],
      ...typography['body-1-l-regular'],
      textAlign: 'right',
      flexGrow: 1,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  const colors = {
    text: color.gray[900],
    background: color.gray[200],
    icon: color.secondary[600],
  }

  return {styles, colors}
}
