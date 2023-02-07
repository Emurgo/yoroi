import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {Alert, FlatList, FlatListProps, StyleSheet, View} from 'react-native'

import {Boundary} from '../../components'
import {Spacer} from '../../components/Spacer'
import {useBalances, useTokenInfos} from '../../hooks'
import globalMessages, {actionMessages} from '../../i18n/global-messages'
import {useSelectedWallet} from '../../SelectedWallet'
import {sortTokenInfos} from '../../utils'
import {TokenInfo} from '../../yoroi-wallets/types'
import {Amounts} from '../../yoroi-wallets/utils'
import {ActionsBanner} from './ActionsBanner'
import {AssetItem} from './AssetItem'

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

const styles = StyleSheet.create({
  assetList: {flex: 1},
})

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
