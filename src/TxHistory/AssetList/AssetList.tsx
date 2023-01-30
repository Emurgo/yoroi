import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {Alert, FlatList, FlatListProps, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {Avatar} from 'react-native-paper'

import AdaImage from '../../assets/img/asset_ada.png'
import NoImage from '../../assets/img/asset_no_image.png'
import {Boundary, Text} from '../../components'
import {Spacer} from '../../components/Spacer'
import {useBalance, useBalances, useTokenInfos} from '../../hooks'
import globalMessages, {actionMessages} from '../../i18n/global-messages'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {sortTokenInfos} from '../../utils'
import {TokenInfo} from '../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../yoroi-wallets/utils'
import {ActionsBanner} from './ActionsBanner'

type ListProps = FlatListProps<TokenInfo>
type Props = Partial<ListProps> & {
  onScroll: ListProps['onScroll']
  refreshing: boolean
  onRefresh: () => void
}
export const AssetList = (props: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const handleOnPressNFTs = () => Alert.alert(strings.soon, strings.soon)
  const handleOnPressTokens = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })

  return (
    <View style={styles.assetList} testID="assetList">
      <ActionsBanner
        tokensLabel={strings.tokens(tokenInfos.length)}
        nftsLabel={strings.nfts(0)}
        onPressNFTs={handleOnPressNFTs}
        onPressTokens={handleOnPressTokens}
        onSearch={handleSearch}
      />

      <FlatList
        {...props}
        data={sortTokenInfos({wallet, tokenInfos})}
        renderItem={({item: tokenInfo}) => (
          <Boundary loading={{size: 'small'}} error={{size: 'inline'}}>
            <AssetItem tokenInfo={tokenInfo} />
          </Boundary>
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8}}
        keyExtractor={(tokenInfo) => tokenInfo.id}
      />
    </View>
  )
}

type AssetItemProps = {
  tokenInfo: TokenInfo
  onPress?: () => void
}

const AssetItem = ({tokenInfo, onPress}: AssetItemProps) => {
  const wallet = useSelectedWallet()
  const balance = useBalance({wallet, tokenId: tokenInfo.id})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  return (
    <TouchableOpacity onPress={onPress} style={styles.button} testID="assetItem">
      <Left>
        <Icon source={isPrimary ? AdaImage : NoImage} />
      </Left>

      <Middle>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenInfo} testID="tokenInfoText">
          {tokenInfo.ticker ?? tokenInfo.name ?? '-'}
        </Text>

        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.tokenName} testID="tokenFingerprintText">
          {isPrimary ? '' : tokenInfo.fingerprint}
        </Text>
      </Middle>

      <Right>
        <Text style={styles.tokenAmount} testID="tokenAmountText">
          {Quantities.denominated(balance, tokenInfo.decimals)}
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
