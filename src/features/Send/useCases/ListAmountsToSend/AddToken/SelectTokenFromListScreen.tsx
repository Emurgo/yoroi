import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {maxTokensPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useNfts, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo, YoroiNft} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {filterTokenInfos} from '../../../common/filterTokenInfos'
import {useSelectedTokensCounter, useSend, useTokenQuantities} from '../../../common/SendContext'
import {useStrings} from '../../../common/strings'
import {EmptySearchResult} from './Show/EmptySearchResult'
import {MaxTokensPerTx} from './Show/MaxTokensPerTx'

export const SelectTokenFromListScreen = () => {
  const wallet = useSelectedWallet()
  const [activeTab, setActiveTab] = React.useState<Tabs>('all')
  const strings = useStrings()

  // use case: search listed tokens
  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.selecteAssetTitle,
  })

  const balances = useBalances(wallet)
  const {nfts} = useNfts(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })
  const selectedTokensCounter = useSelectedTokensCounter()
  const canAddToken = selectedTokensCounter < maxTokensPerTx

  const {search} = useSearch()
  const searchFilteredTokens = filterTokenInfos(search, tokenInfos)
  const tabFilteredTokens = filterTokenInfosByTab({nfts, activeTab, tokenInfos: searchFilteredTokens})
  const sortedFilteredTokenInfos = sortTokenInfos({wallet, tokenInfos: tabFilteredTokens})
  const isSearchResultEmpty = search.length > 0 && sortedFilteredTokenInfos.length === 0

  return (
    <View style={styles.root}>
      {!canAddToken && (
        <View style={styles.panel}>
          <MaxTokensPerTx />

          <Spacer height={16} />
        </View>
      )}

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <FlashList
        data={sortedFilteredTokenInfos}
        renderItem={({item: tokenInfo}: {item: TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem tokenInfo={tokenInfo} disabled={!canAddToken} wallet={wallet} />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={styles.list}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={isSearchResultEmpty ? <EmptySearchResult /> : undefined}
      />

      <View style={styles.counter}>
        <Text style={styles.assets}>{strings.assetsCounter(sortedFilteredTokenInfos.length)}</Text>

        <Text style={styles.found}>{` ${strings.found}`}</Text>
      </View>
    </View>
  )
}

const Tabs = ({setActiveTab, activeTab}: {setActiveTab: (activeTab: Tabs) => void; activeTab: Tabs}) => {
  const strings = useStrings()

  return (
    <View style={styles.tabs}>
      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.all} tab="all" />

      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.tokensLabel} tab="tokens" />

      <Tab activeTab={activeTab} setActiveTab={setActiveTab} text={strings.nftsLabel} tab="nfts" />
    </View>
  )
}

const Tab = ({
  setActiveTab,
  activeTab,
  tab,
  text,
}: {
  setActiveTab: (activeTab: Tabs) => void
  activeTab: Tabs
  tab: Tabs
  text: string
}) => {
  return (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={[styles.tabContainer, activeTab === tab && styles.tabContainerActive]}
    >
      <Text
        style={[
          styles.tab,
          {
            color: activeTab === tab ? '#3154CB' : '#6B7384',
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)

    // if the balance is atomic there is no need to edit the amount
    if (Quantities.isAtomic(spendable, tokenInfo.decimals)) {
      amountChanged(spendable)
      navigation.navigate('send-list-amounts-to-send')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }

  return (
    <TouchableOpacity style={styles.item} onPress={onSelect} testID="selectTokenButton" disabled={disabled}>
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

const filterTokenInfosByTab = ({
  nfts,
  activeTab,
  tokenInfos,
}: {
  nfts: YoroiNft[]
  activeTab: Tabs
  tokenInfos: TokenInfo[]
}) => {
  if (activeTab === 'nfts') {
    return tokenInfos.filter((tokenInfo) => nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint))
  } else if (activeTab === 'tokens') {
    return tokenInfos.filter((tokenInfo) => !nfts.some((nft) => nft.fingerprint === tokenInfo.fingerprint))
  }

  return tokenInfos
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
  },
  tabContainer: {
    flex: 1,
  },
  tabContainerActive: {
    borderBottomColor: '#3154CB',
    borderBottomWidth: 2,
  },
  tab: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 12,
  },
  counter: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  assets: {
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
    color: '#3154CB',
  },
  found: {
    fontWeight: '400',
    color: '#3154CB',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 9,
  },
  item: {
    paddingVertical: 9,
  },
  panel: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
})

export type Tabs = 'all' | 'tokens' | 'nfts'
