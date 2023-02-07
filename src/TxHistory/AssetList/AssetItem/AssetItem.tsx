import * as React from 'react'
import {Image, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import NoImage from '../../../assets/img/asset_no_image.png'
import {Icon} from '../../../components'
import {Text} from '../../../components/Text'
import {useBalance} from '../../../hooks'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {TokenInfo} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'
import {PairedBalance} from '../../PairedBalance'

type AssetItemProps = {
  tokenInfo: TokenInfo
  onPress?(): void
}
export const AssetItem = ({tokenInfo, onPress}: AssetItemProps) => {
  const wallet = useSelectedWallet()
  const balance = useBalance({wallet, tokenId: tokenInfo.id})

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const name = tokenInfo.ticker ?? tokenInfo.name ?? '-'
  const detail = isPrimary ? tokenInfo.description : tokenInfo.fingerprint
  const quantity = Quantities.denominated(balance, tokenInfo.decimals)

  return (
    <TouchableOpacity onPress={onPress} style={styles.button} testID="assetItem">
      <Left>{isPrimary ? <PrimaryTokenIcon /> : <TokenIcon source={NoImage} />}</Left>

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
    </TouchableOpacity>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1, justifyContent: 'center', padding: 4}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />

type IconProps = {
  source: {uri: string}
}
const TokenIcon = ({source}: IconProps) => <Image source={source} style={styles.tokenIcon} />
const PrimaryTokenIcon = () => (
  <View style={styles.primaryTokenIcon}>
    <Icon.Cardano color="white" height={35} width={35} />
  </View>
)

const styles = StyleSheet.create({
  primaryTokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.SHELLEY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    elevation: 2,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 10,
    shadowOpacity: 0.08,
    shadowColor: '#181a1e',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  },
  quantity: {
    color: COLORS.DARK_TEXT,
    textAlign: 'right',
  },
})
