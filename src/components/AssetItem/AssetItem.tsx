import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {PairedBalance} from '../../TxHistory/PairedBalance'
import {Quantity, TokenInfo} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {Text, TokenIcon} from '..'

export type AssetItemProps = {
  tokenInfo: TokenInfo
  balance: Quantity
  style?: ViewProps['style']
}
export const AssetItem = ({balance, style, tokenInfo}: AssetItemProps) => {
  const wallet = useSelectedWallet()

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const name = tokenInfo.ticker ?? tokenInfo.name ?? '-'
  const detail = isPrimary ? tokenInfo.description : tokenInfo.fingerprint
  const quantity = Quantities.denominated(balance, tokenInfo.decimals)

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>
        <TokenIcon wallet={wallet} tokenId={tokenInfo.id} />
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
          {quantity}
        </Text>

        {isPrimary && <PairedBalance primaryAmount={{quantity: balance, tokenId: tokenInfo.id}} />}
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
