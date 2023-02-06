import * as React from 'react'
import {Image, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'

import NoImage from '../../../assets/img/asset_no_image.png'
import CardanoImage from '../../../assets/img/cardano-icon.png'
import {Text} from '../../../components/Text'
import {useBalance} from '../../../hooks'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {TokenInfo} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'
import {PairedBalance} from '../../PairedBalance'

type AssetItemProps = {
  tokenInfo: TokenInfo
  onPress?: () => void
}
export const AssetItem = ({tokenInfo, onPress}: AssetItemProps) => {
  const wallet = useSelectedWallet()
  const balance = useBalance({wallet, tokenId: tokenInfo.id})

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const icon = isPrimary ? CardanoImage : NoImage
  const name = tokenInfo.ticker ?? tokenInfo.name ?? '-'
  const detail = isPrimary ? wallet.primaryToken?.metadata?.type : tokenInfo.fingerprint
  const amount = Quantities.denominated(balance, tokenInfo.decimals)

  return (
    <TouchableOpacity onPress={onPress} style={styles.button} testID="assetItem">
      <Left>
        <Icon source={icon} />
      </Left>

      <Middle>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenInfo} testID="tokenInfoText">
          {name}
        </Text>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenName} testID="tokenFingerprintText">
          {detail}
        </Text>
      </Middle>

      <Right>
        <Text style={styles.tokenAmount} testID="tokenAmountText">
          {amount}
        </Text>

        {isPrimary && <PairedBalance primaryAmount={{quantity: balance, tokenId: tokenInfo.id}} privacyMode={false} />}
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
const Icon = ({source}: IconProps) => <Image source={source} style={styles.image} />

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 4,
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
  tokenInfo: {
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
  },
  tokenName: {
    color: COLORS.TEXT_INPUT,
    fontSize: 12,
    lineHeight: 18,
  },
  tokenAmount: {
    color: COLORS.DARK_TEXT,
    textAlign: 'right',
  },
})
