import {Balance} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {COLORS} from '../../theme'
import {PairedBalance} from '../../TxHistory/PairedBalance'
import {isEmptyString} from '../../utils'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../yoroi-wallets/hooks'
import {Quantities} from '../../yoroi-wallets/utils'
import {Boundary, Icon, Placeholder, Spacer, Text, TokenIcon} from '..'

type AmountItemProps = {
  wallet: YoroiWallet
  amount: Balance.Amount
  style?: ViewProps['style']
  tokenIconSize?: 'small' | 'medium' | 'large'
  variant?: 'swap'
}

export const AmountItem = ({wallet, style, amount, tokenIconSize, variant}: AmountItemProps) => {
  const {quantity, tokenId} = amount
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const name = tokenInfo.ticker ?? tokenInfo.name
  const nameLabel = isEmptyString(name) ? '-' : name
  const detail = isPrimary ? tokenInfo.description : tokenInfo.fingerprint
  const denominatedQuantity = Quantities.denominated(quantity, tokenInfo.decimals ?? 0)
  const showSwapDetails = !isPrimary && variant === 'swap'

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <Boundary loading={{fallback: <Placeholder />}} error={{fallback: () => <Placeholder />}}>
          <TokenIcon wallet={wallet} tokenId={tokenInfo.id} size={tokenIconSize} />
        </Boundary>
      </Left>

      <Middle>
        <View style={styles.flex}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
            {nameLabel}
          </Text>

          {showSwapDetails && (
            <>
              <Spacer width={4} />

              <Icon.CheckFilled size={22} color={COLORS.SHELLEY_BLUE} />
            </>
          )}
        </View>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
          {detail}
        </Text>
      </Middle>

      <Right>
        {tokenInfo.kind !== 'nft' && (
          <Text style={styles.quantity} testID="tokenAmountText">
            {denominatedQuantity}
          </Text>
        )}

        {isPrimary && <PairedBalance amount={{quantity, tokenId: tokenInfo.id}} />}
      </Right>
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={style} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1, justifyContent: 'center', paddingHorizontal: 8}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={style} {...props} />

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: COLORS.DARK_TEXT,
    fontSize: 14,
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
  },
  flex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
