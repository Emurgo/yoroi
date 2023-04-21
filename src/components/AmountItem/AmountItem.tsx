import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {COLORS} from '../../theme'
import {PairedBalance} from '../../TxHistory/PairedBalance'
import {useTokenInfo, YoroiWallet} from '../../yoroi-wallets'
import {YoroiAmount} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {Boundary, Placeholder, Text, TokenIcon} from '..'

export type AmountItemProps = {
  wallet: YoroiWallet
  amount: YoroiAmount
  style?: ViewProps['style']
}
export const AmountItem = ({wallet, style, amount}: AmountItemProps) => {
  const {quantity, tokenId} = amount
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const name = tokenInfo.kind === 'ft' ? tokenInfo.metadata.ticker ?? tokenInfo.name ?? '-' : tokenInfo.name ?? '-'
  const detail = isPrimary ? tokenInfo.description : tokenInfo.fingerprint
  const denominatedQuantity =
    tokenInfo.kind === 'nft' ? '1' : Quantities.denominated(quantity, tokenInfo.metadata.decimals)

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <Boundary loading={{fallback: <Placeholder />}} error={{fallback: () => <Placeholder />}}>
          <TokenIcon wallet={wallet} tokenId={tokenInfo.id} />
        </Boundary>
      </Left>

      <Middle>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
          {name}
        </Text>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
          {detail}
        </Text>
      </Middle>

      <Right>
        <Text style={styles.quantity} testID="tokenAmountText">
          {denominatedQuantity}
        </Text>

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
})
