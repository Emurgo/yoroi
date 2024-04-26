import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Swap} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {usePriceImpactRiskTheme} from '../../features/Swap/common/helpers'
import {SwapPriceImpactRisk} from '../../features/Swap/common/types'
import {isEmptyString} from '../../utils'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {Boundary, Icon, Spacer, Text, TokenIcon, TokenIconPlaceholder} from '..'
import {PairedBalance} from '../PairedBalance/PairedBalance'
import { infoExtractName } from '@yoroi/portfolio'

export type AmountItemProps = {
  wallet: YoroiWallet
  amount: Portfolio.Token.Amount
  style?: ViewProps['style']
  isPrivacyOff?: boolean
  inWallet?: boolean
  variant?: 'swap'
  priceImpactRisk?: SwapPriceImpactRisk
  orderType?: Swap.OrderType
}

export const AmountItem = ({
  isPrivacyOff,
  wallet,
  style,
  amount,
  inWallet,
  variant,
  priceImpactRisk,
  orderType,
}: AmountItemProps) => {
  const {styles, colors} = useStyles()

  const {info, quantity} = amount
  const isPrimary = info.nature === 'primary'
  const name = infoExtractName(info)
  const nameLabel = isEmptyString(name) ? '-' : name
  const detail = isPrimary ? info.: tokenInfo.fingerprint

  const formattedQuantity = Quantities.format(quantity, tokenInfo.decimals ?? 0)
  const showSwapDetails = !isPrimary && variant === 'swap'
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk ?? 'none')
  const priceImpactRiskTextColor = orderType === 'market' ? priceImpactRiskTheme.text : colors.text

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <Boundary loading={{fallback: <TokenIconPlaceholder />}} error={{fallback: () => <TokenIconPlaceholder />}}>
          <TokenIcon wallet={wallet} tokenId={tokenInfo.id} variant={variant} />
        </Boundary>
      </Left>

      <Middle>
        <View style={styles.row}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
            {nameLabel}
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
        {tokenInfo.kind !== 'nft' && variant !== 'swap' && (
          <View style={styles.row} testID="tokenAmountText">
            {priceImpactRisk === 'moderate' && <Icon.Info size={24} color={priceImpactRiskTextColor} />}

            {priceImpactRisk === 'high' && <Icon.Warning size={24} color={priceImpactRiskTextColor} />}

            <Text style={[styles.quantity, {color: priceImpactRiskTextColor}]}>
              {isPrivacyOff ? '**.*******' : formattedQuantity}
            </Text>
          </View>
        )}

        {isPrimary && variant !== 'swap' && (
          <PairedBalance isPrivacyOff={isPrivacyOff} amount={{quantity, tokenId: tokenInfo.id}} />
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      color: color.gray_c900,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '500',
      fontFamily: 'Rubik-Medium',
    },
    detail: {
      color: color.gray_c600,
      fontSize: 12,
      lineHeight: 18,
      maxWidth: 140,
    },
    quantity: {
      color: color.gray_c900,
      ...atoms.body_1_lg_regular,
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
    text: color.gray_c900,
    background: color.gray_c200,
    icon: color.secondary_c600,
  }

  return {styles, colors}
}
