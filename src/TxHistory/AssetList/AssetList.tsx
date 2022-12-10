import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {Alert, FlatList, FlatListProps, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {Avatar} from 'react-native-paper'

import AdaImage from '../../assets/img/asset_ada.png'
import NoImage from '../../assets/img/asset_no_image.png'
import {Boundary, Text} from '../../components'
import {Spacer} from '../../components/Spacer'
import {useBalances, useTokenInfo} from '../../hooks'
import globalMessages, {actionMessages} from '../../i18n/global-messages'
import {formatTokenAmount, getAssetDenominationOrId, getTokenFingerprint} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {YoroiAmount} from '../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../yoroi-wallets/utils'
import {useOnScroll} from '../useOnScroll'
import {ActionsBanner} from './ActionsBanner'

type ListProps = FlatListProps<YoroiAmount>
type Props = Partial<ListProps> & {
  onScrollUp: ListProps['onScroll']
  onScrollDown: ListProps['onScroll']
  refreshing: boolean
  onRefresh: () => void
}
export const AssetList = ({onScrollUp, onScrollDown, ...props}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const orderedTokens = Amounts.toArray(balances)
    .sort((a, b) => (Quantities.isGreaterThan(a.quantity, b.quantity) ? -1 : 1))
    .sort((amount) => (amount.tokenId === '' ? -1 : 1))

  const handleOnPressNFTs = () => Alert.alert(strings.soon, strings.soon)
  const handleOnPressTokens = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  const onScroll = useOnScroll({onScrollUp, onScrollDown})

  return (
    <View style={styles.assetList} testID="assetList">
      <ActionsBanner
        tokensLabel={strings.tokens(orderedTokens.length)}
        nftsLabel={strings.nfts(0)}
        onPressNFTs={handleOnPressNFTs}
        onPressTokens={handleOnPressTokens}
        onSearch={handleSearch}
      />

      <FlatList
        {...props}
        {...onScroll}
        data={orderedTokens}
        renderItem={({item: amount}) => (
          <Boundary loading={{fallbackProps: {size: 'small'}}}>
            <AssetItem amount={amount} />
          </Boundary>
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8}}
        keyExtractor={(item) => item.tokenId}
      />
    </View>
  )
}

type AssetItemProps = {
  amount: YoroiAmount
  onPress?: () => void
}

const AssetItem = ({amount, onPress}: AssetItemProps) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: amount.tokenId})

  return (
    <TouchableOpacity onPress={onPress} style={styles.button} testID="assetItem">
      <Left>
        <Icon source={tokenInfo.isDefault ? AdaImage : NoImage} />
      </Left>

      <Middle>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenInfo} testID="tokenInfoText">
          {getAssetDenominationOrId(tokenInfo)}
        </Text>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenName} testID="tokenFingerprintText">
          {tokenInfo.isDefault ? '' : getTokenFingerprint(tokenInfo)}
        </Text>
      </Middle>

      <Right>
        <Text style={styles.tokenAmount} testID="tokenAmountText">
          {formatTokenAmount(new BigNumber(amount.quantity), tokenInfo)}
        </Text>
      </Right>
    </TouchableOpacity>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1, justifyContent: 'center', padding: 4}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={[style, {padding: 4}]} {...props} />

const styles = StyleSheet.create({
  assetList: {flex: 1},
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
  },
  tokenName: {
    color: COLORS.TEXT_INPUT,
    fontSize: 12,
    lineHeight: 18,
  },
  tokenAmount: {
    color: COLORS.DARK_TEXT,
  },
})

const Icon = (props) => (
  <Avatar.Image
    {...props}
    size={32}
    style={{alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}
  />
)

const messages = defineMessages({
  unknownAsset: {
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    unknown: intl.formatMessage(messages.unknownAsset),
    tokens: (qty: number) => `${intl.formatMessage(globalMessages.tokens, {qty})} (${qty})`,
    nfts: (qty: number) => `${intl.formatMessage(globalMessages.nfts, {qty})} (${qty})`,
    soon: intl.formatMessage(actionMessages.soon),
  }
}
