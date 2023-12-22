import {Balance} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {usePriceImpactStatusTheme} from '../../features/Swap/common/helpers'
import {SwapPriceImpactStatus} from '../../features/Swap/common/types'
import {COLORS} from '../../theme'
import {isEmptyString} from '../../utils'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../yoroi-wallets/hooks'
import {Quantities} from '../../yoroi-wallets/utils'
import {Boundary, Icon, Spacer, Text, TokenIcon, TokenIconPlaceholder} from '..'
import {PairedBalance} from '../PairedBalance/PairedBalance'

export type AmountItemProps = {
  wallet: YoroiWallet
  amount: Balance.Amount
  style?: ViewProps['style']
  isPrivacyOff?: boolean
  status?: string
  inWallet?: boolean
  variant?: 'swap'
  priceImpactRisk?: SwapPriceImpactStatus
}

export const AmountItem = ({
  isPrivacyOff,
  wallet,
  style,
  amount,
  inWallet,
  variant,
  priceImpactRisk,
}: AmountItemProps) => {
  const {quantity, tokenId} = amount
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const name = tokenInfo.ticker ?? tokenInfo.name
  const nameLabel = isEmptyString(name) ? '-' : name
  const detail = isPrimary ? tokenInfo.description : tokenInfo.fingerprint

  const formattedQuantity = Quantities.format(quantity, tokenInfo.decimals ?? 0)
  const showSwapDetails = !isPrimary && variant === 'swap'
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)

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

              {inWallet && <Icon.Portfolio size={22} color={COLORS.LIGHT_GREEN} />}
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
            {priceImpactRisk === 'negative' && <Icon.Warning size={24} color={priceImpactColor.text} />}

            {priceImpactRisk === 'warning' && <Icon.Info size={24} color={priceImpactColor.text} />}

            <Text style={[styles.quantity, {color: priceImpactColor.text}]}>
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

export const AmountItemPlaceholder = ({style}: ViewProps) => (
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
        backgroundColor: COLORS.BACKGROUND_GRAY,
        borderRadius: 8,
        flexGrow: 3,
      }}
    />

    <View
      style={{
        backgroundColor: COLORS.BACKGROUND_GRAY,
        borderRadius: 8,
        flexGrow: 1,
      }}
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: COLORS.DARK_TEXT,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
  },
  detail: {
    color: COLORS.TEXT_INPUT,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 140,
  },
  quantity: {
    color: COLORS.DARK_TEXT,
    textAlign: 'right',
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
})
