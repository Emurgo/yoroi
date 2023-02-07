import * as React from 'react'
import {Image, StyleSheet, View, ViewProps} from 'react-native'

import {Icon as Icons} from '../../../components'
import {Text} from '../../../components/Text'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {Quantity, TokenInfo} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'
import {PairedBalance} from '../../PairedBalance'

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
  const logo = tokenInfo.logo ?? ''

  return (
    <View style={[style, styles.container]} testID="assetItem">
      <Left>{isPrimary ? <PrimaryIcon /> : <Icon source={{uri: logo}} />}</Left>

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

const Placeholder = () => (
  <View style={[styles.icon, styles.placeholder]}>
    <Icons.Tokens color={COLORS.TEXT_INPUT} size={35} />
  </View>
)
const PrimaryIcon = () => (
  <View style={[styles.icon, styles.primary]}>
    <Icons.Cardano color="white" height={35} width={35} />
  </View>
)
type IconProps = {
  source: {uri: string}
}
const Icon = ({source}: IconProps) =>
  source.uri.length > 0 ? <Image source={source} style={styles.icon} /> : <Placeholder />

const styles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.SHELLEY_BLUE,
  },
  placeholder: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  icon: {
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
